const userQuery = require("../query/user.query");
const async = require('async');

/**
 * POST /api/users
 * Create endpoint /api/users for POST
 */
exports.postUsers = (req, res, next) => {

  req.assert('username', 'Username field must be entered.').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long.').len(4);

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }

  userQuery.postUsers({
      username: req.body.username,
      password: req.body.password
    })
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).send(err);
    });
};

/**
 * GET /api/users
 * Create endpoint /api/users for GET
 */
exports.getUsers = (req, res) => {
  userQuery.getUsers({})
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * GET /api/users/:user_id
 * Create endpoint /api/users/:user_id for GET
 */
exports.getUserById = (req, res) => {
  userQuery.getUserById(req.params.user_id)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.deleteUser = (req, res, next) => {
  userQuery.deleteUser(req.params.user_id)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.updatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }

  userQuery.updatePassword(req.params.user_id, req.body.password)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.forgotPassword = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({
    remove_dots: false
  });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function createRandomToken(done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function setRandomToken(token, done) {
      User.findOne({
        email: req.body.email
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          req.flash('errors', {
            msg: 'Account with that email address does not exist.'
          });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: '********',
        subject: 'Reset your password',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://46.4.107.85:8088/api/login/reset-password?token=${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', {
          msg: `An e-mail has been sent to ${user.email} with further instructions.`
        });
        done(err);
      });
    }
  ], (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/forgot');
  });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.resetPassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function resetPassword(done) {
      User
        .findOne({
          passwordResetToken: req.params.token
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            req.flash('errors', {
              msg: 'Password reset token is invalid or has expired.'
            });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) {
              return next(err);
            }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: '********',
        subject: 'Your password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', {
          msg: 'Success! Your password has been changed.'
        });
        done(err);
      });
    }
  ], (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};
