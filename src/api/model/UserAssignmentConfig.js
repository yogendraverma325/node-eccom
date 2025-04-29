export default (sequelize, Sequelize) => {
	const UserAssignementConfig = sequelize.define("userassignmentconfig", {
		userAssignementConfigId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userAssignmentAttributeId: {
			type: Sequelize.STRING,
		},
        assignmentId:{
            type: Sequelize.INTEGER,
        },
		values: {
			type: Sequelize.STRING,
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
		}
	});
	return UserAssignementConfig;
};
