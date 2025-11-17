// Bruno Lobo de Jesus RA:25019830
// ALTERAÇÃO POR: Marialvo
// Objetivo: substituir localStorage por chamadas à API (/api/cursos).
// Mantive fallback para localStorage caso a API não esteja disponível.

// Constantes
const STORAGE_KEY = "cursos";
const API_BASE = "/api/cursos";
const AUTH_TOKEN_KEY = "token"; // se seu frontend guarda token em outro local, ajuste aqui

/* ---------------------------
   Helpers: API + Fallback
   --------------------------- */
async function apiFetch(path, options = {}) {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const headers = options.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    const resp = await fetch(path, { ...options, headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (e) {
    console.warn('API unreachable or error:', e);
    throw e;
  }
}

async function apiGetCursos() {
  return await apiFetch(API_BASE, { method: 'GET' });
}

async function apiCreateCurso(curso) {
  return await apiFetch(API_BASE, { method: 'POST', body: JSON.stringify({ nome: curso.nome, disciplinas: curso.disciplinas || [] }) });
}

async function apiUpdateCurso(curso) {
  return await apiFetch(`${API_BASE}/${curso.id}`, { method: 'PUT', body: JSON.stringify({ nome: curso.nome, disciplinas: curso.disciplinas || [] }) });
}

async function apiDeleteCurso(id) {
  return await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
}

/* ---------------------------
   LocalStorage helpers (fallback)
   --------------------------- */
function carregarCursosLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao carregar cursos do storage:", e);
    return [];
  }
}

function salvarCursosLocal(cursos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cursos));
  } catch (e) {
    console.error("Erro ao salvar cursos no storage:", e);
  }
}

/* ---------------------------
   Funções de carregamento/salvamento (public)
   --------------------------- */
async function carregarCursos() {
  // Tenta API, se falhar usa localStorage
  try {
    const res = await apiGetCursos();
    // espera { ok:true, data: [...] } ou array direto — adaptamos
    if (res && res.ok && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    // fallback
    return carregarCursosLocal();
  } catch (e) {
    return carregarCursosLocal();
  }
}

async function salvarCursos(cursos) {
  // Tentativa de sincronizar todas as mudanças locais no servidor (se possível)
  try {
    // se algum curso não tiver id (criado localmente), cria no servidor
    for (let c of cursos) {
      if (!c.id || String(c.id).startsWith('tmp-')) {
        // cria e substitui id
        const resp = await apiCreateCurso(c);
        // aceita formatos { ok:true, id } ou { id } ou { ok:true, data: { id } }
        const newId = (resp && (resp.id || (resp.data && resp.data.id))) || (resp && resp.ok && resp.createdId) || null;
        if (newId) c.id = newId;
      } else {
        // atualiza curso existente (inclui disciplinas)
        await apiUpdateCurso(c).catch(() => { /* ignore update failures */ });
      }
    }
    // se chegou até aqui, sucesso na API -> atualiza localStorage também
    salvarCursosLocal(cursos);
  } catch (e) {
    console.warn('salvarCursos: erro na API, gravando localmente', e);
    salvarCursosLocal(cursos);
  }
}

/* ---------------------------
   ID generator (client fallback)
   --------------------------- */
function gerarId() {
  return 'tmp-' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
}

/* ===========================
   RESTANTE DO ARQUIVO (UI)
   =========================== */

// ======== ELEMENTOS ========
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

const modalCurso = document.getElementById("modalCurso");
const modalDisciplina = document.getElementById("modalDisciplina");
const modalConfirmacao = document.getElementById("modalConfirmacao");

const btnCadastroCurso = document.getElementById("cadastro-curso");
const btnCloseModalCurso = document.getElementById("closeModalCurso");
const btnCloseModalDisciplina = document.getElementById("closeModalDisciplina");

const inputNomeCurso = document.getElementById("nomeCurso");
const btnSalvarCurso = document.getElementById("salvarCurso");

const inputNomeDisciplina = document.getElementById("nomeDisciplina");
const inputCodigoDisciplina = document.getElementById("codigoDisciplina");
const inputSiglaDisciplina = document.getElementById("siglaDisciplina");
const inputPeriodoDisciplina = document.getElementById("periodTurma");

const btnAdicionarDisciplina = document.getElementById("adicionarDisciplina");

const listaCursosEl = document.getElementById("lista-cursos");
const listaDisciplinasEl = document.getElementById("listaDisciplinas");

const btnConfirmSim = document.getElementById("confirmarSim");
const btnConfirmNao = document.getElementById("confirmarNao");

// ======== ESTADO ========
let cursos = []; // carregaremos via API
let cursoAtual = null;
let indexParaExcluir = null;
let isEditing = false;
let editingCourseId = null;

// ======== MENU DO USUÁRIO ========
if (userBtn && userMenu) {
  userBtn.addEventListener('click', () => userMenu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!userMenu.contains(e.target) && e.target !== userBtn) {
      userMenu.classList.remove('open');
    }
  });
}

