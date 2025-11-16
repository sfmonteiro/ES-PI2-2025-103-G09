// ===== MENU USUÁRIO =====
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');
userBtn.addEventListener('click', () => userMenu.classList.toggle('open'));
document.addEventListener('click', e => {
  if (!userMenu.contains(e.target)) userMenu.classList.remove('open');
});

// ===== STORAGE =====
const STORAGE_KEY = "instituicoes";

function carregar() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function salvar(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ===== ELEMENTOS =====
const lista = document.getElementById("lista-instituicoes");
const modal = document.getElementById("modalInstituicao");

const modalConfirmacao = document.getElementById("modalConfirmacao");
const btnConfirmSim = document.getElementById("confirmarSim");
const btnConfirmNao = document.getElementById("confirmarNao");

const btnAbrir = document.getElementById("abrirModalInstituicao");
const btnFechar = document.getElementById("fecharModal");
const btnSalvar = document.getElementById("salvarInstituicao");

const inputNome = document.getElementById("nomeInstituicao");
const tituloModal = document.getElementById("tituloModal");

let instituicoes = carregar();
let editandoId = null;
let idParaExcluir = null;

// ===== MODAL =====
btnAbrir.onclick = () => abrirModal();
btnFechar.onclick = () => fecharModal();
window.onclick = e => { 
  if (e.target === modal) fecharModal();
  if (e.target === modalConfirmacao) modalConfirmacao.style.display = "none";
};

function abrirModal(edit = false, item = null) {
  modal.style.display = "flex";

  if (edit) {
    tituloModal.textContent = "Editar Instituição";
    inputNome.value = item.nome;
    editandoId = item.id;
  } else {
    tituloModal.textContent = "Cadastrar Instituição";
    inputNome.value = "";
    editandoId = null;
  }
}

function fecharModal() {
  modal.style.display = "none";
}

// ===== SALVAR / EDITAR =====
btnSalvar.onclick = () => {
  const nome = inputNome.value.trim();

  if (!nome) return alert("Digite o nome da instituição!");

  if (editandoId) {
    const idx = instituicoes.findIndex(i => i.id === editandoId);
    instituicoes[idx] = { ...instituicoes[idx], nome };
    mostrarSucesso("Instituição editada com sucesso!");
  } else {
    instituicoes.push({
      id: Date.now(),
      nome
    });
    mostrarSucesso("Instituição cadastrada com sucesso!");
  }

  salvar(instituicoes);
  render();
  fecharModal();
};

// ===== CONFIRMAR EXCLUSÃO PADRÃO =====
function confirmarExclusao(id) {
  idParaExcluir = id;
  modalConfirmacao.style.display = "flex";
}

btnConfirmSim.onclick = () => {
  instituicoes = instituicoes.filter(i => i.id !== idParaExcluir);
  salvar(instituicoes);
  render();
  modalConfirmacao.style.display = "none";
  mostrarSucesso("Instituição excluída com sucesso!");
};

btnConfirmNao.onclick = () => {
  modalConfirmacao.style.display = "none";
};

// ===== RENDER =====
function render() {
  lista.innerHTML = "";

  if (instituicoes.length === 0) {
    lista.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUMA INSTITUIÇÃO CADASTRADA AINDA...</p>
        <img src="../images/imagem_alunos.png" class="img-nada-cadastrado" />
      </div>`;
    return;
  }

  instituicoes.forEach(inst => {
    const card = document.createElement("div");
    card.className = "curso-card";

    card.innerHTML = `
      <div class="card-top">${inst.nome}</div>

      <div class="card-info">
        <p><strong>Instituição:</strong> ${inst.nome}</p>
      </div>

      <div class="card-botoes">
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    card.querySelector(".btn-editar").onclick = () => abrirModal(true, inst);

    card.querySelector(".btn-excluir").onclick = () => confirmarExclusao(inst.id);

    lista.appendChild(card);
  });
}

render();


// ============== POPUP DE SUCESSO ==============
function mostrarSucesso(texto = "Operação realizada com sucesso!") {
  const overlay = document.createElement("div");
  overlay.className = "overlay-sucesso";
  overlay.style.transition = "opacity 1s";

  overlay.innerHTML = `
    <div class="caixa-sucesso">
        <img src="../images/icone_NotaDez.png" class="icone-sucesso">
        <p>${texto}</p>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 1000);
  }, 2000);
}
