const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();
const app = express();

const { APP_ID, APP_SECRET, REDIRECT_URI } = process.env;
const code_verifier = 'Ch_B7s2tUMBcN5vUroYgCFwBeIbhuZN7lmfGBt6Ru6o';

app.get('/login/zalo', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Thiếu code từ Zalo');

  try {
    // 1) Build form data
    const params = new URLSearchParams();
    params.append('app_id', APP_ID);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('code_verifier', code_verifier);
    params.append('redirect_uri', REDIRECT_URI);

    // 2) Gọi lấy access_token đúng spec
    const tokenRes = await axios.post(
      'https://oauth.zaloapp.com/v4/access_token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': APP_SECRET
        }
      }
    );

    console.log('↪ tokenRes.data =', tokenRes.data);
    const access_token = tokenRes.data.access_token;
    if (!access_token) throw new Error('Không tìm thấy access_token');

    console.log('✅ access_token =', access_token);

    // 3) Tạo appsecret_proof
    const proof = crypto
      .createHmac('sha256', APP_SECRET)
      .update(access_token)
      .digest('hex');

    // 4) Gọi Graph API lấy user info
    const userRes = await axios.get('https://graph.zalo.me/v2.0/me', {
      params: { access_token, appsecret_proof: proof }
    });

    return res.json({
      message: 'Đăng nhập thành công!',
      user: userRes.data
    });
  } catch (err) {
    console.error('❌ Lỗi Callback Zalo:', err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
