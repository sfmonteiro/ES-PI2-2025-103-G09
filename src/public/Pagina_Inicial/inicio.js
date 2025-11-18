// Responsável original: Sara Fernandes
// Ajustes: Marialvo (mostra instituição selecionada e primeiro nome do usuário)
// Ajustes: Gabriel (carregar estatísticas do dashboard)
// ALTERAÇÃO POR: Marialvo
// Objetivo: buscar totais via API (/api/instituicao, /api/cursos, /api/turmas, /api/componentes)
// Mantive fallback para localStorage se API falhar.

const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

if (userBtn && userMenu) {
  userBtn.addEventListener('click', () => {
    userMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('open');
    }
  });
}

// ----------------- helpers -----------------
const AUTH_TOKEN_KEY = 'token';

async function apiGet(path) {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const resp = await fetch(path, { headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (e) {
    // sinaliza falha ao chamar API
    return { _error: true, error: e };
  }
}

function safeParseJSON(str) {
  try { return JSON.parse(str || '[]'); } catch { return []; }
}

function getSelectedInstitution() {
  try {
    const id = localStorage.getItem('selected_instituicao_id');
    const nome = localStorage.getItem('selected_instituicao_nome');
    if (id && nome) return { id, nome };
  } catch (e) { /* ignore */ }
  return null;
}

function getUserFirstName() {
  try {
    const u = localStorage.getItem("usuario");
    if (u) {
      const obj = JSON.parse(u);
      const nomeFull = obj.nome ?? obj.NOME ?? obj.nome_usuario ?? obj.name ?? "";
      if (nomeFull) return nomeFull.split(" ")[0];
    }
    const token = localStorage.getItem("token");
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = parts[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
          const nomeFull = decoded.nome ?? decoded.name ?? decoded.nome_usuario ?? decoded.username ?? "";
          if (nomeFull) return String(nomeFull).split(" ")[0];
        } catch (e) { /* ignore */ }
      }
    }
  } catch (e) { /* ignore */ }
  return null;
}

// ----------------- UI population -----------------
function populateHeader() {
  const instArea = document.querySelector('.faculdade-box');
  const inst = getSelectedInstitution();
  if (instArea) {
    if (inst) {
      instArea.innerHTML = `
        <img src="../images/icone_instituicao_verde.png" alt="Logo Instituição" class="instituicao-icon">
        <span class="instituicao-nome">${inst.nome}</span>
      `;
    } else {
      instArea.innerHTML = `
        <img src="../images/icone_instituicao_verde.png" alt="Logo Instituição" class="instituicao-icon">
        <span class="instituicao-nome">Nenhuma instituição selecionada</span>
      `;
    }
  }
  const userBtnSpan = document.getElementById('user-btn');
  const firstName = getUserFirstName();
  if (userBtnSpan) {
    userBtnSpan.textContent = firstName ? `Olá, ${firstName}!   ▼` : `Olá, Usuário!   ▼`;
  }
}

