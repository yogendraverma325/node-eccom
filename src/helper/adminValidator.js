import Joi from "joi";

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

// Create masters schema by jay

const departmentMasterSchema = Joi.object({
  departmentName: Joi.string().trim().required().label("Department Name"),
  departmentCode: Joi.string().trim().required().label("Department Code")
});

const functionalAreaMasterSchema = Joi.object({
  functionalAreaName: Joi.string().trim().required().label("Department Name"),
  functionalAreaCode: Joi.string().trim().required().label("Department Code")
});

const weekoffMasterSchema = Joi.object({
  weekOffName: Joi.string().trim().required().label("Week Off Name"),
  nonWorkingDays: Joi.string().trim().allow(null).label("Non Working Days")
});

const shiftMasterSchema = Joi.object({
  shiftName: Joi.string().trim().required().label("Shift Name"),
  shiftStartTime: Joi.string().trim().required().label("Shift Start Time"),
  shiftEndTime: Joi.string().trim().required().label("Shift End Time"),
  shiftRemark: Joi.string().trim().required().label("Shift Remark"),
  isOverNight: Joi.number().required().label("Is Over Night")
});

const attendancePolicyMasterSchema = Joi.object({
  policyName: Joi.string().trim().required().label("Policy Name"),
  policyCode: Joi.string().trim().allow(null).label("Policy Code"),
  policyDescription: Joi.string().trim().allow(null).label("Policy Description"),
  requestLimit: Joi.number().required().label("Request Limit"),
  allowRequestFromHome: Joi.number().required().label("Allow Request From Home"),
  allowRequestFromDuty: Joi.number().required().label("Allow Request From Duty"),
  graceTimeClockIn: Joi.number().required().label("Grace Time Clock In"),
  graceTimeClockOut: Joi.number().required().label("Grace Time Clock Out"),
  allowBufferTime: Joi.number().required().label("Allow Buffer Time"),
  bufferTimePre: Joi.number().required().label("Buffer Time Pre"),
  bufferTimePost: Joi.number().required().label("Buffer Time Post"),
  isleaveDeductPolicyLateDuration: Joi.number().required().label("Is Leave Deduct Policy Late Duration"),
  leaveDeductPolicyLateDurationHalfDayTime: Joi.number().required().label("Leave Deduct Policy Late Duration Half Day Time"),
  leaveDeductPolicyLateDurationFullDayTime: Joi.number().required().label("Leave Deduct Policy Late Duration Full Day Time"),
  leaveDeductPolicyLateDurationLeaveType: Joi.number().required().label("Leave Deduct Policy Late Duration Leave Type"),
  isleaveDeductPolicyWorkDuration: Joi.number().required().label("Is Leave Deduct Policy Work Duration"),
  leaveDeductPolicyWorkDurationHalfDayTime: Joi.number().required().label("Leave Deduct Policy Work Duration Half Day Time"),
  leaveDeductPolicyWorkDurationFullDayTime: Joi.number().required().label("Leave Deduct Policy Work Duration Full Day Time"),
  leaveDeductPolicyWorkDurationLeaveType: Joi.number().required().label("Leave Deduct Policy Work Duration Leave Type"),
});

const leaveMasterSchema = Joi.object({
  leaveName: Joi.string().trim().required().label("Leave Name"),
  leaveCode: Joi.string().trim().required().label("Leave Code"),
  defaultLeaveCount: Joi.number().allow(null).label("Default Leave Count"),
  iterationDistribution: Joi.number().allow(null).label("Iteration Distribution"),
  canCarryForwardAhead: Joi.number().allow(null).label("Can Carry Forward Ahead"),
  systemGenerated: Joi.number().allow(null).label("System Generated"),
  creditDayOfMonth: Joi.number().allow(null).label("Credit Day Of Month"),
  canTakeHalfDay: Joi.number().allow(null).label("Can Take Hal fDay"),
  minConsecutiveDay: Joi.number().allow(null).label("Min Consecutive Day"),
  maxConsecutiveDay: Joi.number().allow(null).label("Max Consecutive Day"),
  attachmentRequired: Joi.number().allow(null).label("Attachment Required"),
  messageRequired: Joi.number().allow(null).label("Message Required")
});

const noticePeriodMasterSchema = Joi.object({
  noticePeriodName: Joi.string().trim().required().label("Notice Period Name"),
  noticePeriodCode: Joi.string().trim().required().label("Notice Period Code"),
  nPDaysAfterConfirmation: Joi.number().allow(null).label("nP Days After Confirmation"),
  nPDaysInProbation: Joi.number().allow(null).label("nP Days In Probation")
});

const ptLocationMasterSchema = Joi.object({
  ptLocationName: Joi.string().trim().required().label("PT Location Name"),
  ptLocationCode: Joi.string().trim().required().label("PT Location Code"),
  stateId: Joi.number().required().label("State"),
  frequency: Joi.string().required().label("Frequency")
});

const jobLevelMappingSchema = Joi.object({
  companyId: Joi.number().required().label("Company Name"),
  bandId: Joi.number().required().label("Band Name"),
  gradeId: Joi.number().required().label("Grade Name"),
  jobLevelId: Joi.number().required().label("Job Level Name"),
});

// End schema by jay

export default {
  companyTypeMasterSchema,
  bandMasterSchema,
  jobLevelMasterSchema,
  bankMasterSchema,
  // jay start
  departmentMasterSchema,
  functionalAreaMasterSchema,
  weekoffMasterSchema,
  shiftMasterSchema,
  attendancePolicyMasterSchema,
  leaveMasterSchema,
  noticePeriodMasterSchema,
  ptLocationMasterSchema,
  jobLevelMappingSchema
  // jay end
};
