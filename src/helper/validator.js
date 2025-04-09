import Joi from "joi";
import moment from "moment";

const passwordRegex =
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;,<.>?/~\\-]).{8,}$/;

const loginSchema = Joi.object({
	tmc: Joi.string().required().label("TMC"),
	password: Joi.string().required().label("Password"),
});

const userCreationSchema = Joi.object({
	name: Joi.string().trim().required().label("Name"),
	email: Joi.string().trim().email().required().label("Email"),
	personalEmail: Joi.string().trim().email().required().label("Personal Email"),
	firstName: Joi.string().trim().required().label("First Name"),
	lastName: Joi.string().trim().required().label("Last Name"),

	panNo: Joi.string().trim().required().label("PAN Number"),
	esicNo: Joi.string().trim().required().label("ESIC Number"),
	uanNo: Joi.string().trim().required().label("UAN Number"),
	pfNo: Joi.string().trim().required().label("PF Number"),
	employeeType: Joi.number().required().label("Employee Type"),
	image: Joi.string().allow(""),

	officeMobileNumber: Joi.string()
		.trim()
		.length(10)
		.label("Office Mobile Number"),
	personalMobileNumber: Joi.string()
		.trim()
		.length(10)
		.required()
		.label("Office Mobile Number"),
	manager: Joi.number().required().label("Manager"),
	designation_id: Joi.number().required().label("Designation"),
	functionalAreaId: Joi.number().required().label("Functional Area"),
	buId: Joi.number().required().label("Business Unit"),

	sbuId: Joi.number().required().label("Sub Business Unit"),
	shiftId: Joi.number().required().label("Shift"),
	departmentId: Joi.number().required().label("Department"),
	companyId: Joi.number().required().label("Company"),
	buHRId: Joi.number().required().label("Business Unit HR"),
	buHeadId: Joi.number().required().label("Business Unit Head"),

	attendancePolicyId: Joi.number().required().label("Attendance Policy"),
	companyLocationId: Joi.number().required().label("Company Location"),
	weekOffId: Joi.number().required().label("Week Off"),
});

const attendanceSchema = Joi.object({
	locationType: Joi.string().trim().max(250).label("Location Type"),
	remark: Joi.string().trim().max(250).label("Remark").allow(""),
	location: Joi.string().trim().label("Location"),
	latitude: Joi.string().trim().label("Latitude"),
	longitude: Joi.string().trim().label("Longitude"),
});

const regularizeRequest = Joi.object({
	fromDate: Joi.string().trim().label("From Date"),
	toDate: Joi.string().trim().label("To Date"),
	locationType: Joi.string().label("Location Type"),
	punchInTime: Joi.string().label("Punch In Time"),
	punchOutTime: Joi.string().label("Punch Out Time"),
	reason: Joi.string().label("Reason"),
	attendanceAutoId: Joi.number(),
	remark: Joi.string().trim().required().max(100).label("Remark"),
});

const approveRegularizationRequestSchema = Joi.object({
	status: Joi.number().valid(0, 1),
	regularizeId: Joi.string(),
	remark: Joi.string()
		.trim()
		.max(100)
		.when("status", {
			is: Joi.number().valid(0),
			then: Joi.required().label("Remark"),
			otherwise: Joi.optional().allow("").label("Remark"),
		}),
});

const bankDetailsSchema = Joi.object({
	userId: Joi.number().optional(),
	paymentAccountNumber: Joi.string().required(),
	paymentBankName: Joi.string().required(),
	paymentBankIfsc: Joi.string().required(),
	paymentHolderName: Joi.string().required(),
});

const unlockAccountSchema = Joi.object({
	employeeCode: Joi.string().trim().required().label("Employee Code"),
});

const updateBiographicalDetailsSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	maritalStatus: Joi.number().allow(null).required().label("Marital Status"),
	mobileAccess: Joi.number().label("Mobile Access").optional(),
	laptopSystem: Joi.string().trim().label("System").optional(),
	nationality: Joi.string()
		.trim()
		.label("Nationality")
		.min(3)
		.max(30)
		.required(),
	middleName: Joi.string()
		.trim()
		.label("Middle Name")
		.allow(null)
		.max(30)
		.optional(),
	lastName: Joi.string()
		.trim()
		.label("Last Name")
		.allow(null)
		.max(30)
		.optional(),
	backgroundVerification: Joi.number()
		.label("Background Verification")
		.optional(),
	gender: Joi.string().trim().label("Gender").allow(null).optional(),
	dateOfBirth: Joi.string()
		.trim()
		.label("Date of Birth")
		.allow(null)
		.optional(),
	maritalStatusSince: Joi.string()
		.trim()
		.label("Marital Status Since")
		.allow(null)
		.optional(),
	salutationId: Joi.number().required().label("Salutation"),
	firstName: Joi.string()
		.trim()
		.label("First Name")
		.allow(null)
		.max(30)
		.optional(),
	mobileAdmin: Joi.number().label("Mobile Admin").optional(),
	dataCardAdmin: Joi.number().label("Data Card").optional(),
	visitingCardAdmin: Joi.number().label("Visiting Card").optional(),
	workstationAdmin: Joi.number().label("Work Station").optional(),
	lastIncrementDate: Joi.string()
		.allow(null)
		.label("Last Increment Date")
		.optional(),
	iqTestApplicable: Joi.number().label("IQ Test Applicable").optional(),
	recruiterName: Joi.string()
		.trim()
		.label("Recruiter Name")
		.allow(null)
		.max(30)
		.optional(),
	nomineeName: Joi.string()
		.trim()
		.label("Nominee Name")
		.allow(null)
		.max(30)
		.optional(),
	nomineeRelation: Joi.string()
		.trim()
		.label("Nominee Relation")
		.allow(null)
		.max(30)
		.optional(),
	offRoleCTC: Joi.number().allow(null).label("Off Role CTC"),
	highestQualification: Joi.number().allow(null).label("Highest Qualification"),
	ESICPFDeduction: Joi.string().allow(null).label("ESIC/PF Deduction"),
	fatherName: Joi.string().trim().allow(null).label("Father Name"),
});

const addFamilyDetailsSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	name: Joi.string().required().trim().label("Name").allow(null).optional(),
	dob: Joi.string().trim().label("DOB").allow(null).optional(),
	gender: Joi.string().trim().label("Gender").allow(null).optional(),
	mobileNo: Joi.string()
		.trim()
		.label("Mobile Number")
		.allow(null)
		.min(10)
		.max(10)
		.optional(),
	relationWithEmp: Joi.string().trim().label("Relation").allow(null).optional(),
	memberAddress: Joi.string().trim().label("Address").allow(null).optional(),
});

const updateFamilyDetailsSchema = Joi.object({
	empFamilyDetailsId: Joi.number().required().required(),
	name: Joi.string().required().trim().label("Name").allow(null).optional(),
	dob: Joi.string().trim().label("DOB").allow(null).optional(),
	gender: Joi.string().trim().label("Gender").allow(null).optional(),
	mobileNo: Joi.string()
		.trim()
		.label("Mobile Number")
		.min(10)
		.max(10)
		.allow(null)
		.optional(),
	relationWithEmp: Joi.string().trim().label("Relation").allow(null).optional(),
	memberAddress: Joi.string().trim().label("Address").allow(null).optional(),
});

const addEducationDetailsSchema = Joi.object({
	educationDegree: Joi.number().integer().allow(null).required(),
	educationInstitute: Joi.string().allow(null).required(),
	educationSpecialisation: Joi.string().allow(null).required(),
	educationStartDate: Joi.date().iso().allow(null).required(),
	educationCompletionDate: Joi.date()
		.iso()
		.allow(null)
		.greater(Joi.ref("educationStartDate"))
		.messages({
			"date.greater": "End date must be greater than the start date",
		})
		.required(),
	educationAttachments: Joi.string().allow("").optional(),
	educationRemark: Joi.string().allow(null).optional(),
	educationActivities: Joi.string().allow(null).optional(),
	userId: Joi.number().integer().allow(null).required(),
	isHighestEducation: Joi.boolean().allow(null).optional(),
});

const updateEducationDetailsSchema = Joi.object({
	educationActivities: Joi.string().allow(null).optional(),
	educationAttachments: Joi.string().allow("").optional(),
	educationDegree: Joi.number().integer().allow(null).required(),
	educationId: Joi.number().integer().required(),
	educationInstitute: Joi.string().allow(null).required(),
	educationRemark: Joi.string().allow(null).required(),
	educationSpecialisation: Joi.string().allow(null).required(),
	educationStartDate: Joi.date().iso().allow(null).required(),
	educationCompletionDate: Joi.date()
		.iso()
		.allow(null)
		.greater(Joi.ref("educationStartDate"))
		.messages({
			"date.greater": "End date must be greater than the start date",
		})
		.required(),
	isHighestEducation: Joi.boolean().allow(null).optional(),
	userId: Joi.number().integer().required(),
});

const updatePaymentDetailsSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	paymentAccountNumber: Joi.string().trim().required().label("Account Number"),
	paymentBankName: Joi.string().trim().required().label("Bank Name"),
	paymentBankIfsc: Joi.string()
		.trim()
		.required()
		.max(20)
		.label("Bank Ifsc Code"),
	paymentHolderName: Joi.string()
		.trim()
		.required()
		.label("Account Holder Name"),
});

const requestForPaymentApprovalSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	bankId: Joi.number().label("Bank Name").optional(),
	paymentAccountNumber: Joi.string().trim().required().label("Account Number"),
	paymentBankName: Joi.string().trim().required().label("Bank Name"),
	paymentAttachment: Joi.string().allow("").optional(),
	supportingDocument: Joi.string().allow("").optional(),
	comment: Joi.string().optional(),
	paymentBankIfsc: Joi.string()
		.trim()
		.required()
		.max(20)
		.label("Bank Ifsc Code"),
	paymentHolderName: Joi.string()
		.trim()
		.required()
		.label("Account Holder Name"),
});

const actionPaymentSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	bankId: Joi.number().label("Bank Name"),
	paymentAccountNumber: Joi.string().trim().label("Account Number").optional(),
	paymentBankName: Joi.string().trim().label("Bank Name").optional(),
	paymentAttachment: Joi.string().allow("").optional(),
	supportingDocument: Joi.string().allow("").optional(),
	paymentBankIfsc: Joi.string()
		.trim()
		.required()
		.max(20)
		.label("Bank Ifsc Code")
		.optional(),
	paymentHolderName: Joi.string()
		.trim()
		.label("Account Holder Name")
		.optional(),
	status: Joi.number(),
	comment: Joi.string().allow("").optional(),
});

const addPaymentDetailsSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	paymentAccountNumber: Joi.string()
		.trim()
		.max(20)
		.required()
		.label("Account Number"),
	paymentBankName: Joi.string().trim().required().label("Bank Name"),
	paymentBankIfsc: Joi.string()
		.trim()
		.required()
		.min(11)
		.max(11)
		.label("Bank Ifsc Code"),
	paymentHolderName: Joi.string()
		.trim()
		.allow(null)
		.optional()
		.label("Account Holder Name"),
	ptStateId: Joi.number().allow(null),
	ptLocationId: Joi.number().allow(null),
	ptApplicability: Joi.boolean().optional(),
	tdsApplicability: Joi.boolean().optional(),
	itrFiling: Joi.boolean().optional(),
	paymentAttachment: Joi.string()
		.label("Payment Attachemnt")
		.allow("")
		.optional(),
	bankId: Joi.number().required(),
});

const deleteFamilyMemberDetailsSchema = Joi.object({
	empFamilyDetailsId: Joi.number().required(),
});

const updateLeaveRequest = Joi.object({
	employeeLeaveTransactionsIds: Joi.string()
		.trim()
		.required()
		.label("Leave ID"),
	status: Joi.string()
		.trim()
		.required()
		.valid("approved", "rejected")
		.label("status"),
	remark: Joi.string()
		.trim()
		.max(100)
		.when("status", {
			is: Joi.string().valid("rejected"),
			then: Joi.required().label("Remark"),
			otherwise: Joi.optional().allow("").label("Remark"),
		}),
});

const leaveRequestSchema = Joi.object({
	attachment: Joi.string().allow("").optional(),
	employeeId: Joi.number().required().label("Employee ID"),
	leaveAutoId: Joi.number().required().label("Leave Type"),
	recipientsIds: Joi.string().optional().allow(""),
	fromDate: Joi.date().required(),
	toDate: Joi.date().required().min(Joi.ref("fromDate")),
	firstDayHalf: Joi.number().optional().valid(0, 1, 2),
	lastDayHalf: Joi.number().optional().valid(0, 1, 2),
	reason: Joi.string().optional().max(45),
	message: Joi.string().trim().max(100).label("Message").allow(""),
}).options({ abortEarly: false });

const revoekLeaveRequest = Joi.object({
	employeeLeaveTransactionsIds: Joi.string()
		.trim()
		.required()
		.label("Leave ID"),
});

const attendanceDetails = Joi.object({
	employeeId: Joi.number().required().label("Employee ID"),
});

const changePasswordSchema = Joi.object({
	password: Joi.string()
		.trim()
		.max(14)
		.min(8)
		.pattern(new RegExp(passwordRegex))
		.required()
		.label("Password")
		.messages({
			"string.pattern.base":
				"Password should contain at least Uppercase, Lowercase, Special Character, and Number",
		}),
});

const remainingLeaves = Joi.object({
	leaveAutoId: Joi.number().required().label("Leave Type"),
	employeeFor: Joi.number().required().label("For Employee"),
	startDate: Joi.date().required(),
	endDate: Joi.date().required().min(Joi.ref("startDate")),
	leaveFirstHalf: Joi.number().required(),
	leaveSecondHalf: Joi.number().required(),
});

const addJobDetailsSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	dateOfJoining: Joi.string().label("Date Of Joining").optional(),
	probationPeriod: Joi.number().label("Probation Period").optional(),
	languagesSpoken: Joi.string().label("Language Spoken").allow(null).optional(),
	esicNumber: Joi.string()
		.label("ESIC Number")
		.allow(null)
		.min(17)
		.max(17)
		.optional(),
	uanNumber: Joi.string()
		.label("UAN Number")
		.allow(null)
		.min(12)
		.max(12)
		.optional(),
	epsApplicability: Joi.boolean().allow(null).label("EPS Applicability"),
	esicApplicable: Joi.boolean().allow(null).label("ESIC Applicable"),
	lwfApplicable: Joi.boolean().allow(null).label("LWF Applicable"),
	pfRestricted: Joi.boolean().allow(null).label("PF Restricted"),
	pfApplicability: Joi.boolean().allow(null).label("PF Applicability"),
	epfApplicable: Joi.boolean().allow(null).label("EPF Applicable"),
	pfNumber: Joi.string().allow(null).label("PF Number").optional(),
	lwfDesignation: Joi.number().allow(null).label("LWF Designation").optional(),
	lwfState: Joi.number().allow(null).label("LWF State").optional(),
	restrictCompanyPf: Joi.boolean().allow(null).label("Restrict Company PF"),
	pranNumber: Joi.string().allow(null).label("PRAN Number").optional(),
	npsNumber: Joi.string().allow(null).label("NPS Number").optional(),
	companyLocationId: Joi.number()
		.allow(null)
		.label("Company Location")
		.optional(),
	unionId: Joi.number().allow(null).label("Union Code").optional(),
	bandId: Joi.number().allow(null).label("Band").optional(),
	gradeId: Joi.number().allow(null).label("Grade").optional(),
	jobLevelId: Joi.number().allow(null).label("Job Level").optional(),
	residentEng: Joi.boolean().allow(null).label("Resident Engineer").optional(),
	customerName: Joi.string().allow(null).label("Customer Name").optional(),
	projectCode: Joi.string().trim().allow(null).label("Project Code"),
	customerCode: Joi.string().trim().allow(null).label("Customer Code"),
	nextAppraisalDue: Joi.string().trim().allow(null).label("Next Appraisal Due"),
});

const updateManagerSchema = Joi.array()
	.required()
	.items(
		Joi.object({
			user: Joi.number().required().label("User"),
			manager: Joi.number().required().label("Manager"),
			date: Joi.string().label("Date").required(),
			id: Joi.number().allow(null),
		}),
	)
	.messages({
		"array.base": "Please Select Atleaset One User",
	});

const updateProfilePictureSchema = Joi.object({
	user: Joi.number().required().label("User"),
	image: Joi.string(),
});

const emergencyContactDetails = Joi.object({
	userId: Joi.number().label("User ID"),
	emergencyContactName: Joi.string()
		.label("Emergency Contact Name")
		.allow(null)
		.optional(),
	emergencyContactNumber: Joi.string()
		.label("Emergency Contact Number")
		.allow(null)
		.min(10)
		.max(10)
		.optional(),
	emergencyContactRelation: Joi.string()
		.label("Emergency Contact Relation")
		.allow(null)
		.optional(),
	emergencyBloodGroup: Joi.string().label("Blood Group").allow(null).optional(),
});

