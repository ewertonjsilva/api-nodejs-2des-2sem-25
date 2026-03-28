require('dotenv').config({ path: '../../.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function migrate() {
    // 1. Configura a conexão (use suas credenciais aqui)
    const connection = await mysql.createConnection({
        host: process.env.BD_SERVIDOR,
        user: process.env.BD_USUARIO,
        password: process.env.BD_SENHA,
        database: process.env.BD_BANCO
    });

    try {
        console.log('Iniciando migração de senhas...');

        // 2. Busca todos os usuários
        const [users] = await connection.execute('SELECT usu_id, usu_senha FROM usuarios');

        for (const user of users) {
            // Verifica se a senha já está criptografada (bcrypt começa com $2)
            if (!user.usu_senha.startsWith('$2')) {
                console.log(`Criptografando senha do usuário ID: ${user.usu_id}`);

                // 3. Gera o hash
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(user.usu_senha, saltRounds);

                // 4. Atualiza o registro no banco
                await connection.execute(
                    'UPDATE usuarios SET usu_senha = ? WHERE usu_id = ?',
                    [hashedPassword, user.usu_id]
                );
            }
        }

        console.log('Migração concluída com sucesso!');
    } catch (error) {
        console.error('Erro durante a migração:', error);
    } finally {
        // 5. Fecha a conexão obrigatoriamente
        await connection.end();
    }
}

migrate();

