// Autor original: Bruno Lobo de Jesus RA:25019830
// Ajustes para integração com backend: Marialvo (envio POST /api/usuarios)

document.addEventListener("DOMContentLoaded", () => {
  // Botão de envio
  const submitBtn = document.getElementById("submit");

  submitBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    // campos
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmaSenha = document.getElementById("confirmaSenha").value.trim();

    // retornos de erro
    const erroNome = document.getElementById("erroNome");
    const erroEmail = document.getElementById("erroEmail");
    const erroTelefone = document.getElementById("erroTelefone");
    const erroSenha = document.getElementById("erroSenha");
    const erroConfirmaSenha = document.getElementById("erroConfirmaSenha");

    // expressões de validação
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    let valido = true;

    // validação do nome
    if (!nome) {
      erroNome.textContent = "Preencha o nome completo.";
      valido = false;
    } else if (!regexNome.test(nome)) {
      erroNome.textContent = "O nome deve conter apenas letras.";
      valido = false;
    } else {
      erroNome.textContent = "";
    }

    // validação do e-mail
    if (!regexEmail.test(email)) {
      erroEmail.textContent = "Digite um e-mail válido (ex: exemplo@gmail.com)";
      valido = false;
    } else {
      erroEmail.textContent = "";
    }

    // validação do telefone
    if (telefone && !regexTelefone.test(telefone)) {
      erroTelefone.textContent = "Telefone inválido. Ex: (11) 91234-5678";
      valido = false;
    } else {
      erroTelefone.textContent = "";
    }

    // validação da senha
    if (!regexSenha.test(senha)) {
      erroSenha.textContent = "Senha inválida";
      valido = false;
    } else {
      erroSenha.textContent = "";
    }

    // confirmação da senha
    if (senha !== confirmaSenha) {
      erroConfirmaSenha.textContent = "As senhas não coincidem.";
      valido = false;
    } else {
      erroConfirmaSenha.textContent = "";
    }

    if (!valido) return;

    // ======= Envio para o backend =======
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Enviando...";

    try {
      // adicionado p/ Marialvo: rota backend para cadastro de usuários
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          telefone_celular: telefone,
          senha
        })
      });

      // trata respostas comuns
      if (res.status === 201 || res.ok) {
        // sucesso: mantém animação e redirecionamento do código original
        mostrarSucesso();
        return;
      }

      // casos de erro: le body para diagnóstico
      let body;
      try { body = await res.json(); } catch (_) { body = await res.text().catch(()=>""); }

      if (res.status === 409) {
        // email já cadastrado
        erroEmail.textContent = (body && body.error) ? String(body.error) : "Email já cadastrado.";
        alert("Email já cadastrado. Faça login ou recupere a senha.");
      } else if (res.status === 400) {
        alert("Dados inválidos. Verifique os campos.");
      } else {
        console.error("Erro ao cadastrar:", res.status, body);
        alert("Erro ao processar cadastro. Tente novamente mais tarde.");
      }

    } catch (err) {
      console.error("Falha ao conectar ao servidor:", err);
      alert("Erro de conexão com o servidor. Verifique sua rede.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }); // fim click

  // Função de sucesso (mantida)
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

    // Animação e redirecionamento (mantido)
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        window.location.href = "../Login/login.html";
      }, 1000);
    }, 2000);
  }

  // função de redirecionamento (mantida)
  function redirecionar(id, destino) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = destino;
      });
    }
  }
  redirecionar("voltarLogin", "../Login/login.html");
});
