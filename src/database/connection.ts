//src/database/connection.ts
//Por Marialvo - CORRIGIDO para usar pool.ts
import { getConnectionFromPool } from './pool';

// Exporta a função de pool como getConnection para manter compatibilidade
export async function getConnection() {
  return getConnectionFromPool();
}

// Mantém exports do pool para compatibilidade
export { initPool, closePool } from './pool';