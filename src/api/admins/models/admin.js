/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
const crypt = require('../../../common/crypto/utils');

module.exports = (sequelize, Sequelize) => {
    class Admin extends Sequelize.Model {}

    Admin.init(
        {
            username: {
                type: Sequelize.STRING(30),
                allowNull: false,
                unique: {
                    args: true,
                    msg: 'Admin account already created before.',
                },
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
                defaultValue: 'Admin',
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM('admin', 'user'),
                defaultValue: 'user',
                allowNull: false,
            },
            isLock: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'admin',
            timestamps: true,
            underscored: true,
        },
    );

    /**
     * -------------- HOOKS ----------------
     */

    function encryptPasswordIfChanged(user) {
        if (user.changed('password')) {
            const hashedPassword = crypt.genPassword(user.get('password'));
            user.password = hashedPassword;
        }
    }

    Admin.beforeCreate(encryptPasswordIfChanged);
    Admin.beforeUpdate(encryptPasswordIfChanged);

    /**
     * -------------- INSTANCE METHOD ----------------
     */

    Admin.prototype.validPassword = function (password) {
        return crypt.validPassword(password, this.password);
    };

    /**
     * -------------- CLASS METHOD ----------------
     */

    Admin.validateAccountCredentials = async function (credentials) {
        const { username, password } = credentials;
        const user = await Admin.findOne({
            where: { username },
        });
        if ( user && user.validPassword(password) && !user.isLock ) {
            return user;
        }

        return null;
    };

    return Admin;
};
