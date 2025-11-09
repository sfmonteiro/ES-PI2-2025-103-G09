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
const poolConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
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
        await pool.close(10); // espera até 10s para fechar
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