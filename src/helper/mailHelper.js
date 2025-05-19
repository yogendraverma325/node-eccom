import helper from "./helper.js";
import logger from "./logger.js";
import emailTemplate from "../email/emailTemplate.js";
import html_to_pdf from "html-pdf-node";
export default function getAllListeners(eventEmitter) {
	eventEmitter.on("regularizeRequestMail", async (input) => {
		await regularizationRequestMail(input);
	});

	eventEmitter.on("leaveRequestMail", async (input) => {
		await leaveRequestMail(input);
	});

	eventEmitter.on("resetPasswordMail", async (input) => {
		await resetPasswordMail(input);
	});

	eventEmitter.on("revokeRegularizationMail", async (input) => {
		await revokeRegularizationMail(input);
	});

	eventEmitter.on("regularizeAckMail", async (input) => {
		await regularizeAckMail(input);
	});

	eventEmitter.on("leaveAckMail", async (input) => {
		await leaveAckMail(input);
	});

	eventEmitter.on("forgotPasswordMail", async (input) => {
		await forgotPassword(input);
	});

	eventEmitter.on("revokeLeaveRequest", async (input) => {
		await revokeLeaveRequest(input);
	});

	eventEmitter.on("autoLeaveDeductionMail", async (input) => {
		await autoLeaveDeductionMail(input);
	});

	eventEmitter.on("initiateSeparation", async (input) => {
		await initiateSeparation(input);
	});

	eventEmitter.on("separationUserAcknowledge", async (input) => {
		await separationUserAcknowledge(input);
	});

	eventEmitter.on("separationApprovalAcknowledgementToUser", async (input) => {
		await separationApprovalAcknowledgementToUser(input);
	});

	eventEmitter.on("separationRejectByBUHR", async (input) => {
		await separationRejectByBUHR(input);
	});

	eventEmitter.on("managerRejectsSeparation", async (input) => {
		await managerRejectsSeparation(input);
	});

	eventEmitter.on("managerApprovesSeparation", async (input) => {
		await managerApprovesSeparation(input);
	});

	eventEmitter.on("clearenceInitiated", async (input) => {
		await clearenceInitiated(input);
	});

	eventEmitter.on("separationApproveByBUHR", async (input) => {
		await separationApproveByBUHR(input);
	});

	eventEmitter.on("onboardingEmployeeMail", async (input) => {
		await onboardingEmployeeMail(input);
	});

	eventEmitter.on("paymentDetailsApprovalRequestMail", async (input) => {
		await paymentDetailsApprovalRequest(input);
	});

	eventEmitter.on("paymentDetailsAdminApprovedMail", async (input) => {
		await paymentDetailsAdminApproval(input);
	});

	eventEmitter.on("prePasswordExpiry", async (input) => {
		await prePasswordExpiryNotification(input);
	});

	eventEmitter.on("postPasswordExpiry", async (input) => {
		await postPasswordExpiryNotification(input);
	});
	eventEmitter.on("newJoinEmployeeMail", async (input) => {
		await newJoinEmployeeMail(input);
	});
	//confirmation
	eventEmitter.on("selfReviewConfirnation", async (input) => {
		await selfReviewConfirnation(input);
	});
	eventEmitter.on("confirmationLetter", async (input,doneCallback) => {
		await confirmationLetter(input,doneCallback); 
	});
	eventEmitter.on("confirmatonExtend", async (input) => {
		await confirmatonExtend(input);
	});
	eventEmitter.on("confirmationSLABreachEmailBody", async (input) => {
		await confirmationSLABreachEmailBody(input);
	});
	eventEmitter.on("confirmationWorkflowNextLevel", async (input) => {
		await confirmationWorkflowNextLevel(input);
	});
	//
	eventEmitter.on("confirmationWorkflowNextLevelManager", async (input) => {
		await confirmationWorkflowNextLevelManager(input);
	});//
	eventEmitter.on("compOffMail", async (input) => {
		await compOffMail(input);
	});
	eventEmitter.on("compOffMailApproval", async (input) => {
		await compOffMailApproval(input);
	});
	//confirmation
	eventEmitter.on("x", async (input) => {
		await salarySlipPdf(input);
	});

	//confirmation

	// create method by jay

	eventEmitter.on("releasePaySlip", async (input) => {
		await releasePaySlip(input);
	});

	//ritak address approval start
	eventEmitter.on("addressDetailsApprovalRequestMail", async (input) => {
		await addressDetailsApprovalRequestMail(input);
	});

	eventEmitter.on("addressDetailsAdminActionMail", async (input) => {
		await addressDetailsAdminActionMail(input);
	});
	//ritak address approval end

	// appraisal-goal
	eventEmitter.on("goalSubmission", async (input) => {
		await goalSubmission(input);
	});

	eventEmitter.on("goalRecallSubmission", async (input) => {
		await goalRecallSubmission(input);
	});

	eventEmitter.on("goalWeightageChange", async (input) => {
		await goalWeightageChange(input);
	});

	eventEmitter.on("goalPartiallyActionOrApprovedAll", async (input) => {
		await goalPartiallyActionOrApprovedAll(input);
	});

	eventEmitter.on("goalDeletedNotification", async (input) => {
		await goalDeletedNotification(input);
	});

	// appraisal-goal
	/// Wished Mail
	eventEmitter.on("sendWorkWishMail", async (input) => {
		await sendWorkAnniversaryMailToEmp(input);
	});
	eventEmitter.on("sendBirthWishMail", async (input) => {
		await sendBirthWishMailToEmp(input);
	});
	eventEmitter.on("goalSubmissionByManager", async (input) => {
		await goalSubmissionByManager(input);
	});
	eventEmitter.on("goalPlanAssignToEmployee", async (input) => {
		await goalPlanAssignToEmployee(input);
	});
	///LEAVE REVOKE
	eventEmitter.on("leaveRequestRevokeMail", async (input) => {
		await leaveRequestRevokeMail(input);
	});

	eventEmitter.on("leaveRevokeAckMail", async (input) => {
		await leaveRevokeAckMail(input);
	});
	///LEAVE REVOKE
}

