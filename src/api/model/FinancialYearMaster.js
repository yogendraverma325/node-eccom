export default (sequelize, Sequelize) => {
    const financialYearMaster = sequelize.define("financialyearmaster", {
        financialYearId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        financialYearName: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        createdBy: {
            type: Sequelize.INTEGER,
        },
        updatedBy: {
            type: Sequelize.INTEGER,
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        }
    })
    return financialYearMaster
}