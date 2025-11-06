// ======== MENU DO USUÁRIO ========
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

userBtn.addEventListener('click', () => userMenu.classList.toggle('open'));
document.addEventListener('click', e => {
  if (!userMenu.contains(e.target) && e.target !== userBtn) {
    userMenu.classList.remove('open');
  }
});

// ======== MODAIS ========
const modalCurso = document.getElementById("modalCurso");
const modalDisciplina = document.getElementById("modalDisciplina");

document.getElementById("cadastro-curso").onclick = () => modalCurso.style.display = "flex";
document.getElementById("closeModalCurso").onclick = () => modalCurso.style.display = "none";
document.getElementById("closeModalDisciplina").onclick = () => modalDisciplina.style.display = "none";

window.onclick = e => {
  if (e.target === modalCurso) modalCurso.style.display = "none";
  if (e.target === modalDisciplina) modalDisciplina.style.display = "none";
};

// ======== LISTA DE CURSOS ========
const listaCursos = document.getElementById("lista-cursos");
let cursos = [];

// ======== SALVAR CURSO ========
document.getElementById("salvarCurso").onclick = () => {
  const codigo = document.getElementById("codigoCurso").value.trim();
  const nome = document.getElementById("nomeCurso").value.trim();
  const turmas = document.getElementById("qtdTurmas").value.trim();
  const alunos = document.getElementById("qtdAlunos").value.trim();

  if (!codigo || !nome) return alert("Preencha código e nome do curso!");

  const curso = { codigo, nome, turmas, alunos, disciplinas: [] };
  cursos.push(curso);
  criarCard(curso);
  modalCurso.style.display = "none";
  document.querySelectorAll("#modalCurso input").forEach(i => i.value = "");
};

// ======== CRIAR CARD DE CURSO ========
function criarCard(curso) {
  const card = document.createElement("div");
  card.classList.add("curso-card");
  card.innerHTML = `
    <h3>${curso.nome.toUpperCase()}</h3>
    <p><b>Código:</b> ${curso.codigo}</p>
    <p>👥 Turmas: ${curso.turmas || "0"}</p>
    <p>🎓 Alunos: ${curso.alunos || "0"}</p>
    <p>📘 Disciplinas: ${curso.disciplinas.length}</p>
  `;
  listaCursos.appendChild(card);

  // Abrir modal de disciplinas ao clicar no card
  card.onclick = () => abrirModalDisciplina(curso);
}

// ======== MODAL DISCIPLINA ========
const listaDisciplinas = document.getElementById("listaDisciplinas");
let cursoAtual = null;

function abrirModalDisciplina(curso) {
  cursoAtual = curso;
  modalDisciplina.style.display = "flex";
  atualizarListaDisciplinas();
}

function atualizarListaDisciplinas() {
  listaDisciplinas.innerHTML = "";
  cursoAtual.disciplinas.forEach(d => {
    const div = document.createElement("div");
    div.textContent = `${d.codigo} - ${d.nome}`;
    listaDisciplinas.appendChild(div);
  });
}

document.getElementById("adicionarDisciplina").onclick = () => {
  const nome = document.getElementById("nomeDisciplina").value.trim();
  const codigo = document.getElementById("codigoDisciplina").value.trim();
  if (!nome || !codigo) return alert("Preencha nome e código!");
  cursoAtual.disciplinas.push({ nome, codigo });
  atualizarListaDisciplinas();
  document.getElementById("nomeDisciplina").value = "";
  document.getElementById("codigoDisciplina").value = "";
};

// ======== REDIRECIONAMENTO DO MENU ========
function redirecionar(botaoId, destino) {
  const botao = document.getElementById(botaoId);
  if (botao) {
    botao.addEventListener("click", () => {
      window.location.href = destino;
    });
  }
}

// Mapeamento das páginas
redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("cursos", "../Cursos/cursos.html");
redirecionar("turmas",);
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");

// ======== DESTACAR PÁGINA ATUAL ========
const paginaAtual = "cursos";
const botaoAtivo = document.getElementById(paginaAtual);
if (botaoAtivo) botaoAtivo.classList.add("active");
