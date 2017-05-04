"use strict";

const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const cors = require('cors');
const randomstring = require('randomstring');
const UserModel = require('../model/userModel');
const ClientModel = require('../../clients/model/clientModel.js');
const async = require('async');
const smtpTransport = require('../../../config/nodemailer.config');


const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Create token.
 */
function createToken(user) {
  const token = jwt.sign({
    user: {
      "id": user.id,
      "client_id": user.client_id,
      "role": user.role
    }
  }, JWT_SECRET);
  return token;
}

router.use(cors());

router.post('/', (req, res) => {

  req.assert('username', 'User name cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }

  UserModel.findOne({
    username: req.body.username
  }, {
    username: 1,
    password: 1,
    role: 1,
    activeStatus: 1,
    client_id: 1
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(400).send({
        result: 'Authentication failed. User not found.'
      });
    } else {
      // console.log(user);
      if (user && user.activeStatus) {
        user.verifyPassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            let token = createToken(user);
            res.json({
              role: user.role,
              name: user.username,
              token: 'JWT ' + token
            });
          } else {
            res.status(400).send({
              result: 'Authentication failed, Wrong password!'
            });
          }
        });
      } else {
        res.status(401).send({
          result: 'Authentication failed, Your account has been disabled!'
        });
      }

    }
  });
});

router.post('/forgetPassword', (req, res) => {
  req.assert('email', 'email is required').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    return res.send(errors);
  }
  ClientModel.findOne({
    email: req.body.email
  }, function(err, Client) {
    if (err) {
      res.status(400).send({
        result: "Some thing went wrong"
      });
    }
    if (!Client) {
      res.status(204).send({
        result: "Email not registered, Please provide valid Email address"
      });
    } else {
      UserModel.findOne({
        client_id: Client._id
      }, function(err, User) {
        if (err) {
          res.status(400).send({
            result: "Some thing went wrong"
          });
        }
        if (!User) {
          res.status(204).send({
            result: "User not registerd yet"
          });
        } else {
          const RESET_TOKEN = randomstring.generate(25);
          User.passwordResetToken = RESET_TOKEN;
          User.passwordResetExpires = new Date(new Date().getTime() + (1000 * 3600 * 24 * 6));
          let mail_content = '<div><li><p><strong>' + Client.name + '</strong><b> &nbsp;&nbsp;<a href=http://46.4.107.85:8088/api/login/reset-password?token=' + RESET_TOKEN + '>Click here to reset password</a></b></li></p></div>';
          async.parallel({
            saveUserToken: function(callback) {
              User.save((err) => {
                if (err) {
                  callback(err);
                } else {
                  callback();
                }
              })
            },
            sendResetLink: function(callback) {
              const mailOptions = {
                to: Client.email + ',nastracking@gmail.com',
                from: 'Nepal Ambulance Tracking System - Automail <nastracking@gmail.com>',
                subject: 'Nepal Ambulance Tracking System - Forgot Password !',
                html: 'Hello <b>' +
                  Client.name + '</b>,</br><p>We noticed that you might be having some trouble logging into your Gps Tracking Service account and requested a password change for accounts associated with this email. No worries. Let\'s get you up and running.<p>Please choose the account for which you want to reset your password!</p><p>' +
                  mail_content + '</p><p>After you click the above link, you will receive mail with new password. If you haven\'t requested to reset your password, please ignore this mail. If you have any queries about his mail, feel free to talk to our team. Our customer support team is here for you. We promise to help out however we can.</p><div><a href="http://spark.com.np/contact/" target="_blank">Contact Spark Customer Support</a></br><p>You can hang onto this email, in case you have trouble accessing your account in the future. </p><p>All the best,</p><div>Spark Support Team</div>'
              };
              smtpTransport.sendMail(mailOptions, (err) => {
                callback(err);
              });
            }
          }, function(err, result) {
            if (err) {
              res.status(400).send({
                result: "Password request failed!"
              });
            }
            res.status(200).send({
              result: "password reset token sent"
            })
          })
        }
      });

    }
  });
});

router.get('/reset-password', function(req, res, next) {
  if ('token' in req.query === false)
    return next({
      status: 400,
      result: "token not provided"
    });

  let token = req.query.token;
  UserModel.findOne({
      passwordResetToken: token
    })
    .exec(function(err, User) {
      if (err) {
        return res.status(400).send({
          result: "Some thing went wrong"
        });
      }
      if (!User) {
        return res.status(400).send({
          result: "Token not set to User!"
        });
      } else {
        let expiry_time = new Date(User.passwordResetExpires).getTime();
        if (new Date().getTime() <= expiry_time) {
          ClientModel.findOne({
              _id: User.client_id
            })
            .exec(function(err, Client) {
              if (err) {
                return res.status(400).send({
                  result: "Some thing went wrong"
                });
              }
              if (!Client) {
                return res.status(400).send({
                  result: "Client not found!"
                });
              } else {
                const password = randomstring.generate(6);
                User.password = password;
                async.parallel({
                  saveUser: function(callback) {
                    User.save((err) => {
                      if (err) {
                        callback(err);
                      } else {
                        callback();
                      }
                    });
                  },
                  sendMail: function(callback) {
                    const mailBody = {
                      to: Client.email + ',nastracking@gmail.com',
                      from: 'Nepal Ambulance Tracking System - Automail <nastracking@gmail.com>',
                      subject: 'Nepal Ambulance Tracking System - Login credentials reset! ✔',
                      html: 'Hello <b>' +
                        Client.name + '</b>,</br><p>Your password has been reset successfully! The new password for username <strong>' +
                        User.username + ' </strong> is [ &nbsp;&nbsp;  <strong> ' +
                        password + '</strong> &nbsp;&nbsp; ] . You can change this password by logging into schoolbus mobile application.<p>If you have already logged in – awesome. If not,  feel free to talk to our team. Our customer support team is here for you. We promise to help out however we can.</p><div><a href="http://spark.com.np/contact/" target="_blank">Contact Spark Customer Support</a></br><p>You can hang onto this email, in case you have trouble accessing your account in the future. </p><p>All the best,</p><div>Spark Support Team</div>'
                    };
                    smtpTransport.sendMail(mailBody, (err) => {
                      callback(err);
                    });
                  }
                }, function(err, results) {
                  if (err) {
                    return res.status(400).send({
                      result: "Some thing went wrong"
                    });
                  } else {
                    res.status(200).send("Password successfully changed please check your mail!")
                  }
                });

              }
            })
        } else {
          return res.status(400).send({
            result: "Token expired"
          })
        }
      }
    });
});

module.exports = router;