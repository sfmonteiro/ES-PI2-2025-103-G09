import oracledb from 'oracledb';
import dotenv from 'dotenv'; dotenv.config();

dotenv.config();

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

let pool: oracledb.Pool | null = null;

export async function initPool() {
  if (!pool) {
    console.log("Tentando criar pool com connectString:", connectString);
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
