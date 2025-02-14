export default (sequelize, Sequelize) => {
	const ptOverrides = sequelize.define("ptoverrides", {
		ptDeductionAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		ptMonth: {
			type: Sequelize.STRING,
		},
		ptAmount: {
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
	return ptOverrides;
};
