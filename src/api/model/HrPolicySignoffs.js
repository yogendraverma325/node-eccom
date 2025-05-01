export default (sequelize, Sequelize) => {
	const HrPolicySignoffs = sequelize.define("hr_policy_signoffs", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		hr_policy_id: {
			type: Sequelize.INTEGER,
			allowNull: false, // Assuming hr_policy_id is required for signoffs
		},
		user_id: {
			type: Sequelize.INTEGER,
			allowNull: false, // Assuming user_id is required to track which user made the signoff
		},
		status: {
			type: Sequelize.STRING(10),
			defaultValue: "pending", // Default status is 'pending'
			allowNull: false,
		},
		deviceIp: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		device: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		declineReason: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: true, // This can be null if the policy hasn't been signed
		},
		updated_at: {
			type: Sequelize.DATE,
			allowNull: true, // This can be null if the policy hasn't been signed
		},
	});

	// Optionally, you can define associations here if needed
	// Example: HrPolicySignoffs.belongsTo(models.HrPolicies, { foreignKey: 'hr_policy_id' });

	return HrPolicySignoffs;
};
