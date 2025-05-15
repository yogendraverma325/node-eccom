export default (sequelize, Sequelize) => {
	const noticePeriodEmploymentHistory = sequelize.define(
		"noticeperiodemploymenthistory",
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
			noticePeriodAutoId: {
				type: Sequelize.INTEGER,
			},
            oldNoticePeriodAutoId: {
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
	return noticePeriodEmploymentHistory;
};
