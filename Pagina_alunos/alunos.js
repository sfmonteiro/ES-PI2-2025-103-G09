const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

userBtn.addEventListener('click', () => {
    userMenu.classList.toggle('open');
});

//FECHAR SE CLICAR FORA

document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('open');
    }
})

//JANELA MODAL /////////////////////////////////////////////

const modal = document.getElementById("modal");
const btnAbrir = document.getElementById("cadastro-aluno");
const btnFechar = document.querySelector(".fechar");

btnAbrir.onclick = () => {
    modal.style.display = "flex";
};

btnFechar.onclick = () => {
    modal.style.display = "none";
};

// Fechar clicando fora
window.onclick = (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
    }
};
