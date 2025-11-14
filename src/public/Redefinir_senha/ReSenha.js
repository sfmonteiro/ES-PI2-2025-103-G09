(function(){
  emailjs.init("U7iNW9Cn3C6YnUwGo");
})();

document.addEventListener('DOMContentLoaded', function(){
  const form = document.querySelector('form');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    enviarEmail();
  });
});

function enviarEmail() {
  const email = document.getElementById("email").value;

  // Link fixo da página de redefinição
  const resetLink = "http://localhost:3000/Redefinir_senha/Nova_senha.html";

  const templateParams = {
    user_name: email.split("@")[0],
    user_email: email,
    reset_link: resetLink
  };

  emailjs.send("service_pxhts6a", "template_5psqc3v", templateParams)
    .then(() => {
      mostrarSucesso();
    })
    .catch((error) => {
      console.error("Erro:", error);
      mostrarErro();
    });
}
function mostrarSucesso() {
        const overlay = document.createElement("div");
        overlay.className = "overlay-sucesso";
        overlay.style.transition = "opacity 1s";
        overlay.innerHTML = `
            <div class="caixa-sucesso">
                <img src="icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
                <p>Email enviado com sucesso!</p>
            </div>
        `;
        document.body.appendChild(overlay);}

function mostrarErro() {
        const overlay = document.createElement("div");
        overlay.className = "overlay-sucesso";
        overlay.style.transition = "opacity 1s";
        overlay.innerHTML = `
            <div class="caixa-sucesso">
                <img src="icone_NotaDez.png" alt="Sucesso" class="icone-sucesso">
                <p>Erro ao enviar o email!</p>
            </div>
        `;
        document.body.appendChild(overlay);}