/**
 * Module dependencies.
 */
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const logger = require('morgan');

module.exports = function(app, config, path, env) {
  app.set('port', config.port);
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(expressValidator());
}
