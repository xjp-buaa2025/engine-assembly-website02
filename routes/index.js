const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 首页 - 登录页面
router.get('/', (req, res) => {
  res.render('index', { error: null });
});

// 登录表单处理
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
      return res.render('index', { error: '请输入用户名' });
    }
    
    // 保存用户名到数据库
    await db.query('INSERT INTO "name" ("name") VALUES ($1)', [username]);
    
    // 保存用户名到会话
    req.session.username = username;
    
    // 重定向到仪表板
    res.redirect('/dashboard');
  } catch (error) {
    console.error('登录错误:', error);
    res.render('index', { error: '登录过程中发生错误' });
  }
});

// 仪表板页面 - 需要登录
router.get('/dashboard', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }
  res.render('dashboard', { username: req.session.username });
});

// 图片展示页面
router.get('/gallery', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }
  res.render('gallery', { username: req.session.username });
});

// 游戏页面
router.get('/game', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/');
  }
  res.render('game', { username: req.session.username });
});

// 退出登录
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;