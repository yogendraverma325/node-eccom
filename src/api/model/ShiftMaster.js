export default (sequelize, Sequelize) => {
	const shiftMaster = sequelize.define("shiftsmaster", {
		shiftId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		shiftName: {
			type: Sequelize.STRING,
		},
		shiftStartTime: {
			type: Sequelize.STRING,
		},
		shiftEndTime: {
			type: Sequelize.STRING,
		},
		shiftRemark: {
			type: Sequelize.STRING,
		},
		isOverNight: {
			type: Sequelize.INTEGER,
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
	});
	return shiftMaster;
};
