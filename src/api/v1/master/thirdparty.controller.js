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
	//     const { dataset, empCode, isActive } = req.body;

	//     const taraEmailId = process.env.TARA_EMAIL_ID;
	//     const taraSecretKey = process.env.TARA_SECRET_KEY;

	//     // Function to generate a hash
	//     async function generateHash(email, secretKey) {
	//       const concatenatedString = `${email}${secretKey}`;
	//       const hash = crypto
	//         .createHash("sha512")
	//         .update(concatenatedString)
	//         .digest("hex");
	//       console.log("Generated Hash:", hash); // Log the generated hash
	//       return hash;
	//     }

	//     // Generate the hash for the email and secret key
	//     const generatedHash = await generateHash(taraEmailId, taraSecretKey);

	//     // Example: Assuming you receive the provided hash from the request to validate
	//     const providedHash = dataset; // You would get this from the request body

	//     // Compare the generated hash with the provided hash
	//     if (
	//       crypto.timingSafeEqual(
	//         Buffer.from(providedHash, "hex"),
	//         Buffer.from(generatedHash, "hex")
	//       )
	//     ) {
	//       console.log("Hash matches! Validation successful.");
	//      // if (isActive == 1) {
	//         const employeeData = await db.employeeMaster.findAll({
	//           where: {
	//             //isActive: isActive,
	//             employeeType: [1, 2, 3],
	//             ...(empCode && {
	//               empCode: empCode,
	//             }),
	//           },
	//           attributes: [
	//             "id",
	//             "empCode",
	//             "email",
	//             "personalEmail",
	//             "name",
	//             "firstName",
	//             "middleName",
	//             "lastName",
	//             "officeMobileNumber",
	//             "personalMobileNumber",
	//             "isActive",
	//             "dateOfexit",
	//             "uanNo",
	//             "pfNo",
	//             "esicNo",
	//             "panNo",
	//             "adhrNo",
	//             "passportNumber",
	//             "drivingLicence",
	//           ],
	//           include: [
	//             {
	//               model: db.biographicalDetails,
	//               attributes: [
	//                 "dateOfBirth",
	//                 "maritalStatus",
	//                 "maritalStatusSince",
	//                 "gender",
	//               ],
	//               required: false,
	//             },
	//             {
	//               model: db.designationMaster,
	//               attributes: [
	//                 ["name", "designation_name"],
	//                 ["code", "designation_code"], // Retrieve the code as well
	//                 [
	//                   db.sequelize.literal(
	//                     "CONCAT(`designationmaster`.`name`, ' (', `designationmaster`.`code`, ')')"
	//                   ),
	//                   "designation_with_code", // designation with code combined
	//                 ],
	//               ],
	//               required: false,
	//             },
	//             {
	//               model: db.departmentMaster,
	//               attributes: [["departmentCode", "department_code"]],
	//               required: false,
	//             },
	//             {
	//               model: db.buMaster,
	//               attributes: [["buName", "business_unit"]],
	//               required: false,
	//             },
	//             {
	//               model: db.employeeTypeMaster,
	//               attributes: ["emptypename"],
	//               required: false,
	//             },
	//             {
	//               model: db.employeeMaster,
	//               required: false,
	//               as: "managerData",
	//               attributes: ["empCode"],
	//             },
	//             {
	//               model: db.jobDetails,
	//               attributes: [
	//                 "dateOfJoining",
	//                 "residentEng",
	//                 "customerName",
	//                 "projectCode",
	//                 "esicNumber",
	//                 "pfRestricted",
	//                 "epfApplicable",
	//                 "esicApplicable"
	//               ],
	//               include: [
	//                 { model: db.gradeMaster, attributes: ["gradeName"] },
	//                 { model: db.bandMaster, attributes: ["bandDesc"] },
	//                 {
	//                   model: db.jobLevelMaster,
	//                   attributes: ["jobLevelName", "jobLevelCode"],
	//                 },
	//               ],
	//             },
	//             // {
	//             //   model: db.companyLocationMaster,
	//             //   attributes: [["address1", "current_address"]],
	//             //   required: false,
	//             // },
	//             {
	//               model: db.paymentDetails,
	//               attributes: ["paymentAccountNumber"],
	//               required: false,
	//               where: {
	//                 status: "approved",
	//               },

	//               include: [
	//                 {
	//                   model: db.bankMaster,
	//                   attributes: ["bankId", "bankName", "bankIfsc"],
	//                 },
	//               ],
	//             },
	//             {
	//               model: db.employeeAddress,
	//               include: [
	//                 {
	//                   model: db.countryMaster,
	//                   attributes: ["countryId", "countryName"],
	//                   as: "currentcountry",
	//                 },
	//                 {
	//                   model: db.countryMaster,
	//                   attributes: ["countryId", "countryName"],
	//                   as: "permanentcountry",
	//                 },
	//                 {
	//                   model: db.countryMaster,
	//                   attributes: ["countryId", "countryName"],
	//                   as: "emergencycountry",
	//                 },
	//                 {
	//                   model: db.stateMaster,
	//                   attributes: ["stateId", "stateName"],
	//                   as: "currentstate",
	//                 },
	//                 {
	//                   model: db.stateMaster,
	//                   attributes: ["stateId", "stateName"],
	//                   as: "permanentstate",
	//                 },
	//                 {
	//                   model: db.stateMaster,
	//                   attributes: ["stateId", "stateName"],
	//                   as: "emergencystate",
	//                 },
	//                 {
	//                   model: db.cityMaster,
	//                   attributes: ["cityId", "cityName"],
	//                   as: "currentcity",
	//                 },
	//                 {
	//                   model: db.cityMaster,
	//                   attributes: ["cityId", "cityName"],
	//                   as: "permanentcity",
	//                 },
	//                 {
	//                   model: db.cityMaster,
	//                   attributes: ["cityId", "cityName"],
	//                   as: "emergencycity",
	//                 },
	//                 {
	//                   model: db.pinCodeMaster,
	//                   attributes: ["pincodeId", "pincode"],
	//                   as: "currentpincode",
	//                 },
	//                 {
	//                   model: db.pinCodeMaster,
	//                   attributes: ["pincodeId", "pincode"],
	//                   as: "permanentpincode",
	//                 },
	//                 {
	//                   model: db.pinCodeMaster,
	//                   attributes: ["pincodeId", "pincode"],
	//                   as: "emergencypincode",
	//                 },
	//               ],
	//             },
	//             {
	//               model: db.companyLocationMaster,
	//               attributes: [
	//                 "address1",
	//                 "companyLocationCode",
	//                 "isHeadquarter",
	//               ],
	//               include: [
	//                 { model: db.countryMaster, attributes: ["countryName"] },
	//                 { model: db.stateMaster, attributes: ["stateName"] },
	//                 { model: db.cityMaster, attributes: ["cityName"] },
	//                 { model: db.pinCodeMaster, attributes: ["pinCode"] },
	//               ],
	//             },
	//             {
	//               model: db.emergencyDetails,
	//               required: false,
	//             },
	//             {
	//               model: db.costCenterMaster,
	//               attributes: ["costCenterName", "costCenterCode"],
	//               required: false,
	//             },
	//             {
	//               model: db.functionalAreaMaster,
	//               attributes: ["functionalAreaName", "functionalAreaCode"],
	//             },
	//             {
	//               model: db.companyMaster,
	//               attributes: ["companyName", "companyCode"],
	//             },
	//             {
	//               model: db.buMaster,
	//               attributes: ["buName", "buCode"],
	//             },
	//             {
	//               model: db.sbuMaster,
	//               attributes: ["sbuname", "code"],
	//             },
	//             {
	//               model: db.educationDetails,
	//               include: [
	//                 {
	//                   model: db.degreeMaster,
	//                 },
	//               ],
	//             },
	//             {
	//               model: db.familyDetails,
	//               required: false,
	//               where: {
	//                 isActive: 1,
	//               },
	//               attributes: [
	//                 "name",
	//                 ["relationWithEmp", "relation"],
	//                 [
	//                   db.sequelize.literal(
	//                     `IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')` // Format DOB or return an empty string if NULL
	//                   ),
	//                   "dob",
	//                 ],
	//               ],
	//             },
	//             {
	//               model: db.employeeWorkExperience,
	//             },
	//             {
	//               model: db.separationMaster,
	//               include: [
	//                 {
	//                   model: db.separationReason,
	//                   as: "empReasonofResignation",
	//                   attributes: ["separationReason"],
	//                 },
	//               ],
	//             },
	//           ],
	//           //raw: true,
	//         });

	//         const manipulatedData = employeeData.map((employee) => {
	//           const transformedWorkExperience =
	//             employee.employeeworkexperiences.map((experience) => ({
	//               company: experience.companyName || "",
	//               title: experience.jobTitle || "",
	//               location: experience.jobLocation || "",
	//               from_date: experience.fromDate
	//                 ? moment(experience.fromDate).format("DD-MM-YYYY")
	//                 : "",
	//               to_date: experience.toDate
	//                 ? moment(experience.toDate).format("DD-MM-YYYY")
	//                 : "",
	//             }));

	//           // Sum the total work experience duration
	//           let totalYears = 0;
	//           let totalMonths = 0;
	//           let totalDays = 0;

	//           employee.employeeworkexperiences.forEach((experience) => {
	//             const fromDate = moment(experience.fromDate);
	//             const toDate = moment(experience.toDate);

	//             if (fromDate.isValid() && toDate.isValid()) {
	//               const duration = moment.duration(toDate.diff(fromDate)); // calculate the difference

	//               // Add up the years, months, and days
	//               totalYears += duration.years();
	//               totalMonths += duration.months();
	//               totalDays += duration.days();
	//             }
	//           });

	//           // Normalize the duration (if totalDays or totalMonths exceed 12 or 30)
	//           if (totalDays >= 30) {
	//             totalMonths += Math.floor(totalDays / 30);
	//             totalDays = totalDays % 30;
	//           }

	//           if (totalMonths >= 12) {
	//             totalYears += Math.floor(totalMonths / 12);
	//             totalMonths = totalMonths % 12;
	//           }

	//           // Format the result
	//           //const pastWorkExperience = `${totalYears} Y ${totalMonths} M ${totalDays} D`;
	//           const pastWorkExperience =
	//             totalYears === 0 && totalMonths === 0 && totalDays === 0
	//               ? ""
	//               : `${totalYears} Y ${totalMonths} M ${totalDays} D`;

	//           const formatDate = (date) =>
	//             date ? moment(date).format("DD-MMM-YYYY") : ""; // Format date to DD-MMM-YYYY

	//           const mappedEducationDetails =
	//             employee.employeeeducationdetails.map((edu) => ({
	//               institution_name: edu.educationInstitute || "",
	//               level_of_study: edu.degreemaster?.degreeType || "",
	//               field_of_study: edu.educationSpecialisation || "",
	//               education_category: "",
	//               gpa_percentage: "",
	//               course_type: "",
	//               university: "",
	//               completed_by_from: edu.educationStartDate
	//                 ? moment(edu.educationStartDate).isValid()
	//                   ? moment(edu.educationStartDate).format("DD-MM-YYYY")
	//                   : ""
	//                 : "",
	//               completed_by_to: edu.educationCompletionDate
	//                 ? moment(edu.educationCompletionDate).isValid()
	//                   ? moment(edu.educationCompletionDate).format("DD-MM-YYYY")
	//                   : ""
	//                 : "",
	//               high_edu_qualification:
	//                 edu.isHighestEducation == 0 ? "" : "Yes",
	//               //degreeName: edu.degreemaster?.degreeName || "", // Fallback to an empty string if degreeName is null/undefined
	//             }));

	//           const maritalStatusOptions = {
	//             Married: 1,
	//             Single: 2,
	//             Divorced: 3,
	//             Separated: 4,
	//             Widowed: 5,
	//             Others: 6,
	//           };

	//           const maritalStatus = employee.employeebiographicaldetail
	//             ?.dataValues?.maritalStatus
	//             ? Object.keys(maritalStatusOptions).find(
	//                 (key) =>
	//                   maritalStatusOptions[key] ===
	//                   employee.employeebiographicaldetail.dataValues.maritalStatus
	//               ) || ""
	//             : "";
	//           return {
	//             isActive: employee.isActive == 1 ? "Yes" : "No",
	//             employee_id: employee.empCode || "",
	//             first_name: employee.firstName || "",
	//             middle_name: employee.middleName || "",
	//             last_name: employee.lastName || "",
	//             designation:
	//               employee.designationmaster?.dataValues?.designation_with_code ||
	//               "",
	//             current_address: employee.employeeaddress?.dataValues
	//               ? [
	//                   employee.employeeaddress?.dataValues?.currentHouse || "",
	//                   employee.employeeaddress?.dataValues?.currentStreet || "",
	//                   employee.employeeaddress?.dataValues?.currentLandmark || "",
	//                   employee.employeeaddress?.dataValues?.currentcity
	//                     ?.cityName || "",
	//                   employee.employeeaddress?.dataValues?.currentstate
	//                     ?.stateName || "",
	//                   employee.employeeaddress?.dataValues?.currentcountry
	//                     ?.countryName || "",
	//                   employee.employeeaddress?.dataValues?.currentpincode
	//                     ?.pincode || "",
	//                 ]
	//                   .filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
	//                   .join(", ")
	//               : "",
	//             current_city:
	//               employee.employeeaddress?.dataValues?.currentcity?.cityName,
	//             current_pin_code:
	//               employee.employeeaddress?.dataValues?.currentpincode?.dataValues
	//                 ?.pincode || "", // You may need to extract pincode
	//             current_country:
	//               employee.employeeaddress?.dataValues?.currentcountry?.dataValues
	//                 ?.countryName,
	//             office_mobile_no: employee.officeMobileNumber || "",
	//             personal_mobile_no: employee.personalMobileNumber || "",
	//             date_of_birth:
	//               formatDate(
	//                 employee.employeebiographicaldetail?.dataValues?.dateOfBirth
	//               ) || "",
	//             gender: employee.employeebiographicaldetail?.gender || "",
	//             date_of_activation:
	//               formatDate(
	//                 employee.employeejobdetail?.dataValues?.dateOfJoining
	//               ) || "",
	//             grade:
	//               employee.employeejobdetail?.dataValues?.grademaster?.dataValues
	//                 ?.gradeName || "",
	//             department_code:
	//               employee.departmentmaster?.dataValues?.department_code || "",
	//             direct_manager_employee_id:
	//               employee.managerData?.dataValues?.empCode || "",
	//             marital_status: maritalStatus || "",
	//             anniversary_date:
	//               formatDate(
	//                 employee.employeebiographicaldetail?.dataValues
	//                   ?.maritalStatusSince
	//               ) || "",
	//             business_unit: employee.bumaster?.dataValues?.buName || "",
	//             bank_pan: employee.dataValues?.panNo || "",
	//             pf_number: employee.dataValues?.pfNo || "",
	//             esic_number:
	//               employee.employeejobdetail?.dataValues?.esicNumber || "", //employee.dataValues?.esicNo || "",
	//             blood_group:
	//               employee.employeeemergencycontact?.dataValues
	//                 ?.emergencyBloodGroup || "",
	//             bank_name:
	//               employee.employeepaymentdetail?.dataValues?.bankmaster
	//                 ?.dataValues?.bankName || "",
	//             bank_account:
	//               employee.employeepaymentdetail?.dataValues
	//                 ?.paymentAccountNumber || "",
	//             date_of_resignation: employee.separationmaster
	//               ? moment(
	//                   employee.separationmaster.dataValues.resignationDate
	//                 ).format("DD-MM-YYYY")
	//               : "",
	//             date_of_exit: formatDate(employee.dateOfexit) || "", //employee.dateOfexit || "",
	//             date_of_confirmation: "", // Custom field, left empty for now
	//             bank_ifsc:
	//               employee.employeepaymentdetail?.dataValues?.bankmaster
	//                 ?.dataValues?.bankIfsc || "",
	//             designation_code:
	//               employee.designationmaster?.dataValues?.designation_code || "",
	//             full_name: employee.name || "",
	//             permanent_address: employee.employeeaddress?.dataValues
	//               ? [
	//                   employee.employeeaddress?.dataValues?.permanentHouse || "",
	//                   employee.employeeaddress?.dataValues?.permanentStreet || "",
	//                   employee.employeeaddress?.dataValues?.permanentLandmark ||
	//                     "",
	//                   employee.employeeaddress?.dataValues?.permanentcity
	//                     ?.cityName || "",
	//                   employee.employeeaddress?.dataValues?.permanentstate
	//                     ?.stateName || "",
	//                   employee.employeeaddress?.dataValues?.permanentcountry
	//                     ?.countryName || "",
	//                   employee.employeeaddress?.dataValues?.permanentpincode
	//                     ?.pincode || "",
	//                 ]
	//                   .filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
	//                   .join(", ")
	//               : "",
	//             date_of_joining:
	//               formatDate(
	//                 employee.employeejobdetail?.dataValues?.dateOfJoining
	//               ) || "",
	//             uan_number: employee.dataValues?.uanNo || "",
	//             aadhaar_number: employee.adhrNo || "",
	//             employee_type:
	//               employee.employeetypemaster?.dataValues?.emptypename || "",
	//             permanent_city:
	//               employee.employeeaddress?.dataValues?.permanentcity?.cityName ||
	//               "", //employee.employeeaddress?.permanentcity?.cityName || "",
	//             permanent_pin_code:
	//               employee.employeeaddress?.dataValues?.permanentpincode
	//                 ?.pincode || "",
	//             permanent_country:
	//               employee.employeeaddress?.dataValues?.permanentcountry
	//                 ?.countryName || "",
	//             company_email_id: employee.email || "",
	//             personal_email_id: employee.personalEmail || "",

	//             base_office_location:
	//             employee.companylocationmaster?.dataValues?.citymaster?.dataValues?.cityName &&
	//             employee.companylocationmaster?.companyLocationCode
	//               ? `${employee.companylocationmaster?.dataValues?.citymaster?.dataValues?.cityName} ${
	//                   employee.companylocationmaster?.isHeadquarter === true
	//                     ? "(Head Office)"
	//                     : "(Branch)"
	//                 } (${
	//                   employee.companylocationmaster.companyLocationCode
	//                 })`
	//               : "",
	//               location_type:
	//               employee.companylocationmaster?.isHeadquarter === true
	//                 ? "Head Office"
	//                 : "Branch", //employee.locationType || "",
	//             office_location: `${
	//               employee.companylocationmaster?.dataValues?.citymaster
	//                 ?.dataValues?.cityName || ""
	//             }-${
	//               employee.companylocationmaster?.dataValues?.statemaster
	//                 ?.dataValues?.stateName || ""
	//             }`,
	//             education_details: mappedEducationDetails || [],
	//             pt_state: "",
	//             past_work_experience: pastWorkExperience, //
	//             past_work: transformedWorkExperience || [],
	//             employee_separation_comments:
	//               employee.separationmaster?.empRemark || "",
	//             employee_separation_reason:
	//               employee.separationmaster?.empReasonofResignation
	//                 ?.separationReason || "",
	//             passport_number: employee.passportNumber || "",
	//             emergency_contact_number:
	//               employee.employeeemergencycontact?.dataValues
	//                 ?.emergencyContactNumber || "",
	//             emergency_contact_person:
	//               employee.employeeemergencycontact?.dataValues
	//                 ?.emergencyContactName || "",
	//             emergency_contact_relation:
	//               employee.employeeemergencycontact?.dataValues
	//                 ?.emergencyContactRelation || "",
	//             emergency_contact_country_code:
	//               employee.employeeemergencycontact?.dataValues
	//                 ?.emergency_contact_country_code || "",
	//             emergency_address: employee.employeeaddress?.dataValues
	//               ? [
	//                   employee.employeeaddress?.dataValues?.emergencyHouse || "",
	//                   employee.employeeaddress?.dataValues?.emergencyStreet || "",
	//                   employee.employeeaddress?.dataValues?.emergencyLandmark ||
	//                     "",
	//                   employee.employeeaddress?.dataValues?.emergencycity
	//                     ?.dataValues?.cityName || "",
	//                   employee.employeeaddress?.dataValues?.emergencystate
	//                     ?.dataValues?.stateName || "",
	//                   employee.employeeaddress?.dataValues?.emergencycountry
	//                     ?.dataValues?.countryName || "",
	//                   employee.employeeaddress?.dataValues?.emergencypincode
	//                     ?.dataValues?.pincode || "",
	//                 ]
	//                   .filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
	//                   .join(", ")
	//               : "",

	//             cost_center:
	//               employee.costcentermaster?.dataValues?.costCenterName ||
	//               employee.costcentermaster?.dataValues?.costCenterCode
	//                 ? `${
	//                     employee.costcentermaster?.dataValues?.costCenterName ||
	//                     ""
	//                   } (${
	//                     employee.costcentermaster?.dataValues?.costCenterCode ||
	//                     ""
	//                   })`
	//                 : "",
	//             salary_stopped: "",
	//             vpf_amount: "",
	//             vpf_start_date: "",
	//             "reason_for_leaving_3_(new_employer_name)": "",
	//             "reason_for_leaving_4_(new_ctc)": "",
	//             "reason_for_leaving_5_(new_role)": "",
	//             is_appointment_letter_uploaded_: "",
	//             name_of_certifications: "",
	//             certification_valid_upto: "",
	//             certification_completion_date: "",
	//             dependents: employee.employeefamilydetails || [],
	//             cost_center_id:
	//               employee.costcentermaster?.dataValues?.costCenterCode || "",
	//             esic_applicable: employee.dataValues?.employeejobdetail
	//               ?.esicApplicable
	//               ? "Yes"
	//               : "No",
	//             pf_applicable_from: "",
	//             epf_applicable: employee.employeejobdetail?.dataValues
	//               ?.epfApplicable
	//               ? "Yes"
	//               : "No",
	//             driving_license_no: employee.drivingLicence || "",
	//             latest_modified_any_attribute: "",
	//             group_company:
	//               employee.companymaster?.dataValues?.companyName || "",
	//             sub_employee_type: "",
	//             sbu_code: employee.sbumaster?.dataValues?.code || "",
	//             branch_code:
	//               employee.companylocationmaster?.dataValues
	//                 ?.companyLocationCode || "",
	//             customer_code: employee.employeejobdetail?.dataValues
	//               ?.customerName
	//               ? (employee.employeejobdetail.dataValues.customerName.match(
	//                   /(C\d+)/
	//                 ) || [])[1] || ""
	//               : "",
	//             // employee.employeejobdetail?.dataValues?.customerName || "",
	//             project_code: employee.employeejobdetail?.dataValues?.projectCode || "",
	//             pf_restricted: employee.employeejobdetail?.dataValues
	//               ?.pfRestricted
	//               ? "Yes"
	//               : "No",
	//             functional_area_code:
	//               employee.functionalareamaster?.dataValues?.functionalAreaCode ||
	//               "",
	//             separation_transaction_date: "",
	//             "father's_name":
	//               employee.employeefamilydetails.find(
	//                 (f) => f.dataValues.relation === "Father"
	//               )?.dataValues.name || "",
	//             ot_branch_code: "",
	//             passport_valid_upto: "",
	//             policy_name: "",
	//             kind_of_disability: "",
	//             insurance_no: "",
	//             block_salary_processing: "",
	//             re: employee.employeejobdetail?.dataValues?.residentEng
	//               ? "Yes"
	//               : "No",
	//             functional_area:
	//               employee.functionalareamaster?.dataValues?.functionalAreaName ||
	//               "",
	//             business_unit_code: employee.bumaster?.dataValues?.buCode || "",
	//           };
	//         });

	//         res.status(200).json({
	//           status: 1,
	//           message: "Successfully loaded all employees data",
	//           employee_data: manipulatedData,
	//         });
	//     } else {
	//       console.log("Session time expired");
	//       return res.status(400).json({ error: "Session time expired" });
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
			const { dataset, empCode, isActive, companyId } = req.body;

			const taraEmailId = process.env.TARA_EMAIL_ID;
			const taraSecretKey = process.env.TARA_SECRET_KEY;

			const taraEmailIdAll = process.env.TARA_EMAIL_ID_ALL;
			const taraSecretKeyAll = process.env.TARA_SECRET_KEY_ALL;

			// Function to generate a hash
			async function generateHash(email, secretKey) {
				const concatenatedString = `${email}${secretKey}`;
				const hash = crypto
					.createHash("sha512")
					.update(concatenatedString)
					.digest("hex");
				console.log("Generated Hash:", hash); // Log the generated hash
				return hash;
			}

			// Generate the hash for the email and secret key
			const generatedHash = await generateHash(taraEmailId, taraSecretKey);
			const generateHashAll = await generateHash(
				taraEmailIdAll,
				taraSecretKeyAll,
			);
			// Example: Assuming you receive the provided hash from the request to validate
			const providedHash = dataset; // You would get this from the request body

			// Compare the generated hash with the provided hash
			if (
				crypto.timingSafeEqual(
					Buffer.from(providedHash, "hex"),
					Buffer.from(generatedHash, "hex"),
				)
			) {
				console.log("Hash matches! Validation successful for off roll.");
				const employeeData = await db.employeeMaster.findAll({
					where: {
						//isActive: isActive,
						employeeType: [1, 2, 3],
						...(empCode && {
							empCode: empCode,
						}),
					},
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
										"CONCAT(`designationmaster`.`name`, ' (', `designationmaster`.`code`, ')')",
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
								"projectCode",
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
						// {
						//   model: db.companyLocationMaster,
						//   attributes: [["address1", "current_address"]],
						//   required: false,
						// },
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
							attributes: ["address1", "companyLocationCode", "isHeadquarter"],
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
										`IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')`, // Format DOB or return an empty string if NULL
									),
									"dob",
								],
							],
						},
						{
							model: db.employeeWorkExperience,
						},
						{
							model: db.separationMaster,
							include: [
								{
									model: db.separationReason,
									as: "empReasonofResignation",
									attributes: ["separationReason"],
								},
							],
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
							from_date: experience.fromDate
								? moment(experience.fromDate).format("DD-MM-YYYY")
								: "",
							to_date: experience.toDate
								? moment(experience.toDate).format("DD-MM-YYYY")
								: "",
						}));

					// Sum the total work experience duration
					let totalYears = 0;
					let totalMonths = 0;
					let totalDays = 0;

					employee.employeeworkexperiences.forEach((experience) => {
						const fromDate = moment(experience.fromDate);
						const toDate = moment(experience.toDate);

						if (fromDate.isValid() && toDate.isValid()) {
							const duration = moment.duration(toDate.diff(fromDate)); // calculate the difference

							// Add up the years, months, and days
							totalYears += duration.years();
							totalMonths += duration.months();
							totalDays += duration.days();
						}
					});

					// Normalize the duration (if totalDays or totalMonths exceed 12 or 30)
					if (totalDays >= 30) {
						totalMonths += Math.floor(totalDays / 30);
						totalDays = totalDays % 30;
					}

					if (totalMonths >= 12) {
						totalYears += Math.floor(totalMonths / 12);
						totalMonths = totalMonths % 12;
					}

					// Format the result
					//const pastWorkExperience = `${totalYears} Y ${totalMonths} M ${totalDays} D`;
					const pastWorkExperience =
						totalYears === 0 && totalMonths === 0 && totalDays === 0
							? ""
							: `${totalYears} Y ${totalMonths} M ${totalDays} D`;

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
						}),
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
									employee.employeebiographicaldetail.dataValues.maritalStatus,
							) || ""
						: "";
					return {
						isActive: employee.isActive == 1 ? "Yes" : "No",
						employee_id: employee.empCode || "",
						first_name: employee.firstName || "",
						middle_name: employee.middleName || "",
						last_name: employee.lastName || "",
						designation:
							employee.designationmaster?.dataValues?.designation_with_code ||
							"",
						current_address: employee.employeeaddress?.dataValues
							? [
									employee.employeeaddress?.dataValues?.currentHouse || "",
									employee.employeeaddress?.dataValues?.currentStreet || "",
									employee.employeeaddress?.dataValues?.currentLandmark || "",
									employee.employeeaddress?.dataValues?.currentcity?.cityName ||
										"",
									employee.employeeaddress?.dataValues?.currentstate
										?.stateName || "",
									employee.employeeaddress?.dataValues?.currentcountry
										?.countryName || "",
									employee.employeeaddress?.dataValues?.currentpincode
										?.pincode || "",
								]
									.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
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
								employee.employeebiographicaldetail?.dataValues?.dateOfBirth,
							) || "",
						gender: employee.employeebiographicaldetail?.gender || "",
						date_of_activation:
							formatDate(
								employee.employeejobdetail?.dataValues?.dateOfJoining,
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
									?.maritalStatusSince,
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
						date_of_resignation: employee.separationmaster
							? moment(
									employee.separationmaster.dataValues.resignationDate,
								).format("DD-MM-YYYY")
							: "",
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
									employee.employeeaddress?.dataValues?.permanentHouse || "",
									employee.employeeaddress?.dataValues?.permanentStreet || "",
									employee.employeeaddress?.dataValues?.permanentLandmark || "",
									employee.employeeaddress?.dataValues?.permanentcity
										?.cityName || "",
									employee.employeeaddress?.dataValues?.permanentstate
										?.stateName || "",
									employee.employeeaddress?.dataValues?.permanentcountry
										?.countryName || "",
									employee.employeeaddress?.dataValues?.permanentpincode
										?.pincode || "",
								]
									.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
									.join(", ")
							: "",
						date_of_joining:
							formatDate(
								employee.employeejobdetail?.dataValues?.dateOfJoining,
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

						base_office_location:
							employee.companylocationmaster?.dataValues?.citymaster?.dataValues
								?.cityName &&
							employee.companylocationmaster?.companyLocationCode
								? `${employee.companylocationmaster?.dataValues?.citymaster?.dataValues?.cityName} ${
										employee.companylocationmaster?.isHeadquarter === true
											? "(Head Office)"
											: "(Branch)"
									} (${employee.companylocationmaster.companyLocationCode})`
								: "",
						location_type:
							employee.companylocationmaster?.isHeadquarter === true
								? "Head Office"
								: "Branch", //employee.locationType || "",
						office_location: `${
							employee.companylocationmaster?.dataValues?.citymaster?.dataValues
								?.cityName || ""
						}-${
							employee.companylocationmaster?.dataValues?.statemaster
								?.dataValues?.stateName || ""
						}`,
						education_details: mappedEducationDetails || [],
						pt_state: "",
						past_work_experience: pastWorkExperience, //
						past_work: transformedWorkExperience || [],
						employee_separation_comments:
							employee.separationmaster?.empRemark || "",
						employee_separation_reason:
							employee.separationmaster?.empReasonofResignation
								?.separationReason || "",
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
									employee.employeeaddress?.dataValues?.emergencyHouse || "",
									employee.employeeaddress?.dataValues?.emergencyStreet || "",
									employee.employeeaddress?.dataValues?.emergencyLandmark || "",
									employee.employeeaddress?.dataValues?.emergencycity
										?.dataValues?.cityName || "",
									employee.employeeaddress?.dataValues?.emergencystate
										?.dataValues?.stateName || "",
									employee.employeeaddress?.dataValues?.emergencycountry
										?.dataValues?.countryName || "",
									employee.employeeaddress?.dataValues?.emergencypincode
										?.dataValues?.pincode || "",
								]
									.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
									.join(", ")
							: "",

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
						sub_employee_type: "",
						sbu_code: employee.sbumaster?.dataValues?.code || "",
						branch_code:
							employee.companylocationmaster?.dataValues?.companyLocationCode ||
							"",
						customer_code: employee.employeejobdetail?.dataValues?.customerName
							? (employee.employeejobdetail.dataValues.customerName.match(
									/(C\d+)/,
								) || [])[1] || ""
							: "",
						// employee.employeejobdetail?.dataValues?.customerName || "",
						project_code:
							employee.employeejobdetail?.dataValues?.projectCode || "",
						pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
							? "Yes"
							: "No",
						functional_area_code:
							employee.functionalareamaster?.dataValues?.functionalAreaCode ||
							"",
						separation_transaction_date: "",
						"father's_name":
							employee.employeefamilydetails.find(
								(f) => f.dataValues.relation === "Father",
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
			} else if (
				crypto.timingSafeEqual(
					Buffer.from(providedHash, "hex"),
					Buffer.from(generateHashAll, "hex"),
				)
			) {
				console.log("Hash matches! Validation successful for all employees.");
				const employeeData = await db.employeeMaster.findAll({
					where: {
						isActive: isActive,
						companyId: companyId,
						// employeeType: [1, 2, 3, 4, 5],
						...(empCode && {
							empCode: { [Op.in]: empCode.split(",") },
						}),
					},
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
										"CONCAT(`designationmaster`.`name`, ' (', `designationmaster`.`code`, ')')",
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
								"projectCode",
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
						// {
						//   model: db.companyLocationMaster,
						//   attributes: [["address1", "current_address"]],
						//   required: false,
						// },
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
							attributes: ["address1", "companyLocationCode", "isHeadquarter"],
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
										`IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')`, // Format DOB or return an empty string if NULL
									),
									"dob",
								],
							],
						},
						{
							model: db.employeeWorkExperience,
						},
						{
							model: db.separationMaster,
							include: [
								{
									model: db.separationReason,
									as: "empReasonofResignation",
									attributes: ["separationReason"],
								},
							],
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
							from_date: experience.fromDate
								? moment(experience.fromDate).format("DD-MM-YYYY")
								: "",
							to_date: experience.toDate
								? moment(experience.toDate).format("DD-MM-YYYY")
								: "",
						}));

					// Sum the total work experience duration
					let totalYears = 0;
					let totalMonths = 0;
					let totalDays = 0;

					employee.employeeworkexperiences.forEach((experience) => {
						const fromDate = moment(experience.fromDate);
						const toDate = moment(experience.toDate);

						if (fromDate.isValid() && toDate.isValid()) {
							const duration = moment.duration(toDate.diff(fromDate)); // calculate the difference

							// Add up the years, months, and days
							totalYears += duration.years();
							totalMonths += duration.months();
							totalDays += duration.days();
						}
					});

					// Normalize the duration (if totalDays or totalMonths exceed 12 or 30)
					if (totalDays >= 30) {
						totalMonths += Math.floor(totalDays / 30);
						totalDays = totalDays % 30;
					}

					if (totalMonths >= 12) {
						totalYears += Math.floor(totalMonths / 12);
						totalMonths = totalMonths % 12;
					}

					// Format the result
					//const pastWorkExperience = `${totalYears} Y ${totalMonths} M ${totalDays} D`;
					const pastWorkExperience =
						totalYears === 0 && totalMonths === 0 && totalDays === 0
							? ""
							: `${totalYears} Y ${totalMonths} M ${totalDays} D`;

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
						}),
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
									employee.employeebiographicaldetail.dataValues.maritalStatus,
							) || ""
						: "";
					return {
						isActive: employee.isActive == 1 ? "Yes" : "No",
						employee_id: employee.empCode || "",
						first_name: employee.firstName || "",
						middle_name: employee.middleName || "",
						last_name: employee.lastName || "",
						designation:
							employee.designationmaster?.dataValues?.designation_with_code ||
							"",
						current_address: employee.employeeaddress?.dataValues
							? [
									employee.employeeaddress?.dataValues?.currentHouse || "",
									employee.employeeaddress?.dataValues?.currentStreet || "",
									employee.employeeaddress?.dataValues?.currentLandmark || "",
									employee.employeeaddress?.dataValues?.currentcity?.cityName ||
										"",
									employee.employeeaddress?.dataValues?.currentstate
										?.stateName || "",
									employee.employeeaddress?.dataValues?.currentcountry
										?.countryName || "",
									employee.employeeaddress?.dataValues?.currentpincode
										?.pincode || "",
								]
									.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
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
								employee.employeebiographicaldetail?.dataValues?.dateOfBirth,
							) || "",
						gender: employee.employeebiographicaldetail?.gender || "",
						date_of_activation:
							formatDate(
								employee.employeejobdetail?.dataValues?.dateOfJoining,
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
									?.maritalStatusSince,
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
						date_of_resignation: employee.separationmaster
							? moment(
									employee.separationmaster.dataValues.resignationDate,
								).format("DD-MM-YYYY")
							: "",
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
									employee.employeeaddress?.dataValues?.permanentHouse || "",
									employee.employeeaddress?.dataValues?.permanentStreet || "",
									employee.employeeaddress?.dataValues?.permanentLandmark || "",
									employee.employeeaddress?.dataValues?.permanentcity
										?.cityName || "",
									employee.employeeaddress?.dataValues?.permanentstate
										?.stateName || "",
									employee.employeeaddress?.dataValues?.permanentcountry
										?.countryName || "",
									employee.employeeaddress?.dataValues?.permanentpincode
										?.pincode || "",
								]
									.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
									.join(", ")
							: "",
						date_of_joining:
							formatDate(
								employee.employeejobdetail?.dataValues?.dateOfJoining,
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

						base_office_location:
							employee.companylocationmaster?.dataValues?.citymaster?.dataValues
								?.cityName &&
							employee.companylocationmaster?.companyLocationCode
								? `${employee.companylocationmaster?.dataValues?.citymaster?.dataValues?.cityName} ${
										employee.companylocationmaster?.isHeadquarter === true
											? "(Head Office)"
											: "(Branch)"
									} (${employee.companylocationmaster.companyLocationCode})`
								: "",
						location_type:
							employee.companylocationmaster?.isHeadquarter === true
								? "Head Office"
								: "Branch", //employee.locationType || "",
						office_location: `${
							employee.companylocationmaster?.dataValues?.citymaster?.dataValues
								?.cityName || ""
						}-${
							employee.companylocationmaster?.dataValues?.statemaster
								?.dataValues?.stateName || ""
						}`,
						education_details: mappedEducationDetails || [],
						pt_state: "",
						past_work_experience: pastWorkExperience, //
						past_work: transformedWorkExperience || [],
						employee_separation_comments:
							employee.separationmaster?.empRemark || "",
						employee_separation_reason:
							employee.separationmaster?.empReasonofResignation
								?.separationReason || "",
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
									employee.employeeaddress?.dataValues?.emergencyHouse || "",
									employee.employeeaddress?.dataValues?.emergencyStreet || "",
									employee.employeeaddress?.dataValues?.emergencyLandmark || "",
									employee.employeeaddress?.dataValues?.emergencycity
										?.dataValues?.cityName || "",
									employee.employeeaddress?.dataValues?.emergencystate
										?.dataValues?.stateName || "",
									employee.employeeaddress?.dataValues?.emergencycountry
										?.dataValues?.countryName || "",
									employee.employeeaddress?.dataValues?.emergencypincode
										?.dataValues?.pincode || "",
								]
									.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
									.join(", ")
							: "",

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
						sub_employee_type: "",
						sbu_code: employee.sbumaster?.dataValues?.code || "",
						branch_code:
							employee.companylocationmaster?.dataValues?.companyLocationCode ||
							"",
						customer_code: employee.employeejobdetail?.dataValues?.customerName
							? (employee.employeejobdetail.dataValues.customerName.match(
									/(C\d+)/,
								) || [])[1] || ""
							: "",
						// employee.employeejobdetail?.dataValues?.customerName || "",
						project_code:
							employee.employeejobdetail?.dataValues?.projectCode || "",
						pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
							? "Yes"
							: "No",
						functional_area_code:
							employee.functionalareamaster?.dataValues?.functionalAreaCode ||
							"",
						separation_transaction_date: "",
						"father's_name":
							employee.employeefamilydetails.find(
								(f) => f.dataValues.relation === "Father",
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
			} else {
				return res.status(401).json({
					status: 0,
					message: "Unauthorized access",
					employee_data: [],
				});
			}
		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async internalDataSync(req,res){
		try {
			const {search,empCode,isActive} = req.body;

			const whereCondition = {
				isActive,
				...(search?.trim() && {
				  [Op.or]: [
					{ empCode: search.trim() },
					{ email: search.trim() }
				  ]
				})
			  };
			const employeeData = await db.employeeMaster.findAll({
				where: whereCondition,
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
			            "name","code"
						],
						required: false,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName","departmentCode"],
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
							"projectCode",
							"esicNumber",
							"pfRestricted",
							"epfApplicable",
							"esicApplicable",
							"confirmationDate"
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
						attributes: ["address1", "companyLocationCode", "isHeadquarter"],
						include: [
							{ model: db.countryMaster, attributes: ["countryName"] },
							{ model: db.stateMaster, attributes: ["stateName"] },
							{ model: db.cityMaster, attributes: ["cityName"] },
							{ model: db.pinCodeMaster, attributes: ["pinCode"] },
						],
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
						model: db.educationDetails,
						attributes: [
							"educationDegree",
							"educationSpecialisation",
							"educationInstitute",
							"educationRemark",
							"educationStartDate",
							"educationCompletionDate",
						],
						where: { isHighestEducation: 1 },
						include: [
							{
								model: db.degreeMaster,
							},
						],
						required: false,
					},
				],
				
			});

			const manipulatedData = employeeData.map((employee) => {
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
								employee.employeebiographicaldetail.dataValues.maritalStatus,
						) || ""
					: "";
				return {
				    "EmployeeSBU": employee.bumaster?.dataValues?.buCode || "",
					"Key": "24;UBQAAAJ7BTIAMQAyADAANg==10;36511399090;",
					"TMC": employee.empCode,
					"Full_Name": employee.name,
					"Department":employee.functionalareamaster?.dataValues?.functionalAreaCode ||
					"",
					"Designation":employee.designationmaster?.dataValues?.name || "",
					"Branch": employee.companylocationmaster?.dataValues?.companyLocationCode ||
					"",//"12",
					"SBU": employee.bumaster?.dataValues?.buCode || "",
					"SBUSpecified": true,
					"Reporting_Head_ID": employee.managerData?.dataValues?.empCode || "",
					"Date_of_Joining": employee.employeejobdetail?.dataValues?.dateOfJoining || "",
					"Date_of_JoiningSpecified": true,
					"Birth_Date": employee.employeebiographicaldetail?.dataValues?.dateOfBirth || "",
					"Birth_DateSpecified": true,
					"Comm_Addr": employee.employeeaddress?.dataValues
					? [
							employee.employeeaddress?.dataValues?.currentHouse || "",
							employee.employeeaddress?.dataValues?.currentStreet || "",
							employee.employeeaddress?.dataValues?.currentLandmark || "",
							employee.employeeaddress?.dataValues?.currentcity?.cityName ||
								"",
							employee.employeeaddress?.dataValues?.currentstate
								?.stateName || "",
							employee.employeeaddress?.dataValues?.currentcountry
								?.countryName || "",
							employee.employeeaddress?.dataValues?.currentpincode
								?.pincode || "",
						]
							.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
							.join(", ")
					: "",
					"Phone_No": employee.personalMobileNumber,
					"Company_E_Mail": employee.email || "",
					"Personal_E_Mail": employee.personalEmail || "",
					"Bank_Name": employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
					?.bankName || "",
					"Account_No": employee.employeepaymentdetail?.dataValues
					?.paymentAccountNumber || "",
					"SBUCode": employee.sbumaster?.dataValues?.code || "",
					"Mobile_Phone_No": employee.officeMobileNumber || "",
					"Location_Code": employee.companylocationmaster?.dataValues?.citymaster?.dataValues
					?.cityName,
					"First_Name": employee.name || "",
					"Qualification_Code": employee.employeeeducationdetails.length > 0 ? employee.employeeeducationdetails[0].educationSpecialisation:"",//"EDUCATION",
					"Gender":employee.employeebiographicaldetail?.gender === "Male"
					? 2
					: employee.employeebiographicaldetail?.gender === "Female"
					? 1
					: 3,
					"GenderSpecified": employee.employeebiographicaldetail?.gender ? true:false,
					"Confirmation_Date": employee.employeejobdetail?.dataValues?.confirmationDate || "",
					"Confirmation_DateSpecified": employee.employeejobdetail?.dataValues?.confirmationDate?true:false,
					"Marital_Status": employee.employeebiographicaldetail?.dataValues
					?.maritalStatus,
					"Marital_StatusSpecified":employee.employeebiographicaldetail?.dataValues?.maritalStatus ? true : false,		
					"Entitlement_to_ESI": employee.dataValues?.employeejobdetail
					?.esicApplicable
					? true
					: false,
					"Entitlement_to_ESISpecified": true, // fixed
					"Is_Confirmed": true,
					"Is_ConfirmedSpecified":employee.employeejobdetail?.dataValues?.confirmationDate?true:false,
					"Probation_Status": 0,
					"Probation_StatusSpecified": true,
					"HR_Admin": true,
					"HR_AdminSpecified": true,
					"SUBBU_Code": employee.costcentermaster?.dataValues?.costCenterCode,
					"Employee_Band":
					employee.employeejobdetail?.dataValues?.grademaster?.dataValues
						?.gradeName || "",

					
				};
			});

			res.status(200).json({
				status: 1,
				message: "Successfully loaded all employees data",
				employee_data: manipulatedData,
			});

		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

}

export default new ThirdPartyController();
