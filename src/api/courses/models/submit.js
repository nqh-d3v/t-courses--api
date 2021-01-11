module.exports = (sequelize, Sequelize) => {
    class Submit extends Sequelize.Model {}

    Submit.init(
        {
            exerciseId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            userId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            other: {
                type: Sequelize.TEXT,
                defaultValue: '',
            },
            score: {
                type: Sequelize.INTEGER,
                defaultValue: -1,
            },
            markedBy: {
                type: Sequelize.STRING,
                defaulValue: '',
            },
            comment: {
                type: Sequelize.STRING,
                defaultValue: '',
            }
        },
        {
            sequelize,
            modelName: 'submit',
            timestamps: true,
            underscored: true,
        },
    );

    /**
    * -------------- ASSOCIATION ----------------
    */

    Submit.associate = function (models) {
        Submit.belongsTo(models.user, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
        Submit.belongsTo(models.exercise, {
            foreignKey: 'exercise_id',
            onDelete: 'CASCADE',
        });
    };


    return Submit;
};