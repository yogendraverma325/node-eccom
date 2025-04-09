export default (sequelize, Sequelize) => {
	const pushNotificationHistory = sequelize.define("pushNotificationHistory", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		employeeId: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		body: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		status: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		response: {
			type: Sequelize.STRING,
			allowNull: true, // Stores the response or error message
		},
		createdAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
	});
	return pushNotificationHistory;
};
