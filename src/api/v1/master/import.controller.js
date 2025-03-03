import { Op } from "sequelize";
import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import xlsx from "json-as-xlsx";
import fs from "fs";
import client from "../../../config/redisDb.config.js";
import pkg from "xlsx";
import bcrypt from "bcryptjs";
import moment from "moment";
import helper from "../../../helper/helper.js";
import validator from "../../../helper/validator.js";
import AdmZip from "adm-zip";
// import AdmZip from "adm-zip";
import path from "path";
import { fileURLToPath } from "url";

const maritalStatusOptions = {
	Married: 1,
	Single: 2,
	Divorced: 3,
	Separated: 4,
	Widowed: 5,
	Others: 6,
};

class MasterController {
	async onboardingEmployeeImport(req, res) {
		const transaction = await db.sequelize.transaction(); // Start the transaction
		try {
			// Read Excel file
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			} else {
				// Ensure the uploaded file has an extension
				const originalPath = req.file.path;
				const newPath = path.join(
					path.dirname(originalPath),
					`${path.basename(originalPath)}_${moment().format("YYYY-mm-dd")}.xlsx`,
				);

				// Rename the file with .xlsx extension
				fs.renameSync(originalPath, newPath);

				// Use newPath to open the file
				const workbookEmployee = pkg.readFile(newPath);

				// const workbookEmployee = pkg.readFile(req.file.path);
				const sheetNameEmployee = workbookEmployee.SheetNames[0];
				const Employees = pkg.utils.sheet_to_json(
					workbookEmployee.Sheets[sheetNameEmployee],
				);

				const successData = [];
				const failureData = [];

				// process data in chunks
				const chunkSize = 10;

				for (let i = 0; i < Employees.length; i += chunkSize) {
					const chunk = Employees.slice(i, i + chunkSize);
					const validEmployees = [];
					const invalidEmployees = [];

					for (const employee of chunk) {
						let obj = createObj(employee);

						// validate fields
						const { error } =
							await validator.importOnboardEmployeeSchema.validate(obj);
						if (!error) {
							const isValidCompany = await validateCompany(obj.company);
							const isValidEmployeeType = await validateEmployeeType(
								obj.employeeType,
								isValidCompany,
							);
							const isValidProbation = await validateProbation(obj.probation);
							const isValidManager = await validateManager(obj.manager);
							const isValidDesignation = await validateDesignation(
								obj.designation,
							);
							const isValidFunctionalArea = await validateFunctionalArea(
								obj.functionalArea,
							);
							const isValidBU = await validateBU(obj.bu, isValidCompany);
							const isValidSBU = await validateSBU(obj.sbu);
							const isValidShift = await validateShift(obj.shift);
							const isValidDepartment = await validateDepartment(
								obj.department,
							);
							const isValidAttendancePolicy = await validateAttendancePolicy(
								obj.attendancePolicy,
							);
							const isValidCompanyLocation = await validateCompanyLocation(
								obj.companyLocation,
								isValidCompany,
							);
							const isValidWeekOff = await validateWeekOff(obj.weekOff);
							const isValidNewCustomerName = await validateNewCustomerName(
								obj.newCustomerName,
							);
							const isValidJobLevel = await validateJobLevel(
								isValidCompany,
								obj.jobLevel,
							);
							const isValidDegree = await validateDegree(
								obj.highestQualification,
							);

							let isValidBank = { status: true, message: "", data: {} };
							let isValidIFSC = { status: true, message: "", data: {} };

							if (isValidEmployeeType.data.empTypeId === 3) {
								isValidBank = await validateBank(obj.paymentBankName);
								isValidIFSC = await validateBankIfsc(
									obj.paymentBankName,
									obj.paymentBankIfsc,
								);
							}

							const isValidateEmployee = await validateEmployee(
								obj.personalMobileNumber,
								obj.email,
								obj.personalEmail,
								obj.officeMobileNumber,
							);

							if (
								isValidCompany.status &&
								isValidEmployeeType.status &&
								isValidProbation.status &&
								isValidManager.status &&
								isValidDesignation.status &&
								isValidFunctionalArea.status &&
								isValidBU.status &&
								isValidSBU.status &&
								isValidCompanyLocation.status &&
								isValidDepartment.status &&
								isValidateEmployee.status &&
								isValidJobLevel.status &&
								isValidDegree.status &&
								isValidBank.status &&
								isValidIFSC.status
							) {
								// prepare employee object
								let newEmployee = {
									name: [obj.firstName, obj.middleName, obj.lastName]
										.filter((name) => name)
										.join(" "),
									firstName: obj.firstName,
									middleName: obj.middleName,
									lastName: obj.lastName,
									email: obj.email,
									personalEmail: obj.personalEmail,
									panNo: obj.panNo,
									uanNo: obj.uanNo,
									pfNo: obj.pfNo,
									officeMobileNumber: obj.officeMobileNumber,
									personalMobileNumber: obj.personalMobileNumber,
									gender: obj.gender,
									dateOfBirth: obj.dateOfBirth,
									dateOfJoining: obj.dateOfJoining,
									maritalStatus: maritalStatusOptions[obj.maritalStatus],
									maritalStatusSince: obj.maritalStatusSince,
									nationality: obj.nationality,
									probationId: isValidProbation.data.probationId,
									iqTestApplicable: obj.iqTestApplicable == "Yes" ? 1 : 0,
									positionType: obj.positionType,
									companyId: isValidCompany.data.companyId,
									buId: isValidBU.data.buId,
									sbuId: isValidSBU.data.sbuId,
									departmentId: isValidDepartment.data.departmentId,
									functionalAreaId: isValidFunctionalArea.data.functionalAreaId,
									buHRId: isValidBU.data.buHR,
									buHeadId: isValidBU.data.buHead,
									employeeType: isValidEmployeeType.data.empTypeId,
									manager: isValidManager.data.id,
									designation_id: isValidDesignation.data.designationId,
									shiftId: isValidShift.status
										? isValidShift.data.shiftId
										: null,
									attendancePolicyId: isValidAttendancePolicy.status
										? isValidAttendancePolicy.data.attendancePolicyId
										: null,
									companyLocationId: isValidCompanyLocation.status
										? isValidCompanyLocation.data.companyLocationId
										: null,
									weekOffId: isValidWeekOff.status
										? isValidWeekOff.data.weekOffId
										: null,
									newCustomerNameId: isValidNewCustomerName.status
										? isValidNewCustomerName.data.newCustomerNameId
										: null,
									jobLevelId: isValidJobLevel.data?.jobLevelId,
									selfService: obj.selfService,
									mobileAccess: obj.mobileAccess,
									laptopSystem: obj.laptopSystem,
									backgroundVerification: obj.backgroundVerification,
									workstationAdmin: obj.workstationAdmin,
									mobileAdmin: obj.mobileAdmin,
									dataCardAdmin: obj.dataCardAdmin,
									visitingCardAdmin: obj.visitingCardAdmin,
									recruiterName: obj.recruiterName,
									offRoleCTC: obj.offRoleCTC,
									highestQualification: isValidDegree.data?.degreeId,
									ESICPFDeduction: obj.ESICPFDeduction,
									fatherName: obj.fatherName,
									paymentAccountNumber: obj.paymentAccountNumber,
									paymentBankName:
										isValidEmployeeType.data.empTypeId === 3
											? isValidBank.data?.bankName
											: "",
									paymentBankIfsc:
										isValidEmployeeType.data.empTypeId === 3
											? isValidIFSC.data?.bankIfsc
											: "",
								};

								newEmployee.role_id = 3;
								validEmployees.push({
									Index: employee.Index,
									Personal_Email: obj.personalEmail,
									Remarks: "Success",
								});

								const createdEmployees =
									await db.employeeStagingMaster.create(newEmployee);
							} else {
								const masterErrors = {
									index: employee.Index,
									personalEmail: obj.personalEmail,
									company: isValidCompany.message,
									employeeType: isValidEmployeeType.message,
									probation: isValidProbation.message,
									manager: isValidManager.message,
									designation: isValidDesignation.message,
									functionalArea: isValidFunctionalArea.message,
									bu: isValidBU.message,
									sbu: isValidSBU.message,
									shift: isValidShift.message,
									attendancePolicy: isValidAttendancePolicy.message,
									companyLocation: isValidCompanyLocation.message,
									weekOff: isValidWeekOff.message,
									department: isValidDepartment.message,
									jobLevel: isValidJobLevel.message,
									degree: isValidDegree.message,
									bankName: isValidBank.message,
									bankIFSC: isValidIFSC.message,
									alreadyExist: isValidateEmployee.message,
								};
								invalidEmployees.push(masterErrors);
							}
						} else {
							const errors = handleErrors(error);
							invalidEmployees.push({
								...errors,
								index: employee.Index,
								personalEmail: obj.personalEmail,
							});
						}
					}

					// bulk create valid data
					if (validEmployees.length > 0) {
						// const createdEmployees = await db.employeeStagingMaster.bulkCreate(validEmployees);
						// successData.push(...createdEmployees.map(e => e.toJSON()));
						successData.push(...validEmployees);
					}
					failureData.push(...invalidEmployees);
				}

				return respHelper(res, {
					status: 200,
					msg:
						failureData.length > 0
							? "File upload was not successful. Please check your file and try again."
							: "File Uploaded Successfully",
					data: {
						successData,
						failureData,
					},
				});
			}
		} catch (error) {
			await transaction.rollback(); // Rollback the transaction in case of an error
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async documentImport(req, res) {
		let transaction;
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			}

			const zipFilePath = req.file.path;

			transaction = await db.sequelize.transaction();

			const zip = new AdmZip(zipFilePath);
			const zipEntries = zip.getEntries();
			let empNotFound = [];

			for (const zipEntry of zipEntries) {
				if (zipEntry.isDirectory) continue;

				const fileName = zipEntry.entryName;
				const empCode = path.parse(fileName).name.split("__")[0];
				const fileExtension = path.extname(fileName);

				const employee = await db.employeeMaster.findOne({
					where: { empCode },
					transaction,
				});

				if (employee) {
					if (employee && req.body.documentType == 1) {
						console.log(">>>>>>>>>>>>>>>>>>>>>1");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `merit_planning_letter_${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						await db.hrLetters.create(
							{
								userId: employee.id,
								documentType: req.body.documentType,
								documentImage: imageUrl,
								createdBy: req.userId,
								createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							},
							{ transaction },
						);
					}
					if (employee && req.body.documentType == 2) {
						console.log(">>>>>>>>>>>>>>>>>>>>>2");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `confirmation_letter_${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						const existingDocument = await db.hrLetters.findOne({
							attributes: ["letterId", "userId", "documentType"],
							where: {
								userId: employee.id,
								documentType: req.body.documentType,
							},
							transaction,
						});

						if (existingDocument) {
							// Update the existing document
							await db.hrLetters.update(
								{
									documentType: req.body.documentType,
									documentImage: imageUrl,
									updatedBy: req.userId,
									updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								}, // Update only the required field
								{
									where: {
										userId: employee.id,
										documentType: req.body.documentType,
									},
									transaction,
								},
							);
						} else {
							// Create a new document record
							await db.hrLetters.create(
								{
									userId: employee.id,
									documentType: req.body.documentType,
									documentImage: imageUrl,
									createdBy: req.userId,
									createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								},
								{ transaction },
							);
						}
					}
					if (employee && req.body.documentType == 3) {
						console.log(">>>>>>>>>>>>>>>>>>>>>3");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `pip_letter_${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						await db.hrLetters.create(
							{
								userId: employee.id,
								documentType: req.body.documentType,
								documentImage: imageUrl,
								createdBy: req.userId,
								createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							},
							{ transaction },
						);
					}
					if (employee && req.body.documentType == 4) {
						console.log(">>>>>>>>>>>>>>>>>>>>>4");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `bgv_card_${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						const existingDocument = await db.hrLetters.findOne({
							attributes: ["letterId", "userId", "documentType"],
							where: {
								userId: employee.id,
								documentType: req.body.documentType,
							},
							transaction,
						});

						if (existingDocument) {
							// Update the existing document
							await db.hrLetters.update(
								{
									documentType: req.body.documentType,
									documentImage: imageUrl,
									updatedBy: req.userId,
									updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								}, // Update only the required field
								{
									where: {
										userId: employee.id,
										documentType: req.body.documentType,
									},
									transaction,
								},
							);
						} else {
							// Create a new document record
							await db.hrLetters.create(
								{
									userId: employee.id,
									documentType: req.body.documentType,
									documentImage: imageUrl,
									createdBy: req.userId,
									createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								},
								{ transaction },
							);
						}
					}
					if (employee && req.body.documentType == 5) {
						console.log(">>>>>>>>>>>>>>>>>>>>>5");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `employment_related${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						await db.hrLetters.create(
							{
								userId: employee.id,
								documentType: req.body.documentType,
								documentImage: imageUrl,
								createdBy: req.userId,
								createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							},
							{ transaction },
						);
					}
					if (employee && req.body.documentType == 6) {
						console.log(">>>>>>>>>>>>>>>>>>>>>6");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `insurance_card_${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						const existingDocument = await db.hrLetters.findOne({
							attributes: ["letterId", "userId", "documentType"],
							where: {
								userId: employee.id,
								documentType: req.body.documentType,
							},
							transaction,
						});

						if (existingDocument) {
							// Update the existing document
							await db.hrLetters.update(
								{
									documentType: req.body.documentType,
									documentImage: imageUrl,
									updatedBy: req.userId,
									updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								}, // Update only the required field
								{
									where: {
										userId: employee.id,
										documentType: req.body.documentType,
									},
									transaction,
								},
							);
						} else {
							// Create a new document record
							await db.hrLetters.create(
								{
									userId: employee.id,
									documentType: req.body.documentType,
									documentImage: imageUrl,
									createdBy: req.userId,
									createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								},
								{ transaction },
							);
						}
					}
					if (employee && req.body.documentType == 7) {
						console.log(">>>>>>>>>>>>>>>>>>>>>2");
						const fileBuffer = zipEntry.getData();
						const mimeType = `application/${fileExtension.replace(".", "")}`;
						const base64String = `data:${mimeType};base64,${fileBuffer.toString(
							"base64",
						)}`;

						const d = Math.floor(Date.now() / 1000);
						const uniqueFileName = `confirmation_letter_${d}`;

						const imageUrl = await helper.fileUpload(
							base64String,
							uniqueFileName,
							`uploads/${empCode}`,
						);
						const existingDocument = await db.hrLetters.findOne({
							attributes: ["letterId", "userId", "documentType"],
							where: {
								userId: employee.id,
								documentType: req.body.documentType,
							},
							transaction,
						});

						if (existingDocument) {
							// Update the existing document
							await db.hrLetters.update(
								{
									documentType: req.body.documentType,
									documentImage: imageUrl,
									updatedBy: req.userId,
									updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								}, // Update only the required field
								{
									where: {
										userId: employee.id,
										documentType: req.body.documentType,
									},
									transaction,
								},
							);
						} else {
							// Create a new document record
							await db.hrLetters.create(
								{
									userId: employee.id,
									documentType: req.body.documentType,
									documentImage: imageUrl,
									createdBy: req.userId,
									createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								},
								{ transaction },
							);
						}
					}
				} else {
					empNotFound.push({
						empCode: empCode,
						error: `Employee with empCode ${empCode} not found.`,
					});
					console.warn(`Employee with empCode ${empCode} not found.`);
				}
			}

			await transaction.commit();
			fs.unlinkSync(zipFilePath);

			if (empNotFound.length > 0) {
				const timestamp = Date.now();

				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee Code", value: "empCode" },
							{ label: "Error", value: "error" },
						],
						content: empNotFound,
					},
				];

				const settings = {
					fileName: `Error_Report_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				// res.setHeader(
				//   "Content-Disposition",
				//   `attachment; filename=Error_Report_${timestamp}.xlsx`
				// );
				// res.end(report);
			}

			return respHelper(res, {
				status: 200,
				msg: "ZIP file processed successfully and database updated",
				data: empNotFound,
			});
		} catch (error) {
			if (transaction) await transaction.rollback();
			console.error(error);
			return respHelper(res, {
				status: 500,
				msg: "Failed to process the ZIP file",
			});
		}
	}
	async managerHistoryImport(req, res) {
		try {
			// Read Excel file
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			} else {
				// Ensure the uploaded file has an extension
				const originalPath = req.file.path;
				const newPath = path.join(
					path.dirname(originalPath),
					`${path.basename(originalPath)}_${moment().format("YYYY-mm-dd")}.xlsx`,
				);

				// Rename the file with .xlsx extension
				fs.renameSync(originalPath, newPath);

				// Use newPath to open the file
				const workbookEmployee = pkg.readFile(newPath);

				// const workbookEmployee = pkg.readFile(req.file.path);
				const sheetNameEmployee = workbookEmployee.SheetNames[1];
				const Employees = pkg.utils.sheet_to_json(
					workbookEmployee.Sheets[sheetNameEmployee],
				);
				// process data in chunks
				const chunkSize = 100;

				for (let i = 0; i < Employees.length; i += chunkSize) {
					const chunk = Employees.slice(i, i + chunkSize);
					for (const manager of chunk) {
						let history = {
							id: manager.id,
							employeeId: manager.employeeId,
							managerId: manager.managerId,
							oldManagerId: null,
							fromDate: convertExcelDate(manager.fromDate),
							toDate:
								manager.toDate != "NULL"
									? convertExcelDate(manager.toDate)
									: null,
							needAttendanceCron: 1,
							sourceName: "System",
							status: 1,
							createdBy: 1,
							updatedBy: null,
							createdAt: null,
							updatedAt: null,
						};

						// verify employeeId and managerId in employee master table
						let isVerify = await db.employeeMaster.findOne({
							where: { id: manager.employeeId, id: manager.managerId },
							attributes: ["id"],
						});
						if (isVerify) {
							await db.managerHistory.create(history);
						} else {
							console.log("index number is not exist", history.id);
						}
					}
				}

				return respHelper(res, {
					status: 200,
					msg: "File Uploaded Successfully",
					data: {},
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async reAndCustomerCodeImport(req, res) {
    let transaction;
    try {
      if (!req.file) {
        return respHelper(res, {
          status: 400,
          msg: "File is required!",
        });
      }
  
      const originalPath = req.file.path;
      const newPath = path.join(
        path.dirname(originalPath),
        `${path.basename(originalPath, path.extname(originalPath))}_${moment().format("YYYY-MM-DD")}.xlsx`
      );
      fs.renameSync(originalPath, newPath);
  
      // Read Excel file
      const workbookEmployee = pkg.readFile(newPath);
  
      // Log available sheet names
      console.log("Available sheets:", workbookEmployee.SheetNames);
  
      // Check if 'Sheet1' exists, else use the first available sheet
      let sheetNameEmployee = "Sheet1";
      if (!workbookEmployee.Sheets[sheetNameEmployee]) {
        sheetNameEmployee = workbookEmployee.SheetNames[0]; // Use first sheet dynamically
        console.log(`Using sheet: ${sheetNameEmployee}`);
      }
  
      if (!workbookEmployee.Sheets[sheetNameEmployee]) {
        return respHelper(res, {
          status: 400,
          msg: `Sheet '${sheetNameEmployee}' not found in the uploaded file!`,
        });
      }
  
      // Convert sheet data to JSON
      const Employees = pkg.utils.sheet_to_json(workbookEmployee.Sheets[sheetNameEmployee]);
  
      transaction = await db.sequelize.transaction();
      const empNotFound = [];
  
      for (const emp of Employees) {
        const employeeId = emp['Employee Id']; // Adjust column name as per your Excel
        if (!employeeId) continue;
  
        const employee = await db.employeeMaster.findOne({
          where: { empCode: employeeId },
          attributes: ["id"],
          transaction,
        });
  
        if (employee) {
          const residentEng = emp['Updated RE Tagging'] === "Yes" ? 1 : 0;
          const customerName = emp['Updated Customer Name'] || null;
          const customerCode = emp['Updated Customer Code'] || null;
          const projectCode = emp['Updated Project Code'] || null;
  
          await db.jobDetails.update(
            { residentEng, customerName, customerCode, projectCode },
            { where: { userId: employee.id }, transaction }
          );
        } else {
          empNotFound.push(employeeId);
        }
      }
  
      await transaction.commit();
  
      return respHelper(res, {
        status: 200,
        msg: "File processed successfully and database updated",
        data: empNotFound,
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error processing the file:", error.message);
  
      return respHelper(res, {
        status: 500,
        msg: "Failed to process the file",
        error: error.message,
      });
    }
  }
}

const createObj = (obj) => {
	let officeMobileNumber = replaceNAWithNull(obj.Official_Mobile_Number);
	officeMobileNumber = officeMobileNumber
		? officeMobileNumber.toString()
		: null;
	let personalMobileNumber = obj.Personal_Mobile_Number?.toString();
	let uanNo = replaceNAWithNull(obj.UAN_No);

	if (personalMobileNumber) {
		personalMobileNumber = personalMobileNumber.replace(/^91/, "");
	}

	return {
		email: replaceNAWithNull(obj.Email),
		personalEmail: obj.Personal_Email,
		firstName: obj.First_Name,
		middleName: replaceNAWithNull(obj.Middle_Name),
		lastName: replaceNAWithNull(obj.Last_Name),
		panNo: replaceNAWithNull(obj.Pan_No),
		uanNo: uanNo ? uanNo.toString() : null,
		pfNo: replaceNAWithNull(obj.PF_No),
		employeeType: obj.Employee_Type_Name,
		officeMobileNumber: officeMobileNumber,
		personalMobileNumber: personalMobileNumber,
		gender: obj.Gender,
		dateOfBirth: convertExcelDate(obj.Date_of_Birth),
		dateOfJoining: convertExcelDate(obj.Date_of_Joining),
		maritalStatus: obj.Marital_Status,
		maritalStatusSince:
			obj.Marital_Since == "" ||
			obj.Marital_Since == undefined ||
			obj.Marital_Since == "NA"
				? null
				: convertExcelDate(obj.Marital_Since),
		nationality: obj.Nationality_Name,
		probation: obj.Probation_Name,
		newCustomerName: replaceNAWithNull(obj.New_Customer_Name),
		iqTestApplicable: obj.IQ_Test_Applicable,
		positionType: obj.Position_Type,
		manager: obj.Manager_EMP_CODE.toString(),
		designation: obj.Designation_Name,
		functionalArea: obj.Functional_Area_Name,
		bu: obj.BU_Name,
		sbu: obj.SBU_Name,
		shift: replaceNAWithNull(obj.Shift_Name),
		department: obj.Department_Name,
		company: obj.Company_Name,
		attendancePolicy: replaceNAWithNull(obj.Attendance_Policy_Name),
		companyLocation: obj.Company_Location_Name.toString(),
		weekOff: replaceNAWithNull(obj.Week_Off_Name),
		jobLevel: obj.Job_Level_Name,

		selfService: replaceYesOrNoWithNumber(obj.Self_Service),
		mobileAccess: replaceYesOrNoWithNumber(obj.Mobile_Access),
		laptopSystem: obj.Laptop_System,
		backgroundVerification: replaceYesOrNoWithNumber(
			obj.Background_Verification,
		),
		workstationAdmin: replaceYesOrNoWithNumber(obj.Work_Station_Admin),
		mobileAdmin: replaceYesOrNoWithNumber(obj.Mobile_Admin),
		dataCardAdmin: replaceYesOrNoWithNumber(obj.DataCard_Admin),
		visitingCardAdmin: replaceYesOrNoWithNumber(obj.Visiting_Card_Admin),
		recruiterName: obj.Recruiter_Name,
		offRoleCTC:
			obj.Off_Role_CTC === "NA" ||
			obj.Off_Role_CTC === "" ||
			obj.Off_Role_CTC === undefined
				? 0
				: obj.Off_Role_CTC,
		highestQualification: obj.Highest_Qualification,
		ESICPFDeduction:
			obj.ESIC_PF_Deduction == "NA" ||
			obj.ESIC_PF_Deduction == "" ||
			obj.ESIC_PF_Deduction == undefined
				? null
				: obj.ESIC_PF_Deduction,
		fatherName:
			obj.Father_Name == "NA" ||
			obj.Father_Name == "" ||
			obj.Father_Name == undefined
				? null
				: obj.Father_Name,
		paymentAccountNumber:
			obj.Bank_Account_Number == "NA" ||
			obj.Bank_Account_Number == "" ||
			obj.Bank_Account_Number == undefined
				? null
				: obj.Bank_Account_Number.toString(),
		paymentBankName:
			obj.Bank_Name == "NA" || obj.Bank_Name == "" || obj.Bank_Name == undefined
				? null
				: obj.Bank_Name,
		paymentBankIfsc:
			obj.Bank_IFSC_Number == "NA" ||
			obj.Bank_IFSC_Number == "" ||
			obj.Bank_IFSC_Number == undefined
				? null
				: obj.Bank_IFSC_Number,
	};
};

const handleErrors = (error) => {
	const errors = {
		email: error
			? error.details.find((d) => d.context.key === "email")?.message
			: null,
		personalEmail: error
			? error.details.find((d) => d.context.key === "personalEmail")?.message
			: null,
		name: error
			? error.details.find((d) => d.context.key === "name")?.message
			: null,
		firstName: error
			? error.details.find((d) => d.context.key === "firstName")?.message
			: null,
		middleName: error
			? error.details.find((d) => d.context.key === "middleName")?.message
			: null,
		lastName: error
			? error.details.find((d) => d.context.key === "lastName")?.message
			: null,
		panNo: error
			? error.details.find((d) => d.context.key === "panNo")?.message
			: null,
		uanNo: error
			? error.details.find((d) => d.context.key === "uanNo")?.message
			: null,
		pfNo: error
			? error.details.find((d) => d.context.key === "pfNo")?.message
			: null,
		employeeType: error
			? error.details.find((d) => d.context.key === "employeeType")?.message
			: null,
		officeMobileNumber: error
			? error.details.find((d) => d.context.key === "officeMobileNumber")
					?.message
			: null,
		personalMobileNumber: error
			? error.details.find((d) => d.context.key === "personalMobileNumber")
					?.message
			: null,
		dateOfBirth: error
			? error.details.find((d) => d.context.key === "dateOfBirth")?.message
			: null,
		dateOfJoining: error
			? error.details.find((d) => d.context.key === "dateOfJoining")?.message
			: null,
		manager: error
			? error.details.find((d) => d.context.key === "manager")?.message
			: null,
		designation: error
			? error.details.find((d) => d.context.key === "designation")?.message
			: null,
		functionalArea: error
			? error.details.find((d) => d.context.key === "functionalArea")?.message
			: null,
		bu: error
			? error.details.find((d) => d.context.key === "bu")?.message
			: null,
		sbu: error
			? error.details.find((d) => d.context.key === "sbu")?.message
			: null,
		shift: error
			? error.details.find((d) => d.context.key === "shift")?.message
			: null,
		department: error
			? error.details.find((d) => d.context.key === "department")?.message
			: null,
		company: error
			? error.details.find((d) => d.context.key === "company")?.message
			: null,
		buHR: error
			? error.details.find((d) => d.context.key === "buHR")?.message
			: null,
		buHead: error
			? error.details.find((d) => d.context.key === "buHead")?.message
			: null,
		attendancePolicy: error
			? error.details.find((d) => d.context.key === "attendancePolicy")?.message
			: null,
		companyLocation: error
			? error.details.find((d) => d.context.key === "companyLocation")?.message
			: null,
		weekOff: error
			? error.details.find((d) => d.context.key === "weekOff")?.message
			: null,
		gender: error
			? error.details.find((d) => d.context.key === "gender")?.message
			: null,
		maritalStatus: error
			? error.details.find((d) => d.context.key === "maritalStatus")?.message
			: null,
		maritalStatusSince: error
			? error.details.find((d) => d.context.key === "maritalStatusSince")
					?.message
			: null,
		nationality: error
			? error.details.find((d) => d.context.key === "nationality")?.message
			: null,
		probation: error
			? error.details.find((d) => d.context.key === "probation")?.message
			: null,
		jobLevel: error
			? error.details.find((d) => d.context.key === "jobLevel")?.message
			: null,
		newCustomerName: error
			? error.details.find((d) => d.context.key === "newCustomerName")?.message
			: null,
		iqTestApplicable: error
			? error.details.find((d) => d.context.key === "iqTestApplicable")?.message
			: null,
		positionType: error
			? error.details.find((d) => d.context.key === "positionType")?.message
			: null,
		selfService: error
			? error.details.find((d) => d.context.key === "selfService")?.message
			: null,
		mobileAccess: error
			? error.details.find((d) => d.context.key === "mobileAccess")?.message
			: null,
		laptopSystem: error
			? error.details.find((d) => d.context.key === "laptopSystem")?.message
			: null,
		backgroundVerification: error
			? error.details.find((d) => d.context.key === "backgroundVerification")
					?.message
			: null,
		workstationAdmin: error
			? error.details.find((d) => d.context.key === "workstationAdmin")?.message
			: null,
		mobileAdmin: error
			? error.details.find((d) => d.context.key === "mobileAdmin")?.message
			: null,
		dataCardAdmin: error
			? error.details.find((d) => d.context.key === "dataCardAdmin")?.message
			: null,
		visitingCardAdmin: error
			? error.details.find((d) => d.context.key === "visitingCardAdmin")
					?.message
			: null,
		recruiterName: error
			? error.details.find((d) => d.context.key === "recruiterName")?.message
			: null,
		offRoleCTC: error
			? error.details.find((d) => d.context.key === "offRoleCTC")?.message
			: null,
		highestQualification: error
			? error.details.find((d) => d.context.key === "highestQualification")
					?.message
			: null,
		ESICPFDeduction: error
			? error.details.find((d) => d.context.key === "ESICPFDeduction")?.message
			: null,
		fatherName: error
			? error.details.find((d) => d.context.key === "fatherName")?.message
			: null,
		paymentAccountNumber: error
			? error.details.find((d) => d.context.key === "paymentAccountNumber")
					?.message
			: null,
		paymentBankName: error
			? error.details.find((d) => d.context.key === "paymentBankName")?.message
			: null,
		paymentBankIfsc: error
			? error.details.find((d) => d.context.key === "paymentBankIfsc")?.message
			: null,
	};
	return errors;
};

const validateCompany = async (name) => {
	let isVerify = await db.companyMaster.findOne({
		where: { companyName: name },
		attributes: ["companyId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid company name", data: {} };
	}
};

const validateEmployeeType = async (name, isValidCompany) => {
	let isVerify = await db.employeeTypeMaster.findOne({
		where: { emptypename: name, companyId: isValidCompany?.data?.companyId },
		attributes: ["empTypeId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid employee type", data: {} };
	}
};

const validateProbation = async (name) => {
	let isVerify = await db.probationMaster.findOne({
		where: { probationName: name },
		attributes: ["probationId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid probation", data: {} };
	}
};

const validateManager = async (empCode) => {
	let isVerify = await db.employeeMaster.findOne({
		where: { empCode: empCode },
		attributes: ["id"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid manager", data: {} };
	}
};

const validateDesignation = async (name) => {
	let isVerify = await db.designationMaster.findOne({
		where: { name: name },
		attributes: ["designationId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid designation", data: {} };
	}
};

const validateFunctionalArea = async (name) => {
	let isVerify = await db.functionalAreaMaster.findOne({
		where: { functionalAreaName: name },
		attributes: ["functionalAreaId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid functional area", data: {} };
	}
};

const validateBU = async (name, isValidCompany) => {
	let isVerify = await db.buMaster.findOne({
		where: { buName: name },
		attributes: ["buId"],
	});
	if (isVerify) {
		const headAndHrData = await db.buMapping.findOne({
			where: { buId: isVerify.buId, companyId: isValidCompany.data.companyId },
			include: [
				{
					model: db.employeeMaster,
					attributes: ["id", "name"],
					as: "buHeadData",
				},
				{
					model: db.employeeMaster,
					attributes: ["id", "name"],
					as: "buhrData",
				},
			],
		});

		if (headAndHrData) {
			isVerify.buHead = headAndHrData.buHeadData.id;
			isVerify.buHR = headAndHrData.buhrData.id;
		}
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid BU", data: {} };
	}
};

const validateSBU = async (name) => {
	let isVerify = await db.sbuMaster.findOne({
		where: { sbuName: name },
		attributes: ["sbuId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid SBU", data: {} };
	}
};

const validateShift = async (name) => {
	if (name) {
		let isVerify = await db.shiftMaster.findOne({
			where: { shiftName: name },
			attributes: ["shiftId"],
		});
		if (isVerify) {
			return { status: true, message: "", data: isVerify };
		} else {
			return { status: false, message: "Invalid shift", data: {} };
		}
	} else {
		return { status: false, message: "", data: {} };
	}
};

const validateDepartment = async (name) => {
	let isVerify = await db.departmentMaster.findOne({
		where: { departmentName: name },
		attributes: ["departmentId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid department", data: {} };
	}
};

const validateAttendancePolicy = async (name) => {
	if (name) {
		let isVerify = await db.attendancePolicymaster.findOne({
			where: { policyName: name },
			attributes: ["attendancePolicyId"],
		});
		if (isVerify) {
			return { status: true, message: "", data: isVerify };
		} else {
			return { status: false, message: "Invalid attendance policy", data: {} };
		}
	} else {
		return { status: false, message: "", data: {} };
	}
};

const validateCompanyLocation = async (companyLocationCode, isValidCompany) => {
	let isVerify = await db.companyLocationMaster.findOne({
		where: {
			companyLocationCode: companyLocationCode,
			companyId: isValidCompany.data?.companyId,
		},
		attributes: ["companyLocationId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return {
			status: false,
			message: "Invalid company location.",
			data: {},
		};
	}
};

const validateWeekOff = async (name) => {
	if (name) {
		let isVerify = await db.weekOffMaster.findOne({
			where: { weekOffName: name },
			attributes: ["weekOffId"],
		});
		if (isVerify) {
			return { status: true, message: "", message: "", data: isVerify };
		} else {
			return { status: false, message: "Invalid week off", data: {} };
		}
	} else {
		return { status: false, message: "", data: {} };
	}
};

const validateNewCustomerName = async (name) => {
	if (name) {
		let isVerify = await db.newCustomerNameMaster.findOne({
			where: { newCustomerName: name },
			attributes: ["newCustomerNameId"],
		});
		if (isVerify) {
			return { status: true, message: "", message: "", data: isVerify };
		} else {
			return {
				status: false,
				message: "Invalid new customer id off",
				data: {},
			};
		}
	} else {
		return { status: false, message: "", data: {} };
	}
};

const validateJobLevel = async (isValidCompany, name) => {
	let isVerify = await db.jobLevelMapping.findOne({
		where: { companyId: isValidCompany.data.companyId },
		attributes: ["jobLevelId"],
		include: [{ model: db.jobLevelMaster, where: { jobLevelName: name } }],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return { status: false, message: "Invalid job level", data: {} };
	}
};

const validateDegree = async (name) => {
	let isVerify = await db.degreeMaster.findOne({
		where: { degreeName: name },
		attributes: ["degreeId"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return {
			status: false,
			message: "Invalid Highest qualification",
			data: {},
		};
	}
};

const validateBank = async (name) => {
	let isVerify = await db.bankMaster.findOne({
		where: { bankName: name },
		attributes: ["bankName"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return {
			status: false,
			message: "Invalid bank name",
			data: {},
		};
	}
};

const validateBankIfsc = async (name, bankIfsc) => {
	let isVerify = await db.bankMaster.findOne({
		where: { bankName: name, bankIfsc: bankIfsc },
		attributes: ["bankIfsc"],
	});
	if (isVerify) {
		return { status: true, message: "", data: isVerify };
	} else {
		return {
			status: false,
			message: "Invalid bank IFSC",
			data: {},
		};
	}
};

const validateEmployee = async (
	personalMobileNumber,
	companyEmail,
	personalEmail,
	officeMobileNumber,
) => {
	let query = {
		[Op.or]: [
			{ personalMobileNumber: personalMobileNumber },
			{ personalEmail: personalEmail },
		],
	};

	// Initialize an array for additional conditions
	const additionalConditions = [];

	// Add companyEmail condition if it's provided
	if (companyEmail && companyEmail.trim() !== "") {
		additionalConditions.push({ email: companyEmail });
	}

	// Add officeMobileNumber condition if it's provided
	if (officeMobileNumber && officeMobileNumber.trim() !== "") {
		additionalConditions.push({ officeMobileNumber: officeMobileNumber });
	}

	// If there are additional conditions, add them to the main query
	if (additionalConditions.length > 0) {
		query[Op.or] = [...query[Op.or], ...additionalConditions];
	}

	let isVerify = await db.employeeMaster.findOne({
		where: query,
		attributes: ["id", "personalEmail", "personalMobileNumber"],
	});
	if (isVerify) {
		if (
			isVerify.personalEmail === personalEmail ||
			isVerify.personalMobileNumber === personalMobileNumber
		) {
			return {
				status: false,
				message: "Employee personal email/mobile no. already exists.",
				data: {},
			};
		} else {
			return {
				status: false,
				message:
					"Employee company email or official mobile no. already exists.",
				data: {},
			};
		}
	} else {
		isVerify = await db.employeeStagingMaster.findOne({
			where: query,
			attributes: ["id", "personalEmail", "personalMobileNumber"],
		});
		if (isVerify) {
			if (
				isVerify.personalEmail === personalEmail ||
				isVerify.personalMobileNumber === personalMobileNumber
			) {
				return {
					status: false,
					message: "Employee personal email/mobile no. already exists.",
					data: {},
				};
			} else {
				return {
					status: false,
					message:
						"Employee company email or official mobile no. already exists.",
					data: {},
				};
			}
		} else {
			return { status: true, message: "", data: {} };
		}
	}
};

// Function to convert Excel serial date to JS Date
const convertExcelDate = (serial) => {
	const date = new Date((serial - 25569) * 86400 * 1000);
	return moment(date).format("YYYY-MM-DD");
};

const replaceNAWithNull = (value) => {
	return value === "NA" ||
		value === undefined ||
		value === "" ||
		value === null ||
		value === " "
		? null
		: value; // Replace 'NA' with ''
};

const replaceYesOrNoWithNumber = (value) => {
	if (value === "Yes") {
		return 1;
	} else {
		return 0;
	}
};


export default new MasterController();