const forgotPasswordSchema = Joi.object({
	email: Joi.string().trim().required().label("Email / Mobile"),
});

const employeeUpdateInfo = Joi.object({
	userId: Joi.number().label("User ID").optional(),
	adhrNo: Joi.string()
		.trim()
		.min(12)
		.max(12)
		.required()
		.label("Aadhaar Number"),
	panNo: Joi.string().min(10).max(10),
	drivingLicence: Joi.string().allow(null).max(20).optional(),
	passportNumber: Joi.string().allow(null).max(20).optional(),
});

const addemployeeWorkInfo = Joi.object({
	userId: Joi.number().label("User ID").optional(),
	companyName: Joi.string().label("Company Name").allow(null).optional(),
	jobTitle: Joi.string().label("Job Title").allow(null).optional(),
	jobLocation: Joi.string().label("Job Location").allow(null).optional(),
	currentlyWorking: Joi.number()
		.label("Currently Working")
		.allow(null)
		.optional(),
	fromDate: Joi.string().label("From Date").allow(null).optional(),
	toDate: Joi.string().label("to Date").allow(null).optional(),
	jobSummary: Joi.string().label("job Summary").allow(null).optional(),
	Skills: Joi.string().label("skill").allow(null).optional(),
	experienceletter: Joi.string()
		.label("experience letter")
		.allow("")
		.optional(),
});

const updateemployeeWorkInfo = Joi.object({
	userId: Joi.number().label("User ID").optional(),
	workExperienceId: Joi.number().label("Work Id").required(),
	companyName: Joi.string().label("Company Name").allow(null).optional(),
	jobTitle: Joi.string().label("Job Title").allow(null).optional(),
	jobLocation: Joi.string().label("Job Location").allow(null).optional(),
	currentlyWorking: Joi.number()
		.label("Currently Working")
		.allow(null)
		.optional(),
	fromDate: Joi.string().label("From Date").allow(null).optional(),
	toDate: Joi.string().label("to Date").allow(null).optional(),
	jobSummary: Joi.string().label("job Summary").allow(null).optional(),
	Skills: Joi.string().label("skill").allow(null).optional(),
	experienceletter: Joi.string()
		.label("experience letter")
		.allow("")
		.optional(),
});

const addEmployeeCertificates = Joi.object({
	userId: Joi.number().label("User ID").required(),
	certification: Joi.string().label("certification").allow(null).optional(),
	expiryDate: Joi.string().label("Expiry Date").allow(null).optional(),
	programName: Joi.string().label("Program Name").allow(null).optional(),
	skillProduct: Joi.string().label("Skill Product").allow(null).optional(),
	oem: Joi.string().label("OEM").allow(null).optional(),
	completionStatus: Joi.string().label("Status").allow(null).optional(),
	certificationAndValidityFirst: Joi.string()
		.label("Certification And Validity")
		.allow(null)
		.optional(),
	certificationAndValiditySecond: Joi.string()
		.label("Certification And Validity")
		.allow(null)
		.optional(),
});

const updateEmployeeCertificates = Joi.object({
	userId: Joi.number().label("User ID").optional(),
	certificateId: Joi.number().label("User ID").optional(),
	certification: Joi.string().label("certification").allow(null).optional(),
	expiryDate: Joi.string().label("Expiry Date").allow(null).optional(),
	programName: Joi.string().label("Program Name").allow(null).optional(),
	skillProduct: Joi.string().label("Skill Product").allow(null).optional(),
	oem: Joi.string().label("OEM").allow(null).optional(),
	completionStatus: Joi.string().label("Status").allow(null).optional(),
	certificationAndValidityFirst: Joi.string()
		.label("Certification And Validity")
		.allow(null)
		.optional(),
	certificationAndValiditySecond: Joi.string()
		.label("Certification And Validity")
		.allow(null)
		.optional(),
});

const updateContactInfo = Joi.object({
	userId: Joi.number().label("User ID").required(),
	personalEmail: Joi.string()
		.email({ tlds: { allow: ["com", "in"] } })
		.label("Personal Email")
		.required(),
	email: Joi.string()
		.email({ tlds: { allow: ["com", "in"] } })
		.label("Official Email")
		.allow(null),
	officeMobileNumber: Joi.string()
		.label("Office Mobile Number")
		.allow(null)
		.min(10)
		.max(10)
		.required(),
	personalMobileNumber: Joi.string()
		.label("Personal Mobile Number")
		.min(10)
		.max(10)
		.required(),
});

const separationByEmployee = Joi.object({
	resignationDate: Joi.string().required().label("Resignation Date"),
	empProposedLastWorkingDay: Joi.string().label("Proposed Last Working Days"),
	empProposedRecoveryDays: Joi.number().label("Proposed Recovery Days"),
	empReasonOfResignation: Joi.number()
		.required()
		.label("Reason of Resignation"),
	empNewOrganizationName: Joi.string()
		.trim()
		.allow("")
		.label("New Organization Name"),
	empSalaryHike: Joi.string().allow("").label("Salary Hike"),
	empPersonalEmailId: Joi.string().required().label("Personal Email ID"),
	empPersonalMobileNumber: Joi.string()
		.required()
		.label("Personal Mobile Number"),
	empRemark: Joi.string().trim().max(100).allow("").label("Remark"),
	attachment: Joi.string().allow("").optional(),
});

const managerInputOnseparation = Joi.object({
	resignationAutoId: Joi.number(),
	l1ProposedLastWorkingDay: Joi.string()
		.required()
		.label("Proposed last Working Day"),
	l1ProposedRecoveryDays: Joi.number()
		.required()
		.label("Proposed Recovery Days"),
	l1ReasonForProposedRecoveryDays: Joi.string()
		.required()
		.label("Reason for Proposed Recovery Days"),
	l1ReasonOfResignation: Joi.number().required().label("Reason Of Resignation"),
	l1BillingType: Joi.string(),
	l1CustomerName: Joi.string().trim().max(100).allow("").label("Customer Name"),
	replacementRequired: Joi.boolean().label("Replacement Required"),
	replacementRequiredBy: Joi.string()
		.allow("")
		.label("Replacement Required By"),
	l1Remark: Joi.string().trim().max(100).allow("").label("Remark"),
	attachment: Joi.string().optional(),
});

const rejectSeparation = Joi.object({
	resignationAutoId: Joi.number(),
	reason: Joi.number().required().label("Reason"),
	remark: Joi.string().trim().max(100).allow("").label("Comment"),
});

const buhrInputOnSeparation = Joi.object({
	resignationAutoId: Joi.number(),
	l2LastWorkingDay: Joi.string().required().label("Proposed last Working Day"),
	l2RecoveryDays: Joi.number().required().label("Proposed Recovery Days"),
	l2RecoveryDaysReason: Joi.string()
		.required()
		.label("Reason for Proposed Recovery Days"),
	l2SeparationType: Joi.number()
		.valid(1, 2, 3, 4)
		.required()
		.label("Separation Type"),
	l2ReasonOfSeparation: Joi.number().required().label("Reason Of Resignation"),
	l2NewOrganizationName: Joi.string()
		.trim()
		.allow("")
		.label("New Organization Name"),
	l2SalaryHike: Joi.string().trim().allow("").label("Salary Hike"),
	doNotReHire: Joi.boolean().valid(0, 1).label("Do Not Rehire"),
	doNotReHireRemark: Joi.string().max(100).allow("").label("Comment"),
	l2BillingType: Joi.string().trim().required().label("Billing Type"),
	l2CustomerName: Joi.string().trim().max(100).allow("").label("Customer Name"),
	shortFallPayoutBasis: Joi.string().trim().allow("").label("Payout Basis"),
	shortFallPayoutDays: Joi.number().allow("").label("Payout Days"),
	shortfallPayoutRequired: Joi.boolean()
		.valid(true, false)
		.label("Short Fall Payout"),
	ndaConfirmation: Joi.boolean().valid(0, 1).label("NDA Confirmation"),
	holdFnf: Joi.boolean().valid(0, 1).label("Hold FNF"),
	holdFnfTillDate: Joi.string().trim().allow("").label("FNF Till Date"),
	holdFnfReason: Joi.string().trim().allow("").label("Hold FNF Reason"),
	l2Remark: Joi.string().trim().max(100).allow("").label("Remark"),
	attachment: Joi.string().optional(),
});

