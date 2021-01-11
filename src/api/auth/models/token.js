/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */

module.exports = (sequelize, Sequelize) => {
	class Token extends Sequelize.Model {}

	Token.init(
		{
			name: {
        type: Sequelize.ENUM('active-account', 'login-account'),
        defaultValue: 'active-account',
      },
      userId: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
		},
		{
			sequelize,
			modelName: 'token_auth',
			timestamps: true,
			underscored: true,
		},
	);

	/**
	* -------------- ASSOCIATION ----------------
	*/

	Token.associate = function (models) {
    Token.hasOne(models.user, {
        foreignKey: 'user_id',
        as: 'tokenauth_user',
        onDelete: 'CASCADE',
    });
  };
  return Token;
};
