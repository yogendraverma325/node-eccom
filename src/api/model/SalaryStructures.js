export default (sequelize, Sequelize) => {
	const salarystructure = sequelize.define("salarystructure", {
		salaryStructureAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		salaryStructureName: {
			type: Sequelize.STRING,
		},
		salaryStructureDes: {
			type: Sequelize.STRING,
		},
		hasVariable: {
			type: Sequelize.INTEGER,
		},
		hasMonthlyProration: {
			type: Sequelize.INTEGER,
		},
		hasAnnuallyProration: {
			type: Sequelize.INTEGER,
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
	});
	return salarystructure;
};
