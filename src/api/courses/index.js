const router = require('express').Router();

const courseCtl = require('./course.controller');
const { checkPermission } = require('../auth/auth.permission');
const {
  validateCourse,
  validateNewCourse,
  validateCourseInvite,
  validateChangeUserRole,
  validateLession,
  validateExercise,
  validateSubmit,
  validateMark,
} = require('./course.validate');
const auth = require('../auth/passport.strategy')();

router.use(auth.authenticateJWT);

// -- for COURSE ---------------------
router.get('/', checkPermission(['*']), courseCtl.allCourses);
router.post('/', checkPermission(['user']), validateNewCourse, courseCtl.newCourse);

router.post('/join', checkPermission(['user']), courseCtl.join);

router.get('/:id', checkPermission(['*']), courseCtl.infoCourseById);
router.put('/:id', checkPermission(['admin']), courseCtl.active);
router.post('/:id', checkPermission(['user']), validateCourse, courseCtl.updateCourse);
router.patch('/:id', checkPermission(['admin']), courseCtl.toggleLock);
router.delete('/:id', checkPermission(['user']), courseCtl.deleteCourse);

router.post('/:id/invite', checkPermission(['user']), validateCourseInvite, courseCtl.invite);
router.post('/:id/out', checkPermission(['user']), courseCtl.out);

// -- for ACCOUNT OF COURSE
router.get('/:id/users', checkPermission(['*']), courseCtl.allUsersOfCourse);
router.put('/:id/users', checkPermission(['user']), courseCtl.addUserCourse);
router.post('/:id/users', checkPermission(['user']), validateChangeUserRole, courseCtl.updateUserRole);

// -- for LESSION --------------------
router.get('/:id/lessions', checkPermission(['*']), courseCtl.allLession);
router.post('/:id/lessions', checkPermission(['user']), validateLession, courseCtl.newLession);

router.get('/l/:id', checkPermission(['*']), courseCtl.infoLession);
router.post('/l/:id', checkPermission(['user']), validateLession, courseCtl.updateLession);
router.delete('/l/:id', checkPermission(['user']), courseCtl.deleteLession);

// -- for EXERCISE -------------------
router.get('/l/:id/exercises', checkPermission(['*']), courseCtl.allExercise);
router.post('/l/:id/exercises', checkPermission(['user']), validateExercise, courseCtl.newExercise);

router.get('/e/:id', checkPermission(['*']), courseCtl.infoExercise);
router.post('/e/:id', checkPermission(['user']), validateExercise, courseCtl.updateExercise);
router.delete('/e/:id', checkPermission(['user']), courseCtl.deleteExercise);

// -- for SUBMIT ---------------------
router.get('/e/:id/submit', checkPermission(['user']), courseCtl.allSubmitsOfExercise);
router.get('/e/:id/my-submit', checkPermission(['user']), courseCtl.mySubmitOfExercise);
router.post('/e/:id/submit', checkPermission(['user']), validateSubmit, courseCtl.newSubmit);

router.get('/s/:id', checkPermission(['*']), courseCtl.infoSubmit);
router.post('/s/:id', checkPermission(['user']), courseCtl.updateSubmit);
router.patch('/s/:id', checkPermission(['user']), validateMark, courseCtl.markSubmit); // id: id of exercise not submit
router.delete('/s/:id', checkPermission(['user']), courseCtl.deleteSubmit);

module.exports = router;
