const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, 'src', 'environments');

const prodEnv = {
  production: true,
  supabase: {
    url: process.env.SUPABASE_URL || 'MISSING_SUPABASE_URL',
    anonKey: process.env.SUPABASE_ANON_KEY || 'MISSING_SUPABASE_ANON_KEY',
  },
};

const devEnv = {
  production: false,
  supabase: {
    url: process.env.SUPABASE_URL || 'MISSING_SUPABASE_URL',
    anonKey: process.env.SUPABASE_ANON_KEY || 'MISSING_SUPABASE_ANON_KEY',
  },
};

if (!fs.existsSync(envDir)) fs.mkdirSync(envDir, { recursive: true });
fs.writeFileSync(path.join(envDir, 'environment.ts'), `export const environment = ${JSON.stringify(devEnv, null, 2)};\n`);
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), `export const environment = ${JSON.stringify(prodEnv, null, 2)};\n`);

console.log('Environment files generated.');
