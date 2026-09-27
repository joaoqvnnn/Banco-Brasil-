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
   ÍCONES SVG INLINE (aparecem nos e-mails)
   ========================================================= */
const ICONE_ESCUDO_GRANDE = `
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#820ad1" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <polyline points="9 12 11 14 15 10"/>
</svg>`;

const ICONE_CADEADO_GRANDE = `
<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#820ad1" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  <circle cx="12" cy="16.5" r="1.2" fill="#820ad1"/>
</svg>`;

const ICONE_TELEGRAM = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <line x1="22" y1="2" x2="11" y2="13"/>
  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
</svg>`;

const ICONE_WHATSAPP = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
</svg>`;

const ICONE_EMAIL_PEQ = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="4" width="20" height="16" rx="2"/>
  <polyline points="2,6 12,13 22,6"/>
</svg>`;

const ICONE_LOGO_M = `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 20V8l9-6 9 6v12"/>
  <path d="M3 20h18"/>
  <path d="M9 20v-6h6v6"/>
</svg>`;

/* =========================================================
   TEMPLATE BASE — estilo Nubank premium
   ========================================================= */
function estilosComuns() {
  return `
    body, table, td, p, div, span, a {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    a { color: inherit; text-decoration: none; }
    .card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06);
    }
  `;
}

/* =========================================================
   TEMPLATE 1 — CONFIRMAÇÃO DE CADASTRO
   ========================================================= */
function montarEmailCadastro(codigo) {
  const assunto = `Seu código de confirmação é ${codigo}`;

  const texto = `
MINHA LOJINHA
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
Minha Lojinha
CNPJ: 00.000.000/0001-00
Atendimento: Segunda a sábado, 08h às 20h

CONECTE-SE
Telegram, WhatsApp, E-mail — disponíveis em nosso site.

Este é um e-mail automático. Não responda diretamente.

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
<body style="margin:0;padding:0;background:#f4f4f6;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f6;padding:40px 16px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
  <tr><td>

    <!-- CARD -->
    <div class="card">

      <!-- TOPO ROXO (identidade Nubank-like) -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#820ad1;">
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="vertical-align:middle;width:44px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:rgba(255,255,255,0.15);border-radius:10px;">
                    <tr><td style="width:44px;height:44px;text-align:center;vertical-align:middle;">
                      ${ICONE_LOGO_M}
                    </td></tr>
                  </table>
                </td>
                <td style="vertical-align:middle;padding-left:14px;">
                  <div style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">Minha Lojinha</div>
                  <div style="font-size:11px;color:#e9d5ff;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-top:3px;">Central de Segurança</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CORPO -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding:44px 40px 8px;">

            <!-- ÍCONE CENTRAL -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td style="width:84px;height:84px;background:#f6f0fc;border-radius:50%;text-align:center;vertical-align:middle;">
                  ${ICONE_ESCUDO_GRANDE}
                </td>
              </tr>
            </table>

            <!-- TÍTULO -->
            <h1 style="margin:28px 0 12px;font-size:28px;font-weight:800;color:#111827;text-align:center;line-height:1.25;letter-spacing:-0.6px;">
              Confirme seu cadastro
            </h1>

            <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:#6b7280;text-align:center;">
              Falta pouco para você começar.<br>
              Digite o código abaixo na tela de confirmação para ativar sua conta.
            </p>

            <!-- CÓDIGO (caixa destaque) -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#faf5ff;border:2px solid #820ad1;border-radius:16px;">
              <tr>
                <td style="padding:28px 20px;text-align:center;">
                  <div style="font-size:10px;font-weight:800;color:#820ad1;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;">Código de verificação</div>
                  <div style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:800;color:#111827;letter-spacing:14px;line-height:1;padding-left:14px;">${codigo}</div>
                  <div style="font-size:12px;color:#9333ea;font-weight:600;margin-top:16px;">Válido por 5 minutos</div>
                </td>
              </tr>
            </table>

            <!-- INFO -->
            <p style="margin:32px 0 0;font-size:13.5px;line-height:1.7;color:#6b7280;text-align:center;">
              <strong style="color:#111827;">Não foi você?</strong> Ignore este e-mail.<br>
              Nenhuma ação é necessária — sua conta está protegida.
            </p>
          </td>
        </tr>
      </table>

      <!-- RODAPÉ: REDES SOCIAIS -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding:36px 40px 8px;">
            <div style="border-top:1px solid #f3f4f6;padding-top:24px;text-align:center;">
              <div style="font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:18px;">Fale com a gente</div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr><td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:8px;">${ICONE_TELEGRAM}</td>
                            <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">Telegram</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr><td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:8px;">${ICONE_WHATSAPP}</td>
                            <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">WhatsApp</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr><td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:8px;">${ICONE_EMAIL_PEQ}</td>
                            <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">E-mail</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0;font-size:12.5px;color:#9ca3af;line-height:1.7;">
                Atendimento de segunda a sábado, das 08h às 20h.
              </p>
            </div>
          </td>
        </tr>
      </table>

      <!-- RODAPÉ INSTITUCIONAL -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafbfc;">
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <div style="font-size:13px;font-weight:800;color:#111827;letter-spacing:-0.2px;margin-bottom:4px;">Minha Lojinha</div>
            <div style="font-size:11.5px;color:#9ca3af;line-height:1.7;">
              CNPJ 00.000.000/0001-00<br>
              Este é um e-mail automático — não responda diretamente.
            </div>
            <div style="font-size:11px;color:#d1d5db;margin-top:12px;">
              © 2025 Minha Lojinha. Todos os direitos reservados.
            </div>
          </td>
        </tr>
      </table>

    </div>

  </td></tr>
  </table>

  <!-- RODAPÉ EXTERNO -->
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
MINHA LOJINHA
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
Minha Lojinha
CNPJ: 00.000.000/0001-00
Atendimento: Segunda a sábado, 08h às 20h

