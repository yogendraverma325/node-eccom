const forgotPasswordSMS = (data) => {
	return {
		template: `Dear User, Your Verification Code for Samadhan Mukti is ${data.otp}. Please do not share with others. It remains valid for 5 minutes.`,
		templateId: "1007098871521547880",
	};
};

export default {
	forgotPasswordSMS,
};
