"use strict";
// por: Marialvo
// Rotas: GET /api/instituicao  => lista instituições do professor logado
//        POST /api/instituicao => cria instituição e opcionalmente curso
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oracledb_1 = __importDefault(require("oracledb"));
const pool_1 = require("../database/pool"); // CORRETO
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /
 * Lista instituições do usuário autenticado
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
        return res.json({ ok: true, rows: result.rows || [] });
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
 * Cria instituição e opcionalmente cria um curso vinculado
 */
router.post("/", auth_1.requireAuth, async (req, res) => {
    const userId = req.user?.id_usuario;
    if (!userId)
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    const { nome, curso } = req.body;
    if (!nome || typeof nome !== "string") {
        return res.status(400).json({ ok: false, message: "nome obrigatório" });
    }
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        // INSERT INSTITUIÇÃO
        const insertInst = `
      INSERT INTO Instituicao (nome, owner_user_id)
      VALUES (:nome, :owner)
      RETURNING id_instituicao INTO :id
    `;
        const bindsInst = {
            nome,
            owner: userId,
            id: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER }
        };
        const resultInst = await conn.execute(insertInst, bindsInst, { autoCommit: false });
        const idInstituicao = resultInst.outBinds.id[0];
        if (!idInstituicao)
            throw new Error("Falha ao retornar id_instituicao");
        let cursoId;
        // INSERT opcional do curso
        if (curso && typeof curso === "string" && curso.trim() !== "") {
            const insertCurso = `
        INSERT INTO Curso (nome, id_instituicao)
        VALUES (:nomeCurso, :idInst)
        RETURNING curso_id INTO :cId
      `;
            const bindsCurso = {
                nomeCurso: curso.trim(),
                idInst: idInstituicao,
                cId: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER }
            };
            const resultCurso = await conn.execute(insertCurso, bindsCurso, { autoCommit: false });
            cursoId = resultCurso.outBinds.cId[0];
        }
        await conn.commit();
        return res.status(201).json({
            ok: true,
            id_instituicao: Number(idInstituicao),
            curso_id: cursoId ? Number(cursoId) : undefined
        });
    }
    catch (err) {
        if (conn)
            try {
                await conn.rollback();
            }
            catch (_) { }
        console.error("Erro POST /api/instituicao:", err);
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
/**
 * PUT /api/instituicao/:id
 * Atualiza nome da instituição
 */
router.put("/:id", auth_1.requireAuth, async (req, res) => {
    const userId = req.user?.id_usuario;
    const instId = Number(req.params.id);
    const { nome } = req.body;
    if (!userId)
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    if (!nome || typeof nome !== "string")
        return res.status(400).json({ ok: false, message: "Nome é obrigatório" });
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        // Atualiza somente instituições do usuário
        const sql = `
      UPDATE Instituicao
      SET nome = :nome
      WHERE id_instituicao = :id
        AND owner_user_id = :owner
    `;
        const r = await conn.execute(sql, { nome, id: instId, owner: userId }, { autoCommit: true });
        if (r.rowsAffected === 0) {
            return res.status(404).json({
                ok: false,
                message: "Instituição não encontrada ou não pertence ao usuário"
            });
        }
        return res.json({ ok: true, message: "Instituição atualizada com sucesso" });
    }
    catch (err) {
        console.error("Erro PUT /api/instituicao/:id:", err);
        return res.status(500).json({ ok: false, message: "Erro ao atualizar instituição" });
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
 * DELETE /api/instituicao/:id
 * Remove instituição apenas se pertencer ao usuário
 */
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    const userId = req.user?.id_usuario;
    const instId = Number(req.params.id);
    if (!userId)
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
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
    }
    catch (err) {
        console.error("Erro DELETE /api/instituicao/:id:", err);
        return res.status(500).json({ ok: false, message: "Erro ao excluir instituição" });
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