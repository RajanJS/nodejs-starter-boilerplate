var nodemailer = require("nodemailer");
module.exports = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'demo.tracking.spark@gmail.com',
    pass: 'demotracking@spark'
  }
});
