     const express = require('express');
     const cors = require('cors');
     const path = require('path');
     const bcrypt = require('bcryptjs');
     const { Pool } = require('pg');
     require('dotenv').config();

     // Middleware simples para verificar login (usando localStorage do frontend)
function verificarLogin(req, res, next) {
  // Em produção, use JWT. Aqui, assumimos que o frontend verifica.
  next(); // Por enquanto, permite passar – o frontend controla
}

     const app = express();
     app.use(cors());
     app.use(express.json());
     app.use(express.static('public')); // Serve seus arquivos HTML/CSS/JS

     // Conecta ao banco Supabase
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
     });

     // Rota para cadastro
     app.post('/cadastro', async (req, res) => {
       const { nome, email, senha } = req.body;
       try {
         const hashedSenha = await bcrypt.hash(senha, 10); // Criptografa a senha
         await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)', [nome, email, hashedSenha]);
         res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Erro ao cadastrar. Email já existe?' });
       }
     });


     // Rota para login
     app.post('/login', async (req, res) => {
       const { email, senha } = req.body;
       try {
         const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
         if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });
         
         const usuario = result.rows[0];
         const senhaValida = await bcrypt.compare(senha, usuario.senha);
         if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta' });
         
         res.json({ message: 'Login bem-sucedido!', usuario: { id: usuario.id, nome: usuario.nome } });
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Erro no login' });
       }
     });

     // Rota para servir a página inicial
     app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, 'public', 'index.html'));
     });

     // Rotas protegidas (usam verificarLogin)
app.get('/perfil', verificarLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'perfil.html'));
});
app.get('/seguranca', verificarLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'seguranca.html'));
});

   // Rota para alterar senha (adicionado verificarLogin para segurança)
app.post('/alterar-senha', verificarLogin, async (req, res) => {
  const { currentPassword, newPassword, email } = req.body;
  try {
    const result = await pool.query('SELECT senha FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const senhaValida = await bcrypt.compare(currentPassword, result.rows[0].senha);
    if (!senhaValida) return res.status(401).json({ error: 'Senha atual incorreta' });
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE usuarios SET senha = $1 WHERE email = $2', [hashedNewPassword, email]);
    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

  // Rota para atualizar perfil (atualizada para incluir dob e gender)
app.post('/atualizar-perfil', async (req, res) => {
    const { nome, dob, gender, email } = req.body;
    
    // Validação básica
    if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }
    
    try {
        // Verificar se o usuário existe
        const userCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        // Atualizar os campos (usando COALESCE para não sobrescrever com NULL se não fornecido)
        await pool.query(
            'UPDATE usuarios SET nome = $1, dob = COALESCE($2, dob), gender = COALESCE($3, gender) WHERE email = $4',
            [nome, dob || null, gender || null, email]
        );
        res.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});

// Adicione mais: /banco-questoes, /videoaulas, /apostila
     // Porta do servidor (localmente 3000, online será do Render)
     const PORT = process.env.PORT || 3000;
     app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));