export default (sequelize, Sequelize) => {
	const RatingScaleMaster = sequelize.define("ratingscalemaster", {
		ratingScaleId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		ratingScaleName: {
			type: Sequelize.STRING,
		},
		ratingScaleDescription: {
			type: Sequelize.STRING,
		},
		lengthOfScale: {
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
	return RatingScaleMaster;
};
