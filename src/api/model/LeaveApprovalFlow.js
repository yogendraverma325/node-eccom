export default (sequelize, Sequelize) => {
	const leaveApprovalFlow = sequelize.define("approval_flow", {
		approvalFlow_Auto_Id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		approvalFlow_Name: {
			type: Sequelize.STRING(255),
		},
		approvalFlow_Code: {
			type: Sequelize.STRING(255),
		},
		maxApprovalLevel: {
			type: Sequelize.INTEGER,
		},
		ccUsers: {
			type: Sequelize.STRING(255),
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
	return leaveApprovalFlow;
};
