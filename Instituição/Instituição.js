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
