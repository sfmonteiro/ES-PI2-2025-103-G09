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


//===========================================CARDS E CADASTRO DAS TURMAS===================================================

const containerTurmas = document.querySelector('.container-turmas');
const modalTurma = document.getElementById('modal-turma');
const btnConfirmarCadastroTurma = modalTurma.querySelector('#confirmar-cadastro');

let turmas = []; // vai armazenar as turmas cadastradas na sessão

function criarCardTurma(turma) {
  const card = document.createElement('div');
  card.classList.add('card-turma');
  card.innerHTML = `
    <h3>${turma.nome}</h3>
    <p><strong>Código:</strong> ${turma.codigo}</p>
    <p><strong>Período:</strong> ${turma.periodo}</p>
    <p><strong>Curso:</strong> ${turma.curso}</p>
    <p><strong>Disciplinas:</strong> ${turma.disciplinas.join(', ')}</p>
  `;
  return card;
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
  // Pegar os valores dos inputs
  const codigo = document.getElementById('codTurma').value.trim();
  const nome = document.getElementById('nomeTurma').value.trim();
  const periodo = document.getElementById('periodTurma').value.trim();
  const curso = document.getElementById('cursoTurma').value; // select
  const checkboxElements = document.querySelectorAll('.lista-disciplinas input[type="checkbox"]:checked');
  const disciplinas = Array.from(checkboxElements).map(chk => chk.parentElement.textContent.trim());

  if (!codigo || !nome || !curso) {
    alert('Preencha os campos obrigatórios: Código, Nome e Curso.');
    return;
  }

  // Criar objeto turma
  const novaTurma = {
    codigo,
    nome,
    periodo,
    curso,
    disciplinas
  };

  turmas.push(novaTurma); // adiciona no array

  atualizarListaTurmas(); // atualiza a tela

  modalTurma.style.display = 'none'; // fecha modal

  // limpar formulário (opcional)
  document.getElementById('codTurma').value = '';
  document.getElementById('nomeTurma').value = '';
  document.getElementById('periodTurma').value = '';
  document.getElementById('cursoTurma').value = '';
  document.querySelectorAll('.lista-disciplinas input[type="checkbox"]').forEach(chk => chk.checked = false);
});

const cards = document.querySelectorAll('.card-turma');

cards.forEach(card => {
  // trim para remover espaços e quebras de linha
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