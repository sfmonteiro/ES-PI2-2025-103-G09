import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Leitura das variáveis do .env
const host = process.env.ORACLE_HOST?.trim();
const port = process.env.ORACLE_PORT?.trim() || "1521";
const serviceOrSid = (process.env.ORACLE_SERVICE || process.env.ORACLE_SID)?.trim();
const user = process.env.ORACLE_USER?.trim();
const password = process.env.ORACLE_PASSWORD?.trim();

// Verificações básicas
if (!host || !serviceOrSid || !user || !password) {
  throw new Error(
    "ERRO: Variáveis do Oracle não configuradas corretamente no .env. " +
    "Certifique-se de ORACLE_HOST, ORACLE_SID/ORACLE_SERVICE, ORACLE_USER e ORACLE_PASSWORD"
  );
}

// Monta connectString (ezconnect) ex: host:1521/XE
const connectString = `${host}:${port}/${serviceOrSid}`;
console.log("Tentando criar pool com connectString:", connectString);

const poolConfig: oracledb.PoolAttributes = {
  user,
  password,
  connectString,
  poolMin: 0,
  poolMax: 10,
  poolIncrement: 1,
};

let pool: oracledb.Pool | null = null;

export async function initPool() {
  if (!pool) {
    pool = await oracledb.createPool(poolConfig);
    console.log("✅ Oracle pool criado");
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log("✅ Oracle pool fechado");
  }
}

export async function getConnectionFromPool() {
  if (!pool) await initPool();
  return pool!.getConnection();
}
