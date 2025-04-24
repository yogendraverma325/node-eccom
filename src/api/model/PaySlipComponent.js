export default (sequelize, Sequelize) => {
	const paySlipComponent = sequelize.define("payslipcomponent", {
		paySlipComponentAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		paySlipAutoId: {
			type: Sequelize.INTEGER,
		},
		salaryComponentAutoId: {
			type: Sequelize.INTEGER,
		},
		paySlipComponentName: {
			type: Sequelize.STRING,
		},
		paySlipComponentAmount: {
			type: Sequelize.INTEGER,
		},
		paySlipComponentType: {
			type: Sequelize.STRING,
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
		fixedPayElementAmount: {
			type: Sequelize.INTEGER,
			default: null,
		},
		salaryComponentSequenceNo: {
			type: Sequelize.INTEGER,
			default: 999,
		},
	});
	return paySlipComponent;
};
