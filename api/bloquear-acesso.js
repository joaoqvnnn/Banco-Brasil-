// api/bloquear-acesso.js
module.exports = async (req, res) => {
  const { email, token } = req.query;

  if (!email || !token) {
    return res.status(400).send('<h1>Link inválido.</h1>');
  }

  try {
    /* 
      🔴 AQUI VOCÊ BLOQUEIA O USUÁRIO NO BANCO DE DADOS
      
      Exemplo:
      const tokenValido = await db.verificarToken(email, token);
      if (!tokenValido) return res.status(400).send('<h1>Token expirado.</h1>');
      
      await db.bloquearUsuario(email); // Bloqueia a conta
      await db.deletarToken(email, token);
    */

    // Retorna uma tela de sucesso simples para o usuário
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acesso Bloqueado</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; text-align: center; }
          .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 400px; }
          h2 { color: #0f172a; margin-bottom: 16px; }
          p { color: #475569; font-size: 15px; line-height: 1.6; }
          .icon { font-size: 48px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔒</div>
          <h2>Acesso Bloqueado</h2>
          <p>Sua conta foi bloqueada com sucesso por motivos de segurança. Nenhuma ação adicional é necessária.</p>
          <p>Se você acredita que isso foi um erro, entre em contato com nosso suporte.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Erro ao processar o bloqueio.</h1>');
  }
};
