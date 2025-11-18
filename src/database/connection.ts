//Por Marialvo
import oracledb from 'oracledb';
import dotenv from 'dotenv';
dotenv.config(); // sempre carregar direto da raiz

// Ajustes recomendados
oracledb.autoCommit = false; // você controla commit nas rotas
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 
// OBJECT deixa mais fácil trabalhar nas rotas (rows → objetos)

let pool: oracledb.Pool | null = null;

export async function initPool() {
  if (pool) return pool;

  pool = await oracledb.createPool({
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

export async function getConnection() {
  if (!pool) await initPool();
  if (!pool) throw new Error("Pool não inicializado");
  return pool.getConnection();
}

export async function closePool() {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log("Pool Oracle encerrado");
  }
}
