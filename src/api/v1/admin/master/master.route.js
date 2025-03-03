import Express from "express";
import commonController from "./master.controller.js";
import authorization from "../../../../middleware/authorization.js";

export default Express.Router()

	// company type master routes
	.post(
		"/company-type",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createCompanyType,
	)
	.get(
		"/company-type-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.companyTypeList,
	)
	.get(
		"/company-type-details/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.companyTypeDetails,
	)
	.put(
		"/company-type/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateCompanyType,
	)
	.patch(
		"/company-type/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfCompanyType,
	)
	.delete(
		"/company-type/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.deleteOfCompanyType,
	)

	// band master routes
	.post(
		"/band",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createBand,
	)
	.get(
		"/band-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.bandList,
	)
	.get(
		"/band-details/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.bandDetails,
	)
	.put(
		"/band/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateBand,
	)
	.patch(
		"/band/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfBand,
	)
	.delete(
		"/band/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.deleteOfBand,
	)

	// job level master routes
	.post(
		"/job-level",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createJobLevel,
	)
	.get(
		"/job-level-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.jobLevelList,
	)
	.get(
		"/job-level-details/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.jobLevelDetails,
	)
	.put(
		"/job-level/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateJobLevel,
	)
	.patch(
		"/job-level/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfJobLevel,
	)
	.delete(
		"/job-level/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.deleteOfJobLevel,
	)

	// Bank master
	.post(
		"/bank",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createBank,
	)
	.get(
		"/bank-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.bankList,
	)
	.patch(
		"/bank/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfBank,
	)
	.put(
		"/bank/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateBank,
	)

	//RITAK WORK
	// Bu master
	.post(
		"/bu",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createBu,
	)
	.get(
		"/bu-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.buList,
	)
	.patch(
		"/bu/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfBu,
	)
	.put(
		"/bu/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateBu,
	)

	// Sbu master
	.post(
		"/sbu",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createSbu,
	)
	.get(
		"/sbu-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.sbuList,
	)
	.patch(
		"/sbu/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfSbu,
	)
	.put(
		"/sbu/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateSbu,
	)

	// Designation master
	.post(
		"/designation",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createDesignation,
	)
	.get(
		"/designation-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.designationList,
	)
	.patch(
		"/designation/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfDesignation,
	)
	.put(
		"/designation/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateDesignation,
	)

	// Grade master
	.post(
		"/grade",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createGrade,
	)
	.get(
		"/grade-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.gradeList,
	)
	.patch(
		"/grade/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfGrade,
	)
	.put(
		"/grade/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateGrade,
	)

	// Degree master
	.post(
		"/degree",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createDegree,
	)
	.get(
		"/degree-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.degreeList,
	)
	.patch(
		"/degree/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfDegree,
	)
	.put(
		"/degree/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateDegree,
	)

	// Holiday master
	// RITAK master
	.post(
		"/holiday",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createHoliday,
	)
	.get(
		"/holiday-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.holidayList,
	)
	.patch(
		"/holiday/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfHoliday,
	)
	.put(
		"/holiday/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateHoliday,
	)
	// New Customer Name master
	.post(
		"/newcustomername",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createNewCustomer,
	)
	.get(
		"/newcustomername-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.NewCustomerList,
	)
	.patch(
		"/newcustomername/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfNewCustomer,
	)
	.put(
		"/newcustomername/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateNewCustomer,
	)

	// Company Master
	.post(
		"/company",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createCompany,
	)
	.get(
		"/company-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.CompanyList,
	)
	.patch(
		"/company/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfCompany,
	)
	.put(
		"/company/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateCompany,
	)

	// cost center master
	.post(
		"/costcenter",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createCostCenter,
	)
	.get(
		"/costcenter-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.costCenterList,
	)
	.patch(
		"/costcenter/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfCostCenter,
	)
	.put(
		"/costcenter/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateCostCenter,
	)

	//RITAK WORK
	// Company Master
	.post(
		"/company",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createCompany,
	)
	.get(
		"/company-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.CompanyList,
	)
	.patch(
		"/company/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfCompany,
	)
	.put(
		"/company/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateCompany,
	)

	// cost center master
	.post(
		"/costcenter",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createCostCenter,
	)
	.get(
		"/costcenter-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.costCenterList,
	)
	.patch(
		"/costcenter/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfCostCenter,
	)
	.put(
		"/costcenter/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateCostCenter,
	)

	// department master routes created by jay
	.post(
		"/department",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createDepartment,
	)
	.get(
		"/department-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.departmentList,
	)
	.put(
		"/department/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateDepartment,
	)
	.patch(
		"/department/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfDepartment,
	)

	// functional area master routes created by jay
	.post(
		"/functionalArea",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createFunctionalArea,
	)
	.get(
		"/functionalArea-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.functionalAreaList,
	)
	.put(
		"/functionalArea/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateFunctionalArea,
	)
	.patch(
		"/functionalArea/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfFunctionalArea,
	)
	//RITAK WORK
	// week off master routes created by jay
	.post(
		"/weekoff",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createWeekoff,
	)
	.get(
		"/weekoff-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.weekoffList,
	)
	.put(
		"/weekoff/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateWeekoff,
	)
	.patch(
		"/weekoff/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfWeekoff,
	)

	// shift master routes created by jay
	.post(
		"/shift",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createShift,
	)
	.get(
		"/shift-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.shiftList,
	)
	.put(
		"/shift/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateShift,
	)
	.patch(
		"/shift/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfShift,
	)

	// attendance policy master routes created by jay
	.post(
		"/attendancePolicy",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createAttendancePolicy,
	)
	.get(
		"/attendancePolicy-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.attendancePolicyList,
	)
	.put(
		"/attendancePolicy/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateAttendancePolicy,
	)
	.patch(
		"/attendancePolicy/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfAttendancePolicy,
	)

	// leave master routes created by jay
	.post(
		"/leave",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createLeave,
	)
	.get(
		"/leave-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.leaveList,
	)
	.put(
		"/leave/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateLeave,
	)
	.patch(
		"/leave/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfLeave,
	)

	// notice period master routes created by jay
	.post(
		"/notice-period",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createNoticePeriod,
	)
	.get(
		"/notice-period-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.noticePeriodList,
	)
	.put(
		"/notice-period/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateNoticePeriod,
	)
	.patch(
		"/notice-period/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfNoticePeriod,
	)

	// pt location master routes created by jay
	.post(
		"/pt-location",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createPtLocation,
	)
	.get(
		"/pt-location-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.ptLocationList,
	)
	.put(
		"/pt-location/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updatePtLocation,
	)
	.patch(
		"/pt-location/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfPtLocation,
	)

	// job level mapping routes
	.get(
		"/job-level-mapping/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.jobLevelMappingList,
	)
	.post(
		"/job-level-mapping",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.jobLevelMapping,
	)

	// department mapping routes
	.get(
		"/department-mapping/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.departmentMappingList,
	)
	.post(
		"/department-mapping",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.departmentMapping,
	)

	// functional area mapping routes
	.get(
		"/functional-area-mapping/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.functionalMappingList,
	)
	.post(
		"/functional-area-mapping",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.functionalMapping,
	)
	// probation master routes created by jay
	.post(
		"/probation",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createProbation,
	)
	.get(
		"/probation-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.probationList,
	)
	.put(
		"/probation/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateProbation,
	)
	.patch(
		"/probation/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfProbation,
	)

	// company location master routes created by jay
	.post(
		"/company-location",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createCompanyLocation,
	)
	.get(
		"/company-location-list",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.companyLocationList,
	)
	.put(
		"/company-location/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateCompanyLocation,
	)
	.patch(
		"/company-location/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfCompanyLocation,
	)

	// lwf master routes created by jay
	.post(
		"/lwf-mapping",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createLWFMapping,
	)
	.get(
		"/lwf-list-mapping",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.lwfMappingList,
	)
	.put(
		"/lwf-mapping",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateLWFMapping,
	)
	.get(
		"/lwf-designation",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.lwfDesignationList,
	)
	.get(
		"/lwf-mapping-details/:stateId/:lwfDesignationId",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.lwfMappingDetails,
	)
	.put(
		"/functional-area-mapping/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateFunctionalAreaMapping,
	)

	.put(
		"/job-level-mapping/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateJobLevelMapping,
	)
	.put(
		"/department-mapping/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateDepartmentMapping,
	);
