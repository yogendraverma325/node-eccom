export default (sequelize, Sequelize) => {
	const CompentancyTier = sequelize.define("compentancytier", {
		compentancyTierId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		compentancyName: {
			type: Sequelize.STRING,
		},
		compentancyDescription: {
			type: Sequelize.STRING,
		},
		compentancyID: {
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
	});
	return CompentancyTier;
};
