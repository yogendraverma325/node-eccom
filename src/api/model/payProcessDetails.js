export default (sequelize, Sequelize) => {
	const payProcessDetails = sequelize.define("payprocessdetails", {
		payProcessDetailAutoId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		EmployeeId: {
			type: Sequelize.STRING(255),
			allowNull: true, // Assuming null values are allowed since not explicitly stated
		},
		proceessId: {
			type: Sequelize.INTEGER,
		},
		payStatus: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		payRemark: {
			type: Sequelize.STRING,
			default: null,
		},
		EmployeeName: {
			type: Sequelize.STRING,
		},
		ctc: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		lopDays: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		lopDeductions: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		totalWorkingDays: {
			type: Sequelize.INTEGER,
			default: 0,
		},
		netPay: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		tdsDeductions: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		deductionAmount: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		deductionName: {
			type: Sequelize.STRING(255),
			default: null,
		},
		arrearAmount: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		loanAmont: {
			type: Sequelize.DECIMAL(10, 2),
			default: 0,
		},
		salaryMonth: {
			type: Sequelize.STRING,
			default: null,
		},
		payMonth: {
			type: Sequelize.STRING,
			default: null,
		},
		companyId: {
			type: Sequelize.INTEGER,
		},
		createdBy: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		updatedAt: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		dateOfexit: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		dateOfJoining: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		processType: {
			type: Sequelize.STRING,
			default: null,
		},
	});
	return payProcessDetails;
};
