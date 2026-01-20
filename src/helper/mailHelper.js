import helper from "./helper.js";
import logger from "./logger.js";
import emailTemplate from "../email/emailTemplate.js";
import html_to_pdf from "html-pdf-node";
import db from "../config/db.config.js"; // IMPORTING DB instance to save confirmation letter to
export default function getAllListeners(eventEmitter) {
	eventEmitter.on("OTP", async (input) => {
		await OTP(input);
	});
			eventEmitter.on("contactus", async (input) => {
			await contactus(input);
			});
}

async function OTP(input) {
	try {
		const inputData = JSON.parse(input);
		const { subject, email } = inputData;
		await helper.mailService({
			to: email,
			subject: 'Your OTP for Verification',
			html: await emailTemplate.otp(inputData),
			mode:"INFO"
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function contactus(input) {
	try {
		const inputData = JSON.parse(input);
		const { subject, email } = inputData;
		await helper.mailService({
			to: email,
			subject: subject,
			html: await emailTemplate.contactus(inputData),
			mode:"CONTACT"
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
