const db = require('../dataBase/connection');

module.exports = {
    async listarPedidoProdutos(request, response) {
        try {
            const { id, pedido, prd_id, page = 1, limit = 20 } = request.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const countQuery = `
                SELECT COUNT(*) AS total
                FROM pedido_produtos pp
                WHERE 1=1
                ${id ? 'AND pp.ppd_id = ?' : ''}
                ${pedido ? 'AND pp.ped_id = ?' : ''}
                ${prd_id ? 'AND pp.prd_id = ?' : ''}
            `;

            const countValues = [];
            if (id) countValues.push(id);
            if (pedido) countValues.push(pedido);
            if (prd_id) countValues.push(prd_id);

            const [[{ total }]] = await db.query(countQuery, countValues.length ? countValues : null);

            const listQuery = `
                SELECT pp.*
                FROM pedido_produtos pp
                WHERE 1=1
                ${id ? 'AND pp.ppd_id = ?' : ''}
                ${pedido ? 'AND pp.ped_id = ?' : ''}
                ${prd_id ? 'AND pp.prd_id = ?' : ''}
                ORDER BY pp.ppd_hora DESC
                LIMIT ?, ?
            `;

            const listValues = [];
            if (id) listValues.push(id);
            if (pedido) listValues.push(pedido);
            if (prd_id) listValues.push(prd_id);
            listValues.push(offset);
            listValues.push(parseInt(limit));

            const [rows] = await db.query(listQuery, listValues);

            response.setHeader('X-Total-Count', total || 0);
            return response.status(200).json({ sucesso: true, mensagem: 'Lista de itens do pedido', nItens: rows.length, dados: rows });

        } catch (error) {
            return response.status(500).json({ sucesso: false, mensagem: 'Erro ao listar itens do pedido.', dados: error.message });
        }
    },
    async cadastrarPedidoProdutos(request, response) {
        try {
            const { hora, qtd, valor, obs = null, ped_id, prd_id, status = 1 } = request.body;

            const sql = `
                INSERT INTO pedido_produtos
                    (ppd_hora, ppd_qtd, ppd_valor, ppd_obs, ped_id, prd_id, ppd_status)
                VALUES (?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [hora, qtd, parseFloat(valor), obs, ped_id, prd_id, status];
            const [result] = await db.query(sql, values);

            return response.status(200).json({ sucesso: true, mensagem: 'Item do pedido cadastrado com sucesso.', dados: { id: result.insertId } });

        } catch (error) {
            return response.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar item do pedido.', dados: error.message });
        }
    },
    async editarPedidoProdutos(request, response) {
        try {
            const { id } = request.params;
            const { hora, qtd, valor, obs, ped_id, prd_id, status } = request.body;

            const sql = `
                UPDATE pedido_produtos SET
                    ppd_hora = ?, ppd_qtd = ?, ppd_valor = ?, ppd_obs = ?, ped_id = ?, prd_id = ?, ppd_status = ?
                WHERE ppd_id = ?;
            `;

            const values = [hora, qtd, valor, obs, ped_id, prd_id, status, id];
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({ sucesso: false, mensagem: `Item ${id} não encontrado.`, dados: null });
            }

            return response.status(200).json({ sucesso: true, mensagem: `Item ${id} atualizado com sucesso.`, dados: null });

        } catch (error) {
            return response.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar item do pedido.', dados: error.message });
        }
    },
    async apagarPedidoProdutos(request, response) {
        try {
            const { id } = request.params;
            const sql = `DELETE FROM pedido_produtos WHERE ppd_id = ?`;
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                return response.status(404).json({ sucesso: false, mensagem: `Item ${id} não encontrado.`, dados: null });
            }

            return response.status(200).json({ sucesso: true, mensagem: `Item ${id} excluído com sucesso.`, dados: null });

        } catch (error) {
            return response.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir item do pedido.', dados: error.message });
        }
    }
};
