module.exports = (sequelize, Sequelize) => {
  class Reaction extends Sequelize.Model {}

  Reaction.init(
      {
          userId: {
              type: Sequelize.STRING(255),
              allowNull: false,
          },
          postId: {
              type: Sequelize.STRING(255),
              allowNull: false,
          },
          type: {
              type: Sequelize.ENUM(['like']),
              allowNull: false,
          }
      },
      {
          sequelize,
          modelName: 'reaction',
          underscored: true,
      },
  );

  /**
   * -------------- ASSOCIATION ----------------
   */
  
  Reaction.associate = function (models) {
      Reaction.belongsTo(models.user, {
          foreignKey: 'user_id',
          onDelete: 'CASCADE',
      });
      Reaction.belongsTo(models.post, {
          foreignKey: 'post_id',
          onDelete: 'CASCADE',
      });
  };
  

  return Reaction;
};