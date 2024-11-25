export default (sequelize, Sequelize) => {
    const jobLevelMapping = sequelize.define("joblevelmapping", {
        jobLevelMappingId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        companyId: {
            type: Sequelize.INTEGER
        },
        bandId: {
            type: Sequelize.INTEGER
        },
        gradeId: {
            type: Sequelize.INTEGER
        },
        jobLevelId: {
            type: Sequelize.INTEGER
        },
        createdBy: {
            type: Sequelize.INTEGER
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedBy: {
            type: Sequelize.INTEGER
        },
        updatedAt: {
            type: Sequelize.DATE
        },
        isActive: {
            type: Sequelize.BOOLEAN
        }
    })
    return jobLevelMapping
}