import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import oracledb from "oracledb";
import { getConnectionFromPool } from "../database/pool";

const router = Router();
const SALT_ROUNDS = 10;

/**
 * POST /api/usuarios
 * body: { nome, email, telefone_celular, senha }
 */
router.post(
  "/usuarios",
  [
    body("nome").isString().isLength({ min: 2 }).trim(),
    body("email").isEmail().normalizeEmail(),
    body("telefone_celular").isString().isLength({ min: 8 }).trim(),
    body("senha").isString().isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const { nome, email, telefone_celular, senha } = req.body;
    let conn;
    try {
      conn = await getConnectionFromPool();

      // verifica se email já existe
      const checkSql = `SELECT COUNT(1) AS CNT FROM Conta_Usuario WHERE email = :email`;
      const checkRes = await conn.execute(checkSql, { email }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      const exists = Number((checkRes.rows?.[0] as any)?.CNT ?? 0) > 0;
      if (exists) {
        return res.status(409).json({ ok: false, error: "email já cadastrado" });
      }

      // hash da senha
      const hashed = await bcrypt.hash(senha, SALT_ROUNDS);

      // inserir e retornar id
      const insertSql = `INSERT INTO Conta_Usuario (nome, email, senha, telefone_celular)
                         VALUES (:nome, :email, :senha, :telefone)
                         RETURNING id_usuario INTO :id`;
      const binds = {
        nome,
        email,
        senha: hashed,
        telefone: telefone_celular,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      };
      const opt = { autoCommit: true };
      const result = await conn.execute(insertSql, binds, opt);
      const newId = (result.outBinds as any).id[0];

      return res.status(201).json({ ok: true, id: newId });
    } catch (err) {
      console.error("Erro /api/usuarios:", err);
      return res.status(500).json({ ok: false, error: String(err) });
    } finally {
      if (conn) try { await conn.close(); } catch (_) {}
    }
  }
);

/**
 * POST /api/login
 * body: { email, senha }
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("senha").isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const { email, senha } = req.body;
    let conn;
    try {
      conn = await getConnectionFromPool();

      const sql = `SELECT id_usuario, senha FROM Conta_Usuario WHERE email = :email`;
      const result = await conn.execute(sql, { email }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      if (!result.rows || result.rows.length === 0) {
        return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
      }

      const row = result.rows[0] as any;
      const storedHash = row.SENHA ?? row.senha ?? row.Senha;
      const okPass = await bcrypt.compare(senha, storedHash);
      if (!okPass) return res.status(401).json({ ok: false, error: "Credenciais inválidas" });

      // login bem-sucedido; aqui só retornamos id e mensagem.
      // Em produção você adicionaria JWT ou sessão.
      return res.json({ ok: true, id_usuario: row.ID_USUARIO ?? row.id_usuario });
    } catch (err) {
      console.error("Erro /api/login:", err);
      return res.status(500).json({ ok: false, error: String(err) });
    } finally {
      if (conn) try { await conn.close(); } catch (_) {}
    }
  }
);

export default router;
