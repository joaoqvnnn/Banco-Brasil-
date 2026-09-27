const nodemailer = require('nodemailer');

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
      from: `"Minha Lojinha" <${process.env.GMAIL_USER}>`,
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
   ÍCONES SVG (inline, sem dependência externa)
   ========================================================= */
const ICONE_ESCUDO = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <polyline points="9 12 11 14 15 10"/>
</svg>`;

const ICONE_CADEADO = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  <circle cx="12" cy="16" r="1.5" fill="#2563eb"/>
</svg>`;

const ICONE_EMAIL = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="4" width="20" height="16" rx="2"/>
  <polyline points="2,6 12,13 22,6"/>
</svg>`;

const ICONE_RELOGIO = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <polyline points="12 6 12 12 16 14"/>
</svg>`;

const ICONE_EMPRESA = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 21h18"/>
  <path d="M5 21V7l7-4 7 4v14"/>
  <path d="M9 9h.01"/>
  <path d="M9 13h.01"/>
  <path d="M9 17h.01"/>
  <path d="M15 9h.01"/>
  <path d="M15 13h.01"/>
  <path d="M15 17h.01"/>
</svg>`;

/* =========================================================
   CSS COMUM (inline)
   ========================================================= */
function estilosComuns() {
  return `
    body, table, td, p, div, span {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .container { max-width: 540px; margin: 0 auto; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eaecf0; }
    .header-bar {
      height: 4px;
      background: linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
    }
    .top-bar {
      padding: 24px 32px;
      border-bottom: 1px solid #f1f3f5;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-name { font-size: 15px; font-weight: 700; color: #111827; letter-spacing: -0.2px; }
    .brand-sub { font-size: 11px; color: #9ca3af; letter-spacing: 1.2px; text-transform: uppercase; font-weight: 600; margin-top: 2px; }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .badge-azul { background: #eff6ff; color: #1d4ed8; }
    .badge-cinza { background: #f3f4f6; color: #4b5563; }
    .icon-circle {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      line-height: 1.3;
      letter-spacing: -0.4px;
      margin: 0 0 12px;
      text-align: center;
    }
    .subtitle {
      font-size: 14.5px;
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 28px;
      text-align: center;
    }
    .code-box {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 24px 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .code-label {
      font-size: 10.5px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .code-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 12px;
      padding-left: 12px;
      line-height: 1;
    }
    .code-time {
      font-size: 12px;
      color: #64748b;
      margin-top: 12px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #4b5563;
      line-height: 1.6;
      padding: 10px 0;
    }
    .info-label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    .info-value {
      font-size: 13.5px;
      color: #111827;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background: #f1f3f5;
      margin: 24px 0;
    }
    .footer-text {
      font-size: 11.5px;
      color: #9ca3af;
      line-height: 1.7;
      text-align: center;
      margin: 0;
    }
  `;
}

/* =========================================================
   TEMPLATE 1 — CADASTRO
   ========================================================= */
function montarEmailCadastro(codigo) {
  const assunto = `Confirme seu cadastro — Código ${codigo}`;

  const texto = `
MINHA LOJINHA
Verificação de cadastro

Prezado(a) cliente,

Recebemos uma solicitação de cadastro para este endereço de e-mail.
Para confirmar e ativar sua conta, utilize o código abaixo:

CÓDIGO: ${codigo}

Este código é de uso único e expira em 5 minutos.
Se você não solicitou este cadastro, ignore este e-mail.

---
Minha Lojinha
CNPJ 00.000.000/0001-00
Atendimento: segunda a sábado, 08h às 20h
Suporte: ${process.env.GMAIL_USER}
© 2025 Minha Lojinha. Todos os direitos reservados.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirme seu cadastro</title>
<style>${estilosComuns()}</style>
</head>
<body style="margin:0;padding:0;background:#f5f6f8;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f6f8;padding:32px 16px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
  <tr><td>
    <div class="card">
      <div class="header-bar"></div>

      <!-- TOPO -->
      <div class="top-bar">
        <div>
          <div class="brand-name">Minha Lojinha</div>
          <div class="brand-sub">Central de segurança</div>
        </div>
        <span class="badge badge-azul">Novo cadastro</span>
      </div>

      <!-- CONTEÚDO -->
      <div style="padding:40px 32px 32px;">

        <!-- ÍCONE -->
        <div class="icon-circle">
          ${ICONE_ESCUDO}
        </div>

        <h1 class="title">Confirme seu cadastro</h1>
        <p class="subtitle">
          Recebemos uma solicitação de cadastro para este endereço de e-mail.<br>
          Para ativar sua conta, digite o código abaixo na tela de confirmação.
        </p>

        <!-- CÓDIGO -->
        <div class="code-box">
          <div class="code-label">Código de verificação</div>
          <div class="code-value">${codigo}</div>
          <div class="code-time">Válido por 5 minutos</div>
        </div>

        <div class="divider"></div>

        <!-- INFORMAÇÕES -->
        <div class="info-row">
          ${ICONE_EMAIL}
          <div>
            <div class="info-label">Enviado para</div>
            <div class="info-value">${process.env.GMAIL_USER}</div>
          </div>
        </div>

        <div class="info-row">
          ${ICONE_RELOGIO}
          <div>
            <div class="info-label">Expira em</div>
            <div class="info-value">5 minutos após o envio</div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- AVISO -->
        <p class="footer-text" style="text-align:left;">
          <strong style="color:#374151;">Não foi você?</strong> Se você não solicitou este cadastro, pode ignorar este e-mail com segurança. Nenhuma ação adicional é necessária.
        </p>
        <p class="footer-text" style="text-align:left;margin-top:14px;">
          <strong style="color:#374151;">Recomendação:</strong> nunca compartilhe este código com terceiros. Nossa equipe jamais solicita códigos por telefone, mensagem ou redes sociais.
        </p>
      </div>

      <!-- RODAPÉ INSTITUCIONAL -->
      <div style="background:#fafbfc;padding:24px 32px;border-top:1px solid #f1f3f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:12px;color:#6b7280;">
          <tr>
            <td style="padding:4px 0;vertical-align:middle;width:20px;">${ICONE_EMPRESA}</td>
            <td style="padding:4px 0;padding-left:8px;vertical-align:middle;">
              <span style="color:#9ca3af;">Empresa:</span> <strong style="color:#374151;">Minha Lojinha</strong> &nbsp;•&nbsp;
              <span style="color:#9ca3af;">CNPJ:</span> <strong style="color:#374151;">00.000.000/0001-00</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;vertical-align:middle;width:20px;"></td>
            <td style="padding:4px 0;padding-left:8px;vertical-align:middle;font-size:11.5px;color:#9ca3af;">
              Atendimento: segunda a sábado, das 08h às 20h
            </td>
          </tr>
        </table>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f1f3f5;text-align:center;font-size:11px;color:#9ca3af;line-height:1.7;">
          Este é um e-mail automático. Não responda diretamente.<br>
          © 2025 Minha Lojinha. Todos os direitos reservados.
        </div>
      </div>

    </div>

    <div style="text-align:center;margin-top:20px;font-size:11px;color:#9ca3af;line-height:1.6;">
      Você recebeu este e-mail porque uma conta foi solicitada com este endereço.
    </div>

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
   TEMPLATE 2 — RECUPERAÇÃO
   ========================================================= */
function montarEmailRecuperacao(codigo) {
  const assunto = `Recuperação de senha — Código ${codigo}`;

  const texto = `
MINHA LOJINHA
Recuperação de senha

Prezado(a) cliente,

Recebemos um pedido para redefinir a senha vinculada a este e-mail.
Para continuar, utilize o código abaixo:

CÓDIGO: ${codigo}

Este código é de uso único e expira em 5 minutos.

ATENÇÃO: se você não solicitou a recuperação, altere sua senha
imediatamente e entre em contato com nosso suporte.

---
Minha Lojinha
CNPJ 00.000.000/0001-00
Atendimento: segunda a sábado, 08h às 20h
Suporte: ${process.env.GMAIL_USER}
© 2025 Minha Lojinha. Todos os direitos reservados.
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recuperação de senha</title>
<style>${estilosComuns()}</style>
</head>
<body style="margin:0;padding:0;background:#f5f6f8;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f6f8;padding:32px 16px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="container">
  <tr><td>
    <div class="card">
      <div class="header-bar"></div>

      <!-- TOPO -->
      <div class="top-bar">
        <div>
          <div class="brand-name">Minha Lojinha</div>
          <div class="brand-sub">Central de segurança</div>
        </div>
        <span class="badge badge-cinza">Recuperação</span>
      </div>

      <!-- CONTEÚDO -->
      <div style="padding:40px 32px 32px;">

        <!-- ÍCONE -->
        <div class="icon-circle">
          ${ICONE_CADEADO}
        </div>

        <h1 class="title">Recupere sua senha</h1>
        <p class="subtitle">
          Recebemos um pedido para redefinir a senha vinculada a este endereço.<br>
          Para continuar, digite o código abaixo na tela de recuperação.
        </p>

        <!-- CÓDIGO -->
        <div class="code-box">
          <div class="code-label">Código de verificação</div>
          <div class="code-value">${codigo}</div>
          <div class="code-time">Válido por 5 minutos</div>
        </div>

        <div class="divider"></div>

        <!-- INFORMAÇÕES -->
        <div class="info-row">
          ${ICONE_EMAIL}
          <div>
            <div class="info-label">Enviado para</div>
            <div class="info-value">${process.env.GMAIL_USER}</div>
          </div>
        </div>

        <div class="info-row">
          ${ICONE_RELOGIO}
          <div>
            <div class="info-label">Expira em</div>
            <div class="info-value">5 minutos após o envio</div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- AVISO -->
        <p class="footer-text" style="text-align:left;">
          <strong style="color:#374151;">Não foi você?</strong> Se você não solicitou a recuperação de senha, ignore este e-mail. Sua senha atual permanece válida e ninguém poderá alterá-la sem este código.
        </p>
        <p class="footer-text" style="text-align:left;margin-top:14px;">
          <strong style="color:#374151;">Suspeita de acesso indevido?</strong> Entre em contato imediatamente com nosso suporte pelo e-mail <strong style="color:#111827;">${process.env.GMAIL_USER}</strong>.
        </p>
        <p class="footer-text" style="text-align:left;margin-top:14px;">
          <strong style="color:#374151;">Recomendação:</strong> nunca compartilhe este código com terceiros. Nossa equipe jamais solicita códigos por telefone, mensagem ou redes sociais.
        </p>
      </div>

      <!-- RODAPÉ INSTITUCIONAL -->
      <div style="background:#fafbfc;padding:24px 32px;border-top:1px solid #f1f3f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:12px;color:#6b7280;">
          <tr>
            <td style="padding:4px 0;vertical-align:middle;width:20px;">${ICONE_EMPRESA}</td>
            <td style="padding:4px 0;padding-left:8px;vertical-align:middle;">
              <span style="color:#9ca3af;">Empresa:</span> <strong style="color:#374151;">Minha Lojinha</strong> &nbsp;•&nbsp;
              <span style="color:#9ca3af;">CNPJ:</span> <strong style="color:#374151;">00.000.000/0001-00</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;vertical-align:middle;width:20px;"></td>
            <td style="padding:4px 0;padding-left:8px;vertical-align:middle;font-size:11.5px;color:#9ca3af;">
              Atendimento: segunda a sábado, das 08h às 20h
            </td>
          </tr>
        </table>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f1f3f5;text-align:center;font-size:11px;color:#9ca3af;line-height:1.7;">
          Este é um e-mail automático. Não responda diretamente.<br>
          © 2025 Minha Lojinha. Todos os direitos reservados.
        </div>
      </div>

    </div>

    <div style="text-align:center;margin-top:20px;font-size:11px;color:#9ca3af;line-height:1.6;">
      Você recebeu este e-mail porque uma recuperação de senha foi solicitada para este endereço.
    </div>

  </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>
  `.trim();

  return { assunto, texto, html };
}
