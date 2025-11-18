"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPool = initPool;
exports.closePool = closePool;
exports.getConnectionFromPool = getConnectionFromPool;
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Leitura das variáveis do .env
const host = process.env.ORACLE_HOST?.trim();
const port = process.env.ORACLE_PORT?.trim() || "1521";
const serviceOrSid = (process.env.ORACLE_SERVICE || process.env.ORACLE_SID)?.trim();
const user = process.env.ORACLE_USER?.trim();
const password = process.env.ORACLE_PASSWORD?.trim();
// Verificações básicas
if (!host || !serviceOrSid || !user || !password) {
    throw new Error("ERRO: Variáveis do Oracle não configuradas corretamente no .env. " +
        "Certifique-se de ORACLE_HOST, ORACLE_SID/ORACLE_SERVICE, ORACLE_USER e ORACLE_PASSWORD");
}
// Monta connectString (ezconnect) ex: host:1521/XE
const connectString = `${host}:${port}/${serviceOrSid}`;
console.log("Tentando criar pool com connectString:", connectString);
const poolConfig = {
    user,
    password,
    connectString,
    poolMin: 0,
    poolMax: 10,
    poolIncrement: 1,
};
let pool = null;
async function initPool() {
    if (!pool) {
        pool = await oracledb_1.default.createPool(poolConfig);
        console.log("✅ Oracle pool criado");
    }
    return pool;
}
async function closePool() {
    if (pool) {
        await pool.close(10);
        pool = null;
        console.log("✅ Oracle pool fechado");
    }
}
async function getConnectionFromPool() {
    if (!pool)
        await initPool();
    return pool.getConnection();
}
//# sourceMappingURL=pool.js.map