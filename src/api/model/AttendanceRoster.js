export default (sequelize, Sequelize) => {
	const attendanceRoster = sequelize.define("attendanceroster", {
		rosterAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		employeeId: {
			type: Sequelize.INTEGER,
		},
		attendanceDate:{
			type: Sequelize.DATE
		},
		shiftId: {
			type: Sequelize.INTEGER
		},
		weekOffId: {
			type: Sequelize.INTEGER
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		createdDt: {
			type: Sequelize.DATE
		},
		createdAt: {
			type: Sequelize.INTEGER
		},
		updatedBy: {
			type: Sequelize.DATE
		},
		updatedAt: {
			type: Sequelize.INTEGER
		},
	})
	return attendanceRoster
}