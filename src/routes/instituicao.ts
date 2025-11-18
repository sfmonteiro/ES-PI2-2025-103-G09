// por: Marialvo
// Rotas: GET /api/instituicao  => lista instituições do professor logado
//        POST /api/instituicao => cria instituição e opcionalmente curso

import { Router, Response } from "express";
import oracledb from 'oracledb';
import { getConnectionFromPool } from "../database/pool"; // CORRETO
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /
 * Lista instituições do usuário autenticado
 */
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  let conn;
  try {
    conn = await getConnectionFromPool();

    const sql = `
      SELECT id_instituicao, nome, owner_user_id
      FROM Instituicao
      WHERE owner_user_id = :p_uid
      ORDER BY nome
    `;

    const result = await conn.execute(
      sql,
      { p_uid: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({ ok: true, rows: result.rows || [] });

  } catch (err) {
    console.error("Erro GET /api/instituicao:", err);
    return res.status(500).json({ ok: false, message: "Erro ao listar instituições" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});

/**
 * POST /
 * Cria instituição e opcionalmente cria um curso vinculado
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  const { nome, curso } = req.body;
  if (!nome || typeof nome !== "string") {
    return res.status(400).json({ ok: false, message: "nome obrigatório" });
  }

  let conn;
  try {
    conn = await getConnectionFromPool();

    // INSERT INSTITUIÇÃO
    const insertInst = `
      INSERT INTO Instituicao (nome, owner_user_id)
      VALUES (:nome, :owner)
      RETURNING id_instituicao INTO :id
    `;

    const bindsInst: any = {
      nome,
      owner: userId,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    const resultInst = await conn.execute(insertInst, bindsInst, { autoCommit: false }) as any;

    const idInstituicao = resultInst.outBinds.id[0];
    if (!idInstituicao) throw new Error("Falha ao retornar id_instituicao");

    let cursoId: number | undefined;

    // INSERT opcional do curso
    if (curso && typeof curso === "string" && curso.trim() !== "") {
      const insertCurso = `
        INSERT INTO Curso (nome, id_instituicao)
        VALUES (:nomeCurso, :idInst)
        RETURNING curso_id INTO :cId
      `;

      const bindsCurso: any = {
        nomeCurso: curso.trim(),
        idInst: idInstituicao,
        cId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const resultCurso = await conn.execute(insertCurso, bindsCurso, { autoCommit: false }) as any;
      cursoId = resultCurso.outBinds.cId[0];
    }

    await conn.commit();

    return res.status(201).json({
      ok: true,
      id_instituicao: Number(idInstituicao),
      curso_id: cursoId ? Number(cursoId) : undefined
    });

  } catch (err) {
    if (conn) try { await conn.rollback(); } catch (_) {}
    console.error("Erro POST /api/instituicao:", err);
    return res.status(500).json({ ok: false, message: "Erro ao criar instituição" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});

/**
 * PUT /api/instituicao/:id
 * Atualiza nome da instituição
 */
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id_usuario;
  const instId = Number(req.params.id);
  const { nome } = req.body;

  if (!userId)
    return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  if (!nome || typeof nome !== "string")
    return res.status(400).json({ ok: false, message: "Nome é obrigatório" });

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Atualiza somente instituições do usuário
    const sql = `
      UPDATE Instituicao
      SET nome = :nome
      WHERE id_instituicao = :id
        AND owner_user_id = :owner
    `;

    const r = await conn.execute(
      sql,
      { nome, id: instId, owner: userId },
      { autoCommit: true }
    );

    if (r.rowsAffected === 0) {
      return res.status(404).json({
        ok: false,
        message: "Instituição não encontrada ou não pertence ao usuário"
      });
    }

    return res.json({ ok: true, message: "Instituição atualizada com sucesso" });

  } catch (err) {
    console.error("Erro PUT /api/instituicao/:id:", err);
    return res.status(500).json({ ok: false, message: "Erro ao atualizar instituição" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});


/**
 * DELETE /api/instituicao/:id
 * Remove instituição apenas se pertencer ao usuário
 */
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id_usuario;
  const instId = Number(req.params.id);

  if (!userId)
    return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Exclui apenas instituições do usuário
    const sql = `
      DELETE FROM Instituicao
      WHERE id_instituicao = :id
        AND owner_user_id = :owner
    `;

    const r = await conn.execute(sql, { id: instId, owner: userId }, { autoCommit: true });

    if (r.rowsAffected === 0) {
      return res.status(404).json({
        ok: false,
        message: "Instituição não encontrada ou não pertence ao usuário"
      });
    }

    return res.json({ ok: true, message: "Instituição excluída com sucesso" });

  } catch (err) {
    console.error("Erro DELETE /api/instituicao/:id:", err);
    return res.status(500).json({ ok: false, message: "Erro ao excluir instituição" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});


export default router;
