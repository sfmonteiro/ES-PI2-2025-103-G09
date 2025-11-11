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
const btnAbrir = document.getElementById("abrirModalInstituicao");
const btnFechar = document.getElementById("fecharModal");
const btnSalvar = document.getElementById("salvarInstituicao");
const inputNome = document.getElementById("nomeInstituicao");
const inputSigla = document.getElementById("siglaInstituicao");
const tituloModal = document.getElementById("tituloModal");

let instituicoes = carregar();
let editandoId = null;

// ===== MODAL =====
btnAbrir.onclick = () => abrirModal();
btnFechar.onclick = () => fecharModal();
window.onclick = e => { if (e.target === modal) fecharModal(); };

function abrirModal(edit = false, item = null) {
  modal.style.display = "flex";
  if (edit) {
    tituloModal.textContent = "Editar Instituição";
    inputNome.value = item.nome;
    inputSigla.value = item.sigla;
    editandoId = item.id;
  } else {
    tituloModal.textContent = "Cadastrar Instituição";
    inputNome.value = "";
    inputSigla.value = "";
    editandoId = null;
  }
}
function fecharModal() { modal.style.display = "none"; }

// ===== SALVAR / EDITAR =====
btnSalvar.onclick = () => {
  const nome = inputNome.value.trim();
  const sigla = inputSigla.value.trim();

  if (!nome || !sigla) return alert("Preencha todos os campos!");

  if (editandoId) {
    const idx = instituicoes.findIndex(i => i.id === editandoId);
    instituicoes[idx] = { ...instituicoes[idx], nome, sigla };
  } else {
    instituicoes.push({ id: Date.now(), nome, sigla });
  }

  salvar(instituicoes);
  render();
  fecharModal();
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
        <p><strong>Sigla:</strong> ${inst.sigla}</p>
      </div>
      <div class="card-botoes">
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">Excluir</button>
      </div>
    `;

    card.querySelector(".btn-editar").onclick = () => abrirModal(true, inst);
    card.querySelector(".btn-excluir").onclick = () => {
      if (confirm("Deseja excluir esta instituição?")) {
        instituicoes = instituicoes.filter(i => i.id !== inst.id);
        salvar(instituicoes);
        render();
      }
    };

    lista.appendChild(card);
  });
}
render();

// ===== REDIRECIONAMENTOS =====
function redirecionar(id, destino) {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", e => {
    e.preventDefault();
    window.location.href = destino;
  });
}

redirecionar("inicio", "../Pagina_Inicial/inicio.html");
redirecionar("instituicao", "../Instituicao/instituicao.html");
redirecionar("cursos", "../cursos/cursos.html");
redirecionar("turmas", "../pagina_turmas/turma.html");
redirecionar("atividades", "../Pagina_atividades/atividades.html");
redirecionar("conta", "../Minha_Conta/minha_conta.html");
redirecionar("sair", "../Login/login.html");
redirecionar("trocar-inst", "../Instituiçao_editar/instituicao2.html");
