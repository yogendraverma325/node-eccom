export default (sequelize, Sequelize) => {
	const Signingauthority = sequelize.define("signingauthority", {
		signingauthorityId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
		},
		companyIds: {
			type: Sequelize.STRING,
		},
		authorityUser: {
			type: Sequelize.INTEGER,
		},
		signature: {
			type: Sequelize.STRING,
		},
		authorityFor: {
			type: Sequelize.STRING,
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
	return Signingauthority;
};