// ======== MODAIS ========
if (btnCloseModalCurso) btnCloseModalCurso.onclick = () => modalCurso.style.display = "none";
if (btnCloseModalDisciplina) btnCloseModalDisciplina.onclick = () => modalDisciplina.style.display = "none";

window.addEventListener("click", e => {
  if (e.target === modalCurso) modalCurso.style.display = "none";
  if (e.target === modalDisciplina) modalDisciplina.style.display = "none";
  if (e.target === modalConfirmacao) modalConfirmacao.style.display = "none";
});

// ======== RENDERIZAÇÃO ========
function limparListaCursosDOM() {
  listaCursosEl.innerHTML = "";
}

function criarCardDOM(curso) {
  const card = document.createElement("div");
  card.className = "curso-card";
  card.dataset.id = curso.id;

  const disciplinasText = (curso.disciplinas && curso.disciplinas.length > 0)
    ? curso.disciplinas.map(d => `${d.codigo} - ${d.sigla} (${d.periodo || 'S/ período'})`).join(", ")
    : "Nenhuma disciplina cadastrada";

  card.innerHTML = `
    <div class="card-top">${curso.nome.toUpperCase()}</div>
    <div class="card-info">
      <p><b>Disciplinas:</b> ${disciplinasText}</p>
    </div>
    <div class="card-botoes">
      <button class="btn-disciplina">Disciplinas</button>
      <button class="btn-editar">Editar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;

  card.querySelector(".btn-disciplina").addEventListener("click", (e) => {
    e.stopPropagation();
    abrirModalDisciplina(curso.id);
  });

  card.querySelector(".btn-editar").addEventListener("click", (e) => {
    e.stopPropagation();
    editarCurso(curso.id);
  });

  card.querySelector(".btn-excluir").addEventListener("click", (e) => {
    e.stopPropagation();
    confirmarExclusaoCurso(curso.id);
  });

  listaCursosEl.appendChild(card);
}

function renderCursos() {
  limparListaCursosDOM();

  if (!listaCursosEl) return;

  if (cursos.length === 0) {
    listaCursosEl.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUM CURSO CADASTRADO AINDA...</p>
        <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
      </div>
    `;
    return;
  }

  cursos.forEach(cr => criarCardDOM(cr));
}

// ======== CADASTRAR / EDITAR CURSO ========
if (btnCadastroCurso) {
  btnCadastroCurso.addEventListener("click", () => {
    isEditing = false;
    editingCourseId = null;
    cursoAtual = null;
    inputNomeCurso.value = "";
    modalCurso.style.display = "flex";
  });
}

function editarCurso(id) {
  const curso = cursos.find(c => String(c.id) === String(id));
  if (!curso) return alert("Curso não encontrado!");

  isEditing = true;
  editingCourseId = id;
  cursoAtual = curso;
  inputNomeCurso.value = curso.nome;
  modalCurso.style.display = "flex";
}

