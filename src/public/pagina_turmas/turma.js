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
configurarModal("cadastro-aluno", "modal-aluno");


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

let turmas = []; // vai armazenar as turmas cadastradas na sessão
let turmaEditando = null; // vai guardar a turma que está sendo editada

function criarCardTurma(turma) {
  const card = document.createElement('div');
  card.classList.add('card-turma');
  card.innerHTML = `
    <h3>${turma.nome}</h3>
    <p><strong>Código:</strong> ${turma.codigo}</p>
    <p><strong>Período:</strong> ${turma.periodo}</p>
    <p><strong>Curso:</strong> ${turma.curso}</p>
    <p><strong>Disciplinas:</strong> ${turma.disciplinas.join(', ')}</p>

    <div class="botoes-card">
      <button class="btn-card adicionar">Alunos</button>
      <button class="btn-card editar">Editar</button>
      <button class="btn-card excluir">Excluir</button>
    </div>
  `;

  const btnAdicionar = card.querySelector('.adicionar');
  const btnEditar = card.querySelector('.editar');
  const btnExcluir = card.querySelector('.excluir');

  btnAdicionar.addEventListener('click', () => {
    alert(`Adicionar aluno à turma ${turma.nome}`);
  });

  btnEditar.addEventListener('click', () => {
    turmaEditando = turma; // marca a turma que está sendo editada
    abrirModalEdicao(turma);
  });

  btnExcluir.addEventListener('click', () => {
    if (confirm(`Tem certeza que deseja excluir a turma "${turma.nome}"?`)) {
      turmas = turmas.filter(t => t.codigo !== turma.codigo);
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
    turmaEditando = null; // limpa controle
  } else {
    // 🟢 novo cadastro
    const novaTurma = { codigo, nome, periodo, curso, disciplinas };
    turmas.push(novaTurma);
  }

  atualizarListaTurmas();
  modalTurma.style.display = 'none';

  // limpar formulário
  document.getElementById('codTurma').value = '';
  document.getElementById('nomeTurma').value = '';
  document.getElementById('periodTurma').value = '';
  document.getElementById('cursoTurma').value = '';
  document.querySelectorAll('.lista-disciplinas input[type="checkbox"]').forEach(chk => chk.checked = false);
});

// Esconde cards vazios
const cards = document.querySelectorAll('.card-turma');
cards.forEach(card => {
  if (card.textContent.trim() === '') {
    card.style.display = 'none';
  }
});






////////////////////////////////////////////////////////////////////////////////////////////////////

redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("turmas", "../pagina_turmas/turma.html");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");