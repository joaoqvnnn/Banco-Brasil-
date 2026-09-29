const nodemailer = require('nodemailer');
const crypto = require('crypto');

/* =========================================================
   🔧 CONFIGURAÇÃO DA LOJA E LINKS
   ========================================================= */
const NOME_LOJA      = 'Minha Lojinha';
const CNPJ_LOJA      = '00.000.000/0001-00';
const HORARIO        = 'Segunda a sábado, 08h às 20h';
const EMAIL_SUPORTE  = 'suporte@minhalojinha.com.br';
const BASE_URL       = 'https://xixy.vercel.app';

/* =========================================================
   🖼️ URL DA LOGO (SUBSTITUA PELO LINK DIRETO DA SUA IMAGEM)
   ========================================================= */
const LOGO_URL = 'https://i.postimg.cc/SEU-LINK-AQUI/logo.png';

/* =========================================================
   ENDPOINT
   ========================================================= */
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

    // Gera código de 6 dígitos
    const codigo = crypto.randomInt(100000, 999999).toString();

    /* 
       🔴 AQUI VOCÊ SALVA O CÓDIGO NO SEU BANCO DE DADOS
       Exemplo:
       await db.salvarCodigo({ email, codigo, tipo, expiraEm: Date.now() + 5 * 60 * 1000 });
    */

    const mail = ehRecuperacao
      ? montarEmailRecuperacao(email, codigo)
      : montarEmailCadastro(email, codigo);

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
   FUNÇÃO AUXILIAR: CONSTRUIR O CORPO DO E-MAIL (PADRÃO FINTECH)
   ========================================================= */
function construirTemplateEmail({ titulo, subtitulo, textoPrincipal, codigo, rodapeTexto }) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titulo}</title>
<style>
  @media (prefers-color-scheme: dark) {
    .corpo-email { background-color: #000000 !important; }
    .cartao-email { background-color: #111111 !important; border-color: #262626 !important; }
    .texto-principal { color: #f5f5f5 !important; }
    .texto-secundario { color: #a3a3a3 !important; }
    .linha-divisoria { border-color: #262626 !important; }
    .rodape-texto { color: #6b7280 !important; }
    .codigo-box { background-color: #1a1a1a !important; border-color: #333333 !important; }
    .codigo-texto { color: #ffffff !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="corpo-email" style="background-color:#f4f4f5; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">

          <!-- LOGO DA LOJA -->
          <tr>
            <td style="padding-bottom:32px;">
              <img src="${LOGO_URL}" alt="${NOME_LOJA}" width="130" style="display:block; width:130px; max-width:130px; height:auto; border:0; outline:none; text-decoration:none;">
            </td>
          </tr>

          <!-- CARTÃO PRINCIPAL -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="cartao-email" style="background-color:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">

                <!-- CONTEÚDO -->
                <tr>
                  <td style="padding:48px 40px;">
                    <h1 class="texto-principal" style="margin:0 0 16px; font-size:24px; font-weight:700; color:#111827; line-height:1.3;">${titulo}</h1>
                    <p class="texto-secundario" style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4b5563;">${subtitulo}</p>
                    <p class="texto-secundario" style="margin:0 0 32px; font-size:15px; line-height:1.6; color:#4b5563;">${textoPrincipal}</p>

                    <!-- BLOCO DO CÓDIGO -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <div class="codigo-box" style="display:inline-block; padding:20px 40px; background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                            <span class="codigo-texto" style="font-size:36px; font-weight:800; letter-spacing:12px; color:#111827; font-family:monospace, 'Courier New', Courier;">${codigo}</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p class="texto-secundario" style="margin:32px 0 0; font-size:14px; line-height:1.6; color:#6b7280;">${rodapeTexto}</p>
                  </td>
                </tr>

                <!-- RODAPÉ DO CARTÃO -->
                <tr>
                  <td class="linha-divisoria" style="border-top:1px solid #e5e7eb; padding:32px 40px; background-color:#f9fafb;">
                    <p class="texto-principal" style="margin:0 0 8px; font-size:15px; font-weight:600; color:#111827;">Ficou com alguma dúvida?</p>
                    <p class="texto-secundario" style="margin:0 0 16px; font-size:14px; line-height:1.6; color:#4b5563;">Acesse nossa <a href="mailto:${EMAIL_SUPORTE}" style="color:#111827; text-decoration:underline;">central de ajuda</a> ou entre em contato conosco.</p>
                    <p class="texto-secundario" style="margin:0 0 16px; font-size:13px; line-height:1.6; color:#6b7280;">Esta é uma mensagem automática. Pedimos que não responda esse e-mail pois não é possível dar continuidade ao seu atendimento por aqui.</p>
                    <p class="texto-secundario" style="margin:0; font-size:13px; line-height:1.6; color:#6b7280;">Você está recebendo este e-mail porque se cadastrou na ${NOME_LOJA}.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- RODAPÉ FINAL (FORA DO CARTÃO) -->
          <tr>
            <td style="padding-top:32px;">
              <p class="rodape-texto" style="margin:0 0 4px; font-size:12px; color:#6b7280; line-height:1.5;">
                <strong style="color:#374151;">${NOME_LOJA}</strong><br>
                CNPJ ${CNPJ_LOJA}<br>
                Atendimento: ${HORARIO}
              </p>
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
   TEMPLATE 1 — CONFIRMAÇÃO DE CADASTRO (CÓDIGO)
   ========================================================= */
function montarEmailCadastro(email, codigo) {
  const assunto = `Confirme seu e-mail — ${NOME_LOJA}`;

  const texto = `
${NOME_LOJA}
CONFIRMAÇÃO DE E-MAIL

Olá,

Recebemos seu cadastro. Use o código abaixo para confirmar seu e-mail:

${codigo}

Este código expira em 5 minutos.

---
${NOME_LOJA} - CNPJ: ${CNPJ_LOJA}
  `.trim();

  const html = construirTemplateEmail({
    titulo: 'Confirme seu e-mail',
    subtitulo: `Olá,`,
    textoPrincipal: `Recebemos seu cadastro na ${NOME_LOJA}. Para ativar sua conta, utilize o código de verificação abaixo:`,
    codigo: codigo,
    rodapeTexto: 'Este código expira em 5 minutos. Se você não solicitou este cadastro, ignore este e-mail.'
  });

  return { assunto, texto, html };
}

/* =========================================================
   TEMPLATE 2 — RECUPERAÇÃO DE SENHA (CÓDIGO)
   ========================================================= */
function montarEmailRecuperacao(email, codigo) {
  const assunto = `Recuperação de senha — ${NOME_LOJA}`;

  const texto = `
${NOME_LOJA}
RECUPERAÇÃO DE SENHA

Olá,

Recebemos uma solicitação para redefinir sua senha. Use o código abaixo para continuar:

${codigo}

Este código expira em 5 minutos.

---
${NOME_LOJA} - CNPJ: ${CNPJ_LOJA} - Atendimento: ${HORARIO}
  `.trim();

  const html = construirTemplateEmail({
    titulo: 'Redefinição de senha',
    subtitulo: `Olá,`,
    textoPrincipal: `Recebemos uma solicitação para redefinir a senha da sua conta. Utilize o código de verificação abaixo para continuar:`,
    codigo: codigo,
    rodapeTexto: 'Este código expira em 5 minutos. Se você não solicitou esta alteração, ignore este e-mail.'
  });

  return { assunto, texto, html };
}
