const userSrv = require('./user.service');

module.exports = {
  getUser: async function (req, res, next) {
    try {
      const info = await userSrv.getUserById(req.params.id);

      res.json(info);
    } catch (err) {
      next(err);
    }
  },
  findUsr: async function (req, res, next) {
    try {
      const allDTO = await userSrv.findByQuery(req.query.s || '_', req.query.diff || '');
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  // for ADMIN only
  getUsers: async function (req, res, next) {
    try {
      const all = await userSrv.getAllUser();

      res.json(all);
    } catch (err) {
      next(err);
    }
  },
  toggleLock: async function (req, res, next) {
    try {
      const status = await userSrv.toggleLock(req.params.id);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },

  // for USER only
  getMyInfo: async function (req, res, next) {
    try {
      const info = await userSrv.getUserById(req.user.id);
      res.json(info);
    } catch (err) {
      next(err);
    }
  },
  updateMyInfo: async function (req, res, next) {
    try {
      const updated = await userSrv.updateUser(req.user.id, req.body);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