CONECTE-SE
Telegram, WhatsApp, E-mail — disponíveis em nosso site.

Este é um e-mail automático. Não responda diretamente.

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
<body style="margin:0;padding:0;background:#f4f4f6;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f6;padding:40px 16px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
  <tr><td>

    <!-- CARD -->
    <div class="card">

      <!-- TOPO ROXO -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#820ad1;">
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="vertical-align:middle;width:44px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:rgba(255,255,255,0.15);border-radius:10px;">
                    <tr><td style="width:44px;height:44px;text-align:center;vertical-align:middle;">
                      ${ICONE_LOGO_M}
                    </td></tr>
                  </table>
                </td>
                <td style="vertical-align:middle;padding-left:14px;">
                  <div style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">Minha Lojinha</div>
                  <div style="font-size:11px;color:#e9d5ff;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-top:3px;">Central de Segurança</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CORPO -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding:44px 40px 8px;">

            <!-- ÍCONE CENTRAL -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td style="width:84px;height:84px;background:#f6f0fc;border-radius:50%;text-align:center;vertical-align:middle;">
                  ${ICONE_CADEADO_GRANDE}
                </td>
              </tr>
            </table>

            <!-- TÍTULO -->
            <h1 style="margin:28px 0 12px;font-size:28px;font-weight:800;color:#111827;text-align:center;line-height:1.25;letter-spacing:-0.6px;">
              Recupere sua senha
            </h1>

            <p style="margin:0 0 32px;font-size:15px;line-height:1.65;color:#6b7280;text-align:center;">
              Recebemos um pedido para redefinir a senha da sua conta.<br>
              Digite o código abaixo na tela de recuperação.
            </p>

            <!-- CÓDIGO -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#faf5ff;border:2px solid #820ad1;border-radius:16px;">
              <tr>
                <td style="padding:28px 20px;text-align:center;">
                  <div style="font-size:10px;font-weight:800;color:#820ad1;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;">Código de verificação</div>
                  <div style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:800;color:#111827;letter-spacing:14px;line-height:1;padding-left:14px;">${codigo}</div>
                  <div style="font-size:12px;color:#9333ea;font-weight:600;margin-top:16px;">Válido por 5 minutos</div>
                </td>
              </tr>
            </table>

            <!-- AVISO DE SEGURANÇA -->
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

            <!-- CONTATO SUPORTE -->
            <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b7280;text-align:center;">
              <strong style="color:#111827;">Suspeita de acesso indevido?</strong><br>
              Entre em contato imediatamente com nosso suporte.
            </p>
          </td>
        </tr>
      </table>

      <!-- RODAPÉ: REDES SOCIAIS -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding:36px 40px 8px;">
            <div style="border-top:1px solid #f3f4f6;padding-top:24px;text-align:center;">
              <div style="font-size:10px;font-weight:800;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-bottom:18px;">Fale com a gente</div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr><td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:8px;">${ICONE_TELEGRAM}</td>
                            <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">Telegram</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr><td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:8px;">${ICONE_WHATSAPP}</td>
                            <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">WhatsApp</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 6px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr><td style="padding:12px 16px;text-align:center;vertical-align:middle;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:8px;">${ICONE_EMAIL_PEQ}</td>
                            <td style="vertical-align:middle;font-size:13px;font-weight:700;color:#374151;">E-mail</td>
                          </tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0;font-size:12.5px;color:#9ca3af;line-height:1.7;">
                Atendimento de segunda a sábado, das 08h às 20h.
              </p>
            </div>
          </td>
        </tr>
      </table>

      <!-- RODAPÉ INSTITUCIONAL -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafbfc;">
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <div style="font-size:13px;font-weight:800;color:#111827;letter-spacing:-0.2px;margin-bottom:4px;">Minha Lojinha</div>
            <div style="font-size:11.5px;color:#9ca3af;line-height:1.7;">
              CNPJ 00.000.000/0001-00<br>
              Este é um e-mail automático — não responda diretamente.
            </div>
            <div style="font-size:11px;color:#d1d5db;margin-top:12px;">
              © 2025 Minha Lojinha. Todos os direitos reservados.
            </div>
          </td>
        </tr>
      </table>

    </div>

  </td></tr>
  </table>

  <!-- RODAPÉ EXTERNO -->
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
