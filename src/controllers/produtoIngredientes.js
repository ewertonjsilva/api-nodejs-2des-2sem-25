const db = require('../dataBase/connection');

module.exports = {
    async listarProdutos(request, response) {

        const { id, nome, tipo, valor, disponivel = 1, page = 1, limit = 5 } = request.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        try {
            const [[{ vlr_max }]] = await db.query('SELECT MAX(prd_valor) as vlr_max FROM produtos');
            const valorLimite = parseFloat(valor ?? vlr_max);

            const countQuery = `
                SELECT COUNT(*) AS total
                FROM produtos prd
                INNER JOIN produto_tipos pdt ON pdt.ptp_id = prd.ptp_id
                WHERE prd.prd_disponivel = ?
                    AND prd.prd_nome LIKE ?
                    AND prd.ptp_id LIKE ?
                    ${id ? 'AND prd.prd_id = ?' : ''}
                    AND prd.prd_valor <= ?
            `;

            const countValues = id
                ? [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, id, valorLimite]
                : [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, valorLimite];

            const [[{ total }]] = await db.query(countQuery, countValues);

            const listQuery = `
                SELECT prd.prd_id, prd.prd_nome, prd.prd_valor, prd.prd_unidade,
                        pdt.ptp_icone, prd.prd_img, prd.prd_descricao
                FROM produtos prd
                INNER JOIN produto_tipos pdt ON pdt.ptp_id = prd.ptp_id
                WHERE prd.prd_disponivel = ?
                    AND prd.prd_nome LIKE ?
                    AND prd.ptp_id LIKE ?
                    ${id ? 'AND prd.prd_id = ?' : ''}
                    AND prd.prd_valor <= ? 
                LIMIT ?, ?
            `;

            const listValues = id
                ? [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, id, valorLimite, offset, parseInt(limit)]
                : [disponivel, `%${nome ?? ''}%`, `%${tipo ?? ''}%`, valorLimite, offset, parseInt(limit)];

            const [produtos] = await db.query(listQuery, listValues);

            const dados = produtos.map(produto => ({
                id: produto.prd_id,
                nome: produto.prd_nome,
                valor: produto.prd_valor,
                unidade: produto.prd_unidade,
                icone: produto.ptp_icone,
                imgProduto: produto.prd_img,
                descricao: produto.prd_descricao
            }));

            response.setHeader('X-Total-Count', total);
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de produtos',
                nItens: dados.length,
                dados
            });

        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar produtos.',
                dados: error.message
            });
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