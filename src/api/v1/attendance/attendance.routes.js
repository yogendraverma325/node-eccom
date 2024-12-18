import Express from "express";
import attendanceController from "./attendance.controller.js";
import authorization from "../../../middleware/authorization.js";
export default Express.Router()
  .post("/markAttendance", attendanceController.attendance)
  .post("/regularizeRequest", attendanceController.regularizeRequest)
  .get("/attendanceList", attendanceController.attendanceList)
  .post(
    "/approveRegularizationRequest",
    attendanceController.approveRegularizationRequest
  )
  .get("/regularizeRequestList", attendanceController.regularizeRequestList)
  .put("/revokeRegularizeRequest", attendanceController.revokeRegularizeRequest)
  .post("/attedanceCron", attendanceController.attedanceCron)
  .post("/attedanceCronForEMP", attendanceController.attedanceCronForEMP)
  .get("/attendenceDetails", attendanceController.attendenceDetails)
  .get("/pendingAttendance", attendanceController.pendingAttendanceList)
  .post("/attendanceApproval", attendanceController.attendanceApproval)
  //BULK ACTION
  .get(
    "/regularizeRequestListBulk",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    attendanceController.regularizeRequestListBulk
  )
  .post(
    "/approveRegularizationRequestBulk",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    attendanceController.approveRegularizationRequestBulk
  );
//BULK ACTION
