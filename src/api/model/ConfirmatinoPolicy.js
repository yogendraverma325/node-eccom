export default (sequelize, Sequelize) => {
	const Confimationpolicy = sequelize.define("confimationpolicy", {
		confimationPolicyAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
		},
		generateOnBeforeDays: {
			type: Sequelize.INTEGER,
		},
		regenerateOnBeforeExtentioEndDays: {
			type: Sequelize.INTEGER,
		},
		confirmationExtention: {
			type: Sequelize.INTEGER,
		},
		confirmationAssignmentAutoId: {
			type: Sequelize.STRING,
		},
		holdDays: {
			type: Sequelize.INTEGER,
		},
		isActive: {
			type: Sequelize.INTEGER,
			defaultValue: 1,
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
	return Confimationpolicy;
};
