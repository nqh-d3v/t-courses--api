module.exports = (sequelize, Sequelize) => {
    class Comment extends Sequelize.Model {}

    Comment.init(
        {
            userId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            postId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'comment',
            timestamps: true,
            underscored: true,
        },
    );

    /**
     * -------------- ASSOCIATION ----------------
     */
    
    Comment.associate = function (models) {
        Comment.belongsTo(models.user, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
        Comment.belongsTo(models.post, {
            foreignKey: 'post_id',
            onDelete: 'CASCADE',
        });
    };
    

    return Comment;
};