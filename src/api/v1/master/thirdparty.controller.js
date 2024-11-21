import { Op } from "sequelize";
import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import client from "../../../config/redisDb.config.js";
import Pagination from "../../../helper/pagination.js";
import logger from "../../../helper/logger.js";
import validator from "../../../helper/validator.js";
import moment from "moment";
import helper from "../../../helper/helper.js";
import crypto from "crypto";

class ThirdPartyController {
  // async employeeData(req, res) {
  //   try {
  //     const { dataset, isActive } = req.body;
  //     const taraEmailId = process.env.TARA_EMAIL_ID;
  //     const taraSecretKey = process.env.TARA_SECRET_KEY;

  //     const unixTime = Math.floor(Date.now() / 1000);
  //     console.log("unixTime>>", unixTime);
  //     const date = new Date(unixTime * 1000); // Convert Unix timestamp to Date object
  //     // Function to format the time
  //     function formatTime(date) {
  //       const hours = date.getHours(); // Get the hour
  //       const minutes = date.getMinutes(); // Get the minutes
  //       const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
  //       const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  //       const formattedMinutes = minutes < 10 ? "0" + minutes : minutes; // Ensure two-digit minutes

  //       return `${formattedHours}:${formattedMinutes} ${ampm}`; // Return formatted time without seconds
  //     }

  //     const currentTime = formatTime(date);
  //      console.log("currentTime",currentTime)
  //     if (!dataset || (isActive !== 0 && isActive !== 1)) {
  //       return res.status(400).json({ error: "Invalid input" });
  //     }

  //     // Generate hash for isActive = 1
  //     const concatenatedStringActive = `${taraEmailId}${taraSecretKey}${currentTime}1`;
  //     const hashActive = await helper.generateSHA512Hash(
  //       concatenatedStringActive
  //     );

  //     // Generate hash for isActive = 0
  //     const concatenatedStringInactive = `${taraEmailId}${taraSecretKey}${currentTime}0`;
  //     const hashInactive = await helper.generateSHA512Hash(
  //       concatenatedStringInactive
  //     );

  //     console.log("Generated Hash (Active):", hashActive);
  //     console.log("Generated Hash (Inactive):", hashInactive);

  //     // Compare the dataset with the appropriate hash
  //     const isEqualActive = crypto.timingSafeEqual(
  //       Buffer.from(hashActive, "hex"),
  //       Buffer.from(dataset, "hex")
  //     );

  //     const isEqualInActive = crypto.timingSafeEqual(
  //       Buffer.from(hashInactive, "hex"),
  //       Buffer.from(dataset, "hex")
  //     );

  //     if (isEqualActive) {
  //       const employeeData = await db.employeeMaster.findAll({
  //         where: { isActive: isActive },
  //         attributes: [
  //           "id",
  //           "empCode",
  //           "email",
  //           "personalEmail",
  //           "name",
  //           "firstName",
  //           "middleName",
  //           "lastName",
  //           "officeMobileNumber",
  //           "personalMobileNumber",
  //           "isActive",
  //           "dateOfexit",
  //           "uanNo",
  //           "pfNo",
  //           "esicNo",
  //           "panNo",
  //           "adhrNo",
  //           "passportNumber",
  //           "drivingLicence",
  //         ],
  //         include: [
  //           {
  //             model: db.biographicalDetails,
  //             attributes: [
  //               "dateOfBirth",
  //               "maritalStatus",
  //               "maritalStatusSince",
  //               "gender",
  //             ],
  //             required: false,
  //           },
  //           {
  //             model: db.designationMaster,
  //             attributes: [
  //               ["name", "designation_name"],
  //               ["code", "designation_code"], // Retrieve the code as well
  //               [
  //                 db.sequelize.literal(
  //                   "CONCAT(`designationmaster`.`name`, ' (', `designationmaster`.`code`, ')')"
  //                 ),
  //                 "designation_with_code", // designation with code combined
  //               ],
  //             ],
  //             required: false,
  //           },
  //           {
  //             model: db.departmentMaster,
  //             attributes: [["departmentCode", "department_code"]],
  //             required: false,
  //           },
  //           {
  //             model: db.buMaster,
  //             attributes: [["buName", "business_unit"]],
  //             required: false,
  //           },
  //           {
  //             model: db.employeeTypeMaster,
  //             attributes: ["emptypename"],
  //             required: false,
  //           },
  //           {
  //             model: db.employeeMaster,
  //             required: false,
  //             as: "managerData",
  //             attributes: ["empCode"],
  //           },
  //           {
  //             model: db.jobDetails,
  //             attributes: [
  //               "dateOfJoining",
  //               "residentEng",
  //               "customerName",
  //               "esicNumber",
  //               "pfRestricted",
  //               "epfApplicable",
  //               "esicApplicable",
  //             ],
  //             include: [
  //               { model: db.gradeMaster, attributes: ["gradeName"] },
  //               { model: db.bandMaster, attributes: ["bandDesc"] },
  //               {
  //                 model: db.jobLevelMaster,
  //                 attributes: ["jobLevelName", "jobLevelCode"],
  //               },
  //             ],
  //           },
  //           {
  //             model: db.companyLocationMaster,
  //             attributes: [["address1", "current_address"]],
  //             required: false,
  //           },
  //           {
  //             model: db.paymentDetails,
  //             attributes: ["paymentAccountNumber"],
  //             required: false,
  //             where: {
  //               status: "approved",
  //             },

  //             include: [
  //               {
  //                 model: db.bankMaster,
  //                 attributes: ["bankId", "bankName", "bankIfsc"],
  //               },
  //             ],
  //           },
  //           {
  //             model: db.employeeAddress,
  //             include: [
  //               {
  //                 model: db.countryMaster,
  //                 attributes: ["countryId", "countryName"],
  //                 as: "currentcountry",
  //               },
  //               {
  //                 model: db.countryMaster,
  //                 attributes: ["countryId", "countryName"],
  //                 as: "permanentcountry",
  //               },
  //               {
  //                 model: db.countryMaster,
  //                 attributes: ["countryId", "countryName"],
  //                 as: "emergencycountry",
  //               },
  //               {
  //                 model: db.stateMaster,
  //                 attributes: ["stateId", "stateName"],
  //                 as: "currentstate",
  //               },
  //               {
  //                 model: db.stateMaster,
  //                 attributes: ["stateId", "stateName"],
  //                 as: "permanentstate",
  //               },
  //               {
  //                 model: db.stateMaster,
  //                 attributes: ["stateId", "stateName"],
  //                 as: "emergencystate",
  //               },
  //               {
  //                 model: db.cityMaster,
  //                 attributes: ["cityId", "cityName"],
  //                 as: "currentcity",
  //               },
  //               {
  //                 model: db.cityMaster,
  //                 attributes: ["cityId", "cityName"],
  //                 as: "permanentcity",
  //               },
  //               {
  //                 model: db.cityMaster,
  //                 attributes: ["cityId", "cityName"],
  //                 as: "emergencycity",
  //               },
  //               {
  //                 model: db.pinCodeMaster,
  //                 attributes: ["pincodeId", "pincode"],
  //                 as: "currentpincode",
  //               },
  //               {
  //                 model: db.pinCodeMaster,
  //                 attributes: ["pincodeId", "pincode"],
  //                 as: "permanentpincode",
  //               },
  //               {
  //                 model: db.pinCodeMaster,
  //                 attributes: ["pincodeId", "pincode"],
  //                 as: "emergencypincode",
  //               },
  //             ],
  //           },
  //           {
  //             model: db.companyLocationMaster,
  //             attributes: ["address1", "companyLocationCode"],
  //             include: [
  //               { model: db.countryMaster, attributes: ["countryName"] },
  //               { model: db.stateMaster, attributes: ["stateName"] },
  //               { model: db.cityMaster, attributes: ["cityName"] },
  //               { model: db.pinCodeMaster, attributes: ["pinCode"] },
  //             ],
  //           },
  //           {
  //             model: db.emergencyDetails,
  //             required: false,
  //           },
  //           {
  //             model: db.costCenterMaster,
  //             attributes: ["costCenterName", "costCenterCode"],
  //             required: false,
  //           },
  //           {
  //             model: db.functionalAreaMaster,
  //             attributes: ["functionalAreaName", "functionalAreaCode"],
  //           },
  //           {
  //             model: db.companyMaster,
  //             attributes: ["companyName", "companyCode"],
  //           },
  //           {
  //             model: db.buMaster,
  //             attributes: ["buName", "buCode"],
  //           },
  //           {
  //             model: db.sbuMaster,
  //             attributes: ["sbuname", "code"],
  //           },
  //           {
  //             model: db.educationDetails,
  //             include: [
  //               {
  //                 model: db.degreeMaster,
  //               },
  //             ],
  //           },
  //           {
  //             model: db.familyDetails,
  //             required: false,
  //             where: {
  //               isActive: 1,
  //             },
  //             attributes: [
  //               "name",
  //               ["relationWithEmp", "relation"],
  //               [
  //                 db.sequelize.literal(
  //                   `IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')` // Format DOB or return an empty string if NULL
  //                 ),
  //                 "dob",
  //               ],
  //             ],
  //           },
  //           {
  //             model: db.employeeWorkExperience,
  //           },
  //         ],
  //         //raw: true,
  //       });

  //       const manipulatedData = employeeData.map((employee) => {
  //         const transformedWorkExperience =
  //           employee.employeeworkexperiences.map((experience) => ({
  //             company: experience.companyName || "",
  //             title: experience.jobTitle || "",
  //             location: experience.jobLocation || "",
  //             from_date: experience.fromDate || "",
  //             to_date: experience.toDate || "",
  //           }));

  //         const formatDate = (date) =>
  //           date ? moment(date).format("DD-MMM-YYYY") : ""; // Format date to DD-MMM-YYYY

  //         const mappedEducationDetails = employee.employeeeducationdetails.map(
  //           (edu) => ({
  //             institution_name: edu.educationInstitute || "",
  //             level_of_study: edu.degreemaster?.degreeType || "",
  //             field_of_study: edu.educationSpecialisation || "",
  //             education_category: "",
  //             gpa_percentage: "",
  //             course_type: "",
  //             university: "",
  //             completed_by_from: edu.educationStartDate
  //               ? moment(edu.educationStartDate).isValid()
  //                 ? moment(edu.educationStartDate).format("DD-MM-YYYY")
  //                 : ""
  //               : "",
  //             completed_by_to: edu.educationCompletionDate
  //               ? moment(edu.educationCompletionDate).isValid()
  //                 ? moment(edu.educationCompletionDate).format("DD-MM-YYYY")
  //                 : ""
  //               : "",
  //             high_edu_qualification: edu.isHighestEducation == 0 ? "" : "Yes",
  //             //degreeName: edu.degreemaster?.degreeName || "", // Fallback to an empty string if degreeName is null/undefined
  //           })
  //         );

  //         const maritalStatusOptions = {
  //           Married: 1,
  //           Single: 2,
  //           Divorced: 3,
  //           Separated: 4,
  //           Widowed: 5,
  //           Others: 6,
  //         };

