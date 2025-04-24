export default (sequelize, Sequelize) => {
	const maritalStatusMaster = sequelize.define("maritalstatusmaster", {
		maritalstatusmasterId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(45),
		},
		code: {
			type: Sequelize.STRING(45),
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
	return maritalStatusMaster;
};
