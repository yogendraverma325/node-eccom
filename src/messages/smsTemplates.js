const forgotPasswordSMS = (data) => {
	return {
		template: `Your OTP is ${data.otp}. Please use this code to complete your verification. It will expire in 5 minutes. Keep it secure! Regards, TCPL`,
		templateId: "1007732407543082057"
	}
}


export default {
	forgotPasswordSMS,
};
