import cron from "node-cron";
import cronController from "../api/v1/cron/cron.controller.js";
import attendanceController from "../api/v1/attendance/attendance.controller.js";

cron.schedule("0 6 * * *", async () => {
	await attendanceController.attedanceCron();
});

cron.schedule("0 6 * * *", async () => {
	await cronController.generateConfirmation();
	await cronController.checkSLAOfConfirmation();
	await cronController.checkConfirmatonHold();
	await cronController.checkExtentionEnd();
	await cronController.generatConfiramtionletter();
	await cronController.check_comp_off_expiry();
});

cron.schedule("* * * * *", async () => {
	await cronController.updateManager();
	await cronController.updatePolicy();
	await cronController.updateDesignation();
	await cronController.updateDepartment();
	await cronController.updateCostCenter();
	await cronController.updateCompanyLocation();
	await cronController.updateJobLevel();
	await cronController.updateEmployeeType();
});

cron.schedule("* * * * *", async () => {
	cronController.updateActiveStatus();
});

cron.schedule("50 7 * * *", async () => {
	console.log("cron is running in very seconds");
	//await cronController.EarnedLeaveCreditCron();
});

//cron.schedule("*/10 * * * * *", async () => {
//console.log("cron is running in seconds");
//cronController.EarnedLeaveCreditCron();
//});

// cron.schedule("*/10 * * * * *", async () => {
//   console.log("cron is running in seconds>>>>");
//    cronController.onBoardLeaveMapping();
// });

cron.schedule("0 0 * * *", async () => {
	await cronController.blockAccess();
});

cron.schedule("0 11,12,13,14 * * *", async () => {
	cronController.newJoinEmployee();
});

cron.schedule("0 7 * * *", async () => {
	await cronController.prePasswordExpiryNotification();
	await cronController.postPasswordExpiryNotification();
});

export default cron;
