const db = require('../dataBase/connection');

module.exports = {
    async listarClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de clientes obtida com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao listar clientes: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async cadastrarClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de cliente realizado com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async editarClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização de cliente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async apagarClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de cliente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}