/**
 * @file   src\controllers\enderecoClientes.js
 * @author Ewerton
 * @date   2026-05-06
 * @desc   [Descrição do script ou função]
 */

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
            const { id } = request.params; // end_id do endereço
            const dados = request.body;

            // Mapeamento dos campos vindos do Front para as colunas do Banco
            const camposValidos = {
                logradouro: 'end_logradouro',
                num: 'end_num',
                bairro: 'end_bairro',
                complemento: 'end_complemento',
                idCidade: 'cid_id',
                principal: 'end_principal',
                excluido: 'end_excluido'
            };

            const setClauses = [];
            const values = [];

            // Lógica para tratar a regra de "Endereço Principal"
            if (dados.principal === true || dados.principal === 1) {
                // 1. Descobrimos quem é o dono (usu_id) deste endereço antes de atualizar
                const [enderecoAtual] = await db.query('SELECT usu_id FROM cliente_enderecos WHERE end_id = ?', [id]);

                if (enderecoAtual.length > 0) {
                    const usu_id = enderecoAtual[0].usu_id;
                    // 2. Removemos o status de principal de TODOS os endereços deste usuário
                    await db.query('UPDATE cliente_enderecos SET end_principal = 0 WHERE usu_id = ?', [usu_id]);
                }
            }

            // Montagem dinâmica da query de UPDATE
            for (const key in dados) {
                if (camposValidos[key] !== undefined && dados[key] !== undefined) {
                    setClauses.push(`${camposValidos[key]} = ?`);

                    // Tratamento para campos booleanos/bit
                    if (key === 'principal' || key === 'excluido') {
                        values.push(dados[key] ? 1 : 0);
                    } else {
                        values.push(dados[key]);
                    }
                }
            }

            if (setClauses.length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido enviado para atualização.',
                    dados: null
                });
            }

            // Adiciona o end_id para a cláusula WHERE
            values.push(id);

            const sql = `
            UPDATE cliente_enderecos
            SET ${setClauses.join(', ')}
            WHERE end_id = ?;
        `;

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Endereço com ID ${id} não encontrado.`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Endereço atualizado com sucesso.',
                dados: { end_id: id }
            });

        } catch (error) {
            console.error('Erro ao editar endereço:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao atualizar endereço.',
                dados: error.message
            });
        }
    },
    async apagarEnderecoClientes(request, response) {
        try {
            const { id } = request.params; // ID do endereço vindo da rota /endereco-cliente/:id
            let novoEnderecoPrincipal = false;

            // 1. Buscar informações do endereço que será excluído
            const sqlBusca = `SELECT usu_id, end_principal FROM cliente_enderecos WHERE end_id = ? AND end_excluido = 0`;
            const [endereco] = await db.query(sqlBusca, [id]);

            if (endereco.length === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Endereço não encontrado ou já excluído.',
                    dados: null
                });
            }

            const { usu_id, end_principal } = endereco[0];

            // 2. Verificar quantos endereços ativos o usuário possui
            const sqlContagem = `SELECT COUNT(*) AS total FROM cliente_enderecos WHERE usu_id = ? AND end_excluido = 0`;
            const [resultadoContagem] = await db.query(sqlContagem, [usu_id]);
            const totalEnderecos = resultadoContagem[0].total;

            // 3. Validação: Não permite excluir se for o único endereço
            if (totalEnderecos <= 1) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Para excluir o endereço atual, um novo deve ser cadastrado.',
                    dados: null
                });
            }

            // 4. Realizar a exclusão lógica (setar end_excluido como true/1)
            // Também garantimos que ele perca o status de principal ao ser excluído
            const sqlExcluir = `UPDATE cliente_enderecos SET end_excluido = 1, end_principal = 0 WHERE end_id = ?`;
            await db.query(sqlExcluir, [id]);

            // 5. Validação do Principal: Se o excluído era o principal, definir um novo
            if (end_principal === 1 || end_principal === true) {
                // Busca o primeiro endereço disponível (que não foi excluído)
                const sqlNovoPrincipal = `SELECT end_id FROM cliente_enderecos WHERE usu_id = ? AND end_excluido = 0 LIMIT 1`;
                const [proximo] = await db.query(sqlNovoPrincipal, [usu_id]);

                if (proximo.length > 0) {
                    const novoIdPrincipal = proximo[0].end_id;
                    await db.query(`UPDATE cliente_enderecos SET end_principal = 1 WHERE end_id = ?;`, [novoIdPrincipal]);
                    novoEnderecoPrincipal = true;
                }
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Exclusão do Endereço realizada com sucesso. ${novoEnderecoPrincipal ? 'Um novo endereço principal foi definido.' : ''}`,
                dados: { end_id: id }
            });

        } catch (error) {
            console.error('Erro ao apagar endereço:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: `Erro ao remover Endereço do Cliente: ${error.message}`,
                dados: null
            });
        }
    },
}