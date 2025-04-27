const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// 首页 - 登录页面
router.get('/', (req, res) => {
  // 如果用户已登录，直接跳转到仪表板
  if (req.session.username) {
    return res.redirect('/dashboard');
  }
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
    
    // 等待会话保存完成
    req.session.save((err) => {
      if (err) {
        console.error('会话保存错误:', err);
        return res.render('index', { error: '登录过程中发生错误' });
      }
      
      console.log('会话已保存，用户名:', username);
      console.log('会话ID:', req.sessionID);
      
      // 重定向到仪表板
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.render('index', { error: '登录过程中发生错误' });
  }
});

// 使用中间件保护需要登录的路由
// 仪表板页面 - 需要登录
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { username: req.session.username });
});

// 图片展示页面 - 需要登录
router.get('/gallery', isAuthenticated, (req, res) => {
  res.render('gallery', { username: req.session.username });
});

// 游戏页面 - 需要登录
router.get('/game', isAuthenticated, (req, res) => {
  res.render('game', { username: req.session.username });
});

// 退出登录
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('退出登录错误:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;