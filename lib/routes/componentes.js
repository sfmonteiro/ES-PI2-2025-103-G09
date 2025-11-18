"use strict";
// criado POR: Marialvo
// Placeholder para /api/componentes — será usado futuramente (cálculos de notas)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/componentes
 * Atualmente vazio — aguarda implementação futura.
 */
router.get("/", auth_1.requireAuth, async (req, res) => {
    return res.json({
        ok: true,
        message: "Endpoint de componentes ainda não implementado",
        data: []
    });
});
exports.default = router;
//# sourceMappingURL=componentes.js.map