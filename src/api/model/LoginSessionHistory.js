export default (sequelize, Sequelize) => {
	const loginSessionHistory = sequelize.define("loginSessionHistory", {
		loginSessionHistoryId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		realUserId: {
			type: Sequelize.INTEGER,
		},
		targetUserId: {
			type: Sequelize.INTEGER,
		},
		loginIP: {
			type: Sequelize.STRING,
		},
		userAgent: {
			type: Sequelize.STRING,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return loginSessionHistory;
};
