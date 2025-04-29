export default (sequelize, Sequelize) => {
	const GoalAttributesMapping = sequelize.define("goalattributesmapping", {
		goalAttributeMappingId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        appraisalGoalId:{
            type: Sequelize.INTEGER,
        },
        companyId:{
			type: Sequelize.INTEGER,
        },
        goalAttributeId:{
			type: Sequelize.INTEGER,
        },
		enable: {
			type: Sequelize.BOOLEAN,
		},
		mandatory: {
			type: Sequelize.BOOLEAN,
		},
		editable: {
			type: Sequelize.BOOLEAN,
		},
		needsApproval: {
			type: Sequelize.BOOLEAN,
		},
		isDisableMandate:{
			type: Sequelize.BOOLEAN
		},
		goalType:{
			type: Sequelize.INTEGER
		},
		createdBy: {
			type: Sequelize.INTEGER
		},
		createdAt: {
			type: Sequelize.DATE
		},
		updatedBy: {
			type: Sequelize.INTEGER
		},
		updatedAt: {
			type: Sequelize.DATE
		},
        isActive: {
			type: Sequelize.BOOLEAN
		}
		
	});
	return GoalAttributesMapping;
};
