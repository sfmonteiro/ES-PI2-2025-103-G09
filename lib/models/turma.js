"use strict";
// criado POR: Marialvo
// Modelo de Turmas integrado ao Oracle com COMMIT manual
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb_1 = __importDefault(require("oracledb"));
const connection_1 = require("../database/connection"); // padronizado
exports.default = {
    // Lista todas as turmas do usuário
    async getAll(userId) {
        let conn;
        try {
            conn = await (0, connection_1.getConnection)();
            const sql = `
        SELECT t.ID_TURMA, t.CODIGO, t.NOME, t.APELIDO, t.ID_DISCIPLINA
        FROM TURMAS t
        JOIN DISCIPLINAS d ON t.ID_DISCIPLINA = d.ID_DISCIPLINA
        JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
        JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
        WHERE i.OWNER_USER_ID = :userId
        ORDER BY t.NOME
      `;
            const result = await conn.execute(sql, { userId }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
            return result.rows || [];
        }
        finally {
            if (conn)
                await conn.close();
        }
    },
    // Busca turma por ID do usuário
    async getById(id, userId) {
        let conn;
        try {
            conn = await (0, connection_1.getConnection)();
            const sql = `
        SELECT t.ID_TURMA, t.CODIGO, t.NOME, t.APELIDO, t.ID_DISCIPLINA
        FROM TURMAS t
        JOIN DISCIPLINAS d ON t.ID_DISCIPLINA = d.ID_DISCIPLINA
        JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
        JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
        WHERE t.ID_TURMA = :id AND i.OWNER_USER_ID = :userId
      `;
            const result = await conn.execute(sql, { id, userId }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
            return (result.rows && result.rows[0]) || null;
        }
        finally {
            if (conn)
                await conn.close();
        }
    },
    // Cria nova turma
    async create(data, userId) {
        let conn;
        try {
            conn = await (0, connection_1.getConnection)();
            // Verifica se a disciplina pertence ao usuário
            const checkDisc = await conn.execute(`
        SELECT 1 
        FROM DISCIPLINAS d
        JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
        JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
        WHERE d.ID_DISCIPLINA = :idDisc AND i.OWNER_USER_ID = :userId
        `, { idDisc: data.ID_DISCIPLINA, userId }, { outFormat: oracledb_1.default.OUT_FORMAT_OBJECT });
            if (!checkDisc.rows || checkDisc.rows.length === 0) {
                throw new Error("Disciplina não pertence ao usuário");
            }
            const sql = `
        INSERT INTO TURMAS (CODIGO, NOME, APELIDO, ID_DISCIPLINA)
        VALUES (:CODIGO, :NOME, :APELIDO, :ID_DISCIPLINA)
        RETURNING ID_TURMA INTO :newId
      `;
            const binds = {
                CODIGO: data.CODIGO || null,
                NOME: data.NOME,
                APELIDO: data.APELIDO || null,
                ID_DISCIPLINA: data.ID_DISCIPLINA,
                newId: { dir: oracledb_1.default.BIND_OUT, type: oracledb_1.default.NUMBER }
            };
            const r = await conn.execute(sql, binds, { autoCommit: false });
            const newId = r.outBinds.newId[0];
            await conn.commit();
            return { ...data, ID_TURMA: newId };
        }
        catch (err) {
            if (conn)
                await conn.rollback();
            throw err;
        }
        finally {
            if (conn)
                await conn.close();
        }
    },
    // Atualiza turma
    async update(id, data, userId) {
        let conn;
        try {
            conn = await (0, connection_1.getConnection)();
            const sql = `
        UPDATE TURMAS t
        SET CODIGO = :CODIGO, NOME = :NOME, APELIDO = :APELIDO, ID_DISCIPLINA = :ID_DISCIPLINA
        WHERE ID_TURMA = :id
          AND ID_DISCIPLINA IN (
            SELECT d.ID_DISCIPLINA
            FROM DISCIPLINAS d
            JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
            JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
            WHERE i.OWNER_USER_ID = :userId
          )
      `;
            const r = await conn.execute(sql, {
                id,
                CODIGO: data.CODIGO || null,
                NOME: data.NOME,
                APELIDO: data.APELIDO || null,
                ID_DISCIPLINA: data.ID_DISCIPLINA,
                userId
            }, { autoCommit: false });
            if (!r.rowsAffected || r.rowsAffected === 0) {
                await conn.rollback();
                return null;
            }
            await conn.commit();
            return await this.getById(id, userId);
        }
        catch (err) {
            if (conn)
                await conn.rollback();
            throw err;
        }
        finally {
            if (conn)
                await conn.close();
        }
    },
    // Remove turma
    async remove(id, userId) {
        let conn;
        try {
            conn = await (0, connection_1.getConnection)();
            const sql = `
        DELETE FROM TURMAS
        WHERE ID_TURMA = :id
          AND ID_DISCIPLINA IN (
            SELECT d.ID_DISCIPLINA
            FROM DISCIPLINAS d
            JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
            JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
            WHERE i.OWNER_USER_ID = :userId
          )
      `;
            const r = await conn.execute(sql, { id, userId }, { autoCommit: false });
            if (!r.rowsAffected || r.rowsAffected === 0) {
                await conn.rollback();
                return false;
            }
            await conn.commit();
            return true;
        }
        catch (err) {
            if (conn)
                await conn.rollback();
            throw err;
        }
        finally {
            if (conn)
                await conn.close();
        }
    }
};
//# sourceMappingURL=turma.js.map