async function regularizationRequestMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.managerEmail,
			subject: `${userData.requesterName} has applied for attendance update`,
			html: await emailTemplate.regularizationRequestMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function leaveRequestMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.managerEmail,
			subject: `${userData.requesterName} has requested for leave`,
			html: await emailTemplate.leaveRequestMail(userData),
			cc: userData.cc,
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function resetPasswordMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Reset Password`,
			html: await emailTemplate.resetPasswordMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function revokeRegularizationMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `${userData.name} has revoked own attendance request`,
			html: await emailTemplate.revokeRegularizeMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function regularizeAckMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your attendance update request has been ${userData.status}.`,
			html: await emailTemplate.regularizationAcknowledgement(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function leaveAckMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your leave request has been ${userData.status}.`,
			html: await emailTemplate.leaveAcknowledgement(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function forgotPassword(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your One-Time Password (OTP)`,
			html: await emailTemplate.forgotPasswordMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function revokeLeaveRequest(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.managerEmail,
			subject: `${userData.empName} has Revoked own leave request`,
			html: await emailTemplate.revokeLeaveRequestMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function autoLeaveDeductionMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: "Auto Leave Deduction",
			html: await emailTemplate.autoLeaveDeduction(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function initiateSeparation(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `${userData.empName}, ${userData.empDesignation} - ${userData.empDepartment} has resigned from the company`,
			html: await emailTemplate.initiateSeparation(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function separationUserAcknowledge(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your separation request is submitted successfully`,
			html: await emailTemplate.separationAcknowledgementToUser(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function separationRejectByBUHR(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `BU HR rejected your resignation ${userData.empName} (${userData.empCode}),`,
			html: await emailTemplate.separationRejectedByBUHR(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function separationApprovalAcknowledgementToUser(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Manager accepted the resignation of Employee`,
			html: await emailTemplate.separationApprovalAcknowledgementToUser(
				userData,
			),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function managerRejectsSeparation(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Rejection by Manager`,
			html: await emailTemplate.managerRejectsSeparation(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function managerApprovesSeparation(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Separation approval of BU HR- ${userData.empName},${userData.empCode},${userData.bu}`,
			html: await emailTemplate.managerApprovesSeparation(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function clearenceInitiated(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Resignation of Member ${userData.empName} (${userData.empCode}) - ${userData.bu} | Clearance initiated`,
			html: await emailTemplate.clearanceInitiated(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function separationApproveByBUHR(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Resignation Acceptance ${userData.empCode}, ${userData.empName}`,
			html: await emailTemplate.separationApproveByBUHR(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function onboardingEmployeeMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Welcome to Team's new HRMS Platform | Login credentials`,
			html: await emailTemplate.onboardingEmployee(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function prePasswordExpiryNotification(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Reminder: Your Password is Set to Expire`,
			html: await emailTemplate.passwordExpiryNotification(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function postPasswordExpiryNotification(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Action Required: Your Password Has Expired`,
			html: await emailTemplate.postPasswordExpiryNotification(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function paymentDetailsApprovalRequest(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>", userData);
		await helper.mailService({
			to: process.env.NEW_EMPLOYEE_JOINING,
			subject: `Your profile update request has been submitted for approval of Salary Payment`,
			html: await emailTemplate.paymentDetailsApprovalRequestMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function paymentDetailsAdminApproval(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your profile update request has been acted upon by Tara Admin`,
			html: await emailTemplate.paymentDetailsAdminApprovedMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function newJoinEmployeeMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: process.env.NEW_EMPLOYEE_JOINING,
			subject: `New Join Employee`,
			html: await emailTemplate.newJoinEmployeeMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

///confitmatoion
async function selfReviewConfirnation(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData in mail template --->>", userData.cc); 
		await helper.mailService({
			to: userData.employee.email,
			cc:userData.cc,
			subject: `Confirmation`,
			html: await emailTemplate.selfReviewConfirnation(userData),
			senderEmail: userData.employee.companymaster.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function confirmationLetter(input,doneCallback) {
	try {
		const inpputData = JSON.parse(input);

		let letter = await emailTemplate.confirmationEmailLetter(
			inpputData?.EMP_DATA_SELF,
			inpputData?.confirmationData,
			inpputData?.signatureAuthority,
		);

		let body = await emailTemplate.confirmationEmailBody(
			inpputData?.EMP_DATA_SELF,
			inpputData?.confirmationData,
			inpputData?.signatureAuthority,
			inpputData?.companyLogo,
		);
		let options = { format: "A4" };
		let file = { content: letter };
			let pdfBuffer=null;
			pdfBuffer = await html_to_pdf.generatePdf(file, options);
		 await helper.mailService({
			to: inpputData?.EMP_DATA_SELF?.email,
			subject: `${inpputData?.EMP_DATA_SELF?.name}_${inpputData?.EMP_DATA_SELF?.empCode}_Confirmation_Letter`,
			html: body,
			cc: inpputData?.cc,
			senderEmail: inpputData.senderEmail,
			attachments: [
				{
					content: pdfBuffer.toString('base64'),
					filename: `${inpputData?.EMP_DATA_SELF?.name}_${inpputData?.EMP_DATA_SELF?.empCode}_Confirmation_Letter.pdf`,
				},
			],
		});
		doneCallback();
		
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function confirmatonExtend(input) {
	try {
		const inpputData = JSON.parse(input);
		await helper.mailService({
		  to: inpputData?.EMP_DATA_SELF?.email,
		  subject: `Confirmation Extension`,
		  cc: inpputData?.cc,
		  html: await emailTemplate.confirmationExtendEmailBody(inpputData),
		  senderEmail: inpputData.senderEmail
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function confirmationSLABreachEmailBody(input) {
	try {
		const inpputData = JSON.parse(input);
		await helper.mailService({
			to: inpputData?.ESCALTERDATA?.email,
			subject: `Confirmation task of ${inpputData?.EMP_DATA?.name}(${inpputData?.EMP_DATA?.empCode}) escalated to you`,
			html: await emailTemplate.confirmationSLABreachEmailBody(inpputData),
			senderEmail: inpputData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function confirmationWorkflowNextLevel(input) {
	try {
		const inpputData = JSON.parse(input);
		console.log("confirmationWorkflowNextLevel --->>", inpputData);
		await helper.mailService({
			to: inpputData?.ESCALTERDATA?.email,
			subject: `Confirmation Workflow Approval Required`,
			html: await emailTemplate.confirmationWorkFlownextLevel(inpputData),
			senderEmail: inpputData?.ESCALTERDATA?.companymaster?.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
///MANAGER
async function confirmationWorkflowNextLevelManager(input) {
	try {
		const inpputData = JSON.parse(input);
		console.log("confirmationWorkflowNextLevel --->>", inpputData);
		await helper.mailService({
			to: inpputData?.ESCALTERDATA?.email,
			subject: `Confirmation Workflow Approval Required`,
			cc:inpputData.cc,
			html: await emailTemplate.confirmationWorkFlownextLevel(inpputData),
			senderEmail: inpputData?.ESCALTERDATA?.companymaster?.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
///MANAGER

async function salarySlipPdf(input) {
	try {
		const inputData = JSON.parse(input);
		let letter = await emailTemplate.salarySlipPdf(inputData);

		let options = { format: "A4" };
		let file = { content: letter };

		let pdfBuffer = await html_to_pdf.generatePdf(file, options);

		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="salary_slip.pdf"`,
		});
		return res.end(pdfBuffer);
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
///confitmatoion

// create function by jay

async function releasePaySlip(input) {
	try {
		const userData = JSON.parse(input);
		let response = await helper.mailService({
			to: userData.email,
			subject: `Payslip has been released`,
			html: await emailTemplate.releasePaySlip(userData),
			senderEmail: userData.senderEmail,
		});
		// console.log("mail helper", response);
		return response;
	} catch (error) {
		console.log(error);
		error.log(error, "ERROR THROWING WHEN SEND MAIL FOR RELEASE SALARY SLIP");
	}
}

//ritak address approval start
async function addressDetailsApprovalRequestMail(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>111", userData.email);
		await helper.mailService({
			to: userData.email,
			subject: `Your profile update request has been submitted for approval of Address Details`,
			html: await emailTemplate.addressDetailsApprovalRequestMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function addressDetailsAdminActionMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your profile update request has been acted upon by Tara Admin`,
			html: await emailTemplate.addressDetailsAdminActionMail(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function compOffMail(input) {
	try {
		const userData = JSON.parse(input);
		let response = await helper.mailService({
			to: userData.email,
			subject: `Comp off request has been raised for ${userData.requesterName}`,
			html: await emailTemplate.compOffMail(userData),
			senderEmail: userData.senderEmail,
		});
		return userData;
	} catch (error) {
		console.log(error);
		error.log(error, "ERROR THROWING WHEN SEND MAIL FOR RELEASE SALARY SLIP");
	}
}
async function compOffMailApproval(input) {
	try {
		const userData = JSON.parse(input);
		let response = await helper.mailService({
			to: userData.email,
			subject: `Comp off request has been ${userData.status == 1 ? "Approved" : "Rejected"} by  ${userData.managerName}`,
			html: await emailTemplate.compOffMailAppval(userData),
			senderEmail: userData.senderEmail,
		});
		return userData;
	} catch (error) {
		console.log(error);
		error.log(error, "ERROR THROWING WHEN SEND MAIL FOR RELEASE SALARY SLIP");
	}
}
//ritak address approval end

// goal-appraisal
async function goalSubmission(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>>", userData);
		await helper.mailService({
			to: userData.email,
			subject: `${userData.name} submitted Goal Plan for your approval`,
			html: await emailTemplate.goalSubmission(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function goalRecallSubmission(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>>", userData);
		await helper.mailService({
			to: userData.email,
			subject: `${userData.name} has recalled changes submitted on the goal plan`,
			html: await emailTemplate.goalRecallSubmission(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function goalWeightageChange(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>>", userData);
		await helper.mailService({
			to: userData.email,
			subject: `Goal is updated on your Goal Plan`,
			html: await emailTemplate.goalWeightageChange(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function goalPartiallyActionOrApprovedAll(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>>", userData);
		await helper.mailService({
			to: userData.email,
			subject: `Partial action taken on your Goal Plan by ${userData.managerName}`,
			html: await emailTemplate.goalPartiallyActionOrApprovedAll(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function goalDeletedNotification(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>>", userData);

		await helper.mailService({
			to: userData.email,
			subject: "Goal deleted",
			html: await emailTemplate.goalDeletedNotification(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}

async function goalSubmissionByManager(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData>>>>>>", userData);
		await helper.mailService({
			to: userData.email,
			subject: `${userData.managerName} has acted on your Goal Plan`,
			html: await emailTemplate.goalSubmissionByManager(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
// goal-appraisal
//Wished Mail
async function sendWorkAnniversaryMailToEmp(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData", userData);
		let response = await helper.mailService({
			to: userData.userEmail,
			subject: `Best wishes on your work anniversary!`,
			html: await emailTemplate.sendWorkAnniversaryMail(userData),
			cc: userData.cc,
			senderEmail: userData.senderEmail,
		});
		// console.log("mail helper", response);
		return response;
	} catch (error) {
		console.log(error);
		error.log(error, "Error while sending work anniversary mail");
	}
}

async function sendBirthWishMailToEmp(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData", userData);
		let response = await helper.mailService({
			to: userData.userEmail,
			subject: `Wishing you a Happy Birthday!`,
			html: await emailTemplate.sendBirthWishMailToEmp(userData),
			cc: userData.cc,
			senderEmail: userData.senderEmail,
		});
		// console.log("mail helper", response);
		return response;
	} catch (error) {
		console.log(error);
		error.log(error, "Error while sending birthday wish mail");
	}
}

async function goalPlanAssignToEmployee(input) {
	try {
		const userData = JSON.parse(input);
		console.log("userData", userData);
		let response = await helper.mailService({
			to: userData.email,
			subject: `Goal Plan`,
			html: await emailTemplate.goalPlanAssignToEmployee(userData),
			cc: userData.cc,
			senderEmail: userData.senderEmail,
		});
		// console.log("mail helper", response);
		return response;
	} catch (error) {
		console.log(error);
		error.log(error, "Error while sending birthday wish mail");
	}
}
///LEAVE REVOKE
async function leaveRequestRevokeMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.managerEmail,
			subject: `${userData.requesterName} requested for revoke of leave`,
			html: await emailTemplate.leaveRequestMail(userData),
			cc: userData.cc,
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
async function leaveRevokeAckMail(input) {
	try {
		const userData = JSON.parse(input);
		await helper.mailService({
			to: userData.email,
			subject: `Your leave Revoke request has been ${userData.status}.`,
			html: await emailTemplate.leaveAcknowledgementRevoke(userData),
			senderEmail: userData.senderEmail,
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
	}
}
///LEAVE REVOKE
