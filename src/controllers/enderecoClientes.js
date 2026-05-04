const db = require('../dataBase/connection');

module.exports = {
    async listarEnderecoClientes(request, response) {
        // Recebe o id do usuário via params (ex: /enderecos/4) 
        // ou query (ex: /enderecos?id=4)
        const { id } = request.query;

        if (!id) {
            return response.status(400).json({
                sucesso: false,
                mensagem: 'ID do cliente não informado.',
                dados: null
            });
        }

        try {
            const sql = `
            SELECT 
                cliend.end_id,
                cliend.end_logradouro, 
                cliend.end_num, 
                cliend.end_bairro, 
                cliend.end_complemento,
                cliend.cid_id,
                cid.cid_nome, 
                cid.cid_uf,
                -- Converte o bit/boolean para 1 ou 0
                CASE WHEN cliend.end_principal = 1 THEN 1 ELSE 0 END AS end_principal
            FROM 
                cliente_enderecos cliend 
            INNER JOIN 
                cidades cid ON cid.cid_id = cliend.cid_id 
            WHERE 
                cliend.usu_id = ? 
                AND cliend.end_excluido = 0
            ORDER BY 
                cliend.end_principal DESC; -- Deixa o principal no topo da lista
        `;

            const [rows] = await db.query(sql, [id]);
            const nItens = rows.length;

            return response.status(200).json({
                sucesso: true,
                mensagem: nItens > 0 ? 'Endereços encontrados.' : 'Nenhum endereço cadastrado.',
                dados: rows,
                nItens
            });

        } catch (error) {
            console.error('Erro ao listar endereços:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao buscar endereços.',
                dados: error.message
            });
        }
    }, 
    async cadastrarEnderecoClientes(request, response) {
        try {

            const { idUsuario, logradouro, num, bairro, complemento, idCidade, principal } = request.body;
            const end_excluido = false;
            let end_principal = principal;

            // 1. Verificar se já existem endereços para este usuário
            const sqlChecarEndereco = `SELECT COUNT(*) AS total_enderecos FROM cliente_enderecos WHERE usu_id = ? AND end_excluido = false;`;
            const [resultCheck] = await db.query(sqlChecarEndereco, [idUsuario]);
            const totalEnderecos = resultCheck[0].total_enderecos;

            // 2. Se não houver endereços, defina o novo como principal
            if (totalEnderecos === 0) {
                end_principal = true;
            } else {
                // Se já houver endereços e o que está sendo cadastrado for definido como principal
                if (end_principal === true) {
                    const sqlUpdateEnd = `UPDATE cliente_enderecos SET end_principal = 0 WHERE usu_id = ?;`;
                    await db.query(sqlUpdateEnd, [idUsuario]);
                }
            }

            const sql = `
                INSERT INTO cliente_enderecos 
                    (usu_id, end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_excluido) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [idUsuario, logradouro, num, bairro, complemento, idCidade, principal, end_excluido];

            const [result] = await db.query(sql, values);

            const end_id = result.insertId;

            return response.status(200).json({
                sucesso: true,
                mensagem: `Cadastro de endereço do cliente ${idUsuario} realizado com sucesso.`,
                dados: { end_id }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
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