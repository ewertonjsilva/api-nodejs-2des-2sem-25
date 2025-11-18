const db = require('../dataBase/connection');

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

            const { nome, email, senha, tipo, dt_nasc, cpf } = request.body; 
            const ativo = 1;

            const sql = `
                INSERT INTO usuarios 
                    (usu_nome, usu_email, usu_senha, usu_tipo, usu_ativo, usu_dt_nasc, usu_cpf) 
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?);
            `;

            const values = [nome, email, senha, tipo, ativo, dt_nasc, cpf];

            const [result] = await db.query(sql, values); 

            const dados = {
                usu_id: result.insertId,
                usu_nome: nome,
                usu_email: email,
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de usuário realizado com sucesso',
                    dados: dados
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar usuário: ${error.message}`,
                    dados: null
                }
            );
        }
    },
    async editarUsuarios(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Atualização de usuário realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao atualizar usuário: ${error.message}`,
                    dados: null
                }
            );
        }
    }, 
    async apagarUsuarios(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de usuário realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover usuário: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}