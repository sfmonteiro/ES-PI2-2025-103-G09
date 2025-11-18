// Bruno Lobo de Jesus RA:25019830
// ALTERAÇÃO POR: Marialvo
// Objetivo: substituir localStorage por chamadas à API (/api/cursos).
// Agora SEM fallback para localStorage — somente API.

// Constantes
const API_BASE = "/api/cursos";
const AUTH_TOKEN_KEY = "token"; // se seu frontend guarda token em outro local, ajuste aqui

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
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const payload = parts[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
          const nomeFull = decoded.nome ?? decoded.name ?? decoded.nome_usuario ?? decoded.username ?? "";
          if (nomeFull) return nomeFull.split(" ")[0];
        } catch {}
      }
    }
  } catch {}
  return null;
}

function populateHeader() {
  const userBtnSpan = document.getElementById("user-btn");
  const firstName = getUserFirstName();
  if (userBtnSpan) {
    userBtnSpan.textContent = firstName ? `Olá, ${firstName}! ▼` : `Olá, Usuário! ▼`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateHeader();
});

// ---------------------------
// Helpers: API
// ---------------------------
async function apiFetch(path, options = {}) {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const headers = options.headers || {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // se o body estiver presente e não tiver header Content-Type, definir
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const resp = await fetch(path, { ...options, headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    // tenta parsear JSON, se não for JSON lança
    return await resp.json();
  } catch (e) {
    console.warn("API unreachable or error:", e);
    throw e;
  }
}

async function apiGetCursos() {
  return await apiFetch(API_BASE, { method: "GET" });
}

async function apiCreateCurso(curso) {
  return await apiFetch(API_BASE, {
    method: 'POST',
    body: JSON.stringify({
      nome: curso.nome,
      id_instituicao: curso.id_instituicao,
      disciplinas: (curso.disciplinas || []).map(d => ({
        NOME: d.nome,
        SIGLA: d.sigla,
        CODIGO: d.codigo,
        PERIODO_CURSO: d.periodo
      }))
    })
  });
}


async function apiUpdateCurso(curso) {
  return await apiFetch(`${API_BASE}/${curso.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nome: curso.nome,
      disciplinas: (curso.disciplinas || []).map(d => ({
        ID_DISCIPLINA: d.id,
        NOME: d.nome,
        SIGLA: d.sigla,
        CODIGO: d.codigo,
        PERIODO_CURSO: d.periodo
      }))
    })
  });
}


async function apiDeleteCurso(id) {
  return await apiFetch(`${API_BASE}/${id}`, { method: "DELETE" });
}

// ---------------------------
// Conversões / utilitários
// ---------------------------
function normalizeCursosFromApi(apiData) {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(r => ({
    id: r.CURSO_ID ?? r.id,
    nome: r.NOME ?? r.nome ?? "",
    codigo: r.CODIGO ?? r.codigo ?? "",
    // disciplinas do backend já vêm como array de objetos (pode ser undefined)
    disciplinas: Array.isArray(r.disciplinas)
      ? r.disciplinas.map(d => ({
          id: d.ID_DISCIPLINA ?? d.id,
          nome: d.NOME ?? d.nome ?? "",
          codigo: d.CODIGO ?? d.codigo ?? "",
          sigla: d.SIGLA ?? d.sigla ?? "",
          periodo: d.PERIODO_CURSO ?? d.periodo ?? ""
        }))
      : []
  }));
}

// ---------------------------
// Carregar / Salvar (API-only)
// ---------------------------
async function carregarCursos() {
  try {
    const res = await apiGetCursos();
    if (!res || !res.ok || !Array.isArray(res.data)) {
      console.error("Resposta inválida ao carregar cursos:", res);
      return [];
    }
    return normalizeCursosFromApi(res.data);
  } catch (e) {
    console.error("Falha ao carregar cursos da API:", e);
    return []; // não salva local nem tenta fallback
  }
}

/**
 * sincroniza array de cursos com o servidor
 * - cria os cursos sem id (retorna id do servidor)
 * - atualiza cursos que possuem id
 *
 * Observação: aqui assumimos que o servidor retornará { ok: true, id: <num> } no POST
 */
async function salvarCursos(cursos) {
  try {
    for (let c of cursos) {
      // curso sem id (novo) -> criar
      if (!c.id || String(c.id).startsWith("tmp-")) {
        // espera que apiCreateCurso retorne { ok:true, id: <num> } ou { id: <num> }
        const resp = await apiCreateCurso(c);
        const newId = (resp && (resp.id || resp.data?.id)) || (resp && resp.ok && resp.id) || null;
        if (newId) {
          c.id = newId;
        } else {
          console.warn("apiCreateCurso não retornou id. resposta:", resp);
        }
      } else {
        // curso existente -> atualizar (envia disciplinas no formato esperado pelo backend)
        const disciplinasParaEnvio = Array.isArray(c.disciplinas)
          ? c.disciplinas.map(d => ({
              ID_DISCIPLINA: d.id,
              NOME: d.nome,
              CODIGO: d.codigo,
              SIGLA: d.sigla,
              PERIODO_CURSO: d.periodo
            }))
          : [];

        try {
          await apiUpdateCurso({
            id: c.id,
            nome: c.nome,
            disciplinas: disciplinasParaEnvio
          });
        } catch (err) {
          // se update falhar, log e continua (não salva local)
          console.error(`Falha ao atualizar curso id=${c.id}:`, err);
        }
      }
    }
    // após sincronizar, não fazemos nada com localStorage — tudo via API
    return true;
  } catch (e) {
    console.error("salvarCursos: erro geral ao sincronizar com API:", e);
    throw e; // deixe o chamador tratar (UI)
  }
}

// ---------------------------
// UI / DOM
// ---------------------------
const userMenu = document.querySelector(".user-menu");
const userBtn = document.querySelector("#user-btn");

const modalCurso = document.getElementById("modalCurso");
const modalDisciplina = document.getElementById("modalDisciplina");
const modalConfirmacao = document.getElementById("modalConfirmacao");

const btnCadastroCurso = document.getElementById("cadastro-curso");
const btnCloseModalCurso = document.getElementById("closeModalCurso");
const btnCloseModalDisciplina = document.getElementById("closeModalDisciplina");

const inputNomeCurso = document.getElementById("nomeCurso");
const btnSalvarCurso = document.getElementById("salvarCurso");

const inputNomeDisciplina = document.getElementById("nomeDisciplina");
const inputCodigoDisciplina = document.getElementById("codigoDisciplina");
const inputSiglaDisciplina = document.getElementById("siglaDisciplina");
const inputPeriodoDisciplina = document.getElementById("periodTurma");

const btnAdicionarDisciplina = document.getElementById("adicionarDisciplina");

const listaCursosEl = document.getElementById("lista-cursos");
const listaDisciplinasEl = document.getElementById("listaDisciplinas");

const btnConfirmSim = document.getElementById("confirmarSim");
const btnConfirmNao = document.getElementById("confirmarNao");

let cursos = [];
let cursoAtual = null;
let indexParaExcluir = null;
let isEditing = false;
let editingCourseId = null;

if (userBtn && userMenu) {
  userBtn.addEventListener("click", () => userMenu.classList.toggle("open"));
  document.addEventListener("click", e => {
    if (!userMenu.contains(e.target) && e.target !== userBtn) {
      userMenu.classList.remove("open");
    }
  });
}

if (btnCloseModalCurso) btnCloseModalCurso.onclick = () => (modalCurso.style.display = "none");
if (btnCloseModalDisciplina) btnCloseModalDisciplina.onclick = () => (modalDisciplina.style.display = "none");

window.addEventListener("click", e => {
  if (e.target === modalCurso) modalCurso.style.display = "none";
  if (e.target === modalDisciplina) modalDisciplina.style.display = "none";
  if (e.target === modalConfirmacao) modalConfirmacao.style.display = "none";
});

function limparListaCursosDOM() {
  if (!listaCursosEl) return;
  listaCursosEl.innerHTML = "";
}

function criarCardDOM(curso) {
  if (!listaCursosEl) return;
  const card = document.createElement("div");
  card.className = "curso-card";
  card.dataset.id = curso.id;

  const disciplinasText =
    curso.disciplinas && curso.disciplinas.length > 0
      ? `<ul>` +
        curso.disciplinas
          .map(d => {
            const parts = [];
            if (d.codigo) parts.push(d.codigo);
            if (d.sigla) parts.push(d.sigla);
            if (d.periodo) parts.push(`(${d.periodo})`);
            return `<li>${parts.join(" - ")}</li>`;
          })
          .join("") +
        `</ul>`
      : "Nenhuma disciplina cadastrada";

  card.innerHTML = `
    <div class="card-top">${(curso.nome || "SEM NOME").toUpperCase()}</div>
    <div class="card-info">
      <p><b>Disciplinas:</b> ${disciplinasText}</p>
    </div>
    <div class="card-botoes">
      <button class="btn-disciplina">Disciplinas</button>
      <button class="btn-editar">Editar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;

  const btnDisc = card.querySelector(".btn-disciplina");
  const btnEdit = card.querySelector(".btn-editar");
  const btnDel = card.querySelector(".btn-excluir");

  if (btnDisc) btnDisc.addEventListener("click", e => { e.stopPropagation(); abrirModalDisciplina(curso.id); });
  if (btnEdit) btnEdit.addEventListener("click", e => { e.stopPropagation(); editarCurso(curso.id); });
  if (btnDel) btnDel.addEventListener("click", e => { e.stopPropagation(); confirmarExclusaoCurso(curso.id); });

  listaCursosEl.appendChild(card);
}

function renderCursos() {
  limparListaCursosDOM();
  if (!listaCursosEl) return;
  if (!cursos || cursos.length === 0) {
    listaCursosEl.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUM CURSO CADASTRADO AINDA...</p>
        <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
      </div>
    `;
    return;
  }
  cursos.forEach(cr => criarCardDOM(cr));
}

// CADASTRAR / EDITAR CURSO
if (btnCadastroCurso) {
  btnCadastroCurso.addEventListener("click", () => {
    isEditing = false;
    editingCourseId = null;
    cursoAtual = null;
    if (inputNomeCurso) inputNomeCurso.value = "";
    if (modalCurso) modalCurso.style.display = "flex";
  });
}

function editarCurso(id) {
  const curso = cursos.find(c => String(c.id) === String(id));
  if (!curso) return alert("Curso não encontrado!");
  isEditing = true;
  editingCourseId = id;
  cursoAtual = curso;
  if (inputNomeCurso) inputNomeCurso.value = curso.nome;
  if (modalCurso) modalCurso.style.display = "flex";
}

if (btnSalvarCurso) {
  btnSalvarCurso.addEventListener("click", async () => {
    const nome = (inputNomeCurso && inputNomeCurso.value.trim()) || "";
    if (!nome) {
      alert("Preencha o nome do curso!");
      return;
    }

    if (isEditing && editingCourseId) {
      const idx = cursos.findIndex(c => String(c.id) === String(editingCourseId));
      if (idx !== -1) {
        cursos[idx].nome = nome;
        try {
          await salvarCursos(cursos);
        } catch (err) {
          alert("Erro ao salvar curso no servidor. Verifique o console.");
          console.error(err);
        }
        renderCursos();
      }
      if (modalCurso) modalCurso.style.display = "none";
      isEditing = false;
      editingCourseId = null;
      cursoAtual = null;
      return;
    }

    // criar novo curso: precisa id_instituicao salvo no localStorage pela interface de instituicao
    const instituicaoId = localStorage.getItem("selected_instituicao_id");
    if (!instituicaoId) {
      alert("Nenhuma instituição selecionada!");
      return;
    }

    const novoCurso = {
      // sem id — será criado no servidor
      nome,
      id_instituicao: Number(instituicaoId),
      disciplinas: []
    };

    // adicionar temporariamente no array e salvar via API
    cursos.push(novoCurso);
    try {
      await salvarCursos(cursos);
      // recarrega cursos do servidor pra garantir ids e consistência
      cursos = await carregarCursos();
    } catch (err) {
      alert("Erro ao criar curso no servidor. Verifique o console.");
      console.error(err);
      // remove o último elemento que tentamos criar
      cursos = cursos.filter(c => c !== novoCurso);
    }
    renderCursos();
    if (modalCurso) modalCurso.style.display = "none";
    mostrarSucesso("Curso cadastrado com sucesso!");
  });
}

// DISCIPLINAS (abrir modal, adicionar, editar, excluir)
function abrirModalDisciplina(cursoId) {
  const curso = cursos.find(c => String(c.id) === String(cursoId));
  if (!curso) return alert("Curso não encontrado.");
  cursoAtual = curso;
  limparCamposDisciplina();
  atualizarListaDisciplinas();
  if (modalDisciplina) modalDisciplina.style.display = "flex";
}

function limparCamposDisciplina() {
  if (inputCodigoDisciplina) inputCodigoDisciplina.value = "";
  if (inputNomeDisciplina) inputNomeDisciplina.value = "";
  if (inputSiglaDisciplina) inputSiglaDisciplina.value = "";
  if (inputPeriodoDisciplina) inputPeriodoDisciplina.value = "";
}

function atualizarListaDisciplinas() {
  if (!listaDisciplinasEl) return;
  listaDisciplinasEl.innerHTML = "";
  if (!cursoAtual) {
    listaDisciplinasEl.innerHTML = "<div class='sem-disciplinas'>Nenhum curso selecionado</div>";
    return;
  }
  const arr = cursoAtual.disciplinas || [];
  if (arr.length === 0) {
    listaDisciplinasEl.innerHTML = "<div class='sem-disciplinas'>Nenhuma disciplina adicionada</div>";
    return;
  }
  arr.forEach((d, idx) => {
    const item = document.createElement("div");
    item.className = "disc-item";
    item.innerHTML = `
      <span>${d.codigo} - ${d.nome} (${d.sigla}) - ${d.periodo || "S/ período"}</span>
      <div class="disc-buttons">
        <button class="btn-edit" data-idx="${idx}">Editar</button>
        <button class="btn-del" data-idx="${idx}">Excluir</button>
      </div>
    `;
    const btnEdit = item.querySelector(".btn-edit");
    const btnDel = item.querySelector(".btn-del");
    if (btnEdit) btnEdit.addEventListener("click", e => { e.stopPropagation(); editarDisciplina(idx); });
    if (btnDel) btnDel.addEventListener("click", e => { e.stopPropagation(); confirmarExclusao(idx); });
    listaDisciplinasEl.appendChild(item);
  });
}

if (btnAdicionarDisciplina) {
  btnAdicionarDisciplina.addEventListener("click", async () => {
    if (!cursoAtual) return alert("Nenhum curso selecionado para adicionar disciplina.");
    const codigo = (inputCodigoDisciplina && inputCodigoDisciplina.value.trim()) || "";
    const nome = (inputNomeDisciplina && inputNomeDisciplina.value.trim()) || "";
    const sigla = (inputSiglaDisciplina && inputSiglaDisciplina.value.trim().toUpperCase()) || "";
    const periodo = (inputPeriodoDisciplina && inputPeriodoDisciplina.value.trim()) || "";
    if (!codigo || !nome || !sigla || !periodo) {
      return alert("Preencha todos os campos: CÓDIGO, NOME, SIGLA e PERÍODO!");
    }
    if (!Array.isArray(cursoAtual.disciplinas)) cursoAtual.disciplinas = [];
    cursoAtual.disciplinas.push({ codigo, nome, sigla, periodo });
    const idx = cursos.findIndex(c => String(c.id) === String(cursoAtual.id));
    if (idx !== -1) {
      cursos[idx] = cursoAtual;
      try {
        await salvarCursos(cursos); // salva disciplinas via PUT no servidor
        // recarrega pra garantir consistência com DB (opcional)
        cursos = await carregarCursos();
      } catch (err) {
        alert("Erro ao salvar disciplina no servidor. Verifique o console.");
        console.error(err);
      }
    }
    atualizarListaDisciplinas();
    renderCursos();
    mostrarSucesso("Disciplina cadastrada com sucesso!");
    limparCamposDisciplina();
  });
}

function editarDisciplina(index) {
  if (!cursoAtual) return;
  const disc = cursoAtual.disciplinas[index];
  if (!disc) return;
  if (inputCodigoDisciplina) inputCodigoDisciplina.value = disc.codigo;
  if (inputNomeDisciplina) inputNomeDisciplina.value = disc.nome;
  if (inputSiglaDisciplina) inputSiglaDisciplina.value = disc.sigla;
  if (inputPeriodoDisciplina) inputPeriodoDisciplina.value = disc.periodo || "";
  // remove temporariamente para edição
  cursoAtual.disciplinas.splice(index, 1);
  const idx = cursos.findIndex(c => String(c.id) === String(cursoAtual.id));
  if (idx !== -1) {
    cursos[idx] = cursoAtual;
    salvarCursos(cursos).catch(e => console.error(e));
  }
  atualizarListaDisciplinas();
  renderCursos();
}

function confirmarExclusao(index) {
  indexParaExcluir = index;
  if (modalConfirmacao) modalConfirmacao.style.display = "flex";
}

if (btnConfirmSim) {
  btnConfirmSim.addEventListener("click", async () => {
    if (cursoAtual && typeof indexParaExcluir === "number") {
      cursoAtual.disciplinas.splice(indexParaExcluir, 1);
      const idx = cursos.findIndex(c => String(c.id) === String(cursoAtual.id));
      if (idx !== -1) {
        cursos[idx] = cursoAtual;
        try {
          await salvarCursos(cursos);
          cursos = await carregarCursos(); // recarrega para garantir consistência
        } catch (err) {
          console.error(err);
        }
      }
      atualizarListaDisciplinas();
      renderCursos();
      mostrarSucesso("Disciplina excluída com sucesso!");
    }
    if (modalConfirmacao) modalConfirmacao.style.display = "none";
    indexParaExcluir = null;
  });
}

if (btnConfirmNao) {
  btnConfirmNao.addEventListener("click", () => {
    if (modalConfirmacao) modalConfirmacao.style.display = "none";
    indexParaExcluir = null;
  });
}

// EXCLUIR CURSO
function confirmarExclusaoCurso(id) {
  cursoAtual = cursos.find(c => String(c.id) === String(id));
  if (!cursoAtual) return;
  if (modalConfirmacao) modalConfirmacao.style.display = "flex";
  if (btnConfirmSim) {
    btnConfirmSim.onclick = async () => {
      await excluirCursoPorId(id);
      if (modalConfirmacao) modalConfirmacao.style.display = "none";
      mostrarSucesso("Curso excluído com sucesso!");
    };
  }
  if (btnConfirmNao) {
    btnConfirmNao.onclick = () => {
      if (modalConfirmacao) modalConfirmacao.style.display = "none";
    };
  }
}

async function excluirCursoPorId(id) {
  // remove localmente da lista e tenta deletar no servidor
  cursos = cursos.filter(c => String(c.id) !== String(id));
  try {
    await apiDeleteCurso(id);
    // atualizar lista do servidor
    cursos = await carregarCursos();
  } catch (e) {
    console.error("excluirCursoPorId: erro API:", e);
    // já removemos da view; notificar usuário
    alert("Erro ao excluir no servidor. Verifique o console.");
  }
  renderCursos();
}

// INICIALIZAÇÃO
(async function init() {
  cursos = await carregarCursos();
  renderCursos();
})();

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
