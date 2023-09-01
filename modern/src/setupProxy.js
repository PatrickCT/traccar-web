/* eslint-disable import/no-extraneous-dependencies */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(createProxyMiddleware('/api/socket', { target: `ws://${process.env.REACT_APP_URL_NAME}`, ws: true }));
  app.use(createProxyMiddleware('/api', {
    target: `http://${process.env.REACT_APP_URL_NAME}`,
    onError: function (err, req, res) {
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('El servidor se encuentra en mantenimiento, intentelo más tarde, lamentamos los inconvenientes');
    },
  }));
};
