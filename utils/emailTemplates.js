// Utility for consistent, professional email styling
const getEmailLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px; }
    .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
    .button { display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .otp-box { background: #f0fdfa; border: 1px dashed #0d9488; color: #0f766e; font-size: 32px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
    .link-text { color: #0d9488; text-decoration: none; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ignite</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Ignite Platform. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

const verificationEmailTemplate = (otp) => getEmailLayout(`
  <h2 style="margin-top:0; color:#1e293b;">Check your email</h2>
  <p>Please enter the verification code below to confirm your account.</p>
  <div class="otp-box">${otp}</div>
  <p>This code will expire in 10 minutes.</p>
`);

const welcomeEmailTemplate = (name, username) => getEmailLayout(`
  <h2 style="margin-top:0; color:#1e293b;">Welcome to Ignite! 🚀</h2>
  <p>Hi <strong>${name || username}</strong>,</p>
  <p>We are thrilled to have you on board. Your account has been successfully created.</p>
  <p style="background: #f1f5f9; padding: 15px; border-radius: 6px;">
    <strong>Username:</strong> ${username}
  </p>
  <p>Explore our mock tests and start your journey to success today.</p>
  <br>
  <a href="https://igniteverse.in/login" class="button">Go to Dashboard</a>
`);

const resetPasswordTemplate = (link) => getEmailLayout(`
  <h2 style="margin-top:0; color:#1e293b;">Reset Your Password</h2>
  <p>We received a request to reset your password. Click the button below to proceed.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${link}" class="button">Reset Password</a>
  </div>
  <p style="font-size: 14px; color: #64748b;">
    Or copy and paste this link into your browser:<br>
    <a href="${link}" class="link-text">${link}</a>
  </p>
  <p>If you didn't request this, you can safely ignore this email.</p>
`);

const passwordChangeSuccessTemplate = (name) => getEmailLayout(`
  <h2 style="margin-top:0; color:#1e293b;">Password Changed Successfully</h2>
  <p>Hi <strong>${name}</strong>,</p>
  <p>Your password has been successfully updated.</p>
  <p>If you did not make this change, please contact our support team immediately.</p>
  <br>
  <a href="https://igniteverse.in/login" class="button">Login Now</a>
`);

module.exports = {
  verificationEmailTemplate,
  welcomeEmailTemplate,
  resetPasswordTemplate,
  passwordChangeSuccessTemplate
};
