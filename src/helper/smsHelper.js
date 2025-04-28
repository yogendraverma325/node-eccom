import helper from "./helper.js";
import logger from "./logger.js";
import smsTemplate from "../messages/smsTemplates.js";

export default function getAllSMSListeners(eventEmitter) {
	eventEmitter.on("forgotPasswordSMS", async (input) => {
		await forgotPassword(input);
	});
}

const forgotPassword = async (input) => {
	try {
		const userData = JSON.parse(input);
		const forgotSMSTemplate = smsTemplate.forgotPasswordSMS({
			otp: userData.otp,
		});
		await helper.smsService({
			mobile: userData.mobile,
			template: forgotSMSTemplate.template,
			templateId: forgotSMSTemplate.templateId,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
};
