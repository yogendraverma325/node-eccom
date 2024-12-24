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
  locations: Joi.array().required().label("Company Location"),
});

const newCustomerSchema = Joi.object({
  newCustomerName: Joi.string().trim().required().label("New Customer Name"),
});

//RITAK WORK
// Create masters schema by jay

const departmentMasterSchema = Joi.object({
  departmentName: Joi.string().trim().required().label("Department Name"),
  departmentCode: Joi.string().trim().required().label("Department Code"),
});

const functionalAreaMasterSchema = Joi.object({
  functionalAreaName: Joi.string().trim().required().label("Department Name"),
  functionalAreaCode: Joi.string().trim().required().label("Department Code"),
});

// End schema by jay
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
// RITAK WORK

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
  // jay end
};
