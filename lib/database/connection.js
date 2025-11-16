"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPool = initPool;
exports.getConnection = getConnection;
exports.closePool = closePool;
// src/database/connection.ts
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const path_1 = __importDefault(require("path"));
dotenv.config({ path: path_1.default.resolve(__dirname, "../.env") });
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