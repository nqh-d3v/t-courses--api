module.exports = (sequelize, Sequelize) => {
    class Exercise extends Sequelize.Model {}

    Exercise.init(
        {
            lessionId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            name: {
                type: Sequelize.TEXT,
                defaultValue: 'Nonamed',
            },
            content: {
                type: Sequelize.TEXT,
                defaultValue: '',
            },
            isHaveDeadline: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            deadline: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'exercise',
            timestamps: true,
            underscored: true,
        },
    );

    /**
     * -------------- ASSOCIATION ----------------
     */
    
    Exercise.associate = function (models) {
        Exercise.belongsTo(models.lession, {
            foreignKey: 'lession_id',
            as: 'lession',
            onDelete: 'CASCADE',
        });
        Exercise.hasMany(models.submit, {
            foreignKey: 'exercise_id',
            as: 'submit',
            onDelete: 'CASCADE',
        });
    };
    

    return Exercise;
};