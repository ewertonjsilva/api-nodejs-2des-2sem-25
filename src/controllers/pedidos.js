const db = require('../dataBase/connection');

module.exports = {
    async listarPedidos(request, response) {
        try {
            const { id, usuario, tipo, status, page = 1, limit = 10 } = request.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const countQuery = `
                SELECT COUNT(*) AS total
                FROM pedidos p
                WHERE 1=1
                ${id ? 'AND p.ped_id = ?' : ''}
                ${usuario ? 'AND p.usu_id = ?' : ''}
                ${tipo ? 'AND p.ped_tipo = ?' : ''}
                ${status ? 'AND p.ped_status = ?' : ''}
            `;

            const countValues = [];
            if (id) countValues.push(id);
            if (usuario) countValues.push(usuario);
            if (tipo) countValues.push(tipo);
            if (status) countValues.push(status);

            const [[{ total }]] = await db.query(countQuery, countValues.length ? countValues : null);

            const listQuery = `
                SELECT p.*
                FROM pedidos p
                WHERE 1=1
                ${id ? 'AND p.ped_id = ?' : ''}
                ${usuario ? 'AND p.usu_id = ?' : ''}
                ${tipo ? 'AND p.ped_tipo = ?' : ''}
                ${status ? 'AND p.ped_status = ?' : ''}
                ORDER BY p.ped_data DESC
                LIMIT ?, ?
            `;

            const listValues = [];
            if (id) listValues.push(id);
            if (usuario) listValues.push(usuario);
            if (tipo) listValues.push(tipo);
            if (status) listValues.push(status);
            listValues.push(offset);
            listValues.push(parseInt(limit));

            const [pedidos] = await db.query(listQuery, listValues);

            response.setHeader('X-Total-Count', total || 0);
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de pedidos',
                nItens: pedidos.length,
                dados: pedidos
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar pedidos.',
                dados: error.message
            });
        }
    },
    async cadastrarPedidos(request, response) {
        try {
            const { data, usu_id, end_id = null, tipo = 0, status = 1, desconto = 0.00, vlr_pago = 0.00, tp_pag = 0, pago = 0 } = request.body;

            const sql = `
                INSERT INTO pedidos
                    (ped_data, usu_id, end_id, ped_tipo, ped_status, ped_desconto, ped_vlr_pago, ped_tp_pag, ped_pago)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [data, usu_id, end_id, tipo, status, parseFloat(desconto), parseFloat(vlr_pago), tp_pag, pago];

            const [result] = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Pedido cadastrado com sucesso!',
                dados: { id: result.insertId }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao cadastrar pedido.',
                dados: error.message
            });
        }
    },
    async editarPedidos(request, response) {
        try {
            const { id } = request.params;
            const { data, usu_id, end_id, tipo, status, desconto, vlr_pago, tp_pag, pago } = request.body;

            const sql = `
                UPDATE pedidos SET
                    ped_data = ?, usu_id = ?, end_id = ?, ped_tipo = ?, ped_status = ?, ped_desconto = ?, ped_vlr_pago = ?, ped_tp_pag = ?, ped_pago = ?
                WHERE ped_id = ?;
            `;

            const values = [data, usu_id, end_id, tipo, status, desconto, vlr_pago, tp_pag, pago, id];

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({ sucesso: false, mensagem: `Pedido ${id} não encontrado.`, dados: null });
            }

            return response.status(200).json({ sucesso: true, mensagem: `Pedido ${id} atualizado com sucesso.`, dados: null });

        } catch (error) {
            return response.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar pedido.', dados: error.message });
        }
    },
    async apagarPedidos(request, response) {
        try {
            const { id } = request.params;
            const sql = `DELETE FROM pedidos WHERE ped_id = ?`;
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                return response.status(404).json({ sucesso: false, mensagem: `Pedido ${id} não encontrado.`, dados: null });
            }

            return response.status(200).json({ sucesso: true, mensagem: `Pedido ${id} excluído com sucesso.`, dados: null });

        } catch (error) {
            return response.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir pedido.', dados: error.message });
        }
    }
};
