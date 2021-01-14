const router = require('express').Router();
const authCtl = require('./auth.controller');
const { validateLogin, validateLogup, validateOptions } = require('./auth.validate');

router.post('/local/valid', validateLogin, authCtl.loginLocal);
router.post('/local/create', validateLogup, authCtl.createAccount);

module.exports = router;
