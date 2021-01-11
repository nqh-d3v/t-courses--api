const router = require('express').Router();
const authCtl = require('./auth.controller');
const { validateLogin, validateAdminLogin, validateLogup, validateOptions } = require('./auth.validate');

router.post('/admin', validateAdminLogin, authCtl.loginAdmin);
router.post('/login', validateLogin, authCtl.login);
router.post('/logup', validateLogup, authCtl.logup);

router.post('/forget-password', validateOptions, authCtl.forgetPass);

module.exports = router;