  //         const maritalStatus = employee.employeebiographicaldetail?.dataValues
  //           ?.maritalStatus
  //           ? Object.keys(maritalStatusOptions).find(
  //               (key) =>
  //                 maritalStatusOptions[key] ===
  //                 employee.employeebiographicaldetail.dataValues.maritalStatus
  //             ) || ""
  //           : "";
  //         return {
  //           employee_id: employee.empCode || "",
  //           first_name: employee.firstName || "",
  //           middle_name: employee.middleName || "",
  //           last_name: employee.lastName || "",
  //           designation:
  //             employee.designationmaster?.dataValues?.designation_with_code ||
  //             "",
  //           current_address: employee.employeeaddress?.dataValues
  //             ? [
  //                 employee.employeeaddress?.dataValues?.currentHouse,
  //                 employee.employeeaddress?.dataValues?.currentStreet,
  //                 employee.employeeaddress?.dataValues?.currentLandmark,
  //                 employee.employeeaddress?.dataValues?.currentcity?.cityName,
  //                 employee.employeeaddress?.dataValues?.currentstate?.stateName,
  //                 employee.employeeaddress?.dataValues?.currentcountry
  //                   ?.countryName,
  //                 employee.employeeaddress?.dataValues?.currentpincode?.pincode,
  //               ]
  //                 .filter((item) => item && item !== null && item !== undefined)
  //                 .join(", ")
  //             : "",
  //           current_city:
  //             employee.employeeaddress?.dataValues?.currentcity?.cityName,
  //           current_pin_code:
  //             employee.employeeaddress?.dataValues?.currentpincode?.dataValues
  //               ?.pincode || "", // You may need to extract pincode
  //           current_country:
  //             employee.employeeaddress?.dataValues?.currentcountry?.dataValues
  //               ?.countryName,
  //           office_mobile_no: employee.officeMobileNumber || "",
  //           personal_mobile_no: employee.personalMobileNumber || "",
  //           date_of_birth:
  //             formatDate(
  //               employee.employeebiographicaldetail?.dataValues?.dateOfBirth
  //             ) || "",
  //           gender: employee.employeebiographicaldetail?.gender || "",
  //           date_of_activation:
  //             formatDate(
  //               employee.employeejobdetail?.dataValues?.dateOfJoining
  //             ) || "",
  //           grade:
  //             employee.employeejobdetail?.dataValues?.grademaster?.dataValues
  //               ?.gradeName || "",
  //           department_code:
  //             employee.departmentmaster?.dataValues?.department_code || "",
  //           direct_manager_employee_id:
  //             employee.managerData?.dataValues?.empCode || "",
  //           marital_status: maritalStatus || "",
  //           anniversary_date:
  //             formatDate(
  //               employee.employeebiographicaldetail?.dataValues
  //                 ?.maritalStatusSince
  //             ) || "",
  //           business_unit: employee.bumaster?.dataValues?.buName || "",
  //           bank_pan: employee.dataValues?.panNo || "",
  //           pf_number: employee.dataValues?.pfNo || "",
  //           esic_number:
  //             employee.employeejobdetail?.dataValues?.esicNumber || "", //employee.dataValues?.esicNo || "",
  //           blood_group:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyBloodGroup || "",
  //           bank_name:
  //             employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
  //               ?.bankName || "",
  //           bank_account:
  //             employee.employeepaymentdetail?.dataValues
  //               ?.paymentAccountNumber || "",
  //           date_of_resignation: "",
  //           date_of_exit: formatDate(employee.dateOfexit) || "", //employee.dateOfexit || "",
  //           date_of_confirmation: "", // Custom field, left empty for now
  //           bank_ifsc:
  //             employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
  //               ?.bankIfsc || "",
  //           designation_code:
  //             employee.designationmaster?.dataValues?.designation_code || "",
  //           full_name: employee.name || "",
  //           permanent_address: employee.employeeaddress?.dataValues
  //             ? [
  //                 employee.employeeaddress?.dataValues?.permanentHouse,
  //                 employee.employeeaddress?.dataValues?.permanentStreet,
  //                 employee.employeeaddress?.dataValues?.permanentLandmark,
  //                 employee.employeeaddress?.dataValues?.permanentcity?.cityName,
  //                 employee.employeeaddress?.dataValues?.permanentstate
  //                   ?.stateName,
  //                 employee.employeeaddress?.dataValues?.permanentcountry
  //                   ?.countryName,
  //                 employee.employeeaddress?.dataValues?.permanentpincode
  //                   ?.pincode,
  //               ]
  //                 .filter((item) => item && item !== null && item !== undefined)
  //                 .join(", ")
  //             : "",
  //           date_of_joining:
  //             formatDate(
  //               employee.employeejobdetail?.dataValues?.dateOfJoining
  //             ) || "",
  //           uan_number: employee.dataValues?.uanNo || "",
  //           aadhaar_number: employee.adhrNo || "",
  //           employee_type:
  //             employee.employeetypemaster?.dataValues?.emptypename || "",
  //           permanent_city:
  //             employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
  //             "", //employee.employeeaddress?.permanentcity?.cityName || "",
  //           permanent_pin_code:
  //             employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
  //             "",
  //           permanent_country:
  //             employee.employeeaddress?.dataValues?.permanentcountry
  //               ?.countryName || "",
  //           company_email_id: employee.email || "",
  //           personal_email_id: employee.personalEmail || "",
  //           base_office_location: `${
  //             employee.companylocationmaster?.dataValues?.citymaster?.dataValues
  //               ?.cityName || ""
  //           }-${
  //             employee.companylocationmaster?.dataValues?.statemaster
  //               ?.dataValues?.stateName || ""
  //           }`,
  //           location_type: "",
  //           office_location: `${
  //             employee.companylocationmaster?.dataValues?.citymaster?.dataValues
  //               ?.cityName || ""
  //           }-${
  //             employee.companylocationmaster?.dataValues?.statemaster
  //               ?.dataValues?.stateName || ""
  //           }`,
  //           education_details: mappedEducationDetails || [],
  //           pt_state: "", // Custom field
  //           past_work_experience: "", //
  //           past_work: transformedWorkExperience || [],
  //           employee_separation_comments: "",
  //           employee_separation_reason: "",
  //           passport_number: employee.passportNumber || "",
  //           emergency_contact_number:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyContactNumber || "",
  //           emergency_contact_person:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyContactName || "",
  //           emergency_contact_relation:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyContactRelation || "",
  //           emergency_contact_country_code:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergency_contact_country_code || "",
  //           emergency_address: employee.employeeaddress?.dataValues
  //             ? [
  //                 employee.employeeaddress?.dataValues?.emergencyHouse,
  //                 employee.employeeaddress?.dataValues?.emergencyStreet,
  //                 employee.employeeaddress?.dataValues?.emergencyLandmark,
  //                 employee.employeeaddress?.dataValues?.emergencycity
  //                   ?.dataValues?.cityName,
  //                 employee.employeeaddress?.dataValues?.emergencystate
  //                   ?.dataValues?.stateName,
  //                 employee.employeeaddress?.dataValues?.emergencycountry
  //                   ?.dataValues?.countryName,
  //                 employee.employeeaddress?.dataValues?.emergencypincode
  //                   ?.dataValues?.pincode,
  //               ]
  //                 .filter((item) => item && item !== null && item !== undefined)
  //                 .join(", ")
  //             : "",
  //           //cost_center: `${employee.costcentermaster?.dataValues?.costCenterName || ""} (${employee.costcentermaster?.dataValues?.costCenterCode || ""})`,
  //           cost_center:
  //             employee.costcentermaster?.dataValues?.costCenterName ||
  //             employee.costcentermaster?.dataValues?.costCenterCode
  //               ? `${
  //                   employee.costcentermaster?.dataValues?.costCenterName || ""
  //                 } (${
  //                   employee.costcentermaster?.dataValues?.costCenterCode || ""
  //                 })`
  //               : "",
  //           salary_stopped: "",
  //           vpf_amount: "",
  //           vpf_start_date: "",
  //           "reason_for_leaving_3_(new_employer_name)": "",
  //           "reason_for_leaving_4_(new_ctc)": "",
  //           "reason_for_leaving_5_(new_role)": "",
  //           is_appointment_letter_uploaded_: "",
  //           name_of_certifications: "",
  //           certification_valid_upto: "",
  //           certification_completion_date: "",
  //           dependents: employee.employeefamilydetails || [],
  //           cost_center_id:
  //             employee.costcentermaster?.dataValues?.costCenterCode || "",
  //           esic_applicable: employee.dataValues?.employeejobdetail
  //             ?.esicApplicable
  //             ? "Yes"
  //             : "No",
  //           pf_applicable_from: "",
  //           epf_applicable: employee.employeejobdetail?.dataValues
  //             ?.epfApplicable
  //             ? "Yes"
  //             : "No",
  //           driving_license_no: employee.drivingLicence || "",
  //           latest_modified_any_attribute: "",
  //           group_company:
  //             employee.companymaster?.dataValues?.companyName || "",
  //           sub_employee_type: "Permanent B",
  //           sbu_code: employee.sbumaster?.dataValues?.code || "",
  //           branch_code:
  //             employee.companylocationmaster?.dataValues?.companyLocationCode ||
  //             "",
  //           customer_code:
  //             employee.employeejobdetail?.dataValues?.customerName || "",
  //           project_code: "",
  //           pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
  //             ? "Yes"
  //             : "No",
  //           functional_area_code:
  //             employee.functionalareamaster?.dataValues?.functionalAreaCode ||
  //             "",
  //           separation_transaction_date: "",
  //           "father's_name":
  //             employee.employeefamilydetails.find(
  //               (f) => f.dataValues.relation === "Father"
  //             )?.dataValues.name || "",
  //           ot_branch_code: "",
  //           passport_valid_upto: "",
  //           policy_name: "",
  //           kind_of_disability: "",
  //           insurance_no: "",
  //           block_salary_processing: "",
  //           re: employee.employeejobdetail?.dataValues?.residentEng
  //             ? "Yes"
  //             : "No",
  //           functional_area:
  //             employee.functionalareamaster?.dataValues?.functionalAreaName ||
  //             "",
  //           business_unit_code: employee.bumaster?.dataValues?.buCode || "",
  //         };
  //       });

  //       res.status(200).json({
  //         status: 1,
  //         message: "Successfully loaded all employees data",
  //         employee_data: manipulatedData,
  //       });
  //     } else if (isEqualInActive) {
  //       const employeeData = await db.employeeMaster.findAll({
  //         where: { isActive: isActive },
  //         attributes: [
  //           "id",
  //           "empCode",
  //           "email",
  //           "personalEmail",
  //           "name",
  //           "firstName",
  //           "middleName",
  //           "lastName",
  //           "officeMobileNumber",
  //           "personalMobileNumber",
  //           "isActive",
  //           "dateOfexit",
  //           "uanNo",
  //           "pfNo",
  //           "esicNo",
  //           "panNo",
  //           "adhrNo",
  //           "passportNumber",
  //           "drivingLicence",
  //         ],
  //         include: [
  //           {
  //             model: db.biographicalDetails,
  //             attributes: [
  //               "dateOfBirth",
  //               "maritalStatus",
  //               "maritalStatusSince",
  //               "gender",
  //             ],
  //             required: false,
  //           },
  //           {
  //             model: db.designationMaster,
  //             attributes: [
  //               ["name", "designation_name"],
  //               ["code", "designation_code"], // Retrieve the code as well
  //               [
  //                 db.sequelize.literal(
  //                   "CONCAT(`designationMaster`.`name`, ' (', `designationMaster`.`code`, ')')"
  //                 ),
  //                 "designation_with_code", // designation with code combined
  //               ],
  //             ],
  //             required: false,
  //           },
  //           {
  //             model: db.departmentMaster,
  //             attributes: [["departmentCode", "department_code"]],
  //             required: false,
  //           },
  //           {
  //             model: db.buMaster,
  //             attributes: [["buName", "business_unit"]],
  //             required: false,
  //           },
  //           {
  //             model: db.employeeTypeMaster,
  //             attributes: ["emptypename"],
  //             required: false,
  //           },
  //           {
  //             model: db.employeeMaster,
  //             required: false,
  //             as: "managerData",
  //             attributes: ["empCode"],
  //           },
  //           {
  //             model: db.jobDetails,
  //             attributes: [
  //               "dateOfJoining",
  //               "residentEng",
  //               "customerName",
  //               "esicNumber",
  //               "pfRestricted",
  //               "epfApplicable",
  //               "esicApplicable",
  //             ],
  //             include: [
  //               { model: db.gradeMaster, attributes: ["gradeName"] },
  //               { model: db.bandMaster, attributes: ["bandDesc"] },
  //               {
  //                 model: db.jobLevelMaster,
  //                 attributes: ["jobLevelName", "jobLevelCode"],
  //               },
  //             ],
  //           },
  //           {
  //             model: db.companyLocationMaster,
  //             attributes: [["address1", "current_address"]],
  //             required: false,
  //           },
  //           {
  //             model: db.paymentDetails,
  //             attributes: ["paymentAccountNumber"],
  //             required: false,
  //             where: {
  //               status: "approved",
  //             },

