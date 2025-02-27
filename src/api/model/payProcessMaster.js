export default (sequelize, Sequelize) => {
	const payProcessMaster = sequelize.define("payprocessmaster", {
		payProcessMasterAutoId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(255),
			allowNull: true, // Assuming null values are allowed since not explicitly stated
		},
		description: {
			type: Sequelize.STRING(255),
			allowNull: true,
		},
		processFlowId: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		payMonth: {
			type: Sequelize.STRING,
		},
		companyId: {
			type: Sequelize.INTEGER,
		},
		filterType: {
			type: Sequelize.INTEGER, // default 0 for custom selection
		},
		createdBy: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: true,
			defaultValue: null,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		updatedAt: {
			type: Sequelize.DATE,
			allowNull: true,
			defaultValue: null,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		processType: {
			type: Sequelize.STRING,
			defaultValue: "Payroll", // Payroll, FnF
		},
	});
	return payProcessMaster;
};
