"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.initPool = void 0;
exports.getConnection = getConnection;
//src/database/connection.ts
//Por Marialvo - CORRIGIDO para usar pool.ts
const pool_1 = require("./pool");
// Exporta a função de pool como getConnection para manter compatibilidade
async function getConnection() {
    return (0, pool_1.getConnectionFromPool)();
}
// Mantém exports do pool para compatibilidade
var pool_2 = require("./pool");
Object.defineProperty(exports, "initPool", { enumerable: true, get: function () { return pool_2.initPool; } });
Object.defineProperty(exports, "closePool", { enumerable: true, get: function () { return pool_2.closePool; } });
//# sourceMappingURL=connection.js.map