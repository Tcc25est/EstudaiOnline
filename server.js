     const express = require('express');
     const cors = require('cors');
     const path = require('path');
     const bcrypt = require('bcryptjs');
     const { Pool } = require('pg');
     require('dotenv').config();

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

     // Porta do servidor (localmente 3000, online será do Render)
     const PORT = process.env.PORT || 3000;
     app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
     