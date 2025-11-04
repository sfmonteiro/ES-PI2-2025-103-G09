const botao = document.getElementById('entrar');
const select = document.getElementById('instituicao');

botao.addEventListener('click', () => {
  const valor = select.value;
  
  if (!valor) {
    alert('Por favor, selecione uma instituição antes de continuar.');
  } else {
    alert(`Você selecionou: ${select.options[select.selectedIndex].text}`);
    // Redirecionamento opcional:
    // window.location.href = `${valor}.html`;
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