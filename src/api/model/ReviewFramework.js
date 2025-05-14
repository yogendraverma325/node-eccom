export default (sequelize, Sequelize) => {
	const ReviewFramework = sequelize.define("reviewframework", {
		reviewFrameworkId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		reviewName: {
			type: Sequelize.STRING,
		},
		reviewId: {
			type: Sequelize.STRING,
		},
		reviewDescription: {
			type: Sequelize.TEXT,
		},
		alignToReviewCycle: {
			type: Sequelize.INTEGER,
		},
		startDate: {
			type: Sequelize.STRING,
		},
		endDate: {
			type: Sequelize.STRING,
		},
		goalRatingScale: {
			type: Sequelize.INTEGER,
		},
		goalAutoCalculate: {
			type: Sequelize.BOOLEAN,
		},
		goalAutoCompentancy: {
			type: Sequelize.BOOLEAN,
		},
		overallPerformanceScale: {
			type: Sequelize.INTEGER,
		},
		goalWeightage: {
			type: Sequelize.INTEGER,
		},
		compentencyWeightage: {
			type: Sequelize.INTEGER,
		},
		promotionFramework: {
			type: Sequelize.INTEGER,
		},
		selfReview: {
			type: Sequelize.BOOLEAN,
		},
		evaluator: {
			type: Sequelize.STRING,
		},
		reviewer: {
			type: Sequelize.STRING,
		},
		calibration: {
			type: Sequelize.STRING,
		},
		sendBackToEmployee: {
			type: Sequelize.BOOLEAN,
		},
		selfCanViewRatingOf: {
			type: Sequelize.JSON,
		},
		selfCanViewCommentOf: {
			type: Sequelize.JSON,
		},
		evaluatorCanViewRatingOf: {
			type: Sequelize.JSON,
		},
		evaluatorCanViewCommentOf: {
			type: Sequelize.JSON,
		},
		reviewerCanViewRatingOf: {
			type: Sequelize.JSON,
		},
		reviewerCanViewCommentOf: {
			type: Sequelize.JSON,
		},
		hideNextStageRatings: {
			type: Sequelize.BOOLEAN,
		},
		userAssignment: {
			type: Sequelize.JSON,
		},
		// selfCanViewRatingOf: {
		// 	type: Sequelize.STRING,
		// },
		// selfCanViewCommentOf: {
		// 	type: Sequelize.STRING,
		// },
		// evaluatorCanViewRatingOf: {
		// 	type: Sequelize.STRING,
		// },
		// evaluatorCanViewCommentOf: {
		// 	type: Sequelize.STRING,
		// },
		// reviewerCanViewRatingOf: {
		// 	type: Sequelize.STRING,
		// },
		// reviewerCanViewCommentOf: {
		// 	type: Sequelize.STRING,
		// },
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
		isActive: {
			type: Sequelize.BOOLEAN,
		},
		type: {
			type: Sequelize.INTEGER,
		},
		isDeleted: {
			type: Sequelize.BOOLEAN,
		},
	});
	return ReviewFramework;
};
