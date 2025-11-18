"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPool = initPool;
exports.getConnection = getConnection;
exports.closePool = closePool;
//Por Marialvo
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // sempre carregar direto da raiz
// Ajustes recomendados
oracledb_1.default.autoCommit = false; // você controla commit nas rotas
oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_OBJECT;
// OBJECT deixa mais fácil trabalhar nas rotas (rows → objetos)
let pool = null;
async function initPool() {
    if (pool)
        return pool;
    pool = await oracledb_1.default.createPool({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
        poolMin: 1,
        poolMax: 4,
        poolIncrement: 1
    });
    console.log("✅ Pool Oracle criado");
    return pool;
}
async function getConnection() {
    if (!pool)
        await initPool();
    if (!pool)
        throw new Error("Pool não inicializado");
    return pool.getConnection();
}
async function closePool() {
    if (pool) {
        await pool.close(10);
        pool = null;
        console.log("Pool Oracle encerrado");
    }
}
//# sourceMappingURL=connection.js.map