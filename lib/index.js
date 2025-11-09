"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const pool_1 = require("./database/pool");
const app = (0, express_1.default)();
const PORT = 3000;
const rootDir = path_1.default.resolve(__dirname, "..");
const publicPath = path_1.default.join(rootDir, "src", "public");
console.log("Servindo arquivos estáticos de:", publicPath);
app.use(express_1.default.json());
app.use(express_1.default.static(publicPath));
app.get("/", (req, res) => {
    res.redirect("/Login/login.html");
});
// registrar rotas
app.use("/api", auth_1.default);
// inicializar pool e iniciar servidor
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