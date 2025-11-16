//por: Marialvo
// Rotas: GET /api/instituicao  => lista instituições do professor logado
//        POST /api/instituicao => cria instituição (owner_user_id = user) e o curso opcional

import { Router, Response } from "express";
import oracledb from 'oracledb';
import { getConnectionFromPool } from "../database/pool";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /
 * Lista instituições pertencentes ao usuário autenticado (owner_user_id)
 * Retorna: { ok: true, rows: [ { id_instituicao, nome, owner_user_id } ] }
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
  const result = await conn.execute(sql, { p_uid: userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rows = result.rows || [];
    return res.json({ ok: true, rows });
  } catch (err) {
    console.error("Erro GET /api/instituicao:", err);
    return res.status(500).json({ ok: false, message: "Erro ao listar instituições" });
  } finally {
    if (conn) try { await conn.close(); } catch(_) {}
  }
});

/**
 * POST /
 * Cria instituição (owner_user_id = token user). Opcionalmente cria curso vinculado.
 * Body: { nome: string, curso?: string }
 * Retorna: { ok:true, id_instituicao, curso_id? }
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  const { nome, curso } = req.body;
  if (!nome || typeof nome !== "string") return res.status(400).json({ ok: false, message: "nome obrigatório" });

  let conn;
  try {
    conn = await getConnectionFromPool();

    const insertInst = `
      INSERT INTO Instituicao (nome, owner_user_id)
      VALUES (:nome, :owner)
      RETURNING id_instituicao INTO :id
    `;
    const bindsInst: any = { nome, owner: userId, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };

    const resultInst = await conn.execute(insertInst, bindsInst, { autoCommit: false });
    const idInstituicao = (resultInst.outBinds as any)?.id?.[0];

    if (!idInstituicao) throw new Error("Não foi possível recuperar id_instituicao após INSERT");

    let cursoId: number | undefined;
    if (curso && typeof curso === "string" && curso.trim().length > 0) {
      const insertCurso = `
        INSERT INTO Curso (nome, id_instituicao)
        VALUES (:nomeCurso, :idInst)
        RETURNING curso_id INTO :cId
      `;
      const bindsCurso: any = { nomeCurso: curso.trim(), idInst: idInstituicao, cId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } };
      const resultCurso = await conn.execute(insertCurso, bindsCurso);
      cursoId = (resultCurso.outBinds as any)?.cId?.[0];
      if (!cursoId) throw new Error("Não foi possível recuperar curso_id após INSERT");
    }

    await conn.commit();
    return res.status(201).json({ ok: true, id_instituicao: Number(idInstituicao), curso_id: cursoId ? Number(cursoId) : undefined });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch (_) {}
    console.error("Erro /api/instituicao:", err);
    return res.status(500).json({ ok: false, message: "Erro ao criar instituição" });
  } finally {
    if (conn) try { await conn.close(); } catch(_) {}
  }
});

export default router;
