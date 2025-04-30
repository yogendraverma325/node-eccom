export default (sequelize, Sequelize) => {
	const exportSheetMapping = sequelize.define("exportsheetmappings", {
		exportSheetMappingId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		exportSheetAutoId: {
			type: Sequelize.INTEGER,
		},
		columnName: {
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
			type: Sequelize.INTEGER,
		},
	});
	return exportSheetMapping;
};
