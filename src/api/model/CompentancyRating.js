export default (sequelize, Sequelize) => {
	const CompentancyRating = sequelize.define("compentancyrating", {
		compentancyRatingId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		// goalAreaId: {
		// 	type: Sequelize.INTEGER,
		// },
		compentancyTierId: {
			type: Sequelize.INTEGER,
		},
		compentancyAttrId: {
			type: Sequelize.INTEGER,
		},
		reviewFrameworkId: {
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
	return CompentancyRating;
};