const onBehalfSeperationByManager = Joi.object({
	userId: Joi.number(),
	resignationDate: Joi.string().required().label("Resignation Date"),
	l1ReasonForProposedRecoveryDays: Joi.string()
		.required()
		.label("Reason for Proposed Recovery Days"),
	empProposedLastWorkingDay: Joi.string().label("Proposed Last Working Days"),
	l1ProposedLastWorkingDay: Joi.string()
		.required()
		.label("Proposed last Working Day"),
	l1ReasonOfResignation: Joi.number().required().label("Reason Of Resignation"),
	l1BillingType: Joi.string(),
	l1ProposedRecoveryDays: Joi.number().label("Recovery Days"),
	l1CustomerName: Joi.string().trim().allow("").label("Customer Name"),
	replacementRequired: Joi.boolean().label("Replacement Required"),
	replacementRequiredBy: Joi.string()
		.allow("")
		.label("Replacement Required By"),
	l1Remark: Joi.string().trim().max(100).allow("").label("Remark"),
	l1Attachment: Joi.string().allow(""),
	submitType: Joi.number(),
});

const updateAddress = Joi.object({
	employeeId: Joi.number().label("Proposed Recovery Days").required(),
	currentHouse: Joi.string().label("Current House").required(),
	currentStreet: Joi.string().label("Current Street").required(),
	currentStateId: Joi.number().label("current State").required(),
	currentCityId: Joi.number().label("Current City").required(),
	currentCountryId: Joi.number().label("Current Country").required(),
	currentPincodeId: Joi.number().label("Current Pincode").required(),
	currentLandmark: Joi.string().label("Current Landmark").required(),
	permanentCityId: Joi.number().label("Permanent City").allow(null).optional(),
	permanentStateId: Joi.number()
		.label("Permanent State")
		.allow(null)
		.optional(),
	permanentCountryId: Joi.number()
		.label("Permanent Country")
		.allow(null)
		.optional(),
	permanentPincodeId: Joi.number()
		.label("Permanent Pincode")
		.allow(null)
		.optional(),
	permanentStreet: Joi.string()
		.label("Permanent Street")
		.allow(null)
		.optional(),
	permanentHouse: Joi.string().label("Permanent House").allow(null).optional(),
	permanentLandmark: Joi.string()
		.label("Permanent Landmark")
		.allow(null)
		.optional(),
	emergencyStreet: Joi.string()
		.label("Emergency Street")
		.allow(null)
		.optional(),
	emergencyHouse: Joi.string().label("Emergency House").allow(null).optional(),
	emergencyCityId: Joi.number()
		.label("Emergency Country")
		.allow(null)
		.optional(),
	emergencyStateId: Joi.number()
		.label("Emergency Country")
		.allow(null)
		.optional(),
	emergencyCountryId: Joi.number()
		.label("Emergency Country")
		.allow(null)
		.optional(),
	emergencyPincodeId: Joi.number()
		.label("Emergency Country")
		.allow(null)
		.optional(),
	emergencyLandmark: Joi.string()
		.label("Emergency Landmark")
		.allow(null)
		.optional(),
});

const onboardEmployeeSchema = Joi.object({
	name: Joi.string()
		.pattern(/^[A-Za-z\s.]*$/, "Name should only contain letters and spaces")
		.trim()
		.required()
		.label("Name"),
	email: Joi.string().trim().email().allow(null).label("Email"),
	personalEmail: Joi.string().trim().email().required().label("Personal Email"),
	firstName: Joi.string()
		.pattern(
			/^[A-Za-z\s.]*$/,
			"First Name should only contain letters and spaces",
		)
		.trim()
		.required()
		.label("First Name"),
	middleName: Joi.string()
		.pattern(
			/^[A-Za-z\s]*$/,
			"Middle Name should only contain letters and spaces",
		)
		.trim()
		.allow(null)
		.label("Middle Name"),
	lastName: Joi.string()
		.pattern(
			/^[A-Za-z\s]*$/,
			"Last Name should only contain letters and spaces",
		)
		.trim()
		.allow(null)
		.label("Last Name"),

	panNo: Joi.string()
		.pattern(
			/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
			"PAN should be in the format: AAAAA9999A",
		)
		.trim()
		.allow(null)
		.label("PAN Number"),
	uanNo: Joi.string()
		.pattern(/^[0-9]{12}$/, "UAN should be exactly 12 digits")
		.trim()
		.allow(null)
		.label("UAN Number"),
	pfNo: Joi.string().trim().allow(null).label("PF Number"),
	employeeType: Joi.number().required().label("Employee Type"),
	image: Joi.string().allow(null),

	officeMobileNumber: Joi.string()
		.pattern(/^[0-9]*$/, "Office Mobile number should only contain numbers")
		.trim()
		.length(10)
		.allow(null)
		.label("Office Mobile Number"),
	personalMobileNumber: Joi.string()
		.pattern(/^[0-9]*$/, "Personal Mobile number should only contain numbers")
		.trim()
		.length(10)
		.required()
		.label("Personal Mobile Number"),
	dateOfJoining: Joi.string().required().label("Date Of Joining"),
	manager: Joi.number().required().label("Manager"),
	designation_id: Joi.number().required().label("Designation"),
	functionalAreaId: Joi.number().required().label("Functional Area"),
	buId: Joi.number().required().label("Business Unit"),

	sbuId: Joi.number().required().label("Sub Business Unit"),
	shiftId: Joi.number().integer().allow(null).label("Shift"),
	departmentId: Joi.number().required().label("Department"),
	companyId: Joi.number().required().label("Company"),
	buHRId: Joi.number().required().label("Business Unit HR"),
	buHeadId: Joi.number().required().label("Business Unit Head"),
	attendancePolicyId: Joi.number()
		.integer()
		.allow(null)
		.label("Attendance Policy"),
	companyLocationId: Joi.number().required().label("Company Location"),
	weekOffId: Joi.number().integer().allow(null).label("Week Off"),

	gender: Joi.string().required().label("Gender"),
	maritalStatus: Joi.number().required().label("Marital Status"),
	maritalStatusSince: Joi.string().allow(null).label("Marital Status Since"),
	nationality: Joi.string().required().label("Nationality"),
	probationId: Joi.number().required().label("Probation"),
	jobLevelId: Joi.number().required().label("Job Level Name"),
	dateOfBirth: Joi.string().required().label("Date Of Birth"),
	newCustomerNameId: Joi.number()
		.integer()
		.allow(null)
		.label("New Customer Name"),
	iqTestApplicable: Joi.number().required().label("IQ Test Applicable"),
	positionType: Joi.string().required().label("Position Type"),
	profileImage: Joi.string().allow(null),
	id: Joi.string().allow(null),

	selfService: Joi.number().required().label("Self Service"),
	mobileAccess: Joi.number().required().label("Mobile Access"),
	laptopSystem: Joi.string()
		.valid("No", "Desktop", "Laptop (Mac)", "Laptop (Window)")
		.required()
		.label("Laptop Access"),
	backgroundVerification: Joi.number()
		.required()
		.label("Background Verification"),
	mobileAdmin: Joi.number().required().label("Mobile Admin"),
	dataCardAdmin: Joi.number().required().label("Data Card"),
	visitingCardAdmin: Joi.number().required().label("Visiting Card"),
	workstationAdmin: Joi.number().required().label("Work Station"),
	recruiterName: Joi.string().required().label("Recruiter Name"),
	// offRoleCTC: Joi.number().required().label("Off Role CTC"),
	offRoleCTC: Joi.number()
		.allow(null)
		.default("NA")
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("off Role CTC"),
			otherwise: Joi.optional(),
		}),
	highestQualification: Joi.number().required().label("Highest Qualification"),
	ESICPFDeduction: Joi.string().allow(null).label("ESIC/PF Deduction"),
	fatherName: Joi.string().trim().allow(null).label("Father Name"),
	paymentAccountNumber: Joi.string()
		.trim()
		.max(20)
		.allow(null)
		.label("Account Number"),
	paymentBankName: Joi.string().trim().allow(null).label("Bank Name"),
	paymentBankIfsc: Joi.string()
		.trim()
		.allow(null)
		.min(11)
		.max(11)
		.label("Bank Ifsc Code"),
	noticePeriodAutoId: Joi.number().integer().allow(null).label("Notice Period"),
});

const createTMCSchema = Joi.object({
	selectedUsers: Joi.array().items().required(),
});

