const nodemailer = require('nodemailer');
const crypto = require('crypto');

/* =========================================================
   🔧 CONFIGURAÇÃO DA LOJA E LINKS
   ========================================================= */
const NOME_LOJA  = 'Minha Lojinha';
const CNPJ_LOJA  = '00.000.000/0001-00';
const HORARIO    = 'Segunda a sábado, 08h às 20h';
const EMAIL_SUPORTE = 'suporte@minhalojinha.com.br';

// ⚠️ SEU DOMÍNIO VERCEL
const BASE_URL = 'https://xixy.vercel.app'; 

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { email, tipo } = req.body || {};

  if (!email) return res.status(400).json({ error: 'O e-mail é obrigatório' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Formato de e-mail inválido' });

  const ehRecuperacao = tipo === 'recuperacao';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Gera token único
    const token = crypto.randomBytes(32).toString('hex');

    /* 
       🔴 AQUI VOCÊ SALVA O TOKEN NO SEU BANCO DE DADOS
       Exemplo:
       await db.salvarToken({ email, token, tipo, expiraEm: Date.now() + 30 * 60 * 1000 });
       (Token expira em 30 minutos)
    */

    const mail = ehRecuperacao
      ? montarEmailRecuperacao(email, token)
      : montarEmailBloqueio(email, token);

    await transporter.sendMail({
      from: `"${NOME_LOJA}" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: EMAIL_SUPORTE,
      subject: mail.assunto,
      text: mail.texto,
      html: mail.html,
    });

    return res.status(200).json({ success: true, message: 'E-mail enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ error: 'Falha ao enviar e-mail. Tente novamente mais tarde.' });
  }
};

/* =========================================================
   FUNÇÃO AUXILIAR: CONSTRUIR O CORPO DO E-MAIL
   ========================================================= */
function construirTemplateEmail({ titulo, subtitulo, textoPrincipal, botaoTexto, botaoLink, rodapeTexto }) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titulo}</title>
<style>
  @media (prefers-color-scheme: dark) {
    .corpo-email { background-color: #0f172a !important; }
    .cartao-email { background-color: #1e293b !important; border-color: #334155 !important; }
    .texto-principal { color: #e2e8f0 !important; }
    .texto-secundario { color: #94a3b8 !important; }
    .linha-divisoria { border-color: #334155 !important; }
    .botao-cta { background-color: #f8fafc !important; color: #0f172a !important; }
    .rodape-texto { color: #64748b !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="corpo-email" style="background-color:#f1f5f9; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <h1 style="margin:0; font-size:22px; font-weight:800; color:#1e293b; letter-spacing:-0.5px;">${NOME_LOJA}</h1>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="cartao-email" style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
                <tr>
                  <td style="padding:40px 36px;">
                    <h2 class="texto-principal" style="margin:0 0 16px; font-size:20px; font-weight:700; color:#0f172a; text-align:center; line-height:1.3;">${titulo}</h2>
                    <p class="texto-secundario" style="margin:0 0 32px; font-size:15px; line-height:1.6; color:#475569; text-align:center;">${subtitulo}</p>
                    <p class="texto-secundario" style="margin:0 0 32px; font-size:15px; line-height:1.6; color:#475569; text-align:center;">${textoPrincipal}</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${botaoLink}" class="botao-cta" style="display:inline-block; padding:16px 32px; background-color:#0f172a; color:#ffffff; text-decoration:none; border-radius:8px; font-size:15px; font-weight:600; width:100%; max-width:280px; box-sizing:border-box; text-align:center;">${botaoTexto}</a>
                        </td>
                      </tr>
                    </table>
                    <p class="texto-secundario" style="margin:32px 0 0; font-size:13px; line-height:1.6; color:#64748b; text-align:center;">${rodapeTexto}</p>
                  </td>
                </tr>
                <tr>
                  <td class="linha-divisoria" style="border-top:1px solid #e2e8f0; padding:24px 36px; background-color:#f8fafc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr><td align="center" style="padding-bottom:16px;"><span class="texto-secundario" style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:1.5px; text-transform:uppercase;">Fale com a gente</span></td></tr>
                      <tr>
                        <td align="center">
                          <a href="mailto:${EMAIL_SUPORTE}" style="color:#475569; text-decoration:none; font-size:13px; font-weight:600; margin:0 8px;">E-mail</a>
                          <span style="color:#cbd5e1;">|</span>
                          <a href="#" style="color:#475569; text-decoration:none; font-size:13px; font-weight:600; margin:0 8px;">WhatsApp</a>
                        </td>
                      </tr>
                      <tr><td align="center" style="padding-top:12px;"><span class="texto-secundario" style="font-size:12px; color:#94a3b8;">Atendimento ${HORARIO.toLowerCase()}.</span></td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td align="center" class="rodape-texto" style="font-size:12px; color:#94a3b8; line-height:1.6;">
                    <strong style="color:#64748b;">${NOME_LOJA}</strong> — CNPJ ${CNPJ_LOJA}<br>
                    Este é um e-mail automático. Por favor, não responda.<br>
                    © 2025 ${NOME_LOJA}.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/* =========================================================
   TEMPLATE 1 — REDEFINIÇÃO DE SENHA (LINK)
   ========================================================= */
function montarEmailRecuperacao(email, token) {
  const assunto = `Redefinição de senha para sua conta`;
  
  // Link que abre a página de redefinição no Vercel
  const linkRedefinicao = `${BASE_URL}/redefinir-senha.html?token=${token}&email=${encodeURIComponent(email)}`;

  const texto = `
${NOME_LOJA.toUpperCase()}
REDEFINIÇÃO DE SENHA

Olá,

Recebemos uma solicitação para redefinir a senha da sua conta.
Para criar uma nova senha, acesse o link abaixo:

${linkRedefinicao}

Se você não solicitou isso, ignore este e-mail.

---
${NOME_LOJA} - CNPJ: ${CNPJ_LOJA} - Atendimento: ${HORARIO}
  `.trim();

  const html = construirTemplateEmail({
    titulo: 'Criar nova senha',
    subtitulo: `Olá, recebemos uma solicitação para redefinir a senha da sua conta.`,
    textoPrincipal: 'Clique no botão abaixo para criar uma nova senha de acesso. Por motivos de segurança, este link expira em 30 minutos.',
    botaoTexto: 'Criar nova senha',
    botaoLink: linkRedefinicao,
    rodapeTexto: 'Se você não solicitou esta alteração, nenhuma ação é necessária. Sua senha atual continua válida.'
  });

  return { assunto, texto, html };
}

/* =========================================================
   TEMPLATE 2 — BLOQUEIO DE ACESSO ("NÃO FUI EU")
   ========================================================= */
function montarEmailBloqueio(email, token) {
  const assunto = `Segurança da conta: Verificação de acesso`;
  
  // Link que aciona o bloqueio
  const linkBloqueio = `${BASE_URL}/api/bloquear-acesso.html?token=${token}&email=${encodeURIComponent(email)}`;

  const texto = `
${NOME_LOJA.toUpperCase()}
VERIFICAÇÃO DE ACESSO

Olá,

Notamos uma tentativa de acesso à sua conta.

Se você NÃO reconhece esta atividade e deseja bloquear o acesso imediatamente, acesse:

${linkBloqueio}

---
${NOME_LOJA} - CNPJ: ${CNPJ_LOJA}
  `.trim();

  const html = construirTemplateEmail({
    titulo: 'Verificação de acesso',
    subtitulo: `Notamos uma tentativa de acesso à sua conta vinculada a este e-mail.`,
    textoPrincipal: 'Se foi você, não se preocupe. Nenhuma ação é necessária.<br><br>Se você <strong>não reconhece</strong> esta atividade e deseja bloquear o acesso imediatamente, clique no botão abaixo.',
    botaoTexto: 'Bloquear acesso',
    botaoLink: linkBloqueio,
    rodapeTexto: 'Se você não solicitou isso, sua conta está segura, mas recomendamos alterar sua senha.'
  });

  return { assunto, texto, html };
}
