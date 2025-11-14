// Responsável: Guilherme Mascarenhas Plácido Corrêa
// RA: 25020685

// === CÓDIGO ORIGINAL DO GUILHERME ===
const form = document.getElementById("formulario");
const btnSubmit = document.getElementById("submit");
const btnCadastro = document.getElementById("cadastro");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const erroEmail = document.getElementById("erroEmail");
const erroSenha = document.getElementById("erroSenha");

// Validações originais criadas pelo Guilherme
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// === ADICIONADO POR CHATGPT ===
// Flag para evitar múltiplos envios simultâneos do formulário
let enviando = false;

// Evento principal de envio de formulário (LOGIN)
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (enviando) return;

  const email = campoEmail.value.trim();
  const senha = campoSenha.value.trim();

  // limpar mensagens anteriores de erro
  erroEmail.textContent = "";
  erroSenha.textContent = "";

  let valido = true;

  // validações originais de Guilherme
  if (!regexEmail.test(email)) {
    erroEmail.textContent = "Digite um email válido (ex: exemplo@gmail.com)";
    valido = false;
  }

  if (!regexSenha.test(senha)) {
    erroSenha.textContent = "Senha inválida (mínimo 8 chars: minúsculas, maiúsculas, número e símbolo)";
    valido = false;
  }

  if (!valido) return;

  // === ADICIONADO POR CHATGPT ===
  // Envia o login para o backend (/api/login)
  try {
    enviando = true;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Entrando...";

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      const msg = data.message || data.error || "Credenciais inválidas ou erro no servidor.";
      // se o erro for sobre credenciais, mostra mensagem no campo da senha
      if (res.status === 401) {
        erroSenha.textContent = "E-mail ou senha incorretos.";
      } else {
        alert(msg);
      }
      return;
    }

// --- original (Guilherme) ---
// (a linha de salvar token/usuario fica igual)
// if (data.token) localStorage.setItem("token", data.token);
// if (data.usuario) localStorage.setItem("usuario", JSON.stringify(data.usuario));

// alterado p/ Marialvo: redirecionamento correto conforme primeiro acesso
if (data.token) localStorage.setItem("token", data.token);
if (data.usuario) localStorage.setItem("usuario", JSON.stringify(data.usuario));

// verifica flag firstAccess retornada pelo backend e redireciona corretamente
if (data.firstAccess) {
  // primeiro acesso -> página de completar cadastro inicial (instituição)
  window.location.href = "../Primeiro_acesso/primeiro_acesso.html";
} else {
  // Já fez acesso antes -> ir para página de Instituição
  window.location.href = "../Instituição_cadastro/Instituição.html";
}


  } catch (err) {
    console.error("Erro na requisição de login:", err);
    alert("Erro ao conectar com o servidor. Tente novamente.");
  } finally {
    enviando = false;
    btnSubmit.disabled = false;
    btnSubmit.textContent = "LOGIN";
  }
});

// === CÓDIGO ORIGINAL DO GUILHERME ===
// Função de redirecionamento (mantida igual)
function redirecionar(id, destino) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = destino;
    });
  }
}
redirecionar("cadastro", "../Cadastro/Cadastro.html");
redirecionar("esqueceusenha", "../Redefinir_senha/ReSenha.html");
