export default (sequelize, Sequelize) => {
	const SubGoalAreaOfUser = sequelize.define("subgoalareaofusers", {
        subGoalAreaId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		goalAreaId: {
			type: Sequelize.INTEGER
		},
		subGoalName: { 
			type: Sequelize.STRING 
		},
		subGoalDescription: { 
			type: Sequelize.TEXT 
		},
		timelines: { 
			type: Sequelize.STRING 
		},
		weightage: { 
			type: Sequelize.STRING 
		},
		subGoalStatus: { 
			type: Sequelize.STRING
		 },
		subGoalScore: { 
			type: Sequelize.STRING 
		},
		subGoalScoreFormula: { 
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
			type: Sequelize.BOOLEAN,
		},
	});
	return SubGoalAreaOfUser;
};
