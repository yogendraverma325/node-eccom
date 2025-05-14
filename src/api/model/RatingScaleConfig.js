export default (sequelize, Sequelize) => {
	const RatingScaleConfig = sequelize.define("ratingscaleconfig", {
		ratingScaleConfigId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		ratingScaleId: {
			type: Sequelize.INTEGER,
		},
		scaleMarker: {
			type: Sequelize.STRING,
		},
		marks: {
			type: Sequelize.STRING,
		},
		ratingScaleConfigDescription: {
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
	});
	return RatingScaleConfig;
};
