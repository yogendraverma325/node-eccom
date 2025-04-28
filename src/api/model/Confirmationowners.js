export default (sequelize, Sequelize) => {
	const Confirmationowners = sequelize.define("confirmationowners", {
		confirmationownersAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		employeeId: {
			type: Sequelize.INTEGER,
		},
		canTakeAction: {
			type: Sequelize.INTEGER,
		},
		canTakeActionExtend: {
			type: Sequelize.INTEGER,
		},
		level: {
			type: Sequelize.INTEGER,
		},
		confirmationFormGroupId: {
			type: Sequelize.INTEGER,
		},
		confirmationinitiatedAutoId: {
			type: Sequelize.INTEGER,
		},
		slaEndDate: {
			type: Sequelize.DATE,
		},
		isCompleted: {
			type: Sequelize.INTEGER,
		},
		escalted: {
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
	});
	return Confirmationowners;
};
