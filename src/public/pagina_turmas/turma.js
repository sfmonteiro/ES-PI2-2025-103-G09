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

const checkboxes = document.querySelectorAll('.lista-disciplinas input[type="checkbox"]');
const labelDisciplina = document.querySelector('label[for="discTurma"]');
const listaDisciplinas = document.querySelector('.lista-disciplinas');

function atualizarEstilos() {
  const algumMarcado = Array.from(checkboxes).some(chk => chk.checked);
  if (algumMarcado) {
    labelDisciplina.style.color = '#25e4d1'; // azul Tiffany
    listaDisciplinas.style.borderColor = '#25e4d1'; // borda azul Tiffany
  } else {
    labelDisciplina.style.color = ''; // volta ao padrão
    listaDisciplinas.style.borderColor = ''; // volta ao padrão
  }
}

checkboxes.forEach(chk => {
  chk.addEventListener('change', atualizarEstilos);
});

atualizarEstilos();

const containerTurmas = document.querySelector('.container-turmas');
const modalTurma = document.getElementById('modal-turma');
const btnConfirmarCadastroTurma = modalTurma.querySelector('#confirmar-cadastro-turma');

// CARREGAR TURMAS DO LOCALSTORAGE
let turmas = JSON.parse(localStorage.getItem('turmas')) || [];
let turmaEditando = null; // vai guardar a turma que está sendo editada

function salvarTurmasLocalStorage() {
  localStorage.setItem('turmas', JSON.stringify(turmas));
}

function criarCardTurma(turma) {
  const card = document.createElement('div');
  card.classList.add('card-turma');
  card.innerHTML = `
  <h3>${turma.nome}</h3>
  <p><strong>Código:</strong> ${turma.codigo}</p>
  <p><strong>Período:</strong> ${turma.periodo}</p>
  <p><strong>Curso:</strong> ${turma.curso}</p>
  <div><strong>Disciplinas:</strong></div>
  <div>
    ${turma.disciplinas.map(d => `<div>• ${d}</div>`).join('')}
  </div>

  <div class="botoes-card">
    <button class="btn-card adicionar">Alunos</button>
    <button class="btn-card editar">Editar</button>
    <button class="btn-card excluir">Excluir</button>
  </div>
`;

  const btnAdicionar = card.querySelector('.adicionar');

  // ### ADICIONADO: variavel global para turma selecionada
  btnAdicionar.addEventListener('click', () => {
    turmaSelecionada = turma; // guarda turma clicada na variável global
    modalAluno.style.display = 'flex'; // abre o modal de alunos
    atualizarListaAlunos(); // atualiza lista de alunos da turma selecionada
  });

  const btnEditar = card.querySelector('.editar');
  const btnExcluir = card.querySelector('.excluir');

  btnEditar.addEventListener('click', () => {
    turmaEditando = turma; // marca a turma que está sendo editada
    abrirModalEdicao(turma);
  });

  btnExcluir.addEventListener('click', () => {
    if (confirm(`Tem certeza que deseja excluir a turma "${turma.nome}"?`)) {
      turmas = turmas.filter(t => t.codigo !== turma.codigo);
      salvarTurmasLocalStorage(); // salvar alterações no localStorage
      atualizarListaTurmas();
    }
  });

  return card;
}

function abrirModalEdicao(turma) {
  // Preenche os campos da modal
  document.getElementById('codTurma').value = turma.codigo;
  document.getElementById('nomeTurma').value = turma.nome;
  document.getElementById('periodTurma').value = turma.periodo;
  document.getElementById('cursoTurma').value = turma.curso;

  // marca as disciplinas que já estavam selecionadas
  const checkboxes = document.querySelectorAll('.lista-disciplinas input[type="checkbox"]');
  checkboxes.forEach(chk => {
    chk.checked = turma.disciplinas.includes(chk.parentElement.textContent.trim());
  });

  // abre o modal
  modalTurma.style.display = 'flex';
}

function atualizarListaTurmas() {
  containerTurmas.innerHTML = ''; // limpa o conteúdo

  if (turmas.length === 0) {
    containerTurmas.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUMA TURMA CADASTRADA AINDA...</p>
        <img src="../images/imagem_alunos.png" alt="Nenhum lançamento realizado ainda." class="img-nada-cadastrado">
      </div>
    `;
    return;
  }

  turmas.forEach(turma => {
    const card = criarCardTurma(turma);
    containerTurmas.appendChild(card);
  });
}

btnConfirmarCadastroTurma.addEventListener('click', () => {
  const codigo = document.getElementById('codTurma').value.trim();
  const nome = document.getElementById('nomeTurma').value.trim();
  const periodo = document.getElementById('periodTurma').value.trim();
  const curso = document.getElementById('cursoTurma').value;

  const checkboxElements = document.querySelectorAll('.lista-disciplinas input[type="checkbox"]:checked');
  const disciplinas = Array.from(checkboxElements).map(chk => chk.parentElement.textContent.trim());

  if (!codigo || !nome || !curso) {
    alert('Preencha os campos obrigatórios: Código, Nome e Curso.');
    return;
  }

  if (turmaEditando) {
    // 🟡 modo edição
    turmaEditando.codigo = codigo;
    turmaEditando.nome = nome;
    turmaEditando.periodo = periodo;
    turmaEditando.curso = curso;
    turmaEditando.disciplinas = disciplinas;
    turmaEditando = null;
  } else {
    // 🟢 novo cadastro
    const novaTurma = { codigo, nome, periodo, curso, disciplinas, alunos: [] }; // alunos inicia vazio
    turmas.push(novaTurma);
  }

  salvarTurmasLocalStorage(); // salva localStorage
  atualizarListaTurmas();
  modalTurma.style.display = 'none';

  // limpar formulário
  document.getElementById('codTurma').value = '';
  document.getElementById('nomeTurma').value = '';
  document.getElementById('periodTurma').value = '';
  document.getElementById('cursoTurma').value = '';
  document.querySelectorAll('.lista-disciplinas input[type="checkbox"]').forEach(chk => chk.checked = false);
});

// Chama atualização da lista ao carregar a página
atualizarListaTurmas();

// Esconde cards vazios
const cards = document.querySelectorAll('.card-turma');
cards.forEach(card => {
  if (card.textContent.trim() === '') {
    card.style.display = 'none';
  }
});


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