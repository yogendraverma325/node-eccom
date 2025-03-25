export default (sequelize, Sequelize) => {
	const reportType = sequelize.define("reporttype", {
		reportTypeId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		reportModuleId: {
			type: Sequelize.INTEGER,
		},
		reportTypeName: {
			type: Sequelize.STRING,
		},
		forManagerReport: {
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
	return reportType;
};
