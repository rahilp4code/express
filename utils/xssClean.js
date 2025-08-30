// xssClean.js
const xss = require('xss');

const plainTextFilter = new xss.FilterXSS({
  whiteList: {}, // no HTML tags allowed
  stripIgnoreTag: true, // remove all non-whitelisted tags
  stripIgnoreTagBody: ['script'], // remove <script> tag + content
});

function xssClean(req, res, next) {
  // Sanitize body
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = plainTextFilter.process(req.body[key]);
      }
    }
  }

  // Sanitize query params
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = plainTextFilter.process(req.query[key]);
      }
    }
  }

  // Sanitize URL params
  if (req.params) {
    for (let key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = plainTextFilter.process(req.params[key]);
      }
    }
  }

  next();
}

module.exports = xssClean;
