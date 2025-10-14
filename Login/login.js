document.getElementById("submit").addEventListener("click",function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const erroEmail = document.getElementById("erroEmail")
    const erroSenha = document.getElementById("erroSenha")

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    let valido = true;

    if (!regexEmail.test(email)) {
        erroEmail.textContent = "Digite um email válido (ex:exemplo@gmail.com)";
        valido = false;
    } else {
        erroEmail.textContent = ""
    }

    if (!regexSenha.test(senha)) {
        erroSenha.textContent = "Senha inválida"
        valido = false
    } else {
        erroSenha.textContent = ""
    }

    if (valido) {
        window.location.href = "Primeira_acesso.html";
    }
});

document.getElementById("cadastro").addEventListener("click",function (event) {
    window.location.href = "PI.html";
});

document.getElementById("esqueceuSenha").addEventListener("click", function() {
    window.location.href = "ReSenha.html";
});