export default (sequelize, Sequelize) => {
	const UserAssignmentAttributeMaster = sequelize.define("user_assignment_attribute_master", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		code: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
        model: {
			type: Sequelize.STRING(100),
			allowNull: true,
		},
        column_mapping: {
			type: Sequelize.STRING(100),
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
	}, {
		timestamps: false,
	});
	return UserAssignmentAttributeMaster;
};
