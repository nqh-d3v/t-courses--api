/* eslint-disable camelcase */
const models = require('../../models');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

module.exports = {
    // ----- functions below will be called by passport -----
    create: async function (profile) {
        const { username, password, name } = profile;
        const check = await models.admin.findOne({ username });
        if (check) {
            throw new AppError(
                httpStatus.CONFLICT,
                'Tên đăng nhập này đã được sử dụng',
                true,
            );
        }
        const newAdmin = await models.admin.create({
            username,
            password,
            name,
            email: profile.email || '',
            role: 'admin',
        });
        return newAdmin;
    },
    getAll: async function () {
        const all = await models.admin.findAll({attributes: ['id', 'username', 'name', 'email', 'isLock', 'createdAt', 'updatedAt', 'role']});
        return all;
    },
    getAdminById: async function (id) {
        const info = await models.admin.findByPk(id);
        if (!info) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Tài khoản không tồn tại',
                true,
            );
        }
        delete info.dataValues.password;
        return info;
    },
    updateInfoById: async function (id, updateDTO) {
        const updated = await models.admin.findByPk(id);
        if (!updated) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Tài khoản không tồn tại',
                true,
            );
        }
        updated.name = updateDTO.name;
        updated.email = updateDTO.email;
        await updated.save();
        delete updated.dataValues.password;
        return updated;
    },
    updatePasswod: async function (id, updateDTO) {
        const updated = await models.admin.findByPk(id);
        if (!updated) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Tài khoản không tồn tại',
                true,
            );
        }
        if (!updated.validPassword(updateDTO.oldPwd)) {
            throw new AppError(
                httpStatus.NOT_ACCEPTABLE,
                'Mật khẩu cũ không chính xác',
                true,
            );
        }
        updated.password = updateDTO.newPwd;
        await updated.save();
        delete updated.dataValues.password;
        return updated;
    },
    toggleLock: async function (id) {
        const locked = await models.admin.findByPk(id);
        if (!locked) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Tài khoản không tồn tại',
                true,
            );
        }
        locked.isLock = !locked.isLock;
        await locked.save();
        delete locked.dataValues.password;
        return locked;
    },
    deleteById: async function (id) {
        const destroyed = await models.admin.findByPk(id);
        if (!destroyed) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                'Tài khoản không tồn tại',
                true,
            );
        }
        await destroyed.destroy();
        delete destroyed.dataValues.password;
        return destroyed;
    } 
};
