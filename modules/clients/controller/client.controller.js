const clientQuery = require("../query/client.query");
const UserQuery = require("../../users/query/user.query");

//Admin controllers

/**
 * POST /api/clients
 * Create endpoint /api/clients for POST
 */
exports.postClients = (req, res, next) => {
  req.assert('name', 'Client Name field must be entered.').notEmpty();
  req.assert('address', 'Address field must be entered.').notEmpty();
  req.assert('phoneNumber', 'Phone field must be entered.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }

  clientQuery.postClients(req.body)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * GET /api/clients
 * Create endpoint /api/clients for GET
 */
exports.getClients = (req, res) => {
  clientQuery.getClients({})
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * GET /api/clients/:client_id
 * Create endpoint /api/clients/:client_id for GET
 */
exports.getClientById = (req, res) => {
  clientQuery.getClientById(req.params.client_id)
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
exports.deleteClient = (req, res, next) => {
  req.assert('client_id', 'Client Id for deleting user is required.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }

  clientQuery.deleteClient(req.params.client_id)
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
exports.updateClient = (req, res, next) => {
  req.assert('client_id', 'Client Id for updating user is required.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }
  //update user status if userid is sent
  if (req.body.userId) {
    UserQuery.updateUser(req.body.userId, req.body);
  }

  clientQuery.updateClient(req.params.client_id, req.body)
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
exports.createCredentials = (req, res, next) => {
  req.assert('client_id', 'Client Id for creating credentials is required.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send(errors);
  }

  clientQuery.createUser(req.body.client_id)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

//Client Controllers
/**
 * GET /api/clients/
 * Create endpoint /api/clients/ for GET profile
 */
exports.getProfile = (req, res) => {
  clientQuery.getClientById(req.user.client_id)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

/**
 * GET /api/clients/
 * Create endpoint /api/clients/ for GET update profile
 */
exports.updateProfile = (req, res, next) => {
  clientQuery.updateClient(req.user.client_id, req.body)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

exports.changePassword = (req, res) => {
  UserQuery.updatePassword(req.user.id, req.body)
    .then(function(response) {
      res.send(response);
    })
    .catch((err) => {
      res.status(400).send(err);
    });

};