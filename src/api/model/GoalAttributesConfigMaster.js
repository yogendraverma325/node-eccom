export default (sequelize, Sequelize) => {
	const GoalAttributesConfigMaster = sequelize.define("goalattributesconfigmaster", {
		goalAttributeId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		goalAttributeName: {
			type: Sequelize.STRING,
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
		label: {
			type: Sequelize.STRING,
		},
		stateName:{
			type: Sequelize.STRING,
		},
		type: {
			type: Sequelize.STRING,
		},
		fieldType: {
			type: Sequelize.STRING,
		},
		heading: {
			type: Sequelize.STRING,
		},
		errorMessage: {
			type: Sequelize.STRING,
		},

		isRequired: {
			type: Sequelize.INTEGER,
		},
		md: {
			type: Sequelize.INTEGER,
		},
		sm: {
			type: Sequelize.INTEGER,
		},
		value:{
			type: Sequelize.STRING,
		},
		minValueLimit: {
			type: Sequelize.INTEGER,
		},
		maxValueLimit: {
			type: Sequelize.INTEGER,
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
		},
		goalType:{
			type: Sequelize.INTEGER
		}
		
	});
	return GoalAttributesConfigMaster;
}
