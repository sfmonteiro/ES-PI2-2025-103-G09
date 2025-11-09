import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

const poolConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
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
    await pool.close(10); // espera até 10s para fechar
    pool = null;
    console.log("✅ Oracle pool fechado");
  }
}

export async function getConnectionFromPool() {
  if (!pool) await initPool();
  return pool!.getConnection();
}
