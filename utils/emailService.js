const brevo = require('@getbrevo/brevo');

/**
 * Send email using Brevo (Sendinblue) Official SDK
 * This uses the HTTP API (port 443), which works on Render and other restricted environments.
 */
const sendEmail = async (to, subject, htmlContent) => {
    // 1. Configure API Key
    let defaultClient = brevo.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    // Ensure we use the API key (starts with xkeysib-), not the SMTP key.
    apiKey.apiKey = process.env.BREVO_API_KEY;

    if (!process.env.BREVO_API_KEY || !process.env.BREVO_API_KEY.startsWith('xkeysib-')) {
        console.error("CRITICAL: Invalid or missing BREVO_API_KEY. It must start with 'xkeysib-'. Check your .env file.");
    }

    // 2. Create Instance
    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    // 3. Parse Sender Details from .env or default
    // Expected format: "Name <email@domain.com>" or just "email@domain.com"
    const senderRaw = process.env.EMAIL_FROM || "Ignite <no-reply@teamignite.in>";
    let senderName = "Ignite";
    let senderEmail = "no-reply@teamignite.in";

    const match = senderRaw.match(/(.*?)\s*<(.*?)>/);
    if (match) {
        senderName = match[1].trim();
        senderEmail = match[2].trim();
    } else if (senderRaw.includes('@')) {
        senderEmail = senderRaw.trim();
    }

    // 4. Set Email Properties
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { "name": senderName, "email": senderEmail };
    sendSmtpEmail.to = [{ "email": to }];

    // 5. Send
    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[Brevo API] Email sent to ${to}. Message ID: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error('[Brevo API] Error sending email:', error?.body || error);
        // We log the error but allow the app to continue (don't crash the server loop)
        // However, we return null so the caller knows it failed if they care.
        return null;
    }
};

module.exports = { sendEmail };
