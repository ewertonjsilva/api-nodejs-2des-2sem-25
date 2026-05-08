/**
 * @file   src\controllers\clientes.js
 * @author Ewerton
 * @date   2026-05-04
 * @desc   [Descrição do script ou função]
 */

const db = require('../dataBase/connection');

const {
    validarCPF,
    validarEmail,
    validarTelefone,
    validarDataNascimento
} = require('../utils/validacoesUsuarios');

// Funções auxiliares de formatação (Máscaras)
const formatarCPF = (cpf) => {
    const s = cpf.toString().padStart(11, '0');
    return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatarTelefone = (tel) => {
    const s = tel.toString().replace(/\D/g, '');
    if (s.length === 11) {
        return s.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else {
        return s.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
};

const formatarData = (data) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR'); // Retorna dd/mm/aaaa
};

function cpfToInt(cpf) {
    const cpfSemMascara = cpf.replace(/\D/g, '');
    const cpfInteiro = parseInt(cpfSemMascara);
    return cpfInteiro;
};

module.exports = {
    async listarClientes(request, response) {
        const { id, nome, page = 1, limit = 5 } = request.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        try {
            // Query para contar o total de registros (respeitando filtros)
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM usuarios usu
                INNER JOIN clientes cli ON cli.usu_id = usu.usu_id
                WHERE usu.usu_tipo = 2
                    AND usu.usu_nome LIKE ?
                    ${id ? 'AND usu.usu_id = ?' : ''}
            `;

            const countValues = id
                ? [`%${nome ?? ''}%`, id]
                : [`%${nome ?? ''}%`];

            const [[{ total }]] = await db.query(countQuery, countValues);

            // Query para buscar os dados
            const listQuery = `
                SELECT 
                    usu.usu_id, 
                    usu.usu_nome, 
                    usu.usu_email, 
                    usu.usu_cpf, 
                    cli.cli_cel, 
                    usu.usu_dt_nasc
                FROM usuarios usu
                INNER JOIN clientes cli ON cli.usu_id = usu.usu_id
                WHERE usu.usu_tipo = 2
                    AND usu.usu_nome LIKE ?
                    ${id ? 'AND usu.usu_id = ?' : ''}
                ORDER BY usu.usu_nome ASC
                LIMIT ?, ?
            `;

            const listValues = id
                ? [`%${nome ?? ''}%`, id, offset, parseInt(limit)]
                : [`%${nome ?? ''}%`, offset, parseInt(limit)];

            const [clientes] = await db.query(listQuery, listValues);

            // Formatação dos dados conforme solicitado
            const dados = clientes.map(cliente => ({
                usu_id: cliente.usu_id,
                usu_nome: cliente.usu_nome,
                usu_email: cliente.usu_email,
                usu_cpf: formatarCPF(cliente.usu_cpf),
                cli_cel: formatarTelefone(cliente.cli_cel),
                usu_dt_nasc: formatarData(cliente.usu_dt_nasc)
            }));

            response.setHeader('X-Total-Count', total);
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de clientes obtida com sucesso',
                nItens: dados.length,
                dados
            });

        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            return response.status(500).json({
                sucesso: false,
                mensagem: `Erro ao listar clientes: ${error.message}`,
                dados: null
            });
        }
    },
    async cadastrarClientes(request, response) {
        try {
            const {
                nome,
                email,
                senha,
                dataNasc,
                cpf,
                logradouro,
                num,
                bairro,
                complemento,
                idCidade,
                cel
            } = request.body;

            // Verifica campos obrigatórios
            if (
                !nome || !email || !senha || !dataNasc || !cpf ||
                !logradouro || !num || !bairro || !idCidade || !cel
            ) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Todos os campos obrigatórios devem ser preenchidos.',
                    dados: null
                });
            }

            // Validação de e-mail
            if (!validarEmail(email)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail inválido.',
                    dados: null
                });
            }

            // Validação de CPF
            if (!validarCPF(cpf)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'CPF inválido.',
                    dados: null
                });
            }

            const usu_cpf = cpfToInt(cpf);

            // Validação de data de nascimento (formato básico yyyy-mm-dd)
            const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dataRegex.test(dataNasc)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Data de nascimento inválida. Use o formato YYYY-MM-DD.',
                    dados: null
                });
            }

            if (!validarDataNascimento(dataNasc)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'A data de nascimento não pode ser hoje!',
                    dados: null
                });
            }

            // Remove máscara do telefone e valida
            if (!validarTelefone(cel)) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Telefone inválido.',
                    dados: null
                });
            }

            const cli_cel = cel.replace(/\D/g, '');

            // Verifica se o e-mail já existe
            const [emailExiste] = await db.query(`SELECT usu_id FROM usuarios WHERE usu_email = ?`, [email]);
            if (emailExiste.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'E-mail já cadastrado.',
                    dados: null
                });
            }

            // Verifica se o CPF já existe
            const [cpfExiste] = await db.query(`SELECT usu_id FROM usuarios WHERE usu_cpf = ?`, [usu_cpf]);
            if (cpfExiste.length > 0) {
                return response.status(409).json({
                    sucesso: false,
                    mensagem: 'CPF já cadastrado.',
                    dados: null
                });
            }

            const usu_tipo = 2;
            const usu_ativo = 1;
            const cli_pts = 0;
            const end_principal = true;
            const end_excluido = false;

            // Inserir usuário
            const sqlUsu = `
                INSERT INTO usuarios 
                    (usu_nome, usu_email, usu_senha, usu_dt_nasc, usu_cpf, usu_tipo, usu_ativo) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const [usuarios] = await db.query(sqlUsu, [nome, email, senha, dataNasc, usu_cpf, usu_tipo, usu_ativo]);
            const usu_id = usuarios.insertId;

            // Inserir cliente
            const sqlCli = `
                INSERT INTO clientes (usu_id, cli_cel, cli_pts) 
                VALUES (?, ?, ?)
            `;
            await db.query(sqlCli, [usu_id, cli_cel, cli_pts]);

            // Inserir endereço
            const sqlEnd = `
                INSERT INTO cliente_enderecos  
                    (usu_id, end_logradouro, end_num, end_bairro, end_complemento, cid_id, end_principal, end_excluido) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db.query(sqlEnd, [usu_id, logradouro, num, bairro, complemento, idCidade, end_principal, end_excluido]);

            return response.status(201).json({
                sucesso: true,
                mensagem: `Cadastro do cliente ${usu_id} realizado com sucesso!`,
                dados: { usu_id }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao cadastrar cliente.',
                dados: error.message
            });
        }
    },
    async editarClientes(request, response) {
        // receber a pontuação que deve ser adicionada e retornar dados de antes e depois da atualização
        try {
            const { id } = request.params;
            const dados = request.body;

            // Mapeamento dos campos válidos para o banco de dados
            const camposValidos = {
                cel: 'cli_cel',
                pontos: 'cli_pts'
            };

            // Arrays para montar a query dinamicamente
            const setClauses = [];
            const values = [];

            // Monta dinamicamente os campos a serem atualizados 
            // Para cada campo válido, adiciona a string nome_do_campo_banco = ? no array setClauses
            for (const key in dados) {
                // exemplo, se key = 'cel', e camposValidos['cel'] = 'cli_cel'
                if (camposValidos[key] && dados[key] !== undefined) {
                    setClauses.push(`${camposValidos[key]} = ?`);
                    values.push(dados[key]);
                }
            }
            // Depois que todos os campos foram processados (se todos os campos forem passados), temos: 
            // setClauses = ['cli_cel = ?', 'cli_pts = ?'];

            // Se nenhum campo válido foi enviado, retorna erro
            if (setClauses.length === 0) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhum campo válido enviado para atualização.',
                    dados: null
                });
            }

            // Adiciona o ID ao final dos valores (para a cláusula WHERE)
            values.push(id);

            // Monta a query final        
            // SET cli_cel = ?, cli_pts = ? 
            const sql = `
                UPDATE clientes
                SET ${setClauses.join(', ')}
                WHERE usu_id = ?;
            `;

            // Executa a query
            const [result] = await db.query(sql, values);

            // Se nenhum registro foi alterado
            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Cliente com ID ${id} não encontrado.`,
                    dados: null
                });
            }

            // Sucesso
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Atualização de dados do cliente realizada com sucesso.',
                dados: { id }
            });

        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar cliente.',
                dados: error.message
            });
        }
    },
    async apagarClientes(request, response) {
        try {
            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Exclusão de cliente realizada com sucesso',
                    dados: null
                }
            );
        } catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao remover cliente: ${error.message}`,
                    dados: null
                }
            );
        }
    },
}