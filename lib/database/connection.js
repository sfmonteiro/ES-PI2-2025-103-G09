"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPool = initPool;
exports.getConnection = getConnection;
exports.closePool = closePool;
// src/database/connection.ts
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
// Ajustes recomendados
oracledb_1.default.autoCommit = false; // controle de commit nas rotas
oracledb_1.default.outFormat = oracledb_1.default.OUT_FORMAT_ARRAY; // você pode trocar para OUT_FORMAT_OBJECT se preferir objetos
let pool = null;
async function initPool() {
    if (pool)
        return pool; // já inicializado
    pool = await oracledb_1.default.createPool({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SID || process.env.ORACLE_SERVICE}`,
        poolMin: 1,
        poolMax: 4,
        poolIncrement: 1
    });
    console.log("✅ Pool de conexões Oracle criado");
    return pool;
}
async function getConnection() {
    if (!pool) {
        await initPool();
    }
    if (!pool)
        throw new Error("Pool não inicializado");
    return await pool.getConnection();
}
async function closePool() {
    if (pool) {
        await pool.close(10); // aguarda até 10s para finalizar conexões
        pool = null;
        console.log("Pool encerrado");
    }
}
//# sourceMappingURL=connection.js.map