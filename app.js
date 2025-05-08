const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// 初始化 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 文件系统和路径模块
const fs = require('fs');

// 文件下载路由
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
    '.txt': 'text/plain',
    '.gltf': 'model/gltf+json',
    '.glb': 'model/gltf-binary'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// 添加调试路由，帮助查找资源加载问题
app.get('/debug-static', (req, res) => {
  const publicDir = path.join(__dirname, 'public');
  
  function scanDirectory(dir, basePath = '') {
    let result = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = path.join(basePath, item).replace(/\\/g, '/');
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        result.push(`📁 ${relativePath}`);
        result = result.concat(scanDirectory(itemPath, relativePath));
      } else {
        result.push(`📄 ${relativePath}`);
      }
    }
    
    return result;
  }
  
  try {
    const files = scanDirectory(publicDir);
    
    res.send(`
      <h1>静态文件调试</h1>
      <h2>服务器静态文件目录结构:</h2>
      <pre>${files.join('<br>')}</pre>
      <h2>环境信息:</h2>
      <pre>
Node.js 版本: ${process.version}
运行目录: ${__dirname}
静态文件目录: ${publicDir}
      </pre>
    `);
  } catch (error) {
    res.status(500).send(`<h1>错误</h1><pre>${error.stack}</pre>`);
  }
});

// 测试静态文件加载路由
app.get('/test-static', (req, res) => {
  res.send(`
    <h1>静态文件测试</h1>
    <h2>测试JS文件加载:</h2>
    <div id="js-test">等待JS加载...</div>
    <script src="/js/engine3d.js" onerror="document.getElementById('js-test').innerHTML='❌ JS加载失败'"></script>
    <script>
      window.onload = function() {
        if(typeof window.updateModelLoadingProgress === 'function') {
          document.getElementById('js-test').innerHTML = '✅ JS加载成功 - updateModelLoadingProgress函数已找到';
        } else {
          document.getElementById('js-test').innerHTML = '⚠️ JS文件可能加载，但函数未找到';
        }
      }
    </script>
    
    <h2>测试3D模型加载:</h2>
    <p>以下路径应该能够加载模型:</p>
    <ul>
      <li><a href="/models/engine.gltf" target="_blank">/models/engine.gltf</a></li>
      <li><a href="/models/Engine.gltf" target="_blank">/models/Engine.gltf</a></li>
    </ul>
  `);
});

// 路由

// 首页 - 欢迎页面
app.get('/', (req, res) => {
  res.render('index', { username: 'Guest' });
});

// 仪表板页面 - 不再需要登录验证
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { username: 'Guest' });
});

// 图库页面 - 不再需要登录验证
app.get('/gallery', (req, res) => {
  res.render('gallery', { username: 'Guest' });
});

// 游戏页面 - 不再需要登录验证
app.get('/game', (req, res) => {
  res.render('game', { username: 'Guest' });
});

// 3D模型页面 - 不再需要登录验证
app.get('/model', (req, res) => {
  res.render('model', { username: 'Guest' });
});

// 处理404错误
app.use((req, res) => {
  console.log('404错误 - 未找到页面:', req.url);
  res.status(404).send(`
    <h1>页面未找到 - 404</h1>
    <p>请求的路径: ${req.url}</p>
    <p><a href="/">返回首页</a></p>
  `);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).send(`
    <h1>服务器内部错误 - 500</h1>
    <p>请联系管理员报告此问题</p>
    <p><a href="/">返回首页</a></p>
  `);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`静态文件目录: ${path.join(__dirname, 'public')}`);
  console.log(`调试页面: http://localhost:${PORT}/debug-static`);
  console.log(`测试页面: http://localhost:${PORT}/test-static`);
});