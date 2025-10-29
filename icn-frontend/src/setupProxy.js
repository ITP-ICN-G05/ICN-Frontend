// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // This log should appear in your terminal when server starts
  console.log('============================================');
  console.log('PROXY MIDDLEWARE LOADED!');
  console.log('Proxying /api/* to https://1355xcz.top:8080');
  console.log('============================================');
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://1355xcz.top:8080',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};