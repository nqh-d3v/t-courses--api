module.exports = (sequelize, Sequelize) => {
  class Link extends Sequelize.Model {}

  Link.init(
    {
      courseId: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      userId: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(["wait-pay", "accepted", "black"]),
        defaultValue: "wait-pay",
      },
      role: {
        type: Sequelize.ENUM(["admin", "mentor", "member"]),
        defaultValue: "member",
      },
      info: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
    },
    {
      sequelize,
      modelName: 'link',
      timestamps: true,
      underscored: true,
    },
  );

  /**
   * -------------- ASSOCIATION ----------------
   */
  
  Link.associate = function (models) {
    Link.belongsTo(models.course, {
      foreignKey: 'course_id',
      onDelete: 'CASCADE',
    });
    Link.belongsTo(models.user, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };
  

  return Link;
};