//Responsável:Guilherme Mascarenhas Plácido Corrêa
//RA: 25020685
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
        window.location.href = "../Primeira_acesso/primeira_acesso.html";
    }
});

function redirecionar(id, destino) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = destino;
    });
}
}
redirecionar("cadastro", "../Cadastro/Cadastro.html");
redirecionar("esqueceusenha", "../Redefinir_senha/ReSenha.html");