if (btnSalvarCurso) {
  btnSalvarCurso.addEventListener("click", async () => {
    const nome = inputNomeCurso.value.trim();

    if (!nome) {
      alert("Preencha o nome do curso!");
      return;
    }

    if (isEditing && editingCourseId) {
      const idx = cursos.findIndex(c => String(c.id) === String(editingCourseId));
      if (idx !== -1) {
        cursos[idx].nome = nome;
        // tenta salvar no servidor; se falhar salva local
        await salvarCursos(cursos);
        renderCursos();
      }
      modalCurso.style.display = "none";
      isEditing = false;
      editingCourseId = null;
      cursoAtual = null;
      return;
    }

    const novoCurso = {
      id: gerarId(), // temporário; será substituído se API criar
      nome,
      disciplinas: [],
    };

    cursos.push(novoCurso);
    await salvarCursos(cursos);
    renderCursos();
    modalCurso.style.display = "none";
    mostrarSucesso("Curso cadastrado com sucesso!");
  });
}

// ======== ABRIR MODAL DISCIPLINA ========
function abrirModalDisciplina(cursoId) {
  const curso = cursos.find(c => String(c.id) === String(cursoId));
  if (!curso) return alert("Curso não encontrado.");

  cursoAtual = curso;
  limparCamposDisciplina();
  atualizarListaDisciplinas();
  modalDisciplina.style.display = "flex";
}

// ======== LIMPAR CAMPOS DE DISCIPLINA ========
function limparCamposDisciplina() {
  inputCodigoDisciplina.value = "";
  inputNomeDisciplina.value = "";
  inputSiglaDisciplina.value = "";
  inputPeriodoDisciplina.value = "";
}

// ======== ATUALIZAR LISTA DE DISCIPLINAS ========
function atualizarListaDisciplinas() {
  listaDisciplinasEl.innerHTML = "";

  if (!cursoAtual) {
    listaDisciplinasEl.innerHTML = "<div class='sem-disciplinas'>Nenhum curso selecionado</div>";
    return;
  }

  const arr = cursoAtual.disciplinas || [];
  if (arr.length === 0) {
    listaDisciplinasEl.innerHTML = "<div class='sem-disciplinas'>Nenhuma disciplina adicionada</div>";
    return;
  }

  arr.forEach((d, idx) => {
    const item = document.createElement("div");
    item.className = "disc-item";
    item.innerHTML = `
      <span>${d.codigo} - ${d.nome} (${d.sigla}) - ${d.periodo || 'S/ período'}</span>
      <div class="disc-buttons">
        <button class="btn-edit" data-idx="${idx}">Editar</button>
        <button class="btn-del" data-idx="${idx}">Excluir</button>
      </div>
    `;

    item.querySelector(".btn-edit").addEventListener("click", (e) => {
      e.stopPropagation();
      editarDisciplina(idx);
    });

    item.querySelector(".btn-del").addEventListener("click", (e) => {
      e.stopPropagation();
      confirmarExclusao(idx);
    });

    listaDisciplinasEl.appendChild(item);
  });
}

// ======== ADICIONAR DISCIPLINA ========
if (btnAdicionarDisciplina) {
  btnAdicionarDisciplina.addEventListener("click", async () => {
    if (!cursoAtual) return alert("Nenhum curso selecionado para adicionar disciplina.");

    const codigo = inputCodigoDisciplina.value.trim();
    const nome = inputNomeDisciplina.value.trim();
    const sigla = inputSiglaDisciplina.value.trim().toUpperCase();
    const periodo = inputPeriodoDisciplina.value.trim();

    if (!codigo || !nome || !sigla || !periodo) {
      return alert("Preencha todos os campos: CÓDIGO, NOME, SIGLA e PERÍODO!");
    }

    if (!Array.isArray(cursoAtual.disciplinas))
      cursoAtual.disciplinas = [];

    cursoAtual.disciplinas.push({ codigo, nome, sigla, periodo });

    const idx = cursos.findIndex(c => String(c.id) === String(cursoAtual.id));
    if (idx !== -1) {
      cursos[idx] = cursoAtual;
      await salvarCursos(cursos); // salva disciplinas via PUT no servidor (ou local se falhar)
    }

    atualizarListaDisciplinas();
    renderCursos();
    mostrarSucesso("Disciplina cadastrada com sucesso!");

    limparCamposDisciplina();
  });
}

