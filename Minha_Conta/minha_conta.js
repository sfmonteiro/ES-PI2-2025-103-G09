// Bruno Lobo de Jesus RA:25019830
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

const form = document.getElementById("form-conta");
const inputs = form.querySelectorAll("input");

// Salva os valores iniciais
const valoresIniciais = {};
inputs.forEach(input => valoresIniciais[input.id] = input.value.trim());

// Função para mostrar erro
function mostrarErro(input, mensagem) {
    const spanErro = input.parentElement.querySelector(".erro");
    input.classList.add("erro-campo");
    spanErro.textContent = mensagem;
}

// Limpa os erros
function limparErros() {
    inputs.forEach(input => {
        input.classList.remove("erro-campo");
        input.parentElement.querySelector(".erro").textContent = "";
    });
}

// Mostrar mensagem de sucesso visual
function mostrarSucesso() {
    const overlay = document.createElement("div");
    overlay.className = "overlay-sucesso";
    overlay.innerHTML = `
        <div class="caixa-sucesso">
            <img src="../images/icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
            <p>Alterações salvas com sucesso!</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Remove automaticamente depois de 2.5s
    setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 1000);
    }, 2500);
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    limparErros();

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");
    const senhaAtual = document.getElementById("senhaAtual");
    const novaSenha = document.getElementById("novaSenha");
    const confirmarSenha = document.getElementById("confirmarSenha");

    let valido = true;
    let houveMudanca = false;

    // Detecta se algo mudou
    inputs.forEach(input => {
        if (input.value.trim() !== valoresIniciais[input.id]) {
            houveMudanca = true;
        }
    });

    if (!houveMudanca) {
        alert("Nenhuma alteração detectada. Faça alguma mudança antes de salvar.");
        return;
    }

    // Campos obrigatórios
    if (!nome.value.trim()) { mostrarErro(nome, "Preencha seu nome completo."); valido = false; }
    if (!email.value.trim()) { mostrarErro(email, "Informe seu e-mail."); valido = false; }
    if (!telefone.value.trim()) { mostrarErro(telefone, "Digite seu telefone."); valido = false; }

    // Validação de senha
    const senhaPreenchida = senhaAtual.value || novaSenha.value || confirmarSenha.value;
    if (senhaPreenchida) {
        if (!senhaAtual.value) { mostrarErro(senhaAtual, "Digite sua senha atual."); valido = false; }
        if (!novaSenha.value) { mostrarErro(novaSenha, "Digite a nova senha."); valido = false; }
        if (!confirmarSenha.value) { mostrarErro(confirmarSenha, "Confirme a nova senha."); valido = false; }

        if (novaSenha.value && novaSenha.value.length < 6) {
            mostrarErro(novaSenha, "A nova senha deve ter pelo menos 6 caracteres.");
            valido = false;
        }

        if (novaSenha.value && confirmarSenha.value && novaSenha.value !== confirmarSenha.value) {
            mostrarErro(confirmarSenha, "As senhas não coincidem.");
            valido = false;
        }
    }

    if (!valido) return;

    // Exibe mensagem de sucesso
    mostrarSucesso();

    // Atualiza os valores iniciais após salvar
    inputs.forEach(input => valoresIniciais[input.id] = input.value.trim());
});
