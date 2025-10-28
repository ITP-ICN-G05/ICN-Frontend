// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // This log should appear in your terminal when server starts
  console.log('============================================');
  console.log('PROXY MIDDLEWARE LOADED!');
  console.log('Proxying /api/* to https://dustin-notour-uncomplementally.ngrok-free.dev');
  console.log('============================================');
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://dustin-notour-uncomplementally.ngrok-free.dev',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};