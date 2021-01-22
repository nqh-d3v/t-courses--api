/* eslint-disable camelcase */
const models = require('../../models');
const { Op } = require("sequelize");

const AppError = require('../../common/error/error');
const { httpStatus } = require('../../common/error/http-status');

module.exports = {
	create: async function (profile) {
		const { username, password, name, email } = profile;
		const check = await models.account.findOne({
			where: {[Op.or] : [{ username }, { email }]}
		});
		if (check) {
			throw new AppError(
				httpStatus.CONFLICT,
				'Accountname or email already used',
				true,
			);
		}
		const newAccount = await models.account.create({ username, password, name, email });

		delete newAccount.dataValues.password;
		return newAccount;
	},
	getAllAccount: async function () {
		const all = await models.account.findAll();
		return all;
	},
	getAccountById: async function (id) {
		const info = await models.account.findOne({where: { id, isLock: false }});
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
	updateAccount: async function (id, updateDTO) {
		const updateInfo = await models.account.findByPk(id);
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
		const actived = await models.account.findByPk(id);
		if (!actived) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				'Tài khoản không tồn tại',
				true,
			);
		}
		if (actived.isActive) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'Tài khoản đã kích hoạt trước đó',
				true,
			);
		}
		if (actived.isLock) {
			throw new AppError(
				httpStatus.METHOD_NOT_ALLOWED,
				'Tài khoản đã bị khóa',
				true,
			);
		}
		actived.isActive = true;
		await actived.save();
		delete actived.dataValues.password;
		return actived;
	},
	toggleLock: async function (id) {
		const locked = await models.account.findByPk(id);
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
};
