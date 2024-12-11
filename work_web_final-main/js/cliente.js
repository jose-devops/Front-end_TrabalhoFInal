// URL base do backend
const BASE_URL = 'http://localhost:8080';

// Função para validar dados do cliente
function validarCliente(clienteData) {
    if (!clienteData.nome || clienteData.nome.trim() === '') {
        throw new Error('O nome do cliente é obrigatório.');
    }
    if (!clienteData.cpf || clienteData.cpf.trim().length !== 11 || !/^\d+$/.test(clienteData.cpf)) {
        throw new Error('O CPF deve conter 11 dígitos numéricos.');
    }
}


// Função para validar todos os campos do formulário
function validarFormularioCadastro() {
    let isValid = true;

    // Validação do Nome
    const nome = document.getElementById("nome");
    const nomeError = document.getElementById("nome-error");
    if (!nome.value.trim()) {
        nomeError.textContent = "O nome é obrigatório.";
        nomeError.classList.remove("d-none");
        isValid = false;
    } else {
        nomeError.textContent = "";
        nomeError.classList.add("d-none");
    }

    // Validação do CPF
    const cpf = document.getElementById("cpf");
    const cpfError = document.getElementById("cpf-error");
    if (!/^\d{11}$/.test(cpf.value)) {
        cpfError.textContent = "O CPF deve conter exatamente 11 dígitos numéricos.";
        cpfError.classList.remove("d-none");
        isValid = false;
    } else {
        cpfError.textContent = "";
        cpfError.classList.add("d-none");
    }

    // Validação do Telefone
    const telefone = document.getElementById("telefone");
    const telefoneError = document.getElementById("telefone-error");
    if (!telefone.value.trim()) {
        telefoneError.textContent = "O telefone é obrigatório.";
        telefoneError.classList.remove("d-none");
        isValid = false;
    } else {
        telefoneError.textContent = "";
        telefoneError.classList.add("d-none");
    }

    // Validação do Endereço
    const endereco = document.getElementById("endereco");
    const enderecoError = document.getElementById("endereco-error");
    if (!endereco.value.trim()) {
        enderecoError.textContent = "O endereço é obrigatório.";
        enderecoError.classList.remove("d-none");
        isValid = false;
    } else {
        enderecoError.textContent = "";
        enderecoError.classList.add("d-none");
    }

    return isValid; // Retorna true se todos os campos forem válidos
}

// Evento de submissão do formulário
document.getElementById("formCadastrarCliente").addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Realiza a validação do formulário
    if (!validarFormularioCadastro()) {
        return; // Interrompe o processo se a validação falhar
    }

    // Se a validação passar, coleta os dados do formulário
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const telefone = document.getElementById("telefone").value;
    const endereco = document.getElementById("endereco").value;

    const clienteData = { nome, cpf, telefone, endereco };

    try {
        await criarCliente(clienteData); // Chama a função para criar o cliente
    } catch (error) {
        console.error(error);
    }
});



// Função para exibir mensagens de feedback ao usuário
function exibirMensagem(mensagem, tipo) {
    const alertContainer = document.getElementById('mensagemTopo');
    
    const alert = document.createElement('div');
    alert.classList.add('alert', tipo === 'sucesso' ? 'alert-success' : 'alert-danger');
    alert.textContent = mensagem;

    // Remove qualquer alerta anterior
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Exibe a mensagem e a remove após 3 segundos
    alertContainer.style.display = 'block';
    setTimeout(() => {
        alertContainer.style.opacity = '0';
        setTimeout(() => {
            alertContainer.style.display = 'none';
            alertContainer.style.opacity = '1';
        }, 500);
    }, 3000);  // A mensagem desaparecerá após 3 segundos
}





