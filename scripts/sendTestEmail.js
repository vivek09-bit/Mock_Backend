require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTest() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP configuration in environment. Fill .env from .env.example');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const to = SMTP_USER; // send to yourself by default
  const from = EMAIL_FROM || SMTP_USER;
  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Test email from Ignite Mock Backend',
    text: 'This is a test email to verify SMTP configuration.',
  });

  console.log('Test email sent:', info.messageId);
}

sendTest().catch(err => {
  console.error('Error sending test email:', err);
  process.exit(1);
});
