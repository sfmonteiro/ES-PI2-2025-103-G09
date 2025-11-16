"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/turmasCsv.ts
const express_1 = __importStar(require("express"));
const router = (0, express_1.Router)();
/** "Banco" em memória para testar: turmaId → lista de alunos */
const alunosPorTurma = {};
/** Escapar valor para escrever em CSV */
function escapeCsv(value) {
    if (value === null || value === undefined)
        return "";
    const s = String(value);
    if (/[",\r\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}
/** Parse simples de CSV RA,NOME (com ou sem cabeçalho) */
function parseAlunosCsv(csv) {
    const linhas = csv
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const erros = [];
    const alunos = [];
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
    }
    else {
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
router.post("/:turmaId/alunos/importar-csv", express_1.default.text({ type: "text/csv" }), // lê o body como string
(req, res) => {
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
});
/**
 * GET /api/turmas/:turmaId/notas/exportar-csv
 *  - Gera um CSV com RA,NOME,COMPONENTE,NOTA
 *  - Como não temos banco, usa os alunos importados e notas vazias
 */
router.get("/:turmaId/notas/exportar-csv", (req, res) => {
    const turmaId = req.params.turmaId;
    const alunos = alunosPorTurma[turmaId] || [];
    const linhas = [];
    linhas.push("RA,NOME,COMPONENTE,NOTA");
    alunos.forEach((a) => {
        const linha = [
            escapeCsv(a.ra),
            escapeCsv(a.nome),
            escapeCsv("TOTAL"), // componente fake por enquanto
            escapeCsv(""), // nota vazia por enquanto
        ].join(",");
        linhas.push(linha);
    });
    const csv = linhas.join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=notas_turma_${turmaId}.csv`);
    return res.send(csv);
});
exports.default = router;
//# sourceMappingURL=turmascsv.js.map