export default (sequelize, Sequelize) => {
	const reviewFramework = sequelize.define("reviewframework", {
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
        alignToReviewCycle:{
			type: Sequelize.INTEGER,
        },
        goalRatingScale:{
            type: Sequelize.INTEGER,
        },
        goalAutoCalculate:{
            type: Sequelize.BOOLEAN,
        },
        goalAutoCompentancy:{
            type: Sequelize.INTEGER,
        },
        overallPerformanceScale:{
            type: Sequelize.INTEGER,
        },
        goalWeightage:{
            type: Sequelize.INTEGER,
        },
        compentencyWeightage:{
            type: Sequelize.INTEGER,
        },
        promotionFramework:{
            type: Sequelize.INTEGER,
        },
        selfReview:{
            type: Sequelize.BOOLEAN, 
        },
        evaluator:{
            type: Sequelize.INTEGER,
        },
        reviewer:{
            type: Sequelize.INTEGER,
        },
        calibration:{
            type: Sequelize.INTEGER,
        },
        sendBackToEmployee:{
            type: Sequelize.BOOLEAN,
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
	return reviewFramework;
};
