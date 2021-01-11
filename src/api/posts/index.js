const router = require('express').Router();
const postCtl = require('./post.controller');
const { checkPermission } = require('../auth/auth.permission');
const {
  validateContent,
  validateReaction,
} = require('./post.validate');
const auth = require('../auth/passport.strategy')();

router.use(auth.authenticateJWT);

router.get('/', checkPermission(['*']), postCtl.allPost);
router.post('/', checkPermission(['user']), validateContent, postCtl.newPost);

router.get('/:id', checkPermission(['*']), postCtl.infoPost);
router.put('/:id', checkPermission(['admin']), postCtl.toggleLockPost);
router.post('/:id', checkPermission(['user']), validateContent, postCtl.updatePost);
router.patch('/:id', checkPermission(['*']), postCtl.toggleLockCmtPost);
router.delete('/:id', checkPermission(['user']), postCtl.deletePost);

// ================= COMMENT ===========================
router.get('/:id/comments', checkPermission(['*']), postCtl.allComment);
router.post('/:id/comments', checkPermission(['user']), validateContent, postCtl.newComment);

router.post('/:id/comment', checkPermission(['user']), validateContent, postCtl.updateComment);
router.delete('/:id/comment', checkPermission(['user']), postCtl.deleteComment);

// ================= REACTION ==========================
router.get('/:id/reaction', checkPermission(['*']), postCtl.infoReaction);
router.post('/:id/reaction', checkPermission(['user']), validateReaction, postCtl.toggleReaction);

module.exports = router;
