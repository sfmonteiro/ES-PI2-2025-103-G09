// ======== cursos.js (completo e corrigido) ========

// ======== HELPERS / STORAGE ========
const STORAGE_KEY = "minhaApp_cursos_v1";

function carregarCursos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao carregar cursos do storage:", e);
    return [];
  }
}

function salvarCursos(cursos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cursos));
  } catch (e) {
    console.error("Erro ao salvar cursos no storage:", e);
  }
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ======== ELEMENTS ========
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

const modalCurso = document.getElementById("modalCurso");
const modalDisciplina = document.getElementById("modalDisciplina");
const modalConfirmacao = document.getElementById("modalConfirmacao");

const btnCadastroCurso = document.getElementById("cadastro-curso");
const btnCloseModalCurso = document.getElementById("closeModalCurso");
const btnCloseModalDisciplina = document.getElementById("closeModalDisciplina");

const inputCodigoCurso = document.getElementById("codigoCurso");
const inputNomeCurso = document.getElementById("nomeCurso");
const inputQtdTurmas = document.getElementById("qtdTurmas");
const inputQtdAlunos = document.getElementById("qtdAlunos");
const btnSalvarCurso = document.getElementById("salvarCurso");

const btnDisciplina = document.getElementById("btnDisciplina");
const inputNomeDisciplina = document.getElementById("nomeDisciplina");
const inputCodigoDisciplina = document.getElementById("codigoDisciplina");
const btnAdicionarDisciplina = document.getElementById("adicionarDisciplina");

const listaCursosEl = document.getElementById("lista-cursos");
const listaDisciplinasEl = document.getElementById("listaDisciplinas");

const btnConfirmSim = document.getElementById("confirmarSim");
const btnConfirmNao = document.getElementById("confirmarNao");

if (!listaCursosEl) console.warn("Elemento #lista-cursos não encontrado no DOM.");

// ======== APP STATE ========
let cursos = carregarCursos(); // array de cursos
let cursoAtual = null;         // curso selecionado na modal disciplina
let indexParaExcluir = null;   // usado para confirmar exclusão

// ======== MENU DO USUÁRIO ========
if (userBtn && userMenu) {
  userBtn.addEventListener('click', () => userMenu.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!userMenu.contains(e.target) && e.target !== userBtn) {
      userMenu.classList.remove('open');
    }
  });
}

// ======== MODAIS (abrir/fechar) ========
if (btnCadastroCurso) btnCadastroCurso.onclick = () => {
  // limpar campos e abrir modal de curso
  if (inputCodigoCurso) inputCodigoCurso.value = "";
  if (inputNomeCurso) inputNomeCurso.value = "";
  if (inputQtdTurmas) inputQtdTurmas.value = "";
  if (inputQtdAlunos) inputQtdAlunos.value = "";
  modalCurso.style.display = "flex";
};

if (btnCloseModalCurso) btnCloseModalCurso.onclick = () => modalCurso.style.display = "none";
if (btnCloseModalDisciplina) btnCloseModalDisciplina.onclick = () => modalDisciplina.style.display = "none";

window.addEventListener("click", e => {
  if (e.target === modalCurso) modalCurso.style.display = "none";
  if (e.target === modalDisciplina) modalDisciplina.style.display = "none";
  if (e.target === modalConfirmacao) modalConfirmacao.style.display = "none";
});

// ======== REDIRECIONAMENTO (seguro) ========
function redirecionar(botaoId, destino) {
  const botao = document.getElementById(botaoId);
  if (botao) botao.addEventListener("click", () => window.location.href = destino);
}

// ======== RENDER INICIAL ========
function limparListaCursosDOM() {
  if (!listaCursosEl) return;
  listaCursosEl.innerHTML = "";
}

function criarCardDOM(curso) {
  const card = document.createElement("div");
  card.className = "curso-card";
  card.dataset.id = curso.id;
  card.innerHTML = `
    <h3>${curso.nome.toUpperCase()}</h3>
    <p><b>Código:</b> ${curso.codigo}</p>
    <p>📘 Disciplinas: <span class="count-disciplinas">${(curso.disciplinas || []).length}</span></p>
  `;
  // abrir modal de disciplinas ao clicar no card
  card.addEventListener("click", () => abrirModalDisciplina(curso.id));
  listaCursosEl.appendChild(card);
}

function renderCursos() {
  limparListaCursosDOM();
  cursos.forEach(cr => criarCardDOM(cr));
}

// ======== CARREGAR/GRAVAR CURSO ========
if (btnSalvarCurso) {
  btnSalvarCurso.onclick = () => {
    const codigo = inputCodigoCurso ? inputCodigoCurso.value.trim() : "";
    const nome = inputNomeCurso ? inputNomeCurso.value.trim() : "";
    const turmas = inputQtdTurmas ? inputQtdTurmas.value.trim() : "";
    const alunos = inputQtdAlunos ? inputQtdAlunos.value.trim() : "";

    if (!codigo || !nome) {
      return alert("Preencha código e nome do curso!");
    }

    // criar objeto curso com id único
    const curso = {
      id: gerarId(),
      codigo,
      nome,
      turmas: turmas || "0",
      alunos: alunos || "0",
      disciplinas: []
    };

    cursos.push(curso);
    salvarCursos(cursos);
    criarCardDOM(curso);

    // fechar modal e limpar campos
    modalCurso.style.display = "none";
    if (inputCodigoCurso) inputCodigoCurso.value = "";
    if (inputNomeCurso) inputNomeCurso.value = "";
    if (inputQtdTurmas) inputQtdTurmas.value = "";
    if (inputQtdAlunos) inputQtdAlunos.value = "";
  };
}

