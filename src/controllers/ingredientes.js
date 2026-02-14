const db = require('../dataBase/connection');

module.exports = {
    async listarIngredientes(request, response) {
        try {
            const { nome } = request.query;             
            
            const ing_nome = nome ? `%${nome}%` : `%`;
            const sql = `
                SELECT 
                    ing_id, ing_nome, ing_img, ing_custo_adicional 
                FROM 
                    ingredientes 
                WHERE 
                    ing_nome like ?;
            `;
            
            const values = [ing_nome];
            
            const [rows] = await db.query(sql, values);
            const nItens = rows.length; 

            const dados = rows.map(ingrediente => ({
                id: ingrediente.ing_id, 
                nome: ingrediente.ing_nome, 
                img: ingrediente.ing_img, 
                custo_adicional: ingrediente.ing_custo_adicional 
            }));

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de ingredientes.',
                nItens, 
                dados                
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
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