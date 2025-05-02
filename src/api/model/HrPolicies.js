export default (sequelize, Sequelize) => {
	const HrPolicies = sequelize.define("hr_policies", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		version: {
			type: Sequelize.DECIMAL(5, 1),
			defaultValue: 1.0,
		},
		name: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		category_id: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		policyDocument: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		selectedUsers: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		sign_off_enabled: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		sign_off_mandatory: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		allow_decline: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		is_archived: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		isActive: {
			type: Sequelize.TINYINT,
			defaultValue: 1,
		},
		effective_date_from: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},
		effective_date_to: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},

		// Updated trigger fields with correct default values
		TriggerOnPolicyCreateEdit: {
			type: Sequelize.TINYINT,
			allowNull: true,
			defaultValue: 0,
		},
		TriggerOnEffectiveFrom: {
			type: Sequelize.TINYINT,
			allowNull: true,
			defaultValue: 0,
		},
		TriggerOnDateOfJoining: {
			type: Sequelize.TINYINT,
			allowNull: true,
			defaultValue: 0,
		},
		TriggerOnDateOfConfirmation: {
			type: Sequelize.TINYINT,
			allowNull: true,
			defaultValue: 0,
		},

		createdAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
		},
		updatedAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
		},
		updatedBy: {
			type: Sequelize.STRING(10),
		},
		createdBy: {
			type: Sequelize.STRING(10),
		},
	});

	return HrPolicies;
};
