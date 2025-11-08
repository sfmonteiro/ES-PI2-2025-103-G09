// src/database/connection.ts
import oracledb from "oracledb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Ajustes recomendados
oracledb.autoCommit = false; // controle de commit nas rotas
oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY; // você pode trocar para OUT_FORMAT_OBJECT se preferir objetos

let pool: oracledb.Pool | null = null;

export async function initPool() {
  if (pool) return pool; // já inicializado
  pool = await oracledb.createPool({
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

export async function getConnection() {
  if (!pool) {
    await initPool();
  }
  if (!pool) throw new Error("Pool não inicializado");
  return await pool.getConnection();
}

export async function closePool() {
  if (pool) {
    await pool.close(10); // aguarda até 10s para finalizar conexões
    pool = null;
    console.log("Pool encerrado");
  }
}
