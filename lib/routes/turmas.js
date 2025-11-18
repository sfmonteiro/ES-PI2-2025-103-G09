"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// criado POR: Marialvo
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const turma_1 = __importDefault(require("../models/turma"));
const router = (0, express_1.Router)();
// garante que userId nunca chega como undefined
const ensureUserId = (value) => {
    if (!value)
        throw new Error("ID de usuário inválido");
    return value;
};
// GET /api/turmas - lista todas as turmas do usuário
router.get("/", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = ensureUserId(req.user?.id_usuario);
        const turmas = await turma_1.default.getAll(userId);
        return res.json({ ok: true, data: turmas });
    }
    catch (err) {
        console.error("Erro GET /api/turmas:", err);
        return res.status(401).json({ ok: false, message: "Usuário não autenticado" });
    }
});
// GET /api/turmas/:id
router.get("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = ensureUserId(req.user?.id_usuario);
        const id = Number(req.params.id);
        const turma = await turma_1.default.getById(id, userId);
        if (!turma)
            return res.status(404).json({ ok: false, message: "Turma não encontrada" });
        return res.json({ ok: true, data: turma });
    }
    catch (err) {
        console.error("Erro GET /api/turmas/:id:", err);
        return res.status(500).json({ ok: false, message: "Erro ao buscar turma" });
    }
});
// POST /api/turmas
router.post("/", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = ensureUserId(req.user?.id_usuario);
        const { CODIGO, NOME, APELIDO, ID_DISCIPLINA } = req.body;
        if (!NOME || !ID_DISCIPLINA) {
            return res.status(400).json({ ok: false, message: "Campos obrigatórios" });
        }
        const novaTurma = await turma_1.default.create({ CODIGO, NOME, APELIDO, ID_DISCIPLINA }, userId);
        return res.status(201).json({ ok: true, data: novaTurma });
    }
    catch (err) {
        console.error("Erro POST /api/turmas:", err);
        return res.status(500).json({ ok: false, message: "Erro ao criar turma" });
    }
});
// PUT /api/turmas/:id
router.put("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = ensureUserId(req.user?.id_usuario);
        const id = Number(req.params.id);
        const { CODIGO, NOME, APELIDO, ID_DISCIPLINA } = req.body;
        if (!NOME || !ID_DISCIPLINA) {
            return res.status(400).json({ ok: false, message: "Campos obrigatórios" });
        }
        const atualizada = await turma_1.default.update(id, { CODIGO, NOME, APELIDO, ID_DISCIPLINA }, userId);
        if (!atualizada) {
            return res.status(404).json({ ok: false, message: "Turma não encontrada" });
        }
        return res.json({ ok: true, data: atualizada });
    }
    catch (err) {
        console.error("Erro PUT /api/turmas/:id:", err);
        return res.status(500).json({ ok: false, message: "Erro ao atualizar turma" });
    }
});
// DELETE /api/turmas/:id
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const userId = ensureUserId(req.user?.id_usuario);
        const id = Number(req.params.id);
        const removida = await turma_1.default.remove(id, userId);
        if (!removida) {
            return res.status(404).json({ ok: false, message: "Turma não encontrada" });
        }
        return res.json({ ok: true, data: true });
    }
    catch (err) {
        console.error("Erro DELETE /api/turmas/:id:", err);
        return res.status(500).json({ ok: false, message: "Erro ao remover turma" });
    }
});
exports.default = router;
//# sourceMappingURL=turmas.js.map