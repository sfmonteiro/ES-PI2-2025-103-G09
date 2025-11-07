import express, { Request, Response } from "express";
import path from "path";

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

app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
