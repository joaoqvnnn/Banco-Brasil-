const nodemailer = require('nodemailer');

/* =========================================================
   🔧 CONFIGURAÇÃO DA LOJA
   ========================================================= */
const URL_BANNER = 'https://i.postimg.cc/LXDTM576/IMG-0989.jpg';
const NOME_LOJA  = 'Minha Lojinha';
const CNPJ_LOJA  = '00.000.000/0001-00';
const HORARIO    = 'Segunda a sábado, 08h às 20h';
const EMAIL_SUPORTE = 'suporte@minhalojinha.com.br';

/* =========================================================
   API HANDLER
   ========================================================= */
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { email, codigo, tipo } = req.body || {};

  // Validação básica
  if (!email || !codigo) {
    return res.status(400).json({ error: 'E-mail e código são obrigatórios' });
  }

  // Validação do formato do e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de e-mail inválido' });
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
      replyTo: EMAIL_SUPORTE,
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

    return res.status(200).json({ success: true, message: 'E-mail enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ error: 'Falha ao enviar e-mail. Tente novamente mais tarde.' });
  }
};

/* =========================================================
   TEMPLATE 1 — CONFIRMAÇÃO DE CADASTRO
   ========================================================= */
function montarEmailCadastro(codigo) {
  const assunto = `Seu código de verificação é ${codigo}`;

  const texto = `
${NOME_LOJA.toUpperCase()}
Central de Segurança

CONFIRMAÇÃO DE CADASTRO

Olá, seja bem-vindo(a) à ${NOME_LOJA}!

Seu primeiro acesso foi realizado com sucesso. Para concluir a configuração da sua conta, crie sua senha de acesso.

Use o código abaixo para continuar:
CÓDIGO: ${codigo}

Este código é de uso único e expira em 5 minutos.

Se você não reconhece esta solicitação, nenhuma ação adicional é necessária.

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

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

      <!-- CABEÇALHO -->
      <tr>
        <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #f3f4f6;">
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#111827;letter-spacing:-1px;">${NOME_LOJA}</h1>
        </td>
      </tr>

      <!-- CONTEÚDO -->
      <tr>
        <td style="padding:40px 40px 16px;">

          <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;text-align:center;line-height:1.3;">
            Crie sua senha e conclua a configuração da sua conta
          </h2>

          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;text-align:center;">
            Olá, seja bem-vindo(a) à ${NOME_LOJA}!<br><br>
            Seu primeiro acesso foi realizado com sucesso usando o código de verificação. Para concluir a configuração da sua conta, crie sua senha de acesso.
          </p>

          <!-- DESTAQUE DO CÓDIGO -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;text-align:center;">
                <div style="font-size:11px;font-weight:700;color:#16a34a;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Código de Verificação</div>
                <div style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:800;color:#111827;letter-spacing:12px;line-height:1;padding-left:12px;">${codigo}</div>
                <div style="font-size:12px;color:#16a34a;font-weight:600;margin-top:12px;">Válido por 12 horas</div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-size:13.5px;line-height:1.6;color:#6b7280;text-align:center;">
            Se você não reconhece esta solicitação, nenhuma ação adicional é necessária.<br>
            Sua conta está protegida.
          </p>
        </td>
      </tr>

      <!-- BOTÃO "NÃO FUI EU" -->
      <tr>
        <td style="padding:0 40px 40px;text-align:center;">
          <a href="#" style="display:inline-block;padding:14px 32px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;width:100%;box-sizing:border-box;max-width:280px;">Não fui eu</a>
        </td>
      </tr>

      <!-- RODAPÉ COM CONTATOS -->
      <tr>
        <td style="background:#fafbfc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Fale com a gente</p>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px;">
            <tr>
              <td style="padding:0 6px;">
                <a href="#" style="display:inline-block;padding:10px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">Telegram</a>
              </td>
              <td style="padding:0 6px;">
                <a href="#" style="display:inline-block;padding:10px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">WhatsApp</a>
              </td>
              <td style="padding:0 6px;">
                <a href="mailto:${EMAIL_SUPORTE}" style="display:inline-block;padding:10px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">E-mail</a>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:12.5px;color:#9ca3af;line-height:1.6;">
            Atendimento ${HORARIO.toLowerCase()}.
          </p>
        </td>
      </tr>

      <!-- RODAPÉ INSTITUCIONAL -->
      <tr>
        <td style="padding:24px 40px;text-align:center;background:#ffffff;">
          <div style="font-size:13px;font-weight:800;color:#111827;letter-spacing:-0.2px;margin-bottom:4px;">${NOME_LOJA}</div>
          <div style="font-size:11.5px;color:#9ca3af;line-height:1.6;">
            CNPJ ${CNPJ_LOJA}<br>
            Este é um e-mail automático — não responda diretamente.<br>
            © 2025 ${NOME_LOJA}. Todos os direitos reservados.
          </div>
        </td>
      </tr>

    </table>

  </td></tr>
  </table>

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

Olá,

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

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

      <!-- CABEÇALHO -->
      <tr>
        <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #f3f4f6;">
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#111827;letter-spacing:-1px;">${NOME_LOJA}</h1>
        </td>
      </tr>

      <!-- CONTEÚDO -->
      <tr>
        <td style="padding:40px 40px 16px;">

          <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;text-align:center;line-height:1.3;">
            Recupere sua senha
          </h2>

          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;text-align:center;">
            Recebemos um pedido para redefinir a senha da sua conta.<br>
            Digite o código abaixo na tela de recuperação.
          </p>

          <!-- DESTAQUE DO CÓDIGO -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;text-align:center;">
                <div style="font-size:11px;font-weight:700;color:#16a34a;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Código de Verificação</div>
                <div style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:800;color:#111827;letter-spacing:12px;line-height:1;padding-left:12px;">${codigo}</div>
                <div style="font-size:12px;color:#16a34a;font-weight:600;margin-top:12px;">Válido por 5 minutos</div>
              </td>
            </tr>
          </table>

          <!-- AVISO DE SEGURANÇA -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <tr>
              <td style="padding:16px 18px;">
                <div style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Aviso de segurança</div>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#78350f;">
                  Se você <strong>não solicitou</strong> esta recuperação, ignore este e-mail. Sua senha permanece válida e protegida.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-size:13.5px;line-height:1.6;color:#6b7280;text-align:center;">
            <strong>Suspeita de acesso indevido?</strong><br>
            Entre em contato imediatamente com nosso suporte.
          </p>
        </td>
      </tr>

      <!-- BOTÃO "NÃO FUI EU" -->
      <tr>
        <td style="padding:0 40px 40px;text-align:center;">
          <a href="#" style="display:inline-block;padding:14px 32px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;width:100%;box-sizing:border-box;max-width:280px;">Não fui eu</a>
        </td>
      </tr>

      <!-- RODAPÉ COM CONTATOS -->
      <tr>
        <td style="background:#fafbfc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Fale com a gente</p>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px;">
            <tr>
              <td style="padding:0 6px;">
                <a href="#" style="display:inline-block;padding:10px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">Telegram</a>
              </td>
              <td style="padding:0 6px;">
                <a href="#" style="display:inline-block;padding:10px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">WhatsApp</a>
              </td>
              <td style="padding:0 6px;">
                <a href="mailto:${EMAIL_SUPORTE}" style="display:inline-block;padding:10px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">E-mail</a>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:12.5px;color:#9ca3af;line-height:1.6;">
            Atendimento ${HORARIO.toLowerCase()}.
          </p>
        </td>
      </tr>

      <!-- RODAPÉ INSTITUCIONAL -->
      <tr>
        <td style="padding:24px 40px;text-align:center;background:#ffffff;">
          <div style="font-size:13px;font-weight:800;color:#111827;letter-spacing:-0.2px;margin-bottom:4px;">${NOME_LOJA}</div>
          <div style="font-size:11.5px;color:#9ca3af;line-height:1.6;">
            CNPJ ${CNPJ_LOJA}<br>
            Este é um e-mail automático — não responda diretamente.<br>
            © 2025 ${NOME_LOJA}. Todos os direitos reservados.
          </div>
        </td>
      </tr>

    </table>

  </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>
  `.trim();

  return { assunto, texto, html };
}
