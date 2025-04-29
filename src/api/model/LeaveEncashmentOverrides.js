export default (sequelize, Sequelize) => {
	const leaveEncashmentOverrides = sequelize.define("leavencashmentoverrides", {
		leaveEncashmentAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		// payMonth: {
		// 	type: Sequelize.STRING,
		// },
		leaveEncashmentDays: {
			type: Sequelize.DECIMAL,
		},
		empCode: {
			type: Sequelize.STRING,
		},
		createdBy: {
			type: Sequelize.INTEGER,
			default: null,
		},
		createdAt: {
			type: Sequelize.DATE,
			default: null,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
			default: null,
		},
		updatedAt: {
			type: Sequelize.DATE,
			default: null,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			default: 0,
		},
	});
	return leaveEncashmentOverrides;
};
