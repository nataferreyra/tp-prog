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

    const rolResponse = await fetch('http://localhost:3000/rol');
    const roles = await rolResponse.json();
    const userRole = roles.find(role => role.id === user.id_rol);

    const editarButton = document.querySelector('.table__header button:nth-of-type(1)');
    if (userRole && userRole.rol === 'Proveedor de servicio de viandas') {
        editarButton.style.display = 'inline-block';
    } else {
        editarButton.style.display = 'none';
    }

    if (userRole && userRole.rol === 'Proveedor de servicio de viandas') {
        menuForm.style.display = 'block';
    } else {
        menuForm.style.display = 'none';
    }

    let isEditMode = false;

    let accionesHeader;
    const accionesCells = document.querySelectorAll('.table__body .acciones');

    editarButton.addEventListener('click', () => {
        isEditMode = !isEditMode;
        const menuContainer = document.querySelector('.table__body');

        if (isEditMode) {
            menuContainer.classList.add('show-delete-buttons');
            if (accionesHeader) accionesHeader.classList.remove('hide-acciones');
            accionesCells.forEach(cell => {
                cell.classList.remove('hide-acciones');
            });
            agregarBotonesEliminar();
        } else {
            menuContainer.classList.remove('show-delete-buttons');
            if (accionesHeader) accionesHeader.classList.add('hide-acciones');
            accionesCells.forEach(cell => {
                cell.classList.add('hide-acciones');
            });
            quitarBotonesEliminar();
        }
    });

    let botonesEliminacionAgregados = false;

    function agregarBotonesEliminar() {
        if (!botonesEliminacionAgregados) {
            const filasMenu = document.querySelectorAll('#contenido-menu tr');
            filasMenu.forEach(fila => {
                const accionesCell = document.createElement('td');
                const eliminarBtn = document.createElement('button');
                eliminarBtn.textContent = 'Eliminar';
                eliminarBtn.classList.add('eliminar-btn');
                eliminarBtn.addEventListener('click', () => {
                    const refComida = fila.querySelector('td:first-child').textContent;
                    eliminarComida(refComida);
                    fila.remove();
                });
                accionesCell.appendChild(eliminarBtn);
                fila.appendChild(accionesCell);
            });
            botonesEliminacionAgregados = true;
        }
    }

    function quitarBotonesEliminar() {
        const botonesEliminar = document.querySelectorAll('.eliminar-btn');
        botonesEliminar.forEach(btn => btn.parentNode.remove());
        botonesEliminacionAgregados = false;
    }

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

            nombrePlatoInput.value = '';
            guarnicionSelect.selectedIndex = 0;
            semanaSelect.selectedIndex = 0;
            menuForm.style.display = 'none';

            const nuevoPlato = await response.json();

            agregarFilaATablaMenu(nuevoPlato);
        } catch (error) {
            console.error('Error al guardar el plato:', error);
        }
    });

    async function eliminarComida(refComida) {
        try {
            const response = await fetch(`http://localhost:3000/comida/${refComida}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el plato');
            }

            console.log('Plato eliminado correctamente:', refComida);
        } catch (error) {
            console.error('Error al eliminar el plato:', error);
        }
    }

    function agregarFilaATablaMenu(nuevoPlato) {
        const menuContainer = document.getElementById('contenido-menu');
        if (!menuContainer) {
            console.error('Elemento contenedor de menú no encontrado');
            return;
        }

        const row = document.createElement('tr');

        const refCell = document.createElement('td');
        refCell.textContent = nuevoPlato.id;
        row.appendChild(refCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = nuevoPlato.nombre_comida;
        row.appendChild(nameCell);

        for (let i = 0; i < 4; i++) {
            const weekCell = document.createElement('td');
            weekCell.textContent = '';
            row.appendChild(weekCell);
        }

        menuContainer.appendChild(row);
    }

    const cancelarAccionButton = document.getElementById('cancelarAccion');
    cancelarAccionButton.addEventListener('click', () => {
        nombrePlatoInput.value = '';
        guarnicionSelect.selectedIndex = 0;
        semanaSelect.selectedIndex = 0;
        menuForm.style.display = 'none';
    });

    const guarnicionesResponse = await fetch('http://localhost:3000/guarnicion');
    const guarniciones = await guarnicionesResponse.json();
    guarniciones.forEach(guarnicion => {
        const option = document.createElement('option');
        option.value = guarnicion.id;
        option.textContent = guarnicion.nombre_guarnicion;
        guarnicionSelect.appendChild(option);
    });

    try {
        const menuResponse = await fetch('http://localhost:3000/menu_semana');
        const menus = await menuResponse.json();
        const comidasResponse = await fetch('http://localhost:3000/comida');
        const comidas = await comidasResponse.json();
        const guarnicionesResponse = await fetch('http://localhost:3000/guarnicion');
        const guarniciones = await guarnicionesResponse.json();

        const menuContainer = document.getElementById('contenido-menu');
        if (!menuContainer) {
            throw new Error('Elemento contenedor de menú no encontrado');
        }

        const comidaMap = comidas.reduce((acc, comida) => {
            acc[comida.id] = comida.nombre_comida;
            return acc;
        }, {});

        const guarnicionMap = guarniciones.reduce((acc, guarnicion) => {
            acc[guarnicion.id] = guarnicion.nombre_guarnicion;
            return acc;
        }, {});

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
        console.error('Error:', error);
    }

    const realizarPedidoButton = document.getElementById('realizarPedido');
    realizarPedidoButton.addEventListener('click', () => {
        if (userRole && userRole.rol === 'Empleado de i2T' && userRole.id_rol === 4) {
            window.location.href = 'pedido.html';
        } else {
            alert('No tienes permiso para realizar pedidos.');
        }
    });

});
