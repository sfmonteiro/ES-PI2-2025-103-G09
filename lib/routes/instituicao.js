"use strict";
//por: Marialvo
// Rotas: GET /api/instituicao  => lista instituições do professor logado
//        POST /api/instituicao => cria instituição (owner_user_id = user) e o curso opcional
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oracledb_1 = __importDefault(require("oracledb"));
const pool_1 = require("../database/pool");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /
 * Lista instituições pertencentes ao usuário autenticado (owner_user_id)
 * Retorna: { ok: true, rows: [ { id_instituicao, nome, owner_user_id } ] }
 */
router.get("/", auth_1.requireAuth, async (req, res) => {
    const userId = req.user?.id_usuario;
    if (!userId)
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        const sql = `
    SELECT id_instituicao, nome, owner_user_id
    FROM Instituicao
    WHERE owner_user_id = :p_uid
    ORDER BY nome
  `;
        const result = await conn.execute(sql, { p_uid: userId }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        const rows = result.rows || [];
        return res.json({ ok: true, rows });
    }
    catch (err) {
        console.error("Erro GET /api/instituicao:", err);
        return res.status(500).json({ ok: false, message: "Erro ao listar instituições" });
    }
    finally {
        if (conn)
            try {
                await conn.close();
            }
            catch (_) { }
    }
});
/**
 * POST /
 * Cria instituição (owner_user_id = token user). Opcionalmente cria curso vinculado.
 * Body: { nome: string, curso?: string }
 * Retorna: { ok:true, id_instituicao, curso_id? }
 */
router.post("/", auth_1.requireAuth, async (req, res) => {
    const userId = req.user?.id_usuario;
    if (!userId)
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    const { nome, curso } = req.body;
    if (!nome || typeof nome !== "string")
        return res.status(400).json({ ok: false, message: "nome obrigatório" });
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        const insertInst = `
      INSERT INTO Instituicao (nome, owner_user_id)
      VALUES (:nome, :owner)
      RETURNING id_instituicao INTO :id
    `;
        const bindsInst = { nome, owner: userId, id: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER } };
        const resultInst = await conn.execute(insertInst, bindsInst, { autoCommit: false });
        const idInstituicao = resultInst.outBinds?.id?.[0];
        if (!idInstituicao)
            throw new Error("Não foi possível recuperar id_instituicao após INSERT");
        let cursoId;
        if (curso && typeof curso === "string" && curso.trim().length > 0) {
            const insertCurso = `
        INSERT INTO Curso (nome, id_instituicao)
        VALUES (:nomeCurso, :idInst)
        RETURNING curso_id INTO :cId
      `;
            const bindsCurso = { nomeCurso: curso.trim(), idInst: idInstituicao, cId: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER } };
            const resultCurso = await conn.execute(insertCurso, bindsCurso);
            cursoId = resultCurso.outBinds?.cId?.[0];
            if (!cursoId)
                throw new Error("Não foi possível recuperar curso_id após INSERT");
        }
        await conn.commit();
        return res.status(201).json({ ok: true, id_instituicao: Number(idInstituicao), curso_id: cursoId ? Number(cursoId) : undefined });
    }
    catch (err) {
        try {
            if (conn)
                await conn.rollback();
        }
        catch (_) { }
        console.error("Erro /api/instituicao:", err);
        return res.status(500).json({ ok: false, message: "Erro ao criar instituição" });
    }
    finally {
        if (conn)
            try {
                await conn.close();
            }
            catch (_) { }
    }
});
exports.default = router;
//# sourceMappingURL=instituicao.js.map