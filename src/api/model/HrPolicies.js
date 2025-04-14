export default (sequelize, Sequelize) => {
	const HrPolicies = sequelize.define("hr_policies", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(255),
			allowNull: false,
		},
		category_id: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		policyDocument: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		visibility: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
		sign_off_enabled: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		sign_off_mandatory: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		allow_decline: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
		},
		isActive: {
			type: Sequelize.TINYINT,
			defaultValue: 1,
		},
		effective_date_from: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},
		effective_date_to: {
			type: Sequelize.DATEONLY,
			allowNull: true,
		},
		createdAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
		},
		updatedAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.STRING(10),
		},
		createdBy: {
			type: Sequelize.STRING(10),
		},
	
	});

	return HrPolicies;
};
