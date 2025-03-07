import Express from "express";
import masterExportController from "./export.controller.js";
import authentication from "../../../middleware/authentication.js";
import multer from "multer";
import rateLimit from "../../../middleware/rateLimit.js";
import authorization from "../../../middleware/authorization.js";

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });
const upload = multer({ dest: "uploads/excel/" });

export default Express.Router()
	.get("/employee", rateLimit.limiter, masterExportController.employee)
	.get("/employeeRedis", masterExportController.employeeRedis)
	.get(
		"/employeeImport",
		upload.single("excelFile"),
		masterExportController.employeeImport,
	)
	.get(
		"/employeeImportNew",
		upload.single("excelFile"),
		masterExportController.employeeImportNew,
	)
	.post("/employeeMissedData", masterExportController.employeeMissedData)
	.get(
		"/allAttendancePunchDetails",authentication.authenticate,
		masterExportController.allAttendancePunchDetails,
	)
	.get("/attendanceSummary",authentication.authenticate, masterExportController.attendanceSummary)
	.get(
		"/employeeMasterExport",
		authentication.authenticate,
		masterExportController.employeeMasterExport,
	)
	.get("/sperationPending",authentication.authenticate, masterExportController.sperationPending)
	.get("/sperationApproved",authentication.authenticate, masterExportController.sperationApproved)
	.get(
		"/sperationApprovedHistory",authentication.authenticate,
		masterExportController.sperationApprovedHistory,
	)
	.get("/shiftAndWeekOff", masterExportController.shiftAndWeekOff)
	
	.get("/separationWorkflow",authentication.authenticate, masterExportController.separationWorkflow)

	.get("/attendanceAssignment",authentication.authenticate, masterExportController.attendanceAssignment)

	.get("/pendingAttendanceRequest",authentication.authenticate, masterExportController.pendingAttendanceRequest)

	.get("/approvedAttendanceRequest",authentication.authenticate, masterExportController.approvedAttendanceRequest)

	.get("/familyDetails",authentication.authenticate, masterExportController.familyDetails)

	.get("/LeaveBalance",authentication.authenticate, masterExportController.LeaveBalance)

	.get("/pendingLeave",authentication.authenticate, masterExportController.pendingLeave)

	.get("/leaveTaken",authentication.authenticate, masterExportController.leaveTaken);







