// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  module.exports = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_yXUV5pCMT3Fl@ep-cold-dream-a40dso0e-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
    SESSION_SECRET: process.env.SESSION_SECRET || 'engine-assembly-secret-key'
  };