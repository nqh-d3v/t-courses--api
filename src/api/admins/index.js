const router = require('express').Router();
const adminCtl = require('./admin.controller');
const { checkPermission } = require('../auth/auth.permission');
const { validateCreate, validateUpdateInfo, validateUpdatePassword } = require('./admin.validate');
const auth = require('../auth/passport.strategy')();

router.use(auth.authenticateJWT);
router.use(checkPermission(['admin']));

router.get('/', adminCtl.getAdmins);
router.post('/', validateCreate, adminCtl.createOne);

router.get('/me', adminCtl.getMyInfo);
router.post('/me', validateUpdateInfo, adminCtl.update);
router.patch('/me', validateUpdatePassword, adminCtl.updatePassword);

router.get('/:id', adminCtl.getAdmin);
router.delete('/:id', adminCtl.delete);


module.exports = router;
