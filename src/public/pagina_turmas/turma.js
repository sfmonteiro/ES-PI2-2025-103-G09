const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

userBtn.addEventListener('click', () => {
    userMenu.classList.toggle('open');
});

// FECHAR SE CLICAR FORA
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

////////////////////////////////////////////////JANELA MODAL /////////////////////////////////////////////

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
configurarModal("cadastro-turma", "modal-turma");
configurarModal("cadastro-turma", "modal-turma");





//========================modal cadastro - disciplinas===================

// ==================== ELEMENTOS PRINCIPAIS =====================

const containerTurmas = document.querySelector('.container-turmas');
const modalTurma = document.getElementById('modal-turma');
const btnConfirmarCadastroTurma = modalTurma.querySelector('#confirmar-cadastro-turma');

// selects
const selectCurso = document.getElementById("cursoTurma");
const selectDisciplina = document.getElementById("disciplinaTurma");

// disciplinas começam bloqueadas
selectDisciplina.disabled = true;
selectDisciplina.innerHTML = '<option value="">SELECIONE UM CURSO PRIMEIRO</option>';


// ==================== LOCALSTORAGE =====================

let turmas = JSON.parse(localStorage.getItem('turmas')) || [];
let turmaEditando = null;

function salvarTurmasLocalStorage() {
  localStorage.setItem('turmas', JSON.stringify(turmas));
}


// ==================== FUNÇÃO PARA CARREGAR DISCIPLINAS POR CURSO =====================

function carregarDisciplinasDoCurso(cursoNome) {
  const disciplinas = JSON.parse(localStorage.getItem("disciplinas")) || [];

  const filtradas = disciplinas.filter(d => d.curso === cursoNome);

  if (filtradas.length === 0) {
    selectDisciplina.disabled = true;
    selectDisciplina.innerHTML = '<option value="">NENHUMA DISCIPLINA CADASTRADA</option>';
    return;
  }

  selectDisciplina.disabled = false;
  selectDisciplina.innerHTML = '<option value="">SELECIONE UMA DISCIPLINA</option>';

  filtradas.forEach(d => {
    const option = document.createElement("option");
    option.value = d.nome;
    option.textContent = `${d.nome} (${d.sigla})`;
    selectDisciplina.appendChild(option);
  });
}




// ==================== EVENTO AO ESCOLHER CURSO =====================

selectCurso.addEventListener("change", () => {
  const cursoSelecionado = selectCurso.value;

  if (!cursoSelecionado) {
    selectDisciplina.disabled = true;
    selectDisciplina.innerHTML = '<option value="">SELECIONE UM CURSO PRIMEIRO</option>';
    return;
  }

  carregarDisciplinasDoCurso(cursoSelecionado);
});


// ==================== CRIAR CARD =====================

function criarCardTurma(turma) {
  const card = document.createElement('div');
  card.classList.add('card-turma');
  card.innerHTML = `
    <h3>${turma.nome}</h3>
    <p><strong>Código:</strong> ${turma.codigo}</p>
    <p><strong>Período:</strong> ${turma.periodo}</p>
    <p><strong>Curso:</strong> ${turma.curso}</p>
    <p><strong>Disciplina:</strong> ${turma.disciplina}</p>

    <div class="botoes-card">
      <button class="btn-card adicionar">Alunos</button>
      <button class="btn-card editar">Editar</button>
      <button class="btn-card excluir">Excluir</button>
    </div>
  `;

  // abrir alunos
  const btnAdicionar = card.querySelector('.adicionar');
  btnAdicionar.addEventListener('click', () => {
    turmaSelecionada = turma;
    modalAluno.style.display = 'flex';
    atualizarListaAlunos();
  });

  // editar
  const btnEditar = card.querySelector('.editar');
  btnEditar.addEventListener('click', () => {
    turmaEditando = turma;
    abrirModalEdicao(turma);
  });

  // excluir
  const btnExcluir = card.querySelector('.excluir');
  btnExcluir.addEventListener('click', () => {
    if (confirm(`Tem certeza que deseja excluir a turma "${turma.nome}"?`)) {
      turmas = turmas.filter(t => t.codigo !== turma.codigo);
      salvarTurmasLocalStorage();
      atualizarListaTurmas();
    }
  });

  return card;
}


