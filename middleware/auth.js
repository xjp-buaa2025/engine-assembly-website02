/**
 * 身份验证中间件
 * 用于检查用户是否已登录
 */

// 检查用户是否已登录
const isAuthenticated = (req, res, next) => {
    console.log('身份验证中间件 - 会话状态:', req.session);
    
    if (req.session && req.session.username) {
      console.log('用户已验证:', req.session.username);
      return next();
    }
    
    console.log('用户未验证，重定向到登录页面');
    res.redirect('/');
  };
  
  module.exports = {
    isAuthenticated
  };