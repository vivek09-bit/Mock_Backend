const https = require('https');

// Helper to parse "Name <email>" format
const parseSender = (senderString) => {
    if (!senderString) return { name: 'Ignite', email: 'no-reply@teamignite.in' };

    // Matches "Name <email@domain.com>"
    const match = senderString.match(/(.*?)\s*<(.*?)>/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    // Fallback if just email is provided
    return { name: 'Ignite', email: senderString.trim() };
};

/**
 * Send email using Brevo (Sendinblue) HTTP API
 * This bypasses SMTP port blocking on Render (ports 25, 465, 587)
 */
const sendEmail = async (to, subject, htmlContent) => {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.warn('[Email Service] BREVO_API_KEY is missing in .env. Falling back to log-only.');
        console.log(`[Log-Only] To: ${to} | Subject: ${subject}`);
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
            'api-key': apiKey, // Brevo v3 API requires 'api-key' header
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[Email Service] Sent to ${to}`);
                    resolve(JSON.parse(body || '{}'));
                } else {
                    console.error(`[Email Service] API Error (${res.statusCode}): ${body}`);
                    // Don't crash the app, just log error
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('[Email Service] Network Error:', e);
            resolve(null); // Resolve null to prevent crashing the flow
        });

        req.write(postData);
        req.end();
    });
};

module.exports = { sendEmail };
