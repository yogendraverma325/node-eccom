import Express from "express";
import fnfController from "./fnf.controller.js";
import authentication from "../../../middleware/authentication.js";
import multer from "multer";
const upload = multer({ dest: "uploads/excel/" });
export default Express.Router()
	.post(
		"/employeesCountsForFnfProcess",
		authentication.authenticate,
		fnfController.employeesCountForProcess,
	)
	.get(
		"/employeesListForFnfProcessing",
		authentication.authenticate,
		fnfController.employeesListForFnfProcessing,
	)

	// upload excel sheet routes

	.post(
		"/uploadGratutiy",
		upload.single("excelFile"),
		authentication.authenticate,
		fnfController.uploadGratuity,
	)
	.post(
		"/uploadLeaveEncashment",
		upload.single("excelFile"),
		authentication.authenticate,
		fnfController.uploadLeaveEncashment,
	)
	.post(
		"/uploadPT",
		upload.single("excelFile"),
		authentication.authenticate,
		fnfController.uploadPT,
	)
	.post(
		"/uploadLWF",
		upload.single("excelFile"),
		authentication.authenticate,
		fnfController.uploadLWF,
	)
	.post(
		"/uploadNoticeRecover",
		upload.single("excelFile"),
		authentication.authenticate,
		fnfController.uploadNoticeRecovery,
	)

	// syncing routes
	.post(
		"/currentMonthGratuitySyncing",
		authentication.authenticate,
		fnfController.gratuitySyncing,
	)
	.post(
		"/currentMonthLeaveEncashmentSyncing",
		authentication.authenticate,
		fnfController.leaveEncashmentSyncing,
	)
	.post(
		"/currentMonthPTSyncing",
		authentication.authenticate,
		fnfController.PTSyncing,
	)
	.post(
		"/currentMonthLWFSyncing",
		authentication.authenticate,
		fnfController.LWFSyncing,
	)
	.post(
		"/currentMonthNoticeRecoverySyncing",
		authentication.authenticate,
		fnfController.noticeRecoverySyncing,
	)
	.post("/initiateFnf", authentication.authenticate, fnfController.initiateFnf)
	.post(
		"/processingFNF",
		authentication.authenticate,
		fnfController.processingFNF,
	)
	.post(
		"/exportFnfSalaryRegister",
		authentication.authenticate,
		fnfController.exportFnfSalaryRegister,
	)
	.post(
		"/updateNextStatus",
		authentication.authenticate,
		fnfController.updateNextStatus,
	)
	// sync lop, tds, extra payment and extra deduction
	.post(
		"/currentonthLopSyncing",
		authentication.authenticate,
		fnfController.lopSyncing,
	)
	.post(
		"/currentonthExtraPaymentSyncing",
		authentication.authenticate,
		fnfController.extraPaymentSyncing,
	)
	.post(
		"/extraDeductionSyncing",
		authentication.authenticate,
		fnfController.extraDeductionSyncing,
	)
	.post(
		"/currentonthTdsSyncing",
		authentication.authenticate,
		fnfController.tdsSyncing,
	)

	// upload and sync extra benefits
	.post(
		"/uploadExtraBenefit",
		upload.single("excelFile"),
		authentication.authenticate,
		fnfController.uploadExtraBenefit,
	)
	.post(
		"/currentMonthExtraBenefitSyncing",
		authentication.authenticate,
		fnfController.extraBenefitSyncing,
	)
	.post(
		"/getFnfProcessDetails",
		authentication.authenticate,
		fnfController.getFnfProcessDetails,
	)
	
	.post(
		"/updateGratuityEncahsments",
		authentication.authenticate,
		fnfController.updateGratuityEncahsments,
	)
		.post(
			"/extraPaymentUpload",
			upload.single("excelFile"),
			authentication.authenticate,
			fnfController.extraPaymentUpload,
		)

		.post(
			"/syncDeductions",
			authentication.authenticate,
			fnfController.syncDeductions,
		)
	;

