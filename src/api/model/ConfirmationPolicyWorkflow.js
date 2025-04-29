export default (sequelize, Sequelize) => {
	const Confimationpolicyworkflow = sequelize.define(
		"confimationpolicyworkflow",
		{
			confimationpolicyworkflowAutoId: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},

			maxCompletionDay: {
				type: Sequelize.INTEGER,
			},
			level: {
				type: Sequelize.INTEGER,
			},
			isEnable: {
				type: Sequelize.INTEGER,
			},
			ownerRole: {
				type: Sequelize.STRING,
			},
			confirmationFormGroupId: {
				type: Sequelize.INTEGER,
			},
			confimationPolicyAutoId: {
				type: Sequelize.INTEGER,
			},
			companyId: {
				type: Sequelize.STRING,
			},
		},
	);
	return Confimationpolicyworkflow;
};
