const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'engine-assembly-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 } // 24小时
}));

// 引入路由
const indexRoutes = require('./routes/index');
const usersRoutes = require('./routes/users');

// 使用路由
app.use('/', indexRoutes);
app.use('/users', usersRoutes);

// 处理404错误
app.use((req, res, next) => {
  res.status(404).send('页面未找到 - 404');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器内部错误 - 500');
});

// 启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// 为Vercel导出应用
module.exports = app;