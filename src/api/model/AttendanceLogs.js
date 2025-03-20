export default (sequelize, Sequelize) => {
	const AttendanceLogs = sequelize.define("AttendanceLogs", {
		AttendanceLogsId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		employeeId: {
			type: Sequelize.INTEGER,
		},
		lat: {
			type: Sequelize.STRING,
		},
		long: {
			type: Sequelize.STRING,
		},
		location: {
			type: Sequelize.STRING,
		},
		device: {
			type: Sequelize.STRING,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		
		locationType: {
			type: Sequelize.STRING,
		}
	});
	return AttendanceLogs;
};
