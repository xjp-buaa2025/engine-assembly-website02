const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_yXUV5pCMT3Fl@ep-cold-dream-a40dso0e-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

// Vercel无服务器环境优化：使用单一客户端
let client = null;

const connect = async () => {
  if (client === null) {
    client = await pool.connect();
  }
  return client;
};

module.exports = {
  query: async (text, params) => {
    // 在开发环境中
    if (process.env.NODE_ENV !== 'production') {
      return pool.query(text, params);
    }
    
    // 在Vercel生产环境中
    try {
      const client = await connect();
      return client.query(text, params);
    } catch (error) {
      console.error('数据库查询错误:', error);
      throw error;
    }
  }
};