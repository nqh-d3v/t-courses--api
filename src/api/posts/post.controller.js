const postSrv = require('./post.service');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

module.exports = {
  // === for POST =========================
  newPost: async function (req, res, next) {
    try {
      if (req.body.tags) {
        const tagStr = req.body.tags.trim();
        req.body.tags = tagStr.length === 0 
          ? ''
          : `${tagStr.includes(' ') ? tagStr.split(' ').join('\t') : tagStr}`;
      }
      const createDTO = await postSrv.createPs(req.user.id, req.body);
      res.json(createDTO);
    } catch (error) {
      next(error);
    }
  },
  allPost: async function (req, res, next) {
    const options = {};
    try {
      if (req.query.sort_auth === 'me') {
        options.auth = req.user.id;
      }
      const allDTO = await postSrv.allPs(req.user.role, req.user.id, options);
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  infoPost: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const infoDTO = await postSrv.infoPs(req.params.id, req.user.role, req.user.id);
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  },
  updatePost: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const updateDTO = await postSrv.updatePs(req.params.id, req.user.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  toggleLockPost: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const toggleDTO = await postSrv.toggleLockPs(req.params.id);
      res.json(toggleDTO);
    } catch (error) {
      next(error);
    }
  },
  toggleLockCmtPost: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const toggleDTO = await postSrv.toggleLockCmtPs(req.params.id, req.user.id, req.user.role);
      res.json(toggleDTO);
    } catch (error) {
      next(error);
    }
  },
  deletePost: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const deleteDTO = await postSrv.deletePs(req.params.id, req.user.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },

  // === for COMMENT ======================
  newComment: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const content = req.body.content && req.body.content.trim() || '';
      if (content === '') {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Nội dung bình luận không được để trống',
          true,
        );
      }
      const post = await postSrv.infoPs(req.params.id, req.user.role, req.user.id);
      if (!post) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Bài viết không tồn tại (hoặc đã bị khóa).',
          true,
        );
      }
      const createDTO = await postSrv.createCmt(req.params.id, req.user.id, content);
      res.json(createDTO);
    } catch (error) {
      next(error);
    }
  },
  allComment: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const post = await postSrv.infoPs(req.params.id, req.user.role, req.user.id);
      if (!post) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Bài viết không tồn tại (hoặc đã bị khóa).',
          true,
        );
      }
      const allDTO = await postSrv.allCmt(req.params.id, req.user.id, req.query.limit || -1);
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  updateComment: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const check = await postSrv.checkPostWithCommentId(req.params.id);
      if (!check) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Bài viết không tồn tại (hoặc đã bị khóa).',
          true,
        );
      }
      const content = req.body.comment && req.body.comment.trim() || '';
      const updateDTO = await postSrv.updateCmt(req.params.id || 0, req.user.id, content);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  deleteComment: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const check = await postSrv.checkPostWithCommentId(req.params.id);
      if (!check) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Bài viết không tồn tại (hoặc đã bị khóa).',
          true,
        );
      }
      const deleteDTO = await postSrv.deleteCmt(req.params.id || 0, req.user.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },

  // === for REACTION ====================
  toggleReaction: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const post = await postSrv.infoPs(req.params.id, req.user.role, req.user.id);
      if (!post) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Bài viết không tồn tại (hoặc đã bị khóa).',
          true,
        );
      }
      const toggleDTO = await postSrv.toggleRc(req.params.id, req.user.id, req.query.type || 'like');
      res.json(toggleDTO);
    } catch (error) {
      next(error);
    }
  },
  infoReaction: async function (req, res, next) {
    try {
      if(!(req.params.id > 0)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'ID không hợp lệ',
          true,
        )
      }
      const check = await postSrv.infoPs(req.params.id, req.user.role);
      if (!check) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Bài viết không tồn tại (hoặc đã bị khóa).',
          true,
        );
      }
      const infoDTO = await postSrv.infoRc(req.params.id, req.query.type || '*');
      res.json(infoDTO);
    } catch (error) {
      next(error);
    }
  }
};
