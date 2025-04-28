export default (sequelize, Sequelize) => {
	const leaveApprovalLevels = sequelize.define("leave_approval_levels", {
		leaveApprovalLevelAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		approvalFlow_Auto_Id: {
			type: Sequelize.INTEGER,
		},
		approval_group: {
			type: Sequelize.STRING(255),
		},
		level: {
			type: Sequelize.INTEGER,
		},
		allowRevoke: {
			type: Sequelize.BOOLEAN,
		},
		includeOthers: {
			type: Sequelize.BOOLEAN,
		},
		empId: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
	});
	return leaveApprovalLevels;
};
