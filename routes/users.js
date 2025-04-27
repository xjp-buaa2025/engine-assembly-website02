const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取用户信息
router.get('/profile', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ error: '未登录' });
  }
  
  try {
    const result = await db.query('SELECT * FROM "name" WHERE "name" = $1', [req.session.username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;