  //             include: [
  //               {
  //                 model: db.bankMaster,
  //                 attributes: ["bankId", "bankName", "bankIfsc"],
  //               },
  //             ],
  //           },
  //           {
  //             model: db.employeeAddress,
  //             include: [
  //               {
  //                 model: db.countryMaster,
  //                 attributes: ["countryId", "countryName"],
  //                 as: "currentcountry",
  //               },
  //               {
  //                 model: db.countryMaster,
  //                 attributes: ["countryId", "countryName"],
  //                 as: "permanentcountry",
  //               },
  //               {
  //                 model: db.countryMaster,
  //                 attributes: ["countryId", "countryName"],
  //                 as: "emergencycountry",
  //               },
  //               {
  //                 model: db.stateMaster,
  //                 attributes: ["stateId", "stateName"],
  //                 as: "currentstate",
  //               },
  //               {
  //                 model: db.stateMaster,
  //                 attributes: ["stateId", "stateName"],
  //                 as: "permanentstate",
  //               },
  //               {
  //                 model: db.stateMaster,
  //                 attributes: ["stateId", "stateName"],
  //                 as: "emergencystate",
  //               },
  //               {
  //                 model: db.cityMaster,
  //                 attributes: ["cityId", "cityName"],
  //                 as: "currentcity",
  //               },
  //               {
  //                 model: db.cityMaster,
  //                 attributes: ["cityId", "cityName"],
  //                 as: "permanentcity",
  //               },
  //               {
  //                 model: db.cityMaster,
  //                 attributes: ["cityId", "cityName"],
  //                 as: "emergencycity",
  //               },
  //               {
  //                 model: db.pinCodeMaster,
  //                 attributes: ["pincodeId", "pincode"],
  //                 as: "currentpincode",
  //               },
  //               {
  //                 model: db.pinCodeMaster,
  //                 attributes: ["pincodeId", "pincode"],
  //                 as: "permanentpincode",
  //               },
  //               {
  //                 model: db.pinCodeMaster,
  //                 attributes: ["pincodeId", "pincode"],
  //                 as: "emergencypincode",
  //               },
  //             ],
  //           },
  //           {
  //             model: db.companyLocationMaster,
  //             attributes: ["address1", "companyLocationCode"],
  //             include: [
  //               { model: db.countryMaster, attributes: ["countryName"] },
  //               { model: db.stateMaster, attributes: ["stateName"] },
  //               { model: db.cityMaster, attributes: ["cityName"] },
  //               { model: db.pinCodeMaster, attributes: ["pinCode"] },
  //             ],
  //           },
  //           {
  //             model: db.emergencyDetails,
  //             required: false,
  //           },
  //           {
  //             model: db.costCenterMaster,
  //             attributes: ["costCenterName", "costCenterCode"],
  //             required: false,
  //           },
  //           {
  //             model: db.functionalAreaMaster,
  //             attributes: ["functionalAreaName", "functionalAreaCode"],
  //           },
  //           {
  //             model: db.companyMaster,
  //             attributes: ["companyName", "companyCode"],
  //           },
  //           {
  //             model: db.buMaster,
  //             attributes: ["buName", "buCode"],
  //           },
  //           {
  //             model: db.sbuMaster,
  //             attributes: ["sbuname", "code"],
  //           },
  //           {
  //             model: db.educationDetails,
  //             include: [
  //               {
  //                 model: db.degreeMaster,
  //               },
  //             ],
  //           },
  //           {
  //             model: db.familyDetails,
  //             required: false,
  //             where: {
  //               isActive: 1,
  //             },
  //             attributes: [
  //               "name",
  //               ["relationWithEmp", "relation"],
  //               [
  //                 db.sequelize.literal(
  //                   `IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')` // Format DOB or return an empty string if NULL
  //                 ),
  //                 "dob",
  //               ],
  //             ],
  //           },
  //           {
  //             model: db.employeeWorkExperience,
  //           },
  //         ],
  //         //raw: true,
  //       });

  //       const manipulatedData = employeeData.map((employee) => {
  //         const transformedWorkExperience =
  //           employee.employeeworkexperiences.map((experience) => ({
  //             company: experience.companyName || "",
  //             title: experience.jobTitle || "",
  //             location: experience.jobLocation || "",
  //             from_date: experience.fromDate || "",
  //             to_date: experience.toDate || "",
  //           }));

  //         const formatDate = (date) =>
  //           date ? moment(date).format("DD-MMM-YYYY") : ""; // Format date to DD-MMM-YYYY

  //         const mappedEducationDetails = employee.employeeeducationdetails.map(
  //           (edu) => ({
  //             institution_name: edu.educationInstitute || "",
  //             level_of_study: edu.degreemaster?.degreeType || "",
  //             field_of_study: edu.educationSpecialisation || "",
  //             education_category: "",
  //             gpa_percentage: "",
  //             course_type: "",
  //             university: "",
  //             completed_by_from: edu.educationStartDate
  //               ? moment(edu.educationStartDate).isValid()
  //                 ? moment(edu.educationStartDate).format("DD-MM-YYYY")
  //                 : ""
  //               : "",
  //             completed_by_to: edu.educationCompletionDate
  //               ? moment(edu.educationCompletionDate).isValid()
  //                 ? moment(edu.educationCompletionDate).format("DD-MM-YYYY")
  //                 : ""
  //               : "",
  //             high_edu_qualification: edu.isHighestEducation == 0 ? "" : "Yes",
  //             //degreeName: edu.degreemaster?.degreeName || "", // Fallback to an empty string if degreeName is null/undefined
  //           })
  //         );

  //         const maritalStatusOptions = {
  //           Married: 1,
  //           Single: 2,
  //           Divorced: 3,
  //           Separated: 4,
  //           Widowed: 5,
  //           Others: 6,
  //         };

