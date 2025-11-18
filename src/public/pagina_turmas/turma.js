// ALUNO: SARA FERNANDES MONTEIRO   ||   RA: 25024107

//================================================================================================================
//                                    BOTAO DE MENU (ABRIR E FECHAR O DROPDOWN)
//================================================================================================================
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
});



const userMenu = document.querySelector('.user-menu');
const userBtn = document.querySelector('#user-btn');

userBtn.addEventListener('click', () => {
  userMenu.classList.toggle('open');
});

// FECHAR SE CLICAR FORA
document.addEventListener('click', (e) => {
  if (!userMenu.contains(e.target)) {
    userMenu.classList.remove('open');
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

//================================================================================================================
//                                    FUNÇÃO DE SUCESSO (PADRÃO CURSOS)
//================================================================================================================

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

//================================================================================================================
//                  FUNCIONAMENTO DOS BOTOES MODAL DA PAGINA (CADASTRO DE TURMAS E IMPORTAR ALUNOS)
//================================================================================================================

function configurarModal(botaoId, modalId) {
  const modal = document.getElementById(modalId);
  const btnAbrir = document.getElementById(botaoId);
  // proteções
  if (!modal || !btnAbrir) return;
  const btnFechar = modal.querySelector(".fechar");

  btnAbrir.onclick = () => modal.style.display = "flex";
  if (btnFechar) btnFechar.onclick = () => modal.style.display = "none";

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

configurarModal("cadastro-turma", "modal-turma");
configurarModal("import-aluno", "modal-importar-alunos");

//========================================================================================================================
//                                                   BTN CADASTRO DE TURMAS
//========================================================================================================================

const containerTurmas = document.querySelector(".container-turmas");
const modalTurma = document.getElementById("modal-turma");
const btnSalvarTurma = document.getElementById("confirmar-cadastro-turma");

const selectCurso = document.getElementById("cursoTurma");
const selectDisciplina = document.getElementById("disciplinaTurma");

const inputCodigo = document.getElementById("codTurma");
const inputNome = document.getElementById("nomeTurma");

// ===============================
// DADOS (leitura atual do storage sempre que necessário)
// ===============================
function lerCursosStorage() {
  try {
    return JSON.parse(localStorage.getItem("cursos")) || [];
  } catch (e) {
    console.error("Erro lendo cursos do storage:", e);
    return [];
  }
}

function lerTurmasStorage() {
  try {
    return JSON.parse(localStorage.getItem("turmas")) || [];
  } catch (e) {
    console.error("Erro lendo turmas do storage:", e);
    return [];
  }
}

function salvarTurmasLS(turmasArray) {
  try {
    localStorage.setItem("turmas", JSON.stringify(turmasArray));
  } catch (e) {
    console.error("Erro salvando turmas:", e);
  }
}

// inicializa arrays
let cursos = lerCursosStorage();
let turmas = lerTurmasStorage();
let turmaEditando = null;

// ===============================
// HELPERS: recarregar cursos (sempre chamar antes de usar selectCurso)
// ===============================
function carregarCursosNoSelect() {
  cursos = lerCursosStorage(); // garante versão mais recente
  if (!selectCurso) return;

  // default
  selectCurso.innerHTML = `<option value="">SELECIONE UM CURSO</option>`;

  if (!Array.isArray(cursos) || cursos.length === 0) {
    // mantem apenas opção padrão
    return;
  }

  cursos.forEach(curso => {
    // proteja caso curso.id ou curso.nome não existam
    const opt = document.createElement("option");
    opt.value = curso.id !== undefined ? String(curso.id) : String(curso.nome || "");
    opt.textContent = curso.nome || curso.id || "Curso sem nome";
    selectCurso.appendChild(opt);
  });
}

// disciplina começa bloqueada
function resetDisciplinaSelect() {
  if (!selectDisciplina) return;
  selectDisciplina.disabled = true;
  selectDisciplina.innerHTML = `<option value="">SELECIONE UM CURSO PRIMEIRO</option>`;
}
resetDisciplinaSelect();

// ===============================
// carregar disciplinas de um curso (usa o objeto curso)
// ===============================
function carregarDisciplinasDoCursoObj(cursoObj) {
  if (!selectDisciplina) return;
  selectDisciplina.innerHTML = `<option value="">SELECIONE UMA DISCIPLINA</option>`;

  if (!cursoObj || !Array.isArray(cursoObj.disciplinas) || cursoObj.disciplinas.length === 0) {
    selectDisciplina.disabled = true;
    selectDisciplina.innerHTML = `<option value="">NENHUMA DISCIPLINA CADASTRADA</option>`;
    return;
  }

  cursoObj.disciplinas.forEach(d => {
    const opt = document.createElement("option");
    // usamos codigo como value quando disponível (mais estável)
    opt.value = d.codigo !== undefined ? String(d.codigo) : String(d.nome);
    opt.textContent = d.nome ? `${d.nome} (${d.codigo || ""})` : d.codigo || "Disciplina";
    selectDisciplina.appendChild(opt);
  });

  selectDisciplina.disabled = false;
}

// evento ao mudar curso
if (selectCurso) {
  selectCurso.addEventListener("change", () => {
    // garantimos dados atualizados
    cursos = lerCursosStorage();

    const cursoId = selectCurso.value;
    if (!cursoId) {
      resetDisciplinaSelect();
      return;
    }

    // procurar curso comparando como string (evita problema number vs string)
    const cursoObj = cursos.find(c => String(c.id) === String(cursoId));
    if (!cursoObj) {
      resetDisciplinaSelect();
      return;
    }

    carregarDisciplinasDoCursoObj(cursoObj);
  });
}

//================================================================================================================
//                        VARIÁVEIS GLOBAIS PARA CONTROLE DE EXCLUSÃO
//================================================================================================================

const modalConfirmacao = document.getElementById('modalConfirmacao');
const btnConfirmarSim = document.getElementById('confirmarSim');
const btnConfirmarNao = document.getElementById('confirmarNao');

let itemParaExcluir = null; // Armazena { tipo: 'turma'|'aluno', id/index, dados }

//================================================================================================================
//                            FUNÇÕES DE CONFIRMAÇÃO DE EXCLUSÃO
//================================================================================================================

function confirmarExclusaoTurma(turmaId) {
  itemParaExcluir = { tipo: 'turma', id: turmaId };
  modalConfirmacao.style.display = 'flex';
}

function confirmarExclusaoAluno(index) {
  itemParaExcluir = { tipo: 'aluno', index: index };
  modalConfirmacao.style.display = 'flex';
}

// Botão SIM
if (btnConfirmarSim) {
  btnConfirmarSim.addEventListener('click', () => {
    if (!itemParaExcluir) {
      modalConfirmacao.style.display = 'none';
      return;
    }

    if (itemParaExcluir.tipo === 'turma') {
      excluirTurmaPorId(itemParaExcluir.id);
      mostrarSucesso("Turma excluída com sucesso!");
    } else if (itemParaExcluir.tipo === 'aluno') {
      excluirAlunoConfirmado(itemParaExcluir.index);
      mostrarSucesso("Aluno excluído com sucesso!");
    }

    modalConfirmacao.style.display = 'none';
    itemParaExcluir = null;
  });
}

// Botão NÃO
if (btnConfirmarNao) {
  btnConfirmarNao.addEventListener('click', () => {
    modalConfirmacao.style.display = 'none';
    itemParaExcluir = null;
  });
}

// Fechar clicando fora
window.addEventListener('click', (e) => {
  if (e.target === modalConfirmacao) {
    modalConfirmacao.style.display = 'none';
    itemParaExcluir = null;
  }
});

//================================================================================================================
//                                    FUNÇÕES DE EXCLUSÃO
//================================================================================================================

function excluirTurmaPorId(id) {
  turmas = turmas.filter(t => String(t.id) !== String(id));
  salvarTurmasLS(turmas);
  atualizarListaTurmas();
}

function excluirAlunoConfirmado(index) {
  const turmaAtual = obterTurmaAtual();
  if (!turmaAtual || !Array.isArray(turmaAtual.alunos)) return;

  turmaAtual.alunos.splice(index, 1);

  // salva no storage
  let turmasAgora = lerTurmasStorageSafe();
  turmasAgora = turmasAgora.map(t => String(t.id) === String(turmaSelecionadaId) ? turmaAtual : t);
  salvarTurmasComFallback(turmasAgora);

  atualizarListaAlunos();
  limparFormularioAluno();
}

// ===============================
// criar card (inclui botão Alunos igual antes)
// ===============================
function criarCardTurma(turma) {
  const card = document.createElement("div");
  card.classList.add("card-turma");

  card.innerHTML = `
    <h3>${turma.nome}</h3>
    <p><strong>Código:</strong> ${turma.codigo}</p>
    <p><strong>Curso:</strong> ${turma.cursoNome || turma.curso || ''}</p>
    <p><strong>Disciplina:</strong><br>• ${turma.disciplinaNome || turma.disciplina || ''}</p>

    <div class="botoes-card">
      <button class="btn-card editar">Editar</button>
      <button class="btn-card excluir">Excluir</button>
      <button class="btn-card adicionar">Alunos</button>
      <button class="btn-card notas">Notas</button>

    </div>
  `;

  // BOTÃO ALUNOS
  const btnAlunos = card.querySelector(".adicionar");
  if (btnAlunos) {
    btnAlunos.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof abrirModalAlunos === "function") {
        abrirModalAlunos(turma.id);
      } else {
        turmaSelecionada = turma;
        if (typeof atualizarListaAlunos === "function") atualizarListaAlunos();
        if (typeof modalAluno !== "undefined" && modalAluno) modalAluno.style.display = "flex";
      }
    });
  }

  // EDITAR
  const btnEditar = card.querySelector(".editar");
  if (btnEditar) {
    btnEditar.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof abrirModalEdicaoTurma === "function") {
        abrirModalEdicaoTurma(turma);
      } else if (typeof editarTurma === "function") {
        editarTurma(turma);
      }
    });
  }

  // EXCLUIR - AGORA COM CONFIRMAÇÃO
  const btnExcluir = card.querySelector(".excluir");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", (e) => {
      e.stopPropagation();
      confirmarExclusaoTurma(turma.id); // Chama modal de confirmação
    });
  }

  // BOTÃO NOTAS
  const btnNotas = card.querySelector(".notas");
  if (btnNotas) {
    btnNotas.addEventListener("click", (e) => {
      e.stopPropagation();

      if (typeof abrirModalNotas === "function") {
        abrirModalNotas(turma.id);
      } else {
        turmaSelecionada = turma;
        if (typeof atualizarListaNotas === "function") {
          atualizarListaNotas();
        }
        if (typeof modalNotas !== "undefined" && modalNotas) {
          modalNotas.style.display = "flex";
        }
      }
    });
  }

  return card;
}

