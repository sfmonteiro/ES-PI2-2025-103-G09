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

  // 🔹 Link fixo da página de redefinição
  const resetLink = "https://seudominio.com/Redefinir_senha/ReSenha.html";

  const templateParams = {
    user_name: email.split("@")[0],
    user_email: email,
    reset_link: resetLink
  };

  emailjs.send("service_pxhts6a", "template_5psqc3v", templateParams)
    .then(() => {
      alert("E-mail de recuperação enviado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro ao enviar e-mail. Veja o console.");
    });
}