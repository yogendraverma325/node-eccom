export default (sequelize, Sequelize) => {
	const Confirmationformfilledvalues = sequelize.define(
		"confirmationformfilledvalues",
		{
			confirmationformfilledvaluesAutoId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			confirmationinitiatedAutoId: {
				type: Sequelize.INTEGER,
			},
			confirmationFormGroupId: {
				type: Sequelize.INTEGER,
			},
			confirmatoinformfieldsAutoId: {
				type: Sequelize.INTEGER,
			},
			employeeId: {
				type: Sequelize.INTEGER,
			},
			level: {
				type: Sequelize.INTEGER,
			},
			values: {
				type: Sequelize.STRING,
			},
			usedInForm: {
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
		},
	);
	return Confirmationformfilledvalues;
};