// ===============================
// abrir modal em edição (preenche e abre)
// ===============================
function abrirModalEdicaoTurma(turma) {
  turmaEditando = turma;

  // garantir cursos atualizados no select
  carregarCursosNoSelect();

  // preencher campos básicos
  if (inputCodigo) inputCodigo.value = turma.codigo || "";
  if (inputNome) inputNome.value = turma.nome || "";

  // setar curso (cursoId) – comparar por string
  if (selectCurso) selectCurso.value = turma.cursoId ? String(turma.cursoId) : "";

  // carregar disciplinas do curso selecionado (procura curso atual)
  cursos = lerCursosStorage();
  const cursoObj = cursos.find(c => String(c.id) === String(turma.cursoId));
  if (cursoObj) {
    carregarDisciplinasDoCursoObj(cursoObj);

    // selecionar disciplina
    const wanted = turma.disciplinaCodigo || turma.disciplinaNome || turma.disciplina;
    if (wanted && selectDisciplina) {
      const optionToSelect = Array.from(selectDisciplina.options).find(opt => String(opt.value) === String(wanted) || opt.textContent.includes(String(wanted)));
      if (optionToSelect) selectDisciplina.value = optionToSelect.value;
    }
  } else {
    resetDisciplinaSelect();
  }

  if (btnSalvarTurma) btnSalvarTurma.textContent = "SALVAR";
  if (modalTurma) modalTurma.style.display = "flex";
}

