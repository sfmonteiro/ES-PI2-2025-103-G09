// Responsável original: Sara Fernandes
// Ajustes: Marialvo (mostra instituição selecionada e primeiro nome do usuário)
// Ajustes: Gabriel (carregar estatísticas do dashboard)

// elementos
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

// abre/fecha dropdown do usuário
if (userBtn && userMenu) {
  userBtn.addEventListener('click', () => {
    userMenu.classList.toggle('open');
  });

  // FECHAR SE CLICAR FORA
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('open');
    }
  });
}

// ======================= Mostrar instituição e nome do usuário =======================

// Tenta obter o nome da instituição salva (pelo select da página anterior)
function getSelectedInstitution() {
  try {
    const id = localStorage.getItem('selected_instituicao_id');
    const nome = localStorage.getItem('selected_instituicao_nome');
    if (id && nome) return { id, nome };
  } catch (e) {
    console.warn("Erro lendo selected_instituicao do localStorage:", e);
  }
  return null;
}

// Tenta obter o nome do usuário:
// 1) se houver um objeto 'usuario' salvo no localStorage (recomendado no login), usa ele
// 2) senão tenta decodificar JWT do token (localStorage.token) e extrair 'nome' ou 'nome_usuario' do payload
// 3) senão retorna null
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
      // decodifica sem verificar assinatura (só para extrair payload)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = parts[1];
        try {
          const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
          const nomeFull = decoded.nome ?? decoded.name ?? decoded.nome_usuario ?? decoded.username ?? "";
          if (nomeFull) return String(nomeFull).split(" ")[0];
        } catch (e) {
          // ignora
        }
      }
    }
  } catch (e) {
    console.warn("Erro obtendo nome do usuário:", e);
  }
  return null;
}

// atualiza a UI com instituição e nome do usuário
function populateHeader() {
  // instituição
  const instArea = document.querySelector('.faculdade-box');
  const inst = getSelectedInstitution();
  if (instArea) {
    if (inst) {
      // adição Marialvo: mostra o nome da instituição selecionada
      instArea.innerHTML = `
        <img src="../images/icone_instituicao_verde.png" alt="Logo Instituição" class="instituicao-icon">
        <span class="instituicao-nome">${inst.nome}</span>
      `;
    } else {
      // fallback: texto padrão
      instArea.innerHTML = `
        <img src="../images/icone_instituicao_verde.png" alt="Logo Instituição" class="instituicao-icon">
        <span class="instituicao-nome">Nenhuma instituição selecionada</span>
      `;
    }
  }

  // usuário (primeiro nome)
  const userBtnSpan = document.getElementById('user-btn');
  const firstName = getUserFirstName();
  if (userBtnSpan) {
    if (firstName) {
      userBtnSpan.textContent = `Olá, ${firstName}!   ▼`;
    } else {
      userBtnSpan.textContent = `Olá, Usuário!   ▼`;
    }
  }
}

// ======================= DASHBOARD: Carregar Estatísticas =======================

function carregarDashboard() {
  // Ler dados do localStorage
  const instituicoes = JSON.parse(localStorage.getItem('instituicoes') || '[]');
  const cursos = JSON.parse(localStorage.getItem('cursos') || '[]');
  const turmas = JSON.parse(localStorage.getItem('turmas') || '[]');
  const componentes = JSON.parse(localStorage.getItem('componentes') || '[]');

  // Contar totais
  const totalInstituicoes = instituicoes.length;
  const totalCursos = cursos.length;
  const totalTurmas = turmas.length;
  const totalComponentes = componentes.length;

  // Contar disciplinas (soma de todas as disciplinas de todos os cursos)
  const totalDisciplinas = cursos.reduce((acc, curso) => {
    return acc + (Array.isArray(curso.disciplinas) ? curso.disciplinas.length : 0);
  }, 0);

  // Contar alunos (soma de todos os alunos de todas as turmas)
  const totalAlunos = turmas.reduce((acc, turma) => {
    return acc + (Array.isArray(turma.alunos) ? turma.alunos.length : 0);
  }, 0);

  // Atualizar cards
  document.getElementById('total-instituicoes').textContent = totalInstituicoes;
  document.getElementById('total-cursos').textContent = totalCursos;
  document.getElementById('total-disciplinas').textContent = totalDisciplinas;
  document.getElementById('total-turmas').textContent = totalTurmas;
  document.getElementById('total-alunos').textContent = totalAlunos;
  document.getElementById('total-componentes').textContent = totalComponentes;

  // Carregar listas
  carregarTurmasRecentes(turmas);
  carregarCursosComMaisDisciplinas(cursos);
}

// ======================= Turmas Recentes =======================
function carregarTurmasRecentes(turmas) {
  const container = document.getElementById('lista-turmas-recentes');
  
  if (!turmas || turmas.length === 0) {
    container.innerHTML = `
      <div class="dashboard-vazio">
        <img src="../images/imagem_alunos.png" alt="Nenhuma turma">
        <p>Nenhuma turma cadastrada ainda</p>
      </div>
    `;
    return;
  }

  // Ordenar por id (mais recentes primeiro) e pegar as 5 últimas
  const turmasRecentes = [...turmas]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5);

  container.innerHTML = turmasRecentes.map(turma => {
    const numAlunos = Array.isArray(turma.alunos) ? turma.alunos.length : 0;
    return `
      <div class="item-recente">
        <div class="item-info">
          <div class="item-nome">${turma.nome || 'Sem nome'}</div>
          <div class="item-detalhe">
            ${turma.cursoNome || 'Curso não definido'} • ${turma.periodo || 'Período não definido'}
          </div>
          <div class="item-detalhe">
            ${turma.disciplinaNome || 'Disciplina não definida'}
          </div>
        </div>
        <div class="item-badge badge-alunos">
          ${numAlunos} aluno${numAlunos !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ======================= Cursos com Mais Disciplinas =======================
function carregarCursosComMaisDisciplinas(cursos) {
  const container = document.getElementById('lista-cursos-disciplinas');
  
  if (!cursos || cursos.length === 0) {
    container.innerHTML = `
      <div class="dashboard-vazio">
        <img src="../images/imagem_alunos.png" alt="Nenhum curso">
        <p>Nenhum curso cadastrado ainda</p>
      </div>
    `;
    return;
  }

  // Ordenar por quantidade de disciplinas (maior primeiro) e pegar os 5 primeiros
  const cursosOrdenados = [...cursos]
    .map(curso => ({
      ...curso,
      numDisciplinas: Array.isArray(curso.disciplinas) ? curso.disciplinas.length : 0
    }))
    .sort((a, b) => b.numDisciplinas - a.numDisciplinas)
    .slice(0, 5);

  container.innerHTML = cursosOrdenados.map(curso => {
    return `
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
    `;
  }).join('');
}

// ======================= Inicialização =======================
document.addEventListener('DOMContentLoaded', () => {
  populateHeader();
  carregarDashboard();
});