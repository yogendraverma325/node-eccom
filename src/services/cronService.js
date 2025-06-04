import cron from "node-cron";
import cronController from "../api/v1/cron/cron.controller.js";
import attendanceController from "../api/v1/attendance/attendance.controller.js";
import helper from "../helper/helper.js";
import userController from "../api/v1/user/user.controller.js";
import async from 'async'; // imported async pkg for queue implementation
// Create a queue
const cronQueue = async.queue(async (task, done) => {
  try {
    await task();
  } catch (error) {
    console.error('Error processing task:', error);
  }
  done();
}, 2); //concurrency of 2

	const generateConfirmation = async () => { // confirmation generation
	await cronController.generateConfirmation()
	};
	const checkSLAOfConfirmation = async () => { // checkSLAOfConfirmation
	await cronController.checkSLAOfConfirmation()
	};
	const checkConfirmatonHold = async () => { // checkConfirmatonHold
	await cronController.checkConfirmatonHold()
	};
	const checkExtentionEnd = async () => { // checkExtentionEnd
	await cronController.checkExtentionEnd()
	};
	const generatConfiramtionletter = async () => { // generatConfiramtionletter
	await cronController.generatConfiramtionletter()
	};
	const check_comp_off_expiry = async () => { // generatConfiramtionletter
	await cronController.check_comp_off_expiry()
	};
	const getEmpForWishes = async () => { // getEmpForWishes
	await cronController.getEmpForWishes()
	};
	const leaveActivation = async () => { // leaveActivation
	await cronController.leaveActivation();
	};
	const leaveLapse = async () => { // leaveLapse
	   await helper.leaveLapse();
	};
	const leaveCreditMonthCron = async () => { // leaveCreditMonthCron
      await helper.leaveCreditMonthCron();
	
	};
	const leaveRefil = async () => { // leaveRefil
	    await helper.leaveRefil();
	};
	const triggerHrPoliciesToUsersCron = async () => { // triggerHrPoliciesToUsersCron
	  await cronController.triggerHrPoliciesToUsersCron();
	};
	const updateActiveStatus = async () => { // updateActiveStatus
	  await cronController.updateActiveStatus();
	};
	const blockAccess = async () => { // blockAccess
	   await cronController.blockAccess();
	};
	const newJoinEmployee = async () => { // blockAccess
	   await cronController.newJoinEmployee();
	};
	const updateManager = async () => { // updateManager
	   await cronController.updateManager();
	};
	const updatePolicy = async () => { // updatePolicy
	   await cronController.updatePolicy();
	};
	const updateDesignation = async () => { // updateDesignation
	   await cronController.updateDesignation();
	};
	const updateDepartment = async () => { // updateDepartment
	   await cronController.updateDepartment();
	};
	const updateCostCenter = async () => { // updateCostCenter
	   await cronController.updateCostCenter();
	};
	const updateCompanyLocation = async () => { // updateCompanyLocation
	   await cronController.updateCompanyLocation();
	};
	const updateJobLevel = async () => { // updateJobLevel
	   await cronController.updateJobLevel();
	};
	const updateEmployeeType = async () => { // updateEmployeeType
	   await cronController.updateEmployeeType();
	};
	const prePasswordExpiryNotification = async () => { // prePasswordExpiryNotification
	   await cronController.prePasswordExpiryNotification();
	};
	const postPasswordExpiryNotification = async () => { // postPasswordExpiryNotification
	   await cronController.postPasswordExpiryNotification();
	};
	const attendanceCronDaywise = async () => { // attendanceCronDaywise
	 try {
		if (process.env.ENABLE_BIOMETRIC_ATTENDANCE * 1) {
		    await cronController.biometricAttendance();
		}
	} catch (error) {
		console.log(error);
	} finally {
		await attendanceController.attedanceCron();
	}
	};
	const attendanceCronNightwise = async () => { // attendanceCronNightwise
		try {
		if (process.env.ENABLE_BIOMETRIC_ATTENDANCE * 1) {
			await cronController.biometricAttendance();
		}
	} catch (error) {
		console.log(error);
	} finally {
		await attendanceController.attedanceCronEveryNightShift();
	}
	};
	const sendWeeklyPendingtask = async () => { // sendWeeklyPendingtask
		await cronController.sendWeeklyPendingtask()
	};
	
	cron.schedule("0 6 * * *", () => cronQueue.push(generateConfirmation)); // confirmation generation pushed to queue
	cron.schedule("0 6 * * *", () => cronQueue.push(checkSLAOfConfirmation)); // checkSLAOfConfirmation pushed to queue
	cron.schedule("0 6 * * *", () => cronQueue.push(checkConfirmatonHold)); // checkConfirmatonHold pushed to queue
	cron.schedule("0 6 * * *", () => cronQueue.push(checkExtentionEnd)); // checkConfirmatonHold pushed to queue
	cron.schedule("0 6 * * *", () => cronQueue.push(generatConfiramtionletter)); // generatConfiramtionletter pushed to queue
	cron.schedule("0 6 * * *", () => cronQueue.push(check_comp_off_expiry)); // check_comp_off_expiry pushed to queue
	cron.schedule("00 05 * * *", () => cronQueue.push(getEmpForWishes)); // getEmpForWishes pushed to queue
	cron.schedule("30 6 * * *", () => cronQueue.push(leaveActivation)); // leaveActivation pushed to queue
	cron.schedule("30 6 * * *", () => cronQueue.push(leaveLapse)); // leaveLapse pushed to queue
	cron.schedule("10 7 * * *", () => cronQueue.push(leaveCreditMonthCron)); // leaveCreditMonthCron pushed to queue
	cron.schedule("10 7 * * *", () => cronQueue.push(leaveRefil)); // leaveRefil pushed to queue
	cron.schedule("0 23 * * *", () => cronQueue.push(triggerHrPoliciesToUsersCron)); // triggerHrPoliciesToUsersCron pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateActiveStatus)); // updateActiveStatus pushed to queue
	cron.schedule("0 0 * * *", () => cronQueue.push(blockAccess)); // blockAccess pushed to queue
	cron.schedule("0 11,12,13,14 * * *", () => cronQueue.push(newJoinEmployee)); // blockAccess pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateManager)); // updateManager pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updatePolicy)); // updatePolicy pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateDesignation)); // updateDesignation pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateDepartment)); // updateDepartment pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateCostCenter)); // updateCostCenter pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateCompanyLocation)); // updateCompanyLocation pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateJobLevel)); // updateJobLevel pushed to queue
	cron.schedule("*/10 * * * *", () => cronQueue.push(updateEmployeeType)); // updateEmployeeType pushed to queue
	cron.schedule("0 7 * * *", () => cronQueue.push(prePasswordExpiryNotification)); // prePasswordExpiryNotification pushed to queue
	cron.schedule("0 7 * * *", () => cronQueue.push(postPasswordExpiryNotification)); // postPasswordExpiryNotification pushed to queue
	cron.schedule("30 03 * * *", () => cronQueue.push(attendanceCronDaywise)); // attendanceCronDaywise pushed to queue
	cron.schedule("0 */2 * * *", () => cronQueue.push(attendanceCronNightwise)); // attendanceCronNightwise pushed to queue
	cron.schedule("0 7 * * 5", () => cronQueue.push(sendWeeklyPendingtask)); // sendWeeklyPendingtask pushed to queue

