document.addEventListener('DOMContentLoaded', async () => {
    // Código de manejo del menú...

    // Código para manejo de pedidos
    const pedidosContent = document.getElementById('pedidos-content');
    const addPedidoButton = document.getElementById('add-pedido-button');
    const filterSemanaInput = document.getElementById('filter-semana');
    const pedidosTableBody = document.getElementById('pedidos-body');
    const pedidoFormContainer = document.getElementById('pedido-form-container');
    const pedidoForm = document.getElementById('pedido-form');
    const pedidoSemanaSelect = document.getElementById('pedido-semana');
    const pedidoPlatosContainer = document.getElementById('pedido-platos');
    const pedidoIdInput = document.getElementById('pedido-id');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const esRRHH = user.id_rol === "1"; // ID del rol RRHH

    async function fetchPedidos() {
        try {
            const response = await fetch('http://localhost:3000/pedidos');
            const pedidos = await response.json();
            return pedidos;
        } catch (error) {
            console.error('Error fetching pedidos:', error);
            return [];
        }
    }

    async function fetchComida() {
        try {
            const response = await fetch('http://localhost:3000/comida');
            const comida = await response.json();
            return comida;
        } catch (error) {
            console.error('Error fetching comida:', error);
            return [];
        }
    }

    function renderPedidos(pedidos) {
        pedidosTableBody.innerHTML = '';
        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.empleadoId}</td>
                <td>${pedido.semana}</td>
                <td>${pedido.platos.map(p => p.nombre).join(', ')}</td>
                <td>${new Date(pedido.fecha).toLocaleDateString()}</td>
                <td>
                    <button class="edit-pedido-button" data-id="${pedido.id}">Editar</button>
                    ${esRRHH ? `<button class="delete-pedido-button" data-id="${pedido.id}">Eliminar</button>` : ''}
                </td>
            `;
            pedidosTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-pedido-button').forEach(button => {
            button.addEventListener('click', handleEditPedido);
        });

        document.querySelectorAll('.delete-pedido-button').forEach(button => {
            button.addEventListener('click', handleDeletePedido);
        });
    }

    async function loadPedidos() {
        const pedidos = await fetchPedidos();
        renderPedidos(pedidos);
    }

    addPedidoButton.addEventListener('click', () => {
        pedidoForm.reset();
        pedidoFormContainer.style.display = 'block';
        loadComidaOptions();
    });

    filterSemanaInput.addEventListener('input', async () => {
        const semana = filterSemanaInput.value;
        const pedidos = await fetchPedidos();
        const filteredPedidos = pedidos.filter(p => p.semana == semana);
        renderPedidos(filteredPedidos);
    });

    pedidoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const pedidoId = pedidoIdInput.value;
        const semana = pedidoSemanaSelect.value;
        const platos = [];
        pedidoPlatosContainer.querySelectorAll('select').forEach(select => {
            if (select.value) {
                platos.push({ dia: select.dataset.dia, comidaId: select.value });
            }
        });

        const requestData = {
            empleadoId: user.id,
            semana,
            platos
        };

        if (pedidoId) {
            await fetch(`http://localhost:3000/pedidos/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
        } else {
            await fetch('http://localhost:3000/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
        }

        pedidoFormContainer.style.display = 'none';
        loadPedidos();
    });

    async function loadComidaOptions() {
        const comida = await fetchComida();
        pedidoPlatosContainer.innerHTML = '';
        for (let dia = 1; dia <= 5; dia++) {
            const select = document.createElement('select');
            select.dataset.dia = dia;
            select.innerHTML = '<option value="">Seleccione un plato</option>';
            comida.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.nombre_comida;
                select.appendChild(option);
            });
            const label = document.createElement('label');
            label.textContent = `Día ${dia}: `;
            label.appendChild(select);
            pedidoPlatosContainer.appendChild(label);
        }
    }

    async function handleEditPedido(event) {
        const pedidoId = event.target.dataset.id;
        const pedidos = await fetchPedidos();
        const pedido = pedidos.find(p => p.id == pedidoId);
        if (pedido) {
            pedidoIdInput.value = pedido.id;
            pedidoSemanaSelect.value = pedido.semana;
            loadComidaOptions().then(() => {
                pedido.platos.forEach(plato => {
                    const select = pedidoPlatosContainer.querySelector(`select[data-dia="${plato.dia}"]`);
                    if (select) {
                        select.value = plato.comidaId;
                    }
                });
            });
            pedidoFormContainer.style.display = 'block';
        }
    }

    async function handleDeletePedido(event) {
        const pedidoId = event.target.dataset.id;
        await fetch(`http://localhost:3000/pedidos/${pedidoId}`, {
            method: 'DELETE'
        });
        loadPedidos();
    }

    loadPedidos();
});