// ======== ABRIR MODAL DISCIPLINA (por id) ========
function abrirModalDisciplina(cursoId) {
  const curso = cursos.find(c => c.id === cursoId);
  if (!curso) {
    alert("Curso não encontrado.");
    return;
  }
  cursoAtual = curso;
  atualizarListaDisciplinas();
  modalDisciplina.style.display = "flex";
}

// ======== ATUALIZAR LISTA DE DISCIPLINAS NA MODAL ========
function atualizarListaDisciplinas() {
  if (!listaDisciplinasEl) return;
  listaDisciplinasEl.innerHTML = "";

  if (!cursoAtual) {
    listaDisciplinasEl.innerHTML = "<div class='sem-disciplinas'>Nenhum curso selecionado</div>";
    return;
  }

  const arr = cursoAtual.disciplinas || [];
  if (arr.length === 0) {
    listaDisciplinasEl.innerHTML = "<div class='sem-disciplinas'>Nenhuma disciplina adicionada</div>";
    atualizarContadorNoCard(cursoAtual.id);
    return;
  }

  arr.forEach((d, idx) => {
    const item = document.createElement("div");
    item.className = "disc-item";
    item.innerHTML = `
      <span>${d.codigo} - ${d.nome}</span>
      <div class="disc-buttons">
        <button class="btn-edit" data-idx="${idx}">Editar</button>
        <button class="btn-del" data-idx="${idx}">Excluir</button>
      </div>
    `;
    // listeners
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

  atualizarContadorNoCard(cursoAtual.id);
}

// atualiza o contador de disciplinas no card do curso
function atualizarContadorNoCard(cursoId) {
  const card = listaCursosEl.querySelector(`.curso-card[data-id="${cursoId}"]`);
  if (!card) return;
  const span = card.querySelector(".count-disciplinas");
  if (!span) return;
  const curso = cursos.find(c => c.id === cursoId);
  span.textContent = (curso && curso.disciplinas) ? curso.disciplinas.length : 0;
}

// ======== BOTÃO "DISCIPLINA" DENTRO DO MODAL CURSO ========
if (btnDisciplina) {
  btnDisciplina.addEventListener("click", () => {
    // se cursoAtual não estiver setado, pedimos para salvar o curso primeiro
    if (!cursoAtual) {
      alert("Para adicionar disciplinas, selecione um curso existente (clique no card) ou salve o curso antes.");
      return;
    }
    modalDisciplina.style.display = "flex";
    atualizarListaDisciplinas();
  });
}

// ======== ADICIONAR DISCIPLINA ========
if (btnAdicionarDisciplina) {
  btnAdicionarDisciplina.addEventListener("click", () => {
    if (!cursoAtual) return alert("Nenhum curso selecionado para adicionar disciplina.");
    const nome = inputNomeDisciplina ? inputNomeDisciplina.value.trim() : "";
    const codigo = inputCodigoDisciplina ? inputCodigoDisciplina.value.trim() : "";

    if (!nome || !codigo) return alert("Preencha nome e código da disciplina!");

    if (!Array.isArray(cursoAtual.disciplinas)) cursoAtual.disciplinas = [];

    cursoAtual.disciplinas.push({ nome, codigo });
    // salvar no storage (importante)
    const idx = cursos.findIndex(c => c.id === cursoAtual.id);
    if (idx !== -1) {
      cursos[idx] = cursoAtual;
      salvarCursos(cursos);
    }

    atualizarListaDisciplinas();
    if (inputNomeDisciplina) inputNomeDisciplina.value = "";
    if (inputCodigoDisciplina) inputCodigoDisciplina.value = "";
  });
}

// ======== EDITAR DISCIPLINA ========
function editarDisciplina(index) {
  if (!cursoAtual) return;
  const disc = cursoAtual.disciplinas[index];
  if (!disc) return;
  // preenche inputs para edição e remove item antigo (workflow simples)
  if (inputNomeDisciplina) inputNomeDisciplina.value = disc.nome;
  if (inputCodigoDisciplina) inputCodigoDisciplina.value = disc.codigo;
  cursoAtual.disciplinas.splice(index, 1);
  // salva mudança e atualiza UI
  const idx = cursos.findIndex(c => c.id === cursoAtual.id);
  if (idx !== -1) {
    cursos[idx] = cursoAtual;
    salvarCursos(cursos);
  }
  atualizarListaDisciplinas();
}

// ======== EXCLUIR DISCIPLINA (com modal de confirmação) ========
function confirmarExclusao(index) {
  indexParaExcluir = index;
  modalConfirmacao.style.display = "flex";
}

if (btnConfirmSim) {
  btnConfirmSim.addEventListener("click", () => {
    if (cursoAtual && typeof indexParaExcluir === "number") {
      cursoAtual.disciplinas.splice(indexParaExcluir, 1);
      const idx = cursos.findIndex(c => c.id === cursoAtual.id);
      if (idx !== -1) {
        cursos[idx] = cursoAtual;
        salvarCursos(cursos);
      }
      atualizarListaDisciplinas();
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

// ======== EXCLUIR CURSO (opcional) - exemplo de utilidade futura ========
function excluirCursoPorId(id) {
  cursos = cursos.filter(c => c.id !== id);
  salvarCursos(cursos);
  renderCursos();
}

// ======== DESTACAR PÁGINA ATUAL ========
const paginaAtual = "cursos";
const botaoAtivo = document.getElementById(paginaAtual);
if (botaoAtivo) botaoAtivo.classList.add("active");

// ======== INICIALIZAÇÃO ========
renderCursos();
// ======== REDIRECIONAMENTO  ========
redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("turmas", "../pagina_turmas/turma.html");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");