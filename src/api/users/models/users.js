/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
const crypt = require('../../../common/crypto/utils');

module.exports = (sequelize, Sequelize) => {
	class User extends Sequelize.Model {}

	User.init(
		{
			username: {
				type: Sequelize.STRING(255),
				allowNull: false,
				unique: {
					args: true,
					msg: 'Email already exist.',
				},
			},
			password: {
				type: Sequelize.TEXT,
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
				type: Sequelize.STRING(50),
				defaultValue: 'user',
				allowNull: false,
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
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
			modelName: 'user',
			timestamps: true,
			underscored: true,
		},
	);

	/**
	* -------------- ASSOCIATION ----------------
	*/

	User.associate = function (models) {
			User.hasMany(models.link, {
					foreignKey: 'user_id',
					as: 'user_course',
					onDelete: 'CASCADE',
			});
			User.hasMany(models.post, {
					foreignKey: 'author',
					as: 'user_post',
					onDelete: 'CASCADE',
			});
			User.hasMany(models.comment, {
					foreignKey: 'user_id',
					as: 'user_comment',
					onDelete: 'CASCADE',
			});
			User.hasMany(models.reaction, {
					foreignKey: 'user_id',
					as: 'user_reaction',
					onDelete: 'CASCADE',
			});
			User.hasMany(models.submit, {
					foreignKey: 'user_id',
					as: 'user_submit',
					onDelete: 'CASCADE',
			});
	};

	/**
	 * -------------- HOOKS ----------------
	 */

	function encryptPasswordIfChanged(user, options) {
			if (user.changed('password')) {
					const hashedPassword = crypt.genPassword(user.get('password'));
					user.password = hashedPassword;
			}
	}

	User.beforeCreate(encryptPasswordIfChanged);
	User.beforeUpdate(encryptPasswordIfChanged);

	/**
	 * -------------- INSTANCE METHOD ----------------
	 */

	User.prototype.validPassword = function (password) {
			return crypt.validPassword(password, this.password);
	};

	/**
	 * -------------- CLASS METHOD ----------------
	 */

	User.validateAccountCredentials = async function (credentials) {
			const { username, password } = credentials;
			const user = await User.findOne({
					where: { username },
			});
			if ( user && user.isActive && user.validPassword(password) ) {
					return user;
			}

			return null;
	};

	return User;
};
