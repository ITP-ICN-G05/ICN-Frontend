// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // This log should appear in your terminal when server starts
  console.log('============================================');
  console.log('PROXY MIDDLEWARE LOADED!');
  console.log('Proxying /api/* to http://54.242.81.107:8080');
  console.log('============================================');
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://54.242.81.107:8080',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};