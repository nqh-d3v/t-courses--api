module.exports = (sequelize, Sequelize) => {
    class Lession extends Sequelize.Model {}

    Lession.init(
        {
            courseId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(255),
                defaultValue: 'Nonamed',
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

        },
        {
            sequelize,
            modelName: 'lession',
            timestamps: true,
            underscored: true,
        },
    );

    /**
     * -------------- ASSOCIATION ----------------
     */

    Lession.associate = function (models) {
        Lession.belongsTo(models.course, {
            foreignKey: 'course_id',
            onDelete: 'CASCADE',
        });
        Lession.hasMany(models.exercise, {
            foreignKey: 'lession_id',
            as: 'lession_exercise',
            onDelete: 'CASCADE',
        });
    };


    return Lession;
};