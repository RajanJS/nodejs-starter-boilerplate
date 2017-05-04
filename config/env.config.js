'use strict';

let path = require('path');
let rootPath = path.normalize(__dirname + '/../');

module.exports = {
  development: {
    PATH: rootPath,
    MONGODB_URI: 'mongodb://localhost/nodejs-starter',
    port: process.env.PORT || 9088,
    ip: 'localhost'
  },
  production: {
    PATH: rootPath,
    port: process.env.PORT || 80,
    ip: ''
  }
}
