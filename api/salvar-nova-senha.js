// api/salvar-nova-senha.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { email, token, novaSenha } = req.body || {};

  if (!email || !token || !novaSenha) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  try {
    /* 
      🔴 AQUI VOCÊ VALIDA O TOKEN E ATUALIZA A SENHA NO BANCO
      
      Exemplo:
      const tokenValido = await db.verificarToken(email, token);
      if (!tokenValido) return res.status(400).json({ error: 'Token inválido ou expirado.' });
      
      await db.atualizarSenha(email, novaSenha);
      await db.deletarToken(email, token); // Invalida o token após o uso
    */

    // Simulação de sucesso
    return res.status(200).json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao salvar a senha.' });
  }
};
