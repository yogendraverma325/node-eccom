export default (sequelize, Sequelize) => {
	const GoalAreaPragatiTrail = sequelize.define("goalareapragatitrail", {
		goalTrailAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		goalPlanId: {
			type: Sequelize.INTEGER,
		},
		level: {
			type: Sequelize.INTEGER,
		},
        taskName:{
			type: Sequelize.STRING,
        },
        taskRole:{
            type: Sequelize.STRING,
        },
		pendingAt: {
			type: Sequelize.INTEGER,
		},
		isApproved: {
			type: Sequelize.INTEGER, // 0=> pending 1=>approved
		},
		remark: {
			type: Sequelize.STRING,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		userId: {
			type: Sequelize.INTEGER,
		},
		role:{
			type: Sequelize.STRING,
		}
	});
	return GoalAreaPragatiTrail;
};
