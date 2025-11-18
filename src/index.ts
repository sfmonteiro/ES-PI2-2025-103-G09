import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import path from "path";
import authRouter from "./routes/auth";
import instituicaoRouter from "./routes/instituicao";
import turmasCsvRouter from "./routes/turmascsv";
import { initPool } from "./database/pool";
import cursosRouter from "./routes/cursos";
import componentesRouter from "./routes/componentes";
import turmasRouter from "./routes/turmas";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

const rootDir = path.resolve(__dirname, "..");
const publicPath = path.join(rootDir, "src", "public");

console.log("Servindo arquivos estáticos de:", publicPath);

app.use(express.json());
app.use(express.static(publicPath));

// rota inicial
app.get("/", (req, res) => {
  res.redirect("/Login/login.html");
});

// ============================
// ROTAS PRINCIPAIS
// ============================
app.use("/api", authRouter);
app.use("/api/instituicao", instituicaoRouter);
app.use("/api/cursos", cursosRouter);
app.use("/api/componentes", componentesRouter);

// Turmas CSV e Turmas CRUD
app.use("/api/turmas/csv", turmasCsvRouter);
app.use("/api/turmas", turmasRouter);

// ============================
// MIDDLEWARE DE TRATAMENTO DE ERRO
// ============================
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      err instanceof SyntaxError &&
      "body" in err &&
      (err as any).status === 400
    ) {
      return res.status(400).json({
        ok: false,
        error: "JSON inválido no corpo da requisição."
      });
    }

    console.error("Erro não tratado:", err);

    return res.status(500).json({
      ok: false,
      error: "Erro interno no servidor."
    });
  }
);

// ============================
// INICIAR SERVIDOR + POOL
// ============================
(async () => {
  try {
    await initPool();
    app.listen(PORT, () => {
      console.log(`Servidor ativo na porta ${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar aplicação:", err);
    process.exit(1);
  }
})();