const onBehalfSeperationByBUHr = Joi.object({
	userId: Joi.number(),
	resignationDate: Joi.string().required().label("Resignation Date"),
	l2LastWorkingDay: Joi.string().required().label("Proposed last Working Day"),
	l2RecoveryDays: Joi.number().label("Recovery Days"),
	l2RecoveryDaysReason: Joi.string()
		.required()
		.label("Reason for Proposed Recovery Days"),
	l2SeparationType: Joi.string()
		.valid(1, 2, 3, 4)
		.required()
		.label("Separation Type"),
	l2ReasonOfSeparation: Joi.number().required().label("Reason Of Resignation"),
	l2NewOrganizationName: Joi.string()
		.trim()
		.allow("")
		.label("New Organization Name"),
	l2SalaryHike: Joi.string().trim().allow("").label("Salary Hike"),
	doNotReHire: Joi.boolean().valid(0, 1).label("Do Not Rehire"),
	doNotReHireRemark: Joi.string().max(100).allow("").label("Comment"),
	l2BillingType: Joi.string().trim().required().label("Billing Type"),
	l2CustomerName: Joi.string()
		.trim()
		.required()
		.allow("")
		.label("Customer Name"),
	shortFallPayoutBasis: Joi.string().trim().allow("").label("Payout Basis"),
	shortFallPayoutDays: Joi.number().allow("").label("Payout Days"),
	shortfallPayoutRequired: Joi.boolean()
		.valid(true, false)
		.label("Short Fall Payout"),
	ndaConfirmation: Joi.boolean().valid(0, 1).label("NDA Confirmation"),
	holdFnf: Joi.boolean().valid(0, 1).label("Hold FNF"),
	holdFnfTillDate: Joi.string().trim().allow("").label("FNF Till Date"),
	holdFnfReason: Joi.string().trim().allow("").label("Hold FNF Reason"),
	l2Remark: Joi.string().trim().allow("").required().label("Remark"),
	l2Attachment: Joi.string().allow("").optional(),
	submitType: Joi.number(),
});

const revokeSeparation = Joi.object({
	reason: Joi.number().required().label("Reason"),
	remark: Joi.string().trim().allow("").label("Remark"),
});

const importOnboardEmployeeSchema = Joi.object({
	email: Joi.string().trim().email().allow(null).label("Email"),
	personalEmail: Joi.string().trim().email().required().label("Personal Email"),
	firstName: Joi.string()
		.pattern(
			/^[A-Za-z\s.]*$/,
			"First Name should only contain letters and spaces",
		)
		.trim()
		.required()
		.label("First Name"),
	middleName: Joi.string()
		.pattern(
			/^[A-Za-z\s]*$/,
			"Middle Name should only contain letters and spaces",
		)
		.trim()
		.allow(null)
		.label("Middle Name"),
	lastName: Joi.string()
		.pattern(
			/^[A-Za-z\s]*$/,
			"Last Name should only contain letters and spaces",
		)
		.trim()
		.allow(null)
		.label("Last Name"),

	panNo: Joi.string()
		.pattern(
			/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
			"PAN should be in the format: AAAAA9999A",
		)
		.trim()
		.allow(null),
	uanNo: Joi.string()
		.pattern(/^[0-9]{12}$/, "UAN should be exactly 12 digits")
		.trim()
		.allow(null),
	pfNo: Joi.string().trim().allow(null),
	employeeType: Joi.string().required().label("Employee Type"),
	image: Joi.string().allow(null),

	officeMobileNumber: Joi.string()
		.pattern(/^[0-9]*$/, "Offical Mobile number should only contain numbers")
		.trim()
		.length(10)
		.allow(null)
		.label("Office Mobile Number"),
	personalMobileNumber: Joi.string()
		.pattern(/^[0-9]*$/, "Personal Mobile number should only contain numbers")
		.trim()
		.length(10)
		.required()
		.label("Personal Mobile Number"),
	dateOfBirth: Joi.date()
		.required()
		.label("Date Of Birth")
		.custom((value, helpers) => {
			const today = new Date();
			const birthDate = new Date(value);
			const age = today.getFullYear() - birthDate.getFullYear();
			const monthDifference = today.getMonth() - birthDate.getMonth();

			// Check if the user is at least 18 years old
			if (
				age < 18 ||
				(age === 18 && monthDifference < 0) ||
				(age === 18 &&
					monthDifference === 0 &&
					today.getDate() < birthDate.getDate())
			) {
				return helpers.message("You must be at least 18 years old");
			}
			return value; // Return the valid value
		}),
	dateOfJoining: Joi.date()
		.required()
		.label("Date Of Joining")
		.custom((value, helpers) => {
			const dateOfBirth = helpers.state.ancestors[0].dateOfBirth; // Access dateOfBirth from ancestors

			if (!dateOfBirth) {
				return helpers.message("Date of Birth is required");
			}

			if (new Date(value) <= new Date(dateOfBirth)) {
				return helpers.message(
					"Date of Joining must be greater than Date of Birth",
				);
			}
			return value; // Return the valid value
		}),
	manager: Joi.string().trim().required().label("Manager"),
	designation: Joi.string().required().label("Designation"),
	functionalArea: Joi.string().required().label("Functional Area"),
	bu: Joi.string().required().label("Business Unit"),
	sbu: Joi.string().required().label("Sub Business Unit"),
	shift: Joi.string().allow(null).label("Shift"),
	department: Joi.string().required().label("Department"),
	company: Joi.string().required().label("Company"),
	attendancePolicy: Joi.string().allow(null).label("Attendance Policy"),
	companyLocation: Joi.string().required().label("Company Location"),
	weekOff: Joi.string().allow(null).label("Week Off"),
	gender: Joi.string()
		.valid("Male", "Female", "Do not want to disclose", "Transgender", "Other")
		.required()
		.label("Gender"),
	maritalStatus: Joi.string()
		.valid("Married", "Single", "Divorced", "Separated", "Widowed", "Others")
		.required()
		.label("Marital Status"),
	maritalStatusSince: Joi.string()
		.allow(null)
		.default("NA")
		.label("Marital Status Date"),
	nationality: Joi.string().valid("Indian").required().label("Nationality"),
	probation: Joi.string().required().label("Probation"),
	jobLevel: Joi.string().required().label("Job Level"),
	newCustomerName: Joi.string().allow(null).label("Customer Name"),
	iqTestApplicable: Joi.string()
		.valid("Yes", "No")
		.required()
		.label("IQ Test Applicable"),
	positionType: Joi.string()
		.valid("New", "Replacement")
		.required()
		.label("Position Type"),
	selfService: Joi.number().required().label("Self Service"),
	mobileAccess: Joi.number().required().label("Mobile Access"),
	laptopSystem: Joi.string()
		.valid("No", "Desktop", "Laptop (Mac)", "Laptop (Window)")
		.required()
		.label("Laptop Access"),
	backgroundVerification: Joi.number()
		.required()
		.label("Background Verification"),
	mobileAdmin: Joi.number().required().label("Mobile Admin"),
	dataCardAdmin: Joi.number().required().label("Data Card"),
	visitingCardAdmin: Joi.number().required().label("Visiting Card"),
	workstationAdmin: Joi.number().required().label("Work Station"),
	recruiterName: Joi.string().required().label("Recruiter Name"),
	offRoleCTC: Joi.number()
		.allow(null)
		.default("NA")
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("off Role CTC"),
			otherwise: Joi.optional(),
		}),
	highestQualification: Joi.string().required().label("Highest Qualification"),
	// ESICPFDeduction: Joi.string().valid('Yes', 'No', 'Only PF', 'Only ESIC').optional().label("ESIC/PF Deduction"),
	// fatherName: Joi.string().allow("").label("Father Name"),
	// paymentAccountNumber: Joi.string().allow('').default('NA').trim().max(20).label("Account Number"),
	// paymentBankName: Joi.string().allow('').default('NA').trim().label("Bank Name"),
	// paymentBankIfsc: Joi.string().allow('').default('NA').trim().min(11).max(11).label("Bank Ifsc Code"),
	// noticePeriodAutoId: Joi.string().required().label("Notice Period"),
	ESICPFDeduction: Joi.string()
		.valid("Yes", "No", "Only PF", "Only ESIC", null)
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("ESIC/PF Deduction"),
			otherwise: Joi.optional(),
		}),
	fatherName: Joi.string()
		.allow(null)
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("Father Name"),
			otherwise: Joi.optional(),
		}),
	paymentAccountNumber: Joi.string()
		.allow(null)
		.trim()
		.max(20)
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("Account Number"),
			otherwise: Joi.optional(),
		}),
	paymentBankName: Joi.string()
		.allow(null)
		.trim()
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("Bank Name"),
			otherwise: Joi.optional(),
		}),
	paymentBankIfsc: Joi.string()
		.allow(null)
		.trim()
		.min(11)
		.max(11)
		.when("employeeType", {
			is: "Off-Roll",
			then: Joi.required().label("Bank IFSC Code"),
			otherwise: Joi.optional(),
		}),
});

