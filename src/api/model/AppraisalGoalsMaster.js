export default (sequelize, Sequelize) => {
	const appraisalGoalsMaster = sequelize.define("appraisalgoalsmaster", {
		appraisalGoalId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		goalPlanName: {
			type: Sequelize.STRING,
		},
		goalPlanId: {
			type: Sequelize.STRING,
		},
		goalPlanDescription: {
			type: Sequelize.STRING,
		},
		startDate: {
			type: Sequelize.STRING,
		},
		endDate: {
			type: Sequelize.STRING,
		},
        enableSubGoals:{
            type: Sequelize.BOOLEAN,
        },
		userAssignment: {
			type: Sequelize.INTEGER,
		},
        exclusionSetting: {
			type: Sequelize.INTEGER,
		},
		goalPlanApprover:{
			type: Sequelize.STRING,
		},
		allowEmployeeToAddGoals:{
			type: Sequelize.BOOLEAN,
		},
		allowEmployeeToEditGoals:{
			type: Sequelize.BOOLEAN,
		},
		allowApproverToAddAndEditGoals:{
			type: Sequelize.BOOLEAN,
		},
		allowEmployeeAndApproverToDeleteGoals:{
			type: Sequelize.BOOLEAN,
		},
		allowEmpAndApproverToAddFromPreviousGoalPlan:{
			type: Sequelize.BOOLEAN,
		},
		allowEmpAndApproverToEditSysAssginedIndividualGoals:{
			type: Sequelize.BOOLEAN,
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
		type:{
			type: Sequelize.INTEGER, // 0=> Draft 1=> Active 2=> Archived
		},
        isDeleted: {
			type: Sequelize.BOOLEAN,
		}
		
	});
	return appraisalGoalsMaster;
};

