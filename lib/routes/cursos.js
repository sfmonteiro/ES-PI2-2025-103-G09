// lib/routes/cursos.js
// -------------------------------------------------------------
// ALTERAÇÃO POR: Marialvo
// Objetivo: CRUD /api/cursos integrado ao Oracle, com isolamento por usuário.
// Notas:
// - Assegura que apenas cursos de instituições pertencentes ao usuário sejam listados/alterados.
// - Se o body incluir `disciplinas` (array), a rota cria/atualiza as linhas em DISCIPLINAS.
// - Preserve comentários/autor original se houver.
// -------------------------------------------------------------

"use strict";

const { Router } = require("express");
const oracledb = require("oracledb");
const { getConnectionFromPool } = require("../database/pool");
const { requireAuth } = require("../middleware/auth");

const router = Router();

/**
 * GET /api/cursos
 * Lista cursos pertencentes às instituições do usuário autenticado.
 * Retorno: { ok:true, data: [ { curso_id, nome, id_instituicao } ] }
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  let conn;
  try {
    conn = await getConnectionFromPool();
    const sql = `
      SELECT c.CURSO_ID, c.NOME, c.ID_INSTITUICAO
      FROM CURSO c
      JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
      WHERE i.OWNER_USER_ID = :user
      ORDER BY c.NOME
    `;
    const result = await conn.execute(sql, { user: userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const rows = result.rows || [];
    // Para cada curso, opcionalmente buscar disciplinas (poucos; ok). Se preferir, remova este passo.
    for (let r of rows) {
      const dsql = `SELECT ID_DISCIPLINA, NOME, SIGLA, CODIGO, PERIODO_CURSO FROM DISCIPLINAS WHERE CURSO_ID = :cid ORDER BY NOME`;
      try {
        const dr = await conn.execute(dsql, { cid: r.CURSO_ID }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        r.disciplinas = dr.rows || [];
      } catch (e) {
        r.disciplinas = []; // se tabela não existir ou erro, ignora
      }
    }
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Erro GET /api/cursos:", err);
    return res.status(500).json({ ok: false, message: "Erro ao listar cursos" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});

/**
 * POST /api/cursos
 * Body: { nome: string, id_instituicao: number, disciplinas?: [ { codigo,nome,sigla,periodo } ] }
 * - Verifica se a instituição pertence ao usuário.
 * - Insere CURSO e disciplinas (se houver) dentro da mesma transação.
 */
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  const { nome, id_instituicao, disciplinas } = req.body;
  if (!nome || !id_instituicao) return res.status(400).json({ ok: false, message: "nome e id_instituicao obrigatórios" });

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Verifica propriedade da instituição
    const chk = await conn.execute(
      `SELECT 1 FROM INSTITUICAO WHERE ID_INSTITUICAO = :iid AND OWNER_USER_ID = :user`,
      { iid: id_instituicao, user: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!chk.rows || chk.rows.length === 0) {
      return res.status(403).json({ ok: false, message: "Instituição não pertence ao usuário" });
    }

    // Insere curso e obtém id via RETURNING (assume trigger ou coluna com returning possível)
    const insertCurso = `
      INSERT INTO CURSO (NOME, ID_INSTITUICAO)
      VALUES (:nome, :iid)
      RETURNING CURSO_ID INTO :out_id
    `;
    const binds = { nome, iid: id_instituicao, out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };
    const r = await conn.execute(insertCurso, binds, { autoCommit: false });
    const newId = r.outBinds && r.outBinds.out_id && r.outBinds.out_id[0];

    // Se houver disciplinas, insere cada uma apontando para newId
    if (newId && Array.isArray(disciplinas) && disciplinas.length > 0) {
      const dsql = `INSERT INTO DISCIPLINAS (NOME, SIGLA, CODIGO, PERIODO_CURSO, CURSO_ID) VALUES (:nome, :sigla, :codigo, :periodo, :cid)`;
      for (let d of disciplinas) {
        const dbinds = { nome: d.nome || null, sigla: d.sigla || null, codigo: d.codigo || null, periodo: d.periodo || null, cid: newId };
        await conn.execute(dsql, dbinds);
      }
    }

    await conn.commit();
    return res.status(201).json({ ok: true, id: newId });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch (_) {}
    console.error("Erro POST /api/cursos:", err);
    return res.status(500).json({ ok: false, message: "Erro ao criar curso" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});

/**
 * PUT /api/cursos/:id
 * Body: { nome, disciplinas? }
 * - Atualiza nome do curso se o curso pertence a uma instituição do usuário.
 * - Substitui (deleta+insere) disciplinas se array for enviado.
 */
router.put("/:id", requireAuth, async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  const id = req.params.id;
  const { nome, disciplinas } = req.body;
  if (!nome) return res.status(400).json({ ok: false, message: "nome obrigatório" });

  let conn;
  try {
    conn = await getConnectionFromPool();

    // Atualiza somente se pertence ao usuário (através da instituição)
    const updateSql = `
      UPDATE CURSO c
      SET c.NOME = :nome
      WHERE c.CURSO_ID = :id
        AND c.ID_INSTITUICAO IN (
          SELECT ID_INSTITUICAO FROM INSTITUICAO WHERE OWNER_USER_ID = :user
        )
    `;
    const ur = await conn.execute(updateSql, { nome, id, user: userId }, { autoCommit: false });
    if (!ur.rowsAffected || ur.rowsAffected === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, message: "Curso não encontrado ou não pertence ao usuário" });
    }

    // Se disciplinas foram enviadas, substitui (delete existing + insert)
    if (Array.isArray(disciplinas)) {
      await conn.execute(`DELETE FROM DISCIPLINAS WHERE CURSO_ID = :cid`, { cid: id });
      const dsql = `INSERT INTO DISCIPLINAS (NOME, SIGLA, CODIGO, PERIODO_CURSO, CURSO_ID) VALUES (:nome, :sigla, :codigo, :periodo, :cid)`;
      for (let d of disciplinas) {
        const dbinds = { nome: d.nome || null, sigla: d.sigla || null, codigo: d.codigo || null, periodo: d.periodo || null, cid: id };
        await conn.execute(dsql, dbinds);
      }
    }

    await conn.commit();
    return res.json({ ok: true, message: "Atualizado" });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch (_) {}
    console.error("Erro PUT /api/cursos/:id:", err);
    return res.status(500).json({ ok: false, message: "Erro ao atualizar curso" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});

/**
 * DELETE /api/cursos/:id
 * - Remove curso e suas disciplinas se pertencer ao usuário.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  const id = req.params.id;
  let conn;
  try {
    conn = await getConnectionFromPool();

    // Verifica pertencimento e deleta disciplinas + curso em transação
    // Aqui usamos DELETE com subselect para garantir ownership
    const checkSql = `
      SELECT c.CURSO_ID
      FROM CURSO c
      JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
      WHERE c.CURSO_ID = :id AND i.OWNER_USER_ID = :user
    `;
    const chk = await conn.execute(checkSql, { id, user: userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!chk.rows || chk.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Curso não encontrado ou não pertence ao usuário" });
    }

    await conn.execute(`DELETE FROM DISCIPLINAS WHERE CURSO_ID = :cid`, { cid: id });
    const del = await conn.execute(`DELETE FROM CURSO WHERE CURSO_ID = :id`, { id });
    await conn.commit();
    return res.json({ ok: true, message: "Removido" });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch (_) {}
    console.error("Erro DELETE /api/cursos/:id:", err);
    return res.status(500).json({ ok: false, message: "Erro ao remover curso" });
  } finally {
    if (conn) try { await conn.close(); } catch (_) {}
  }
});

module.exports = router;
