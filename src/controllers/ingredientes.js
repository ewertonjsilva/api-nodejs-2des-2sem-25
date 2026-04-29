const db = require('../dataBase/connection');

const { gerarUrl } = require('../utils/gerarUrl');

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
                    ing_nome LIKE ?;
            `;

            const values = [ing_nome];
            const [rows] = await db.query(sql, values);
            const nItens = rows.length;

            const dados = rows.map(ingrediente => ({
                id: ingrediente.ing_id,
                nome: ingrediente.ing_nome,
                img: gerarUrl(ingrediente.ing_img, 'ingredientes', 'sem.svg'),
                custo_adicional: ingrediente.ing_custo_adicional
            }));

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de ingredientes obtida com sucesso.',
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
            const { nome, custoComoAdicional } = request.body;
            const imagem = request.file;

            if (!nome || imagem === undefined || imagem === null || custoComoAdicional === undefined) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nome, imagem e custo adicional são obrigatórios.',
                    dados: null
                });
            }

            if (isNaN(Number(custoComoAdicional))) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Custo adicional deve ser um número.',
                    dados: null
                });
            }

            const sql = `
                INSERT INTO ingredientes 
                    (ing_nome, ing_img, ing_custo_adicional) 
                VALUES (?, ?, ?);
            `;

            const values = [nome, imagem.filename, Number(custoComoAdicional)];
            const [result] = await db.query(sql, values);

            return response.status(201).json({
                sucesso: true,
                mensagem: 'Ingrediente adicionado com sucesso.',
                dados: { id: result.insertId }
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    async editarIngredientes(request, response) {
        try {
            const { id, nome, custoComoAdicional } = request.body;
            const imagem = request.file;

            if (!id) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do ingrediente é obrigatório para atualização.',
                    dados: null
                });
            }

            const camposValidos = {
                nome: 'ing_nome',
                custoComoAdicional: 'ing_custo_adicional'
            };

            const setClauses = [];
            const values = [];

            if (nome !== undefined) {
                setClauses.push(`${camposValidos.nome} = ?`);
                values.push(nome);
            }

            if (custoComoAdicional !== undefined) {
                if (isNaN(Number(custoComoAdicional))) {
                    return response.status(400).json({
                        sucesso: false,
                        mensagem: 'Custo adicional deve ser um número.',
                        dados: null
                    });
                }
                setClauses.push(`${camposValidos.custoComoAdicional} = ?`);
                values.push(Number(custoComoAdicional));
            }

            if (imagem && imagem.filename) {
                setClauses.push('ing_img = ?');
                values.push(imagem.filename);
            }

            if (setClauses.length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido enviado para atualização.',
                    dados: null
                });
            }

            values.push(id);

            const sql = `
                UPDATE ingredientes
                SET ${setClauses.join(', ')}
                WHERE ing_id = ?;
            `;

            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Ingrediente com ID ${id} não encontrado.`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Atualização de ingrediente realizada com sucesso.',
                dados: { id }
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: `Erro ao atualizar ingrediente: ${error.message}`,
                dados: null
            });
        }
    },

    async apagarIngredientes(request, response) {
        try {
            const { id } = request.body;

            if (!id) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'ID do ingrediente é obrigatório para exclusão.',
                    dados: null
                });
            }

            const sql = `
                DELETE FROM ingredientes
                WHERE ing_id = ?;
            `;

            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Ingrediente com ID ${id} não encontrado.`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Exclusão de ingrediente realizada com sucesso.',
                dados: { id }
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: `Erro ao remover ingrediente: ${error.message}`,
                dados: null
            });
        }
    },
};