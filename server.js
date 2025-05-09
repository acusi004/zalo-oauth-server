const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

// === Biến cấu hình ===
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const code_verifier = 'Ch_B7s2tUMBcN5vUroYgCFwBeIbhuZN7lmfGBt6Ru6o'; // code_verifier bạn tạo từ đầu

// === Trang kiểm tra server sống ===
app.get('/', (req, res) => {
  res.send('Zalo OAuth Server is running!');
});

// === Callback sau khi người dùng đăng nhập Zalo ===
app.get('/login/zalo', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code) return res.status(400).send('Thiếu code từ Zalo');

  try {
    // Bước 1: Gửi yêu cầu lấy access_token
    const tokenRes = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
      app_id: APP_ID,
      grant_type: 'authorization_code',
      code,
      code_verifier,
      redirect_uri: REDIRECT_URI
    });

    const access_token = tokenRes.data.access_token;
    console.log('✅ access_token:', access_token);

    // Bước 2: Gọi API lấy thông tin người dùng
    const userRes = await axios.get('https://graph.zalo.me/v2.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}` // ✅ sửa đúng format Zalo yêu cầu
      }
    });

    res.json({
      message: 'Đăng nhập thành công!',
      user: userRes.data
    });

  } catch (err) {
    console.error('❌ Lỗi:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Lỗi khi lấy access_token hoặc thông tin user',
      error: err.response?.data || err.message
    });
  }
});

// === Xác minh domain Zalo ===
app.get('/zalo_verifierUlAT1P_tDLDPmxrDckqBJ4xUdH6Yg4jDEJSp.html', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta property="zalo-platform-site-verification" content="UlAT1P_tDLDPmxrDckqBJ4xUdH6Yg4jDEJSp" />
    </head>
    <body>
      There Is No Limit To What You Can Accomplish Using Zalo!
    </body>
    </html>
  `);
});

// === Nhận callback từ Official Account (nếu có) ===
app.post('/oa/callback', express.json(), (req, res) => {
  console.log('OA Callback:', req.body);
  res.sendStatus(200);
});

// === Khởi động server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
