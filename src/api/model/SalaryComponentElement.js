export default (sequelize, Sequelize) => {
    const salarycomponentelement = sequelize.define("salarycomponentelement", {
        salaryComponentElementAutoId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        salaryComponentElementName: {
            type: Sequelize.STRING,
        },
        salaryComponentElementCode: {
            type: Sequelize.STRING,
        },
        createdAt: {
            type: Sequelize.DATE
        },
        createdBy: {
            type: Sequelize.INTEGER,
        },
        updatedBy: {
            type: Sequelize.INTEGER,
        },
        updatedAt: {
            type: Sequelize.DATE
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        isDefault:{
            type: Sequelize.INTEGER,
        }
    })
    return salarycomponentelement;
}