// criado POR: Marialvo
// Placeholder para /api/componentes — será usado futuramente (cálculos de notas)

import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/componentes
 * Atualmente vazio — aguarda implementação futura.
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  return res.json({
    ok: true,
    message: "Endpoint de componentes ainda não implementado",
    data: []
  });
});

export default router;
