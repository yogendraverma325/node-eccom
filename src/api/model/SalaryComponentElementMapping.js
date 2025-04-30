export default (sequelize, Sequelize) => {
	const salarycomponentmapping = sequelize.define("salarycomponentmapping", {
		salarycomponentmappingAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		salaryComponentAutoId: {
			type: Sequelize.INTEGER,
		},
		salaryComponentElementAutoId: {
			type: Sequelize.INTEGER,
		},
		salaryStructurecomponentmappingAutoId: {
			type: Sequelize.INTEGER,
		},
		elementValue: {
			type: Sequelize.STRING(100),
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
	return salarycomponentmapping;
};
