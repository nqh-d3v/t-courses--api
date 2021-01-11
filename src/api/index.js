const router = require('express').Router();

const adminRouter = require('./admins');
const userRouter = require('./users');
const authRouter = require('./auth');
const postRouter = require('./posts');
const courseRouter = require('./courses');


router.use('/admin', adminRouter); // Admins
router.use('/user', userRouter); // Users
router.use('/auth', authRouter); // Authentication
router.use('/post', postRouter); // Ideas
router.use('/course', courseRouter); // Courses

module.exports = router;
