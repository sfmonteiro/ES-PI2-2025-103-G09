// MENU DO USUÁRIO
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

userBtn.addEventListener('click', () => {
  userMenu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target)) {
    userMenu.classList.remove('open');
  }
});

// REDIRECIONAMENTO DO BOTÃO CADASTRAR
document.getElementById("cadastro-instituicao").onclick = () => {
  window.location.href = "../Instituição cadastro/instituição.html";
};

// REDIRECIONAMENTO DE PÁGINAS DO MENU
function redirecionar(id, destino) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = destino;
    });
  }
}

redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituiçao_editar/instituicao2.html");
redirecionar("alunos", "../Pagina_alunos/alunos.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");
