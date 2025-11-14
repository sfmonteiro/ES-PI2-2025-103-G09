// primeiro_acesso.js
// Responsável: Marialvo (ajustes para criação de instituição + curso e conclusão do primeiro acesso)

function getToken() {
  return localStorage.getItem("token");
}

function getFieldValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

async function criarInstituicao(payload) {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado. Faça login novamente.");

  const res = await fetch("/api/instituicao", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  // tenta pegar json/text para diagnóstico em caso de erro
  const contentType = res.headers.get("Content-Type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text().catch(()=>"");
  return { ok: res.ok, status: res.status, body };
}

async function marcarPrimeiroAcessoCompleto() {
  const token = getToken();
  if (!token) throw new Error("Usuário não autenticado. Faça login novamente.");

  const res = await fetch("/api/primeiro_acesso/complete", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const contentType = res.headers.get("Content-Type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text().catch(()=>"");
  return { ok: res.ok, status: res.status, body };
}

async function handlerSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("continuar");
  if (!btn) return;

  const nomeInst = getFieldValue("instituicao");
  const nomeCurso = getFieldValue("curso");

  if (!nomeInst) {
    alert("Informe o nome da instituição.");
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Salvando...";

  try {
    //criar instituição (+ curso opcional)
    const payload = { nome: nomeInst };
    if (nomeCurso) payload.curso = nomeCurso;

    const resInst = await criarInstituicao(payload);
    if (!resInst.ok) {
      //mostra retorno útil para debug
      const info = typeof resInst.body === "object" ? JSON.stringify(resInst.body) : String(resInst.body);
      throw new Error(`Falha ao criar instituição (${resInst.status}). ${info}`);
    }

    //marca primeiro acesso
    const resMark = await marcarPrimeiroAcessoCompleto();
    if (!resMark.ok) {
      const info = typeof resMark.body === "object" ? JSON.stringify(resMark.body) : String(resMark.body);
      throw new Error(`Falha ao confirmar primeiro acesso (${resMark.status}). ${info}`);
    }

    // se for sucesso redireciona para página de gestão de instituições
    window.location.href = "../Instituição_cadastro/Instituição.html";
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao salvar. Veja o console para detalhes.");
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// conecta o botão ao handler (mantendo id existente)
const btnContinuar = document.getElementById("continuar");
if (btnContinuar) {
  btnContinuar.addEventListener("click", handlerSubmit);
}
