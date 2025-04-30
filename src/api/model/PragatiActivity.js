export default (sequelize, Sequelize) => {
	const PragatiActivities = sequelize.define("pragatiactivities", {
		activityId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        message:{
            type: Sequelize.STRING
        },
        isRead:{
            type: Sequelize.INTEGER
        },
		forUserId: {
			type: Sequelize.INTEGER
		},
		byUserId: {
			type: Sequelize.INTEGER
		},
		createdAt: {
			type: Sequelize.DATE
		},
		createdBy: {
			type: Sequelize.INTEGER
		},
        updatedAt: {
			type: Sequelize.DATE
		},
		updatedBy: {
			type: Sequelize.INTEGER
		}
	});
	return PragatiActivities;
};