// ----------------- Dashboard data -----------------
async function carregarDashboard() {
  // 1) Tenta obter dados da API (recomendado)
  const [instRes, cursosRes, turmasRes, componentesRes] = await Promise.allSettled([
    apiGet('/api/instituicao'),
    apiGet('/api/cursos'),
    apiGet('/api/turmas'),
    apiGet('/api/componentes')
  ]);

  // Se todas as chamadas falharam, usamos localStorage fallback
  const apiOkay = (r) => r && r.status === 'fulfilled' && r.value && !r.value._error;

  let instituicoes = [];
  let cursos = [];
  let turmas = [];
  let componentes = [];

  if (apiOkay(instRes)) {
    // algumas APIs retornam { ok:true, rows: [...] } ou { ok:true, data: [...] } ou array
    const v = instRes.value;
    instituicoes = Array.isArray(v) ? v : (v.rows || v.data || []);
  } else {
    instituicoes = safeParseJSON(localStorage.getItem('instituicoes'));
  }

  if (apiOkay(cursosRes)) {
    const v = cursosRes.value;
    cursos = Array.isArray(v) ? v : (v.rows || v.data || []);
    // normalizar: front espera cursos com campo disciplinas (array)
    cursos = cursos.map(c => ({ ...c, disciplinas: c.disciplinas || c.DISCIPLINAS || [] }));
  } else {
    cursos = safeParseJSON(localStorage.getItem('cursos'));
  }

  if (apiOkay(turmasRes)) {
    const v = turmasRes.value;
    turmas = Array.isArray(v) ? v : (v.rows || v.data || []);
  } else {
    turmas = safeParseJSON(localStorage.getItem('turmas'));
  }

  if (apiOkay(componentesRes)) {
    const v = componentesRes.value;
    componentes = Array.isArray(v) ? v : (v.rows || v.data || []);
  } else {
    componentes = safeParseJSON(localStorage.getItem('componentes'));
  }

  // Totais
  const totalInstituicoes = instituicoes.length || 0;
  const totalCursos = cursos.length || 0;
  const totalTurmas = turmas.length || 0;
  const totalComponentes = componentes.length || 0;

  const totalDisciplinas = cursos.reduce((acc, curso) => acc + (Array.isArray(curso.disciplinas) ? curso.disciplinas.length : 0), 0);
  const totalAlunos = turmas.reduce((acc, turma) => acc + (Array.isArray(turma.alunos) ? turma.alunos.length : 0), 0);

  // Atualiza DOM (verifica existência dos elementos)
  const el = (id) => document.getElementById(id);
  if (el('total-instituicoes')) el('total-instituicoes').textContent = totalInstituicoes;
  if (el('total-cursos')) el('total-cursos').textContent = totalCursos;
  if (el('total-disciplinas')) el('total-disciplinas').textContent = totalDisciplinas;
  if (el('total-turmas')) el('total-turmas').textContent = totalTurmas;
  if (el('total-alunos')) el('total-alunos').textContent = totalAlunos;
  if (el('total-componentes')) el('total-componentes').textContent = totalComponentes;

  carregarTurmasRecentes(turmas);
  carregarCursosComMaisDisciplinas(cursos);
}

function carregarTurmasRecentes(turmas) {
  const container = document.getElementById('lista-turmas-recentes');
  if (!container) return;
  if (!turmas || turmas.length === 0) {
    container.innerHTML = `
      <div class="dashboard-vazio">
        <img src="../images/imagem_alunos.png" alt="Nenhuma turma">
        <p>Nenhuma turma cadastrada ainda</p>
      </div>
    `;
    return;
  }
  const turmasRecentes = [...turmas].sort((a,b) => (b.id || 0) - (a.id || 0)).slice(0,5);
  container.innerHTML = turmasRecentes.map(turma => {
    const numAlunos = Array.isArray(turma.alunos) ? turma.alunos.length : 0;
    return `
      <div class="item-recente">
        <div class="item-info">
          <div class="item-nome">${turma.nome || 'Sem nome'}</div>
          <div class="item-detalhe">
            ${turma.cursoNome || turma.curso?.nome || 'Curso não definido'} • ${turma.periodo || 'Período não definido'}
          </div>
          <div class="item-detalhe">
            ${turma.disciplinaNome || turma.disciplina?.nome || 'Disciplina não definida'}
          </div>
        </div>
        <div class="item-badge badge-alunos">
          ${numAlunos} aluno${numAlunos !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function carregarCursosComMaisDisciplinas(cursos) {
  const container = document.getElementById('lista-cursos-disciplinas');
  if (!container) return;
  if (!cursos || cursos.length === 0) {
    container.innerHTML = `
      <div class="dashboard-vazio">
        <img src="../images/imagem_alunos.png" alt="Nenhum curso">
        <p>Nenhum curso cadastrado ainda</p>
      </div>
    `;
    return;
  }
  const cursosOrdenados = [...cursos].map(curso => ({ ...curso, numDisciplinas: Array.isArray(curso.disciplinas) ? curso.disciplinas.length : 0 }))
    .sort((a,b) => b.numDisciplinas - a.numDisciplinas)
    .slice(0,5);

  container.innerHTML = cursosOrdenados.map(curso => `
      <div class="item-recente">
        <div class="item-info">
          <div class="item-nome">${curso.nome || 'Sem nome'}</div>
          <div class="item-detalhe">
            ${curso.numDisciplinas} disciplina${curso.numDisciplinas !== 1 ? 's' : ''} cadastrada${curso.numDisciplinas !== 1 ? 's' : ''}
          </div>
        </div>
        <div class="item-badge badge-curso">
          ${curso.numDisciplinas}
        </div>
      </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  populateHeader();
  await carregarDashboard();
});
