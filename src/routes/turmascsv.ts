// src/routes/turmasCsv.ts
import express, { Router, Request, Response } from "express";

const router = Router();

/** Modelo de aluno apenas para teste em memória */
interface AlunoCsv {
  ra: string;
  nome: string;
}

/** "Banco" em memória para testar: turmaId → lista de alunos */
const alunosPorTurma: Record<string, AlunoCsv[]> = {};

/** Escapar valor para escrever em CSV */
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Parse simples de CSV RA,NOME (com ou sem cabeçalho) */
function parseAlunosCsv(csv: string): { alunos: AlunoCsv[]; erros: string[] } {
  const linhas = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const erros: string[] = [];
  const alunos: AlunoCsv[] = [];

  if (linhas.length === 0) {
    erros.push("CSV vazio");
    return { alunos, erros };
  }

  const cabecalho = linhas[0];
  const delimitador = cabecalho.includes(";") ? ";" : ",";
  const colunas = cabecalho
    .split(delimitador)
    .map((c) => c.trim().toUpperCase());

  let idxRa = colunas.indexOf("RA");
  let idxNome = colunas.indexOf("NOME");
  let inicioDados = 0;

  if (idxRa !== -1 && idxNome !== -1) {
    // Tem cabeçalho RA,NOME
    inicioDados = 1;
  } else {
    // Sem cabeçalho → assume RA,NOME na ordem
    idxRa = 0;
    idxNome = 1;
    inicioDados = 0;
  }

  for (let i = inicioDados; i < linhas.length; i++) {
    const linha = linhas[i];
    const partes = linha.split(delimitador);

    const ra = (partes[idxRa] || "").trim();
    const nome = (partes[idxNome] || "").trim();

    if (!ra || !nome) {
      erros.push(`Linha ${i + 1}: RA ou NOME vazio`);
      continue;
    }

    alunos.push({ ra, nome });
  }

  return { alunos, erros };
}

/**
 * POST /api/turmas/:turmaId/alunos/importar-csv
 *  - Aceita SOMENTE CSV (Content-Type: text/csv)
 *  - Salva alunos em memória (alunosPorTurma) só pra teste
 */
router.post(
  "/:turmaId/alunos/importar-csv",
  express.text({ type: "text/csv" }), // lê o body como string
  (req: Request, res: Response) => {
    if (!req.is("text/csv")) {
      return res.status(415).json({
        ok: false,
        error: "Somente CSV é aceito. Use Content-Type: text/csv.",
      });
    }

    const turmaId = req.params.turmaId;
    const raw = (req.body || "").toString().trim();

    if (!raw) {
      return res
        .status(400)
        .json({ ok: false, error: "CSV vazio ou não enviado." });
    }

    const { alunos, erros } = parseAlunosCsv(raw);

    if (erros.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "Erros encontrados no CSV.",
        detalhes: erros,
      });
    }

    alunosPorTurma[turmaId] = alunos;

    return res.json({
      ok: true,
      turmaId,
      quantidade: alunos.length,
      alunos,
    });
  }
);

/**
 * GET /api/turmas/:turmaId/notas/exportar-csv
 *  - Gera um CSV com RA,NOME,COMPONENTE,NOTA
 *  - Como não temos banco, usa os alunos importados e notas vazias
 */
router.get(
  "/:turmaId/notas/exportar-csv",
  (req: Request, res: Response) => {
    const turmaId = req.params.turmaId;
    const alunos = alunosPorTurma[turmaId] || [];

    const linhas: string[] = [];
    linhas.push("RA,NOME,COMPONENTE,NOTA");

    alunos.forEach((a) => {
      const linha = [
        escapeCsv(a.ra),
        escapeCsv(a.nome),
        escapeCsv("TOTAL"), // componente fake por enquanto
        escapeCsv(""),      // nota vazia por enquanto
      ].join(",");
      linhas.push(linha);
    });

    const csv = linhas.join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=notas_turma_${turmaId}.csv`
    );

    return res.send(csv);
  }
);

export default router;
