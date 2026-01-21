const brevo = require('@getbrevo/brevo');
console.log('TransactionalEmailsApi exists:', !!brevo.TransactionalEmailsApi);

if (brevo.TransactionalEmailsApi) {
    try {
        const api = new brevo.TransactionalEmailsApi();
        console.log('Instance keys:', Object.keys(api));
        console.log('Authentications:', api.authentications);

        // Check if we can set key directly
        if (api.setApiKey) {
            console.log('Has setApiKey method');
        }
    } catch (e) {
        console.error('Error instantiating:', e);
    }
}
