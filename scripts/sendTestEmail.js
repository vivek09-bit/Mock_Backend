require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTest() {
  const { 
    SMTP_HOST, 
    SMTP_PORT, 
    SMTP_SECURE, 
    SMTP_USER, 
    SMTP_PASS, 
    EMAIL_FROM, 
    TEST_RECEIVER 
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('❌ Missing SMTP configuration in environment. Check your .env file.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true', // Should be false for 587
    auth: { 
      user: SMTP_USER, 
      pass: SMTP_PASS 
    },
  });

  // Use TEST_RECEIVER from .env, or fallback to SMTP_USER
  const to = TEST_RECEIVER || SMTP_USER;
  
  // Use EMAIL_FROM from .env (the support@igniteverse.in address)
  const from = EMAIL_FROM || SMTP_USER;

  console.log(`Attempting to send email from: ${from} to: ${to}...`);

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Test email from Ignite Mock Backend',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<strong>Success!</strong> This email verifies your .env configuration is working.',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    throw error; // Let the .catch() block handle it
  }
}

sendTest().catch(err => {
  console.error('❌ Error sending test email:', err.message);
  process.exit(1);
});