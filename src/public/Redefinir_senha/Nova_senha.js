// Gabriel Figueira Albasini / RA:25019916
// Funcionalidade de validação e sucesso adicionada

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const novaSenha = document.getElementById("nova-senha").value.trim();
    const confirmarSenha = document.getElementById("confirmar-senha").value.trim();
    
    // Regex para validar senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo)
    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    
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