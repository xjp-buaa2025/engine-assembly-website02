const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Pool } = require('pg');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 数据库连接
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_yXUV5pCMT3Fl@ep-cold-dream-a40dso0e-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser('engine-assembly-secret-key')); // 使用签名cookie

// 验证用户是否已登录的中间件
const requireLogin = (req, res, next) => {
  if (!req.signedCookies.username) {
    return res.redirect('/');
  }
  next();
};

// 路由

// 登录页面
app.get('/', (req, res) => {
  // 如果已经登录，重定向到仪表板
  if (req.signedCookies.username) {
    return res.redirect('/dashboard');
  }
  res.render('index', { error: null });
});

// 处理登录
app.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
      return res.render('index', { error: '请输入用户名' });
    }
    
    // 设置签名cookie，最大有效期7天
    res.cookie('username', username, { 
      signed: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true
    });
    
    // 尝试保存到数据库 (不阻塞主流程)
    try {
      await pool.query('INSERT INTO "name" ("name") VALUES ($1)', [username]);
    } catch (dbError) {
      console.error('数据库错误:', dbError);
      // 继续处理，不因数据库错误而阻止用户体验
    }
    
    // 重定向到仪表板
    res.redirect('/dashboard');
  } catch (error) {
    console.error('登录错误:', error);
    res.render('index', { error: '登录过程中发生错误' });
  }
});

// 仪表板页面
app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { username: req.signedCookies.username });
});

// 图库页面
app.get('/gallery', requireLogin, (req, res) => {
  res.render('gallery', { username: req.signedCookies.username });
});

// 游戏页面
app.get('/game', requireLogin, (req, res) => {
  res.render('game', { username: req.signedCookies.username });
});

// 3D模型页面
app.get('/model', requireLogin, (req, res) => {
  res.render('model', { username: req.signedCookies.username });
});

// 退出登录
app.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
});

// 处理404错误
app.use((req, res) => {
  res.status(404).send('页面未找到 - 404');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器内部错误 - 500');
});

// 在 app.js 中添加
app.use((req, res, next) => {
  // 设置 Unity WebGL 文件的 MIME 类型
  if (req.url.endsWith('.wasm')) {
    res.setHeader('Content-Type', 'application/wasm');
  } else if (req.url.endsWith('.js') && req.url.includes('/unity/')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.data') && req.url.includes('/unity/')) {
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  next();
});

// 1. 首先确保文件下载的路由正确设置 - 添加到 app.js

// 专门用于文件下载的路由
app.get('/download/:folder/:file', (req, res) => {
  try {
    const folder = req.params.folder;
    const file = req.params.file;
    
    // 安全检查：防止路径遍历攻击
    if (folder.includes('..') || file.includes('..')) {
      return res.status(403).send('访问被拒绝');
    }
    
    // 构建文件路径
    const filePath = path.join(__dirname, 'public', 'documents', folder, file);
    console.log('下载文件路径:', filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error('文件不存在:', filePath);
      return res.status(404).send('文件不存在');
    }
    
    // 获取文件的 MIME 类型
    const mimeType = getMimeType(file);
    
    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file)}"`);
    res.setHeader('Content-Type', mimeType);
    
    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    console.error('文件下载错误:', error);
    res.status(500).send('下载文件时出错');
  }
});

// 根据文件扩展名获取 MIME 类型
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.txt': 'text/plain'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// 开发环境下启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// 导出应用 (用于Vercel)
module.exports = app;