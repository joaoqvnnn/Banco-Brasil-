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
   TEMPLATE 1 — CONFIRMAÇÃO DE CADASTRO
   ========================================================= */
function montarEmailCadastro(codigo) {
  const assunto = `Confirme seu cadastro — Código ${codigo}`;

  const texto = `
MINHA LOJINHA
Central de Segurança

CONFIRMAÇÃO DE CADASTRO

Prezado(a) cliente,

Recebemos uma solicitação de cadastro vinculada a este endereço de e-mail.
Para concluir a verificação e ativar sua conta, utilize o código de confirmação abaixo:

CÓDIGO DE VERIFICAÇÃO: ${codigo}

Este código é de uso único e expira em 5 minutos.

Se você não realizou esta solicitação, por favor desconsidere este e-mail.
Nenhuma ação adicional é necessária — sua conta permanece segura.

INFORMAÇÕES INSTITUCIONAIS
Razão Social: Minha Lojinha
CNPJ: 00.000.000/0001-00
Horário de atendimento: Segunda a sábado, 08h às 20h
E-mail de suporte: ${process.env.GMAIL_USER}

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
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f5;padding:32px 14px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

    <!-- CABEÇALHO -->
    <tr>
      <td style="padding:32px 40px 24px;border-bottom:1px solid #f3f4f6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <div style="font-size:16px;font-weight:700;color:#111827;letter-spacing:-0.2px;">Minha Lojinha</div>
              <div style="font-size:11px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-top:3px;font-weight:600;">Central de Segurança</div>
            </td>
            <td align="right" style="vertical-align:middle;">
              <div style="display:inline-block;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px 10px;font-size:10px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;">Novo cadastro</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CORPO -->
    <tr>
      <td style="padding:36px 40px 8px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;line-height:1.35;letter-spacing:-0.4px;">Confirmação de cadastro</h1>

        <p style="margin:0 0 16px;font-size:14.5px;line-height:1.7;color:#4b5563;">Prezado(a) cliente,</p>

        <p style="margin:0 0 24px;font-size:14.5px;line-height:1.7;color:#4b5563;">
          Recebemos uma solicitação de cadastro vinculada a este endereço de e-mail. Para concluir a verificação e ativar sua conta, utilize o código de confirmação abaixo.
        </p>
      </td>
    </tr>

    <!-- CÓDIGO -->
    <tr>
      <td style="padding:0 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #111827;border-radius:6px;">
          <tr>
            <td style="padding:24px 20px;text-align:center;">
              <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">Código de verificação</div>
              <div style="font-size:36px;font-weight:700;letter-spacing:14px;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;padding-left:14px;">${codigo}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:16px;">Válido por 5 minutos</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- INSTRUÇÕES -->
    <tr>
      <td style="padding:28px 40px 0;">
        <div style="font-size:11px;font-weight:700;color:#111827;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Instruções</div>
        <ul style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.8;color:#4b5563;">
          <li>Retorne à tela de confirmação no aplicativo.</li>
          <li>Digite o código de 6 dígitos exatamente como exibido acima.</li>
          <li>Após a validação, sua conta será ativada automaticamente.</li>
        </ul>
      </td>
    </tr>

    <!-- AVISO -->
    <tr>
      <td style="padding:28px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border-left:3px solid #111827;border-radius:4px;">
          <tr>
            <td style="padding:14px 18px;">
              <div style="font-size:11px;font-weight:700;color:#111827;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Não foi você?</div>
              <p style="margin:0;font-size:13px;line-height:1.65;color:#4b5563;">
                Se você não solicitou este código, desconsidere este e-mail. Nenhuma ação é necessária — sua conta permanece protegida. Em caso de dúvidas, entre em contato com nosso suporte.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SEGURANÇA -->
    <tr>
      <td style="padding:24px 40px 0;">
        <p style="margin:0;font-size:12.5px;line-height:1.7;color:#6b7280;">
          <strong style="color:#111827;">Recomendação de segurança:</strong> nunca compartilhe este código com terceiros. Nossa equipe jamais solicita códigos de verificação por telefone, mensagem ou redes sociais.
        </p>
      </td>
    </tr>

    <!-- RODAPÉ INSTITUCIONAL -->
    <tr>
      <td style="padding:36px 40px 32px;">
        <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
          <div style="font-size:10px;font-weight:700;color:#111827;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">Informações institucionais</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:12px;color:#6b7280;line-height:1.9;">
            <tr><td style="width:130px;color:#9ca3af;">Razão social</td><td style="color:#4b5563;">Minha Lojinha</td></tr>
            <tr><td style="color:#9ca3af;">CNPJ</td><td style="color:#4b5563;">00.000.000/0001-00</td></tr>
            <tr><td style="color:#9ca3af;">Atendimento</td><td style="color:#4b5563;">Segunda a sábado — 08h às 20h</td></tr>
            <tr><td style="color:#9ca3af;">Suporte</td><td style="color:#4b5563;">${process.env.GMAIL_USER}</td></tr>
          </table>
        </div>
        <p style="margin:20px 0 0;font-size:11px;line-height:1.6;color:#9ca3af;">
          Este é um e-mail automático. Não responda diretamente a esta mensagem.
        </p>
        <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">
          © 2025 Minha Lojinha. Todos os direitos reservados.
        </p>
      </td>
    </tr>

  </table>

  <div style="max-width:560px;margin:20px auto 0;text-align:center;font-size:11px;color:#9ca3af;line-height:1.6;">
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

Recebemos uma solicitação para redefinir a senha vinculada a este endereço de e-mail.
Para prosseguir com a recuperação, utilize o código de verificação abaixo:

CÓDIGO DE VERIFICAÇÃO: ${codigo}

Este código é de uso único e expira em 5 minutos.

ATENÇÃO: se você NÃO solicitou a recuperação de senha, recomendamos que
altere sua senha imediatamente e entre em contato com nosso suporte.

INFORMAÇÕES INSTITUCIONAIS
Razão Social: Minha Lojinha
CNPJ: 00.000.000/0001-00
Horário de atendimento: Segunda a sábado, 08h às 20h
E-mail de suporte: ${process.env.GMAIL_USER}

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
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f5;padding:32px 14px;">
<tr><td align="center">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

    <!-- CABEÇALHO -->
    <tr>
      <td style="padding:32px 40px 24px;border-bottom:1px solid #f3f4f6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <div style="font-size:16px;font-weight:700;color:#111827;letter-spacing:-0.2px;">Minha Lojinha</div>
              <div style="font-size:11px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-top:3px;font-weight:600;">Central de Segurança</div>
            </td>
            <td align="right" style="vertical-align:middle;">
              <div style="display:inline-block;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:5px 10px;font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;">Ação necessária</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CORPO -->
    <tr>
      <td style="padding:36px 40px 8px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;line-height:1.35;letter-spacing:-0.4px;">Recuperação de senha</h1>

        <p style="margin:0 0 16px;font-size:14.5px;line-height:1.7;color:#4b5563;">Prezado(a) cliente,</p>

        <p style="margin:0 0 24px;font-size:14.5px;line-height:1.7;color:#4b5563;">
          Recebemos uma solicitação para redefinir a senha vinculada a este endereço de e-mail. Para prosseguir com a recuperação, utilize o código de verificação abaixo.
        </p>
      </td>
    </tr>

    <!-- CÓDIGO -->
    <tr>
      <td style="padding:0 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #111827;border-radius:6px;">
          <tr>
            <td style="padding:24px 20px;text-align:center;">
              <div style="font-size:10px;font-weight:700;color:#6b7280;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">Código de verificação</div>
              <div style="font-size:36px;font-weight:700;letter-spacing:14px;color:#111827;font-family:'Courier New',Courier,monospace;line-height:1;padding-left:14px;">${codigo}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:16px;">Válido por 5 minutos</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- INSTRUÇÕES -->
    <tr>
      <td style="padding:28px 40px 0;">
        <div style="font-size:11px;font-weight:700;color:#111827;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Como prosseguir</div>
        <ul style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.8;color:#4b5563;">
          <li>Retorne à tela de recuperação no aplicativo.</li>
          <li>Digite o código de 6 dígitos exatamente como exibido acima.</li>
          <li>Após a validação, defina sua nova senha.</li>
        </ul>
      </td>
    </tr>

    <!-- AVISO DE SEGURANÇA -->
    <tr>
      <td style="padding:28px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border-left:3px solid #111827;border-radius:4px;">
          <tr>
            <td style="padding:16px 18px;">
              <div style="font-size:11px;font-weight:700;color:#111827;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Aviso de segurança</div>
              <p style="margin:0 0 10px;font-size:13px;line-height:1.7;color:#4b5563;">
                Se você <strong style="color:#111827;">não solicitou</strong> a recuperação de senha, ignore este e-mail. Sua senha atual permanece válida e ninguém poderá alterá-la sem este código.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#4b5563;">
                Em caso de dúvidas ou suspeita de acesso indevido, entre em contato imediatamente com nosso suporte pelo e-mail <strong style="color:#111827;">${process.env.GMAIL_USER}</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SEGURANÇA -->
    <tr>
      <td style="padding:24px 40px 0;">
        <p style="margin:0;font-size:12.5px;line-height:1.7;color:#6b7280;">
          <strong style="color:#111827;">Recomendação de segurança:</strong> nunca compartilhe este código com terceiros. Nossa equipe jamais solicita códigos de verificação por telefone, mensagem ou redes sociais.
        </p>
      </td>
    </tr>

    <!-- RODAPÉ INSTITUCIONAL -->
    <tr>
      <td style="padding:36px 40px 32px;">
        <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
          <div style="font-size:10px;font-weight:700;color:#111827;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">Informações institucionais</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:12px;color:#6b7280;line-height:1.9;">
            <tr><td style="width:130px;color:#9ca3af;">Razão social</td><td style="color:#4b5563;">Minha Lojinha</td></tr>
            <tr><td style="color:#9ca3af;">CNPJ</td><td style="color:#4b5563;">00.000.000/0001-00</td></tr>
            <tr><td style="color:#9ca3af;">Atendimento</td><td style="color:#4b5563;">Segunda a sábado — 08h às 20h</td></tr>
            <tr><td style="color:#9ca3af;">Suporte</td><td style="color:#4b5563;">${process.env.GMAIL_USER}</td></tr>
          </table>
        </div>
        <p style="margin:20px 0 0;font-size:11px;line-height:1.6;color:#9ca3af;">
          Este é um e-mail automático. Não responda diretamente a esta mensagem.
        </p>
        <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">
          © 2025 Minha Lojinha. Todos os direitos reservados.
        </p>
      </td>
    </tr>

  </table>

  <div style="max-width:560px;margin:20px auto 0;text-align:center;font-size:11px;color:#9ca3af;line-height:1.6;">
    Você recebeu este e-mail porque uma recuperação de senha foi solicitada para este endereço.
  </div>

</td></tr>
</table>
</body>
</html>
  `.trim();

  return { assunto, texto, html };
}
