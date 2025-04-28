export default (sequelize, Sequelize) => {
	const UserAssignement = sequelize.define("userassignment", {
		assignmentId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		assignmentName: {
			type: Sequelize.STRING,
		},
		description: {
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
		}
		
	});
	return UserAssignement;
};
