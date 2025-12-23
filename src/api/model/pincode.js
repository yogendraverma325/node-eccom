export default (sequelize, Sequelize) => {
	const pinCodeMaster = sequelize.define("pincodemaster", {
		pincodeId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		pincode: {
			type: Sequelize.STRING,
		},
		cityId: {
			type: Sequelize.INTEGER,
		},
		areaName: {
			type: Sequelize.STRING,
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
	return pinCodeMaster;
};