// ======== EDITAR DISCIPLINA ========
function editarDisciplina(index) {
  if (!cursoAtual) return;
  const disc = cursoAtual.disciplinas[index];
  if (!disc) return;

  inputCodigoDisciplina.value = disc.codigo;
  inputNomeDisciplina.value = disc.nome;
  inputSiglaDisciplina.value = disc.sigla;
  inputPeriodoDisciplina.value = disc.periodo || "";

  // remove temporariamente para edição (mesma lógica original)
  cursoAtual.disciplinas.splice(index, 1);

  const idx = cursos.findIndex(c => String(c.id) === String(cursoAtual.id));
  if (idx !== -1) {
    cursos[idx] = cursoAtual;
    salvarCursos(cursos);
  }

  atualizarListaDisciplinas();
  renderCursos();
}

// ======== EXCLUIR DISCIPLINA ========
function confirmarExclusao(index) {
  indexParaExcluir = index;
  modalConfirmacao.style.display = "flex";
}

if (btnConfirmSim) {
  btnConfirmSim.addEventListener("click", async () => {
    if (cursoAtual && typeof indexParaExcluir === "number") {
      cursoAtual.disciplinas.splice(indexParaExcluir, 1);
      const idx = cursos.findIndex(c => String(c.id) === String(cursoAtual.id));
      if (idx !== -1) {
        cursos[idx] = cursoAtual;
        await salvarCursos(cursos);
      }
      atualizarListaDisciplinas();
      renderCursos();
      mostrarSucesso("Disciplina excluída com sucesso!");
    }
    modalConfirmacao.style.display = "none";
    indexParaExcluir = null;
  });
}

if (btnConfirmNao) {
  btnConfirmNao.addEventListener("click", () => {
    modalConfirmacao.style.display = "none";
    indexParaExcluir = null;
  });
}

// ======== EXCLUIR CURSO ========
function confirmarExclusaoCurso(id) {
  cursoAtual = cursos.find(c => String(c.id) === String(id));
  if (!cursoAtual) return;

  modalConfirmacao.style.display = "flex";

  btnConfirmSim.onclick = async () => {
    await excluirCursoPorId(id);
    modalConfirmacao.style.display = "none";
    mostrarSucesso("Curso excluído com sucesso!");
  };

  btnConfirmNao.onclick = () => {
    modalConfirmacao.style.display = "none";
  };
}

async function excluirCursoPorId(id) {
  cursos = cursos.filter(c => String(c.id) !== String(id));
  // tenta deletar no servidor; se falhar salva local
  try {
    await apiDeleteCurso(id);
    salvarCursosLocal(cursos);
  } catch (e) {
    console.warn('excluirCursoPorId: erro API, salvando local', e);
    salvarCursosLocal(cursos);
  }
  renderCursos();
}

// ======== INICIALIZAÇÃO ========
(async function init() {
  cursos = await carregarCursos();
  renderCursos();
})();

// ============== POPUP DE SUCESSO ==============
function mostrarSucesso(texto = "Operação realizada com sucesso!") {
  const overlay = document.createElement("div");
  overlay.className = "overlay-sucesso";
  overlay.style.transition = "opacity 1s";

  overlay.innerHTML = `
    <div class="caixa-sucesso">
        <img src="../images/icone_NotaDez.png" class="icone-sucesso">
        <p>${texto}</p>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 2000);
}