const updatePolicyOfEMP = Joi.array()
	.required()
	.items(
		Joi.object({
			user: Joi.number().required().label("User"),
			shiftPolicy: Joi.number().label("shiftPolicy").allow(null),
			currentshiftPolicy: Joi.number().label("currentshiftPolicy").allow(null),
			attendancePolicy: Joi.number().label("attendancePolicy").allow(null),
			currentattendancePolicy: Joi.number()
				.label("currentattendancePolicy")
				.allow(null),
			weekOffPolicy: Joi.number().label("weekOffPolicy").allow(null),
			currentweekOffPolicy: Joi.number()
				.label("currentweekOffPolicy")
				.allow(null),
			date: Joi.string().label("Date").required(),
		}),
	)
	.messages({
		"array.base": "Please Select Atleaset One User",
	});

const updateIQDetailsSchema = Joi.object({
	userId: Joi.number().label("User ID"),
	abstractReasoning: Joi.string().optional().label("Abstract Reasoning"),
	numericalSequences: Joi.string().optional().label("Abstract Reasoning"),
	numericalCalculation: Joi.string().optional().label("Abstract Reasoning"),
	mbtiType: Joi.string().optional().label("Abstract Reasoning"),
});

const revokeSeparationBUHR = Joi.object({
	resignationAutoId: Joi.number().required().label("Resignation Details"),
	reason: Joi.number().required().label("Reason"),
	remark: Joi.string().trim().allow("").label("Remark"),
});

const blockLoginSchema = Joi.object({
	employeeCode: Joi.string().trim().required().label("Employee Code"),
});

///Confirmation
const requestForProbationExtendvalidationSchema = Joi.object({
	employeeId: Joi.number().label("Employee ID"),
	noticePeriodId: Joi.number().required().label("Notice Peroid"),
	confirmationinitiatedAutoId: Joi.number().required().label("Confirmation ID"),
	recommendation: Joi.number().required().label("Recommendation"),
	attachment: Joi.string().allow("").optional(),
});
///Confirmation
//Payroll///////
const salaryStructureListSchema = Joi.object({
	structureType: Joi.string().valid("LIST", "SINGLE").required(),
	salaryStructureAutoId: Joi.number().integer().required(),
});

const salaryStructureCreateSchema = Joi.object({
	hasAnnuallyProration: Joi.number().integer().required(),
	hasMonthlyProration: Joi.number().integer().required(),
	hasVariable: Joi.number().integer().required(),
	salaryStructureAutoId: Joi.number().integer().required(),
	salaryStructureName: Joi.string().required(),
	salaryStructureDes: Joi.string().allow(null, ""),
	createdAt: Joi.date().allow(null),
	createdBy: Joi.string().required(),
	updatedBy: Joi.string().required(),
	updatedAt: Joi.date().allow(null),
	isActive: Joi.boolean().required(),
	structureMappingDetails: Joi.array()
		.items(
			Joi.object({
				salaryComponentAutoId: Joi.number().integer().required(),
				salaryComponentElementAutoId: Joi.number().integer().required(),
				elementValue: Joi.alternatives()
					.try(Joi.string(), Joi.number().integer())
					.required(),
			}),
		)
		.required(),
});

const earningArrearsSchema = Joi.object({
	earningArrearAutoId: Joi.number().integer().positive().optional(), // Auto-incremented, typically not included in user input
	EmployeeId: Joi.number().integer().positive().required(), // Required as it links to an employee
	arrearMonth: Joi.string().max(45).required(), // String with a maximum length
	arrearPayMonth: Joi.string().max(45).required(),
	arearDays: Joi.number().integer().positive().required(),
	arearType: Joi.string()
		.allow(null)
		.max(45)
		.optional()
		.valid("New Joinee", "LOP", "Increment"), // Optional, can be null
	hasPF: Joi.string().allow(null).max(45).optional().valid("Yes", "No"),
	computeESIC: Joi.string().allow(null).max(45).optional().valid("Yes", "No"),
	isDeleteArrear: Joi.string()
		.allow(null)
		.max(45)
		.optional()
		.valid("Yes", "No"),
	lopDate: Joi.date().allow(null).optional(),
	createdBy: Joi.number().integer().positive().allow(null).optional(),
	createdAt: Joi.date().allow(null).optional(),
	updatedBy: Joi.number().integer().positive().allow(null).optional(),
	updatedAt: Joi.date().allow(null).optional(),
	isActive: Joi.boolean().default(false).optional(), // Defaults to false if not provided
});

async function createDynamicPayPackageSchema(structureDetails, employee) {
	let dynamicArray = [];
	for (const salaryComponent of structureDetails) {
		dynamicArray.push(
			salaryComponent[
				"structureMappingDetails.componentDetails.salaryComponentAlias"
			]
				? salaryComponent[
						"structureMappingDetails.componentDetails.salaryComponentAlias"
					]
				: salaryComponent[
						"structureMappingDetails.componentDetails.salaryComponentCode"
					],
		);
	}
	const dynamicFields = {
		"Employee ID": Joi.alternatives()
			.try(Joi.string(), Joi.number())
			.required(),
		Name: Joi.string().allow(null, ""),
		"Effective Date": Joi.alternatives()
			.try(Joi.string(), Joi.number())
			.required(),
		Event: Joi.string().allow("", null),
		"Salary Structure": Joi.string().required(),
		CTC: Joi.number().required(),
	};

	// console.log(dynamicArray);

	dynamicArray.forEach((field) => {
		dynamicFields[field] = Joi.alternatives()
			.try(
				Joi.number()
					.min(0)
					.messages({
						"number.base": `"${field}" must be a valid number`,
						"number.min": `"${field}" must be 0 or greater`,
					})
					.label("field"),
				Joi.string().valid("").optional().label("PPP"), // Allows empty string
			)
			.default(0)
			.custom((value, helpers) => {
				if (value === "") {
					return 0; // Assign 0 if it's an empty string
				}
				return value;
			});
	});
	const payPackangeSchema = Joi.object(dynamicFields).unknown(true);
	const { error, value } = await payPackangeSchema.validate(employee);
	// console.log(value);
	// console.log("****"+error+"*************8");
	return error;
}

