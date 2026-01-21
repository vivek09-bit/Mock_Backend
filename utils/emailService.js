const Brevo = require("@getbrevo/brevo");

/**
 * Send email using Brevo HTTP API (works on Render)
 */
const apiInstance = new Brevo.TransactionalEmailsApi();

// Set API key ONCE
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const sendEmail = async (to, subject, htmlContent) => {
    try {
        if (
            !process.env.BREVO_API_KEY ||
            !process.env.BREVO_API_KEY.startsWith("xkeysib-")
        ) {
            throw new Error("Invalid or missing BREVO_API_KEY");
        }

        // Parse sender from env
        const senderRaw =
            process.env.EMAIL_FROM || "Ignite <no-reply@teamignite.in>";

        let senderName = "Ignite";
        let senderEmail = "no-reply@teamignite.in";

        const match = senderRaw.match(/(.*?)\s*<(.*?)>/);
        if (match) {
            senderName = match[1].trim();
            senderEmail = match[2].trim();
        } else if (senderRaw.includes("@")) {
            senderEmail = senderRaw.trim();
        }

        const emailData = new Brevo.SendSmtpEmail();

        emailData.subject = subject;
        emailData.htmlContent = htmlContent;
        emailData.sender = {
            name: senderName,
            email: senderEmail,
        };
        emailData.to = [{ email: to }];


        const response = await apiInstance.sendTransacEmail(emailData);

        console.log(`[Brevo API] Email sent successfully to ${to}`);


        return response;
    } catch (error) {
        console.error(
            "[Brevo API] Error sending email:",
            error?.response?.body || error
        );
        throw error; // let route catch it properly
    }
};

module.exports = { sendEmail };
