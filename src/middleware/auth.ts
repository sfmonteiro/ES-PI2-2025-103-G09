// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id_usuario: number };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
  if (!authHeader) return res.status(401).json({ ok: false, message: "Token ausente" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ ok: false, message: "Formato do token inválido" });

  const token = parts[1];
  try {
    const secret = process.env.JWT_SECRET as Secret;
    const payload = jwt.verify(token, secret) as any;
    req.user = { id_usuario: payload.id_usuario };
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Token inválido" });
  }
}
