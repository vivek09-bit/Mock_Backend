const https = require('https');

// Helper to parse "Name <email>" format
const parseSender = (senderString) => {
    if (!senderString) return { name: 'Ignite', email: 'no-reply@teamignite.in' };
    const match = senderString.match(/(.*?)\s*<(.*?)>/);
    if (match) return { name: match[1].trim(), email: match[2].trim() };
    return { name: 'Ignite', email: senderString.trim() };
};

/**
 * Send email using Resend API (HTTPS)
 */
const sendEmailResend = async (apiKey, to, subject, htmlContent) => {
    // Resend expects "from" in format: "Name <email@domain.com>"
    // Note: Resend requires a verified domain or sending to the account owner via 'onboarding@resend.dev' if testing.
    const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    // Fallback for simple email format
    const senderClean = from.includes('<') ? from : `Ignite <${from}>`;

    const postData = JSON.stringify({
        from: senderClean,
        to: [to],
        subject: subject,
        html: htmlContent
    });

    const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[Resend] Email sent to ${to}`);
                    resolve(JSON.parse(body || '{}'));
                } else {
                    console.error(`[Resend] Error (${res.statusCode}): ${body}`);
                    resolve(null);
                }
            });
        });
        req.on('error', e => {
            console.error('[Resend] Network Error:', e);
            resolve(null);
        });
        req.write(postData);
        req.end();
    });
};

/**
 * Send email using Brevo API (HTTPS)
 */
const sendEmailBrevo = async (apiKey, to, subject, htmlContent) => {
    // Check for common mistake: using SMTP key (xsmtp) instead of API key (xkeysib)
    if (apiKey.startsWith('xsmtp')) {
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('[Brevo] CONFIG ERROR: You are using an SMTP key (starts with "xsmtpsib-").');
        console.error('[Brevo] You MUST use an API Key (starts with "xkeysib-").');
        console.error('[Brevo] Get it here: https://app.brevo.com/settings/keys/api');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        return null;
    }

    const senderInfo = parseSender(process.env.EMAIL_FROM || process.env.SMTP_USER);

    const postData = JSON.stringify({
        sender: senderInfo,
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
    });

    const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[Brevo] Email sent to ${to}`);
                    resolve(JSON.parse(body || '{}'));
                } else {
                    console.error(`[Brevo] Error (${res.statusCode}): ${body}`);
                    resolve(null);
                }
            });
        });
        req.on('error', e => {
            console.error('[Brevo] Network Error:', e);
            resolve(null);
        });
        req.write(postData);
        req.end();
    });
};

/**
 * Main sendEmail function
 * automatically chooses provider based on available keys
 */
const sendEmail = async (to, subject, htmlContent) => {
    // 1. Try Resend
    if (process.env.RESEND_API_KEY) {
        return await sendEmailResend(process.env.RESEND_API_KEY, to, subject, htmlContent);
    }

    // 2. Try Brevo
    if (process.env.BREVO_API_KEY) {
        return await sendEmailBrevo(process.env.BREVO_API_KEY, to, subject, htmlContent);
    }

    // 3. Fallback
    console.warn('[Email Service] No RESEND_API_KEY or BREVO_API_KEY found. Email not sent.');
    console.log(`[Log-Only] To: ${to} | Subject: ${subject}`);
    return null;
};

module.exports = { sendEmail };
