"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
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
app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});
//# sourceMappingURL=index.js.map