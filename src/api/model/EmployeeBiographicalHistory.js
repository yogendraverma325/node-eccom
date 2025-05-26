export default (sequelize, Sequelize) => {
	const employeeBiographicalDetails = sequelize.define("employeebiographicaldetailshistory", {
		biographicalHistoryId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		biographicalId: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		userId: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		nationality: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		maritalStatus: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
		},
		mobileAccess: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
		},
		laptopSystem: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		backgroundVerification: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
		},
		maritalStatusSince: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		gender: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		dateOfBirth: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		nomineeName: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		nomineeRelation: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		createdBy: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: true,
		},

	})

	return employeeBiographicalDetails;
}