// ===============================
// listar turmas (renderizar)
// ===============================
function atualizarListaTurmas() {
  if (!containerTurmas) return;
  containerTurmas.innerHTML = "";

  // recarregar turmas do storage (sempre atual)
  turmas = lerTurmasStorage();

  if (!turmas || turmas.length === 0) {
    containerTurmas.innerHTML = `
      <div class="nada-cadastrado">
        <p>NENHUMA TURMA CADASTRADA AINDA...</p>
        <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
      </div>
    `;
    return;
  }

  turmas.forEach(t => containerTurmas.appendChild(criarCardTurma(t)));
}

// inicial render
carregarCursosNoSelect();
atualizarListaTurmas();

// ===============================
// salvar (novo + edição)
// ===============================
if (btnSalvarTurma) {
  btnSalvarTurma.addEventListener("click", () => {
    // ler e validar campos
    const codigo = inputCodigo ? inputCodigo.value.trim() : "";
    const nome = inputNome ? inputNome.value.trim() : "";
    const cursoId = selectCurso ? selectCurso.value : "";
    const disciplinaValue = selectDisciplina ? selectDisciplina.value : "";

    if (!codigo || !nome || !cursoId || !disciplinaValue) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    // garantir cursos atualizados
    cursos = lerCursosStorage();
    const cursoObj = cursos.find(c => String(c.id) === String(cursoId));
    if (!cursoObj) {
      alert("Curso inválido.");
      return;
    }

    // tentar resolver disciplina nome/codigo
    let disciplinaNome = disciplinaValue;
    let disciplinaCodigo = disciplinaValue;
    const discObj = (cursoObj.disciplinas || []).find(d => String(d.codigo) === String(disciplinaValue) || String(d.nome) === String(disciplinaValue));
    if (discObj) {
      disciplinaNome = discObj.nome;
      disciplinaCodigo = discObj.codigo;
    }

    if (turmaEditando) {
      // editar
      turmaEditando.codigo = codigo;
      turmaEditando.nome = nome;
      turmaEditando.cursoId = String(cursoObj.id);
      turmaEditando.cursoNome = cursoObj.nome;
      turmaEditando.disciplinaNome = disciplinaNome;
      turmaEditando.disciplinaCodigo = disciplinaCodigo;
      turmaEditando = null;
      if (btnSalvarTurma) btnSalvarTurma.textContent = "CADASTRAR";
      mostrarSucesso("Turma editada com sucesso!");
    } else {
      // novo
      const novo = {
        id: Date.now(),
        codigo,
        nome,
        cursoId: String(cursoObj.id),
        cursoNome: cursoObj.nome,
        disciplinaNome,
        disciplinaCodigo,
        alunos: []
      };
      turmas.push(novo);
      mostrarSucesso("Turma cadastrada com sucesso!");
    }

    salvarTurmasLS(turmas);
    atualizarListaTurmas();

    // fechar modal e limpar
    if (modalTurma) modalTurma.style.display = "none";
    if (inputCodigo) inputCodigo.value = "";
    if (inputNome) inputNome.value = "";
    if (selectCurso) selectCurso.value = "";
    resetDisciplinaSelect();
  });
}

// ==================== INICIAR LISTA =====================

atualizarListaTurmas();

// =========================
// LISTAGEM E CADASTRO DE ALUNOS
// =========================

const modalAluno = document.getElementById('modal-aluno');
const btnFecharAluno = document.getElementById('fecharModalAluno');
const btnConfirmarCadastroAluno = document.getElementById('confirmar-cadastro-aluno');
const raInput = document.getElementById('raAluno');
const nomeInput = document.getElementById('nomeAluno');
const tbodyAlunos = document.getElementById('corpo-lista-alunos');

