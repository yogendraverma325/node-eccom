export default (sequelize, Sequelize) => {
    const paySlips = sequelize.define("payslip", {
        paySlipAutoId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        EmployeeId: {
            type: Sequelize.INTEGER
        },
        paySlipMonth: {
            type: Sequelize.INTEGER
        },
        paySlipYear: {
            type: Sequelize.INTEGER
        },
        paySlipFinancialYear: {
            type: Sequelize.STRING
        },
        paySlipDuration: {
            type: Sequelize.STRING
        },
        paySlipTotalDays: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipWorkingDays: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipAbsentDays: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipArrearDays: {
            type: Sequelize.INTEGER
        },
        paySlipGrossEarning: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipTotalPay: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipNetPay: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipTotalDeduction: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipTDS: {
            type: Sequelize.DECIMAL(10, 2)
        },
        paySlipStatus: {
            type:  Sequelize.INTEGER,
            default:0,
        },
        paySlipType: {
            type: Sequelize.STRING,
            default: 'Regular'
        },
        financialYearId: {
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
        },
        payMonth:{
            type: Sequelize.STRING
        },
        sendEmail: {
            type: Sequelize.INTEGER
        }
    })
    return paySlips
}