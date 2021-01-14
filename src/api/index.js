const router = require('express').Router();

const accountsRouter = require('./accounts');
const authRouter = require('./auth');

router.use('/account', accountsRouter); // Account
router.use('/auth', authRouter); // Authentication

module.exports = router;
