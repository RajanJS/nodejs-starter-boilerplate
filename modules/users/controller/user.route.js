const express = require('express');
const router = express.Router();
const cors = require('cors');
const authentication = require('../../../middlewares/authentication');
const authorization = require('../../../middlewares/authorization');
/**
 * API auth configuration.
 */
router.use(cors());
const userController = require('./user.controller');

router.post('/', userController.postUsers);
router.get('/', authentication, authorization, userController.getUsers);
router.get('/:user_id', authentication, authorization, userController.getUserById);
router.delete('/:user_id', authentication, authorization, userController.deleteUser);
router.put('/:user_id', authentication, authorization, userController.updatePassword);

module.exports = router;
