"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const instituicao_1 = __importDefault(require("./routes/instituicao"));
const turmascsv_1 = __importDefault(require("./routes/turmascsv"));
const pool_1 = require("./database/pool");
const cursos_1 = __importDefault(require("./routes/cursos"));
const componentes_1 = __importDefault(require("./routes/componentes"));
const turmas_1 = __importDefault(require("./routes/turmas"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 3000);
const rootDir = path_1.default.resolve(__dirname, "..");
const publicPath = path_1.default.join(rootDir, "src", "public");
console.log("Servindo arquivos estáticos de:", publicPath);
app.use(express_1.default.json());
app.use(express_1.default.static(publicPath));
// rota inicial
app.get("/", (req, res) => {
    res.redirect("/Login/login.html");
});
// ============================
// ROTAS PRINCIPAIS
// ============================
app.use("/api", auth_1.default);
app.use("/api/instituicao", instituicao_1.default);
app.use("/api/cursos", cursos_1.default);
app.use("/api/componentes", componentes_1.default);
// Turmas CSV e Turmas CRUD
app.use("/api/turmas/csv", turmascsv_1.default);
app.use("/api/turmas", turmas_1.default);
// ============================
// MIDDLEWARE DE TRATAMENTO DE ERRO
// ============================
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError &&
        "body" in err &&
        err.status === 400) {
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
});
// ============================
// INICIAR SERVIDOR + POOL
// ============================
(async () => {
    try {
        await (0, pool_1.initPool)();
        app.listen(PORT, () => {
            console.log(`Servidor ativo na porta ${PORT}`);
        });
    }
    catch (err) {
        console.error("Erro ao iniciar aplicação:", err);
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map