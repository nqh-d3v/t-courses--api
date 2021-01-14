/* eslint-disable camelcase */
const models = require('../../models');
const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

module.exports = {
	create: async function (profile) {
		const check = await models.user.findOne({ where: { username: profile.username }});
		if (check) {
			throw new AppError(
				httpStatus.CONFLICT,
				'Tên đăng nhập đã được sử dụng',
				true,
			);
		}
		const newUser = await models.user.create({
			username: profile.username,
			password: profile.password,
			name: profile.name,
			role: 'user',
		});

		delete newUser.dataValues.password;
		return newUser;
	},
	getAllUser: async function () {
		const all = await models.user.findAll();
		return all;
	},
	getUserById: async function (id) {
		const info = await models.user.findOne({where: { id, isLock: false }});
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
	getUserByUsername: async function (username) {
		const info = await models.user.findOne({where: { username, isLock: false }});
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
	updateUser: async function (id, updateDTO) {
		const updateInfo = await models.user.findByPk(id);
		if (!updateInfo) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				'Tài khoản không tồn tại',
				true,
			);
		}
		updateInfo.name = updateDTO.name;
		await updateInfo.save();
		delete updateInfo.dataValues.password;
		return updateInfo;
	},
	active: async function (id) {
		const actived = await models.user.findByPk(id);
		if (!actived) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				'Tài khoản không tồn tại',
				true,
			);
		}
		actived.isActive = true;
		await actived.save();
		delete actived.dataValues.password;
		return actived;
	},
	toggleLock: async function (id) {
		const locked = await models.user.findByPk(id);
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

	// -------------- SUPPORT -----------------
	findByQuery: async function (s, d = '') {
		const listId = d.includes('_') ? d.trim().split('_').join(', ') : `${ d.trim().length > 0 ? d : '' }`;
		const sqlCmd = `SELECT users.id, users.name FROM users WHERE (users.name LIKE '%${s}%' OR users.username LIKE '%${s}%') ${listId !== '' ? `AND users.id NOT IN (${listId})` : ''}`;
		const resultCmd = await models.sequelize.query(sqlCmd, {
				type: models.sequelize.QueryTypes.SELECT,
		});
		return resultCmd;
	}
};
