/* eslint-disable no-param-reassign */
const crypt = require('../../../common/crypto/utils');

module.exports = (sequelize, Sequelize) => {
  class Course extends Sequelize.Model {}

  Course.init(
    {
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      codeAccess: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      // - Below for admin
      isLock: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      sequelize,
      modelName: 'course',
      timestamps: true,
      underscored: true,
    },
  );

  /**
   * -------------- HOOKS ----------------
   */

  function encryptCodeAccessIfChanged(course) {
    if (course.changed('codeAccess') && course.get('codeAccess') !== '') {
      const hashedPassword = crypt.genPassword(`@code=${course.get('codeAccess')}&@id=${course.get('id')}&@code_access_course_secret=${process.env.CODE_ACCESS_SECRET || 'code_access_secrt@12fnifenvverwh-favnrjhnb-gnvaeognqoi@E!2-sdvmngu'}`);
      course.codeAccess = hashedPassword;
    }
  }

  Course.beforeCreate(encryptCodeAccessIfChanged);
  Course.beforeUpdate(encryptCodeAccessIfChanged);

  /**
   * -------------- INSTANCE METHOD ----------------
   */

  Course.prototype.validCodeAccess = function (code) {
    return crypt.validPassword(`@code=${code}&@id=${this.id}&@code_access_secret=${process.env.CODE_ACCESS_SECRET || 'code_access_course_secret@12fnifenvverwh-favnrjhnb-gnvaeognqoi@E!2-sdvmngu'}`, this.codeAccess);
  };


  /**
   * -------------- ASSOCIATION ----------------
   */
  
  Course.associate = function (models) {
    Course.hasMany(models.link, {
      foreignKey: 'course_id',
      as: 'course_user',
      onDelete: 'CASCADE',
    });
    Course.hasMany(models.lession, {
      foreignKey: 'course_id',
      as: 'course_lession',
      onDelete: 'CASCADE',
    });
  };

  return Course;
};
