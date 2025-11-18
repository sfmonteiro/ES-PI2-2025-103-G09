// src/routes/turmascsv.ts
// Criado por: Marialvo + revisão final compatível com seu banco Oracle

import express, { Router, Response } from "express";
import oracledb from "oracledb";
import { requireAuth, ensureUserId, AuthRequest } from "../middleware/auth";
import { getConnectionFromPool } from "../database/pool";

const router = Router();

/** Utilitário para CSV */
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Parse simples de RA,NOME CSV */
function parseAlunosCsv(csv: string): { alunos: { ra: string; nome: string }[]; erros: string[] } {
  const linhas = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const alunos: { ra: string; nome: string }[] = [];
  const erros: string[] = [];

  if (linhas.length === 0) {
    erros.push("CSV vazio");
    return { alunos, erros };
  }

  const cab = linhas[0];
  const delim = cab.includes(";") ? ";" : ",";
  const cols = cab.split(delim).map((c) => c.trim().toUpperCase());

  let idxRa = cols.indexOf("RA");
  let idxNome = cols.indexOf("NOME");
  let start = 0;

  if (idxRa !== -1 && idxNome !== -1) start = 1;
  else { idxRa = 0; idxNome = 1; }

  for (let i = start; i < linhas.length; i++) {
    const partes = linhas[i].split(delim);
    const ra = (partes[idxRa] ?? "").trim();
    const nome = (partes[idxNome] ?? "").trim();

    if (!ra || !nome) {
      erros.push(`Linha ${i + 1}: RA ou NOME vazio`);
      continue;
    }

    alunos.push({ ra, nome });
  }

  return { alunos, erros };
}

/** POST – Importar CSV e gravar em ALUNO + MATRICULADO */
router.post(
  "/:turmaId/alunos/importar-csv",
  express.text({ type: "text/csv" }),
  requireAuth,
  async (req: AuthRequest, res: Response) => {

    if (!req.is("text/csv")) {
      return res.status(415).json({ ok: false, message: "Use Content-Type: text/csv" });
    }

    const userId = (() => { try { return ensureUserId(req.user?.id_usuario); } catch { return null; } })();
    if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

    const turmaId = Number(req.params.turmaId);
    const raw = (req.body || "").toString().trim();
    if (!raw) return res.status(400).json({ ok: false, message: "CSV vazio" });

    const { alunos, erros } = parseAlunosCsv(raw);
    if (erros.length > 0) {
      return res.status(400).json({ ok: false, message: "Erros no CSV", detalhes: erros });
    }

    let conn: oracledb.Connection | undefined;
    try {
      conn = await getConnectionFromPool();

      // CORRIGIDO: ID_DISCIPLINAS -> ID_DISCIPLINA
      const verSql = `
        SELECT 1
        FROM TURMAS t
        JOIN DISCIPLINAS d ON t.ID_DISCIPLINA = d.ID_DISCIPLINA
        JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
        JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
        WHERE t.ID_TURMA = :tid AND i.OWNER_USER_ID = :uid
      `;
      const ver = await conn.execute(verSql, { tid: turmaId, uid: userId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (!ver.rows || ver.rows.length === 0) {
        return res.status(403).json({ ok: false, message: "Turma não pertence ao usuário" });
      }

      const inseridos: any[] = [];

      for (const a of alunos) {
        // 1 – Buscar por RA_MATRICULA
        const s = await conn.execute(
          `SELECT ID_ALUNO FROM ALUNO WHERE RA_MATRICULA = :ra`,
          { ra: a.ra },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        let alunoId: number;

        if (s.rows && s.rows.length > 0) {
          alunoId = (s.rows[0] as any).ID_ALUNO;

          // Atualizar nome se mudou
          await conn.execute(
            `UPDATE ALUNO SET NOME = :nome WHERE ID_ALUNO = :id AND NOME != :nome`,
            { nome: a.nome, id: alunoId }
          );
        } else {
          // Criar novo aluno
          const ins = await conn.execute(
            `
            INSERT INTO ALUNO (RA_MATRICULA, NOME)
            VALUES (:ra, :nome)
            RETURNING ID_ALUNO INTO :id
            `,
            { ra: a.ra, nome: a.nome, id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
            { autoCommit: false }
          ) as unknown as { outBinds: { id: number[] } };
          alunoId = ins.outBinds.id[0];
        }

        // 2 – Criar matrícula se não existir
        const m = await conn.execute(
          `SELECT 1 FROM MATRICULADO WHERE ID_ALUNO = :id AND ID_TURMA = :tid`,
          { id: alunoId, tid: turmaId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (!m.rows || m.rows.length === 0) {
          await conn.execute(
            `INSERT INTO MATRICULADO (ID_ALUNO, ID_TURMA) VALUES (:id, :tid)`,
            { id: alunoId, tid: turmaId }
          );
        }

        inseridos.push({ alunoId, ra: a.ra, nome: a.nome });
      }

      await conn.commit();

      return res.json({
        ok: true,
        turmaId,
        quantidade: inseridos.length,
        alunos: inseridos
      });

    } catch (err) {
      try { if (conn) await conn.rollback(); } catch {}
      console.error("Erro importar CSV:", err);
      return res.status(500).json({ ok: false, message: "Erro ao importar CSV" });
    } finally {
      if (conn) try { await conn.close(); } catch {}
    }
  }
);

/** GET – Exportar lista de alunos */
router.get("/:turmaId/notas/exportar-csv", requireAuth, async (req: AuthRequest, res: Response) => {

  const userId = (() => { try { return ensureUserId(req.user?.id_usuario); } catch { return null; } })();
  if (!userId) return res.status(401).json({ ok: false, message: "Usuário não autenticado" });

  const turmaId = Number(req.params.turmaId);
  let conn: oracledb.Connection | undefined;

  try {
    conn = await getConnectionFromPool();

    // CORRIGIDO: ID_DISCIPLINAS -> ID_DISCIPLINA
    const ver = await conn.execute(
      `
      SELECT 1
      FROM TURMAS t
      JOIN DISCIPLINAS d ON t.ID_DISCIPLINA = d.ID_DISCIPLINA
      JOIN CURSO c ON d.CURSO_ID = c.CURSO_ID
      JOIN INSTITUICAO i ON c.ID_INSTITUICAO = i.ID_INSTITUICAO
      WHERE t.ID_TURMA = :tid AND i.OWNER_USER_ID = :uid
      `,
      { tid: turmaId, uid: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!ver.rows || ver.rows.length === 0) {
      return res.status(403).json({ ok: false, message: "Turma não pertence ao usuário" });
    }

    // Carrega alunos
    const r = await conn.execute(
      `
      SELECT a.RA_MATRICULA, a.NOME
      FROM MATRICULADO m
      JOIN ALUNO a ON m.ID_ALUNO = a.ID_ALUNO
      WHERE m.ID_TURMA = :tid
      ORDER BY a.NOME
      `,
      { tid: turmaId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const alunos = (r.rows || []).map((x: any) => ({
      ra: x.RA_MATRICULA,
      nome: x.NOME
    }));

    // Montar CSV – por enquanto sem notas
    const linhas = ["RA,NOME,COMPONENTE,NOTA"];

    for (const a of alunos) {
      linhas.push(
        [
          escapeCsv(a.ra),
          escapeCsv(a.nome),
          escapeCsv("TOTAL"),
          escapeCsv("")
        ].join(",")
      );
    }

    const csv = linhas.join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=notas_turma_${turmaId}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error("Erro exportar CSV:", err);
    return res.status(500).json({ ok: false, message: "Erro ao exportar CSV" });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;