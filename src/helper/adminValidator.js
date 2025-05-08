import Joi from "joi";

const months = [
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
	"jan",
	"feb",
	"mar",
];

const companyTypeMasterSchema = Joi.object({
	typeName: Joi.string().trim().required().label("Company Type Name"),
});

const bandMasterSchema = Joi.object({
	bandCode: Joi.string().trim().required().label("Band Code"),
	bandDesc: Joi.string().trim().required().label("Band Description"),
});

const jobLevelMasterSchema = Joi.object({
	jobLevelName: Joi.string().trim().required().label("Job Level Name"),
	jobLevelCode: Joi.string().trim().required().label("job Level Code"),
});

const bankMasterSchema = Joi.object({
	bankName: Joi.string().trim().required().label("Bank Name"),
	bankIfsc: Joi.string().trim().required().label("Bank IFSC"),
});

///RITAK WORK
const buMasterSchema = Joi.object({
	buName: Joi.string().trim().required().label("Bu Name"),
	buCode: Joi.string().trim().required().label("Bu Code"),
	companyId: Joi.array()
		.items(Joi.number().integer())
		.required()
		.label("Company Ids"),
	companyFields: Joi.array()
		.items(
			Joi.object({
				companyId: Joi.number().integer().required().label("Company Id"),
				buHead: Joi.object({
					label: Joi.string().required(),
					value: Joi.number().integer().required(),
				}).required(),
				buHr: Joi.object({
					label: Joi.string().required(),
					value: Joi.number().integer().required(),
				}).required(),
			}),
		)
		.required()
		.label("Company Fields"),
});

const sbuMasterSchema = Joi.object({
	sbuName: Joi.string().trim().required().label("Sbu Name"),
	code: Joi.string().trim().required().label("Sbu Code"),
	buId: Joi.number().integer().required().label("Bu ID"),
});
const designationMasterSchema = Joi.object({
	name: Joi.string().trim().required().label("Designation Name"),
	code: Joi.string().trim().required().label("Designation Code"),
});
const gradeMasterSchema = Joi.object({
	gradeName: Joi.string().trim().required().label("Grade Name"),
	gradeCode: Joi.string().trim().required().label("Grade Code"),
});
const degreeMasterSchema = Joi.object({
	degreeName: Joi.string().trim().required().label("Degree Name"),
	degreeCode: Joi.string().trim().required().label("Degree Code"),
	degreeType: Joi.string().trim().required().label("Degree Type"),
	durationInYears: Joi.number().allow(null).label("Degree Duration In Years"),
});

const holidayMasterSchema = Joi.object({
	holidayName: Joi.string().trim().required().label("Holiday Name"),
	holidayDate: Joi.string().trim().required().label("Holiday Date"),
	locations: Joi.array().required().label("Company Location"),
});

const newCustomerSchema = Joi.object({
	newCustomerName: Joi.string().trim().required().label("New Customer Name"),
});

//RITAK WORK
const companySchema = Joi.object({
	companyName: Joi.string().trim().required().label("Company Name"),
	companyCode: Joi.string().trim().required().label("Company Code"),
	groupId: Joi.number().integer().required().label("Group ID"),
	currencyId: Joi.number().integer().required().label("Currency ID"),
	timeZoneId: Joi.number().integer().required().label("Time Zone ID"),
	finacialYearBegin: Joi.string()
		.trim()
		.required()
		.label("Financial Year Start"),
	industryId: Joi.number().integer().required().label("Industry ID"),
	companyTypeId: Joi.number().integer().required().label("Company Type ID"),
	dateOfIncorporation: Joi.date()
		.iso()
		.required()
		.label("Date of Incorporation"),
	panNo: Joi.string().trim().max(15).allow(null).label("PAN No"),
	tanNo: Joi.string().trim().max(15).allow(null).label("TAN No"),
	vatRegNo: Joi.string().trim().max(15).allow(null).label("VAT Reg No"),
	siteUrl: Joi.string().uri().allow(null).label("Website URL"),
	companyLogo: Joi.string().trim().allow(null).label("Company Logo"),
	officialMail: Joi.string()
		.email()
		.max(50)
		.allow(null)
		.label("Official Email"),
});

const costCenterMasterSchema = Joi.object({
	costCenterName: Joi.string().trim().required().label("Cost Center Name"),
	costCenterCode: Joi.string().trim().required().label("Cost Center Code"),
	costCenterHead: Joi.string().trim().required().label("Cost Center Head"),
});

