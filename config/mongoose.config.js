const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = function(config) {
  mongoose.Promise = require('bluebird');
  mongoose.connect(config.MONGODB_URI);
  mongoose.connection.on('error', () => {
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
  });
};
