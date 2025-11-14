"use strict";
// src/routes/auth.ts
// Responsável original: Guilherme...
// Adições e melhorias: ChatGPT (comentadas)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const oracledb_1 = __importDefault(require("oracledb"));
const pool_1 = require("../database/pool");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const SALT_ROUNDS = 10;
/**
 * POST /api/usuarios
 * Cadastro de usuário (professor)
 * body: { nome, email, telefone_celular, senha }
 * Retorna: { ok: true, id }
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
        if (exists)
            return res.status(409).json({ ok: false, error: "email já cadastrado" });
        // hash da senha
        const hashed = await bcryptjs_1.default.hash(senha, SALT_ROUNDS);
        // inserir e retornar id (assume id_usuario identity)
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
 * Retorno: { ok: true, token, usuario: { id_usuario, nome, email }, firstAccess: boolean }
 *
 * Observações:
 * - Faz compare com bcrypt.
 * - Se a senha no DB estiver em texto (caso legado), e bater, atualiza para hash (auto-upgrade).
 */
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.body)("senha").isString().notEmpty(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ ok: false, errors: errors.array() });
    const { email, senha } = req.body;
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        // buscar usuário com OUT_FORMAT_OBJECT para facilidade
        const sql = `SELECT id_usuario, nome, email, senha, primeiro_acesso FROM Conta_Usuario WHERE email = :email`;
        const result = await conn.execute(sql, { email }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ ok: false, message: "Credenciais inválidas." });
        }
        const row = result.rows[0];
        const userId = row.ID_USUARIO ?? row.id_usuario;
        const stored = row.SENHA ?? row.senha ?? row.Senha;
        // tenta comparar com bcrypt
        let okPass = false;
        try {
            okPass = await bcryptjs_1.default.compare(senha, stored);
        }
        catch (e) {
            okPass = false;
        }
        // fallback: se a comparação bcrypt falhou e o valor do DB bate exatamente com a senha em texto,
        // consideramos válido — e então fazemos o upgrade para hash (recomendado).
        if (!okPass && stored === senha) {
            okPass = true;
            // atualiza para hash (upgrade)
            try {
                const newHash = await bcryptjs_1.default.hash(senha, SALT_ROUNDS);
                await conn.execute(`UPDATE Conta_Usuario SET senha = :h WHERE id_usuario = :id`, { h: newHash, id: userId }, { autoCommit: true });
                console.log(`Senha em texto atualizada para hash para id_usuario=${userId}`);
            }
            catch (e) {
                console.warn("Falha ao atualizar senha para hash (upgrade):", e);
            }
        }
        if (!okPass) {
            return res.status(401).json({ ok: false, message: "Credenciais inválidas." });
        }
        // gerar token JWT (corrigido)
        const payload = { id_usuario: userId };
        const secret = process.env.JWT_SECRET;
        // evita problema de tipagem do SignOptions usando 'as any' nas opções
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" });
        // montar objeto usuário para retorno
        const usuario = {
            id_usuario: userId,
            nome: row.NOME ?? row.nome,
            email: row.EMAIL ?? row.email,
        };
        // interpretar flag de primeiro acesso (aceita S/s/1 como true)
        const primeiroAcessoValor = row.PRIMEIRO_ACESSO ?? row.primeiro_acesso ?? 'S';
        const firstAccess = (primeiroAcessoValor === 'S' || primeiroAcessoValor === 's' || primeiroAcessoValor === '1');
        // retorno final
        return res.json({
            ok: true,
            token,
            usuario,
            firstAccess,
        });
    }
    catch (err) {
        console.error("Erro /api/login:", err);
        return res.status(500).json({ ok: false, message: "Erro interno no servidor." });
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
 * POST /api/primeiro_acesso/complete
 * Rota protegida: marca 'primeiro_acesso' = 'N' para o usuário autenticado
 * body: none
 */
router.post("/primeiro_acesso/complete", auth_1.requireAuth, async (req, res) => {
    const userId = req.user?.id_usuario;
    if (!userId)
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    let conn;
    try {
        conn = await (0, pool_1.getConnectionFromPool)();
        await conn.execute(`UPDATE Conta_Usuario SET primeiro_acesso = 'N' WHERE id_usuario = :id`, { id: userId }, { autoCommit: true });
        return res.json({ ok: true });
    }
    catch (e) {
        console.error("Erro /primeiro_acesso/complete:", e);
        return res.status(500).json({ ok: false, message: "Erro interno" });
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