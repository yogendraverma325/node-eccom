export default (sequelize, Sequelize) => {
	const UserAssignmentProcessMaster = sequelize.define("user_assignment_process_master", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(100),
			unique: true,
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
	}, {
		timestamps: false,
	});
	return UserAssignmentProcessMaster;
};
