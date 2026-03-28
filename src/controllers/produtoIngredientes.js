const db = require('../dataBase/connection');

module.exports = {
    async listarProdutoIngredientes(request, response) {

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
            const { produto, ingrediente, adicional } = request.body;

            // Validação manual dos dados
            if (!produto || !ingrediente || adicional === undefined) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios: produto, ingrediente e adicional.',
                    dados: null
                });
            }

            if (isNaN(produto) || isNaN(ingrediente)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Os campos produto e ingrediente devem ser números.',
                    dados: null
                });
            }

            if (adicional !== 0 && adicional !== 1) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'O campo adicional deve ser 0 (não é adicional) ou 1 (é adicional).',
                    dados: null
                });
            }

            // Verificar se o produto existe
            const sqlProduto = `SELECT prd_id FROM produtos WHERE prd_id = ?`;
            const [produtoResult] = await db.query(sqlProduto, [produto]);

            if (produtoResult.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Produto não encontrado.',
                    dados: null
                });
            }

            // Verificar se o ingrediente existe
            const sqlIngrediente = `SELECT ing_id FROM ingredientes WHERE ing_id = ?`;
            const [ingredienteResult] = await db.query(sqlIngrediente, [ingrediente]);

            if (ingredienteResult.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Ingrediente não encontrado.',
                    dados: null
                });
            }

            // Verificar se o registro já existe
            const sqlCheck = `
                SELECT * FROM produto_ingredientes 
                WHERE prd_id = ? AND ing_id = ?
            `;
            const valuesCheck = [produto, ingrediente];
            const [check] = await db.query(sqlCheck, valuesCheck);

            if (check.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'Este ingrediente já está relacionado a este produto.',
                    dados: null
                });
            }

            // Inserir registro
            const sql = `
                INSERT INTO produto_ingredientes 
                    (prd_id, ing_id, prd_ing_adicional) 
                VALUES (?, ?, ?);
            `;
            const values = [produto, ingrediente, adicional];

            await db.query(sql, values);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Ingrediente adicionado ao produto com sucesso.',
                dados: { produto, ingrediente, adicional }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar ingrediente no produto.',
                dados: error.message
            });
        }
    },
    async editarProdutoIngredientes(request, response) {
        try {
            const { idProd, idIng } = request.params;
            const { adicional } = request.body;

            // Validação dos parâmetros
            if (!idProd || !idIng) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Produto e Ingrediente são obrigatórios nos parâmetros.',
                    dados: null
                });
            }

            // Verificar se o vínculo existe
            const [vinculo] = await db.query(
                `
                    SELECT prd_id AS idProduto, ing_id AS idIngrediente, prd_ing_adicional = 1 AS adicional 
                    FROM produto_ingredientes 
                    WHERE prd_id = ? AND ing_id = ?
                `,
                [idProd, idIng]
            );

            if (vinculo.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Vínculo entre produto e ingrediente não encontrado.',
                    dados: null
                });
            }

            // Validar e preparar campos para atualizar
            if (adicional !== undefined) {
                if (![0, 1].includes(adicional)) {
                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'O campo adicional deve ser 0 (não é adicional) ou 1 (é adicional).',
                        dados: null
                    });
                }
            }

            const sql = `UPDATE produto_ingredientes SET prd_ing_adicional = ? WHERE prd_id = ? AND ing_id = ?`;
            const values = [adicional, idProd, idIng];

            await db.query(sql, values);

            // Buscar dados atualizados
            const [vinculoAtualizado] = await db.query(
                `
                    SELECT prd_id AS idProduto, ing_id AS idIngrediente, prd_ing_adicional = 1 AS adicional 
                    FROM produto_ingredientes 
                    WHERE prd_id = ? AND ing_id = ?
                `,
                [idProd, idIng]
            );

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Vínculo atualizado com sucesso.',
                dados: {
                    antigo: vinculo[0],
                    atualizado: vinculoAtualizado[0]
                }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar vínculo.',
                dados: error.message
            });
        }
    },
    async apagarProdutoIngredientes(request, response) {
        try {
            const { produto, ingrediente } = request.params;

            if (!produto || !ingrediente) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Campos obrigatórios: produto e ingrediente.',
                    dados: null
                });
            }

            if (isNaN(produto) || isNaN(ingrediente)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Os campos produto e ingrediente devem ser números.',
                    dados: null
                });
            }

            // Verificar se há vínculo para excluir
            const [vinculo] = await db.query(
                `
                    SELECT prd_id AS idProduto, ing_id AS idIngrediente, prd_ing_adicional = 1 AS adicional 
                    FROM produto_ingredientes 
                    WHERE prd_id = ? AND ing_id = ?
                `,
                [produto, ingrediente]
            );

            if (vinculo.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Vínculo não encontrado.',
                    dados: null
                });
            }

            // Executar exclusão
            await db.query(
                `DELETE FROM produto_ingredientes WHERE prd_id = ? AND ing_id = ?`,
                [produto, ingrediente]
            );

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Vínculo removido com sucesso.',
                dados: vinculo[0] // retorna o que foi deletado como confirmação
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao excluir vínculo.',
                dados: error.message
            });
        }
    },
}