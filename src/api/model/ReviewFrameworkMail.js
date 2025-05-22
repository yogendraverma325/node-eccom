export default (sequelize, Sequelize) => {
	const ReviewFrameworkMail = sequelize.define("reviewframeworkmail", {
		reviewkMailId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: {
			type: Sequelize.INTEGER,
		},
		tmc: {
			type: Sequelize.STRING,
		},
		email: {
			type: Sequelize.STRING,
		},
		reviewFrameworkId: {
			type: Sequelize.INTEGER,
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
		isActive: {
			type: Sequelize.BOOLEAN,
		},
	});
	return ReviewFrameworkMail;
};
