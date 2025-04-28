import admin from "firebase-admin";
import db from "../config/db.config.js";
import { Op } from "sequelize";
// import serviceAccount from "../config/firebasePushNotification.json" assert { type: "json" };
import pushNotificationEmitter from "../services/pushNotificationEventService.js";

admin.initializeApp({
	// credential: admin.credential.cert(serviceAccount),
});

// Listen for the "sendNotification" event
export default function pushNotificationListner(eventEmitter) {
	pushNotificationEmitter.on(
		"sendNotification",
		({ title, body, employeeId }) => {
			sendPushNotification(title, body, employeeId);
		},
	);
}

const sendPushNotification = async (title, body, employeeId) => {
	console.log("Sending notification to employeeId:", employeeId);
	try {
		const results = await db.loginDetails.findAll({
			where: {
				employeeId: employeeId,
				firebasetoken: {
					[Op.ne]: null, // Not equal to null
				},
			},
			limit: 1,
			order: [["createdDt", "DESC"]], // Order by createdDt in descending order
		});
		if (results.length > 0) {
			const message = {
				notification: {
					title: title,
					body: body,
				},
				token: results[0].firebasetoken,
			};
			// Send notification
			const response = await admin.messaging().send(message);
			//console.log("Notifications sent successfully:", response);

			await db.pushNotificationHistory.create({
				employeeId,
				title,
				body,
				status: "success",
				response: response,
			});
		}
	} catch (error) {
		//console.log("Error sending notification:", error);
		await db.pushNotificationHistory.create({
			employeeId,
			title,
			body,
			status: "failed",
			response: error.message,
		});
	}
};
