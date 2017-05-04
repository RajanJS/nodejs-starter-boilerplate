'use strict';

module.exports = function(app, io) {
  /*
   *  Unsecure routes
   */
  // Authentication route
  app.use('/api/login', require("../modules/users/controller/login.route"));

  /*
   *  Secure routes
   */
  // Secure urls (Secure routes)
  // Admin URLS
  app.use('/api/admin/users', require("../modules/users/controller/user.route"));

  //Client URLS
  app.use('/api/client/profile', require("../modules/clients/controller/client.client.route"));

};
