const express = require('express');
const axios = require('axios');
require('dotenv').config(); // <-- dùng biến môi trường
const app = express();

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/', (req, res) => {
  res.send('Zalo OAuth Server is running!');
});

app.get('/login/zalo', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Thiếu mã code từ Zalo');

  try {
    const tokenRes = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
      app_id: APP_ID,
      app_secret: APP_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://graph.zalo.me/v2.0/me', {
      headers: { access_token },
    });

    res.json({
      message: 'Đăng nhập thành công!',
      user: userRes.data,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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
app.post('/oa/callback', express.json(), (req, res) => {
  console.log('OA Callback:', req.body);
  res.sendStatus(200); // Zalo yêu cầu phản hồi 200
});
const axios = require('axios');
const code_verifier = 'Ch_B7s2tUMBcN5vUroYgCFwBeIbhuZN7lmfGBt6Ru6o'; // đúng code_verifier bạn đã dùng

app.get('/login/zalo', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code) {
    return res.status(400).send('Thiếu code từ Zalo');
  }

  try {
    // Bước 1: Gửi yêu cầu lấy access_token
    const tokenRes = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
      app_id: process.env.APP_ID,
      grant_type: 'authorization_code',
      code,
      code_verifier,
      redirect_uri: process.env.REDIRECT_URI
    });

    const access_token = tokenRes.data.access_token;
    console.log('access_token:', access_token);

    // Bước 2: Gọi API lấy thông tin người dùng
    const userRes = await axios.get('https://graph.zalo.me/v2.0/me', {
      headers: {
        access_token // truyền vào header
      }
    });

    res.json({
      message: 'Đăng nhập thành công!',
      user: userRes.data
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      message: 'Lỗi khi lấy access_token hoặc user',
      error: err.response?.data || err.message
    });
  }
});

