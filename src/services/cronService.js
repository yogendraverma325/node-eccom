import cron from "node-cron";
import cronController from "../api/v1/cron/cron.controller.js";
import attendanceController from "../api/v1/attendance/attendance.controller.js";
import helper from "../helper/helper.js";
import userController from "../api/v1/user/user.controller.js";

cron.schedule("0 30 14 * * *", async () => {
	// 12:01 AM
	await cronController.getEmpForWishes();
});

cron.schedule("30 03 * * *", async () => {
	try {
		// if (process.env.ENABLE_BIOMETRIC_ATTENDANCE * 1) {
		// 	await cronController.biometricAttendance();
		// }
	} catch (error) {
		console.log(error);
	} finally {
		await attendanceController.attedanceCron();
	}
});

cron.schedule("0 * * * *", async () => {
	try {
		// if (process.env.ENABLE_BIOMETRIC_ATTENDANCE * 1) {
		// 	await cronController.biometricAttendance();
		// }
	} catch (error) {
		console.log(error);
	} finally {
		await attendanceController.attedanceCronEveryNightShift();
	}
});

// cron.schedule("* * * * *", async () => {  // 1
//     await cronController.triggerHrPoliciesToUsersCron();
// });
// cron.schedule("30 23 * * *", async () => {  // 1
//     await cronController.triggerHrPoliciesToUsersCron();
// });

// cron.schedule("30 3 * * *", async () => {
// 	await cronController.leaveActivation();
// 	//await helper.leaveLapse();
// });
// cron.schedule("10 8 * * *", async () => {
// 	await helper.leaveCreditMonthCron();
// 	await helper.leaveRefil();
// });

// cron.schedule("0 6 * * *", async () => {
// 	await cronController.generateConfirmation();
// 	await cronController.checkSLAOfConfirmation();
// 	await cronController.checkConfirmatonHold();
// 	await cronController.checkExtentionEnd();
// 	await cronController.generatConfiramtionletter();
// 	await cronController.check_comp_off_expiry();
// });

// cron.schedule("* * * * *", async () => {
// 	await cronController.updateManager();
// 	await cronController.updatePolicy();
// 	await cronController.updateDesignation();
// 	await cronController.updateDepartment();
// 	await cronController.updateCostCenter();
// 	await cronController.updateCompanyLocation();
// 	await cronController.updateJobLevel();
// 	await cronController.updateEmployeeType();
// });

// cron.schedule("* * * * *", async () => {
// 	cronController.updateActiveStatus();
// });

// cron.schedule("0 0 * * *", async () => {
// 	await cronController.blockAccess();
// });

// cron.schedule("0 11,12,13,14 * * *", async () => {
// 	cronController.newJoinEmployee();
// });

// cron.schedule("0 7 * * *", async () => {
// 	await cronController.prePasswordExpiryNotification();
// 	await cronController.postPasswordExpiryNotification();
// });

export default cron;
