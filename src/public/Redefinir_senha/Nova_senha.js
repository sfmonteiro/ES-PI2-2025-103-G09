// Gabriel Figueira Albasini / RA:25019916
// Funcionalidade de validação em tempo real e sucesso

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const novaSenhaInput = document.getElementById("nova-senha");
  const confirmarSenhaInput = document.getElementById("confirmar-senha");
  
  // Regex para validar senha
  const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
  // Validação em tempo real da nova senha
  novaSenhaInput.addEventListener("input", () => {
    const erroSenha = document.getElementById("erroSenha");
    const senha = novaSenhaInput.value.trim();
    
    if (senha && !regexSenha.test(senha)) {
      erroSenha.textContent = "Senha inválida";
    } else {
      erroSenha.textContent = "";
    }
  });
  
  // Validação em tempo real da confirmação
  confirmarSenhaInput.addEventListener("input", () => {
    const novaSenha = novaSenhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();
    const erroConfirmar = document.getElementById("erroConfirmarSenha");
    
    if (confirmarSenha && novaSenha !== confirmarSenha) {
      erroConfirmar.textContent = "As senhas não coincidem.";
    } else {
      erroConfirmar.textContent = "";
    }
  });
  
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const novaSenha = novaSenhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();
    
    // Validação da nova senha
    if (!regexSenha.test(novaSenha)) {
      alert("A senha deve ter no mínimo 8 caracteres, incluindo:\n- 1 letra maiúscula\n- 1 letra minúscula\n- 1 número\n- 1 símbolo");
      return;
    }
    
    // Validação: senhas devem coincidir
    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem. Por favor, verifique.");
      return;
    }
    
    // Se todas as validações passarem, mostra sucesso
    mostrarSucesso();
  });
  
  // Função para mostrar overlay de sucesso
  function mostrarSucesso() {
    const overlay = document.createElement("div");
    overlay.className = "overlay-sucesso";
    overlay.style.transition = "opacity 1s";
    overlay.innerHTML = `
      <div class="caixa-sucesso">
        <img src="../images/icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
        <p>Senha alterada com sucesso!</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Animação e redirecionamento
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        window.location.href = "../Login/login.html";
      }, 1000);
    }, 2000);
  }
});