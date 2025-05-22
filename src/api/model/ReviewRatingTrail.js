export default (sequelize, Sequelize) => {
	const ReviewRatingTrail = sequelize.define("reviewratingtrail", {
		reviewratingtrailId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		level: {
			type: Sequelize.INTEGER,
		},
		reviewFrameworkId: {
			type: Sequelize.INTEGER,
		},
		userId: {
			type: Sequelize.INTEGER,
		},
		isVisible: {
			type: Sequelize.INTEGER,
		},
		isActionTaken: {
			type: Sequelize.INTEGER,
		},
		pendingAt: {
			type: Sequelize.INTEGER,
		},
		pendingStage: {
			type: Sequelize.STRING,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return ReviewRatingTrail;
};
