const {GoogleAuth} = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(process.env.TEMP, 'bahja-sa-key.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

async function main() {
  const auth = new GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/identitytoolkit']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const res = await fetch('https://identitytoolkit.googleapis.com/v2/projects/bahja-a18a7/config?updateMask=authorizedDomains', {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + token.token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      authorizedDomains: [
        'localhost',
        'bahjahoney.vercel.app',
        'bahja-a18a7.firebaseapp.com'
      ]
    })
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log(JSON.stringify(data, null, 2));
}
main().catch(e => console.error('Error:', e.message));
