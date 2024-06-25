document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    try{
        const respuesta = await fetch ('http://localhost:3000/menu_semana');
        const menuSemanal = await respuesta.json();

        const comidasRespuesta = await fetch('http://localhost:3000/comida');
        const comidas = await comidasRespuesta.json();

        const guarnicionesRespuesta = await fetch('http://localhost:3000/guarnicion');
        const guarniciones = await guarnicionesRespuesta.json();

        // console.log(menuSemanal);
        // console.log(comidas);
        // console.log(guarniciones);

        const contenedorMenu = document.getElementById('contenido-menu')
        // menuSemanal.array.forEach((menu, index) => {
        //     const menuTr = document.createElement('tr');
        //     menuTr.innerHTML = '<tr></tr>';
        // });
        comidas.array.forEach(element => {
            
        });
    }   


});
