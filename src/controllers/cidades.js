/**
 * @file   src\controllers\cidades.js
 * @author Ewerton
 * @date   2026-05-07
 * @desc   [Descrição do script ou função]
 */

const db = require('../dataBase/connection');

module.exports = {
    async listarCidades(request, response) {
        try {
            const { uf, cidade } = request.query;

            // Verificação obrigatória
            if (!uf) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'UF (estado) é obrigatório para listar cidades.',
                });
            }

            // Formata o nome da cidade para busca parcial
            const cid_nome = cidade ? `%${cidade}%` : `%`;

            // Consulta SQL parametrizada
            const SQL_LISTAR_CIDADES = `
                SELECT 
                    cid_id, cid_nome, cid_uf 
                FROM 
                    cidades 
                WHERE 
                    cid_uf = ? AND cid_nome LIKE ?;
            `;

            const values = [uf.toUpperCase(), cid_nome];
            const [rows] = await db.query(SQL_LISTAR_CIDADES, values);

            const dados = rows.map(municipio => ({
                id: municipio.cid_id, 
                uf: municipio.cid_uf,
                cidade: municipio.cid_nome
            }));

            return response.status(200).json({
                sucesso: true,
                mensagem: dados.length > 0
                    ? 'Lista de cidades encontrada com sucesso.'
                    : 'Nenhuma cidade encontrada com os critérios fornecidos.',
                nItens: dados.length,
                dados
            });

        } catch (error) {
            console.error('Erro ao listar cidades:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao listar cidades.',
                dados: error.message
            });
        }
    },
    async listarUfs(request, response) {
        try {
            const sql = `
                SELECT DISTINCT 
                    cid_uf 
                FROM 
                    cidades 
                ORDER BY 
                    cid_uf ASC;
            `;

            const [rows] = await db.query(sql);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de estados.',
                dados: rows
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
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