  //         const maritalStatus = employee.employeebiographicaldetail?.dataValues
  //           ?.maritalStatus
  //           ? Object.keys(maritalStatusOptions).find(
  //               (key) =>
  //                 maritalStatusOptions[key] ===
  //                 employee.employeebiographicaldetail.dataValues.maritalStatus
  //             ) || ""
  //           : "";
  //         // return {
  //         //   employee_id: employee.empCode || "",
  //         //   first_name: employee.firstName || "",
  //         //   middle_name: employee.middleName || "",
  //         //   last_name: employee.lastName || "",
  //         //   designation:
  //         //     employee.designationmaster?.dataValues?.designation_with_code ||
  //         //     "",
  //         //   current_address: employee.employeeaddress?.dataValues
  //         //     ? [
  //         //         employee.employeeaddress?.dataValues?.currentHouse,
  //         //         employee.employeeaddress?.dataValues?.currentStreet,
  //         //         employee.employeeaddress?.dataValues?.currentLandmark,
  //         //         employee.employeeaddress?.dataValues?.currentcity?.cityName,
  //         //         employee.employeeaddress?.dataValues?.currentstate?.stateName,
  //         //         employee.employeeaddress?.dataValues?.currentcountry
  //         //           ?.countryName,
  //         //         employee.employeeaddress?.dataValues?.currentpincode?.pincode,
  //         //       ]
  //         //         .filter((item) => item && item !== null && item !== undefined)
  //         //         .join(", ")
  //         //     : "",
  //         //   current_city:
  //         //     employee.employeeaddress?.dataValues?.currentcity?.cityName,
  //         //   current_pin_code:
  //         //     employee.employeeaddress?.dataValues?.currentpincode?.dataValues
  //         //       ?.pincode || "", // You may need to extract pincode
  //         //   current_country:
  //         //     employee.employeeaddress?.dataValues?.currentcountry?.dataValues
  //         //       ?.countryName,
  //         //   office_mobile_no: employee.officeMobileNumber || "",
  //         //   personal_mobile_no: employee.personalMobileNumber || "",
  //         //   date_of_birth:
  //         //     formatDate(
  //         //       employee.employeebiographicaldetail?.dataValues?.dateOfBirth
  //         //     ) || "",
  //         //   gender: employee.employeebiographicaldetail?.gender || "",
  //         //   date_of_activation:
  //         //     formatDate(
  //         //       employee.employeejobdetail?.dataValues?.dateOfJoining
  //         //     ) || "",
  //         //   grade:
  //         //     employee.employeejobdetail?.dataValues?.grademaster?.dataValues
  //         //       ?.gradeName || "",
  //         //   department_code:
  //         //     employee.departmentmaster?.dataValues?.department_code || "",
  //         //   direct_manager_employee_id:
  //         //     employee.managerData?.dataValues?.empCode || "",
  //         //   marital_status: maritalStatus || "",
  //         //   anniversary_date:
  //         //     formatDate(
  //         //       employee.employeebiographicaldetail?.dataValues
  //         //         ?.maritalStatusSince
  //         //     ) || "",
  //         //   business_unit: employee.bumaster?.dataValues?.buName || "",
  //         //   bank_pan: employee.dataValues?.panNo || "",
  //         //   pf_number: employee.dataValues?.pfNo || "",
  //         //   esic_number:
  //         //     employee.employeejobdetail?.dataValues?.esicNumber || "", //employee.dataValues?.esicNo || "",
  //         //   blood_group:
  //         //     employee.employeeemergencycontact?.dataValues
  //         //       ?.emergencyBloodGroup || "",
  //         //   bank_name:
  //         //     employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
  //         //       ?.bankName || "",
  //         //   bank_account:
  //         //     employee.employeepaymentdetail?.dataValues
  //         //       ?.paymentAccountNumber || "",
  //         //   date_of_resignation: "",
  //         //   date_of_exit: employee.dateOfexit || "",
  //         //   date_of_confirmation: "", // Custom field, left empty for now
  //         //   bank_ifsc:
  //         //     employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
  //         //       ?.bankIfsc || "",
  //         //   designation_code:
  //         //     employee.designationmaster?.dataValues?.designation_code || "",
  //         //   full_name: employee.name || "",
  //         //   permanent_address: employee.employeeaddress?.dataValues
  //         //     ? [
  //         //         employee.employeeaddress?.dataValues?.permanentHouse,
  //         //         employee.employeeaddress?.dataValues?.permanentStreet,
  //         //         employee.employeeaddress?.dataValues?.permanentLandmark,
  //         //         employee.employeeaddress?.dataValues?.permanentcity?.cityName,
  //         //         employee.employeeaddress?.dataValues?.permanentstate
  //         //           ?.stateName,
  //         //         employee.employeeaddress?.dataValues?.permanentcountry
  //         //           ?.countryName,
  //         //         employee.employeeaddress?.dataValues?.permanentpincode
  //         //           ?.pincode,
  //         //       ]
  //         //         .filter((item) => item && item !== null && item !== undefined)
  //         //         .join(", ")
  //         //     : "",
  //         //   date_of_joining:
  //         //     formatDate(
  //         //       employee.employeejobdetail?.dataValues?.dateOfJoining
  //         //     ) || "",
  //         //   uan_number: employee.dataValues?.uanNo || "",
  //         //   aadhaar_number: employee.adhrNo || "",
  //         //   employee_type:
  //         //     employee.employeetypemaster?.dataValues?.emptypename || "",
  //         //   permanent_city:
  //         //     employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
  //         //     "", //employee.employeeaddress?.permanentcity?.cityName || "",
  //         //   permanent_pin_code:
  //         //     employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
  //         //     "",
  //         //   permanent_country:
  //         //     employee.employeeaddress?.dataValues?.permanentcountry
  //         //       ?.countryName || "",
  //         //   company_email_id: employee.email || "",
  //         //   personal_email_id: employee.personalEmail || "",
  //         //   base_office_location: `${
  //         //     employee.companylocationmaster?.dataValues?.citymaster?.dataValues
  //         //       ?.cityName || ""
  //         //   }-${
  //         //     employee.companylocationmaster?.dataValues?.statemaster
  //         //       ?.dataValues?.stateName || ""
  //         //   }`,
  //         //   location_type: "",
  //         //   office_location: `${
  //         //     employee.companylocationmaster?.dataValues?.citymaster?.dataValues
  //         //       ?.cityName || ""
  //         //   }-${
  //         //     employee.companylocationmaster?.dataValues?.statemaster
  //         //       ?.dataValues?.stateName || ""
  //         //   }`,
  //         //   education_details: mappedEducationDetails || [],
  //         //   pt_state: "", // Custom field
  //         //   past_work_experience: "", //
  //         //   past_work: transformedWorkExperience || [],
  //         //   employee_separation_comments: "",
  //         //   employee_separation_reason: "",
  //         //   passport_number: employee.passportNumber || "",
  //         //   emergency_contact_number:
  //         //     employee.employeeemergencycontact?.dataValues
  //         //       ?.emergencyContactNumber || "",
  //         //   emergency_contact_person:
  //         //     employee.employeeemergencycontact?.dataValues
  //         //       ?.emergencyContactName || "",
  //         //   emergency_contact_relation:
  //         //     employee.employeeemergencycontact?.dataValues
  //         //       ?.emergencyContactRelation || "",
  //         //   emergency_contact_country_code:
  //         //     employee.employeeemergencycontact?.dataValues
  //         //       ?.emergency_contact_country_code || "",
  //         //   emergency_address: employee.employeeaddress?.dataValues
  //         //     ? [
  //         //         employee.employeeaddress?.dataValues?.emergencyHouse,
  //         //         employee.employeeaddress?.dataValues?.emergencyStreet,
  //         //         employee.employeeaddress?.dataValues?.emergencyLandmark,
  //         //         employee.employeeaddress?.dataValues?.emergencycity
  //         //           ?.dataValues?.cityName,
  //         //         employee.employeeaddress?.dataValues?.emergencystate
  //         //           ?.dataValues?.stateName,
  //         //         employee.employeeaddress?.dataValues?.emergencycountry
  //         //           ?.dataValues?.countryName,
  //         //         employee.employeeaddress?.dataValues?.emergencypincode
  //         //           ?.dataValues?.pincode,
  //         //       ]
  //         //         .filter((item) => item && item !== null && item !== undefined)
  //         //         .join(", ")
  //         //     : "",
  //         //   //cost_center: `${employee.costcentermaster?.dataValues?.costCenterName || ""} (${employee.costcentermaster?.dataValues?.costCenterCode || ""})`,
  //         //   cost_center:
  //         //     employee.costcentermaster?.dataValues?.costCenterName ||
  //         //     employee.costcentermaster?.dataValues?.costCenterCode
  //         //       ? `${
  //         //           employee.costcentermaster?.dataValues?.costCenterName || ""
  //         //         } (${
  //         //           employee.costcentermaster?.dataValues?.costCenterCode || ""
  //         //         })`
  //         //       : "",
  //         //   salary_stopped: "",
  //         //   vpf_amount: "",
  //         //   vpf_start_date: "",
  //         //   "reason_for_leaving_3_(new_employer_name)": "",
  //         //   "reason_for_leaving_4_(new_ctc)": "",
  //         //   "reason_for_leaving_5_(new_role)": "",
  //         //   is_appointment_letter_uploaded_: "",
  //         //   name_of_certifications: "",
  //         //   certification_valid_upto: "",
  //         //   certification_completion_date: "",
  //         //   dependents: employee.employeefamilydetails || [],
  //         //   cost_center_id:
  //         //     employee.costcentermaster?.dataValues?.costCenterCode || "",
  //         //   esic_applicable: employee.dataValues?.employeejobdetail
  //         //     ?.esicApplicable
  //         //     ? "Yes"
  //         //     : "No",
  //         //   pf_applicable_from: "",
  //         //   epf_applicable: employee.employeejobdetail?.dataValues
  //         //     ?.epfApplicable
  //         //     ? "Yes"
  //         //     : "No",
  //         //   driving_license_no: employee.drivingLicence || "",
  //         //   latest_modified_any_attribute: "",
  //         //   group_company:
  //         //     employee.companymaster?.dataValues?.companyName || "",
  //         //   sub_employee_type: "Permanent B",
  //         //   sbu_code: employee.sbumaster?.dataValues?.code || "",
  //         //   branch_code:
  //         //     employee.companylocationmaster?.dataValues?.companyLocationCode ||
  //         //     "",
  //         //   customer_code:
  //         //     employee.employeejobdetail?.dataValues?.customerName || "",
  //         //   project_code: "",
  //         //   pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
  //         //     ? "Yes"
  //         //     : "No",
  //         //   functional_area_code:
  //         //     employee.functionalareamaster?.dataValues?.functionalAreaCode ||
  //         //     "",
  //         //   separation_transaction_date: "",
  //         //   "father's_name":
  //         //     employee.employeefamilydetails.find(
  //         //       (f) => f.dataValues.relation === "Father"
  //         //     )?.dataValues.name || "",
  //         //   ot_branch_code: "",
  //         //   passport_valid_upto: "",
  //         //   policy_name: "",
  //         //   kind_of_disability: "",
  //         //   insurance_no: "",
  //         //   block_salary_processing: "",
  //         //   re: employee.employeejobdetail?.dataValues?.residentEng
  //         //     ? "Yes"
  //         //     : "No",
  //         //   functional_area:
  //         //     employee.functionalareamaster?.dataValues?.functionalAreaName ||
  //         //     "",
  //         //   business_unit_code: employee.bumaster?.dataValues?.buCode || "",
  //         // };
  //         return {
  //           first_name: employee.firstName || "",
  //           middle_name: employee.middleName || "",
  //           last_name: employee.lastName || "",
  //           designation:
  //             employee.designationmaster?.dataValues?.designation_with_code ||
  //             "",
  //           current_address: employee.employeeaddress?.dataValues
  //             ? [
  //                 employee.employeeaddress?.dataValues?.currentHouse,
  //                 employee.employeeaddress?.dataValues?.currentStreet,
  //                 employee.employeeaddress?.dataValues?.currentLandmark,
  //                 employee.employeeaddress?.dataValues?.currentcity?.cityName,
  //                 employee.employeeaddress?.dataValues?.currentstate?.stateName,
  //                 employee.employeeaddress?.dataValues?.currentcountry
  //                   ?.countryName,
  //                 employee.employeeaddress?.dataValues?.currentpincode?.pincode,
  //               ]
  //                 .filter((item) => item)
  //                 .join(", ")
  //             : "",
  //           current_city:
  //             employee.employeeaddress?.dataValues?.currentcity?.cityName || "",
  //           current_pin_code:
  //             employee.employeeaddress?.dataValues?.currentpincode?.pincode ||
  //             "",
  //           current_country:
  //             employee.employeeaddress?.dataValues?.currentcountry
  //               ?.countryName || "",
  //           office_mobile_no: employee.officeMobileNumber || "",
  //           personal_mobile_no: employee.personalMobileNumber || "",
  //           date_of_birth:
  //             formatDate(
  //               employee.employeebiographicaldetail?.dataValues?.dateOfBirth
  //             ) || "",
  //           gender: employee.employeebiographicaldetail?.gender || "",
  //           date_of_activation:
  //             formatDate(
  //               employee.employeejobdetail?.dataValues?.dateOfJoining
  //             ) || "",
  //           grade:
  //             employee.employeejobdetail?.dataValues?.grademaster?.dataValues
  //               ?.gradeName || "",
  //           department_code:
  //             employee.departmentmaster?.dataValues?.department_code || "",
  //           direct_manager_employee_id:
  //             employee.managerData?.dataValues?.empCode || "",
  //           marital_status: maritalStatus || "",
  //           anniversary_date:
  //             formatDate(
  //               employee.employeebiographicaldetail?.dataValues
  //                 ?.maritalStatusSince
  //             ) || "",
  //           business_unit: employee.bumaster?.dataValues?.buName || "",
  //           bank_pan: employee.dataValues?.panNo || "",
  //           pf_number: employee.dataValues?.pfNo || "",
  //           esic_number:
  //             employee.employeejobdetail?.dataValues?.esicNumber || "",
  //           blood_group:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyBloodGroup || "",
  //           bank_name:
  //             employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
  //               ?.bankName || "",
  //           bank_account:
  //             employee.employeepaymentdetail?.dataValues
  //               ?.paymentAccountNumber || "",
  //           date_of_resignation: employee.dateOfResignation || "",
  //           date_of_exit: employee.dateOfexit || "",
  //           date_of_confirmation: employee.dateOfConfirmation || "",
  //           bank_ifsc:
  //             employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
  //               ?.bankIfsc || "",
  //           designation_code:
  //             employee.designationmaster?.dataValues?.designation_code || "",
  //           full_name: employee.name || "",
  //           permanent_address: employee.employeeaddress?.dataValues
  //             ? [
  //                 employee.employeeaddress?.dataValues?.permanentHouse,
  //                 employee.employeeaddress?.dataValues?.permanentStreet,
  //                 employee.employeeaddress?.dataValues?.permanentLandmark,
  //                 employee.employeeaddress?.dataValues?.permanentcity?.cityName,
  //                 employee.employeeaddress?.dataValues?.permanentstate
  //                   ?.stateName,
  //                 employee.employeeaddress?.dataValues?.permanentcountry
  //                   ?.countryName,
  //                 employee.employeeaddress?.dataValues?.permanentpincode
  //                   ?.pincode,
  //               ]
  //                 .filter((item) => item)
  //                 .join(", ")
  //             : "",
  //           date_of_joining:
  //             formatDate(
  //               employee.employeejobdetail?.dataValues?.dateOfJoining
  //             ) || "",
  //           uan_number: employee.dataValues?.uanNo || "",
  //           aadhaar_number: employee.adhrNo || "",
  //           employee_type:
  //             employee.employeetypemaster?.dataValues?.emptypename || "",
  //           permanent_city:
  //             employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
  //             "",
  //           permanent_pin_code:
  //             employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
  //             "",
  //           permanent_country:
  //             employee.employeeaddress?.dataValues?.permanentcountry
  //               ?.countryName || "",
  //           company_email_id: employee.email || "",
  //           personal_email_id: employee.personalEmail || "",
  //           esic_applicable: employee.employeejobdetail?.dataValues
  //             ?.esicApplicable
  //             ? "Yes"
  //             : "No",
  //           pf_applicable_from: employee.pfApplicableFrom || "",
  //           epf_applicable: employee.employeejobdetail?.dataValues
  //             ?.epfApplicable
  //             ? "Yes"
  //             : "No",
  //           driving_license_no: employee.drivingLicence || "",
  //           latest_modified_any_attribute: employee.latestModified || "",
  //           group_company:
  //             employee.companymaster?.dataValues?.companyName || "",
  //           sub_employee_type: employee.employeeType?.subType || "",
  //           employee_id: employee.empCode || "",
  //           base_office_location: `${
  //             employee.companylocationmaster?.dataValues?.citymaster?.dataValues
  //               ?.cityName || ""
  //           }-${
  //             employee.companylocationmaster?.dataValues?.statemaster
  //               ?.dataValues?.stateName || ""
  //           }`,
  //           location_type: employee.locationType || "",
  //           office_location: `${
  //             employee.companylocationmaster?.dataValues?.citymaster?.dataValues
  //               ?.cityName || ""
  //           }-${
  //             employee.companylocationmaster?.dataValues?.statemaster
  //               ?.dataValues?.stateName || ""
  //           }`,
  //           education_details: mappedEducationDetails || [],
  //           pt_state: employee.ptState || "",
  //           past_work: transformedWorkExperience || [],
  //           employee_separation_comments: "",
  //           employee_separation_reason: "",
  //           passport_number: employee.passportNumber || "",
  //           emergency_contact_number:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyContactNumber || "",
  //           emergency_contact_person:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyContactName || "",
  //           emergency_contact_relation:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergencyContactRelation || "",
  //           emergency_contact_country_code:
  //             employee.employeeemergencycontact?.dataValues
  //               ?.emergency_contact_country_code || "",
  //           emergency_address: employee.employeeaddress?.dataValues
  //             ? [
  //                 employee.employeeaddress?.dataValues?.emergencyHouse,
  //                 employee.employeeaddress?.dataValues?.emergencyStreet,
  //                 employee.employeeaddress?.dataValues?.emergencyLandmark,
  //                 employee.employeeaddress?.dataValues?.emergencycity
  //                   ?.dataValues?.cityName,
  //                 employee.employeeaddress?.dataValues?.emergencystate
  //                   ?.dataValues?.stateName,
  //                 employee.employeeaddress?.dataValues?.emergencycountry
  //                   ?.dataValues?.countryName,
  //                 employee.employeeaddress?.dataValues?.emergencypincode
  //                   ?.dataValues?.pincode,
  //               ]
  //                 .filter((item) => item)
  //                 .join(", ")
  //             : "",
  //           cost_center: employee.costcentermaster?.dataValues?.costCenterName
  //             ? `${employee.costcentermaster?.dataValues?.costCenterName} (${employee.costcentermaster?.dataValues?.costCenterCode})`
  //             : "",
  //           salary_stopped: employee.salaryStopped || "",
  //           vpf_amount: employee.vpfAmount || "",
  //           vpf_start_date: employee.vpfStartDate || "",
  //           is_appointment_letter_uploaded:
  //             employee.isAppointmentLetterUploaded || "",
  //           dependents: employee.employeefamilydetails || [],
  //           cost_center_id:
  //             employee.costcentermaster?.dataValues?.costCenterCode || "",
  //           functional_area_code:
  //             employee.functionalareamaster?.dataValues?.functionalAreaCode ||
  //             "",
  //           re: employee.employeejobdetail?.dataValues?.residentEng
  //             ? "Yes"
  //             : "No",
  //           functional_area:
  //             employee.functionalareamaster?.dataValues?.functionalAreaName ||
  //             "",
  //           business_unit_code: employee.bumaster?.dataValues?.buCode || "",
  //         };
  //       });