// ==================== ABRIR MODAL PARA EDITAR =====================

function abrirModalEdicao(turma) {
  document.getElementById('codTurma').value = turma.codigo;
  document.getElementById('nomeTurma').value = turma.nome;
  document.getElementById('periodTurma').value = turma.periodo;
  document.getElementById('cursoTurma').value = turma.curso;

  // recarregar disciplinas do curso
  carregarDisciplinasDoCurso(turma.curso);

  // selecionar a disciplina correta
  selectDisciplina.disabled = false;
  selectDisciplina.value = turma.disciplina;

  modalTurma.style.display = 'flex';
}


// ==================== LISTAR TURMAS =====================

function atualizarListaTurmas() {
  containerTurmas.innerHTML = '';

  if (turmas.length === 0) {
    containerTurmas.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUMA TURMA CADASTRADA AINDA...</p>
        <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
      </div>
    `;
    return;
  }

  turmas.forEach(turma => {
    containerTurmas.appendChild(criarCardTurma(turma));
  });
}


// ==================== SALVAR TURMA =====================

btnConfirmarCadastroTurma.addEventListener('click', () => {
  const codigo = document.getElementById('codTurma').value.trim();
  const nome = document.getElementById('nomeTurma').value.trim();
  const periodo = document.getElementById('periodTurma').value.trim();
  const curso = document.getElementById('cursoTurma').value;
  const disciplinaSelecionada = document.getElementById("disciplinaTurma").value;

  if (!codigo || !nome || !curso || !disciplinaSelecionada) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  if (turmaEditando) {
    turmaEditando.codigo = codigo;
    turmaEditando.nome = nome;
    turmaEditando.periodo = periodo;
    turmaEditando.curso = curso;
    turmaEditando.disciplina = disciplinaSelecionada;
    turmaEditando = null;
  } else {
    const novaTurma = {
      codigo,
      nome,
      periodo,
      curso,
      disciplina: disciplinaSelecionada,
      alunos: []
    };

    turmas.push(novaTurma);
  }

  salvarTurmasLocalStorage();
  atualizarListaTurmas();
  modalTurma.style.display = 'none';

  // limpar campos
  document.getElementById('codTurma').value = '';
  document.getElementById('nomeTurma').value = '';
  document.getElementById('periodTurma').value = '';
  document.getElementById('cursoTurma').value = '';

  selectDisciplina.disabled = true;
  selectDisciplina.innerHTML = '<option value="">SELECIONE UM CURSO PRIMEIRO</option>';
});


// ==================== INICIAR LISTA =====================

atualizarListaTurmas();



// ########################## LISTAGEM E CADASTRO DE ALUNOS ########################

// Elementos do formulário e tabela
const modalAluno = document.getElementById('modal-aluno');
const btnFecharAluno = document.getElementById('fecharModalAluno');
const btnConfirmarCadastroAluno = document.getElementById('confirmar-cadastro-aluno');
const raInput = document.getElementById('raAluno');
const nomeInput = document.getElementById('nomeAluno');
const tbodyAlunos = document.getElementById('corpo-lista-alunos');

// ### ADICIONADO: variável global para turma selecionada (declaração no topo do arquivo, aqui só reforço)
let turmaSelecionada = null;

let alunoEditandoIndex = null;

// Atualiza a tabela de alunos (só da turma selecionada)
function atualizarListaAlunos() {
  tbodyAlunos.innerHTML = '';

  if (!turmaSelecionada || !turmaSelecionada.alunos || turmaSelecionada.alunos.length === 0) {
    tbodyAlunos.innerHTML = `<tr><td colspan="3" style="text-align:center; font-style: italic;">Nenhum aluno cadastrado nesta turma.</td></tr>`;
    return;
  }

  turmaSelecionada.alunos.forEach((aluno, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${aluno.ra}</td>
      <td>${aluno.nome}</td>
      <td>
        <div class="botoes-acoes">
          <button class="editar" data-index="${index}">Editar</button>
          <button class="excluir" data-index="${index}">Excluir</button>
        </div>
      </td>
    `;
    tbodyAlunos.appendChild(tr);
  });

  // Eventos dos botões editar
  tbodyAlunos.querySelectorAll('button.editar').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      carregarAlunoParaEdicao(idx);
    });
  });

  // Eventos dos botões excluir
  tbodyAlunos.querySelectorAll('button.excluir').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = e.target.getAttribute('data-index');
      excluirAluno(idx);
    });
  });
}

