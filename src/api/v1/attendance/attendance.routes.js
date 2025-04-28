import Express from "express";
import attendanceController from "./attendance.controller.js";
import multer from "multer";
import authorization from "../../../middleware/authorization.js";
const upload = multer({ dest: "uploads/excel/" });

export default Express.Router()
	.post("/markAttendance", attendanceController.attendance)
	.post("/regularizeRequest", attendanceController.regularizeRequest)
	.get("/attendanceList", attendanceController.attendanceList)
	.post(
		"/approveRegularizationRequest",
		attendanceController.approveRegularizationRequest,
	)
	.get("/regularizeRequestList", attendanceController.regularizeRequestList)
	.put("/revokeRegularizeRequest", attendanceController.revokeRegularizeRequest)
	.post("/attedanceCron", attendanceController.attedanceCron)
	.post(
		"/attedanceCronEveryNightShift",
		attendanceController.attedanceCronEveryNightShift,
	)
	.post("/attedanceCronForEMP", attendanceController.attedanceCronForEMP)
	.get("/attendenceDetails", attendanceController.attendenceDetails)
	.get("/pendingAttendance", attendanceController.pendingAttendanceList)
	.post("/attendanceApproval", attendanceController.attendanceApproval)
	//BULK ACTION
	.get(
		"/regularizeRequestListBulk",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		attendanceController.regularizeRequestListBulk,
	)
	.post(
		"/approveRegularizationRequestBulk",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		attendanceController.approveRegularizationRequestBulk,
	)
	//BULK ACTION

	//Attedace Roster//
	.post("/attendanceRoster", attendanceController.attendanceRoster)
	.post(
		"/uploadAttendanceRoster",
		upload.single("attendanceroster"),
		attendanceController.uploadAttendanceRoster,
	)
	.post("/cronforEMP", attendanceController.cronforEMP);
//Attendance Roster
