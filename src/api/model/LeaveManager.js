export default (sequelize, Sequelize) => {
	const leavemanager = sequelize.define("leavemanager", {
		leavemanagerAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		leaveAutoId: {
			type: Sequelize.INTEGER,
		},
		leaveCount: {
			type: Sequelize.DECIMAL(10, 2),
		},
		transaction_for: {
			type: Sequelize.DECIMAL(10, 2),
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
	});
	return leavemanager;
};
