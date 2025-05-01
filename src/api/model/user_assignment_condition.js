export default (sequelize, Sequelize) => {
	const UserAssignmentCondition = sequelize.define(
		"user_assignment_condition",
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_assignment_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			attribute_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			condition_type: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			attribute_values: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			created_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
			updated_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
		},
		{
			timestamps: false,
		},
	);
	return UserAssignmentCondition;
};
