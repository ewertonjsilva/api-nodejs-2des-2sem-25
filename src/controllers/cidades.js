const db = require('../dataBase/connection');

module.exports = {
    async listarCidades(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de cidades obtida com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao listar cidades: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async cadastrarCidades(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de cidade realizado com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar cidade: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async editarCidades(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização de cidade realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar cidade: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async apagarCidades(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de cidade realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover cidade: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}