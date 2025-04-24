export default (sequelize, Sequelize) => {
	const holidayMaster = sequelize.define("holidaymaster", {
		holidayId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		holidayName: {
			type: Sequelize.STRING,
		},
		holidayDate: {
			type: Sequelize.DATE,
		},
		isNationalHoliday: {
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
		//RITAK WORK
		createdBy: {
			type: Sequelize.INTEGER,
		},

		//RITAK WORK
	});
	return holidayMaster;
};
