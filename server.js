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
