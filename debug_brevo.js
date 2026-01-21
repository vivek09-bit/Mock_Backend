const brevo = require('@getbrevo/brevo');
console.log('Keys in brevo export:', Object.keys(brevo));
try {
    console.log('ApiClient:', brevo.ApiClient);
    console.log('ApiClient.instance:', brevo.ApiClient ? brevo.ApiClient.instance : 'N/A');
} catch (e) {
    console.error(e);
}
