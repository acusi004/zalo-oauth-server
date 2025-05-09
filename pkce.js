const crypto = require('crypto');

// Bước 1: Tạo code_verifier (43–128 ký tự)
const code_verifier = crypto.randomBytes(32).toString('base64url'); // base64url đã bỏ padding

// Bước 2: Tạo code_challenge từ code_verifier
const sha256 = crypto.createHash('sha256').update(code_verifier).digest();
const code_challenge = sha256.toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, ''); // bỏ padding

console.log('code_verifier:', code_verifier);
console.log('code_challenge:', code_challenge);
