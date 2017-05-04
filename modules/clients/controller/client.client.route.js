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

router.get('/', authentication, clientController.getProfile);
router.put('/', authentication, clientController.updateProfile);
router.post('/changePassword', authentication, clientController.changePassword);

module.exports = router;