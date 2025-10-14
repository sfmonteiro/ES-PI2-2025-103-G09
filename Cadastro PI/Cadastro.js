document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirmaSenha").value;

    // Expressões de validação
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    // Verificações
   if (!nome) {
    mostrarErro("Por favor, preencha o nome completo.");
    return;
    }
      // Verifica se o nome contém apenas letras e espaços
    const apenasLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!apenasLetras.test(nome)) {
    mostrarErro("O nome deve conter apenas letras.");
    return;
    }

    if (!emailRegex.test(email)) {
      mostrarErro("E-mail inválido. Use o formato nome@exemplo.com.");
      return;
    }

    if (telefone && !telefoneRegex.test(telefone)) {
      mostrarErro("Telefone inválido. Use o formato (XX) 91234-5678.");
      return;
    }

    if (!senhaRegex.test(senha)) {
      mostrarErro(
        "A senha deve ter no mínimo 8 caracteres com: maiúscula, minúscula, número e símbolo."
      );
      return;
    }

    if (senha !== confirmaSenha) {
      mostrarErro("As senhas não coincidem!");
      return;
    }

    // Tudo certo → mostra o ícone de sucesso
    mostrarSucesso();
    form.reset();
  });

  // Função para mostrar mensagem de erro (vermelha)
  function mostrarErro(mensagem) {
    const div = document.createElement("div");
    div.className = "mensagem";
    div.textContent = mensagem;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
    // Função para mostrar tela de sucesso e redirecionar
  function mostrarSucesso() {
    const overlay = document.createElement("div");
    overlay.className = "overlay-sucesso";
    overlay.style.transition = "opacity 1s"; 
    overlay.innerHTML = `
      <div class="caixa-sucesso">
        <img src="icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
        <p>Cadastro realizado com sucesso!</p>
      </div>
    `;
    document.body.appendChild(overlay);

    // Faz o fade-out e depois redireciona
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        window.location.href = "login.html";
      }, 1000); // tempo do fade
    }, 2000); // mostra o sucesso por 2s antes de sumir
  }


