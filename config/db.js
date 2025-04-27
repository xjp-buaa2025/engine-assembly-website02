const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_yXUV5pCMT3Fl@ep-cold-dream-a40dso0e-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

// 测试数据库连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功:', res.rows[0]);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};