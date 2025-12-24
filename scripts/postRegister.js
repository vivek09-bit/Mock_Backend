require('dotenv').config();
const fetch = global.fetch || require('node-fetch');

(async () => {
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Local Test',
      username: 'localtest123',
      email: 'localtest@example.com',
      password: 'password1',
      phone: '1234567890'
    })
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
})();