//RITAK WORK
// Create masters schema by jay

const departmentMasterSchema = Joi.object({
	departmentName: Joi.string().trim().required().label("Department Name"),
	departmentCode: Joi.string().trim().required().label("Department Code"),
	parentDepartmentId: Joi.number().allow(0).label("Parent Department"),
});

const functionalAreaMasterSchema = Joi.object({
	functionalAreaName: Joi.string().trim().required().label("Department Name"),
	functionalAreaCode: Joi.string().trim().required().label("Department Code"),
	parentFunctionalAreaId: Joi.number().allow(0).label("Parent Functional Area"),
});

const weekoffMasterSchema = Joi.object({
	weekOffName: Joi.string().trim().required().label("Week Off Name"),
	nonWorkingDays: Joi.string().trim().allow(null).label("Non Working Days"),
});

const shiftMasterSchema = Joi.object({
	shiftName: Joi.string().trim().required().label("Shift Name"),
	shiftStartTime: Joi.string().trim().required().label("Shift Start Time"),
	shiftEndTime: Joi.string().trim().required().label("Shift End Time"),
	shiftRemark: Joi.string().trim().required().label("Shift Remark"),
	isOverNight: Joi.number().required().label("Is Over Night"),
});

const attendancePolicyMasterSchema = Joi.object({
	policyName: Joi.string().trim().required().label("Policy Name"),
	policyCode: Joi.string().trim().allow(null).label("Policy Code"),
	policyDescription: Joi.string()
		.trim()
		.allow(null)
		.label("Policy Description"),
	requestLimit: Joi.number().required().label("Request Limit"),
	allowRequestFromHome: Joi.number()
		.required()
		.label("Allow Request From Home"),
	allowRequestFromDuty: Joi.number()
		.required()
		.label("Allow Request From Duty"),
	graceTimeClockIn: Joi.number().required().label("Grace Time Clock In"),
	graceTimeClockOut: Joi.number().required().label("Grace Time Clock Out"),
	allowBufferTime: Joi.number().required().label("Allow Buffer Time"),
	bufferTimePre: Joi.number().required().label("Buffer Time Pre"),
	bufferTimePost: Joi.number().required().label("Buffer Time Post"),
	isleaveDeductPolicyLateDuration: Joi.number()
		.required()
		.label("Is Leave Deduct Policy Late Duration"),
	leaveDeductPolicyLateDurationHalfDayTime: Joi.number()
		.required()
		.label("Leave Deduct Policy Late Duration Half Day Time"),
	leaveDeductPolicyLateDurationFullDayTime: Joi.number()
		.required()
		.label("Leave Deduct Policy Late Duration Full Day Time"),
	leaveDeductPolicyLateDurationLeaveType: Joi.number()
		.required()
		.label("Leave Deduct Policy Late Duration Leave Type"),
	isleaveDeductPolicyWorkDuration: Joi.number()
		.required()
		.label("Is Leave Deduct Policy Work Duration"),
	leaveDeductPolicyWorkDurationHalfDayTime: Joi.number()
		.required()
		.label("Leave Deduct Policy Work Duration Half Day Time"),
	leaveDeductPolicyWorkDurationFullDayTime: Joi.number()
		.required()
		.label("Leave Deduct Policy Work Duration Full Day Time"),
	leaveDeductPolicyWorkDurationLeaveType: Joi.number()
		.required()
		.label("Leave Deduct Policy Work Duration Leave Type"),
	attendancePolicyId: Joi.number().allow(null),
	isActive: Joi.boolean().allow(null),
});

const leaveMasterSchema = Joi.object({
	leaveName: Joi.string().trim().required().label("Leave Name"),
	leaveCode: Joi.string().trim().required().label("Leave Code"),
	defaultLeaveCount: Joi.string().allow(null).label("Default Leave Count"),
	iterationDistribution: Joi.string()
		.allow(null)
		.label("Iteration Distribution"),
	canCarryForwardAhead: Joi.boolean()
		.allow(null)
		.label("Can Carry Forward Ahead"),
	systemGenerated: Joi.boolean().allow(null).label("System Generated"),
	creditDayOfMonth: Joi.string().allow(null).label("Credit Day Of Month"),
	canTakeHalfDay: Joi.boolean().allow(null).label("Can Take Hal fDay"),
	minConsecutiveDay: Joi.string().allow(null).label("Min Consecutive Day"),
	maxConsecutiveDay: Joi.string().allow(null).label("Max Consecutive Day"),
	attachmentRequired: Joi.boolean().allow(null).label("Attachment Required"),
	attachmentRequiredafterdays: Joi.string()
		.allow(null)
		.label("Attachment Required After Days"),
	messageRequired: Joi.boolean().allow(null).label("Message Required"),
	leaveId: Joi.number().allow(null),
	isActive: Joi.number().allow(null),
});

