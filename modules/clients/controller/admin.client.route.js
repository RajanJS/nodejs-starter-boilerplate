const express = require('express');
const router = express.Router();
const cors = require('cors');
const authentication = require('../../../middlewares/authentication');
const authorization = require('../../../middlewares/authorization');
/**
 * API auth configuration.
 */
router.use(cors());
const clientController = require('./client.controller');

router.post('/', authentication, authorization, clientController.postClients);
router.get('/', authentication, authorization, clientController.getClients);
router.get('/:client_id', authentication, clientController.getClientById);
router.delete('/:client_id', authentication, authorization, clientController.deleteClient);
router.put('/:client_id', authentication, clientController.updateClient);
router.post('/add-credentilas', authentication, authorization, clientController.createCredentials);

module.exports = router;