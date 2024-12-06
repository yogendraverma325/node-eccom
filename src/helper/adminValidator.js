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
  bandIfsc: Joi.string().trim().required().label("Bank IFSC"),
});

export default {
  companyTypeMasterSchema,
  bandMasterSchema,
  jobLevelMasterSchema,
  bankMasterSchema
};
