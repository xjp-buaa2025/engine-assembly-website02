const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);

// 加载环境变量配置
const env = require('./config/env');

// 初始化Express应用
const app = express();
const PORT = env.PORT || 3000;

// 创建数据库连接池
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // 为了连接到某些数据库服务，可能需要此配置
  }
});

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 使用PostgreSQL存储会话
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'   // 使用默认的表名
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    secure: process.env.NODE_ENV === 'production' // 在生产环境中使用安全cookie
  }
}));

// 调试中间件 - 输出会话信息
app.use((req, res, next) => {
  console.log('会话ID:', req.sessionID);
  console.log('会话数据:', req.session);
  next();
});

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