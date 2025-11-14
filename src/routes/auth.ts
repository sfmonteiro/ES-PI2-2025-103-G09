// src/routes/auth.ts
// Responsável original: Guilherme...
// Adições e melhorias: ChatGPT (comentadas)

import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import oracledb from "oracledb";
import { getConnectionFromPool } from "../database/pool";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const SALT_ROUNDS = 10;

/**
 * POST /api/usuarios
 * Cadastro de usuário (professor)
 * body: { nome, email, telefone_celular, senha }
 * Retorna: { ok: true, id }
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
      if (exists) return res.status(409).json({ ok: false, error: "email já cadastrado" });

      // hash da senha
      const hashed = await bcrypt.hash(senha, SALT_ROUNDS);

      // inserir e retornar id (assume id_usuario identity)
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
 * Retorno: { ok: true, token, usuario: { id_usuario, nome, email }, firstAccess: boolean }
 *
 * Observações:
 * - Faz compare com bcrypt.
 * - Se a senha no DB estiver em texto (caso legado), e bater, atualiza para hash (auto-upgrade).
 */
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("senha").isString().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

    const { email, senha } = req.body;
    let conn;
    try {
      conn = await getConnectionFromPool();

      // buscar usuário com OUT_FORMAT_OBJECT para facilidade
      const sql = `SELECT id_usuario, nome, email, senha, primeiro_acesso FROM Conta_Usuario WHERE email = :email`;
      const result = await conn.execute(sql, { email }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      if (!result.rows || result.rows.length === 0) {
        return res.status(401).json({ ok: false, message: "Credenciais inválidas." });
      }

      const row = result.rows[0] as any;
      const userId = row.ID_USUARIO ?? row.id_usuario;
      const stored = row.SENHA ?? row.senha ?? row.Senha;

      // tenta comparar com bcrypt
      let okPass = false;
      try {
        okPass = await bcrypt.compare(senha, stored);
      } catch (e) {
        okPass = false;
      }

      // fallback: se a comparação bcrypt falhou e o valor do DB bate exatamente com a senha em texto,
      // consideramos válido — e então fazemos o upgrade para hash (recomendado).
      if (!okPass && stored === senha) {
        okPass = true;
        // atualiza para hash (upgrade)
        try {
          const newHash = await bcrypt.hash(senha, SALT_ROUNDS);
          await conn.execute(
            `UPDATE Conta_Usuario SET senha = :h WHERE id_usuario = :id`,
            { h: newHash, id: userId },
            { autoCommit: true }
          );
          console.log(`Senha em texto atualizada para hash para id_usuario=${userId}`);
        } catch (e) {
          console.warn("Falha ao atualizar senha para hash (upgrade):", e);
        }
      }

      if (!okPass) {
        return res.status(401).json({ ok: false, message: "Credenciais inválidas." });
      }

// gerar token JWT (corrigido)
const payload = { id_usuario: userId };
const secret = process.env.JWT_SECRET as Secret;
// evita problema de tipagem do SignOptions usando 'as any' nas opções
const token = jwt.sign(payload as object, secret, { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" } as any);

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



    } catch (err) {
      console.error("Erro /api/login:", err);
      return res.status(500).json({ ok: false, message: "Erro interno no servidor." });
    } finally {
      if (conn) try { await conn.close(); } catch (_) {}
    }
  }
);

/**
 * POST /api/primeiro_acesso/complete
 * Rota protegida: marca 'primeiro_acesso' = 'N' para o usuário autenticado
 * body: none
 */
router.post("/primeiro_acesso/complete", requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  let conn;
  try {
    conn = await getConnectionFromPool();
    await conn.execute(
      `UPDATE Conta_Usuario SET primeiro_acesso = 'N' WHERE id_usuario = :id`,
      { id: userId },
      { autoCommit: true }
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error("Erro /primeiro_acesso/complete:", e);
    return res.status(500).json({ ok: false, message: "Erro interno" });
  } finally {
    if (conn) try { await conn.close(); } catch(_) {}
  }
});

export default router;
