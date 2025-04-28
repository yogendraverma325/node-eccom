export default (sequelize, Sequelize) => {
	const paySlips = sequelize.define("payslip", {
		paySlipAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		paySlipMonth: {
			type: Sequelize.INTEGER,
		},
		paySlipYear: {
			type: Sequelize.INTEGER,
		},
		paySlipFinancialYear: {
			type: Sequelize.STRING,
		},
		paySlipDuration: {
			type: Sequelize.STRING,
		},
		paySlipTotalDays: {
			type: Sequelize.INTEGER,
		},
		paySlipWorkingDays: {
			type: Sequelize.INTEGER,
		},
		paySlipAbsentDays: {
			type: Sequelize.INTEGER,
		},
		paySlipArrearDays: {
			type: Sequelize.INTEGER,
		},
		paySlipGrossEarning: {
			type: Sequelize.DECIMAL(10, 2),
		},
		paySlipTotalPay: {
			type: Sequelize.DECIMAL(10, 2),
		},
		paySlipNetPay: {
			type: Sequelize.DECIMAL(10, 2),
		},
		paySlipTotalDeduction: {
			type: Sequelize.DECIMAL(10, 2),
		},
		paySlipTDS: {
			type: Sequelize.DECIMAL(10, 2),
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
		},
		payMonth: {
			type: Sequelize.STRING,
		},
		paySlipStatus: {
			type: Sequelize.INTEGER,
		},
		sendEmail: {
			type: Sequelize.INTEGER,
		},
		paySlipType: {
			type: Sequelize.STRING,
			default: "Regular",
		},
		financialYearId: {
			type: Sequelize.INTEGER,
		},
		encashmentDays: {
			type: Sequelize.DECIMAL(3, 2),
		},
		recoveryDays: {
			type: Sequelize.DECIMAL(3, 2),
		},
	});
	return paySlips;
};
