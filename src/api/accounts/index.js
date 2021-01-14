const router = require('express').Router();
const accountCtl = require('./account.controller');
const { checkPermission } = require('../auth/auth.permission');
const auth = require('../auth/passport.strategy')();

router.use(auth.authenticateJWT);

router.get('/', checkPermission(['admin']), accountCtl.getUsers);

router.get('/me', checkPermission(['user']), accountCtl.getMyInfo);
router.post('/me', checkPermission(['user']), accountCtl.updateMyInfo);

router.get('/search', checkPermission(['*']), accountCtl.findUsr);

router.get('/:id', checkPermission(['*']), accountCtl.getUser);
router.post('/:id', checkPermission(['admin']), accountCtl.toggleLock); 


module.exports = router;
