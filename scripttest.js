const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: '9ed798001@smtp-brevo.com', // Your Brevo Login ID
    pass: 'xsmtpsib-eece762496fb14b6dec7b3d7d3ea439b4042b469682c601e4e3ad85466bac4b9-lG3t8uxlf3oezxZF',  // The key from Step 2
  },
});

const mailOptions = {
  // This is how you send from your custom domain
  from: '"Igniteverse Support" <support@igniteverse.in>', 
  to: 'gboi215@gmail.com',
  subject: 'Official Verification Email',
  text: 'This email is coming directly from support@igniteverse.in!',
  html: '<b>Success!</b> Your custom domain email is now working.'
};

async function sendMail() {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: ' + info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendMail();