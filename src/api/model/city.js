export default (sequelize, Sequelize) => {
	const cityMaster = sequelize.define("citymaster", {
		cityId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		cityCode: {
			type: Sequelize.STRING,
		},
		cityName: {
			type: Sequelize.STRING,
		},
		stateId: {
			type: Sequelize.INTEGER,
		},
        isActive: {
			type: Sequelize.BOOLEAN,
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
	return cityMaster;
};
