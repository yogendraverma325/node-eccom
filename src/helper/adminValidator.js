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
  nonWorkingDays: Joi.string().trim().required().label("Non Working Days")
});

const shiftMasterSchema = Joi.object({
  shiftName: Joi.string().trim().required().label("Shift Name"),
  shiftStartTime: Joi.string().trim().required().label("Shift Start Time"),
  shiftEndTime: Joi.string().trim().required().label("Shift End Time"),
  shiftRemark: Joi.string().trim().required().label("Shift Remark"),
  isOverNight: Joi.number().required().label("Is Over Night")
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
  shiftMasterSchema
  // jay end
};
