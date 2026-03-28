const db = require('../dataBase/connection');

const bcrypt = require('bcrypt');

module.exports = {
    async listarUsuarios(request, response) {
        try {

            const sql = `
                SELECT 
                    usu_id, usu_nome, usu_email, usu_cpf, usu_dt_nasc, 
                    usu_senha, usu_tipo, usu_ativo = 1 AS usu_ativo
                FROM usuarios;
            `;

            const [usuarios] = await db.query(sql);

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Lista de usuários obtida com sucesso',
                    nItens: usuarios.length,
                    dados: usuarios
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao listar usuários: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async cadastrarUsuarios(request, response) {
        try {
            const { nome, email, dt_nasc, senha, tipo, cpf } = request.body;
            const usu_ativo = 1;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            const sql = `
                INSERT INTO usuarios 
                    (usu_nome, usu_email, usu_dt_nasc, usu_senha, usu_tipo, usu_ativo, usu_cpf) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [nome, email, dt_nasc, hashedPassword, tipo, usu_ativo, cpf];

            const [result] = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cadastro de usuário efetuado com sucesso!',
                dados: {
                    id: result.insertId,
                    nome,
                    email,
                    tipo
                }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async editarUsuarios(request, response) {
        try {
            // parâmetros recebidos pelo corpo da requisição
            const { nome, email, dt_nasc, senha, tipo, ativo } = request.body;
            // parâmetro recebido pela URL via params ex: /usuario/1
            const { id } = request.params;
            // instruções SQL
            const sql = `
                UPDATE usuarios SET 
                    usu_nome = ?, usu_email = ?, usu_dt_nasc = ?, usu_senha = ?, usu_tipo = ?, usu_ativo = ? 
                WHERE 
                    usu_id = ?;
            `;
            // preparo do array com dados que serão atualizados
            const values = [nome, email, dt_nasc, senha, tipo, ativo, id];
            // execução e obtenção de confirmação da atualização realizada
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            const dados = {
                id,
                nome,
                email,
                tipo
            };

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} atualizado com sucesso!`,
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
    async apagarUsuarios(request, response) {
        try {
            // parâmetro passado via url na chamada da api pelo front-end
            const { id } = request.params;
            // comando de exclusão
            const sql = `DELETE FROM usuarios WHERE usu_id = ?`;
            // array com parâmetros da exclusão
            const values = [id];
            // executa instrução no banco de dados
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} excluído com sucesso`,
                dados: null
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async ocultarUsuario(request, response) {
        try {

            const ativo = false;
            const { id } = request.params;
            const sql = `
                UPDATE usuarios SET 
                    usu_ativo = ? 
                WHERE 
                    usu_id = ?;
            `;

            const values = [ativo, id];
            const [result] = await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Usuário ${id} excluído com sucesso`,
                dados: null
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async login(request, response) {
        try {
            const { email, senha } = request.query;

            const sql = `
                SELECT 
                    usu_id, usu_nome, usu_tipo, usu_senha 
                FROM 
                    usuarios 
                WHERE 
                    usu_email = ? AND usu_ativo = 1;
            `;

            const [rows] = await db.query(sql, [email]);

            if (rows.length === 0) {
                return response.status(403).json({
                    sucesso: false,
                    mensagem: 'Email não encontrado ou usuário inativo.',
                    dados: null,
                });
            }

            const usuario = rows[0];
            const senhaCorreta = await bcrypt.compare(senha, usuario.usu_senha);

            if (!senhaCorreta) {
                return response.status(403).json({
                    sucesso: false,
                    mensagem: 'Senha incorreta.',
                    dados: null,
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Login efetuado com sucesso',
                dados: {
                    id: usuario.usu_id,
                    nome: usuario.usu_nome,
                    tipo: usuario.usu_tipo
                }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async atualizaSenha(request, response) {
        try {
            const { senha } = request.body;
            const { id } = request.params;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            const sql = `
                UPDATE usuarios 
                SET usu_senha = ? 
                WHERE usu_id = ?;
            `;

            const [result] = await db.query(sql, [hashedPassword, id]);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Usuário ${id} não encontrado!`,
                    dados: null
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: `Senha do usuário ${id} atualizada com sucesso!`,
                dados: null
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
}