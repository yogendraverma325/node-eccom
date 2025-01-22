export default (sequelize, Sequelize) => {
	const jobLevelEmploymentHistory = sequelize.define(
		"joblevelemploymenthistory",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			employeeId: {
				type: Sequelize.INTEGER,
			},
			companyId: {
				type: Sequelize.INTEGER,
			},
			bandId: {
				type: Sequelize.INTEGER,
			},
			gradeId: {
				type: Sequelize.INTEGER,
			},
			jobLevelId: {
				type: Sequelize.INTEGER,
			},
			oldJobLevelId: {
				type: Sequelize.INTEGER,
			},
			needAttendanceCron: {
				type: Sequelize.INTEGER,
			},
			fromDate: {
				type: Sequelize.DATE,
			},
			toDate: {
				type: Sequelize.DATE,
			},
			isPromotion: {
				type: Sequelize.BOOLEAN,
			},
			sourceName: {
				type: Sequelize.STRING,
			},
			status: {
				type: Sequelize.INTEGER,
			},
			createdAt: {
				type: Sequelize.DATE,
			},
			createdBy: {
				type: Sequelize.INTEGER,
			},
			updatedBy: {
				type: Sequelize.INTEGER,
			},
			updatedAt: {
				type: Sequelize.DATE,
			},
		},
	);
	return jobLevelEmploymentHistory;
};
