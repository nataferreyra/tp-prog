document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const menuForm = document.getElementById('menuForm');
    const nombrePlatoInput = document.getElementById('nombrePlato');
    const guarnicionSelect = document.getElementById('guarnicion');
    const semanaSelect = document.getElementById('semana');

    // Verificar el rol del usuario
    const rolResponse = await fetch('http://localhost:3000/rol');
    const roles = await rolResponse.json();
    const userRole = roles.find(role => role.id === user.id_rol);

    // Mostrar u ocultar el botón según el rol
    const editarButton = document.querySelector('.table__header button:nth-of-type(1)'); // Botón "Editar"
    if (userRole && userRole.rol === 'Proveedor de servicio de viandas') {
        editarButton.style.display = 'inline-block';
    } else {
        editarButton.style.display = 'none';
    }

    // Evento click en botón Editar para mostrar el formulario
    editarButton.addEventListener('click', () => {
        // Aquí puedes implementar lógica para prellenar el formulario con datos actuales si es necesario
        menuForm.style.display = 'block'; // Mostrar formulario
    });

    // Evento submit del formulario para guardar cambios
    menuForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            nombre: nombrePlatoInput.value,
            guarnicionId: guarnicionSelect.value,
            semana: semanaSelect.value
        };

        try {
            const response = await fetch('http://localhost:3000/comida', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) {
                throw new Error('Error al guardar el plato');
            }
    
            // Limpiar formulario y actualizar la tabla de menú si es necesario
            nombrePlatoInput.value = '';
            guarnicionSelect.selectedIndex = 0;
            semanaSelect.selectedIndex = 0;
            menuForm.style.display = 'none'; // Ocultar formulario
    
            // Obtener el plato recién creado del response, si es necesario
            const nuevoPlato = await response.json();
    
            // Actualizar la tabla de menú en la página web
            agregarFilaATablaMenu(nuevoPlato); // Implementa esta función según tu lógica
        } catch (error) {
            console.error('Error al guardar el plato:', error);
        }
    });

    function agregarFilaATablaMenu(nuevoPlato) {
        const menuContainer = document.getElementById('contenido-menu');
        if (!menuContainer) {
            console.error('Elemento contenedor de menú no encontrado');
            return;
        }
    
        // Crear la nueva fila del plato
        const row = document.createElement('tr');
    
        const refCell = document.createElement('td');
        refCell.textContent = nuevoPlato.id; // Asegúrate de ajustar esto según la estructura de tu objeto plato
        row.appendChild(refCell);
    
        const nameCell = document.createElement('td');
        nameCell.textContent = nuevoPlato.nombre_comida; // Asegúrate de ajustar esto según la estructura de tu objeto plato
        row.appendChild(nameCell);
    
        // Ajusta la lógica para las columnas de semanas según tu estructura de datos
        for (let i = 0; i < 4; i++) {
            const weekCell = document.createElement('td');
            weekCell.textContent = ''; // Puedes ajustar esto según sea necesario
            row.appendChild(weekCell);
        }
    
        // Agregar la nueva fila al contenedor de menú
        menuContainer.appendChild(row);
    }
    

    // Evento click en botón Eliminar para eliminar un plato
    const eliminarPlatoButton = document.getElementById('eliminarPlato');
    eliminarPlatoButton.addEventListener('click', async () => {
        // Aquí debes implementar la lógica para eliminar el plato seleccionado
        const selectedRow = menuContainer.querySelector('tr.selected');
        if (!selectedRow) {
            console.error('No se ha seleccionado ningún plato para eliminar');
            return;
        }

        const refId = selectedRow.querySelector('td:first-child').textContent; // Obtener el ID de la fila seleccionada

        try {
            const response = await fetch(`http://localhost:3000/comida/${refId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al intentar eliminar el plato');
            }

            // Eliminar la fila de la tabla en la página web
            selectedRow.remove();
        } catch (error) {
            console.error('Error al eliminar el plato:', error);
        }
        // Ejemplo: const response = await fetch(url, { method: 'DELETE' });

        // Después de eliminar, podrías limpiar el formulario y actualizar la tabla de menú si es necesario
        nombrePlatoInput.value = '';
        guarnicionSelect.selectedIndex = 0;
        semanaSelect.selectedIndex = 0;
        menuForm.style.display = 'none'; // Ocultar formulario
    });

   

    // Evento click en botón Cancelar para cancelar la acción
    const cancelarAccionButton = document.getElementById('cancelarAccion');
    cancelarAccionButton.addEventListener('click', () => {
        nombrePlatoInput.value = '';
        guarnicionSelect.selectedIndex = 0;
        semanaSelect.selectedIndex = 0;
        menuForm.style.display = 'none'; // Ocultar formulario
    });

    // Cargar opciones de guarniciones desde el JSON
    const guarnicionesResponse = await fetch('http://localhost:3000/guarnicion');
    const guarniciones = await guarnicionesResponse.json();
    guarniciones.forEach(guarnicion => {
        const option = document.createElement('option');
        option.value = guarnicion.id;
        option.textContent = guarnicion.nombre_guarnicion;
        guarnicionSelect.appendChild(option);
    });

    try {
        // Fetch data from server
        const menuResponse = await fetch('http://localhost:3000/menu_semana');
        const menus = await menuResponse.json();
        const comidasResponse = await fetch('http://localhost:3000/comida');
        const comidas = await comidasResponse.json();
        const guarnicionesResponse = await fetch('http://localhost:3000/guarnicion');
        const guarniciones = await guarnicionesResponse.json();

        // Get the table body element
        const menuContainer = document.getElementById('contenido-menu');
        if (!menuContainer) {
            throw new Error('Menu container element not found');
        }

        // Create a dictionary to map comida IDs to their names
        const comidaMap = comidas.reduce((acc, comida) => {
            acc[comida.id] = comida.nombre_comida;
            return acc;
        }, {});

        // Create a dictionary to map guarnicion IDs to their names
        const guarnicionMap = guarniciones.reduce((acc, guarnicion) => {
            acc[guarnicion.id] = guarnicion.nombre_guarnicion;
            return acc;
        }, {});

        // Create a dictionary to keep track of comida appearances by week
        const comidaSemanas = comidas.reduce((acc, comida) => {
            acc[comida.id] = [false, false, false, false];
            return acc;
        }, {});

        menus.forEach((menu, semanaIndex) => {
            menu.comida.forEach(comidaId => {
                if (comidaSemanas[comidaId]) {
                    comidaSemanas[comidaId][semanaIndex] = true;
                }
            });
        });

        // Generate table rows for each comida
        comidas.forEach(comida => {
            const row = document.createElement('tr');

            const refCell = document.createElement('td');
            refCell.textContent = comida.id;
            row.appendChild(refCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = comida.nombre_comida;
            row.appendChild(nameCell);

            for (let i = 0; i < 4; i++) {
                const weekCell = document.createElement('td');
                if (comidaSemanas[comida.id][i]) {
                    weekCell.textContent = 'X';
                }
                row.appendChild(weekCell);
            }

            menuContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Error papito:', error);
    }
});
