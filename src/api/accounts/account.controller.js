const accountSrv = require('./account.service');

module.exports = {
  getUser: async function (req, res, next) {
    try {
      const info = await accountSrv.getUserById(req.params.id);

      res.json(info);
    } catch (err) {
      next(err);
    }
  },
  findUsr: async function (req, res, next) {
    try {
      const allDTO = await accountSrv.findByQuery(req.query.s || '_', req.query.diff || '');
      res.json(allDTO);
    } catch (error) {
      next(error);
    }
  },
  // for ADMIN only
  getUsers: async function (req, res, next) {
    try {
      const all = await accountSrv.getAllUser();

      res.json(all);
    } catch (err) {
      next(err);
    }
  },
  toggleLock: async function (req, res, next) {
    try {
      const status = await accountSrv.toggleLock(req.params.id);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },

  // for USER only
  getMyInfo: async function (req, res, next) {
    try {
      const info = await accountSrv.getUserById(req.user.id);
      res.json(info);
    } catch (err) {
      next(err);
    }
  },
  updateMyInfo: async function (req, res, next) {
    try {
      const updated = await accountSrv.updateUser(req.user.id, req.body);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
