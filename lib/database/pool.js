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
const host = process.env.ORACLE_HOST;
const port = process.env.ORACLE_PORT ?? "1521";
// prefer SERVICE_NAME, mas caia para SID se só tiver SID configurado
const serviceOrSid = process.env.ORACLE_SERVICE ?? process.env.ORACLE_SID;
if (!serviceOrSid) {
    throw new Error("ERRO: variável ORACLE_SERVICE ou ORACLE_SID não informada no .env");
}
// monta connectString (ezconnect). Ex: host:1521/XE
const connectString = `${host}:${port}/${serviceOrSid}`;
const poolConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString,
    poolMin: 0,
    poolMax: 10,
    poolIncrement: 1,
};
let pool = null;
async function initPool() {
    if (!pool) {
        console.log("Tentando criar pool com connectString:", connectString);
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