import Express from "express";
import LeaveController from "./leave.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";
export default Express.Router()
	.get("/history", LeaveController.history)
	.get("/list", LeaveController.leaveMapping)
	.get("/leaveRequestList", LeaveController.leaveRequestList)
	.post("/updateLeaveRequest", LeaveController.updateLeaveRequest)
	.post("/requestForLeave", LeaveController.requestForLeave)
	.post("/revokeLeaveRequest", LeaveController.revokeLeaveRequest)
	.post(
		"/leaveRemainingCount",
		authentication.authenticate,
		LeaveController.leaveRemainingCount,
	)
	.get(
		"/leaveHistory/:year",
		authentication.authenticate,
		LeaveController.leaveHistory,
	)
	.get(
		"/leaveHistoryDetails",
		authentication.authenticate,
		LeaveController.leaveHistoryDetails,
	)
	.put(
		"/leaveIdUpdateForOffRole",
		authentication.authenticate,
		LeaveController.leaveIdUpdateForOffRole,
	)
	.post(
		"/leaveAssignEmployee",
		authentication.authenticate,
		LeaveController.leaveAssignEmployee,
	)
	.post(
		"/leaveAssignEmployeeToAll",
		authentication.authenticate,
		LeaveController.leaveAssignEmployeeToAll,
	)
	//BULK ACTION
	.get(
		"/leaveRequestListBulk",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		LeaveController.leaveRequestListBulk,
	)
	.post(
		"/updateLeaveRequestBulk",
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
		LeaveController.updateLeaveRequestBulk,
	)
	.post(
		"/leaveCreditToEmp",
		authentication.authenticate,
		LeaveController.leaveCreditMonthCron,
	)
	.post("/leaveLapse", authentication.authenticate, LeaveController.leaveLapse)
	.post("/leaveRefil", authentication.authenticate, LeaveController.leaveRefil)
	//BULK ACTION

	//REVOKE
	.post(
		"/revokeApprovedLeaves",
		authentication.authenticate,
		LeaveController.revokeApprovedLeaves,
	)
	.post(
		"/approvedLeaverevoke",
		authentication.authenticate,
		LeaveController.approvedLeaverevoke,
	)
	.post(
		"/revokeLeaverevokeRequest",
		authentication.authenticate,
		LeaveController.revokeLeaverevokeRequest,
	)
	.get(
		"/revokeLeaveRequestPendingForApproval",
		authentication.authenticate,
		LeaveController.revokeLeaveRequestPendingForApproval,
	);
//REVOKE