const noticePeriodMasterSchema = Joi.object({
	noticePeriodName: Joi.string().trim().required().label("Notice Period Name"),
	noticePeriodCode: Joi.string().trim().required().label("Notice Period Code"),
	nPDaysAfterConfirmation: Joi.number()
		.required()
		.label("nP Days After Confirmation"),
	nPDaysInProbation: Joi.number().required().label("nP Days In Probation"),
	noticePeriodAutoId: Joi.number().allow(null),
	isActive: Joi.boolean().allow(null),
});

const ptLocationMasterSchema = Joi.object({
	ptLocationName: Joi.string().trim().required().label("PT Location Name"),
	ptLocationCode: Joi.string().trim().required().label("PT Location Code"),
	stateId: Joi.number().required().label("State"),
	frequency: Joi.string().required().label("Frequency"),
});

const jobLevelMappingSchema = Joi.object({
	bandId: Joi.number().required().label("Band Name"),
	gradeId: Joi.number().required().label("Grade Name"),
	jobLevelId: Joi.number().required().label("Job Level Name"),
	companyId: Joi.array()
		.items(Joi.object().required())
		.required()
		.label("Company Name"),
});

const departmentMappingSchema = Joi.object({
	companyId: Joi.number().required().label("Company Name"),
	buId: Joi.number().required().label("Business Unit"),
	sbuMappingId: Joi.number().required().label("Sub Business Unit"),
	departmentId: Joi.number().required().label("Department Name"),
});

const functionalAreaMappingSchema = Joi.object({
	companyId: Joi.number().required().label("Company Name"),
	buId: Joi.number().required().label("Business Unit"),
	sbuMappingId: Joi.number().required().label("Sub Business Unit"),
	departmentMappingId: Joi.number().required().label("Department Name"),
	functionalAreaId: Joi.number().required().label("Functional Area Name"),
});

const probationMasterSchema = Joi.object({
	probationName: Joi.string().trim().required().label("Probation Name"),
	setProbationPeriodInDays: Joi.string()
		.trim()
		.required()
		.label("Probation Period In Days"),
	setProbationPeriodInMonths: Joi.string()
		.trim()
		.required()
		.label("Probation Period In Months"),
	durationOfProbation: Joi.number().required().label("Duration Of Probation"),
	showInProbationExtension: Joi.string()
		.trim()
		.required()
		.label("Show In Probation Extension"),
	extendConfirmation: Joi.string()
		.trim()
		.required()
		.label("Extend Confirmation"),
	startProbationPeriodFromAssignedDate: Joi.string()
		.trim()
		.required()
		.label("Start Probation Period From Assigned Date"),
	probationId: Joi.number().allow(null),
	isActive: Joi.number().allow(null),
});

const companyLocationMasterSchema = Joi.object({
	gstNo: Joi.string().allow(null).label("GST Number"),
	companyId: Joi.number().required().label("Company"),
	companyLocationCode: Joi.string().required().label("Company Location Code"),
	countryId: Joi.number().required().label("Country"),
	stateId: Joi.number().required().label("State"),
	cityId: Joi.number().required().label("City"),
	pincodeId: Joi.number().allow(null).label("Pin Code"),
	address1: Joi.string().required().label("Address1"),
	address2: Joi.string().allow(null).label("Address2"),
	mobileNo: Joi.string().trim().allow(null).label("Mobile Number"),
	phoneNo: Joi.string().trim().allow(null).label("Phone Number"),
	isHeadquarter: Joi.number().required().label("Headquarter"),
	companyLocationId: Joi.number().allow(null),
	isActive: Joi.boolean().allow(null),
});

