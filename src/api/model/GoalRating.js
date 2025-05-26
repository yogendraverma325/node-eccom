export default (sequelize, Sequelize) => {
	const Goalrating = sequelize.define("goalrating", {
		goalRatingId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		goalAreaId: {
			type: Sequelize.INTEGER,
		},
		forUser: {
			type: Sequelize.INTEGER,
		},
		byUser: {
			type: Sequelize.INTEGER,
		},
		rating: {
			type: Sequelize.INTEGER,
		},
		comment: {
			type: Sequelize.TEXT,
		},
		ratingBy: {
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
	return Goalrating;
};
