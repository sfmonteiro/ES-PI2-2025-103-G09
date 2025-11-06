import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req: Request, res: Response) => {
  res.redirect("/Login/login.html");
});

app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
