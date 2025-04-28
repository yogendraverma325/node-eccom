export default (sequelize, Sequelize) => {
	const status_master = sequelize.define("status_master", {
		status_master_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING(45),
		},
		code: {
			type: Sequelize.STRING(45),
		},
		for: {
			type: Sequelize.STRING(45),
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
		updatedAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
		},
	});

	return status_master;
};