// cron.schedule("00 05 * * *", async () => { // commented
	// await cronController.getEmpForWishes();
// });

// cron.schedule("30 03 * * *", async () => { // commented
// 	try {
// 		if (process.env.ENABLE_BIOMETRIC_ATTENDANCE * 1) {
// 			// await cronController.biometricAttendance();
// 		}
// 	} catch (error) {
// 		console.log(error);
// 	} finally {
// 		await attendanceController.attedanceCron();
// 	}
// });

// cron.schedule("0 */2 * * *", async () => { // commented
// 	try {
// 		if (process.env.ENABLE_BIOMETRIC_ATTENDANCE * 1) {
// 			//  await cronController.biometricAttendance();
// 		}
// 	} catch (error) {
// 		console.log(error);
// 	} finally {
// 		await attendanceController.attedanceCronEveryNightShift();
// 	}
// });

// cron.schedule("30 6 * * *", async () => { // commented
	// await cronController.leaveActivation();
	//await helper.leaveLapse();
// });
// cron.schedule("10 8 * * *", async () => { // commented
	//   await helper.leaveCreditMonthCron();
	//  await helper.leaveRefil();
// });

// cron.schedule("0 23 * * *", async () => { / commented
	// 11 PM
	// await cronController.triggerHrPoliciesToUsersCron();
// });
// cron.schedule("*/10 * * * *", async () => {
// 	//
// 	await cronController.triggerHrPoliciesToUsersCron();
// });

// cron.schedule("0 6 * * *", async () => { // commented
	// await cronController.generateConfirmation();
	// await cronController.checkSLAOfConfirmation();
	// await cronController.checkConfirmatonHold();
	// await cronController.checkExtentionEnd();
	// await cronController.generatConfiramtionletter();
	// await cronController.check_comp_off_expiry();
// });

// cron.schedule("*/10 * * * *", async () => {  // commented
	// await cronController.updateManager();
	// await cronController.updatePolicy();
	// await cronController.updateDesignation();
	// await cronController.updateDepartment();
	// await cronController.updateCostCenter();
	// await cronController.updateCompanyLocation();
	// await cronController.updateJobLevel();
	// await cronController.updateEmployeeType();
// });

// cron.schedule("*/10 * * * *", async () => { // commented
	// cronController.updateActiveStatus();
// });

// cron.schedule("0 0 * * *", async () => { // commented
	// await cronController.blockAccess();
// });

// cron.schedule("0 11,12,13,14 * * *", async () => { // commented
	// cronController.newJoinEmployee();
// });

// cron.schedule("0 7 * * *", async () => { // commented
	// await cronController.prePasswordExpiryNotification();
	// await cronController.postPasswordExpiryNotification();
// });

// cron.schedule("0 7 * * 5", async () => {  // commented
// 	cronController.sendWeeklyPendingtask()
// });


export default cron;
