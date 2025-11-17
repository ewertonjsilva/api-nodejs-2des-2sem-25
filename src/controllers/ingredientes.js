const db = require('../dataBase/connection');

module.exports = {
    async listarIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de ingredientes obtida com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao listar ingredientes: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async cadastrarIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de ingrediente realizado com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar ingrediente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async editarIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização de ingrediente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar ingrediente: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async apagarIngredientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de ingrediente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover ingrediente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}