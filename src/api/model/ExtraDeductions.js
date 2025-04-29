export default (sequelize, Sequelize) => {
	const extraDeductions = sequelize.define("extradeductions", {
		extraDeductionsAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		deductionCategory: {
			type: Sequelize.STRING,
		},
		deductionCategoryId: {
			type: Sequelize.INTEGER,
		},
		deductionName: {
			type: Sequelize.STRING,
		},
		empCode: {
			type: Sequelize.STRING,
			default: null,
		},
		deductionAmount: {
			type: Sequelize.DECIMAL(10, 2),
		},
		startMonth: {
			type: Sequelize.STRING,
		},
		endMonth: {
			type: Sequelize.STRING,
			default: null,
		},
		numberOfDeductions: {
			type: Sequelize.INTEGER,
		},
		status: {
			type: Sequelize.INTEGER,
			default: 0,
		},
		changeReason: {
			type: Sequelize.STRING,
			default: null,
		},
		currencyCode: {
			type: Sequelize.INTEGER,
		},
		financialYearId: {
			type: Sequelize.INTEGER,
		},
		deductionType: {
			type: Sequelize.STRING,
		},
		createdBy: {
			type: Sequelize.INTEGER,
			default: null,
		},
		createdAt: {
			type: Sequelize.DATE,
			default: null,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
			default: null,
		},
		updatedAt: {
			type: Sequelize.DATE,
			default: null,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			default: 0,
		},
	});
	return extraDeductions;
};
