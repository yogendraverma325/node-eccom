export default (sequelize, Sequelize) => {
    const exportSheet = sequelize.define("exportsheetmaster", {
        exportSheetAutoId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sheetName: {
            type: Sequelize.STRING(255)
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
            type: Sequelize.INTEGER
        }
    })
    return exportSheet
}
