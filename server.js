const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();
const app = express();

const { APP_ID, APP_SECRET, REDIRECT_URI } = process.env;
const code_verifier = 'Ch_B7s2tUMBcN5vUroYgCFwBeIbhuZN7lmfGBt6Ru6o';

app.get('/login/zalo', async (req, res) => {
  try {
    const tokenRes = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
      app_id: APP_ID,
      app_secret: APP_SECRET,
      grant_type: 'authorization_code',
      code: req.query.code,
      code_verifier,
      redirect_uri: REDIRECT_URI
    });

    console.log('↪ tokenRes.data =', JSON.stringify(tokenRes.data, null, 2));
    const payload = tokenRes.data.data || tokenRes.data;
    const access_token = payload.access_token;
    if (!access_token) throw new Error('Không tìm thấy access_token');

    console.log('✅ access_token =', access_token);
    const proof = crypto
      .createHmac('sha256', APP_SECRET)
      .update(access_token)
      .digest('hex');

    const userRes = await axios.get('https://graph.zalo.me/v2.0/me', {
      params: { access_token, appsecret_proof: proof }
    });

    return res.json({ message: 'Đăng nhập thành công!', user: userRes.data });
  } catch (err) {
    console.error('❌ Lỗi Callback Zalo:', err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});


app.listen(process.env.PORT||3000, () => console.log('Server running'));
