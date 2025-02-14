export default (sequelize, Sequelize) => {
	const gratuityOverrides = sequelize.define("gratuityoverrides", {
		gratuityAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		payMonth: {
			type: Sequelize.STRING,
		},
		gratuityDays: {
			type: Sequelize.DECIMAL,
		},
		empCode: {
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
	return gratuityOverrides;
};
