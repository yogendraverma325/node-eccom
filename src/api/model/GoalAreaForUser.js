export default (sequelize, Sequelize) => {
	const goalAreaForUser = sequelize.define("goalareaforusers", {
		goalAreaId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		goalPlanId: {
			type: Sequelize.INTEGER,
		},
		userId: {
			type: Sequelize.INTEGER,
		},
		goalName: { 
			type: Sequelize.STRING 
		},
		goalDescription: { 
			type: Sequelize.TEXT 
		},
		timelines: { 
			type: Sequelize.STRING
		 },
		target: { 
			type: Sequelize.STRING 
		},
		targetType: { 
			type: Sequelize.STRING 
		},
		metric: { 
			type: Sequelize.STRING 
		},
		weightage: { 
			type: Sequelize.INTEGER, 
		},
		archived: { 
			type: Sequelize.STRING, 
		},
		achievmentPercentage: { 
			type: Sequelize.STRING 
		},
		goalStatus: { 
			type: Sequelize.STRING
		 },
		tags: { 
			type: Sequelize.STRING 
		},
		scorecardPillar: { 
			type: Sequelize.STRING 
		},
		achievmentMatrix: { 
			type: Sequelize.TEXT 
		},
		achievmentMapping: {
			 type: Sequelize.STRING 
			},
		alignedTo: { 
			type: Sequelize.STRING 
		}, 
		goalScore: { 
			type: Sequelize.FLOAT 
		},
		goalScoreFormula: { 
			type: Sequelize.TEXT 
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
		isDeleted:{
			type: Sequelize.INTEGER,
		},
		isActive: {
			type: Sequelize.INTEGER, // 0=>Draft 1=>Submitted 2=>Action Taken
		},
		isApproved:{
			type: Sequelize.INTEGER, // 0=> Pending 1=>Approved 2=>Rejected
		},
		comment:{
			type: Sequelize.TEXT
		},
	});
	return goalAreaForUser;
};