const lwfMappingMasterSchema = Joi.object({
	lwfmappings: Joi.array().items(
		Joi.object(
			Object.assign(
				{
					lwfDesignationId: Joi.number().required().messages({
						"string.empty": "LWF designation is required",
					}),
				},
				{
					contributors: Joi.array().items(
						Joi.object(
							Object.assign(
								{
									lwfMappingId: Joi.number().optional().messages({
										"string.empty": "Mapping ID is required",
									}),
								},
								{
									contributorType: Joi.string().required().messages({
										"string.empty": "Contributor Type is required",
									}),
								},
								{
									stateId: Joi.number().required().messages({
										"string.empty": "State is required",
									}),
								},
								months.reduce((acc, month) => {
									acc[month] = Joi.string()
										.required()
										.messages({
											"string.empty": `${month} value is required`,
										});
									return acc;
								}, {}),
							),
						),
					),
				},
			),
		),
	),
});

// End schema by jay

//ritak hr policy categories start
const hrPolicyCategorySchema = Joi.object({
	name: Joi.string().trim().required().label("Category Name"),
});
const hrPolicySchema = Joi.object({
	name: Joi.string().trim().label("Policy Name"),
	category_id: Joi.number().integer().allow(null).label("Category ID"),
	policyDocument: Joi.string()
		.allow(null)
		.allow("")
		.optional()
		.label("Policy Document"),
	selectedUsers: Joi.string().allow(null, "").label("Selected Users"),
	sign_off_enabled: Joi.number()
		.valid(0, 1)
		.default(0)
		.label("Sign Off Enabled"),
	sign_off_mandatory: Joi.number()
		.valid(0, 1)
		.default(0)
		.label("Sign Off Mandatory"),
	allow_decline: Joi.number().valid(0, 1).default(0).label("Allow Decline"),
	reviseVersion: Joi.number()
		.valid(0, 1)
		.default(0)
		.label("Is revise Version request"),
	isActive: Joi.number().valid(0, 1).default(1).label("Is Active"),
	effective_date_from: Joi.date()
		.allow(null, "")
		.optional()
		.label("Effective Date From"),
	effective_date_to: Joi.date()
		.allow(null, "")
		.optional()
		.label("Effective Date To"),
		dateOfJoining: Joi.date()
		.allow(null, "")
		.optional()
		.label("Date Of Joining"),
		dateOfConfirmation: Joi.date()
		.allow(null, "")
		.optional()
		.label("Date Of Confirmation"),
	TriggerOnPolicyCreateEdit: Joi.number()
		.valid(0, 1)
		.default(0)
		.label("Trigger On Policy Create Edit"),
	TriggerOnEffectiveFrom: Joi.number()
		.valid(0, 1)
		.default(0)
		.label("Trigger On Effective From"),
	TriggerOnDateOfJoining: Joi.number()
		.valid(0, 1)
		.default(0)
		.label("Trigger On Date Of Joining"),
	TriggerOnDateOfConfirmation: Joi.number()
		.allow(null)
		.label("Trigger On Date Of Confirmation"),
});

const userAssignmentSchema = Joi.object({
	name: Joi.string().required(),
	process_id: Joi.number().optional().allow(null),
	conditions: Joi.array()
		.items(
			Joi.object({
				attribute: Joi.string().required(),
				condition_type: Joi.string().valid("INCLUDE", "EXCLUDE").required(),
				attribute_values: Joi.array().items(Joi.string()).required(), // ["1", "2", "3"]
			}),
		)
		.optional(),
});

//ritak hr policy categories end

export default {
	companyTypeMasterSchema,
	bandMasterSchema,
	jobLevelMasterSchema,
	bankMasterSchema,
	//RITAK WORK
	buMasterSchema,
	sbuMasterSchema,
	designationMasterSchema,
	gradeMasterSchema,
	degreeMasterSchema,
	holidayMasterSchema,
	newCustomerSchema,
	costCenterMasterSchema,
	companySchema,
	//RITAK WORK
	// jay start
	departmentMasterSchema,
	functionalAreaMasterSchema,
	weekoffMasterSchema,
	shiftMasterSchema,
	attendancePolicyMasterSchema,
	leaveMasterSchema,
	noticePeriodMasterSchema,
	ptLocationMasterSchema,
	jobLevelMappingSchema,
	departmentMappingSchema,
	functionalAreaMappingSchema,
	probationMasterSchema,
	companyLocationMasterSchema,
	lwfMappingMasterSchema,
	// jay end
	//ritak hr policy categories start
	hrPolicyCategorySchema,
	hrPolicySchema,
	userAssignmentSchema,
	//ritak hr policy categories end
};
