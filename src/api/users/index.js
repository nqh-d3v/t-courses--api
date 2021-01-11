const router = require('express').Router();
const userCtl = require('./user.controller');
const { checkPermission } = require('../auth/auth.permission');
const auth = require('../auth/passport.strategy')();

router.use(auth.authenticateJWT);

router.get('/', checkPermission(['admin']), userCtl.getUsers);

router.get('/me', checkPermission(['user']), userCtl.getMyInfo);
router.post('/me', checkPermission(['user']), userCtl.updateMyInfo);

router.get('/search', checkPermission(['*']), userCtl.findUsr);

router.get('/:id', checkPermission(['*']), userCtl.getUser);
router.post('/:id', checkPermission(['admin']), userCtl.toggleLock); 


module.exports = router;
