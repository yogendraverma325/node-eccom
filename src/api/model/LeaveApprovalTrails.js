export default (sequelize, Sequelize) => {
	const leaveApprovalTrails = sequelize.define("leaveapprovaltrails", {
		leaveTrailAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		leaveHeaderAutoId: {
			type: Sequelize.INTEGER,
		},
		approvalFlowAutoId: {
			type: Sequelize.INTEGER,
		},
		isVisible: {
			type: Sequelize.BOOLEAN,
		},
		isPending: {
			type: Sequelize.BOOLEAN,
		},
		level: {
			type: Sequelize.INTEGER,
		},
		pendingOn: {
			type: Sequelize.INTEGER,
		},
		isApproved: {
			type: Sequelize.INTEGER,
		},
		remark: {
			type: Sequelize.STRING(255),
		},
		isActive: {
			type: Sequelize.BOOLEAN,
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
		employeeId: {
			type: Sequelize.INTEGER,
		},
		creatorRole: {
			type: Sequelize.STRING,
		},
		updatorRole: {
			type: Sequelize.STRING,
		},
	});
	return leaveApprovalTrails;
};
