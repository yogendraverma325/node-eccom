export default (sequelize, Sequelize) => {
	const extrabenefit = sequelize.define("extrabenefit", {
		extraBenefitAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		// payMonth: {
		// 	type: Sequelize.STRING,
		// },
		benefitAmount: {
			type: Sequelize.DECIMAL(10, 2),
		},
		empCode: {
			type: Sequelize.STRING,
		},
		isActive: {
			type: Sequelize.INTEGER,
			default: 0,
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
	return extrabenefit;
};
