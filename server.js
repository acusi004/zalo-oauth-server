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
    // 1) Lấy access_token
    const tokenRes = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
      app_id: APP_ID,
      grant_type: 'authorization_code',
      code,
      code_verifier,
      redirect_uri: REDIRECT_URI
    });
    const access_token = tokenRes.data.access_token;
    console.log('✅ access_token:', access_token);

    // 2) Tạo appsecret_proof
    const proof = crypto
      .createHmac('sha256', APP_SECRET)
      .update(access_token)
      .digest('hex');

    // 3) Gọi Graph API lấy thông tin user
    const userRes = await axios.get('https://graph.zalo.me/v2.0/me', {
      params: { access_token, appsecret_proof: proof }
    });

    return res.json({
      message: 'Đăng nhập thành công!',
      user: userRes.data
    });
  } catch (err) {
    console.error('❌ Lỗi:', err.response?.data || err.message);
    return res.status(500).json({
      message: 'Lỗi khi lấy access_token hoặc user',
      error: err.response?.data || err.message
    });
  }
});

app.listen(process.env.PORT||3000, () => console.log('Server running'));
