// Bruno Lobo de Jesus RA:25019830

const STORAGE_KEY = "cursos";

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

const btnAdicionarDisciplina = document.getElementById("adicionarDisciplina");

const listaCursosEl = document.getElementById("lista-cursos");
const listaDisciplinasEl = document.getElementById("listaDisciplinas");

const btnConfirmSim = document.getElementById("confirmarSim");
const btnConfirmNao = document.getElementById("confirmarNao");

// ======== ESTADO ========
let cursos = carregarCursos();
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

// ======== MODAIS (abrir/fechar) ========
if (btnCloseModalCurso) btnCloseModalCurso.onclick = () => modalCurso.style.display = "none";
if (btnCloseModalDisciplina) btnCloseModalDisciplina.onclick = () => modalDisciplina.style.display = "none";

window.addEventListener("click", e => {
  if (e.target === modalCurso) modalCurso.style.display = "none";
  if (e.target === modalDisciplina) modalDisciplina.style.display = "none";
  if (e.target === modalConfirmacao) modalConfirmacao.style.display = "none";
});

// ======== REDIRECIONAMENTO ========
function redirecionar(botaoId, destino) {
  const botao = document.getElementById(botaoId);
  if (botao) botao.addEventListener("click", () => window.location.href = destino);
}

// ======== RENDERIZAÇÃO ========
function limparListaCursosDOM() {
  listaCursosEl.innerHTML = "";
}

function criarCardDOM(curso) {
  const card = document.createElement("div");
  card.className = "curso-card";
  card.dataset.id = curso.id;

  const disciplinasText = (curso.disciplinas && curso.disciplinas.length > 0)
    ? curso.disciplinas.map(d => `${d.codigo} - ${d.sigla}`).join(", ")
    : "Nenhuma disciplina cadastrada";

  card.innerHTML = `
    <div class="card-top">${curso.nome.toUpperCase()}</div>
    <div class="card-info">
      <p><b>Disciplinas:</b> ${disciplinasText}</p>
    </div>
    <div class="card-botoes">
      <button class="btn-alunos">Disciplinas</button>
      <button class="btn-editar">Editar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;

  card.querySelector(".btn-alunos").addEventListener("click", (e) => {
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

  if (cursos.length === 0) {
    listaCursosEl.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUM CURSO CADASTRADO AINDA...</p>
        <img src="../images/imagem_alunos.png" 
             alt="Nenhum curso cadastrado ainda." 
             class="img-nada-cadastrado">
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
  const curso = cursos.find(c => c.id === id);
  if (!curso) return alert("Curso não encontrado!");

  isEditing = true;
  editingCourseId = id;
  cursoAtual = curso;
  inputNomeCurso.value = curso.nome;
  modalCurso.style.display = "flex";
}

if (btnSalvarCurso) {
  btnSalvarCurso.addEventListener("click", () => {
    const nome = inputNomeCurso.value.trim();

    if (!nome) {
      alert("Preencha o nome do curso!");
      return;
    }

    if (isEditing && editingCourseId) {
      const idx = cursos.findIndex(c => c.id === editingCourseId);
      if (idx !== -1) {
        cursos[idx].nome = nome;
        salvarCursos(cursos);
        renderCursos();
      }
      modalCurso.style.display = "none";
      isEditing = false;
      editingCourseId = null;
      cursoAtual = null;
      return;
    }

    const novoCurso = {
      id: gerarId(),
      nome,
      disciplinas: [],
    };

    cursos.push(novoCurso);
    salvarCursos(cursos);
    renderCursos();
    modalCurso.style.display = "none";
  });
}

// ======== ABRIR MODAL DISCIPLINA ========
function abrirModalDisciplina(cursoId) {
  const curso = cursos.find(c => c.id === cursoId);
  if (!curso) return alert("Curso não encontrado.");
  cursoAtual = curso;
  atualizarListaDisciplinas();
  modalDisciplina.style.display = "flex";
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
      <span>${d.codigo} - ${d.nome} (${d.sigla})</span>
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
  btnAdicionarDisciplina.addEventListener("click", () => {
    if (!cursoAtual) return alert("Nenhum curso selecionado para adicionar disciplina.");

    const codigo = inputCodigoDisciplina.value.trim();
    const nome = inputNomeDisciplina.value.trim();
    const sigla = inputSiglaDisciplina.value.trim().toUpperCase();

    if (!codigo || !nome || !sigla)
      return alert("Preencha CÓDIGO, NOME e SIGLA!");

    if (!Array.isArray(cursoAtual.disciplinas))
      cursoAtual.disciplinas = [];

    cursoAtual.disciplinas.push({ codigo, nome, sigla });

    const idx = cursos.findIndex(c => c.id === cursoAtual.id);
    if (idx !== -1) {
      cursos[idx] = cursoAtual;
      salvarCursos(cursos);
    }

    atualizarListaDisciplinas();
    renderCursos();

    inputCodigoDisciplina.value = "";
    inputNomeDisciplina.value = "";
    inputSiglaDisciplina.value = "";
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

  cursoAtual.disciplinas.splice(index, 1);

  const idx = cursos.findIndex(c => c.id === cursoAtual.id);
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
  btnConfirmSim.addEventListener("click", () => {
    if (cursoAtual && typeof indexParaExcluir === "number") {
      cursoAtual.disciplinas.splice(indexParaExcluir, 1);
      const idx = cursos.findIndex(c => c.id === cursoAtual.id);
      if (idx !== -1) {
        cursos[idx] = cursoAtual;
        salvarCursos(cursos);
      }
      atualizarListaDisciplinas();
      renderCursos();
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
  cursoAtual = cursos.find(c => c.id === id);
  if (!cursoAtual) return;
  modalConfirmacao.style.display = "flex";
  btnConfirmSim.onclick = () => {
    excluirCursoPorId(id);
    modalConfirmacao.style.display = "none";
  };
  btnConfirmNao.onclick = () => {
    modalConfirmacao.style.display = "none";
  };
}

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

// ======== REDIRECIONAMENTO ========
redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("turmas", "../pagina_turmas/turma.html");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");
redirecionar("trocar-inst", "../Instituição_cadastro/instituição.html");
