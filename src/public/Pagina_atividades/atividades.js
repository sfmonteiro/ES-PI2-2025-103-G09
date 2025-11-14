const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

userBtn.addEventListener('click', () => {
    userMenu.classList.toggle('open');
});

//FECHAR SE CLICAR FORA

document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('open');
    }
});

function redirecionar(id, destino) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.addEventListener('click', (e) => {
            e.preventDefault(); // impede recarregar a página com o #
            window.location.href = destino;
        });
    }
}


//======================CONFIGURAÇÃO DA JANELA MODAL GERAL==============================================================

function configurarModal(botaoId, modalId) {
  const modal = document.getElementById(modalId);
  const btnAbrir = document.getElementById(botaoId);
  const btnFechar = modal.querySelector(".fechar");

  // Abrir modal
  btnAbrir.onclick = () => {
    modal.style.display = "flex";
  };

  // Fechar modal (clicando no X)
  btnFechar.onclick = () => {
    modal.style.display = "none";
  };

  // Fechar clicando fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// ======== CONFIGURAR AS DUAS MODAIS ========
configurarModal("cadastro-comp", "modal-comp");



//======================ABRIR MODAL PARA CADASTRO DE COMPONENTES DE NOTA ================================================

// ==============================
// SISTEMA DE COMPONENTES (ATIVIDADES)
// Compatível com seu modelo real
// ==============================

// Carregar cursos existentes
const cursos = JSON.parse(localStorage.getItem("cursos")) || [];

// Carregar componentes existente
let componentes = JSON.parse(localStorage.getItem("componentes")) || [];

// ELEMENTOS DO MODAL
const modalComp = document.getElementById("modal-comp");
const btnSalvarComp = document.getElementById("confirmar-cadastro-comp");

const selectCurso = document.getElementById("cursoComp");
const selectDisciplina = document.getElementById("cursoDisc");

const inputNome = document.getElementById("nomeComp");
const inputSigla = document.getElementById("siglaComp");
const inputDescricao = document.getElementById("descricaoComp");

// Controle do modo edição
let componenteEditando = null;


// ====================================================
// 1) CARREGAR LISTA DE CURSOS NO SELECT
// ====================================================
function carregarCursosNoSelect() {
  selectCurso.innerHTML = '<option value="">SELECIONE UM CURSO</option>';

  cursos.forEach(curso => {
    const opt = document.createElement("option");
    opt.value = curso.id; // usa o ID real do curso
    opt.textContent = curso.nome;
    selectCurso.appendChild(opt);
  });
}

carregarCursosNoSelect();


// ====================================================
// 2) DISCIPLINA COMEÇA DESABILITADA
// ====================================================
selectDisciplina.disabled = true;
selectDisciplina.innerHTML = '<option value="">SELECIONE UM CURSO PRIMEIRO</option>';


// ====================================================
// 3) QUANDO ESCOLHER CURSO → CARREGAR DISCIPLINAS
// ====================================================
selectCurso.addEventListener("change", () => {
  const cursoId = selectCurso.value;
  const curso = cursos.find(c => c.id === cursoId);

  if (!curso) {
    selectDisciplina.disabled = true;
    selectDisciplina.innerHTML =
      '<option value="">SELECIONE UM CURSO PRIMEIRO</option>';
    return;
  }

  carregarDisciplinasDoCurso(curso);
});

function carregarDisciplinasDoCurso(curso) {
  selectDisciplina.disabled = false;
  selectDisciplina.innerHTML = '<option value="">SELECIONE UMA DISCIPLINA</option>';

  if (!curso.disciplinas || curso.disciplinas.length === 0) {
    selectDisciplina.disabled = true;
    selectDisciplina.innerHTML = '<option value="">NENHUMA DISCIPLINA CADASTRADA</option>';
    return;
  }

  curso.disciplinas.forEach(disc => {
    const opt = document.createElement("option");
    opt.value = disc.nome; // nome funciona como identificador
    opt.textContent = `${disc.nome} (${disc.codigo})`;
    selectDisciplina.appendChild(opt);
  });
}


// ====================================================
// 4) SALVAR COMPONENTE (CADASTRO + EDIÇÃO)
// ====================================================
btnSalvarComp.addEventListener("click", () => {
  const cursoId = selectCurso.value;
  const disciplinaSelecionada = selectDisciplina.value;
  const nome = inputNome.value.trim();
  const sigla = inputSigla.value.trim();
  const descricao = inputDescricao.value.trim();

  if (!cursoId || !disciplinaSelecionada || !nome || !sigla) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const curso = cursos.find(c => c.id === cursoId);
  if (!curso) {
    alert("Curso inválido.");
    return;
  }

  if (componenteEditando) {
    // ======= MODO EDIÇÃO =======
    componenteEditando.cursoId = cursoId;
    componenteEditando.cursoNome = curso.nome;
    componenteEditando.disciplinaNome = disciplinaSelecionada;
    componenteEditando.nome = nome;
    componenteEditando.sigla = sigla;
    componenteEditando.descricao = descricao;

    componenteEditando = null;
    btnSalvarComp.textContent = "CADASTRAR";

  } else {
    // ======= MODO CADASTRO =======
    const novo = {
      id: Date.now(),
      cursoId,
      cursoNome: curso.nome,
      disciplinaNome: disciplinaSelecionada,
      nome,
      sigla,
      descricao
    };

    componentes.push(novo);
  }

    // Salvar no localStorage
    localStorage.setItem("componentes", JSON.stringify(componentes));

    // ATUALIZAR LISTA IMEDIATAMENTE
    atualizarListaComponentes();

    // fechar modal
    fecharModalComp();

    alert("Componente salvo com sucesso!");

    });


// ====================================================
// 5) FUNÇÃO PARA ABRIR O MODAL EM MODO EDIÇÃO
// ====================================================
function editarComponente(componente) {
  componenteEditando = componente;

  // abrir modal
  modalComp.style.display = "flex";
  btnSalvarComp.textContent = "SALVAR";

  // preencher campos
  selectCurso.value = componente.cursoId;

  const curso = cursos.find(c => c.id === componente.cursoId);
  carregarDisciplinasDoCurso(curso);

  setTimeout(() => {
    selectDisciplina.value = componente.disciplinaNome;
  }, 60);

  inputNome.value = componente.nome;
  inputSigla.value = componente.sigla;
  inputDescricao.value = componente.descricao;
}


// ====================================================
// 6) FECHAR MODAL E LIMPAR CAMPOS
// ====================================================
function fecharModalComp() {
  modalComp.style.display = "none";

  selectCurso.value = "";
  selectDisciplina.disabled = true;
  selectDisciplina.innerHTML = '<option value="">SELECIONE UM CURSO PRIMEIRO</option>';

  inputNome.value = "";
  inputSigla.value = "";
  inputDescricao.value = "";
}


// Fecha clicando fora
window.addEventListener("click", (e) => {
  if (e.target === modalComp) fecharModalComp();
});


//==========================CARDS================================================================================

// ===============================
// 7) CRIAR CARD DO COMPONENTE
// ===============================
function criarCardComponente(comp) {
  const card = document.createElement("div");
  card.classList.add("card-comp");

  card.innerHTML = `
    <h3>${comp.nome}</h3>
    <p><strong>Curso:</strong> ${comp.cursoNome}</p>
    <p><strong>Disciplina:</strong><br>• ${comp.disciplinaNome}</p>
    <p><strong>Sigla:</strong> ${comp.sigla}</p>

    <div class="botoes-card">
      <button class="btn-card editar">Editar</button>
      <button class="btn-card excluir">Excluir</button>
    </div>
  `;

  // EDITAR
  card.querySelector(".editar").addEventListener("click", () => {
    editarComponente(comp); // já existe no seu código ✔
  });

  // EXCLUIR
  card.querySelector(".excluir").addEventListener("click", () => {
    if (confirm(`Deseja excluir o componente "${comp.nome}"?`)) {
      componentes = componentes.filter(c => c.id !== comp.id);
      localStorage.setItem("componentes", JSON.stringify(componentes));
      atualizarListaComponentes();
    }
  });

  return card;
}


// ===============================
// 8) RENDERIZAR LISTA DE CARDS
// ===============================
function atualizarListaComponentes() {
  const container = document.querySelector(".container-atividades");

  container.innerHTML = "";

  if (componentes.length === 0) {
    container.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUMA ATIVIDADE CADASTRADA AINDA...</p>
        <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
      </div>
    `;
    return;
  }

  componentes.forEach(comp => {
    container.appendChild(criarCardComponente(comp));
  });
}


// ===============================
// 9) CHAMAR NA INICIALIZAÇÃO
// ===============================
atualizarListaComponentes();

//==================ALERTA=======================================================================================

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  toast.textContent = texto;

  toast.classList.add("mostrar");

  // remove depois de 5 segundos
  setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 5000);
}


//===============================================================================================================

redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("disciplinas", "");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");
redirecionar("trocar-inst", "../Instituição_cadastro/instituição.html");