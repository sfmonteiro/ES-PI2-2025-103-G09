// Responsável original: Sara Fernandes
// Ajustes: Marialvo (mostra instituição selecionada e primeiro nome do usuário)

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

// função de redirecionamento reutilizável (mantida)
function redirecionar(id, destino) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.addEventListener('click', (e) => {
      e.preventDefault(); // impede recarregar a página com o #
      window.location.href = destino;
    });
  }
}

// --- Corrige/atualiza os redirecionamentos ---
// adição ChatGPT – Marialvo: use nomes de pasta conforme seu repositório
redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituicao_editar/instituicao2.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("disciplinas", "");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");

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

// chama ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  populateHeader();
});
