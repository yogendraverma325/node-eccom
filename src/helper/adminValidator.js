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

///RITAK WORK
const buMasterSchema = Joi.object({
 buName: Joi.string().trim().required().label("Bu Name"),
 buCode: Joi.string().trim().required().label("Bu Code"),
});
const sbuMasterSchema = Joi.object({
 sbuName: Joi.string().trim().required().label("Sbu Name"),
 code: Joi.string().trim().required().label("Sbu Code"),
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
});


const newCustomerSchema = Joi.object({
 newCustomerName: Joi.string().trim().required().label("New Customer Name"),
});

//RITAK WORK

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
 newCustomerSchema
  //RITAK WORK
};
