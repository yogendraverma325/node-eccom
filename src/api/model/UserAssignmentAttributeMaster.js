export default (sequelize, Sequelize) => {
	const UserAssignmentAttributeMaster = sequelize.define(
		"userassignmentattributemaster",
		{
			userAssignmentAttributeId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			attributeName: {
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
			},
			isActive: {
				type: Sequelize.BOOLEAN,
			},
		},
	);
	return UserAssignmentAttributeMaster;
};
