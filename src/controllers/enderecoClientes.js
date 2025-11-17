const db = require('../dataBase/connection');

module.exports = {
    async listarEnderecoClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de Endereços do Cliente obtida com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao Endereços do Cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async cadastrarEnderecoClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro do Endereço do Cliente realizado com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar Endereço do Cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async editarEnderecoClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização do Endereço do Cliente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar Endereço do Cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async apagarEnderecoClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão do Endereço do Cliente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover Endereço do Cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}