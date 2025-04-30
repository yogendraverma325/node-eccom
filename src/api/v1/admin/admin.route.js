import Express from "express";
import adminController from "./admin.controller.js";
import commonController from "../common/common.controller.js";
import authorization from "../../../middleware/authorization.js";

export default Express.Router()
	.post("/addEmployee", adminController.addEmployee)
	.get(
		"/dashboardCard/:for",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		adminController.dashboardCard,
	)
	.post(
		"/unlockAccount",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		adminController.unlockAccount,
	)
	.post(
		"/resetPassword",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		adminController.resetPassword,
	)
	.post(
		"/addBiographicalDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.addBiographicalDetails,
	)
	.put(
		"/updateBiographicalDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.updateBiographicalDetails,
	)
	.get(
		"/getBiographicalDetails/:userId",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.getBiographicalDetails,
	)
	.post(
		"/addFamilyMembers",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.addFamilyMembers,
	)
	.put(
		"/updateFamilyMembers",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.updateFamilyMembers,
	)
	.get(
		"/getFamilyMember/:userId",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.getFamilyMember,
	)
	.get(
		"/getFamilyList/:userId",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.getFamilyList,
	)
	.delete(
		"/deleteFamilyMember",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.deleteFamilyMember,
	)
	.post(
		"/addPaymentDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.addPaymentDetails,
	)
	.put(
		"/updatePaymentDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		commonController.updatePaymentDetails,
	)
	.put(
		"/updateUserStatus",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.updateUserStatus,
	)
	.put(
		"/updateManager",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.updateManager,
	)
	.post(
		"/addJobDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.addJobDetails,
	)
	.get(
		"/searchEmployee",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.searchEmployee,
	)
	.post(
		"/updateEmergencyContact",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateEmergencyContact,
	)
	// .post(
	// 	"/updateAddress",
	// 	authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
	// 	commonController.updateAddress,
	// )
	.get(
		"/getSalutation",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.getSalutation,
	)

	.post(
		"/onboardEmployee",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.onboardEmployee,
	)
	.get(
		"/onboardEmployee",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.getOnboardEmployee,
	)
	.post(
		"/createTMC",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.createTMC,
	)
	.delete(
		"/onboardEmployee/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.changeStatusOnboardEmployee,
	)
	.put(
		"/onboardEmployee/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.updateOnboardEmployee,
	)
	.put(
		"/updatePolicyOfEMP",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		adminController.updatePolicyOfEMP,
	)
	.put(
		"/updateIQDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateIQDetails,
	)
	.delete(
		"/hrDocument/:letterId",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.deleteHRDocument,
	)
	.post(
		"/uploadHRDocuments",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.uploadHRDocuments,
	)
	.patch(
		"/onboardEmployee/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.changeStatusOnboardEmployee,
	)

	.post(
		"/actionOnPaymentDetails",
		authorization("ADMIN", "HR_OPS"),
		commonController.actionOnPaymentDetails,
	)
	//ritak address approval start
	.get(
		"/profileUpdateActionPending",
		authorization("ADMIN", "HR_OPS"),
		commonController.profileUpdateActionPending,
	)
	//ritak address approval end
	.post(
		"/blockLogin",
		// authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.blockLogin,
	)
	.get(
		"/onboardEmployee/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.getOnboardEmployeeDetails,
	)
	// EMPLOYMENT START ROUTES
	.post(
		"/addDesignationEmployment",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.addDesignationEmployment,
	)
	.post(
		"/addDepartmentEmployment",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.addDepartmentEmployment,
	)
	.post(
		"/addCostCenterEmployment",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.addCostCenterEmployment,
	)
	.post(
		"/addCompanyLocationEmployment",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.addCompanyLocationEmployment,
	)
	.post(
		"/addJobLevelEmployment",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.addJobLevelEmployment,
	)
	.post(
		"/addEmployeeTypeEmployment",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.addEmployeeTypeEmployment,
	)

	.post(
		"/requiredAttendanceApproval",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.requiredAttendanceApproval,
	)
	// EMPLOYMENT END ROUTES

	// start add/update notice period by jay
	.put(
		"/updateNoticePeriod",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		adminController.updateNoticePeriod,
	)
	// end add/update notice period by jay

	//ritak address approval start
	.post(
		"/actionOnAddressDetails",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.actionOnAddressDetails,
	)
//ritak address approval end

//ritak Hr Policy start

.get(
	"/getHrPolciyCategoryList",
	authorization("ADMIN", "HR_OPS"),
	commonController.getHrPolciyCategoryList,
)
.post(
	"/hrPolicyCategory",
	authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
	commonController.createHrPolicyCategory,
)
.put(
		"/hrPolicyCategory/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.updateHrPolicyCategory,
	)
	.patch(
		"/hrPolicyCategory/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.changeStatusOfHrPolicyCategory,
	)
	.delete(
		"/hrPolicyCategory/:id",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.deleteOfHrPolicyCategory,
	)

	.get(
		"/getHrPolciyList",
		authorization("ADMIN", "HR_OPS"),
		commonController.getHrPolciyList,
	)
	.post(
		"/hrPolicy",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		commonController.createHrPolicy,
	)
	.put(
			"/hrPolicy/:id",
			authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
			commonController.updateHrPolicy,
		)
		.patch(
			"/hrPolicy/:id",
			authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
			commonController.changeStatusOfHrPolicy,
		)
		.patch(
			"/hrPolicy/archiveAction/:id",
			authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
			commonController.archiveActionOfHrPolicy,
		)
		.delete(
			"/hrPolicy/:id",
			authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
			commonController.deleteOfHrPolicy,
		)

		.post(
			"/user-assignment/createUserAssignment",
			authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
			commonController.createUserAssignment,
		)
		.put(
			"/user-assignment/editUserAssignment/:id",
			authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
			commonController.editUserAssignment,
		)
		.get("/user-assignment/assignment-list", commonController.getUserAssignmentList)

		.get("/user-assignment/process-list", commonController.getUserAssignmentProcessList)
		.get("/user-assignment/attribute-list", commonController.getUserAssignmentAttributeList)
		.get("/user-assignment/attribute-data/:attribute", commonController.getUserAssignmentAttributeData)

		.get("/user-assignment/employees/:id/", commonController.exportEmployeesByUserAssignmentId)

//ritak Hr Policy end