let turmaSelecionadaId = null;
let alunoEditandoIndex = null;

function lerTurmasStorageSafe() {
  try {
    return JSON.parse(localStorage.getItem('turmas')) || [];
  } catch (e) {
    console.error('Erro lendo turmas do storage:', e);
    return [];
  }
}

function salvarTurmasComFallback(turmasArray) {
  try {
    if (typeof salvarTurmasLS === 'function') {
      salvarTurmasLS(turmasArray);
    } else if (typeof salvarTurmasLocalStorage === 'function') {
      salvarTurmasLocalStorage(turmasArray);
    } else {
      localStorage.setItem('turmas', JSON.stringify(turmasArray));
    }
  } catch (e) {
    console.error('Erro ao salvar turmas:', e);
  }
}

function obterTurmaAtual() {
  const turmasAgora = lerTurmasStorageSafe();
  if (!turmaSelecionadaId) return null;
  return turmasAgora.find(t => String(t.id) === String(turmaSelecionadaId)) || null;
}

function atualizarListaAlunos() {
  tbodyAlunos.innerHTML = '';

  const turmaAtual = obterTurmaAtual();
  if (!turmaAtual || !Array.isArray(turmaAtual.alunos) || turmaAtual.alunos.length === 0) {
    tbodyAlunos.innerHTML = `<tr><td colspan="3" style="text-align:center; font-style: italic;">Nenhum aluno cadastrado nesta turma.</td></tr>`;
    return;
  }

  turmaAtual.alunos.forEach((aluno, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${aluno.ra}</td>
      <td>${aluno.nome}</td>
      <td>
        <div class="botoes-acoes">
          <button class="editar" data-index="${index}">Editar</button>
          <button class="excluir" data-index="${index}">Excluir</button>
        </div>
      </td>
    `;
    tbodyAlunos.appendChild(tr);
  });

  tbodyAlunos.querySelectorAll('button.editar').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.target.getAttribute('data-index'));
      carregarAlunoParaEdicao(idx);
    });
  });

  tbodyAlunos.querySelectorAll('button.excluir').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.target.getAttribute('data-index'));
      confirmarExclusaoAluno(idx); // Chama modal de confirmação
    });
  });
}

function abrirModalAlunos(turmaId) {
  turmaSelecionadaId = String(turmaId);
  alunoEditandoIndex = null;
  btnConfirmarCadastroAluno.textContent = 'CADASTRAR';

  atualizarListaAlunos();
  if (modalAluno) modalAluno.style.display = 'flex';
}

function carregarAlunoParaEdicao(index) {
  const turmaAtual = obterTurmaAtual();
  if (!turmaAtual || !Array.isArray(turmaAtual.alunos)) return;

  const aluno = turmaAtual.alunos[index];
  if (!aluno) return;

  raInput.value = aluno.ra || '';
  nomeInput.value = aluno.nome || '';
  alunoEditandoIndex = index;
  btnConfirmarCadastroAluno.textContent = 'SALVAR';
  if (modalAluno) modalAluno.style.display = 'flex';
}

function limparFormularioAluno() {
  if (raInput) raInput.value = '';
  if (nomeInput) nomeInput.value = '';
  alunoEditandoIndex = null;
  btnConfirmarCadastroAluno.textContent = 'CADASTRAR';
}

if (btnConfirmarCadastroAluno) {
  btnConfirmarCadastroAluno.addEventListener('click', () => {
    const ra = raInput ? raInput.value.trim() : '';
    const nome = nomeInput ? nomeInput.value.trim() : '';

    if (!ra || !nome) {
      alert('Preencha RA e Nome Completo!');
      return;
    }

    const turmaAtual = obterTurmaAtual();
    if (!turmaAtual) {
      alert('Selecione uma turma antes de cadastrar alunos.');
      return;
    }

    if (!Array.isArray(turmaAtual.alunos)) turmaAtual.alunos = [];

    const raExiste = turmaAtual.alunos.some((a, idx) => {
      if (alunoEditandoIndex !== null && Number(alunoEditandoIndex) === Number(idx)) return false;
      return String(a.ra) === String(ra);
    });

    if (raExiste) {
      alert('RA já cadastrado nesta turma!');
      return;
    }

    if (alunoEditandoIndex !== null) {
      turmaAtual.alunos[alunoEditandoIndex] = { ra, nome };
      mostrarSucesso("Aluno editado com sucesso!");
    } else {
      turmaAtual.alunos.push({ ra, nome });
      mostrarSucesso("Aluno cadastrado com sucesso!");
    }

    let turmasAgora = lerTurmasStorageSafe();
    turmasAgora = turmasAgora.map(t => String(t.id) === String(turmaSelecionadaId) ? turmaAtual : t);
    salvarTurmasComFallback(turmasAgora);

    atualizarListaAlunos();
    limparFormularioAluno();
  });
}

if (btnFecharAluno) {
  btnFecharAluno.addEventListener('click', () => {
    if (modalAluno) modalAluno.style.display = 'none';
    limparFormularioAluno();
    turmaSelecionadaId = null;
  });
}

window.addEventListener('click', (e) => {
  if (e.target === modalAluno) {
    if (modalAluno) modalAluno.style.display = 'none';
    limparFormularioAluno();
    turmaSelecionadaId = null;
  }
});

//================================================================================================================
//                       MODAL DE NOTAS (VISUALIZAÇÃO DA TABELA ALUNOS E COLUNAS DOS COMPONENTES)
//================================================================================================================

const modalNotas = document.getElementById("modal-notas");
if (modalNotas) modalNotas.style.display = "none";
const fecharModalNotas = document.getElementById("fecharModalNotas");
const conteudoNotas = document.getElementById("conteudoNotas");

let turmaAtualNotasId = null;
let colunaEditandoSigla = null;

function _norm(v) {
  return (v === undefined || v === null) ? "" : String(v).trim().toLowerCase();
}

function salvarTurmasStorage(turmas) {
  localStorage.setItem("turmas", JSON.stringify(turmas));
}

function abrirModalNotas(turmaId) {
  turmaAtualNotasId = turmaId;

  if (modalNotas) modalNotas.style.display = "flex";

  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaId));

  if (!turma) {
    if (conteudoNotas) {
      conteudoNotas.innerHTML = `
        <div class="nada-cadastrado">
          <p>TURMA NÃO ENCONTRADA.</p>
        </div>
      `;
    }
    return;
  }

  const alunos = Array.isArray(turma.alunos) ? turma.alunos : [];

  const discNomeTurma = _norm(turma.disciplinaNome || turma.disciplina || "");
  const discCodigoTurma = _norm(turma.disciplinaCodigo || "");

  if (!discNomeTurma && !discCodigoTurma) {
    if (conteudoNotas) {
      conteudoNotas.innerHTML = `
        <div class="nada-cadastrado">
          <p>ESTA TURMA NÃO POSSUI DISCIPLINA DEFINIDA!</p>
          <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
        </div>
      `;
    }
    return;
  }

  const componentesAll = JSON.parse(localStorage.getItem("componentes")) || [];

  const componentesDaDisciplina = componentesAll.filter(c => {
    const cDisc = _norm(c.disciplinaNome || c.disciplina || "");
    const cDiscCode = _norm(c.disciplinaCodigo || "");
    return (cDisc && (cDisc === discNomeTurma || cDisc === discCodigoTurma))
      || (cDiscCode && (cDiscCode === discCodigoTurma || cDiscCode === discNomeTurma));
  });

  if (!componentesDaDisciplina || componentesDaDisciplina.length === 0) {
    if (conteudoNotas) {
      conteudoNotas.innerHTML = `
        <div class="nada-cadastrado">
          <p>VOCÊ AINDA NÃO CADASTROU NENHUMA ATIVIDADE PARA ESTA DISCIPLINA...</p>
          <img src="../images/imagem_alunos.png" class="img-nada-cadastrado">
        </div>
        <div style="margin-top:10px">
          <a href="../Pagina_atividades/atividades.html" id="atividades-modal">ACESSE A PÁGINA DE ATIVIDADES E CADASTRE!</a>
        </div>
      `;
    }
    return;
  }

  let html = `
    <div class="tabela-notas-container">
      <table class="tabela-notas">
        <thead>
          <tr>
            <th>RA</th>
            <th>NOME</th>
  `;

  componentesDaDisciplina.forEach(comp => {
    const titulo = comp.sigla ? comp.sigla : (comp.nome ? comp.nome.slice(0, 6) : "ATV");

    html += `<th class="col-nota" title="${comp.nome || ''}">
      ${titulo}
      <span
        class="btn-editar-coluna"
        data-sigla="${comp.sigla}"
        title="Editar notas dessa coluna"
        tabindex="0"
        role="button"
        aria-label="Editar notas da coluna ${comp.sigla}"
      >🔒</span>
    </th>`;
  });

  if (componentesDaDisciplina.length > 0) {
    html += `<th class="col-nota-final">Notas Finais</th>`;
  }

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  if (alunos.length === 0) {
    html += `
      <tr>
        <td colspan="${2 + componentesDaDisciplina.length + 1}" class="nenhum-aluno">
          Nenhum aluno cadastrado nesta turma.
        </td>
      </tr>`;
  } else {
    alunos.forEach(aluno => {
      const ra = aluno.ra || "";
      const nome = aluno.nome || "";

      html += `<tr data-ra="${ra}">`;
      html += `<td>${ra}</td>`;
      html += `<td class="col-nome">${nome}</td>`;

      componentesDaDisciplina.forEach(comp => {
        const notaSalva = turma.notas?.[ra]?.[comp.sigla] ?? "";

        html += `
          <td class="col-nota" data-sigla="${comp.sigla}">
            <input 
              class="nota-input" 
              type="text" 
              value="${notaSalva}" 
              style="background-color:#eee; border: 2px solid #ccc; cursor: not-allowed; text-align: center;" 
              data-sigla="${comp.sigla}"
              placeholder="-"
              disabled
            >
          </td>
        `;
      });

      const notaFinal = turma.notas?.[ra]?.['FINAL'] ?? "";

      html += `
        <td class="col-nota-final">
          <input 
            class="nota-input nota-final" 
            type="text"
            value="${notaFinal}" 
            style="background-color:#eee; border: 2px solid #ccc; cursor: not-allowed;"
            placeholder="-"
            disabled
          >
        </td>
      `;

      html += `</tr>`;
    });
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  if (conteudoNotas) conteudoNotas.innerHTML = html;

  ativarEdicaoNotas();
  aplicarValidacaoNotas();
}

function aplicarValidacaoNotas() {
  const inputs = document.querySelectorAll("#modal-notas input.nota-input");
  
  inputs.forEach(input => {
    input.addEventListener('keydown', function(e) {
      if (e.key === ',') {
        e.preventDefault();
        const cursorPos = this.selectionStart;
        const value = this.value;
        
        if (!value.includes('.')) {
          this.value = value.slice(0, cursorPos) + '.' + value.slice(cursorPos);
          this.selectionStart = this.selectionEnd = cursorPos + 1;
        }
      }
    });

    input.addEventListener('input', function() {
      let valor = parseFloat(this.value);
      
      if (valor > 10) {
        this.value = 10;
      }
      else if (valor < 0) {
        this.value = 0;
      }
    });

    input.addEventListener('blur', function() {
      let valor = this.value.trim();
      
      valor = valor.replace(',', '.');
      
      if (valor && !isNaN(valor)) {
        let num = parseFloat(valor);
        num = Math.max(0, Math.min(10, num));
        this.value = num.toFixed(2);
      } else if (valor !== '') {
        this.value = '';
      }
    });
  });
}

function ativarEdicaoNotas() {
  const botoesEditar = document.querySelectorAll("#modal-notas .btn-editar-coluna");
  const tabela = document.querySelector("#modal-notas table.tabela-notas");
  if (!tabela) return;

  botoesEditar.forEach(btn => {
    btn.textContent = "🔒";
    btn.style.cursor = "pointer";

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const sigla = btn.getAttribute("data-sigla");

      let idxColuna = -1;
      tabela.querySelectorAll("thead th").forEach((th, idx) => {
        const btnCol = th.querySelector(".btn-editar-coluna");
        if (btnCol && btnCol.getAttribute("data-sigla") === sigla) {
          idxColuna = idx;
        }
      });
      
      if (idxColuna === -1) return;

      if (btn.textContent === "✅") {
        salvarNotasColuna(sigla, tabela);
        bloquearColuna(tabela, idxColuna);
        btn.textContent = "🔒";
        colunaEditandoSigla = null;
        mostrarSucesso("Notas salvas com sucesso!");
        return;
      }

      if (colunaEditandoSigla !== null && colunaEditandoSigla !== sigla) {
        alert("Salve a coluna atual antes de editar outra!");
        return;
      }

      liberarColuna(tabela, idxColuna);
      btn.textContent = "✅";
      colunaEditandoSigla = sigla;
    };
  });
}

function bloquearTodosInputs(tabela) {
  tabela.querySelectorAll("tbody tr input.nota-input").forEach(input => {
    input.disabled = true;
    input.style.backgroundColor = "#eee";
    input.style.border = "1px solid #ccc";
    input.style.cursor = "not-allowed";
  });
}

function bloquearColuna(tabela, idxColuna) {
  tabela.querySelectorAll("tbody tr").forEach(tr => {
    const td = tr.cells[idxColuna];
    if (!td) return;
    const input = td.querySelector("input.nota-input");
    if (!input) return;
    
    input.disabled = true;
    input.setAttribute("disabled", "disabled");
    input.style.backgroundColor = "#eee";
    input.style.border = "2px solid #ccc";
    input.style.cursor = "not-allowed";
    input.style.pointerEvents = "none";
  });
}

function liberarColuna(tabela, idxColuna) {
  tabela.querySelectorAll("tbody tr").forEach(tr => {
    const td = tr.cells[idxColuna];
    if (!td) return;
    const input = td.querySelector("input.nota-input");
    if (!input) return;
    
    input.disabled = false;
    input.removeAttribute("disabled");
    input.readOnly = false;
    input.removeAttribute("readonly");
    
    input.style.backgroundColor = "#fff";
    input.style.cursor = "text";
    input.style.border = "2px solid #1e87a3";
    input.style.outline = "none";
    input.style.pointerEvents = "auto";
    
    input.tabIndex = 0;
  });
  
  tabela.offsetHeight;
}

function salvarNotasColuna(sigla, tabela) {
  const turmas = lerTurmasStorageSafe();
  const turma = turmas.find(t => String(t.id) === String(turmaAtualNotasId));
  if (!turma) return alert("Turma não encontrada ao salvar.");

  let idxCol = -1;
  tabela.querySelectorAll("thead th").forEach((th, idx) => {
    const btnCol = th.querySelector(".btn-editar-coluna");
    if (btnCol && btnCol.getAttribute("data-sigla") === sigla) {
      idxCol = idx;
    }
  });
  if (idxCol === -1) return;

  tabela.querySelectorAll("tbody tr").forEach(tr => {
    const ra = tr.getAttribute("data-ra");
    const td = tr.cells[idxCol];
    if (!td) return;
    const input = td.querySelector("input.nota-input");
    if (!input) return;

    let valor = input.value.trim();
    
    if (valor !== "") {
      let num = parseFloat(valor);
      if (!isNaN(num)) {
        num = Math.max(0, Math.min(10, num));
        valor = num.toFixed(2);
        input.value = valor;
      }
    }

    if (!turma.notas) turma.notas = {};
    if (!turma.notas[ra]) turma.notas[ra] = {};

    turma.notas[ra][sigla] = valor;
  });

  salvarTurmasStorage(turmas);
}

if (fecharModalNotas) {
  fecharModalNotas.addEventListener("click", () => {
    if (modalNotas) modalNotas.style.display = "none";
    colunaEditandoSigla = null;
  });
}

window.addEventListener("click", (e) => {
  if (modalNotas && e.target === modalNotas) {
    modalNotas.style.display = "none";
    colunaEditandoSigla = null;
  }
});

//================================================================================================================
//                       SISTEMA DE PESOS (PARA CÁLCULO DE MÉDIA SIMPLES E PONDERADA)
//================================================================================================================

const selectTipoMedia = document.getElementById('tipo-media');
const containerPesos = document.getElementById('container-pesos');
const listaPesos = document.getElementById('lista-pesos');
const btnSalvarPesos = document.getElementById('btn-salvar-pesos');
const btnMostrarPesos = document.getElementById('btn-mostrar-pesos');

if (selectTipoMedia) {
  selectTipoMedia.addEventListener('change', (e) => {
    const tipoSelecionado = e.target.value;
    
    if (tipoSelecionado === 'ponderada') {
      carregarPesosParaEdicao();
      containerPesos.classList.remove('oculto');
      btnMostrarPesos.classList.add('oculto');
    } else if (tipoSelecionado === 'simples') {
      containerPesos.classList.add('oculto');
      btnMostrarPesos.classList.add('oculto');
      
      salvarTipoMedia('simples');
    }
  });
}

function carregarPesosParaEdicao() {
  if (!turmaAtualNotasId) return;
  
  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaAtualNotasId));
  
  if (!turma) return;
  
  const discNomeTurma = _norm(turma.disciplinaNome || turma.disciplina || "");
  const discCodigoTurma = _norm(turma.disciplinaCodigo || "");
  
  const componentesAll = JSON.parse(localStorage.getItem("componentes")) || [];
  const componentesDaDisciplina = componentesAll.filter(c => {
    const cDisc = _norm(c.disciplinaNome || c.disciplina || "");
    const cDiscCode = _norm(c.disciplinaCodigo || "");
    return (cDisc && (cDisc === discNomeTurma || cDisc === discCodigoTurma))
        || (cDiscCode && (cDiscCode === discCodigoTurma || cDiscCode === discNomeTurma));
  });
  
  if (componentesDaDisciplina.length === 0) {
    listaPesos.innerHTML = '<p style="text-align:center; color:#999;">Nenhum componente encontrado.</p>';
    return;
  }
  
  const pesosSalvos = turma.pesos || {};
  
  listaPesos.innerHTML = '';
  componentesDaDisciplina.forEach(comp => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-peso';
    
    const pesoAtual = pesosSalvos[comp.sigla] || 1;
    
    itemDiv.innerHTML = `
    <label>${comp.sigla}</label>
      <select data-componente="${comp.sigla}">
        ${[1,2,3,4,5,6,7,8,9,10].map(p => 
          `<option value="${p}" ${p === pesoAtual ? 'selected' : ''}>${p}</option>`
        ).join('')}
      </select>
    `;
    
    listaPesos.appendChild(itemDiv);
  });
}

if (btnSalvarPesos) {
  btnSalvarPesos.addEventListener('click', () => {
    if (!turmaAtualNotasId) return;
    
    const turmasAgora = lerTurmasStorageSafe();
    const turma = turmasAgora.find(t => String(t.id) === String(turmaAtualNotasId));
    
    if (!turma) return;
    
    const selects = listaPesos.querySelectorAll('select[data-componente]');
    const pesos = {};
    
    selects.forEach(select => {
      const componente = select.getAttribute('data-componente');
      const peso = parseInt(select.value);
      pesos[componente] = peso;
    });
    
    turma.pesos = pesos;
    turma.tipoMedia = 'ponderada';
    
    let todasTurmas = lerTurmasStorageSafe();
    todasTurmas = todasTurmas.map(t => String(t.id) === String(turmaAtualNotasId) ? turma : t);
    salvarTurmasComFallback(todasTurmas);
    
    containerPesos.classList.add('oculto');
    btnMostrarPesos.classList.remove('oculto');
    
    mostrarSucesso('Pesos salvos com sucesso!');
  });
}

if (btnMostrarPesos) {
  btnMostrarPesos.addEventListener('click', () => {
    carregarPesosParaEdicao();
    containerPesos.classList.remove('oculto');
    btnMostrarPesos.classList.add('oculto');
  });
}

function salvarTipoMedia(tipo) {
  if (!turmaAtualNotasId) return;
  
  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaAtualNotasId));
  
  if (!turma) return;
  
  turma.tipoMedia = tipo;
  if (tipo === 'simples') {
    delete turma.pesos;
  }
  
  let todasTurmas = lerTurmasStorageSafe();
  todasTurmas = todasTurmas.map(t => String(t.id) === String(turmaAtualNotasId) ? turma : t);
  salvarTurmasComFallback(todasTurmas);
}

function abrirModalNotasComPesos(turmaId) {
  turmaAtualNotasId = String(turmaId);
  
  abrirModalNotas(turmaId);
  
  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaId));
  
  if (turma && selectTipoMedia) {
    containerPesos.classList.add('oculto');
    btnMostrarPesos.classList.add('oculto');
    
    if (turma.tipoMedia === 'simples') {
      selectTipoMedia.value = 'simples';
    } else if (turma.tipoMedia === 'ponderada') {
      selectTipoMedia.value = 'ponderada';
      btnMostrarPesos.classList.remove('oculto');
    } else {
      selectTipoMedia.value = '';
    }
  }
}

//================================================================================================================
//                          MODAL DE IMPORTAÇÃO DE ALUNOS VIA CSV (BACKEND)
//================================================================================================================

// Elementos do modal
const modalImportar = document.getElementById("modal-importar-alunos");
const btnAbrirImportar = document.getElementById("import-aluno");       // botão que abre o modal
const btnImportar = document.getElementById("btn-importar-alunos");     // botão IMPORTAR dentro do modal
const selectTurmas = document.getElementById("select-turmas");          // select com as turmas
const inputArquivoCsv = document.getElementById("arquivo-csv-alunos");  // input file escondido

// Abre o modal ao clicar no botão "IMPORTAR ALUNO" da tela principal
if (btnAbrirImportar && modalImportar) {
  btnAbrirImportar.addEventListener("click", () => {
    preencherSelectTurmasImport();   // carrega as turmas no select
    modalImportar.style.display = "flex";
  });
}

// Fecha o modal clicando fora da janelinha
if (modalImportar) {
  modalImportar.addEventListener("click", (e) => {
    if (e.target === modalImportar) {
      modalImportar.style.display = "none";
    }
  });
}

// Preenche o select com as turmas salvas no localStorage
function preencherSelectTurmasImport() {
  const turmas = JSON.parse(localStorage.getItem("turmas")) || [];
  if (!selectTurmas) return;

  selectTurmas.innerHTML = `<option value="">SELECIONE A TURMA</option>`;

  if (!turmas.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "NENHUMA TURMA CADASTRADA";
    selectTurmas.appendChild(option);
    return;
  }

  turmas.forEach((t) => {
    const option = document.createElement("option");
    option.value = t.id;      // esse id será usado na rota /api/turmas/:id/...
    option.textContent = t.nome;
    selectTurmas.appendChild(option);
  });
}

// Quando clica no botão IMPORTAR, abrimos o seletor de arquivo
if (btnImportar && inputArquivoCsv && selectTurmas) {
  btnImportar.addEventListener("click", () => {
    const turmaSelecionada = selectTurmas.value;

    if (!turmaSelecionada) {
      alert("Selecione uma turma antes de importar.");
      return;
    }

    // Abre o seletor de arquivo (.csv)
    inputArquivoCsv.click();
  });

  // Quando o usuário escolhe o arquivo .csv
  inputArquivoCsv.addEventListener("change", async () => {
    try {
      const turmaSelecionada = selectTurmas.value;
      const arquivo = inputArquivoCsv.files && inputArquivoCsv.files[0];

      if (!turmaSelecionada) {
        alert("Selecione uma turma antes de importar.");
        return;
      }

      if (!arquivo) {
        alert("Selecione um arquivo CSV.");
        return;
      }

      if (!arquivo.name.toLowerCase().endsWith(".csv")) {
        alert("O arquivo precisa ser do tipo .csv");
        inputArquivoCsv.value = "";
        return;
      }

      // Lê o conteúdo do arquivo como texto
      const textoCsv = await arquivo.text();

      // Envia para o backend
      const resposta = await fetch(`/api/turmas/${turmaSelecionada}/alunos/importar-csv`, {
        method: "POST",
        headers: {
          "Content-Type": "text/csv"   // importante: bater com express.text({ type: ['text/csv', ...] })
        },
        body: textoCsv
      });

      if (!resposta.ok) {
        let msg = "Erro ao importar CSV.";
        try {
          const erro = await resposta.json();
          if (erro && erro.error) msg = erro.error;
        } catch (_) {}
        alert(msg);
        return;
      }

      const dados = await resposta.json(); // opcional: ver o que o backend devolve
      console.log("Importação CSV OK:", dados);

      if (typeof mostrarSucesso === "function") {
        const nomeTurmaSelecionada = selectTurmas.selectedOptions[0]?.text || "";
        mostrarSucesso(`Alunos da turma "${nomeTurmaSelecionada}" importados com sucesso!`);
      } else {
        alert("Alunos importados com sucesso!");
      }

      modalImportar.style.display = "none";
    } catch (erro) {
      console.error("Erro inesperado ao importar CSV:", erro);
      alert("Erro inesperado ao importar CSV.");
    } finally {
      // limpa o input pra poder escolher o mesmo arquivo depois, se quiser
      inputArquivoCsv.value = "";
    }
  });
}

//================================================================================================================
//                             EXPORTAR NOTAS PARA CSV (BACKEND)
//================================================================================================================

const btnExportarNotas = document.getElementById("btn-exportar-notas");

if (btnExportarNotas) {
  btnExportarNotas.addEventListener("click", async () => {

    if (!turmaAtualNotasId) {
      alert("Abra o modal de notas de uma turma antes de exportar.");
      return;
    }

    try {
      const resposta = await fetch(`/api/turmas/${turmaAtualNotasId}/notas/exportar-csv`);

      if (!resposta.ok) {
        const textoErro = await resposta.text();
        console.error("Erro ao exportar CSV:", textoErro);
        alert("Erro ao exportar notas em CSV.");
        return;
      }

      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `notas_turma_${turmaAtualNotasId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (erro) {
      console.error("Erro inesperado ao exportar CSV:", erro);
      alert("Erro inesperado ao exportar notas em CSV.");
    }
  });
}
