import express from "express";
import path from "path";
import authRouter from "./routes/auth";
import instituicaoRouter from "./routes/instituicao";
import turmasCsvRouter from "./routes/turmascsv";
import { initPool } from "./database/pool";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

const rootDir = path.resolve(__dirname, "..");            // sobe do lib -> projeto raiz quando rodando JS compilado
const publicPath = path.join(rootDir, "src", "public");   // aponta para <projeto>/src/public (onde estão os html/css/js)

console.log("Servindo arquivos estáticos de:", publicPath);

app.use(express.json());
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.redirect("/Login/login.html");
});

// registrar rotas
app.use("/api", authRouter);
app.use("/api/instituicao", instituicaoRouter);
app.use("/api/turmas", turmasCsvRouter);

//Checagem de JSON
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Erro de JSON inválido vindo do express.json()
    if (
      err instanceof SyntaxError &&
      "body" in err &&
      (err as any).status === 400
    ) {
      return res
        .status(400)
        .json({ ok: false, error: "JSON inválido no corpo da requisição." });
    }

    // Qualquer outro erro cai aqui
    console.error("Erro não tratado:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Erro interno no servidor." });
  }
);

// inicializar pool e iniciar servidor
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
