// Bruno Lobo de Jesus RA:25019830
// MENU DO USUÁRIO (mesmo comportamento do inicio.js)
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

// FORMULÁRIO
const form = document.getElementById("form-conta");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senhaAtual = document.getElementById("senhaAtual").value.trim();
    const novaSenha = document.getElementById("novaSenha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();

    if (novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    // Aqui no futuro vai a integração com o backend
    // Exemplo:
    // fetch('/api/usuarios/atualizar', { method: 'PUT', body: JSON.stringify({ nome, email, telefone, senhaAtual, novaSenha }) })

    alert("Dados salvos com sucesso!");
    form.reset();
});
