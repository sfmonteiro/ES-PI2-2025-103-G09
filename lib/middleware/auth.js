"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const authHeader = (req.headers["authorization"] || req.headers["Authorization"]);
    if (!authHeader)
        return res.status(401).json({ ok: false, message: "Token ausente" });
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return res.status(401).json({ ok: false, message: "Formato do token inválido" });
    const token = parts[1];
    try {
        const secret = process.env.JWT_SECRET;
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id_usuario: payload.id_usuario };
        return next();
    }
    catch (e) {
        return res.status(401).json({ ok: false, message: "Token inválido" });
    }
}
//# sourceMappingURL=auth.js.map