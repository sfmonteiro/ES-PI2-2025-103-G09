function redirecionar(id, destino) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = destino;
    });
}
}
redirecionar("continuar", "../Pagina_Inicial/inicio.html");