// Função para criar um cliente
async function criarCliente(clienteData) {
    try {
        validarCliente(clienteData);  // Valida os dados antes de enviar

        const response = await fetch(`${BASE_URL}/client/createClient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData),
        });

        if (!response.ok) {
            if (response.status === 409) {  // Verifica se o erro é de CPF duplicado
                throw new Error('CPF já cadastrado no sistema.');
            }
            throw new Error('CPF ja cadastrado!');
        }

        const data = await response.json();
        console.log('Cliente criado:', data);
        exibirMensagem('Cliente criado com sucesso!', 'sucesso');
        renderizarTabela();  // Atualiza a tabela de clientes
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        exibirMensagem(error.message, 'erro');
    }
}

// Validação em tempo real para o campo CPF
document.getElementById("cpf").addEventListener("input", function () {
    const cpfInput = this.value;
    const cpfError = document.getElementById("cpf-error");

    // Verifica se o CPF contém exatamente 11 dígitos numéricos
    if (!/^\d{11}$/.test(cpfInput)) {
        cpfError.textContent = "O CPF deve conter exatamente 11 dígitos.";
        cpfError.classList.remove("d-none");
    } else {
        cpfError.textContent = "";
        cpfError.classList.add("d-none");
    }
});









// Função para listar todos os clientes
async function listarClientes() {
    try {
        const response = await fetch(`${BASE_URL}/client/listClients`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Erro ao listar clientes');
        }

        const clientes = await response.json();
        return clientes;
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        return [];
    }
}

// Função para exibir os clientes na tabela
async function renderizarTabela() {
    const clientes = await listarClientes();
    const tabela = document.getElementById('clientesTabela');  // Tabela onde os clientes serão exibidos
    tabela.innerHTML = "";  // Limpa a tabela antes de atualizar

    if (clientes.length === 0) {
        tabela.innerHTML = "<tr><td colspan='5'>Nenhum cliente cadastrado.</td></tr>";
    } else {
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.endereco}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="abrirModalEditar('${cliente.id}')" data-bs-toggle="modal" data-bs-target="#modalEditarCliente">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="abrirModalExcluir('${cliente.id}')" data-bs-toggle="modal" data-bs-target="#modalExcluirCliente">Excluir</button>
                </td>
            `;
            tabela.appendChild(row);
        });
    }
}




// Função para tratar o envio do formulário de cadastro de cliente
document.getElementById('formCadastrarCliente').addEventListener('submit', async (event) => {
    event.preventDefault();  // Impede o envio padrão do formulário

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    const clienteData = { nome, cpf, telefone, endereco };

    try {
        await criarCliente(clienteData);  // Tenta criar o cliente
    } catch (error) {
        console.error(error);
        // Não limpa o formulário caso haja erro, para o usuário corrigir o campo
    }
});




// Função para abrir o modal de edição e preencher com os dados do cliente
let clienteIdParaEditar;
async function abrirModalEditar(clienteId) {
    try {
        const response = await fetch(`${BASE_URL}/client/client/${clienteId}`, { method: 'GET' });

        if (!response.ok) {
            throw new Error('Erro ao carregar os dados do cliente');
        }

        const cliente = await response.json();

        document.getElementById('nome-editar').value = cliente.nome;
        document.getElementById('cpf-editar').value = cliente.cpf;
        document.getElementById('telefone-editar').value = cliente.telefone;
        document.getElementById('endereco-editar').value = cliente.endereco;

        clienteIdParaEditar = clienteId;  // Salva o id do cliente para edição
    } catch (error) {
        console.error('Erro ao abrir o modal de edição:', error);
    }
}

// Função para tratar o envio do formulário de edição de cliente
document.getElementById('formEditarCliente').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome-editar').value;
    const cpf = document.getElementById('cpf-editar').value;
    const telefone = document.getElementById('telefone-editar').value;
    const endereco = document.getElementById('endereco-editar').value;

    const clienteData = { nome, cpf, telefone, endereco };

    await atualizarCliente(clienteIdParaEditar, clienteData);  // Passa o id correto da edição
    renderizarTabela();  // Atualiza a tabela após a edição
    document.getElementById('formEditarCliente').reset();  // Limpa o formulário
});

// Função para atualizar um cliente
async function atualizarCliente(id, clienteData) {
    try {
        const response = await fetch(`http://localhost:8080/client/updateClient/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clienteData),
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar cliente: " + response.status);
        }

        const clienteAtualizado = await response.json();
        console.log("Cliente atualizado com sucesso:", clienteAtualizado);
        alert("Cliente atualizado com sucesso!");
        return clienteAtualizado; // Retorna o cliente atualizado
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        alert("Erro ao atualizar cliente: " + error.message);
    }
}


// Função para abrir o modal de exclusão e passar o id do cliente
let clienteIdParaExcluir;
function abrirModalExcluir(clienteId) {
    clienteIdParaExcluir = clienteId;
}

// Função para excluir o cliente
document.querySelector('#modalExcluirCliente .btn-danger').addEventListener('click', async () => {
    if (clienteIdParaExcluir) {
        await deletarCliente(clienteIdParaExcluir);
        renderizarTabela();  // Atualiza a tabela após a exclusão
    }
});

// Função para deletar um cliente
async function deletarCliente(id) {
    try {
        const response = await fetch(`${BASE_URL}/client/deleteClient/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar cliente');
        }

        console.log('Cliente deletado');
        exibirMensagem('Cliente deletado com sucesso!', 'sucesso');
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        exibirMensagem(error.message, 'erro');
    }
}

// Chama a função para carregar os clientes assim que a página for carregada
window.addEventListener('DOMContentLoaded', () => {
    renderizarTabela();
});
