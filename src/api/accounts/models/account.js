/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
const { genPassword, validPassword } = require('../../../common/crypto/utils');

const AppError = require('../../../common/error/error');
const { httpStatus } = require('../../../common/error/http-status');

module.exports = (sequelize, Sequelize) => {
	class Account extends Sequelize.Model {}

	Account.init(
		{
			username: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			password: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			email: {
				type: Sequelize.TEXT,
				defaultValue: '',
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			avatar: {
				type: Sequelize.TEXT,
				defaultValue: '',
				allowNull: false,
			},
			role: {
				type: Sequelize.ENUM(['admin', 'mentor', 'support', 'member']),
				defaultValue: 'member',
				allowNull: false,
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			isLock: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'account',
			timestamps: true,
			underscored: true,
		},
	);

	/**
	* -------------- ASSOCIATION ----------------
	*/

	Account.associate = function (models) {
	};

	/**
	 * -------------- HOOKS ----------------
	 */

	function encryptPasswordIfChanged(account, options) {
			if (account.changed('password')) {
					const hashedPassword = genPassword(account.get('password'));
					account.password = hashedPassword;
			}
	}

	Account.beforeCreate(encryptPasswordIfChanged);
	Account.beforeUpdate(encryptPasswordIfChanged);

	/**
	 * -------------- INSTANCE METHOD ----------------
	 */

	Account.prototype.validPassword = function (password) {
			return validPassword(password, this.password);
	};

	/**
	 * -------------- CLASS METHOD ----------------
	 */

	Account.validateAccountCredentials = async function (credentials) {
			const { username, password } = credentials;
			const user = await Account.findOne({
				where: { $or: [{ username }, { email: username }] }
			});
			if ( user && user.validPassword(password) ) {
				return user
			}
			return null;
	};

	return Account;
};