  //       res.status(200).json({
  //         status: 1,
  //         message: "Successfully loaded all employees data",
  //         employee_data: manipulatedData,
  //       });
  //     } else {
  //       return res
  //         .status(401)
  //         .json({ error: "You are not authorized to access" });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return respHelper(res, {
  //       status: 500,
  //     });
  //   }
  // }

  async employeeData(req, res) {
    try {
      // const { dataset, isActive } = req.body;
      // const taraEmailId = process.env.TARA_EMAIL_ID;
      // const taraSecretKey = process.env.TARA_SECRET_KEY;

      // // Round Unix timestamp to the nearest minute
      // const unixTime = Math.floor(Date.now() / 1000);
      // const roundedTime = Math.floor(unixTime / 60) * 60;

      // console.log("unixTime>>", unixTime);
      // console.log("roundedTime>>", roundedTime);

      // // Function to generate hash
      // async function generateHash(email, secretKey, time, status) {
      //   const concatenatedString = `${email}${secretKey}${time}${status}`;
      //   return await helper.generateSHA512Hash(concatenatedString);
      // }

      // // Validate input
      // if (!dataset || (isActive !== 0 && isActive !== 1)) {
      //   return res.status(400).json({ error: "Invalid input" });
      // }

      // // Validation: Check hash for current and last 4 minutes
      // const timestampsToCheck = [];
      // for (let i = 0; i < 5; i++) {
      //   timestampsToCheck.push(roundedTime - i * 60); // Current minute and last 4 minutes
      // }

      // let isValid = false;

      // for (const time of timestampsToCheck) {
      //   const validHash = await generateHash(
      //     taraEmailId,
      //     taraSecretKey,
      //     time,
      //     isActive
      //   );
      //   console.log("validHash",validHash)
      //   console.log("dataset",dataset)

      //   if (
      //     crypto.timingSafeEqual(
      //       Buffer.from(validHash, "hex"),
      //       Buffer.from(dataset, "hex")
      //     )
      //   ) {
      //     isValid = true;
      //     break;
      //   }
      // }
      const { dataset, isActive } = req.body;
      const taraEmailId = process.env.TARA_EMAIL_ID;
      const taraSecretKey = process.env.TARA_SECRET_KEY;

      // Round Unix timestamp to the nearest minute
      const unixTime = Math.floor(Date.now() / 1000);
      const roundedTime = Math.floor(unixTime / 60) * 60;

      console.log("unixTime>>", unixTime);
      console.log("roundedTime>>", roundedTime);

      // Function to generate a single hash
      async function generateHash(email, secretKey, time, status) {
        const concatenatedString = `${email}${secretKey}${time}${status}`;
        return await helper.generateSHA512Hash(concatenatedString);
      }

      // Generate the hash using the current rounded time
      const generatedHash = await generateHash(
        taraEmailId,
        taraSecretKey,
        roundedTime,
        isActive
      );
      console.log("Generated Hash (valid for 5 minutes):", generatedHash);

      // Validate input
      if (!dataset || (isActive !== 0 && isActive !== 1)) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Validation: Check if the received hash matches for current or last 4 minutes
      let isValid = false;

      for (let i = 0; i < 5; i++) {
        const timeToCheck = roundedTime - i * 60; // Current and last 4 minutes
        const validHash = await generateHash(
          taraEmailId,
          taraSecretKey,
          timeToCheck,
          isActive
        );
        if (
          Buffer.from(validHash, "hex").length ==
          Buffer.from(dataset, "hex").length
        ) {
          if (
            crypto.timingSafeEqual(
              Buffer.from(validHash, "hex"),
              Buffer.from(dataset, "hex")
            )
          ) {
            isValid = true;
            break;
          }
        } else {
          console.log("Session time expired");
          return res.status(400).json({ error: "Session time expired" });
        }

        // if (
        //   crypto.timingSafeEqual(
        //     Buffer.from(validHash, "hex"),
        //     Buffer.from(dataset, "hex")
        //   )
        // ) {
        //   isValid = true;
        //   break;
        // }
      }

      if (isValid && isActive == 1) {
        const employeeData = await db.employeeMaster.findAll({
          where: { isActive: isActive },
          attributes: [
            "id",
            "empCode",
            "email",
            "personalEmail",
            "name",
            "firstName",
            "middleName",
            "lastName",
            "officeMobileNumber",
            "personalMobileNumber",
            "isActive",
            "dateOfexit",
            "uanNo",
            "pfNo",
            "esicNo",
            "panNo",
            "adhrNo",
            "passportNumber",
            "drivingLicence",
          ],
          include: [
            {
              model: db.biographicalDetails,
              attributes: [
                "dateOfBirth",
                "maritalStatus",
                "maritalStatusSince",
                "gender",
              ],
              required: false,
            },
            {
              model: db.designationMaster,
              attributes: [
                ["name", "designation_name"],
                ["code", "designation_code"], // Retrieve the code as well
                [
                  db.sequelize.literal(
                    "CONCAT(`designationmaster`.`name`, ' (', `designationmaster`.`code`, ')')"
                  ),
                  "designation_with_code", // designation with code combined
                ],
              ],
              required: false,
            },
            {
              model: db.departmentMaster,
              attributes: [["departmentCode", "department_code"]],
              required: false,
            },
            {
              model: db.buMaster,
              attributes: [["buName", "business_unit"]],
              required: false,
            },
            {
              model: db.employeeTypeMaster,
              attributes: ["emptypename"],
              required: false,
            },
            {
              model: db.employeeMaster,
              required: false,
              as: "managerData",
              attributes: ["empCode"],
            },
            {
              model: db.jobDetails,
              attributes: [
                "dateOfJoining",
                "residentEng",
                "customerName",
                "esicNumber",
                "pfRestricted",
                "epfApplicable",
                "esicApplicable",
              ],
              include: [
                { model: db.gradeMaster, attributes: ["gradeName"] },
                { model: db.bandMaster, attributes: ["bandDesc"] },
                {
                  model: db.jobLevelMaster,
                  attributes: ["jobLevelName", "jobLevelCode"],
                },
              ],
            },
            {
              model: db.companyLocationMaster,
              attributes: [["address1", "current_address"]],
              required: false,
            },
            {
              model: db.paymentDetails,
              attributes: ["paymentAccountNumber"],
              required: false,
              where: {
                status: "approved",
              },

              include: [
                {
                  model: db.bankMaster,
                  attributes: ["bankId", "bankName", "bankIfsc"],
                },
              ],
            },
            {
              model: db.employeeAddress,
              include: [
                {
                  model: db.countryMaster,
                  attributes: ["countryId", "countryName"],
                  as: "currentcountry",
                },
                {
                  model: db.countryMaster,
                  attributes: ["countryId", "countryName"],
                  as: "permanentcountry",
                },
                {
                  model: db.countryMaster,
                  attributes: ["countryId", "countryName"],
                  as: "emergencycountry",
                },
                {
                  model: db.stateMaster,
                  attributes: ["stateId", "stateName"],
                  as: "currentstate",
                },
                {
                  model: db.stateMaster,
                  attributes: ["stateId", "stateName"],
                  as: "permanentstate",
                },
                {
                  model: db.stateMaster,
                  attributes: ["stateId", "stateName"],
                  as: "emergencystate",
                },
                {
                  model: db.cityMaster,
                  attributes: ["cityId", "cityName"],
                  as: "currentcity",
                },
                {
                  model: db.cityMaster,
                  attributes: ["cityId", "cityName"],
                  as: "permanentcity",
                },
                {
                  model: db.cityMaster,
                  attributes: ["cityId", "cityName"],
                  as: "emergencycity",
                },
                {
                  model: db.pinCodeMaster,
                  attributes: ["pincodeId", "pincode"],
                  as: "currentpincode",
                },
                {
                  model: db.pinCodeMaster,
                  attributes: ["pincodeId", "pincode"],
                  as: "permanentpincode",
                },
                {
                  model: db.pinCodeMaster,
                  attributes: ["pincodeId", "pincode"],
                  as: "emergencypincode",
                },
              ],
            },
            {
              model: db.companyLocationMaster,
              attributes: ["address1", "companyLocationCode"],
              include: [
                { model: db.countryMaster, attributes: ["countryName"] },
                { model: db.stateMaster, attributes: ["stateName"] },
                { model: db.cityMaster, attributes: ["cityName"] },
                { model: db.pinCodeMaster, attributes: ["pinCode"] },
              ],
            },
            {
              model: db.emergencyDetails,
              required: false,
            },
            {
              model: db.costCenterMaster,
              attributes: ["costCenterName", "costCenterCode"],
              required: false,
            },
            {
              model: db.functionalAreaMaster,
              attributes: ["functionalAreaName", "functionalAreaCode"],
            },
            {
              model: db.companyMaster,
              attributes: ["companyName", "companyCode"],
            },
            {
              model: db.buMaster,
              attributes: ["buName", "buCode"],
            },
            {
              model: db.sbuMaster,
              attributes: ["sbuname", "code"],
            },
            {
              model: db.educationDetails,
              include: [
                {
                  model: db.degreeMaster,
                },
              ],
            },
            {
              model: db.familyDetails,
              required: false,
              where: {
                isActive: 1,
              },
              attributes: [
                "name",
                ["relationWithEmp", "relation"],
                [
                  db.sequelize.literal(
                    `IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')` // Format DOB or return an empty string if NULL
                  ),
                  "dob",
                ],
              ],
            },
            {
              model: db.employeeWorkExperience,
            },
          ],
          //raw: true,
        });

        const manipulatedData = employeeData.map((employee) => {
          const transformedWorkExperience =
            employee.employeeworkexperiences.map((experience) => ({
              company: experience.companyName || "",
              title: experience.jobTitle || "",
              location: experience.jobLocation || "",
              from_date: experience.fromDate || "",
              to_date: experience.toDate || "",
            }));

          const formatDate = (date) =>
            date ? moment(date).format("DD-MMM-YYYY") : ""; // Format date to DD-MMM-YYYY

          const mappedEducationDetails = employee.employeeeducationdetails.map(
            (edu) => ({
              institution_name: edu.educationInstitute || "",
              level_of_study: edu.degreemaster?.degreeType || "",
              field_of_study: edu.educationSpecialisation || "",
              education_category: "",
              gpa_percentage: "",
              course_type: "",
              university: "",
              completed_by_from: edu.educationStartDate
                ? moment(edu.educationStartDate).isValid()
                  ? moment(edu.educationStartDate).format("DD-MM-YYYY")
                  : ""
                : "",
              completed_by_to: edu.educationCompletionDate
                ? moment(edu.educationCompletionDate).isValid()
                  ? moment(edu.educationCompletionDate).format("DD-MM-YYYY")
                  : ""
                : "",
              high_edu_qualification: edu.isHighestEducation == 0 ? "" : "Yes",
              //degreeName: edu.degreemaster?.degreeName || "", // Fallback to an empty string if degreeName is null/undefined
            })
          );

          const maritalStatusOptions = {
            Married: 1,
            Single: 2,
            Divorced: 3,
            Separated: 4,
            Widowed: 5,
            Others: 6,
          };

          const maritalStatus = employee.employeebiographicaldetail?.dataValues
            ?.maritalStatus
            ? Object.keys(maritalStatusOptions).find(
                (key) =>
                  maritalStatusOptions[key] ===
                  employee.employeebiographicaldetail.dataValues.maritalStatus
              ) || ""
            : "";
          return {
            employee_id: employee.empCode || "",
            first_name: employee.firstName || "",
            middle_name: employee.middleName || "",
            last_name: employee.lastName || "",
            designation:
              employee.designationmaster?.dataValues?.designation_with_code ||
              "",
            current_address: employee.employeeaddress?.dataValues
              ? [
                  employee.employeeaddress?.dataValues?.currentHouse,
                  employee.employeeaddress?.dataValues?.currentStreet,
                  employee.employeeaddress?.dataValues?.currentLandmark,
                  employee.employeeaddress?.dataValues?.currentcity?.cityName,
                  employee.employeeaddress?.dataValues?.currentstate?.stateName,
                  employee.employeeaddress?.dataValues?.currentcountry
                    ?.countryName,
                  employee.employeeaddress?.dataValues?.currentpincode?.pincode,
                ]
                  .filter((item) => item && item !== null && item !== undefined)
                  .join(", ")
              : "",
            current_city:
              employee.employeeaddress?.dataValues?.currentcity?.cityName,
            current_pin_code:
              employee.employeeaddress?.dataValues?.currentpincode?.dataValues
                ?.pincode || "", // You may need to extract pincode
            current_country:
              employee.employeeaddress?.dataValues?.currentcountry?.dataValues
                ?.countryName,
            office_mobile_no: employee.officeMobileNumber || "",
            personal_mobile_no: employee.personalMobileNumber || "",
            date_of_birth:
              formatDate(
                employee.employeebiographicaldetail?.dataValues?.dateOfBirth
              ) || "",
            gender: employee.employeebiographicaldetail?.gender || "",
            date_of_activation:
              formatDate(
                employee.employeejobdetail?.dataValues?.dateOfJoining
              ) || "",
            grade:
              employee.employeejobdetail?.dataValues?.grademaster?.dataValues
                ?.gradeName || "",
            department_code:
              employee.departmentmaster?.dataValues?.department_code || "",
            direct_manager_employee_id:
              employee.managerData?.dataValues?.empCode || "",
            marital_status: maritalStatus || "",
            anniversary_date:
              formatDate(
                employee.employeebiographicaldetail?.dataValues
                  ?.maritalStatusSince
              ) || "",
            business_unit: employee.bumaster?.dataValues?.buName || "",
            bank_pan: employee.dataValues?.panNo || "",
            pf_number: employee.dataValues?.pfNo || "",
            esic_number:
              employee.employeejobdetail?.dataValues?.esicNumber || "", //employee.dataValues?.esicNo || "",
            blood_group:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyBloodGroup || "",
            bank_name:
              employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
                ?.bankName || "",
            bank_account:
              employee.employeepaymentdetail?.dataValues
                ?.paymentAccountNumber || "",
            date_of_resignation: "",
            date_of_exit: formatDate(employee.dateOfexit) || "", //employee.dateOfexit || "",
            date_of_confirmation: "", // Custom field, left empty for now
            bank_ifsc:
              employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
                ?.bankIfsc || "",
            designation_code:
              employee.designationmaster?.dataValues?.designation_code || "",
            full_name: employee.name || "",
            permanent_address: employee.employeeaddress?.dataValues
              ? [
                  employee.employeeaddress?.dataValues?.permanentHouse,
                  employee.employeeaddress?.dataValues?.permanentStreet,
                  employee.employeeaddress?.dataValues?.permanentLandmark,
                  employee.employeeaddress?.dataValues?.permanentcity?.cityName,
                  employee.employeeaddress?.dataValues?.permanentstate
                    ?.stateName,
                  employee.employeeaddress?.dataValues?.permanentcountry
                    ?.countryName,
                  employee.employeeaddress?.dataValues?.permanentpincode
                    ?.pincode,
                ]
                  .filter((item) => item && item !== null && item !== undefined)
                  .join(", ")
              : "",
            date_of_joining:
              formatDate(
                employee.employeejobdetail?.dataValues?.dateOfJoining
              ) || "",
            uan_number: employee.dataValues?.uanNo || "",
            aadhaar_number: employee.adhrNo || "",
            employee_type:
              employee.employeetypemaster?.dataValues?.emptypename || "",
            permanent_city:
              employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
              "", //employee.employeeaddress?.permanentcity?.cityName || "",
            permanent_pin_code:
              employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
              "",
            permanent_country:
              employee.employeeaddress?.dataValues?.permanentcountry
                ?.countryName || "",
            company_email_id: employee.email || "",
            personal_email_id: employee.personalEmail || "",
            base_office_location: `${
              employee.companylocationmaster?.dataValues?.citymaster?.dataValues
                ?.cityName || ""
            }-${
              employee.companylocationmaster?.dataValues?.statemaster
                ?.dataValues?.stateName || ""
            }`,
            location_type: "",
            office_location: `${
              employee.companylocationmaster?.dataValues?.citymaster?.dataValues
                ?.cityName || ""
            }-${
              employee.companylocationmaster?.dataValues?.statemaster
                ?.dataValues?.stateName || ""
            }`,
            education_details: mappedEducationDetails || [],
            pt_state: "", // Custom field
            past_work_experience: "", //
            past_work: transformedWorkExperience || [],
            employee_separation_comments: "",
            employee_separation_reason: "",
            passport_number: employee.passportNumber || "",
            emergency_contact_number:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyContactNumber || "",
            emergency_contact_person:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyContactName || "",
            emergency_contact_relation:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyContactRelation || "",
            emergency_contact_country_code:
              employee.employeeemergencycontact?.dataValues
                ?.emergency_contact_country_code || "",
            emergency_address: employee.employeeaddress?.dataValues
              ? [
                  employee.employeeaddress?.dataValues?.emergencyHouse,
                  employee.employeeaddress?.dataValues?.emergencyStreet,
                  employee.employeeaddress?.dataValues?.emergencyLandmark,
                  employee.employeeaddress?.dataValues?.emergencycity
                    ?.dataValues?.cityName,
                  employee.employeeaddress?.dataValues?.emergencystate
                    ?.dataValues?.stateName,
                  employee.employeeaddress?.dataValues?.emergencycountry
                    ?.dataValues?.countryName,
                  employee.employeeaddress?.dataValues?.emergencypincode
                    ?.dataValues?.pincode,
                ]
                  .filter((item) => item && item !== null && item !== undefined)
                  .join(", ")
              : "",
            //cost_center: `${employee.costcentermaster?.dataValues?.costCenterName || ""} (${employee.costcentermaster?.dataValues?.costCenterCode || ""})`,
            cost_center:
              employee.costcentermaster?.dataValues?.costCenterName ||
              employee.costcentermaster?.dataValues?.costCenterCode
                ? `${
                    employee.costcentermaster?.dataValues?.costCenterName || ""
                  } (${
                    employee.costcentermaster?.dataValues?.costCenterCode || ""
                  })`
                : "",
            salary_stopped: "",
            vpf_amount: "",
            vpf_start_date: "",
            "reason_for_leaving_3_(new_employer_name)": "",
            "reason_for_leaving_4_(new_ctc)": "",
            "reason_for_leaving_5_(new_role)": "",
            is_appointment_letter_uploaded_: "",
            name_of_certifications: "",
            certification_valid_upto: "",
            certification_completion_date: "",
            dependents: employee.employeefamilydetails || [],
            cost_center_id:
              employee.costcentermaster?.dataValues?.costCenterCode || "",
            esic_applicable: employee.dataValues?.employeejobdetail
              ?.esicApplicable
              ? "Yes"
              : "No",
            pf_applicable_from: "",
            epf_applicable: employee.employeejobdetail?.dataValues
              ?.epfApplicable
              ? "Yes"
              : "No",
            driving_license_no: employee.drivingLicence || "",
            latest_modified_any_attribute: "",
            group_company:
              employee.companymaster?.dataValues?.companyName || "",
            sub_employee_type: "Permanent B",
            sbu_code: employee.sbumaster?.dataValues?.code || "",
            branch_code:
              employee.companylocationmaster?.dataValues?.companyLocationCode ||
              "",
            customer_code:
              employee.employeejobdetail?.dataValues?.customerName || "",
            project_code: "",
            pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
              ? "Yes"
              : "No",
            functional_area_code:
              employee.functionalareamaster?.dataValues?.functionalAreaCode ||
              "",
            separation_transaction_date: "",
            "father's_name":
              employee.employeefamilydetails.find(
                (f) => f.dataValues.relation === "Father"
              )?.dataValues.name || "",
            ot_branch_code: "",
            passport_valid_upto: "",
            policy_name: "",
            kind_of_disability: "",
            insurance_no: "",
            block_salary_processing: "",
            re: employee.employeejobdetail?.dataValues?.residentEng
              ? "Yes"
              : "No",
            functional_area:
              employee.functionalareamaster?.dataValues?.functionalAreaName ||
              "",
            business_unit_code: employee.bumaster?.dataValues?.buCode || "",
          };
        });

        res.status(200).json({
          status: 1,
          message: "Successfully loaded all employees data",
          employee_data: manipulatedData,
        });
      } else if (isValid && isActive == 0) {
        const employeeData = await db.employeeMaster.findAll({
          where: { isActive: isActive },
          attributes: [
            "id",
            "empCode",
            "email",
            "personalEmail",
            "name",
            "firstName",
            "middleName",
            "lastName",
            "officeMobileNumber",
            "personalMobileNumber",
            "isActive",
            "dateOfexit",
            "uanNo",
            "pfNo",
            "esicNo",
            "panNo",
            "adhrNo",
            "passportNumber",
            "drivingLicence",
          ],
          include: [
            {
              model: db.biographicalDetails,
              attributes: [
                "dateOfBirth",
                "maritalStatus",
                "maritalStatusSince",
                "gender",
              ],
              required: false,
            },
            {
              model: db.designationMaster,
              attributes: [
                ["name", "designation_name"],
                ["code", "designation_code"], // Retrieve the code as well
                [
                  db.sequelize.literal(
                    "CONCAT(`designationmaster`.`name`, ' (', `designationmaster`.`code`, ')')"
                  ),
                  "designation_with_code", // designation with code combined
                ],
              ],
              required: false,
            },
            {
              model: db.departmentMaster,
              attributes: [["departmentCode", "department_code"]],
              required: false,
            },
            {
              model: db.buMaster,
              attributes: [["buName", "business_unit"]],
              required: false,
            },
            {
              model: db.employeeTypeMaster,
              attributes: ["emptypename"],
              required: false,
            },
            {
              model: db.employeeMaster,
              required: false,
              as: "managerData",
              attributes: ["empCode"],
            },
            {
              model: db.jobDetails,
              attributes: [
                "dateOfJoining",
                "residentEng",
                "customerName",
                "esicNumber",
                "pfRestricted",
                "epfApplicable",
                "esicApplicable",
              ],
              include: [
                { model: db.gradeMaster, attributes: ["gradeName"] },
                { model: db.bandMaster, attributes: ["bandDesc"] },
                {
                  model: db.jobLevelMaster,
                  attributes: ["jobLevelName", "jobLevelCode"],
                },
              ],
            },
            {
              model: db.companyLocationMaster,
              attributes: [["address1", "current_address"]],
              required: false,
            },
            {
              model: db.paymentDetails,
              attributes: ["paymentAccountNumber"],
              required: false,
              where: {
                status: "approved",
              },

              include: [
                {
                  model: db.bankMaster,
                  attributes: ["bankId", "bankName", "bankIfsc"],
                },
              ],
            },
            {
              model: db.employeeAddress,
              include: [
                {
                  model: db.countryMaster,
                  attributes: ["countryId", "countryName"],
                  as: "currentcountry",
                },
                {
                  model: db.countryMaster,
                  attributes: ["countryId", "countryName"],
                  as: "permanentcountry",
                },
                {
                  model: db.countryMaster,
                  attributes: ["countryId", "countryName"],
                  as: "emergencycountry",
                },
                {
                  model: db.stateMaster,
                  attributes: ["stateId", "stateName"],
                  as: "currentstate",
                },
                {
                  model: db.stateMaster,
                  attributes: ["stateId", "stateName"],
                  as: "permanentstate",
                },
                {
                  model: db.stateMaster,
                  attributes: ["stateId", "stateName"],
                  as: "emergencystate",
                },
                {
                  model: db.cityMaster,
                  attributes: ["cityId", "cityName"],
                  as: "currentcity",
                },
                {
                  model: db.cityMaster,
                  attributes: ["cityId", "cityName"],
                  as: "permanentcity",
                },
                {
                  model: db.cityMaster,
                  attributes: ["cityId", "cityName"],
                  as: "emergencycity",
                },
                {
                  model: db.pinCodeMaster,
                  attributes: ["pincodeId", "pincode"],
                  as: "currentpincode",
                },
                {
                  model: db.pinCodeMaster,
                  attributes: ["pincodeId", "pincode"],
                  as: "permanentpincode",
                },
                {
                  model: db.pinCodeMaster,
                  attributes: ["pincodeId", "pincode"],
                  as: "emergencypincode",
                },
              ],
            },
            {
              model: db.companyLocationMaster,
              attributes: ["address1", "companyLocationCode"],
              include: [
                { model: db.countryMaster, attributes: ["countryName"] },
                { model: db.stateMaster, attributes: ["stateName"] },
                { model: db.cityMaster, attributes: ["cityName"] },
                { model: db.pinCodeMaster, attributes: ["pinCode"] },
              ],
            },
            {
              model: db.emergencyDetails,
              required: false,
            },
            {
              model: db.costCenterMaster,
              attributes: ["costCenterName", "costCenterCode"],
              required: false,
            },
            {
              model: db.functionalAreaMaster,
              attributes: ["functionalAreaName", "functionalAreaCode"],
            },
            {
              model: db.companyMaster,
              attributes: ["companyName", "companyCode"],
            },
            {
              model: db.buMaster,
              attributes: ["buName", "buCode"],
            },
            {
              model: db.sbuMaster,
              attributes: ["sbuname", "code"],
            },
            {
              model: db.educationDetails,
              include: [
                {
                  model: db.degreeMaster,
                },
              ],
            },
            {
              model: db.familyDetails,
              required: false,
              where: {
                isActive: 1,
              },
              attributes: [
                "name",
                ["relationWithEmp", "relation"],
                [
                  db.sequelize.literal(
                    `IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')` // Format DOB or return an empty string if NULL
                  ),
                  "dob",
                ],
              ],
            },
            {
              model: db.employeeWorkExperience,
            },
          ],
          //raw: true,
        });

        const manipulatedData = employeeData.map((employee) => {
          const transformedWorkExperience =
            employee.employeeworkexperiences.map((experience) => ({
              company: experience.companyName || "",
              title: experience.jobTitle || "",
              location: experience.jobLocation || "",
              from_date: experience.fromDate || "",
              to_date: experience.toDate || "",
            }));

          const formatDate = (date) =>
            date ? moment(date).format("DD-MMM-YYYY") : ""; // Format date to DD-MMM-YYYY

          const mappedEducationDetails = employee.employeeeducationdetails.map(
            (edu) => ({
              institution_name: edu.educationInstitute || "",
              level_of_study: edu.degreemaster?.degreeType || "",
              field_of_study: edu.educationSpecialisation || "",
              education_category: "",
              gpa_percentage: "",
              course_type: "",
              university: "",
              completed_by_from: edu.educationStartDate
                ? moment(edu.educationStartDate).isValid()
                  ? moment(edu.educationStartDate).format("DD-MM-YYYY")
                  : ""
                : "",
              completed_by_to: edu.educationCompletionDate
                ? moment(edu.educationCompletionDate).isValid()
                  ? moment(edu.educationCompletionDate).format("DD-MM-YYYY")
                  : ""
                : "",
              high_edu_qualification: edu.isHighestEducation == 0 ? "" : "Yes",
              //degreeName: edu.degreemaster?.degreeName || "", // Fallback to an empty string if degreeName is null/undefined
            })
          );

          const maritalStatusOptions = {
            Married: 1,
            Single: 2,
            Divorced: 3,
            Separated: 4,
            Widowed: 5,
            Others: 6,
          };

          const maritalStatus = employee.employeebiographicaldetail?.dataValues
            ?.maritalStatus
            ? Object.keys(maritalStatusOptions).find(
                (key) =>
                  maritalStatusOptions[key] ===
                  employee.employeebiographicaldetail.dataValues.maritalStatus
              ) || ""
            : "";
          // return {
          //   employee_id: employee.empCode || "",
          //   first_name: employee.firstName || "",
          //   middle_name: employee.middleName || "",
          //   last_name: employee.lastName || "",
          //   designation:
          //     employee.designationmaster?.dataValues?.designation_with_code ||
          //     "",
          //   current_address: employee.employeeaddress?.dataValues
          //     ? [
          //         employee.employeeaddress?.dataValues?.currentHouse,
          //         employee.employeeaddress?.dataValues?.currentStreet,
          //         employee.employeeaddress?.dataValues?.currentLandmark,
          //         employee.employeeaddress?.dataValues?.currentcity?.cityName,
          //         employee.employeeaddress?.dataValues?.currentstate?.stateName,
          //         employee.employeeaddress?.dataValues?.currentcountry
          //           ?.countryName,
          //         employee.employeeaddress?.dataValues?.currentpincode?.pincode,
          //       ]
          //         .filter((item) => item && item !== null && item !== undefined)
          //         .join(", ")
          //     : "",
          //   current_city:
          //     employee.employeeaddress?.dataValues?.currentcity?.cityName,
          //   current_pin_code:
          //     employee.employeeaddress?.dataValues?.currentpincode?.dataValues
          //       ?.pincode || "", // You may need to extract pincode
          //   current_country:
          //     employee.employeeaddress?.dataValues?.currentcountry?.dataValues
          //       ?.countryName,
          //   office_mobile_no: employee.officeMobileNumber || "",
          //   personal_mobile_no: employee.personalMobileNumber || "",
          //   date_of_birth:
          //     formatDate(
          //       employee.employeebiographicaldetail?.dataValues?.dateOfBirth
          //     ) || "",
          //   gender: employee.employeebiographicaldetail?.gender || "",
          //   date_of_activation:
          //     formatDate(
          //       employee.employeejobdetail?.dataValues?.dateOfJoining
          //     ) || "",
          //   grade:
          //     employee.employeejobdetail?.dataValues?.grademaster?.dataValues
          //       ?.gradeName || "",
          //   department_code:
          //     employee.departmentmaster?.dataValues?.department_code || "",
          //   direct_manager_employee_id:
          //     employee.managerData?.dataValues?.empCode || "",
          //   marital_status: maritalStatus || "",
          //   anniversary_date:
          //     formatDate(
          //       employee.employeebiographicaldetail?.dataValues
          //         ?.maritalStatusSince
          //     ) || "",
          //   business_unit: employee.bumaster?.dataValues?.buName || "",
          //   bank_pan: employee.dataValues?.panNo || "",
          //   pf_number: employee.dataValues?.pfNo || "",
          //   esic_number:
          //     employee.employeejobdetail?.dataValues?.esicNumber || "", //employee.dataValues?.esicNo || "",
          //   blood_group:
          //     employee.employeeemergencycontact?.dataValues
          //       ?.emergencyBloodGroup || "",
          //   bank_name:
          //     employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
          //       ?.bankName || "",
          //   bank_account:
          //     employee.employeepaymentdetail?.dataValues
          //       ?.paymentAccountNumber || "",
          //   date_of_resignation: "",
          //   date_of_exit: employee.dateOfexit || "",
          //   date_of_confirmation: "", // Custom field, left empty for now
          //   bank_ifsc:
          //     employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
          //       ?.bankIfsc || "",
          //   designation_code:
          //     employee.designationmaster?.dataValues?.designation_code || "",
          //   full_name: employee.name || "",
          //   permanent_address: employee.employeeaddress?.dataValues
          //     ? [
          //         employee.employeeaddress?.dataValues?.permanentHouse,
          //         employee.employeeaddress?.dataValues?.permanentStreet,
          //         employee.employeeaddress?.dataValues?.permanentLandmark,
          //         employee.employeeaddress?.dataValues?.permanentcity?.cityName,
          //         employee.employeeaddress?.dataValues?.permanentstate
          //           ?.stateName,
          //         employee.employeeaddress?.dataValues?.permanentcountry
          //           ?.countryName,
          //         employee.employeeaddress?.dataValues?.permanentpincode
          //           ?.pincode,
          //       ]
          //         .filter((item) => item && item !== null && item !== undefined)
          //         .join(", ")
          //     : "",
          //   date_of_joining:
          //     formatDate(
          //       employee.employeejobdetail?.dataValues?.dateOfJoining
          //     ) || "",
          //   uan_number: employee.dataValues?.uanNo || "",
          //   aadhaar_number: employee.adhrNo || "",
          //   employee_type:
          //     employee.employeetypemaster?.dataValues?.emptypename || "",
          //   permanent_city:
          //     employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
          //     "", //employee.employeeaddress?.permanentcity?.cityName || "",
          //   permanent_pin_code:
          //     employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
          //     "",
          //   permanent_country:
          //     employee.employeeaddress?.dataValues?.permanentcountry
          //       ?.countryName || "",
          //   company_email_id: employee.email || "",
          //   personal_email_id: employee.personalEmail || "",
          //   base_office_location: `${
          //     employee.companylocationmaster?.dataValues?.citymaster?.dataValues
          //       ?.cityName || ""
          //   }-${
          //     employee.companylocationmaster?.dataValues?.statemaster
          //       ?.dataValues?.stateName || ""
          //   }`,
          //   location_type: "",
          //   office_location: `${
          //     employee.companylocationmaster?.dataValues?.citymaster?.dataValues
          //       ?.cityName || ""
          //   }-${
          //     employee.companylocationmaster?.dataValues?.statemaster
          //       ?.dataValues?.stateName || ""
          //   }`,
          //   education_details: mappedEducationDetails || [],
          //   pt_state: "", // Custom field
          //   past_work_experience: "", //
          //   past_work: transformedWorkExperience || [],
          //   employee_separation_comments: "",
          //   employee_separation_reason: "",
          //   passport_number: employee.passportNumber || "",
          //   emergency_contact_number:
          //     employee.employeeemergencycontact?.dataValues
          //       ?.emergencyContactNumber || "",
          //   emergency_contact_person:
          //     employee.employeeemergencycontact?.dataValues
          //       ?.emergencyContactName || "",
          //   emergency_contact_relation:
          //     employee.employeeemergencycontact?.dataValues
          //       ?.emergencyContactRelation || "",
          //   emergency_contact_country_code:
          //     employee.employeeemergencycontact?.dataValues
          //       ?.emergency_contact_country_code || "",
          //   emergency_address: employee.employeeaddress?.dataValues
          //     ? [
          //         employee.employeeaddress?.dataValues?.emergencyHouse,
          //         employee.employeeaddress?.dataValues?.emergencyStreet,
          //         employee.employeeaddress?.dataValues?.emergencyLandmark,
          //         employee.employeeaddress?.dataValues?.emergencycity
          //           ?.dataValues?.cityName,
          //         employee.employeeaddress?.dataValues?.emergencystate
          //           ?.dataValues?.stateName,
          //         employee.employeeaddress?.dataValues?.emergencycountry
          //           ?.dataValues?.countryName,
          //         employee.employeeaddress?.dataValues?.emergencypincode
          //           ?.dataValues?.pincode,
          //       ]
          //         .filter((item) => item && item !== null && item !== undefined)
          //         .join(", ")
          //     : "",
          //   //cost_center: `${employee.costcentermaster?.dataValues?.costCenterName || ""} (${employee.costcentermaster?.dataValues?.costCenterCode || ""})`,
          //   cost_center:
          //     employee.costcentermaster?.dataValues?.costCenterName ||
          //     employee.costcentermaster?.dataValues?.costCenterCode
          //       ? `${
          //           employee.costcentermaster?.dataValues?.costCenterName || ""
          //         } (${
          //           employee.costcentermaster?.dataValues?.costCenterCode || ""
          //         })`
          //       : "",
          //   salary_stopped: "",
          //   vpf_amount: "",
          //   vpf_start_date: "",
          //   "reason_for_leaving_3_(new_employer_name)": "",
          //   "reason_for_leaving_4_(new_ctc)": "",
          //   "reason_for_leaving_5_(new_role)": "",
          //   is_appointment_letter_uploaded_: "",
          //   name_of_certifications: "",
          //   certification_valid_upto: "",
          //   certification_completion_date: "",
          //   dependents: employee.employeefamilydetails || [],
          //   cost_center_id:
          //     employee.costcentermaster?.dataValues?.costCenterCode || "",
          //   esic_applicable: employee.dataValues?.employeejobdetail
          //     ?.esicApplicable
          //     ? "Yes"
          //     : "No",
          //   pf_applicable_from: "",
          //   epf_applicable: employee.employeejobdetail?.dataValues
          //     ?.epfApplicable
          //     ? "Yes"
          //     : "No",
          //   driving_license_no: employee.drivingLicence || "",
          //   latest_modified_any_attribute: "",
          //   group_company:
          //     employee.companymaster?.dataValues?.companyName || "",
          //   sub_employee_type: "Permanent B",
          //   sbu_code: employee.sbumaster?.dataValues?.code || "",
          //   branch_code:
          //     employee.companylocationmaster?.dataValues?.companyLocationCode ||
          //     "",
          //   customer_code:
          //     employee.employeejobdetail?.dataValues?.customerName || "",
          //   project_code: "",
          //   pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
          //     ? "Yes"
          //     : "No",
          //   functional_area_code:
          //     employee.functionalareamaster?.dataValues?.functionalAreaCode ||
          //     "",
          //   separation_transaction_date: "",
          //   "father's_name":
          //     employee.employeefamilydetails.find(
          //       (f) => f.dataValues.relation === "Father"
          //     )?.dataValues.name || "",
          //   ot_branch_code: "",
          //   passport_valid_upto: "",
          //   policy_name: "",
          //   kind_of_disability: "",
          //   insurance_no: "",
          //   block_salary_processing: "",
          //   re: employee.employeejobdetail?.dataValues?.residentEng
          //     ? "Yes"
          //     : "No",
          //   functional_area:
          //     employee.functionalareamaster?.dataValues?.functionalAreaName ||
          //     "",
          //   business_unit_code: employee.bumaster?.dataValues?.buCode || "",
          // };
          return {
            first_name: employee.firstName || "",
            middle_name: employee.middleName || "",
            last_name: employee.lastName || "",
            designation:
              employee.designationmaster?.dataValues?.designation_with_code ||
              "",
            current_address: employee.employeeaddress?.dataValues
              ? [
                  employee.employeeaddress?.dataValues?.currentHouse,
                  employee.employeeaddress?.dataValues?.currentStreet,
                  employee.employeeaddress?.dataValues?.currentLandmark,
                  employee.employeeaddress?.dataValues?.currentcity?.cityName,
                  employee.employeeaddress?.dataValues?.currentstate?.stateName,
                  employee.employeeaddress?.dataValues?.currentcountry
                    ?.countryName,
                  employee.employeeaddress?.dataValues?.currentpincode?.pincode,
                ]
                  .filter((item) => item)
                  .join(", ")
              : "",
            current_city:
              employee.employeeaddress?.dataValues?.currentcity?.cityName || "",
            current_pin_code:
              employee.employeeaddress?.dataValues?.currentpincode?.pincode ||
              "",
            current_country:
              employee.employeeaddress?.dataValues?.currentcountry
                ?.countryName || "",
            office_mobile_no: employee.officeMobileNumber || "",
            personal_mobile_no: employee.personalMobileNumber || "",
            date_of_birth:
              formatDate(
                employee.employeebiographicaldetail?.dataValues?.dateOfBirth
              ) || "",
            gender: employee.employeebiographicaldetail?.gender || "",
            date_of_activation:
              formatDate(
                employee.employeejobdetail?.dataValues?.dateOfJoining
              ) || "",
            grade:
              employee.employeejobdetail?.dataValues?.grademaster?.dataValues
                ?.gradeName || "",
            department_code:
              employee.departmentmaster?.dataValues?.department_code || "",
            direct_manager_employee_id:
              employee.managerData?.dataValues?.empCode || "",
            marital_status: maritalStatus || "",
            anniversary_date:
              formatDate(
                employee.employeebiographicaldetail?.dataValues
                  ?.maritalStatusSince
              ) || "",
            business_unit: employee.bumaster?.dataValues?.buName || "",
            bank_pan: employee.dataValues?.panNo || "",
            pf_number: employee.dataValues?.pfNo || "",
            esic_number:
              employee.employeejobdetail?.dataValues?.esicNumber || "",
            blood_group:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyBloodGroup || "",
            bank_name:
              employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
                ?.bankName || "",
            bank_account:
              employee.employeepaymentdetail?.dataValues
                ?.paymentAccountNumber || "",
            date_of_resignation: employee.dateOfResignation || "",
            date_of_exit: employee.dateOfexit || "",
            date_of_confirmation: employee.dateOfConfirmation || "",
            bank_ifsc:
              employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
                ?.bankIfsc || "",
            designation_code:
              employee.designationmaster?.dataValues?.designation_code || "",
            full_name: employee.name || "",
            permanent_address: employee.employeeaddress?.dataValues
              ? [
                  employee.employeeaddress?.dataValues?.permanentHouse,
                  employee.employeeaddress?.dataValues?.permanentStreet,
                  employee.employeeaddress?.dataValues?.permanentLandmark,
                  employee.employeeaddress?.dataValues?.permanentcity?.cityName,
                  employee.employeeaddress?.dataValues?.permanentstate
                    ?.stateName,
                  employee.employeeaddress?.dataValues?.permanentcountry
                    ?.countryName,
                  employee.employeeaddress?.dataValues?.permanentpincode
                    ?.pincode,
                ]
                  .filter((item) => item)
                  .join(", ")
              : "",
            date_of_joining:
              formatDate(
                employee.employeejobdetail?.dataValues?.dateOfJoining
              ) || "",
            uan_number: employee.dataValues?.uanNo || "",
            aadhaar_number: employee.adhrNo || "",
            employee_type:
              employee.employeetypemaster?.dataValues?.emptypename || "",
            permanent_city:
              employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
              "",
            permanent_pin_code:
              employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
              "",
            permanent_country:
              employee.employeeaddress?.dataValues?.permanentcountry
                ?.countryName || "",
            company_email_id: employee.email || "",
            personal_email_id: employee.personalEmail || "",
            esic_applicable: employee.employeejobdetail?.dataValues
              ?.esicApplicable
              ? "Yes"
              : "No",
            pf_applicable_from: employee.pfApplicableFrom || "",
            epf_applicable: employee.employeejobdetail?.dataValues
              ?.epfApplicable
              ? "Yes"
              : "No",
            driving_license_no: employee.drivingLicence || "",
            latest_modified_any_attribute: employee.latestModified || "",
            group_company:
              employee.companymaster?.dataValues?.companyName || "",
            sub_employee_type: employee.employeeType?.subType || "",
            employee_id: employee.empCode || "",
            base_office_location: `${
              employee.companylocationmaster?.dataValues?.citymaster?.dataValues
                ?.cityName || ""
            }-${
              employee.companylocationmaster?.dataValues?.statemaster
                ?.dataValues?.stateName || ""
            }`,
            location_type: employee.locationType || "",
            office_location: `${
              employee.companylocationmaster?.dataValues?.citymaster?.dataValues
                ?.cityName || ""
            }-${
              employee.companylocationmaster?.dataValues?.statemaster
                ?.dataValues?.stateName || ""
            }`,
            education_details: mappedEducationDetails || [],
            pt_state: employee.ptState || "",
            past_work: transformedWorkExperience || [],
            employee_separation_comments: "",
            employee_separation_reason: "",
            passport_number: employee.passportNumber || "",
            emergency_contact_number:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyContactNumber || "",
            emergency_contact_person:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyContactName || "",
            emergency_contact_relation:
              employee.employeeemergencycontact?.dataValues
                ?.emergencyContactRelation || "",
            emergency_contact_country_code:
              employee.employeeemergencycontact?.dataValues
                ?.emergency_contact_country_code || "",
            emergency_address: employee.employeeaddress?.dataValues
              ? [
                  employee.employeeaddress?.dataValues?.emergencyHouse,
                  employee.employeeaddress?.dataValues?.emergencyStreet,
                  employee.employeeaddress?.dataValues?.emergencyLandmark,
                  employee.employeeaddress?.dataValues?.emergencycity
                    ?.dataValues?.cityName,
                  employee.employeeaddress?.dataValues?.emergencystate
                    ?.dataValues?.stateName,
                  employee.employeeaddress?.dataValues?.emergencycountry
                    ?.dataValues?.countryName,
                  employee.employeeaddress?.dataValues?.emergencypincode
                    ?.dataValues?.pincode,
                ]
                  .filter((item) => item)
                  .join(", ")
              : "",
            cost_center: employee.costcentermaster?.dataValues?.costCenterName
              ? `${employee.costcentermaster?.dataValues?.costCenterName} (${employee.costcentermaster?.dataValues?.costCenterCode})`
              : "",
            salary_stopped: employee.salaryStopped || "",
            vpf_amount: employee.vpfAmount || "",
            vpf_start_date: employee.vpfStartDate || "",
            is_appointment_letter_uploaded:
              employee.isAppointmentLetterUploaded || "",
            dependents: employee.employeefamilydetails || [],
            cost_center_id:
              employee.costcentermaster?.dataValues?.costCenterCode || "",
            functional_area_code:
              employee.functionalareamaster?.dataValues?.functionalAreaCode ||
              "",
            re: employee.employeejobdetail?.dataValues?.residentEng
              ? "Yes"
              : "No",
            functional_area:
              employee.functionalareamaster?.dataValues?.functionalAreaName ||
              "",
            business_unit_code: employee.bumaster?.dataValues?.buCode || "",
          };
        });

        res.status(200).json({
          status: 1,
          message: "Successfully loaded all employees data",
          employee_data: manipulatedData,
        });
      } else {
        console.log("Session time expired");
        return res.status(400).json({ error: "Session time expired" });
        // return res
        //   .status(401)
        //   .json({ error: "You are not authorized to access" });
      }
    } catch (error) {
      console.error(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }
}

export default new ThirdPartyController();
