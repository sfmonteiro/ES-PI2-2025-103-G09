// Bruno Lobo de Jesus RA:25019830
// Revisado e adaptado por Marialvo

// ======== ELEMENTOS DA PÁGINA ========
const botao = document.getElementById('entrar');
const select = document.getElementById('instituicao');

// ======== CONFIGURAÇÃO DA API ========
//  Marialvo: rota correta da API REST backend
const API_URL = "/api/instituicao";  

// ======== BOTÃO ENTRAR ========
botao.addEventListener('click', (event) => {
  event.preventDefault(); // impede comportamento padrão

  const valor = select.value;
  const erro = document.getElementById('erroInstituicao');

  if (!valor) {
    erro.textContent = 'Por favor, selecione uma instituição antes de continuar.';
    return; // impede o redirecionamento
  }

  erro.textContent = '';

  // --- adição Marialvo: salvar no localStorage a instituição selecionada (id e nome)
  // pega o texto da option selecionada
  const nomeSelecionado = select.options[select.selectedIndex]?.textContent ?? "";
  try {
    localStorage.setItem('selected_instituicao_id', String(valor));
    localStorage.setItem('selected_instituicao_nome', String(nomeSelecionado));
  } catch (e) {
    console.warn("Não foi possível salvar a instituição no localStorage:", e);
  }

  mostrarSucesso();
});

// ======== FUNÇÃO DE SUCESSO ========
function mostrarSucesso() {
  const overlay = document.createElement("div");
  overlay.className = "overlay-sucesso";
  overlay.style.transition = "opacity 1s";
  overlay.innerHTML = `
      <div class="caixa-sucesso">
          <img src="../images/icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
          <p>Instituição selecionada com sucesso!</p>
      </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    // Marialvo: redirecionamento para a página inicial do professor
    window.location.href = "../Pagina_Inicial/inicio.html";
  }, 2000);
}

// ======== ADICIONAR NOVA INSTITUIÇÃO ========
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

// ======== FUNÇÃO AUXILIAR: OBTÉM TOKEN DO LOGIN ========
// Marialvo: leitura do token JWT do localStorage
function getToken() {
  return localStorage.getItem("token");
}

// ======== SALVAR NOVA INSTITUIÇÃO ========
salvarInstituicao.addEventListener('click', async () => {
  const nome = nomeInstituicao.value.trim();
  if (nome === '') {
    alert('Digite o nome da instituição.');
    return;
  }

  try {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ nome })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.ok) {
        alert("Instituição adicionada com sucesso!");
        adicionarOpcaoSelectById(data.id_instituicao, nome);
        select.value = String(data.id_instituicao);
        nomeInstituicao.value = '';
        modal.style.display = 'none';
      } else {
        throw new Error("Resposta do servidor negativa");
      }
    } else {
      const txt = await response.text().catch(() => "");
      throw new Error("Erro ao salvar no servidor: " + response.status + " " + txt);
    }

  } catch (error) {
    console.error("Erro ao salvar instituição:", error);
    alert("Erro ao salvar instituição. Verifique a conexão ou tente novamente.");
  }
});

// Fechar ao clicar fora do modal
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// ======== ADICIONAR OPÇÃO NO SELECT (por ID e nome) ========
// adição ChatGPT – Marialvo: mantém consistência com o backend
function adicionarOpcaoSelectById(id, nome) {
  const existe = Array.from(select.options).some(opt => opt.textContent === nome);
  if (!existe) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = nome;
    select.appendChild(option);
  }
}

// ======== CARREGAR INSTITUIÇÕES DO BANCO ========
// Marialvo: carregar instituições lendo data.rows (backend retorna { ok:true, rows: [...] })
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(API_URL, { headers });
    if (!response.ok) throw new Error("Erro ao buscar instituições: " + response.status);

    const data = await response.json();

    // espera o formato: { ok: true, rows: [ { id_instituicao, nome, owner_user_id }, ... ] }
    if (!data || !data.ok || !Array.isArray(data.rows)) {
      throw new Error("Resposta inválida do servidor ao listar instituições");
    }

    data.rows.forEach(inst => {
      // aceita tanto maiúsculas (OUT_FORMAT_OBJECT pode retornar campos em MAIÚSCULAS)
      const id = inst.ID_INSTITUICAO ?? inst.id_instituicao ?? inst.id;
      const nome = inst.NOME ?? inst.nome ?? inst.Nome ?? String(id);
      if (id && nome) adicionarOpcaoSelectById(id, nome);
    });

  } catch (error) {
    console.warn("Falha ao carregar instituições:", error);
    alert("Erro ao carregar instituições. Verifique sua conexão.");
  }
});

