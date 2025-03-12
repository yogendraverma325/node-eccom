// const ImportInfo = import("./ImportInfo"); // Import the ImportInfo model
export default (sequelize, Sequelize) => {
	const importData = sequelize.define(
		"importData",
		{
			importDataAutoId: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			importAutoId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				// references: {
				//     model: ImportInfo,
				//     key: "importAutoId"
				// },
				// onDelete: "CASCADE"
			},
			importedRow: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			importStatus: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			createdAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
			createdBy: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			importStatusDesc: {
				type: Sequelize.STRING,
				allowNull: true,
			},
		},
		{
			tableName: "importData",
			timestamps: false,
		},
	);

	// ImportInfo.hasMany(ImportInfo, { foreignKey: "importAutoId" });
	// ImportInfo.belongsTo(ImportInfo, { foreignKey: "importAutoId" });
	return importData;
};
