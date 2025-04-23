export default (sequelize, Sequelize) => {
    const qrsessionshistory = sequelize.define("qrsessionshistory", {
        qrSessionId: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        sessionId: {
            type: Sequelize.STRING
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        loggedIn: {
            type: Sequelize.BOOLEAN,
            default: false
        },
        expiresAt: {
            type: Sequelize.DATE
        },
        userAgent: {
            type: Sequelize.STRING
        },
        loginIP: {
            type: Sequelize.STRING
        },
        loginDevice: {
            type: Sequelize.STRING
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        },
        createdBy: {
            type: Sequelize.INTEGER
        },
        updatedBy: {
            type: Sequelize.INTEGER
        }
    });
    return qrsessionshistory;
}