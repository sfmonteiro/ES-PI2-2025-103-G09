// ALUNO: SARA FERNANDES MONTEIRO   ||   RA: 25024107



//================================================================================================================
//                                    BOTAO DE MENU (ABRIR E FECHAR O DROPDOWN)
//================================================================================================================

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

<<<<<<< HEAD
function redirecionar(id, destino) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.addEventListener('click', (e) => {
      e.preventDefault(); // 
      window.location.href = destino;
    });
  }
}
=======
>>>>>>> da112bacaffdc5f0764b82e2d0d243638d4d49b3



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
const inputPeriodo = document.getElementById("periodTurma");

// segurança: se algo não existe, evita crash e loga
//if (!containerTurmas) console.warn("container-turmas não encontrado");
//if (!modalTurma) console.warn("modal-turma não encontrado");
//if (!btnSalvarTurma) console.warn("confirmar-cadastro-turma não encontrado");
//if (!selectCurso) console.warn("cursoTurma (select) não encontrado");
//if (!selectDisciplina) console.warn("disciplinaTurma (select) não encontrado");

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

// ===============================
// criar card (inclui botão Alunos igual antes)
// ===============================
function criarCardTurma(turma) {
  const card = document.createElement("div");
  card.classList.add("card-turma");

  card.innerHTML = `
    <h3>${turma.nome}</h3>
    <p><strong>Código:</strong> ${turma.codigo}</p>
    <p><strong>Período:</strong> ${turma.periodo}</p>
    <p><strong>Curso:</strong> ${turma.cursoNome || turma.curso || ''}</p>
    <p><strong>Disciplina:</strong><br>• ${turma.disciplinaNome || turma.disciplina || ''}</p>

    <div class="botoes-card">
      <button class="btn-card editar">Editar</button>
      <button class="btn-card excluir">Excluir</button>
      <button class="btn-card adicionar">Alunos</button>
      <button class="btn-card notas">Notas</button>

    </div>
  `;

  // BOTÃO ALUNOS — abre o modal de alunos para a turma correta (usa id)
  const btnAlunos = card.querySelector(".adicionar");
  if (btnAlunos) {
    btnAlunos.addEventListener("click", (e) => {
      e.stopPropagation();
      // chama a função robusta que sugeri antes
      if (typeof abrirModalAlunos === "function") {
        abrirModalAlunos(turma.id);
      } else {
        // fallback antigo (se você ainda usa turmaSelecionada)
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
      // usa a função de editar (que no código reforçado se chama abrirModalEdicaoTurma)
      if (typeof abrirModalEdicaoTurma === "function") {
        abrirModalEdicaoTurma(turma);
      } else if (typeof editarTurma === "function") {
        editarTurma(turma);
      }
    });
  }

  // EXCLUIR
  const btnExcluir = card.querySelector(".excluir");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Deseja excluir a turma "${turma.nome}"?`)) {
        // remover por id (mais seguro)
        if (Array.isArray(turmas)) {
          turmas = turmas.filter(t => String(t.id) !== String(turma.id));
          // salvar usando sua função se existir
          if (typeof salvarTurmasLS === "function") {
            salvarTurmasLS();
          } else if (typeof salvarTurmasLocalStorage === "function") {
            salvarTurmasLocalStorage();
          } else {
            localStorage.setItem("turmas", JSON.stringify(turmas));
          }
          if (typeof atualizarListaTurmas === "function") atualizarListaTurmas();
        }
      }
    });
  }

  // dentro de criarCardTurma(turma)...

  // BOTÃO NOTAS — abre o modal de notas para a turma correta (usa id)
  const btnNotas = card.querySelector(".notas");
  if (btnNotas) {
    btnNotas.addEventListener("click", (e) => {
      e.stopPropagation();

      if (typeof abrirModalNotas === "function") {
        abrirModalNotas(turma.id);
      } else {
        // fallback, caso não tenha a função abrirModalNotas implementada
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
  if (inputPeriodo) inputPeriodo.value = turma.periodo || "";

  // setar curso (cursoId) — comparar por string
  if (selectCurso) selectCurso.value = turma.cursoId ? String(turma.cursoId) : "";

  // carregar disciplinas do curso selecionado (procura curso atual)
  cursos = lerCursosStorage();
  const cursoObj = cursos.find(c => String(c.id) === String(turma.cursoId));
  if (cursoObj) {
    carregarDisciplinasDoCursoObj(cursoObj);

    // selecionar disciplina (usamos disciplinaCodigo se existir, senão disciplinaNome)
    const wanted = turma.disciplinaCodigo || turma.disciplinaNome || turma.disciplina;
    if (wanted && selectDisciplina) {
      // pode ser codigo ou nome: tentar casar ambos
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
    const periodo = inputPeriodo ? inputPeriodo.value.trim() : "";
    const cursoId = selectCurso ? selectCurso.value : "";
    const disciplinaValue = selectDisciplina ? selectDisciplina.value : "";

    if (!codigo || !nome || !periodo || !cursoId || !disciplinaValue) {
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
      turmaEditando.periodo = periodo;
      turmaEditando.cursoId = String(cursoObj.id);
      turmaEditando.cursoNome = cursoObj.nome;
      turmaEditando.disciplinaNome = disciplinaNome;
      turmaEditando.disciplinaCodigo = disciplinaCodigo;
      turmaEditando = null;
      if (btnSalvarTurma) btnSalvarTurma.textContent = "CADASTRAR";
    } else {
      // novo
      const novo = {
        id: Date.now(),
        codigo,
        nome,
        periodo,
        cursoId: String(cursoObj.id),
        cursoNome: cursoObj.nome,
        disciplinaNome,
        disciplinaCodigo,
        alunos: []
      };
      turmas.push(novo);
    }

    salvarTurmasLS(turmas);
    atualizarListaTurmas();

    // fechar modal e limpar
    if (modalTurma) modalTurma.style.display = "none";
    if (inputCodigo) inputCodigo.value = "";
    if (inputNome) inputNome.value = "";
    if (inputPeriodo) inputPeriodo.value = "";
    if (selectCurso) selectCurso.value = "";
    resetDisciplinaSelect();
  });
}



// ==================== INICIAR LISTA =====================

atualizarListaTurmas();



// =========================
// LISTAGEM E CADASTRO DE ALUNOS
// =========================

// Elementos do formulário e tabela
const modalAluno = document.getElementById('modal-aluno');
const btnFecharAluno = document.getElementById('fecharModalAluno');
const btnConfirmarCadastroAluno = document.getElementById('confirmar-cadastro-aluno');
const raInput = document.getElementById('raAluno');
const nomeInput = document.getElementById('nomeAluno');
const tbodyAlunos = document.getElementById('corpo-lista-alunos');

// Identificador da turma selecionada (mais robusto que guardar o objeto)
let turmaSelecionadaId = null;
let alunoEditandoIndex = null;

// Helper: ler turmas atualizadas do storage
function lerTurmasStorageSafe() {
  try {
    return JSON.parse(localStorage.getItem('turmas')) || [];
  } catch (e) {
    console.error('Erro lendo turmas do storage:', e);
    return [];
  }
}

// Helper: salvar turmas com fallback (salvarTurmasLS ou salvarTurmasLocalStorage)
function salvarTurmasComFallback(turmasArray) {
  try {
    if (typeof salvarTurmasLS === 'function') {
      salvarTurmasLS(turmasArray);
    } else if (typeof salvarTurmasLocalStorage === 'function') {
      // alguns códigos usam esse nome antigo
      salvarTurmasLocalStorage(turmasArray);
    } else {
      // fallback direto
      localStorage.setItem('turmas', JSON.stringify(turmasArray));
    }
  } catch (e) {
    console.error('Erro ao salvar turmas:', e);
  }
}

// Retorna a turma atual (objeto) buscada por id — sempre pega do storage para evitar referências obsoletas
function obterTurmaAtual() {
  const turmasAgora = lerTurmasStorageSafe();
  if (!turmaSelecionadaId) return null;
  return turmasAgora.find(t => String(t.id) === String(turmaSelecionadaId)) || null;
}

// Atualiza a tabela HTML de alunos a partir da turma atual
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

  // eventos (delegação simples)
  tbodyAlunos.querySelectorAll('button.editar').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.target.getAttribute('data-index'));
      carregarAlunoParaEdicao(idx);
    });
  });

  tbodyAlunos.querySelectorAll('button.excluir').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.target.getAttribute('data-index'));
      excluirAluno(idx);
    });
  });
}

// Abre modal de alunos para a turma que foi clicada — chamada pelo botão "Alunos" no card
// Passe a id da turma quando abrir: abrirModalAlunos(turmaId)
function abrirModalAlunos(turmaId) {
  turmaSelecionadaId = String(turmaId);
  alunoEditandoIndex = null;
  btnConfirmarCadastroAluno.textContent = 'CADASTRAR';

  // atualiza lista e abre modal
  atualizarListaAlunos();
  if (modalAluno) modalAluno.style.display = 'flex';
}

// Carrega aluno para edição
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

// Excluir aluno por índice
function excluirAluno(index) {
  const turmaAtual = obterTurmaAtual();
  if (!turmaAtual || !Array.isArray(turmaAtual.alunos)) return;

  if (!confirm('Deseja realmente excluir este aluno?')) return;

  turmaAtual.alunos.splice(index, 1);

  // salva no storage (pega turmas atuais e substitui a que tem o mesmo id)
  let turmasAgora = lerTurmasStorageSafe();
  turmasAgora = turmasAgora.map(t => String(t.id) === String(turmaSelecionadaId) ? turmaAtual : t);
  salvarTurmasComFallback(turmasAgora);

  // atualiza view e limpa form
  atualizarListaAlunos();
  limparFormularioAluno();
}

// Limpar form de aluno
function limparFormularioAluno() {
  if (raInput) raInput.value = '';
  if (nomeInput) nomeInput.value = '';
  alunoEditandoIndex = null;
  btnConfirmarCadastroAluno.textContent = 'CADASTRAR';
}

// Evento do botão cadastrar/salvar aluno
if (btnConfirmarCadastroAluno) {
  btnConfirmarCadastroAluno.addEventListener('click', () => {
    const ra = raInput ? raInput.value.trim() : '';
    const nome = nomeInput ? nomeInput.value.trim() : '';

    if (!ra || !nome) {
      alert('Preencha RA e Nome Completo!');
      return;
    }

    // pega turma atual do storage
    const turmaAtual = obterTurmaAtual();
    if (!turmaAtual) {
      alert('Selecione uma turma antes de cadastrar alunos.');
      return;
    }

    if (!Array.isArray(turmaAtual.alunos)) turmaAtual.alunos = [];

    // Verifica duplicidade de RA no cadastro novo da turma selecionada
    // (usa comparação como string e ignora caso seja edição do mesmo índice)
    const raExiste = turmaAtual.alunos.some((a, idx) => {
      if (alunoEditandoIndex !== null && Number(alunoEditandoIndex) === Number(idx)) return false; // mesmo aluno em edição
      return String(a.ra) === String(ra);
    });

    if (raExiste) {
      alert('RA já cadastrado nesta turma!');
      return;
    }

    if (alunoEditandoIndex !== null) {
      // editar
      turmaAtual.alunos[alunoEditandoIndex] = { ra, nome };
    } else {
      // novo
      turmaAtual.alunos.push({ ra, nome });
    }

    // salva turmas atualizadas no storage
    let turmasAgora = lerTurmasStorageSafe();
    turmasAgora = turmasAgora.map(t => String(t.id) === String(turmaSelecionadaId) ? turmaAtual : t);
    salvarTurmasComFallback(turmasAgora);

    // atualiza UI e limpa form (não fecha modal)
    atualizarListaAlunos();
    limparFormularioAluno();
  });
}

// fechar modal alunos
if (btnFecharAluno) {
  btnFecharAluno.addEventListener('click', () => {
    if (modalAluno) modalAluno.style.display = 'none';
    limparFormularioAluno();
    turmaSelecionadaId = null;
  });
}

// Fecha modal clicando fora
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

// Elementos da modal (confirme que IDs existem no HTML)
const modalNotas = document.getElementById("modal-notas");
if (modalNotas) modalNotas.style.display = "none";
const fecharModalNotas = document.getElementById("fecharModalNotas");
const conteudoNotas = document.getElementById("conteudoNotas");

// Warn se algum elemento não existir
//if (!modalNotas) console.warn("modal-notas não encontrado no DOM");
//if (!fecharModalNotas) console.warn("fecharModalNotas não encontrado no DOM");
//if (!conteudoNotas) console.warn("conteudoNotas não encontrado no DOM");

// Variável global para turma atual no modal e índice da coluna em edição
let turmaAtualNotasId = null;
let colunaEditando = null; // índice da coluna que está em edição

// Helper para normalizar strings
function _norm(v) {
  return (v === undefined || v === null) ? "" : String(v).trim().toLowerCase();
}

// Ler turmas do localStorage de forma segura
function lerTurmasStorageSafe() {
  try {
    return JSON.parse(localStorage.getItem("turmas")) || [];
  } catch {
    return [];
  }
}

// Salvar turmas no localStorage
function salvarTurmasStorage(turmas) {
  localStorage.setItem("turmas", JSON.stringify(turmas));
}

// Abrir modal e montar tabela
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

  // Montar tabela
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
      >✏️</span>
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
        <td colspan="${2 + componentesDaDisciplina.length}" class="nenhum-aluno">
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
          <td class="col-nota">
          <input class="nota-input" type="number" step="1" style="background-color:#eee;" readonly>
          </td>
        `;
      });

      const notaFinal = turma.notas?.[ra]?.['FINAL'] ?? "";

      html += `
        <td class="col-nota-final">
          <input class="nota-input nota-final" type="number" value="${notaFinal}" style="background-color:#eee;">
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
}


function ativarEdicaoNotas() {
  const botoesEditar = document.querySelectorAll("#modal-notas .btn-editar-coluna");
  const tabela = document.querySelector("#modal-notas table.tabela-notas");
  if (!tabela) return;

  botoesEditar.forEach(btn => {
    btn.textContent = "✏️";

    btn.onclick = () => {
      const sigla = btn.getAttribute("data-sigla");

      // Descobre índice da coluna
      let idxColuna = -1;
      tabela.querySelectorAll("thead th").forEach((th, idx) => {
        const btnCol = th.querySelector(".btn-editar-coluna");
        if (btnCol && btnCol.getAttribute("data-sigla") === sigla) {
          idxColuna = idx;
        }
      });
      if (idxColuna === -1) return;

      // Se já está editando essa coluna, salva e bloqueia ela
      if (colunaEditando === idxColuna) {
        salvarNotasColuna(sigla, tabela);
        bloquearColuna(tabela, idxColuna);
        btn.textContent = "✏️";
        colunaEditando = null;
        alert("Notas salvas!");
        return;
      }

      // Se está editando outra coluna, pede para salvar antes
      if (colunaEditando !== null) {
        alert("Finalize a edição da outra coluna antes.");
        return;
      }

      // Bloqueia todas as colunas primeiro (readonly=true e fundo cinza)
      bloquearTodosInputs(tabela);

      // Libera só a coluna clicada (readonly=false e fundo branco)
      liberarColuna(tabela, idxColuna);

      // Atualiza estado
      colunaEditando = idxColuna;

      // Atualiza botões
      botoesEditar.forEach(b => b.textContent = "✏️");
      btn.textContent = "✅";

      // Não muda o foco automaticamente (deixa o usuário decidir)
    };
  });
}

function bloquearTodosInputs(tabela) {
  tabela.querySelectorAll("tbody tr input.nota-input").forEach(input => {
    input.readOnly = true;
    input.style.backgroundColor = "#eee";
  });
}

function bloquearColuna(tabela, idxColuna) {
  tabela.querySelectorAll("tbody tr").forEach(tr => {
    const td = tr.cells[idxColuna];
    if (!td) return;
    const input = td.querySelector("input.nota-input");
    if (!input) return;
    input.readOnly = true;
    input.style.backgroundColor = "#eee";
  });
}

function liberarColuna(tabela, idxColuna) {
  tabela.querySelectorAll("tbody tr").forEach(tr => {
    const td = tr.cells[idxColuna];
    if (!td) return;
    const input = td.querySelector("input.nota-input");
    if (!input) return;
    input.readOnly = false;
    input.style.backgroundColor = "#fff";
  });
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

    const valor = input.value.trim();

    if (!turma.notas) turma.notas = {};
    if (!turma.notas[ra]) turma.notas[ra] = {};

    turma.notas[ra][sigla] = valor;
  });

  salvarTurmasStorage(turmas);
}


// Fechar modal ao clicar no X
if (fecharModalNotas) {
  fecharModalNotas.addEventListener("click", () => {
    if (modalNotas) modalNotas.style.display = "none";
  });
}

// Fechar modal clicando fora
window.addEventListener("click", (e) => {
  if (modalNotas && e.target === modalNotas) {
    modalNotas.style.display = "none";
  }
});


//================================================================================================================
//                       SISTEMA DE PESOS (PARA CÁLCULO DE MÉDIA SIMPLES E PONDERADA)
//================================================================================================================

// Elementos do sistema de pesos
const selectTipoMedia = document.getElementById('tipo-media');
const containerPesos = document.getElementById('container-pesos');
const listaPesos = document.getElementById('lista-pesos');
const btnSalvarPesos = document.getElementById('btn-salvar-pesos');
const btnMostrarPesos = document.getElementById('btn-mostrar-pesos');

// Listener para mudança no tipo de média
if (selectTipoMedia) {
  selectTipoMedia.addEventListener('change', (e) => {
    const tipoSelecionado = e.target.value;
    
    if (tipoSelecionado === 'ponderada') {
      // Mostrar container de pesos
      carregarPesosParaEdicao();
      containerPesos.classList.remove('oculto');
      btnMostrarPesos.classList.add('oculto');
    } else if (tipoSelecionado === 'simples') {
      // Esconder tudo relacionado a pesos
      containerPesos.classList.add('oculto');
      btnMostrarPesos.classList.add('oculto');
      
      // Salvar tipo de média como simples
      salvarTipoMedia('simples');
    }
  });
}

// Carregar os componentes da turma para edição de pesos
function carregarPesosParaEdicao() {
  if (!turmaAtualNotasId) return;
  
  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaAtualNotasId));
  
  if (!turma) return;
  
  // Pegar componentes da disciplina da turma
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
  
  // Carregar pesos salvos anteriormente (se existirem)
  const pesosSalvos = turma.pesos || {};
  
  // Criar interface de seleção de pesos
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

// Salvar os pesos configurados
if (btnSalvarPesos) {
  btnSalvarPesos.addEventListener('click', () => {
    if (!turmaAtualNotasId) return;
    
    const turmasAgora = lerTurmasStorageSafe();
    const turma = turmasAgora.find(t => String(t.id) === String(turmaAtualNotasId));
    
    if (!turma) return;
    
    // Coletar pesos dos selects
    const selects = listaPesos.querySelectorAll('select[data-componente]');
    const pesos = {};
    
    selects.forEach(select => {
      const componente = select.getAttribute('data-componente');
      const peso = parseInt(select.value);
      pesos[componente] = peso;
    });
    
    // Salvar na turma
    turma.pesos = pesos;
    turma.tipoMedia = 'ponderada';
    
    // Atualizar no storage
    let todasTurmas = lerTurmasStorageSafe();
    todasTurmas = todasTurmas.map(t => String(t.id) === String(turmaAtualNotasId) ? turma : t);
    salvarTurmasComFallback(todasTurmas);
    
    // Esconder container de pesos e mostrar botão
    containerPesos.classList.add('oculto');
    btnMostrarPesos.classList.remove('oculto');
    
    alert('Pesos salvos com sucesso!');
  });
}

// Mostrar pesos novamente para edição
if (btnMostrarPesos) {
  btnMostrarPesos.addEventListener('click', () => {
    carregarPesosParaEdicao();
    containerPesos.classList.remove('oculto');
    btnMostrarPesos.classList.add('oculto');
  });
}

// Função para salvar tipo de média simples
function salvarTipoMedia(tipo) {
  if (!turmaAtualNotasId) return;
  
  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaAtualNotasId));
  
  if (!turma) return;
  
  turma.tipoMedia = tipo;
  if (tipo === 'simples') {
    delete turma.pesos; // Remove pesos se for média simples
  }
  
  let todasTurmas = lerTurmasStorageSafe();
  todasTurmas = todasTurmas.map(t => String(t.id) === String(turmaAtualNotasId) ? turma : t);
  salvarTurmasComFallback(todasTurmas);
}

// Atualizar a função abrirModalNotas para configurar o sistema de pesos
function abrirModalNotasComPesos(turmaId) {
  turmaAtualNotasId = String(turmaId);
  
  // Chamar a função original de abrir modal
  abrirModalNotas(turmaId);
  
  // Configurar o select de tipo de média baseado no que está salvo
  const turmasAgora = lerTurmasStorageSafe();
  const turma = turmasAgora.find(t => String(t.id) === String(turmaId));
  
  if (turma && selectTipoMedia) {
    // Resetar estado
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
//                                    MODAL DE IMPORTAÇÃO DE ALUNOS VIA CSV.
//================================================================================================================

// Modal e select
const modalImportar = document.getElementById('modal-importar-alunos');
const btnAbrirImportar = document.getElementById('import-aluno'); // id do botão certo
const btnImportar = document.getElementById('importar-alunos');
const selectTurmas = document.getElementById('select-turmas');

if (btnAbrirImportar) {
  btnAbrirImportar.addEventListener('click', () => {
    preencherSelectTurmas();
    if (modalImportar) modalImportar.style.display = 'flex';
  });
}


// Função para preencher select
function preencherSelectTurmas() {
  const turmas = JSON.parse(localStorage.getItem('turmas')) || [];
  selectTurmas.innerHTML = '<option value="">SELECIONE UMA TURMA</option>';

  if (turmas.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'NENHUMA TURMA CADASTRADA';
    selectTurmas.appendChild(option);
    return;
  }

  turmas.forEach(t => {
    const option = document.createElement('option');
    option.value = t.id;
    option.textContent = t.nome;
    selectTurmas.appendChild(option);
  });
}

// Abrir modal
if (btnAbrirImportar) {
  btnAbrirImportar.addEventListener('click', () => {
    preencherSelectTurmas();
    if (modalImportar) modalImportar.style.display = 'flex';
  });
}

// Fechar clicando fora
if (modalImportar) {
  modalImportar.addEventListener('click', (e) => {
    if (e.target === modalImportar) modalImportar.style.display = 'none';
  });
}

// Botão importar
if (btnImportar) {
  btnImportar.addEventListener('click', () => {
    const turmaSelecionada = selectTurmas.value;
    if (!turmaSelecionada) {
      alert('Selecione uma turma!');
      return;
    }

    alert(`Alunos da turma "${selectTurmas.selectedOptions[0].text}" importados com sucesso!`);
    modalImportar.style.display = 'none';
  });
}






////////////////////////////////////////////////////////////////////////////////////////////////////
