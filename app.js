/**
 * Module dependencies.
 */
const express = require('express');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const chalk = require('chalk');
const cors = require('./middlewares/cors');


const upload = multer({
  dest: path.join(__dirname, 'uploads')
});

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({
  path: '.env'
});

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('./config/env.config')[env];

/**
 * Create Express server.
 */
const app = express();
// const server = require('http').Server(app)

/**
 * Enable cors in app
 */
app.use(cors);

/**
 * Connect to MongoDB.
 */
require('./config/mongoose.config')(config);

/**
 * Express configuration.
 */
require('./config/express.config')(app, config, path, env);

/**
 * Socket Stuff
 */
const io = require('socket.io').listen(app.listen(9070));
const socket = require('./sockets')(io);

/**
 * Create our Express router
 */
const router = express.Router();

/**
 * Initial dummy route for testing
 */
router.get('/', function(req, res) {
  res.json({
    message: `You're here in API!`
  });
});

/**
 * Register all our routes with /api
 * Primary app routes.
 */
// Register all our routes with /api
app.use('/api', router);
require('./routes/routes')(app, io);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s API Server is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