const tdsDeductionsSchema = Joi.object({
	EmployeeId: Joi.number().integer().positive().required(),
	tdsMonth: Joi.string().max(255).required(),
	tdsAmount: Joi.number().precision(2).positive().required(),
	createdBy: Joi.number().integer().positive().optional().allow(null),
	createdAt: Joi.date().optional().allow(null),
	updatedBy: Joi.number().integer().positive().optional().allow(null),
	updatedAt: Joi.date().optional().allow(null),
	isActive: Joi.boolean().optional(), // Defaults to false (0)
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const extraPayment = Joi.object({
	EmployeeId: Joi.number().integer().positive().required(),
	paymentMonth: Joi.string().max(255).required(),
	category: Joi.string().max(255).required(),
	paymentAmount: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("Extra Payment Amount"),
	createdBy: Joi.number().integer().positive().optional().allow(null),
	createdAt: Joi.date().optional().allow(null),
	updatedBy: Joi.number().integer().positive().optional().allow(null),
	updatedAt: Joi.date().optional().allow(null),
	isActive: Joi.boolean().optional(), // Defaults to false (0)
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
	type: Joi.string().allow(null).label("Type"),
	paymentCategoryId: Joi.number().integer().positive().required(),
});

const lopValidateSchama = Joi.object({
	lopAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	lopMonth: Joi.string().max(255).required(),
	lopDays: Joi.number().precision(2).positive().required().label("LOP Days"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const employeesForPayrollProcess = Joi.object({
	departmentId: Joi.string().allow("", null), // Auto-incremented primary key, not required in most cases.
	paymonth: Joi.string().required(),
	processingType: Joi.number().required().valid(0, 1),
	companyId: Joi.number(),
	selectedYear: Joi.number().optional(),
});

const extraDeductionSchema = Joi.object({
	"Employee ID": Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee ID"),
	"Advance Category": Joi.string().required().label("Advance Category"),
	"Advance Name": Joi.string().required().label("Advance Name"),
	"Total Amount/Percent/Hours/Days": Joi.number()
		.positive()
		.required()
		.label("Total Amount/Percent/Hours/Days"),
	"Start Month": Joi.string()
		.pattern(/^\d{4}-\d{2}$/) // Matches YYYY-MM format
		.required()
		.label("Start Month"),
	"End Month": Joi.string()
		.pattern(/^\d{4}-\d{2}$/) // Matches YYYY-MM format
		.label("End Month"),
	"Number Of Deductions": Joi.number()
		.integer()
		.positive()
		.required()
		.label("Number Of Deductions"),
	"Status (Open/Completed)": Joi.number()
		.integer()
		.positive()
		.allow(null)
		.valid("Open", "Completed")
		.label("Status (Open/Completed)"),
	"Reason for status change": Joi.string()
		.allow(null, "")
		.label("Reason for status change"),
});

const payMonthYearCheck = Joi.object({
	pay_month: Joi.number()
		.min(1)
		.max(12)
		.required()
		.custom((value, helpers) => {
			const formattedValue = value < 10 ? `0${value}` : `${value}`;
			return formattedValue;
		}, "format single-digit month as two digits"),
	pay_year: Joi.number().required(),
	companyId: Joi.number().required(),
	processType: Joi.string().optional(),
});
/////////////Payroll///////////////
const addDesignationEmploymentSchema = Joi.object({
	userId: Joi.number().required().label("User ID"),
	companyId: Joi.number().required().label("Company"),
	designation_id: Joi.number().required().label("Designation"),
	fromDate: Joi.string().trim().required().label("From Date"),
	isPromotion: Joi.boolean().required().label("Promotion").optional(),
	id: Joi.number().allow(null),
});

const addDepartmentEmploymentSchema = Joi.object({
	userId: Joi.number().required().label("User ID"),
	companyId: Joi.number().required().label("Company"),
	buId: Joi.number().required().label("Business Unit"),
	sbuId: Joi.number().required().label("Sub Business Unit"),
	buHRId: Joi.number().required().label("Business Unit HR"),
	buHeadId: Joi.number().required().label("Business Unit Head"),
	departmentId: Joi.number().required().label("Department"),
	functionalAreaId: Joi.number().required().label("Functional Area"),
	fromDate: Joi.string().trim().required().label("From Date"),
	id: Joi.number().allow(null),
});

const addCostCenterEmploymentSchema = Joi.object({
	userId: Joi.number().required().label("User ID"),
	companyId: Joi.number().required().label("Company"),
	costId: Joi.number().required().label("Cost Center"),
	fromDate: Joi.string().trim().required().label("From Date"),
	id: Joi.number().allow(null),
});

const addCompanyLocationEmploymentSchema = Joi.object({
	userId: Joi.number().required().label("User ID"),
	companyId: Joi.number().required().label("Company"),
	companyLocationId: Joi.number().required().label("Company Location"),
	fromDate: Joi.string().trim().required().label("From Date"),
	id: Joi.number().allow(null),
});

const addJobLevelEmploymentSchema = Joi.object({
	userId: Joi.number().required().label("User ID"),
	companyId: Joi.number().required().label("Company"),
	jobLevelId: Joi.number().required().label("Job Level"),
	fromDate: Joi.string().trim().required().label("From Date"),
	isPromotion: Joi.boolean().required().label("Promotion").optional(),
	id: Joi.number().allow(null),
});

const addEmployeeTypeEmploymentSchema = Joi.object({
	userId: Joi.number().required().label("User ID"),
	companyId: Joi.number().required().label("Company"),
	employeeType: Joi.number().required().label("Employee Type"),
	fromDate: Joi.string().trim().required().label("From Date"),
	id: Joi.number().allow(null),
});

// Attendance Approval Validations
const attendanceApprovalSchema = Joi.object({
	attendanceAutoId: Joi.array()
		.items(Joi.number().required())
		.label("Attendance")
		.messages({
			"array.includesRequiredUnknowns":
				"Please select atleast one attendance record",
		}),
	status: Joi.boolean().valid(0, 1).label("Status").messages({
		"any.only": "Status must be boolean",
	}),
	remark: Joi.string().max(50).optional().allow("").label("Remark"),
});
// Attendance Approval Validations

//Attedance Roster Validations
const attendanceRosterSchema = Joi.array().items(
	Joi.object({
		employeeId: Joi.number().required().label("Employee ID"),
		attendanceDate: Joi.string().required().label("Date"),
		shiftId: Joi.number().required().label("Shift").messages({
			"number.base": '"Shift" is required',
			"any.required": '"Shift" is required',
		}),
		weekOffId: Joi.number().required().label("Week Off").messages({
			"number.base": '"Week Off" is required',
			"any.required": '"Week Off" is required',
		}),
	}),
);

const rosterUploadSchema = Joi.array().items(
	Joi.object({
		Email_Or_TMC: Joi.alternatives()
			.try(Joi.number().integer(), Joi.string().email())
			.required()
			.label("Email or TMC"),
		From_Date: Joi.number().integer().required().label("From Date"),
		To_Date: Joi.number().integer().required().label("To Date"),
		Shift_Name: Joi.string().trim().required().label("Shift"),
		Weekly_Off_Name: Joi.string().trim().required().label("Week Off"),
	}),
);
//Attedance Roster Validations
//COMP OFF
const updateCompOffRequest = Joi.object({
	comp_off_credit_history_auto_id: Joi.string()
		.trim()
		.required()
		.label("comp_off_credit_history_auto_id ID"),
	status: Joi.string().trim().required().valid(1, 2).label("status"),
	remarks: Joi.string().trim().allow("").max(100),
});
//COMP OFF

//comp off leave

const updateCompOffLeaveRequest = Joi.object({
	comp_off_credit_history_auto_id: Joi.string()
		.trim()
		.required()
		.label("comp_off_credit_history_auto_id ID"),
	status: Joi.string().trim().required().valid(1, 2).label("status"),
	remarks: Joi.string().trim().allow("").max(100),
});
const payProcessCardSchema = Joi.object({
	selectedYear: Joi.number().required(),
	companyId: Joi.number().required(),
	processType: Joi.string().optional(),
});

const extraDeductionFormSchema = Joi.object({
	EmployeeId: Joi.number().required().label("Employee Id"),
	deductionCategoryId: Joi.number().required().label("Deduction Category"),
	deductionType: Joi.string().required().label("Deduction Type"),
	deductionName: Joi.string().required().label("Deduction Name"),
	deductionAmount: Joi.number().positive().required().label("Deduction Amount"),
	currencyCode: Joi.number().required().label("Currency Code"),
	startMonth: Joi.string()
		.pattern(/^\d{4}-\d{2}$/) // Matches YYYY-MM format
		.required()
		.label("Start Month"),
	endMonth: Joi.string()
		.allow(null)
		.pattern(/^\d{4}-\d{2}$/) // Matches YYYY-MM format
		.label("End Month")
		.custom((value, helpers) => {
			const { startMonth } = helpers.state.ancestors[0]; // Access startMonth from the object being validated
			if (value && startMonth) {
				const start = new Date(`${startMonth}-01`);
				const end = new Date(`${value}-01`);
				if (end < start) {
					return helpers.message(
						`"End Month" must be equal to or later than "Start Month"`,
					);
				}
			}
			return value;
		}),
	numberOfDeductions: Joi.number()
		.integer()
		.positive()
		.required()
		.label("Number Of Deductions"),
	financialYearId: Joi.number().required().label("Financial Year"),
	// monthlyDeductionAmount: Joi.number()
	//   .positive()
	//   .required()
	//   .label("Monthly Deduction Amount"),
});

const extraPaymentFormSchema = Joi.object({
	EmployeeId: Joi.number().integer().positive().required(),
	paymentMonth: Joi.string().max(255).required().label("Payment Month"),
	paymentCategoryId: Joi.number().required().label("Payment Category"),
	paymentAmount: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("Extra Payment Amount"),
	paymentType: Joi.string().required().label("Payment Type"),
	financialYearId: Joi.number().required().label("Financial Year"),
});

const generatePaySlipSchema = Joi.object({
	EmployeeId: Joi.number().integer().positive().required(),
	payMonth: Joi.string().max(10).required().label("Pay Month"),
	paySlipType: Joi.string().required().label("Pay Slip Type"),
	lopDays: Joi.number().required().label("Total Loss Of Pay"),
	remarks: Joi.string().allow(null).label("Remarks"),
	tdsAmount: Joi.number().required().label("TDS Amount"),
	financialYearId: Joi.number().required().label("Financial Year"),
});
//F&F

const gratuityValidateSchama = Joi.object({
	gratuityAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	payMonth: Joi.string().max(255).required(),
	gratuityYears: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("Gratuity Days"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const leaveEncashmentValidateSchama = Joi.object({
	gratuityAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	payMonth: Joi.string().max(255).required(),
	leaveEncashmentDays: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("Leave Encashment Days"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const ptValidateSchama = Joi.object({
	ptDeductionAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	ptMonth: Joi.string().max(255).required(),
	ptAmount: Joi.number().precision(2).positive().required().label("PT Amount"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const lwfValidateSchama = Joi.object({
	lwfDeductionAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	lwfMonth: Joi.string().max(255).required(),
	lwfAmount: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("LWF Amount"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const noticeRecoveryValidateSchama = Joi.object({
	recoveryDaysAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	payMonth: Joi.string().max(255).required(),
	recoveryDays: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("Recovery Days"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const extraBenefitValidateSchama = Joi.object({
	extraBenefitAutoId: Joi.number().integer().positive().optional(), // Auto-incremented primary key, not required in most cases.
	EmployeeId: Joi.number().integer().positive().required(), // Employee ID is required.
	payMonth: Joi.string().max(255).required(),
	benefitAmount: Joi.number()
		.precision(2)
		.positive()
		.required()
		.label("Benefit Amount"), // Leave days must be non-negative.
	createdBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	createdAt: Joi.date().optional().allow(null), // Optional, can be null.
	updatedBy: Joi.number().integer().positive().optional().allow(null), // Optional, can be null.
	updatedAt: Joi.date().optional().allow(null), // Optional, can be null.
	isActive: Joi.boolean().optional(), // Optional boolean, defaults to false (0).
	empCode: Joi.alternatives()
		.try(Joi.string(), Joi.number().integer())
		.required()
		.label("Employee Code"),
});

const releaseSlipCheck = Joi.object({
	pay_month: Joi.number()
		.min(1)
		.max(12)
		.required()
		.custom((value, helpers) => {
			const formattedValue = value < 10 ? `0${value}` : `${value}`;
			return formattedValue;
		}, "format single-digit month as two digits"),
	pay_year: Joi.number().required(),
	empIds: Joi.string().required(),
	processId: Joi.string().optional(),
});

	// ritak address approval module start

	const requestForAddressApprovalSchema = Joi.object({
		employeeId: Joi.number().label("Employee ID").required(),
		currentHouse: Joi.string().label("Current House").required(),
		currentStreet: Joi.string().label("Current Street").required(),
		currentStateId: Joi.number().label("Current State").required(),
		currentCityId: Joi.number().label("Current City").required(),
		currentCountryId: Joi.number().label("Current Country").required(),
		currentPincodeId: Joi.number().label("Current Pincode").required(),
		currentLandmark: Joi.string().label("Current Landmark").required(),
		permanentCityId: Joi.number().label("Permanent City").allow(null).optional(),
		permanentStateId: Joi.number()
			.label("Permanent State")
			.allow(null)
			.optional(),
		permanentCountryId: Joi.number()
			.label("Permanent Country")
			.allow(null)
			.optional(),
		permanentPincodeId: Joi.number()
			.label("Permanent Pincode")
			.allow(null)
			.optional(),
		permanentStreet: Joi.string()
			.label("Permanent Street")
			.allow(null)
			.optional(),
		permanentHouse: Joi.string().label("Permanent House").allow(null).optional(),
		permanentLandmark: Joi.string()
			.label("Permanent Landmark")
			.allow(null)
			.optional(),
		emergencyStreet: Joi.string()
			.label("Emergency Street")
			.allow(null)
			.optional(),
		emergencyHouse: Joi.string().label("Emergency House").allow(null).optional(),
		emergencyCityId: Joi.number()
			.label("Emergency City")
			.allow(null)
			.optional(),
		emergencyStateId: Joi.number()
			.label("Emergency State")
			.allow(null)
			.optional(),
		emergencyCountryId: Joi.number()
			.label("Emergency Country")
			.allow(null)
			.optional(),
		emergencyPincodeId: Joi.number()
			.label("Emergency Pincode")
			.allow(null)
			.optional(),
		emergencyLandmark: Joi.string()
			.label("Emergency Landmark")
			.allow(null)
			.optional(),
		comment: Joi.string().label("Comment").allow(null, "").optional(),
	});

	const actionAddressSchema = Joi.object({
		userId: Joi.number().label("Employee ID").required(),
		currentHouse: Joi.string().label("Current House").optional(),
		currentStreet: Joi.string().label("Current Street").optional(),
		currentStateId: Joi.number().label("Current State").optional(),
		currentCityId: Joi.number().label("Current City").optional(),
		currentCountryId: Joi.number().label("Current Country").optional(),
		currentPincodeId: Joi.number().label("Current Pincode").optional(),
		currentLandmark: Joi.string().label("Current Landmark").optional(),
		permanentCityId: Joi.number().label("Permanent City").optional(),
		permanentStateId: Joi.number().label("Permanent State").optional(),
		permanentCountryId: Joi.number().label("Permanent Country").optional(),
		permanentPincodeId: Joi.number().label("Permanent Pincode").optional(),
		permanentStreet: Joi.string().label("Permanent Street").optional(),
		permanentHouse: Joi.string().label("Permanent House").optional(),
		permanentLandmark: Joi.string().label("Permanent Landmark").optional(),
		emergencyStreet: Joi.string().label("Emergency Street").optional(),
		emergencyHouse: Joi.string().label("Emergency House").optional(),
		emergencyCityId: Joi.number().label("Emergency City").optional(),
		emergencyStateId: Joi.number().label("Emergency State").optional(),
		emergencyCountryId: Joi.number().label("Emergency Country").optional(),
		emergencyPincodeId: Joi.number().label("Emergency Pincode").optional(),
		emergencyLandmark: Joi.string().label("Emergency Landmark").optional(),
		status: Joi.number().valid(0, 1).label("Status").required(), // 0 for rejected, 1 for approved
		comment: Joi.string().label("Comment").allow(null, "").optional(),
	});
	
	// ritak address approval module end

export default {
	loginSchema,
	userCreationSchema,
	attendanceSchema,
	regularizeRequest,
	approveRegularizationRequestSchema,
	bankDetailsSchema,
	unlockAccountSchema,
	updateBiographicalDetailsSchema,
	addFamilyDetailsSchema,
	updateFamilyDetailsSchema,
	updatePaymentDetailsSchema,
	deleteFamilyMemberDetailsSchema,
	addPaymentDetailsSchema,
	updateLeaveRequest,
	leaveRequestSchema,
	revoekLeaveRequest,
	attendanceDetails,
	changePasswordSchema,
	remainingLeaves,
	addJobDetailsSchema,
	updateEducationDetailsSchema,
	addEducationDetailsSchema,
	updateManagerSchema,
	updateProfilePictureSchema,
	emergencyContactDetails,
	forgotPasswordSchema,
	employeeUpdateInfo,
	addemployeeWorkInfo,
	updateemployeeWorkInfo,
	addEmployeeCertificates,
	updateEmployeeCertificates,
	updateContactInfo,
	separationByEmployee,
	managerInputOnseparation,
	rejectSeparation,
	buhrInputOnSeparation,
	onBehalfSeperationByManager,
	updateAddress,
	onBehalfSeperationByBUHr,
	onboardEmployeeSchema,
	createTMCSchema,
	revokeSeparation,
	importOnboardEmployeeSchema,
	updatePolicyOfEMP,
	updateIQDetailsSchema,
	revokeSeparationBUHR,
	requestForPaymentApprovalSchema,
	actionPaymentSchema,
	blockLoginSchema,
	requestForProbationExtendvalidationSchema,
	addDesignationEmploymentSchema,
	addDepartmentEmploymentSchema,
	addCostCenterEmploymentSchema,
	addCompanyLocationEmploymentSchema,
	addJobLevelEmploymentSchema,
	addEmployeeTypeEmploymentSchema,
	attendanceApprovalSchema,
	// comp off leave
	updateCompOffLeaveRequest,
	// comp off leave
	attendanceRosterSchema,
	rosterUploadSchema,
	updateCompOffRequest,
	payProcessCardSchema,
	extraDeductionFormSchema,
	extraPaymentFormSchema,
	generatePaySlipSchema,
	salaryStructureListSchema,
	salaryStructureCreateSchema,
	earningArrearsSchema,
	createDynamicPayPackageSchema,
	tdsDeductionsSchema,
	extraPayment,
	lopValidateSchama,
	employeesForPayrollProcess,
	extraDeductionSchema,
	payMonthYearCheck,
	// F&F
	gratuityValidateSchama,
	leaveEncashmentValidateSchama,
	ptValidateSchama,
	lwfValidateSchama,
	noticeRecoveryValidateSchama,
	extraBenefitValidateSchama,
	releaseSlipCheck,
	// ritak request approval module start
	requestForAddressApprovalSchema,
	actionAddressSchema
	// ritak request approval module end

};
