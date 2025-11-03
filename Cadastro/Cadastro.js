document.addEventListener("DOMContentLoaded", () => {
    // Botão de envio
    document.getElementById("submit").addEventListener("click", function (event) {
        event.preventDefault();

        // Campos
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const confirmaSenha = document.getElementById("confirmaSenha").value.trim();

        // Spans de erro
        const erroNome = document.getElementById("erroNome");
        const erroEmail = document.getElementById("erroEmail");
        const erroTelefone = document.getElementById("erroTelefone");
        const erroSenha = document.getElementById("erroSenha");
        const erroConfirmaSenha = document.getElementById("erroConfirmaSenha");

        // Expressões de validação
        const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        let valido = true;

        // Validação do nome
        if (!nome) {
            erroNome.textContent = "Preencha o nome completo.";
            valido = false;
        } else if (!regexNome.test(nome)) {
            erroNome.textContent = "O nome deve conter apenas letras.";
            valido = false;
        } else {
            erroNome.textContent = "";
        }

        // Validação do e-mail
        if (!regexEmail.test(email)) {
            erroEmail.textContent = "Digite um e-mail válido (ex: exemplo@gmail.com)";
            valido = false;
        } else {
            erroEmail.textContent = "";
        }

        // Validação do telefone (opcional)
        if (telefone && !regexTelefone.test(telefone)) {
            erroTelefone.textContent = "Telefone inválido. Ex: (11) 91234-5678";
            valido = false;
        } else {
            erroTelefone.textContent = "";
        }

        // Validação da senha
        if (!regexSenha.test(senha)) {
            erroSenha.textContent = "Senha inválida";
            valido = false;
        } else {
            erroSenha.textContent = "";
        }

        // Confirmação da senha
        if (senha !== confirmaSenha) {
            erroConfirmaSenha.textContent = "As senhas não coincidem.";
            valido = false;
        } else {
            erroConfirmaSenha.textContent = "";
        }

        // Se tudo estiver válido → sucesso
        if (valido) {
            mostrarSucesso();
        }
    });

    // Função de sucesso
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

        // Animação e redirecionamento
        setTimeout(() => {
            overlay.style.opacity = "0";
            setTimeout(() => {
                overlay.remove();
                window.location.href = "../Login/login.html";
            }, 1000);
        }, 2000);
    }

    // Botão para voltar ao login
    const btnLogin = document.getElementById("voltarLogin");
    if (btnLogin) {
        btnLogin.addEventListener("click", function () {
            window.location.href = "../Login/login.html";
        });
    }
});

