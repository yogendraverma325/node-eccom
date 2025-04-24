export default (sequelize, Sequelize) => {
	const leaveCompanyMapping = sequelize.define("leavecompanymapping", {
		leaveCompanyId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		leaveAutoId: {
			type: Sequelize.INTEGER,
		},
		companyId: {
			type: Sequelize.INTEGER,
		},
		empType: {
			type: Sequelize.STRING,
		},
		defaultLeaveCount: {
			type: Sequelize.DECIMAL(10, 2),
		},
		iterationDistribution: {
			type: Sequelize.DECIMAL(10, 2),
		},
		canCarryForwardAhead: {
			type: Sequelize.BOOLEAN,
		},
		systemGenerated: {
			type: Sequelize.BOOLEAN,
		},
		creditDayOfMonth: {
			type: Sequelize.INTEGER,
		},
		canTakeHalfDay: {
			type: Sequelize.BOOLEAN,
		},
		minConsecutiveDay: {
			type: Sequelize.DECIMAL(10, 1),
			defaltValue: 0,
		},
		maxConsecutiveDay: {
			type: Sequelize.INTEGER,
		},
		attachmentRequired: {
			type: Sequelize.BOOLEAN,
		},
		messageRequired: {
			type: Sequelize.BOOLEAN,
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
		lapse_in_days: {
			type: Sequelize.INTEGER,
		},
		is_back_date_allowed: {
			type: Sequelize.INTEGER,
		},
		back_days_max: {
			type: Sequelize.INTEGER,
		},
		isActive: {
			type: Sequelize.TINYINT,
		},
		is_application_on_holiday_weekly_off: {
			type: Sequelize.INTEGER,
		},
		weekly_prefix_policy: {
			type: Sequelize.INTEGER,
		},
		weekly_suffix_policy: {
			type: Sequelize.INTEGER,
		},
		holiday_prefix_policy: {
			type: Sequelize.INTEGER,
		},
		holiday_suffix_policy: {
			type: Sequelize.INTEGER,
		},
		// max_consecutive_count: {
		// 	type: Sequelize.INTEGER,
		// },
		max_month_count: {
			type: Sequelize.INTEGER,
		},
		can_club_with_other: {
			type: Sequelize.INTEGER,
		},
		club_with_any: {
			type: Sequelize.INTEGER,
		},
		club_with: {
			type: Sequelize.STRING,
		},
		probation_period_leave_validity: {
			type: Sequelize.INTEGER,
		},
		probation_period_leave_validity_duration: {
			type: Sequelize.INTEGER,
		},
		probation_period_leave_validity_duration_type: {
			type: Sequelize.STRING,
		},
		maximum_leave_allowed_in_probation: {
			type: Sequelize.INTEGER,
		},
		genderApplicable: {
			type: Sequelize.STRING, // 1= male 2= female 3= others
		},
		maritalApplicable: {
			type: Sequelize.STRING, // Married: 1,Single: 2, Divorced: 3,Separated: 4, Widowed: 5, Others: 6,
		},
		countInterveningWeekOff: {
			type: Sequelize.INTEGER,
		},
		countInterveningHoliday: {
			type: Sequelize.INTEGER,
		},
		countInterveningNationalHoliday: {
			type: Sequelize.INTEGER,
		},
		messageRequiredafterdays: {
			type: Sequelize.STRING,
		},
		maximum_leave_allowed_in_notice_period: {
			type: Sequelize.INTEGER,
		},
		// carry_foward_un_used: {
		// 	type: Sequelize.INTEGER,
		// },
		creditOn: {
			type: Sequelize.INTEGER,
		},
		creditOnProRataBasis: {
			type: Sequelize.INTEGER,
		},
		creditHalfAfter15Day: {
			type: Sequelize.INTEGER,
		},
		creditFullAfter15dDay: {
			type: Sequelize.INTEGER,
		},
		startCalculatingLeaveFromJoiningDate: {
			type: Sequelize.INTEGER,
		},
		startCalculateLeaveAfterProbation: {
			type: Sequelize.INTEGER,
		},
		roundingInProRataBalance: {
			type: Sequelize.INTEGER,
		},
		creditOnAccuralBasis: {
			type: Sequelize.INTEGER,
		},
		tenureCount: {
			type: Sequelize.INTEGER,
		},
		max_allowed_in_year: {
			type: Sequelize.INTEGER,
		},
		leave_allowed_in_year: {
			type: Sequelize.DECIMAL(10, 1),
			defaltValue: 0,
		},
		approvalFlow: {
			type: Sequelize.INTEGER,
		},
	});
	return leaveCompanyMapping;
};
