const botao = document.getElementById('entrar');
const select = document.getElementById('instituicao');

// URL da sua API — altere depois para o caminho real
const API_URL = "http://localhost:3000/instituicoes"; 
// exemplo: "https://seuservidor.com/api/instituicoes"

// ======== BOTÃO ENTRAR ========
botao.addEventListener('click', () => {
  const valor = select.value;
  
  if (!valor) {
    alert('Por favor, selecione uma instituição antes de continuar.');
  } else {
    mostrarSucesso();
  }
});

function mostrarSucesso() {
  const overlay = document.createElement("div");
  overlay.className = "overlay-sucesso";
  overlay.style.transition = "opacity 1s";
  overlay.innerHTML = `
      <div class="caixa-sucesso">
          <img src="../images/icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
          <p>Cadastro realizado com sucesso!</p>
      </div>
  `;
  document.body.appendChild(overlay);
}

// ======== MODAL ADICIONAR NOVA INSTITUIÇÃO ========
const linkAdicionar = document.querySelector('.add-link');
const modal = document.getElementById('modalInstituicao');
const cancelarModal = document.getElementById('cancelarModal');
const salvarInstituicao = document.getElementById('salvarInstituicao');
const nomeInstituicao = document.getElementById('nomeInstituicao');

// Abrir modal
linkAdicionar.addEventListener('click', (e) => {
  e.preventDefault();
  modal.style.display = 'flex';
});

// Fechar modal
cancelarModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Salvar nova instituição
salvarInstituicao.addEventListener('click', async () => {
  const nome = nomeInstituicao.value.trim();
  if (nome === '') {
    alert('Digite o nome da instituição.');
    return;
  }

  try {
    // 🔹 Tenta enviar para o servidor (API)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome })
    });

    if (response.ok) {
      alert("Instituição adicionada com sucesso!");
      adicionarOpcaoSelect(nome);
      select.value = nome.toLowerCase().replace(/\s+/g, '-');
      nomeInstituicao.value = '';
      modal.style.display = 'none';
    } else {
      alert("Erro ao salvar no banco. Verifique o servidor.");
    }

  } catch (error) {
    console.error("Erro de conexão:", error);
    alert("Não foi possível conectar ao servidor. Salvando localmente...");

    // 🔸 Salva localmente (temporário)
    const locais = JSON.parse(localStorage.getItem('instituicoes')) || [];
    locais.push(nome);
    localStorage.setItem('instituicoes', JSON.stringify(locais));
    adicionarOpcaoSelect(nome);
  }
});

// Fechar ao clicar fora do modal
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// ======== ADICIONAR OPÇÃO NO SELECT ========
function adicionarOpcaoSelect(nome) {
  // Evitar duplicadas
  const existe = Array.from(select.options).some(opt => opt.textContent === nome);
  if (!existe) {
    const option = document.createElement('option');
    option.value = nome.toLowerCase().replace(/\s+/g, '-');
    option.textContent = nome;
    select.appendChild(option);
  }
}

// ======== CARREGAR INSTITUIÇÕES AO INICIAR ========
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao buscar dados");
    const instituicoes = await response.json();

    instituicoes.forEach(inst => adicionarOpcaoSelect(inst.nome));

  } catch (error) {
    console.warn("Servidor indisponível, usando dados locais.");
    const locais = JSON.parse(localStorage.getItem('instituicoes')) || [];
    locais.forEach(nome => adicionarOpcaoSelect(nome));
  }
});

function redirecionar(id, destino) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.addEventListener('click', (e) => {
            e.preventDefault(); // impede recarregar a página com o #
            window.location.href = destino;
        });
    }
}

redirecionar("entrar", "../Pagina_Inicial/inicio.html");