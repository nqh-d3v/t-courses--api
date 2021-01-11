/* eslint-disable no-param-reassign */
module.exports = (sequelize, Sequelize) => {
  class Post extends Sequelize.Model {}

  Post.init(
    {
      authId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tags: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      isLock: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isCommentLock: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'post',
      timestamps: true,
      underscored: true,
    },
  );

  /**
   * -------------- ASSOCIATION ----------------
   */
  
  Post.associate = function (models) {
      Post.belongsTo(models.user, {
          foreignKey: 'authId',
          onDelete: 'CASCADE',
      });
      Post.hasMany(models.reaction, {
          foreignKey: 'post_id',
          as: 'post_reaction',
          onDelete: 'CASCADE',
      });
      Post.hasMany(models.comment, {
          foreignKey: 'post_id',
          as: 'post_comment',
          onDelete: 'CASCADE',
      });
  };

  return Post;
};