// Carrega os dados do aluno para edição no formulário
function carregarAlunoParaEdicao(index) {
  const aluno = turmaSelecionada.alunos[index];
  raInput.value = aluno.ra;
  nomeInput.value = aluno.nome;
  alunoEditandoIndex = index;
  btnConfirmarCadastroAluno.textContent = 'SALVAR';
  modalAluno.style.display = 'flex'; // abre modal para editar
}

// Excluir aluno
function excluirAluno(index) {
  if (confirm('Deseja realmente excluir este aluno?')) {
    turmaSelecionada.alunos.splice(index, 1);
    salvarTurmasLocalStorage();  // salva alteração nas turmas
    atualizarListaAlunos();
    limparFormularioAluno();
  }
}

// Limpar formulário
function limparFormularioAluno() {
  raInput.value = '';
  nomeInput.value = '';
  alunoEditandoIndex = null;
  btnConfirmarCadastroAluno.textContent = 'CADASTRAR';
}

// Evento do botão cadastrar/salvar aluno
btnConfirmarCadastroAluno.addEventListener('click', () => {
  const ra = raInput.value.trim();
  const nome = nomeInput.value.trim();

  if (!ra || !nome) {
    alert('Preencha RA e Nome Completo!');
    return;
  }

  if (!turmaSelecionada.alunos) {
    turmaSelecionada.alunos = [];
  }

  // Verifica duplicidade de RA no cadastro novo da turma selecionada
  if (alunoEditandoIndex === null && turmaSelecionada.alunos.some(a => a.ra === ra)) {
    alert('RA já cadastrado nesta turma!');
    return;
  }

  if (alunoEditandoIndex !== null) {
    turmaSelecionada.alunos[alunoEditandoIndex].ra = ra;
    turmaSelecionada.alunos[alunoEditandoIndex].nome = nome;
  } else {
    turmaSelecionada.alunos.push({ ra, nome });
  }

  salvarTurmasLocalStorage(); // salva localStorage geral das turmas
  atualizarListaAlunos();
  limparFormularioAluno();

  // NÃO fecha modal aqui para facilitar cadastros sequenciais
  // modalAluno.style.display = 'none'; // removido para manter aberto
});

// Botão fechar modal alunos
btnFecharAluno.addEventListener('click', () => {
  modalAluno.style.display = 'none';
  limparFormularioAluno();
  turmaSelecionada = null; // limpa turma selecionada ao fechar modal
});

// Fecha modal clicando fora
window.addEventListener('click', (e) => {
  if (e.target === modalAluno) {
    modalAluno.style.display = 'none';
    limparFormularioAluno();
    turmaSelecionada = null; // limpa turma selecionada ao fechar modal
  }
});

// ** REMOVIDO **
// Não inicializar lista global de alunos, pois agora é por turma selecionada
// atualizarListaAlunos(); 






////////////////////////////////////////////////////////////////////////////////////////////////////

redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("turmas", "../pagina_turmas/turma.html");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");
redirecionar("trocar-inst", "../Instituição_cadastro/instituição.html");