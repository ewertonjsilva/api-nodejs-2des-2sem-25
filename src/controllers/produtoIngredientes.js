const db = require('../dataBase/connection');

module.exports = {
    async listarProdutoIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de ingredientes do produto obtida com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao listar ingredientes do produto: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async cadastrarProdutoIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de ingredientes do produto realizado com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar ingredientes do produto: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async editarProdutoIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização de ingredientes do produto realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar ingredientes do produto: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async apagarProdutoIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de ingredientes do produto realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover ingredientes do produto: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}