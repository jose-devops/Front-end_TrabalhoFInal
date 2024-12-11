// URL base do backend
const BASE_URL = 'http://localhost:8080';

async function carregarClientes() {
    try {
        const response = await fetch(`${BASE_URL}/client/listClients`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Erro ao listar clientes');
        }

        const clientes = await response.json();
        const dropdown = document.getElementById('cliente'); // Dropdown do modal

        dropdown.innerHTML = '<option value="">Selecione um cliente</option>';

        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}



// Função para criar um pedido
async function criarPedido() {
    const descricao = document.getElementById('descricao');
    const valor = document.getElementById('valor');
    const status = document.getElementById('status');
    const cliente = document.getElementById('cliente');

    let isValid = true;

    // Validação da Descrição
    if (!descricao.value.trim()) {
        mostrarErro(descricao, "A descrição é obrigatória.");
        isValid = false;
    } else {
        limparErro(descricao);
    }

    // Validação do Valor
    if (!valor.value || parseFloat(valor.value) <= 0) {
        mostrarErro(valor, "O valor deve ser maior que 0.");
        isValid = false;
    } else {
        limparErro(valor);
    }

    // Validação do Status
    if (!status.value) {
        mostrarErro(status, "O status é obrigatório.");
        isValid = false;
    } else {
        limparErro(status);
    }

    // Validação do Cliente
    if (!cliente.value) {
        mostrarErro(cliente, "O cliente é obrigatório.");
        isValid = false;
    } else {
        limparErro(cliente);
    }

    if (!isValid) {
        return; // Interrompe se algum campo estiver inválido
    }

    const pedidoData = {
        descricao: descricao.value.trim(),
        valor: parseFloat(valor.value),
        status: status.value,
        cliente: { id: cliente.value },
    };

    try {
        const response = await fetch(`${BASE_URL}/order/createOrder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoData),
        });

        if (!response.ok) {
            throw new Error('Erro ao criar pedido');
        }

        const data = await response.json();
        console.log('Pedido criado:', data);
        listarPedidos();

        // Limpar campos do modal
        descricao.value = '';
        valor.value = '';
        status.value = '';
        cliente.value = '';

        // Fechar o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCadastrarPedido'));
        modal.hide();

        // Mostrar mensagem de sucesso
        showAlert("Pedido criado com sucesso!");
    } catch (error) {
        console.error(error);
        showAlert("Erro ao criar pedido.", "danger");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    carregarClientes();
    listarPedidos();

    // Configura o evento para o botão de confirmação de exclusão
    document.getElementById('btnConfirmarExclusao').addEventListener('click', () => {
        const id = document.getElementById('btnConfirmarExclusao').getAttribute('data-id');
        deletarPedido(id); // Chama a função para excluir o pedido
    });

    // Limpar campos e alertas ao fechar o modal de cadastro
    const modalCadastrarPedido = document.getElementById('modalCadastrarPedido');
    modalCadastrarPedido.addEventListener('hidden.bs.modal', () => {
        limparModalCadastro();
    });
});

// Função para limpar campos e mensagens de erro do modal de cadastro
function limparModalCadastro() {
    // Limpar os campos do formulário
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('status').value = '';
    document.getElementById('cliente').value = '';

    // Remover mensagens de erro
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((error) => error.remove());
}


function mostrarErro(input, mensagem) {
    let errorElement = input.nextElementSibling;

    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message text-danger mt-1';
        input.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = mensagem;
}

function limparErro(input) {
    const errorElement = input.nextElementSibling;

    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

// Evento de validação em tempo real
document.getElementById('valor').addEventListener('input', function () {
    const valor = parseFloat(this.value);
    const valorError = document.getElementById('valorError');

    if (valor <= 0 || isNaN(valor)) {
        valorError.style.display = 'block';
    } else {
        valorError.style.display = 'none';
    }
});


// Evento de validação em tempo real
document.getElementById('valor').addEventListener('input', function () {
    const valor = parseFloat(this.value);
    const valorError = document.getElementById('valorError');

    if (valor <= 0 || isNaN(valor)) {
        valorError.style.display = 'block';
    } else {
        valorError.style.display = 'none';
    }
});


function showAlert(message, type = "success") {
    const alertContainer = document.getElementById("alert-container");
    const alert = document.createElement("div");

    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        alert.classList.remove("show");
        setTimeout(() => alert.remove(), 150); // Aguarda animação de fade
    }, 3000);
}



// Função para listar todos os pedidos
// Função para listar todos os pedidos
function listarPedidos() {
    fetch(`${BASE_URL}/order/listOrders`)
        .then(response => response.json())
        .then(pedidos => {
            const tabelaPedidos = document.getElementById('tabela-pedidos');
            tabelaPedidos.innerHTML = ''; // Limpar a tabela antes de renderizar novamente

            // Renderizar a tabela de pedidos
            pedidos.forEach((pedido) => {
                tabelaPedidos.innerHTML += `
                    <tr>
                        <td>${pedido.descricao}</td>
                        <td>${pedido.valor}</td>
                        <td>${pedido.status}</td>
                        <td>${pedido.nomeCliente || "N/A"}</td> <!-- Exibe o nome do cliente -->
                        <td>
                            <button class="btn btn-warning" onclick="abrirModalEditar('${pedido.id}')">Editar</button>
                            <button class="btn btn-danger" onclick="modalConfirmarExclusao('${pedido.id}')">Excluir</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error('Erro ao listar pedidos:', error));
}








// Função para atualizar um pedido
// Função para atualizar um pedido
async function atualizarPedido() {
    const id = document.getElementById('pedidoId').value; // Obter o ID do pedido
    const descricao = document.getElementById('descricaoEditar').value;
    const valor = document.getElementById('valorEditar').value;
    const status = document.getElementById('statusEditar').value;

    if (!descricao || !valor || !status) {
        showAlert("Por favor, preencha todos os campos.", "danger");
        return;
    }

    const pedidoData = {
        descricao,
        valor: parseFloat(valor),
        status, // Já envia o valor do dropdown
    };

    try {
        const response = await fetch(`${BASE_URL}/order/updateOrder/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoData),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar pedido');
        }

        const data = await response.json();
        console.log('Pedido atualizado:', data);

        // Atualiza a lista de pedidos após editar
        listarPedidos();

        // Fecha o modal após a atualização
        const modalEditar = bootstrap.Modal.getInstance(document.getElementById('modalEditarPedido'));
        modalEditar.hide();

        // Exibe o alerta de sucesso
        showAlert("Cadastro atualizado com sucesso!", "success");
    } catch (error) {
        console.error(error);
        showAlert("Erro ao atualizar pedido. Tente novamente.", "danger");
    }
}


async function carregarPedido(id) {
    try {
        const response = await fetch(`${BASE_URL}/order/getOrder/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar pedido');

        const pedido = await response.json();

        // Preencher os campos do modal com os dados do pedido
        document.getElementById('pedidoId').value = pedido.id;
        document.getElementById('descricaoEditar').value = pedido.descricao;
        document.getElementById('valorEditar').value = pedido.valor;
        document.getElementById('statusEditar').value = pedido.status;
    } catch (error) {
        console.error('Erro ao carregar dados do pedido para edição:', error);
    }
}



// Função para abrir o modal de edição
function abrirModalEditar(id) {
    fetch(`${BASE_URL}/order/getOrder/${id}`)
        .then(response => response.json())
        .then(pedido => {
            document.getElementById('descricaoEditar').value = pedido.descricao;
            document.getElementById('valorEditar').value = pedido.valor;

            // Verifique se o elemento existe antes de acessar
            const statusField = document.getElementById('statusEditar');
            if (statusField) {
                statusField.value = pedido.status.toUpperCase(); // Normalizar e atribuir valor
            } else {
                console.error('Elemento statusEditar não encontrado no DOM.');
            }

            document.getElementById('pedidoId').value = id; // Armazena o ID
        })
        .catch(error => console.error('Erro ao carregar pedido:', error));

    // Aguarde que o modal seja carregado antes de manipular os elementos
    const myModal = new bootstrap.Modal(document.getElementById('modalEditarPedido'));
    myModal.show();
}



function formatarStatus(status) {
    switch (status) {
        case "PROCESSAMENTO":
            return "Processamento";
        case "ENVIADO":
            return "Enviado";
        case "ENTREGUE":
            return "Entregue";
        case "CANCELADO":
            return "Cancelado";
        default:
            return "N/A";
    }
}



// Função para deletar um pedido
async function deletarPedido(id) {
    const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
    btnConfirmarExclusao.disabled = true; // Desabilita o botão após o clique

    try {
        const response = await fetch(`${BASE_URL}/order/deleteOrder/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log(`Pedido ${id} excluído com sucesso`);
            setTimeout(() => {
                listarPedidos();
            },); // Atualiza a lista após 1 segundo
            showAlert("Pedido excluído com sucesso!", "success");

            // Fechar o modal de exclusão
            const modalExcluir = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarExclusao'));
            modalExcluir.hide();
        } else if (response.status === 404) {
            showAlert("Erro: Pedido não encontrado.", "danger");
        } else if (response.status === 409) {
            showAlert("Erro de concorrência ao excluir pedido. Tente novamente.", "danger");
        } 
    } catch (error) {
        console.error('Erro ao excluir pedido:', error);
        showAlert("Erro ao excluir pedido. Tente novamente.", "danger");
    } finally {
        btnConfirmarExclusao.disabled = false; // Reabilita o botão para futuras ações
    }
}



function modalConfirmarExclusao(id) {
    const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
    btnConfirmarExclusao.setAttribute('data-id', id);
    btnConfirmarExclusao.disabled = false; // Habilita o botão
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarExclusao'));
    modal.show();
}


document.addEventListener('DOMContentLoaded', function () {
    carregarClientes();
    listarPedidos();

    // Configura o evento para o botão de confirmação de exclusão
    document.getElementById('btnConfirmarExclusao').addEventListener('click', () => {
        const id = document.getElementById('btnConfirmarExclusao').getAttribute('data-id');
        deletarPedido(id); // Chama a função para excluir o pedido
    });
});





// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    carregarClientes(); // Corrige o erro da função inexistente
    listarPedidos();    // Carrega os pedidos
});

