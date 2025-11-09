import express, { Request, Response } from "express";
import path from "path";
import authRouter from "./routes/auth";
import { initPool } from "./database/pool";


const app = express();
const PORT = 3000;

const rootDir = path.resolve(__dirname, "..");
const publicPath = path.join(rootDir, "src", "public");

console.log("Servindo arquivos estáticos de:", publicPath);

app.use(express.json());
app.use(express.static(publicPath));

app.get("/", (req: Request, res: Response) => {
  res.redirect("/Login/login.html");
});

// registrar rotas
app.use("/api", authRouter);

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
