export default (sequelize, Sequelize) => {
	const salaryComponent = sequelize.define("salarycomponent", {
		salaryComponentAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		salaryComponentCode: {
			type: Sequelize.STRING,
		},
		salaryComponentDescription: {
			type: Sequelize.STRING,
		},
		salaryComponentType: {
			type: Sequelize.STRING,
		},
		salaryComponentRemark: {
			type: Sequelize.STRING,
		},
		salaryComponentCalculation: {
			type: Sequelize.STRING,
		},
		salaryComponentDependent: {
			type: Sequelize.STRING,
		},
		salaryComponentEarningType: {
			type: Sequelize.STRING,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
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
		isDefault: {
			type: Sequelize.INTEGER,
		},
		compulsoryComponent: {
			type: Sequelize.INTEGER,
		},
		salaryComponentAlias: {
			type: Sequelize.STRING,
		},
		includeInPackage: {
			type: Sequelize.INTEGER,
		},
		salaryComponentSequenceNo: {
			type: Sequelize.INTEGER,
		},
	});
	return salaryComponent;
};
