export default (sequelize, Sequelize) => {
	const UserAssignment = sequelize.define(
		"user_assignment",
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			code: {
				type: Sequelize.STRING(100),
				unique: true,
				allowNull: true,
			},
			process_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
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
	return UserAssignment;
};
