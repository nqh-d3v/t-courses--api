const courseSrv = require('./course.service');
const sendMail = require('../../common/email/send');
const userSrv = require('../users/user.service');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

const roleMap = {
  'admin': 'Quản lý',
  'mentor': 'Người hướng dẫn',
  'member': 'Học viên',
  'user': 'Người dùng',
};
const statusMap = {
  'wait-pay': 'Đang chờ thanh toán để có thể tham gia khóa học',
  'accepted': 'Đã tham gia khóa học',
  'black': 'Bị cấm truy cập khóa học',
}

module.exports = {
  // === for COURSE ====================
  newCourse: async function (req, res, next) {
    try {
      const { isPrivate } = req.body;
      console.log(isPrivate);
      const createDTO = await courseSrv.create(req.body, isPrivate);
      if (createDTO) await courseSrv.newLink(createDTO.id, req.user.id, 'accepted', 'admin');
      res.json(createDTO);
    } catch (error) {
      next(error);
    }
  },
  allCourses: async function (req, res, next) {
    try {
      const options = {
        all: true,
        query: '',
      };
      if (req.query.only_me) options.all = false;
      if (req.query.query && req.query.query.trim().length > 0) options.search = req.query.query.trim();
      const allDTO = await courseSrv.getAll(req.user.id, req.user.role, options);
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  infoCourseById: async function (req, res, next) {
    try {
      const infoDTO = await courseSrv.getInfo(req.user.id, req.user.role, req.params.id);
      if (infoDTO) {
        infoDTO.isPrivate = infoDTO.code_access !== '';
        delete infoDTO.code_access;
      }
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  updateCourse: async function (req, res, next) {
    try {
      console.log(req.body);
      const updateDTO = await courseSrv.update(req.user.id, req.params.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  deleteCourse: async function (req, res, next) {
    try {
      const deleteDTO = await courseSrv.delete(req.user.id, req.params.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },
  active: async function (req, res, next) {
    try {
      const activeDTO = await courseSrv.active(req.params.id);
      res.json(activeDTO);
    } catch (error) {
      next(error);
    }
  },
  toggleLock: async function (req, res, next) {
    try {
      const toggleDTO = await courseSrv.toggleLock(req.params.id);
      res.json(toggleDTO);
    } catch (error) {
      next(error);
    }
  },
  invite: async function (req, res, next) {
    try {
      const courseInfo = await courseSrv.getInfo(req.user.id, req.user.role, req.params.id);
      if (!courseInfo || courseInfo.role !== 'admin') {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Khóa học này không tồn tại (hoặc bạn không là quản lý của khóa học).',
          true,
        );
      }
      if (courseInfo.code_access === '') {
        return next(
          new AppError(
            httpStatus.NOT_ACCEPTABLE,
            'Khóa học đang ở chế độ public',
            true,
          )
        );
      }
      const userInfo = await userSrv.getUserById(req.body.userId);
      if (!userInfo) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Người dùng này không tồn tại (hoặc đã bị khóa tài khoản)',
          true,
        );
      }
      const userInCourse = await courseSrv.getUserInCourse(req.body.userId, req.user.role, req.params.id);
      if (userInCourse) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Người dùng này đã tồn tại trong khóa học với tư cách là "${roleMap[userInCourse.role]}" trong trạng thái "${statusMap[userInCourse.status]}"`,
          true,
        )
      }
      const iv = Buffer.from(`${userInfo.id}${process.env.COURSE_IV_SECRET || '85406589312188233897727779456661'}`.toString().slice(0, 32), 'hex');
      const tokenAccess = courseSrv.createTokenAccess(iv, `${courseInfo.code_access !== '' ? courseInfo.code_access : '___' }@${req.body.role || 'member'}`);
      console.log(`Create token access for user with id["${userInfo.id}"]: "${tokenAccess}"`);
      // send email to user
      const infoMail = await sendMail({address: userInfo.username, name: userInfo.name}, 'invite-course-text', {token: tokenAccess});
      console.log(infoMail);
      res.json(true);
    } catch (error) {
      next(error);
    }
  },
  join: async function (req, res, next) {
    try {
      if (!req.query.token && !req.query.course) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Không đủ dữ liệu để thực hiện thao tác',
          true,
        )
      }
      let info;
      if (req.query.token) {
        const iv = Buffer.from(`${req.user.id}${process.env.COURSE_IV_SECRET || '85406589312188233897727779456661'}`.toString().slice(0, 32), 'hex')
        info = await courseSrv.getTokenAccess(iv, req.query.token || '');
        info.status = 'accepted';
        info.token = true;
      } else if (req.query.course) {
        info = {id: req.query.course, role: 'member', status: 'accepted'};
      }
      console.log(info);
      const courseInfo = await courseSrv.getInfoById(info.id);
      if (!courseInfo) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Khóa học không tồn tại (hoặc đã bị khóa).',
          true,
        )
      }
      const userInCourse = await courseSrv.getUserInCourse(req.user.id, req.user.role, info.id);
      if (userInCourse) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `${
            userInCourse.status === 'black'
              ? 'Bạn đã bị cấm tham gia khóa học này'
              : `Bạn đang tham gia khóa học này với tư cách là "${roleMap[userInCourse.role]}" trong trạng thái "${statusMap[userInCourse.status]}"`
          }`,
          true,
        )
      }
      if (courseInfo.codeAccess !== '' && !info.token) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bạn cần mã truy cập để có thể tham gia khóa học này',
          true,
        )
      }
      if (courseInfo.codeAccess !== '' && courseInfo.price !== 0) info.status = 'wait-pay'; 
      const infoDTO = await courseSrv.newLink(info.id, req.user.id, info.status, info.role);
      return res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  out: async function (req, res, next) {
    try {
      const info = await courseSrv.getInfo(req.user.id, req.user.role, req.params.id);
      if (!info) {
        return next(
          new AppError(
            httpStatus.NOT_FOUND,
            'Không tìm thấy khóa học',
            true
          )
        );
      }
      if (info.role === 'admin' && info.adms === 1) {
        return next(
          new AppError(
            httpStatus.METHOD_NOT_ALLOWED,
            'Chỉ còn 1 admin, tối thiểu 2 admin để có thể rời khóa học',
            true,
          )
        )
      }
      const outDTO = await courseSrv.deleteLink(req.params.id, req.user.id);
      res.json(outDTO);
    } catch (error) {
      next(error);
    }
  },
  // === for USER of COURSE ===========
  allUsersOfCourse: async function (req, res, next) {
    try {
      const role = (['admin', 'mentor', 'member'].includes(req.query.type) && req.query.type) || null;
      const all = await courseSrv.getAccountsOfCourse(req.params.id, role);
      res.json(all);
    } catch (error) {
      next(error);
    }
  },
  addUserCourse: async function (req, res, next) {
    try {
      if (!req.body.uid) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Người dùng không xác định',
            true,
          )
        );
      }
      const courseInfo = await courseSrv.getInfo(req.user.id, req.user.role, req.params.id);
      if (!courseInfo || courseInfo.role !== 'admin') {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Khóa học này không tồn tại (hoặc bạn không là quản lý của khóa học).',
          true,
        );
      }
      const userInfo = await userSrv.getUserById(req.body.uid);
      if (!userInfo) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Người dùng này không tồn tại (hoặc đã bị khóa tài khoản)',
          true,
        );
      }
      const userInCourse = await courseSrv.getUserInCourse(req.body.uid, req.user.role, req.params.id);
      if (userInCourse) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Người dùng này đã tồn tại trong khóa học với tư cách là "${roleMap[userInCourse.role]}" trong trạng thái "${statusMap[userInCourse.status]}"`,
          true,
        )
      }
      const addDTO = await courseSrv.newLink(req.params.id, req.body.uid, 'accepted', 'member');
      addDTO.dataValues.name = userInfo.name;
      res.json(addDTO);
    } catch (error) {
      next(error);
    }
  },
  updateUserRole: async function (req, res, next) {
    try {
      if (req.user.id.toString() === req.body.user.toString()) {
        return next(
          new AppError(
            httpStatus.METHOD_NOT_ALLOWED,
            'Bạn không thể thay đổi thông tin của chính mình',
            true,
          )
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, 'user', req.params.id);
      const usr = await courseSrv.getUserInCourse(req.body.user, 'user', req.params.id);
      if (!me || me.role !== 'admin') {
        return next(
          new AppError(
            httpStatus.FORBIDDEN,
            'Chỉ có quản lý khóa học mới có quyền thực hiện thao tác này',
            true,
          )
        );
      }
      if (!usr) {
        return next(
          new AppError(
            httpStatus.NOT_FOUND,
            'Không tim thấy thông tin người dùng này trong khóa học! Bạn có chắc đây là thành viên của khóa học?',
            true,
          )
        );
      }
      const {role} = req.body; 
      const updateDTO = await courseSrv.updateLink(req.params.id, req.body.user, {role});
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  // === for LESSION ==================
  newLession: async function (req, res, next) {
    try {
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, req.params.id);
      if (!me || !['admin', 'mentor'].includes(me.role) || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản trị và người hướng dẫn của khóa học mới có thể thêm bài học.',
          true,
        )
      }
      const newDTO = await courseSrv.createLs(req.params.id, req.body);
      res.json(newDTO);
    } catch (error) {
      next(error);
    }
  },
  allLession: async function (req, res, next) {
    try {
      // return to only id and name of lession
      const allDTO = await courseSrv.allLsOfCourse(req.params.id);
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  infoLession: async function (req, res, next) {
    try {
      const ls = await courseSrv.getLessionById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài học không tồn tại',
          true,
        );
      }
      let me;
      if (req.user.role === 'user') {
        me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.courseId);
        if (!me || me.status !== 'accepted') {
          throw new AppError(
            httpStatus.FORBIDDEN,
            'Bạn cần tham gia khóa học để có thể xem bài học.',
            true,
          )
        }
      }
      const infoDTO = await courseSrv.infoLs(req.params.id);
      infoDTO.dataValues.role = req.user.role === 'user' ? me.role : '';
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  updateLession: async function (req, res, next) {
    try {
      const ls = await courseSrv.getLessionById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài học không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.courseId);
      if (!me || !['admin', 'mentor'].includes(me.role) || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản trị và người hướng dẫn của khóa học mới có thể sửa nội dung bài học.',
          true,
        )
      }
      const updateDTO = await courseSrv.updateLs(req.params.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  deleteLession: async function (req, res, next) {
    try {
      const ls = await courseSrv.getLessionById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài học không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.courseId);
      if (!me || !['admin', 'mentor'].includes(me.role) || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản trị và người hướng dẫn của khóa học mới có thể xóa bài học.',
          true,
        )
      }
      const deleteDTO = await courseSrv.deleteLs(req.params.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },

  // === for EXERCISE =================
  newExercise: async function (req, res, next) {
    try {
      const ls = await courseSrv.getLessionById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài học không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.courseId);
      if (!me || !['admin', 'mentor'].includes(me.role) || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản trị và người hướng dẫn của khóa học mới có thể thêm bài tập.',
          true,
        )
      }
      await courseSrv.infoLs(req.quer)
      const newDTO = await courseSrv.createEx(req.params.id, req.body);
      res.json(newDTO);
    } catch (error) {
      next(error);
    }
  },
  allExercise: async function (req, res, next) {
    try {
      const ls = await courseSrv.getLessionById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài học không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.courseId);
      if (!me || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Bạn cần tham gia khóa học để xem nội dung bài tập.',
          true,
        )
      }
      const allDTO = await courseSrv.allExOfLs(req.params.id);
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  infoExercise: async function (req, res, next) {
    try {
      const ls = await courseSrv.getFullExerciseInfoById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài tập không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.course);
      if (!me || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Bạn cần tham gia khóa học để xem nội dung bài tập này.',
          true,
        )
      }
      const infoDTO = await courseSrv.infoEx(req.params.id, req.user.id);
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  updateExercise: async function (req, res, next) {
    try {
      const ls = await courseSrv.getFullExerciseInfoById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài tập không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.course);
      if (!me || !['admin', 'mentor'].includes(me.role) || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản trị hoặc người hướng dẫn của khóa mới có thể chỉnh sửa nội dung bài tập.',
          true,
        )
      }
      const updateDTO = await courseSrv.updateEx(req.params.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  deleteExercise: async function (req, res, next) {
    try {
      const ls = await courseSrv.getFullExerciseInfoById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài tập không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.course);
      if (!me || !['admin', 'mentor'].includes(me.role) || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản trị hoặc người hướng dẫn của khóa mới có thể xóa bài tập.',
          true,
        )
      }
      const deleteDTO = await courseSrv.deleteEx(req.params.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },

  // === for SUBMIT ==================
  allSubmitsOfExercise: async function (req, res, next) {
    try {
      const info = await courseSrv.getFullExerciseInfoById(req.params.id);
      if (!info) {
        return next( new AppError(
          httpStatus.NOT_FOUND,
          'Không tìm thấy gì cả',
          true,
        ));
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, info.course);
      if (!me || me.role === 'member') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản lý và mentor của khóa học mới có thể xem bài làm học viên.',
          true,
        )
      }
      const allDTO = await courseSrv.allSbOfEx(info.course, req.params.id);
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  mySubmitOfExercise: async function (req, res, next) {
    try {
      const infoDTO = await courseSrv.infoSb(req.params.id, req.user.id);
      
      if (infoDTO) {
        delete infoDTO.dataValues.content;
        delete infoDTO.dataValues.other;
        delete infoDTO.dataValues.userId;
      }
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  newSubmit: async function (req, res, next) {
    try {
      console.log(req.body);
      const ls = await courseSrv.getFullExerciseInfoById(req.params.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Bài tập không tồn tại',
          true,
        );
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, ls.course);
      if (!me || me.role !== 'member' || me.status !== 'accepted') {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có học viên của khóa học mới có thể nộp bài.',
          true,
        )
      }
      const status = await courseSrv.infoSb(req.params.id, req.user.id);
      if (status) {
        throw new AppError(
          httpStatus.CONFLICT,
          'Bạn đã nộp bài tập này!',
          true,
        );
      }
      if (ls.isHaveDeadline && Date.now() - Date.parse(ls.deadline) > 0) {
        throw new AppError(
          httpStatus.NOT_ACCEPTABLE,
          'Bạn đã quá hạn nộp bài tập này',
          true,
        );
      }
      const newDTO = await courseSrv.createSb(req.user.id, req.params.id, req.body);
      res.json(newDTO);
    } catch (error) {
      next(error);
    }
  },
  infoSubmit: async function (req, res, next) {
    try {
      const ls = await courseSrv.getFullSubmitInfoById(req.params.id, req.user.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Không tìm thấy thông tin nộp bài của bạn.',
          true,
        );
      }
      const infoDTO = await courseSrv.infoSb(ls.exercise, req.user.id);
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  updateSubmit: async function (req, res, next) {
    try {
      const ls = await courseSrv.getFullSubmitInfoById(req.params.id, req.user.id);
      if (!ls) {
        throw new AppError(
          httpStatus.METHOD_NOT_ALLOWED,
          'Không tìm thấy thông tin nộp bài của bạn.',
          true,
        );
      }
      const updateDTO = await courseSrv.updateSb(req.params.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  markSubmit: async function (req, res, next) {
    try {
      const info = await courseSrv.getFullExerciseInfoById(req.params.id);
      if (!info) {
        return next( new AppError(
          httpStatus.NOT_FOUND,
          'Không tìm thấy gì cả',
          true,
        ));
      }
      const me = await courseSrv.getUserInCourse(req.user.id, req.user.role, info.course);
      if (!me || me.role === 'member' || me.status !== 'accepted') {
        return next( new AppError(
          httpStatus.FORBIDDEN,
          'Chỉ có quản lý và mentor khóa học mới có thể làm việc này',
          true,
        ));
      }
      const { uid, ...mark} = req.body;
      const markDTO = await courseSrv.markSb(req.params.id, uid, mark, req.user.id);
      res.json(markDTO);
    } catch (error) {
      next(error);
    }
  },
  deleteSubmit: async function (req, res, next) {
    try {
      const ls = await courseSrv.getFullSubmitInfoById(req.params.id, req.user.id);
      if (!ls) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Không tìm thấy thông tin nộp bài cần xóa.',
          true,
        );
      }
      const deleteDTO = await courseSrv.deleteSb(req.params.id, req.user.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },

  // Support
  allBody: function (req, res, next) {
    console.log(`Body: ${JSON.stringify(req.body)}`);
    next()
  }
};
