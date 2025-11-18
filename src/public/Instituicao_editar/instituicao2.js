// ==========================
// USER HEADER
// ==========================
function getUserFirstName() {
  try {
    const u = localStorage.getItem("usuario");
    if (u) {
      const obj = JSON.parse(u);
      const nomeFull = obj.nome ?? obj.NOME ?? obj.nome_usuario ?? obj.name ?? "";
      if (nomeFull) return nomeFull.split(" ")[0];
    }
    const token = localStorage.getItem("token");
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = parts[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
          const nomeFull = decoded.nome ?? decoded.name ?? decoded.nome_usuario ?? decoded.username ?? "";
          if (nomeFull) return nomeFull.split(" ")[0];
        } catch {}
      }
    }
  } catch {}
  return null;
}

function populateHeader() {
  const userBtnSpan = document.getElementById('user-btn');
  const firstName = getUserFirstName();
  if (userBtnSpan) {
    userBtnSpan.textContent = firstName ? `Olá, ${firstName}! ▼` : `Olá, Usuário! ▼`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateHeader();
  fetchInstituicoes();
});

// ===== MENU USUÁRIO =====
const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');
userBtn.addEventListener('click', () => userMenu.classList.toggle('open'));
document.addEventListener('click', e => {
  if (!userMenu.contains(e.target)) userMenu.classList.remove('open');
});

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

let instituicoes = [];
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

// ===== FETCH / API =====
async function fetchInstituicoes() {
  try {
    const res = await fetch("/api/instituicao", {
      headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
    });
    const data = await res.json();
    if (data.ok) {
      instituicoes = data.rows.map(i => ({
        id: i.ID_INSTITUICAO,
        nome: i.NOME
      }));
      render();
    } else {
      alert("Erro ao carregar instituições");
    }
  } catch (err) {
    console.error("Erro ao buscar instituições:", err);
  }
}

async function criarInstituicao(nome) {
  try {
    const res = await fetch("/api/instituicao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ nome })
    });
    const data = await res.json();
    if (data.ok) {
      fetchInstituicoes();
      mostrarSucesso("Instituição cadastrada com sucesso!");
      fecharModal();
    } else {
      alert(data.message || "Erro ao criar instituição");
    }
  } catch (err) {
    console.error("Erro POST instituição:", err);
  }
}

async function editarInstituicao(id, nome) {
  try {
    const res = await fetch(`/api/instituicao/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ nome })
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Erro ao editar instituição");
      return;
    }

    mostrarSucesso("Instituição atualizada com sucesso!");
    fecharModal();
    fetchInstituicoes();

  } catch (err) {
    console.error("Erro PUT instituição:", err);
    alert("Erro ao atualizar instituição.");
  }
}


async function excluirInstituicao(id) {
  try {
    const res = await fetch(`/api/instituicao/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Erro ao excluir instituição");
      return;
    }

    mostrarSucesso("Instituição excluída com sucesso!");
    fetchInstituicoes();

  } catch (err) {
    console.error("Erro DELETE instituição:", err);
    alert("Erro ao excluir instituição.");
  }
}


// ===== SALVAR / EDITAR =====
btnSalvar.onclick = () => {
  const nome = inputNome.value.trim();
  if (!nome) return alert("Digite o nome da instituição!");

  if (editandoId) {
    editarInstituicao(editandoId, nome);
  } else {
    criarInstituicao(nome);
  }
};

// ===== CONFIRMAR EXCLUSÃO PADRÃO =====
function confirmarExclusao(id) {
  idParaExcluir = id;
  modalConfirmacao.style.display = "flex";
}

btnConfirmSim.onclick = () => {
  excluirInstituicao(idParaExcluir);
  modalConfirmacao.style.display = "none";
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
