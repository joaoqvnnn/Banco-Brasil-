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
      from: `"Minha Lojinha 🔐" <${process.env.GMAIL_USER}>`,
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
   TEMPLATE 1 — CADASTRO (verde premium)
   ========================================================= */
function montarEmailCadastro(codigo) {
  const assunto = `✨ ${codigo} é seu código de boas-vindas`;

  const texto = `
MINHA LOJINHA — Confirmação de Cadastro

Seja bem-vindo(a)! 🎉
Seu código de ativação é: ${codigo}
Expira em 5 minutos.

Se você não solicitou, ignore este e-mail.

© 2025 Minha Lojinha
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f0fdf4;padding:32px 14px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(22,163,74,0.15);">

  <!-- HEADER VERDE -->
  <tr><td style="background:linear-gradient(135deg,#052e16 0%,#166534 50%,#22c55e 100%);padding:40px 32px 36px;text-align:center;position:relative;">
    <div style="display:inline-block;width:70px;height:70px;background:#ffffff;border-radius:50%;line-height:70px;font-size:32px;font-weight:900;color:#16a34a;margin-bottom:16px;box-shadow:0 8px 24px rgba(0,0,0,0.2);">M</div>
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Minha Lojinha</h1>
    <p style="margin:8px 0 0;color:#bbf7d0;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">✨ Seja bem-vindo(a)</p>
  </td></tr>

  <!-- BADGE -->
  <tr><td style="padding:28px 32px 0;text-align:center;">
    <div style="display:inline-block;background:#f0fdf4;color:#15803d;padding:8px 20px;border-radius:24px;font-size:11px;font-weight:800;letter-spacing:1px;">🎉 NOVA CONTA</div>
  </td></tr>

  <!-- TÍTULO -->
  <tr><td style="padding:20px 32px 0;">
    <h2 style="margin:0 0 12px;color:#111827;font-size:26px;font-weight:800;text-align:center;line-height:1.25;">Ative sua conta<br>e comece a usar</h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;text-align:center;">Falta só um passo! Digite o código abaixo na tela de confirmação para ativar sua conta.</p>
  </td></tr>

  <!-- CÓDIGO -->
  <tr><td style="padding:0 32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #16a34a;border-radius:18px;padding:32px 20px;text-align:center;box-shadow:0 6px 20px rgba(22,163,74,0.2);">
        <p style="margin:0 0 12px;color:#15803d;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">🎫 Código de ativação</p>
        <div style="font-size:44px;font-weight:900;letter-spacing:14px;color:#16a34a;font-family:'Courier New',monospace;line-height:1;padding-left:14px;">${codigo}</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- INFO -->
  <tr><td style="padding:24px 32px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:10px;padding:14px 18px;">
        <p style="margin:0;color:#065f46;font-size:13.5px;line-height:1.6;">⏱️ <strong>Expira em 5 minutos.</strong> Se demorar, é só pedir um novo código na tela.</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- SEGURANÇA -->
  <tr><td style="padding:20px 32px 0;">
    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.65;text-align:center;">
      🔒 <strong style="color:#111827;">Nunca compartilhe este código.</strong><br>Nossa equipe nunca pede por WhatsApp, Telegram ou ligação.
    </p>
  </td></tr>

  <!-- RODAPÉ -->
  <tr><td style="padding:32px 32px 36px;">
    <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;line-height:1.6;">Não foi você? Pode ignorar este e-mail.</p>
      <p style="margin:0;color:#d1d5db;font-size:11px;">© 2025 Minha Lojinha — CNPJ 00.000.000/0001-00</p>
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
   TEMPLATE 2 — RECUPERAÇÃO (laranja/âmbar de segurança)
   ========================================================= */
function montarEmailRecuperacao(codigo) {
  const assunto = `🔐 ${codigo} é seu código de recuperação`;

  const texto = `
MINHA LOJINHA — Recuperação de Senha

Recebemos um pedido para redefinir a senha da sua conta.
Seu código de verificação é: ${codigo}
Expira em 5 minutos.

Se NÃO foi você, altere sua senha imediatamente.

© 2025 Minha Lojinha
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fffbeb;padding:32px 14px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(217,119,6,0.18);">

  <!-- HEADER LARANJA -->
  <tr><td style="background:linear-gradient(135deg,#7c2d12 0%,#ea580c 50%,#fbbf24 100%);padding:40px 32px 36px;text-align:center;">
    <div style="display:inline-block;width:70px;height:70px;background:#ffffff;border-radius:50%;line-height:70px;font-size:34px;font-weight:900;color:#ea580c;margin-bottom:16px;box-shadow:0 8px 24px rgba(0,0,0,0.2);">🔐</div>
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Minha Lojinha</h1>
    <p style="margin:8px 0 0;color:#fed7aa;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">🔒 Central de Segurança</p>
  </td></tr>

  <!-- BADGE -->
  <tr><td style="padding:28px 32px 0;text-align:center;">
    <div style="display:inline-block;background:#fff7ed;color:#c2410c;padding:8px 20px;border-radius:24px;font-size:11px;font-weight:800;letter-spacing:1px;">⚠️ AÇÃO NECESSÁRIA</div>
  </td></tr>

  <!-- TÍTULO -->
  <tr><td style="padding:20px 32px 0;">
    <h2 style="margin:0 0 12px;color:#111827;font-size:26px;font-weight:800;text-align:center;line-height:1.25;">Recuperação<br>de senha</h2>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;text-align:center;">Recebemos um pedido para redefinir a senha da sua conta. Use o código abaixo para continuar:</p>
  </td></tr>

  <!-- CÓDIGO -->
  <tr><td style="padding:0 32px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td style="background:linear-gradient(135deg,#fff7ed 0%,#fed7aa 100%);border:2px solid #ea580c;border-radius:18px;padding:32px 20px;text-align:center;box-shadow:0 6px 20px rgba(234,88,12,0.2);">
        <p style="margin:0 0 12px;color:#c2410c;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">🔑 Código de verificação</p>
        <div style="font-size:44px;font-weight:900;letter-spacing:14px;color:#ea580c;font-family:'Courier New',monospace;line-height:1;padding-left:14px;">${codigo}</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- TEMPO -->
  <tr><td style="padding:24px 32px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:10px;padding:14px 18px;">
        <p style="margin:0;color:#92400e;font-size:13.5px;line-height:1.6;">⏱️ <strong>Expira em 5 minutos.</strong> Depois disso, você precisa pedir um novo código.</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- ALERTA SEGURANÇA -->
  <tr><td style="padding:20px 32px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 18px;">
        <p style="margin:0;color:#991b1b;font-size:13.5px;line-height:1.65;">
          🚨 <strong>Não foi você?</strong><br>
          Se você não solicitou a recuperação de senha, <strong>ignore este e-mail</strong>. Sua senha permanece segura e ninguém conseguirá alterá-la sem este código.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- RODAPÉ -->
  <tr><td style="padding:28px 32px 36px;">
    <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;line-height:1.6;">Este é um e-mail automático de segurança. Não responda.</p>
      <p style="margin:0;color:#d1d5db;font-size:11px;">© 2025 Minha Lojinha — CNPJ 00.000.000/0001-00</p>
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
