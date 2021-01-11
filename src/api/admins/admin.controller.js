const adminSrv = require('./admin.service');

module.exports = {
  createOne: async function (req, res, next) {
    try {
      const info = await adminSrv.create(req.body);
      res.json(info);
    } catch (error) {
      next(error);
    }
  },
  getAdmins: async function (req, res, next) {
    try {
      const all = await adminSrv.getAll();
      res.json(all);
    } catch (error) {
      next(error);
    }
  },
  getAdmin: async function (req, res, next) {
    try {
      const info = await adminSrv.getAdminById(req.params.id);
      res.json(info);
    } catch (error) {
      next(error);
    }
  },
  getMyInfo: async function (req, res, next) {
    try {
      const info = await adminSrv.getAdminById(req.user.id);
      res.json(info);
    } catch (error) {
      next(error);
    }
  },
  update: async function (req, res, next) {
    try {
      const updateDTO = await adminSrv.updateInfoById(req.user.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  updatePassword: async function (req, res, next) {
    try {
      const updateDTO = await adminSrv.updatePasswod(req.user.id, req.body);
      res.json(updateDTO);
    } catch (error) {
      next(error);
    }
  },
  delete: async function (req, res, next) {
    try {
      const deleteDTO = await adminSrv.deleteById(req.params.id);
      res.json(deleteDTO);
    } catch (error) {
      next(error);
    }
  },
};
