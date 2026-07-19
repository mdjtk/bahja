const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
if (match) {
  let jsonStr = match[1].trim();
  jsonStr = jsonStr.replace(/^"/, '').replace(/"$/, '');
  const tmpDir = process.env.TEMP;
  fs.writeFileSync(path.join(tmpDir, 'bahja-sa-key.json'), jsonStr);
  const parsed = JSON.parse(jsonStr);
  console.log('OK project_id:', parsed.project_id);
}
