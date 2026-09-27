const nodemailer = require('nodemailer');

/* =========================================================
   🔧 CONFIGURAÇÃO
   ========================================================= */
const URL_BANNER = 'https://i.postimg.cc/LXDTM576/IMG-0989.jpg';
const NOME_LOJA  = 'Minha Lojinha';
const CNPJ_LOJA  = '00.000.000/0001-00';
const HORARIO    = 'Segunda a sábado, 08h às 20h';

/* Ícones hospedados como imagens (funcionam em todos os clientes) */
const ICONE_TELEGRAM = 'https://img.icons8.com/ios/50/6b7280/telegram-app.png';
const ICONE_WHATSAPP = 'https://img.icons8.com/ios/50/6b7280/whatsapp.png';
const ICONE_EMAIL    = 'https://img.icons8.com/ios/50/6b7280/mail.png';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { email, codigo, tipo } = req.body || {};
  if (!email || !codigo) {
    return res.status(400).json({ error: 'E-mail e código são obrigatórios' });
  }

  const ehRecuperacao = tipo === 'recuperacao';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mail = ehRecuperacao
      ? montarEmailRecuperacao(codigo)
      : montarEmailCadastro(codigo);

    await transporter.sendMail({
      from: `"${NOME_LOJA}" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: process.env.GMAIL_USER,
      subject: mail.assunto,
      text: mail.texto,
      html: mail.html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
      },
    });

    return res.status(200).json({ success: true, message: 'E-mail enviado' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Falha ao enviar e-mail' });
  }
};

/* =========================================================
   CABEÇALHO COM BANNER
   ========================================================= */
function cabecalhoComBanner() {
  return `
    <tr>
      <td style="padding:0;line-height:0;font-size:0;">
        <img src="${URL_BANNER}"
             alt="${NOME_LOJA}"
             width="560"
             style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
      </td>
    </tr>
  `;
}

/* =========================================================
   RODAPÉ COM ÍCONES + REDES SOCIAIS
   ========================================================= */
function rodapeContatos() {
  return `
    <tr>
      <td style="padding:32px 40px 8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="border-top:1px solid #f3f4f6;padding-top:24px;text-align:center;">
              <div style="font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">Fale com a gente</div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr>
                        <td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;padding-right:8px;line-height:0;">
                                <img src="${ICONE_TELEGRAM}" width="18" height="18" alt="" style="display:block;border:0;">
                              </td>
                              <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">Telegram</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr>
                        <td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;padding-right:8px;line-height:0;">
                                <img src="${ICONE_WHATSAPP}" width="18" height="18" alt="" style="display:block;border:0;">
                              </td>
                              <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">WhatsApp</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr>
                        <td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;padding-right:8px;line-height:0;">
                                <img src="${ICONE_EMAIL}" width="18" height="18" alt="" style="display:block;border:0;">
                              </td>
                              <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">E-mail</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0;font-size:12.5px;color:#9ca3af;line-height:1.7;">
                Atendimento ${HORARIO.toLowerCase()}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/* =========================================================
   RODAPÉ INSTITUCIONAL
   ========================================================= */
function rodapeInstitucional() {
  return `
    <tr>
      <td style="background:#fafbfc;padding:24px 40px;text-align:center;">
        <div style="font-size:13px;font-weight:800;color:#111827;letter-spacing:-0.2px;margin-bottom:4px;">${NOME_LOJA}</div>
        <div style="font-size:11.5px;color:#9ca3af;line-height:1.7;">
          CNPJ ${CNPJ_LOJA}<br>
          Este é um e-mail automático — não responda diretamente.
        </div>
        <div style="font-size:11px;color:#d1d5db;margin-top:12px;">
          © 2025 ${NOME_LOJA}. Todos os direitos reservados.
        </div>
      </td>
    </tr>
  `;
}

/* =========================================================
   TEMPLATE 1 — CONFIRMAÇÃO DE CADASTRO
   ========================================================= */
function montarEmailCadastro(codigo) {
  const assunto = `Seu código de confirmação é ${codigo}`;

  const texto = `
${NOME_LOJA.toUpperCase()}
Central de Segurança

CONFIRMAÇÃO DE CADASTRO

Prezado(a) cliente,

Recebemos uma solicitação de cadastro vinculada a este endereço de e-mail.
Para concluir a verificação e ativar sua conta, utilize o código abaixo:

CÓDIGO: ${codigo}

Este código é de uso único e expira em 5 minutos.

Se você não realizou esta solicitação, por favor desconsidere este e-mail.

---
INFORMAÇÕES INSTITUCIONAIS
${NOME_LOJA}
CNPJ: ${CNPJ_LOJA}
Atendimento: ${HORARIO}

CONECTE-SE
Telegram, WhatsApp, E-mail — disponíveis em nosso site.

Este é um e-mail automático. Não responda diretamente.

© 2025 ${NOME_LOJA}. Todos os direitos reservados.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirme seu cadastro</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f6;padding:40px 16px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
  <tr><td>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);">

      ${cabecalhoComBanner()}

      <tr>
        <td style="padding:44px 40px 8px;">

          <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#111827;text-align:center;line-height:1.25;letter-spacing:-0.6px;">
            Confirme seu cadastro
          </h1>

          <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:#6b7280;text-align:center;">
            Falta pouco para você começar.<br>
            Digite o código abaixo na tela de confirmação para ativar sua conta.
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#faf5ff;border:2px solid #820ad1;border-radius:16px;">
            <tr>
              <td style="padding:28px 20px;text-align:center;">
                <div style="font-size:10px;font-weight:800;color:#820ad1;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;">Código de verificação</div>
                <div style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:800;color:#111827;letter-spacing:14px;line-height:1;padding-left:14px;">${codigo}</div>
                <div style="font-size:12px;color:#9333ea;font-weight:600;margin-top:16px;">Válido por 5 minutos</div>
              </td>
            </tr>
          </table>

          <p style="margin:32px 0 0;font-size:13.5px;line-height:1.7;color:#6b7280;text-align:center;">
            <strong style="color:#111827;">Não foi você?</strong> Ignore este e-mail.<br>
            Nenhuma ação é necessária — sua conta está protegida.
          </p>
        </td>
      </tr>

      ${rodapeContatos()}
      ${rodapeInstitucional()}

    </table>

  </td></tr>
  </table>

  <div style="max-width:560px;margin:20px auto 0;text-align:center;font-size:11.5px;color:#9ca3af;line-height:1.7;">
    Você recebeu este e-mail porque uma conta foi solicitada com este endereço.
  </div>

</td></tr>
</table>
</body>
</html>
  `.trim();

  return { assunto, texto, html };
}

/* =========================================================
   TEMPLATE 2 — RECUPERAÇÃO DE SENHA
   ========================================================= */
function montarEmailRecuperacao(codigo) {
  const assunto = `Recuperação de senha — Código ${codigo}`;

  const texto = `
${NOME_LOJA.toUpperCase()}
Central de Segurança

RECUPERAÇÃO DE SENHA

Prezado(a) cliente,

Recebemos uma solicitação de recuperação de senha vinculada a este e-mail.
Para continuar, utilize o código abaixo:

CÓDIGO: ${codigo}

Este código é de uso único e expira em 5 minutos.

ATENÇÃO: se você não solicitou a recuperação, altere sua senha
imediatamente e entre em contato com nosso suporte.

---
INFORMAÇÕES INSTITUCIONAIS
${NOME_LOJA}
CNPJ: ${CNPJ_LOJA}
Atendimento: ${HORARIO}

CONECTE-SE
Telegram, WhatsApp, E-mail — disponíveis em nosso site.

Este é um e-mail automático. Não responda diretamente.

© 2025 ${NOME_LOJA}. Todos os direitos reservados.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recuperação de senha</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f6;padding:40px 16px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
  <tr><td>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 32px rgba(0,0,0,0.06);">

      ${cabecalhoComBanner()}

      <tr>
        <td style="padding:44px 40px 8px;">

          <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#111827;text-align:center;line-height:1.25;letter-spacing:-0.6px;">
            Recupere sua senha
          </h1>

          <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:#6b7280;text-align:center;">
            Recebemos um pedido para redefinir a senha da sua conta.<br>
            Digite o código abaixo na tela de recuperação.
          </p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#faf5ff;border:2px solid #820ad1;border-radius:16px;">
            <tr>
              <td style="padding:28px 20px;text-align:center;">
                <div style="font-size:10px;font-weight:800;color:#820ad1;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;">Código de verificação</div>
                <div style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:800;color:#111827;letter-spacing:14px;line-height:1;padding-left:14px;">${codigo}</div>
                <div style="font-size:12px;color:#9333ea;font-weight:600;margin-top:16px;">Válido por 5 minutos</div>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;background:#faf5ff;border-left:3px solid #820ad1;border-radius:0 8px 8px 0;">
            <tr>
              <td style="padding:16px 18px;">
                <div style="font-size:11px;font-weight:800;color:#820ad1;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Aviso de segurança</div>
                <p style="margin:0;font-size:13px;line-height:1.7;color:#4b5563;">
                  Se você <strong style="color:#111827;">não solicitou</strong> esta recuperação, ignore este e-mail. Sua senha permanece válida e protegida.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b7280;text-align:center;">
            <strong style="color:#111827;">Suspeita de acesso indevido?</strong><br>
            Entre em contato imediatamente com nosso suporte.
          </p>
        </td>
      </tr>

      ${rodapeContatos()}
      ${rodapeInstitucional()}

    </table>

  </td></tr>
  </table>

  <div style="max-width:560px;margin:20px auto 0;text-align:center;font-size:11.5px;color:#9ca3af;line-height:1.7;">
    Você recebeu este e-mail porque uma recuperação de senha foi solicitada para este endereço.
  </div>

</td></tr>
</table>
</body>
</html>
  `.trim();

  return { assunto, texto, html };
}
