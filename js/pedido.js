document.addEventListener("DOMContentLoaded", function() {
    const baseUrl = 'http://localhost:3000';

    async function fetchData(endpoint) {
        const response = await fetch(`${baseUrl}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }

    async function fetchComidaAndGuarnicion() {
        const [comida, guarnicion] = await Promise.all([
            fetchData('comida'),
            fetchData('guarnicion')
        ]);
        return { comida, guarnicion };
    }

    async function fetchPedidosActuales() {
        const pedidos = await fetchData('pedido_menu_actual');
        return pedidos;
    }

    async function fetchProximosPedidos() {
        const proximosPedidos = await fetchData('pedido_menu_proximo');
        return proximosPedidos;
    }

    async function populatePedidosTable() {
        const pedidosTableBody = document.getElementById('pedidosTableBody');
        try {
            const pedidos = await fetchPedidosActuales();
            const { comida, guarnicion } = await fetchComidaAndGuarnicion();

            pedidos.forEach(pedido => {
                pedido.dia.forEach((dia, diaIndex) => {
                    if (dia.id_comida.length > 0 || dia.id_guarnicion.length > 0) {
                        let comidaNombres = dia.id_comida.map(id => {
                            let comidaItem = comida.find(c => c.id === id);
                            return comidaItem ? comidaItem.nombre_comida : "Desconocido";
                        }).join(", ");

                        let guarnicionNombres = dia.id_guarnicion.map(id => {
                            let guarnicionItem = guarnicion.find(g => g.id === id);
                            return guarnicionItem ? guarnicionItem.nombre_guarnicion : "Desconocido";
                        }).join(", ");

                        let row = document.createElement('tr');
                        row.innerHTML = `
                            <td>Semana ${pedido.id_semana}</td>
                            <td>Día ${diaIndex + 1}</td>
                            <td>${comidaNombres}</td>
                            <td>${guarnicionNombres}</td>
                        `;
                        pedidosTableBody.appendChild(row);
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    }

    async function populateProximosPedidosTable() {
        const proximosPedidosTableBody = document.getElementById('proximosPedidosTableBody');
        try {
            const proximosPedidos = await fetchProximosPedidos();
            const { comida, guarnicion } = await fetchComidaAndGuarnicion();

            proximosPedidos.forEach(pedido => {
                pedido.dia.forEach((dia, diaIndex) => {
                    if (dia.id_comida.length > 0 || dia.id_guarnicion.length > 0) {
                        let comidaNombres = dia.id_comida.map(id => {
                            let comidaItem = comida.find(c => c.id === id);
                            return comidaItem ? comidaItem.nombre_comida : "Desconocido";
                        }).join(", ");

                        let guarnicionNombres = dia.id_guarnicion.map(id => {
                            let guarnicionItem = guarnicion.find(g => g.id === id);
                            return guarnicionItem ? guarnicionItem.nombre_guarnicion : "Desconocido";
                        }).join(", ");

                        let row = document.createElement('tr');
                        row.innerHTML = `
                            <td>Semana ${pedido.id_semana}</td>
                            <td>Día ${diaIndex + 1}</td>
                            <td>${comidaNombres}</td>
                            <td>${guarnicionNombres}</td>
                        `;
                        proximosPedidosTableBody.appendChild(row);
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    }

    async function populatePlatoSelect() {
        const platoSelect = document.getElementById('plato');
        try {
            const { comida } = await fetchComidaAndGuarnicion();

            comida.forEach(comidaItem => {
                let option = document.createElement('option');
                option.value = comidaItem.id;
                option.textContent = comidaItem.nombre_comida;
                platoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching comida data:', error.message);
        }
    }

    async function populateGuarnicionSelect() {
        const guarnicionSelect = document.getElementById('guarnicion');
        try {
            const { guarnicion } = await fetchComidaAndGuarnicion();

            guarnicion.forEach(guarnicionItem => {
                let option = document.createElement('option');
                option.value = guarnicionItem.id;
                option.textContent = guarnicionItem.nombre_guarnicion;
                guarnicionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching guarnicion data:', error.message);
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        const semanaSelect = document.getElementById('semana');
        const diaSelect = document.getElementById('dia');
        const platoSelect = document.getElementById('plato');
        const guarnicionSelect = document.getElementById('guarnicion');

        const nuevoPedido = {
            id_semana: semanaSelect.value,
            dia: [
                { id_comida: [platoSelect.value], id_guarnicion: [guarnicionSelect.value] },
                { id_comida: [], id_guarnicion: [] },
                { id_comida: [], id_guarnicion: [] },
                { id_comida: [], id_guarnicion: [] },
                { id_comida: [], id_guarnicion: [] }
            ]
        };

        try {
            const response = await fetch(`${baseUrl}/pedido_menu_proximo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoPedido)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            semanaSelect.selectedIndex = 0;
            diaSelect.selectedIndex = 0;
            platoSelect.selectedIndex = 0;
            guarnicionSelect.selectedIndex = 0;

            await populatePedidosTable();
            await populateProximosPedidosTable();
        } catch (error) {
            console.error('Error submitting form:', error.message);
        }
    }

    async function init() {
        await Promise.all([
            populatePedidosTable(),
            populateProximosPedidosTable(),
            populatePlatoSelect(),
            populateGuarnicionSelect()
        ]);

        const pedidoForm = document.getElementById('pedidoForm');
        pedidoForm.addEventListener('submit', handleFormSubmit);
    }

    init();
});
