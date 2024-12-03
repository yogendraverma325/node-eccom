export default (sequelize, Sequelize) => {
    const offRoleCtc = sequelize.define("offrolectc", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tmcCode: {
            type: Sequelize.STRING(255)
        },
        offRoleCtc: {
            type: Sequelize.INTEGER
        },
        esicPFdeduction: {
            type: Sequelize.STRING,
        },
        
    })
    return offRoleCtc
}