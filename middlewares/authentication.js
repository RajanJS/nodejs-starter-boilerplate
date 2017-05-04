"use strict";

const jsonwebtoken = require('jsonwebtoken');
const UserSchema = require('../modules/users/model/userModel');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Create token.
 */
function getToken(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

module.exports = function(req, res, next) {
  let token = getToken(req.headers);
  if (token) {
    try {
      var decoded = jsonwebtoken.verify(token, JWT_SECRET);
      req.user = decoded.user;
      UserSchema.findOne({
          _id: req.user.id
        })
        .exec(function(err, user) {
          if (err) {
            return res.status(500).json({
              result: err
            });
          }

          if (user) {
            if (!user.activeStatus)
              return res.status(401).json({
                result: 'Authentication failed, Your account has been disabled!'
              });
            else
              return next();
          } else {
            return res.status(400).json({
              result: "The user does not exists!"
            });
          }
        });
    } catch (err) {
      res.status(403).json({
        result: "Invalid Token"
      });
    }
  } else {
    res.status(401).json({
      result: "No token provided"
    });
  }
};
