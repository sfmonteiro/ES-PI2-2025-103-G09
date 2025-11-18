// criado POR: Marialvo
// CRUD /api/cursos com Oracle, validação forte por usuário e PUT inteligente.

import { Router } from "express";
import oracledb from "oracledb";
import { getConnectionFromPool } from "../database/pool";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * Helper para validar usuário autenticado
 */
function ensureUserId(req: AuthRequest, res: any): number | null {
  const id = req.user?.id_usuario;
  if (!id) {
    res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    return null;
  }
  return id;
}

/**
 * GET /api/cursos
 * Lista cursos e suas disciplinas em apenas 1 SELECT
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = ensureUserId(req, res);
  if (!userId) return;

  let conn;
  try {
    conn = await getConnectionFromPool();

    const sql = `
      SELECT
        c.CURSO_ID, c.NOME AS CURSO_NOME, c.ID_INSTITUICAO,
        d.ID_DISCIPLINA, d.NOME AS DISC_NOME, d.SIGLA, d.CODIGO, d.PERIODO_CURSO
      FROM CURSO c
      JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
      LEFT JOIN DISCIPLINAS d ON d.CURSO_ID = c.CURSO_ID
      WHERE i.OWNER_USER_ID = :owner
      ORDER BY c.NOME, d.NOME
    `;

    const result = await conn.execute(sql, { owner: userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    // Agrupar por curso
    const map = new Map<number, any>();

    for (const row of result.rows as any[]) {
      if (!map.has(row.CURSO_ID)) {
        map.set(row.CURSO_ID, {
          CURSO_ID: row.CURSO_ID,
          NOME: row.CURSO_NOME,
          ID_INSTITUICAO: row.ID_INSTITUICAO,
          disciplinas: []
        });
      }

      if (row.ID_DISCIPLINA) {
        map.get(row.CURSO_ID).disciplinas.push({
          ID_DISCIPLINA: row.ID_DISCIPLINA,
          NOME: row.DISC_NOME,
          SIGLA: row.SIGLA,
          CODIGO: row.CODIGO,
          PERIODO_CURSO: row.PERIODO_CURSO
        });
      }
    }

    return res.json({ ok: true, data: [...map.values()] });

  } catch (err) {
    console.error("Erro GET /api/cursos:", err);
    return res.status(500).json({ ok: false, message: "Erro ao listar cursos" });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});


/**
 * POST /api/cursos
 * Cria curso + disciplinas
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = ensureUserId(req, res);
  if (!userId) return;

  const { nome, id_instituicao, disciplinas } = req.body;

  if (!nome || !id_instituicao) {
    return res.status(400).json({ ok: false, message: "nome e id_instituicao obrigatórios" });
  }

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Verificar se instituição pertence ao usuário
    const chk = await conn.execute(
      `SELECT 1 FROM INSTITUICAO WHERE ID_INSTITUICAO = :id AND OWNER_USER_ID = :uid`,
      { id: id_instituicao, uid: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!chk.rows || chk.rows.length === 0) {
      return res.status(403).json({ ok: false, message: "Instituição não pertence ao usuário" });
    }

    // Inserir curso
    const insertCurso = `
      INSERT INTO CURSO (NOME, ID_INSTITUICAO)
      VALUES (:nome, :inst)
      RETURNING CURSO_ID INTO :id
    `;

    const r = await conn.execute(
      insertCurso,
      {
        nome,
        inst: id_instituicao,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const newId = (r.outBinds as any).id[0];

    // Inserir disciplinas (se houver)
    if (Array.isArray(disciplinas)) {
      const sqlD = `
        INSERT INTO DISCIPLINAS (NOME, SIGLA, CODIGO, PERIODO_CURSO, CURSO_ID)
        VALUES (:n, :s, :c, :p, :cid)
      `;
      for (const d of disciplinas) {
        await conn.execute(sqlD, {
          n: d.NOME || null,
          s: d.SIGLA || null,
          c: d.CODIGO || null,
          p: d.PERIODO_CURSO || null,
          cid: newId
        });
      }
    }

    await conn.commit();
    return res.status(201).json({ ok: true, id: newId });

  } catch (err) {
    try { if (conn) await conn.rollback(); } catch {}
    console.error("Erro POST /api/cursos:", err);
    return res.status(500).json({ ok: false, message: "Erro ao criar curso" });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});


/**
 * PUT /api/cursos/:id
 * Atualiza curso + disciplinas (UPDATE real, sem deletar tudo)
 */
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const userId = ensureUserId(req, res);
  if (!userId) return;

  const cursoId = Number(req.params.id);
  const { nome, disciplinas } = req.body;

  if (!nome) {
    return res.status(400).json({ ok: false, message: "nome obrigatório" });
  }

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Verificar se curso pertence ao usuário
    const chk = await conn.execute(
      `
      SELECT 1
      FROM CURSO c
      JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
      WHERE c.CURSO_ID = :curso AND i.OWNER_USER_ID = :uid
      `,
      { curso: cursoId, uid: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!chk.rows || chk.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Curso não pertence ao usuário" });
    }

    // Atualizar nome do curso
    await conn.execute(
      `UPDATE CURSO SET NOME = :nome WHERE CURSO_ID = :id`,
      { nome, id: cursoId },
      { autoCommit: false }
    );

    // Atualizar disciplinas
    if (Array.isArray(disciplinas)) {

      // Buscar disciplinas atuais
      const old = await conn.execute(
        `SELECT ID_DISCIPLINA FROM DISCIPLINAS WHERE CURSO_ID = :id`,
        { id: cursoId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const oldIds = new Set(old.rows?.map((r: any) => r.ID_DISCIPLINA));

      for (const d of disciplinas) {
        if (d.ID_DISCIPLINA && oldIds.has(d.ID_DISCIPLINA)) {
          // UPDATE
          await conn.execute(
            `
            UPDATE DISCIPLINAS
            SET NOME = :n, SIGLA = :s, CODIGO = :c, PERIODO_CURSO = :p
            WHERE ID_DISCIPLINA = :id
            `,
            {
              n: d.NOME || null,
              s: d.SIGLA || null,
              c: d.CODIGO || null,
              p: d.PERIODO_CURSO || null,
              id: d.ID_DISCIPLINA
            }
          );

          oldIds.delete(d.ID_DISCIPLINA);

        } else {
          // INSERT
          await conn.execute(
            `
            INSERT INTO DISCIPLINAS (NOME, SIGLA, CODIGO, PERIODO_CURSO, CURSO_ID)
            VALUES (:n, :s, :c, :p, :cid)
            `,
            {
              n: d.NOME || null,
              s: d.SIGLA || null,
              c: d.CODIGO || null,
              p: d.PERIODO_CURSO || null,
              cid: cursoId
            }
          );
        }
      }

      // Deletar disciplinas removidas
      for (const id of oldIds) {
        await conn.execute(
          `DELETE FROM DISCIPLINAS WHERE ID_DISCIPLINA = :id`,
          { id }
        );
      }
    }

    await conn.commit();
    return res.json({ ok: true, message: "Atualizado" });

  } catch (err) {
    try { if (conn) await conn.rollback(); } catch {}
    console.error("Erro PUT /api/cursos/:id:", err);
    return res.status(500).json({ ok: false, message: "Erro ao atualizar curso" });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});


/**
 * DELETE /api/cursos/:id
 * Remove curso **somente se todas as disciplinas já foram removidas**
 */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const userId = ensureUserId(req, res);
  if (!userId) return;

  const cursoId = Number(req.params.id);

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Verifica se curso pertence ao usuário
    const chk = await conn.execute(
      `
      SELECT 1
      FROM CURSO c
      JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
      WHERE c.CURSO_ID = :id AND i.OWNER_USER_ID = :uid
      `,
      { id: cursoId, uid: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!chk.rows || chk.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Curso não pertence ao usuário" });
    }

    // Verificar disciplinas restantes
    const chkDisc = await conn.execute(
      `SELECT 1 FROM DISCIPLINAS WHERE CURSO_ID = :id AND ROWNUM = 1`,
      { id: cursoId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (chkDisc.rows && chkDisc.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "Existem disciplinas vinculadas; exclua-as antes de remover o curso"
      });
    }

    // Excluir curso
    await conn.execute(
      `DELETE FROM CURSO WHERE CURSO_ID = :id`,
      { id: cursoId },
      { autoCommit: false }
    );

    await conn.commit();
    return res.json({ ok: true, message: "Removido" });

  } catch (err) {
    try { if (conn) await conn.rollback(); } catch {}
    console.error("Erro DELETE /api/cursos/:id:", err);
    return res.status(500).json({ ok: false, message: "Erro ao remover curso" });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});


export default router;