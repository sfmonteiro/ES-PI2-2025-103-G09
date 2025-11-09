"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const oracledb_1 = __importDefault(require("oracledb"));
const pool_1 = require("../database/pool");
const router = (0, express_1.Router)();
const SALT_ROUNDS = 10;
/**
 * POST /api/usuarios
 * body: { nome, email, telefone_celular, senha }
 */
router.post("/usuarios", [
    (0, express_validator_1.body)("nome").isString().isLength({ min: 2 }).trim(),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("telefone_celular").isString().isLength({ min: 8 }).trim(),
    (0, express_validator_1.body)("senha").isString().isLength({ min: 6 }),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ ok: false, errors: errors.array() });
    const { nome, email, telefone_celular, senha } = req.body;
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        // verifica se email já existe
        const checkSql = `SELECT COUNT(1) AS CNT FROM Conta_Usuario WHERE email = :email`;
        const checkRes = await conn.execute(checkSql, { email }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        const exists = Number(checkRes.rows?.[0]?.CNT ?? 0) > 0;
        if (exists) {
            return res.status(409).json({ ok: false, error: "email já cadastrado" });
        }
        // hash da senha
        const hashed = await bcryptjs_1.default.hash(senha, SALT_ROUNDS);
        // inserir e retornar id
        const insertSql = `INSERT INTO Conta_Usuario (nome, email, senha, telefone_celular)
                         VALUES (:nome, :email, :senha, :telefone)
                         RETURNING id_usuario INTO :id`;
        const binds = {
            nome,
            email,
            senha: hashed,
            telefone: telefone_celular,
            id: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER },
        };
        const opt = { autoCommit: true };
        const result = await conn.execute(insertSql, binds, opt);
        const newId = result.outBinds.id[0];
        return res.status(201).json({ ok: true, id: newId });
    }
    catch (err) {
        console.error("Erro /api/usuarios:", err);
        return res.status(500).json({ ok: false, error: String(err) });
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
 * POST /api/login
 * body: { email, senha }
 */
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("senha").isString(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ ok: false, errors: errors.array() });
    const { email, senha } = req.body;
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        const sql = `SELECT id_usuario, senha FROM Conta_Usuario WHERE email = :email`;
        const result = await conn.execute(sql, { email }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
        }
        const row = result.rows[0];
        const storedHash = row.SENHA ?? row.senha ?? row.Senha;
        const okPass = await bcryptjs_1.default.compare(senha, storedHash);
        if (!okPass)
            return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
        // login bem-sucedido; aqui só retornamos id e mensagem.
        // Em produção você adicionaria JWT ou sessão.
        return res.json({ ok: true, id_usuario: row.ID_USUARIO ?? row.id_usuario });
    }
    catch (err) {
        console.error("Erro /api/login:", err);
        return res.status(500).json({ ok: false, error: String(err) });
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
//# sourceMappingURL=auth.js.map