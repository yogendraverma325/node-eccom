import respHelper from "../../../helper/respHelper.js";
import importHelper from "./importHelper.js";
import db from "../../../config/db.config.js";
import validator from "../../../helper/validator.js";
import xlsx from "json-as-xlsx";
import pkg from "xlsx";
import { Op, where } from "sequelize";
import moment from "moment";
import { raw } from "mysql2";
import eventEmitter from "../../../services/eventService.js";
import constant from "../../../constant/messages.js";

const financialMonth = {
	1: "January",
	2: "February",
	3: "March",
	4: "April",
	5: "May",
	6: "Jun",
	7: "July",
	8: "August",
	9: "September",
	10: "October",
	11: "November",
	12: "December",
};

const maritalStatusOptions = {
	1: 'Married',
    2: 'Single',
    3: 'Divorced',
    4: 'Separated',
    5: 'Widowed',
    6: 'Others'
}
class ImportController {
	async uploadExcelFile(req, res) {
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			}

			let availableServices = [
				"LOP",
				"TDS Deduction",
				"Extra Payment",
				"Standard Deduction",
				"Gross-Pay",
				"Pay Slip Release",
				"Delete TDS Deduction",
				"Delete LOP",
				"Delete Extra Payment",
				"Delete Standard Deduction",
				"Attendance Assignment",
				"Arrears",
				"Employment Details",
				"Employee Data"
			];
			//operationType
			if (!availableServices.includes(req.body.uploadType)) {
				return respHelper(res, {
					status: 400,
					msg: "Service is comming soon : " + req.body.uploadType,
				});
			}
			if (!req.body.operationType) {
				/// OpreationType 1 OR 2
				return respHelper(res, {
					status: 400,
					msg: "Operation not defined : ",
				});
			}

			// console.log("Operation Type :: ",req.body.uploadType);
			// return;
			let importInfoObject = {
				createdBy: req.userData.id,
				importType: req.body.uploadType,
				importTableName: req.body.uploadType,
				buId: req.userData.buId,
				sbuId: req.userData.sbuId,
				companyId: req.userData.companyId,
			};
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			var OperationType = req.body.operationType;
			var FILEDATA = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);

			if (["LOP", "Delete LOP"].includes(req.body.uploadType)) {
				await lopUpload(req, res, OperationType, importInfoObject);
			} else if (
				["TDS Deduction", "Delete TDS Deduction"].includes(req.body.uploadType)
			) {
				await tdsUpload(req, res, OperationType, importInfoObject);
			} else if (
				["Extra Payment", "Delete Extra Payment"].includes(req.body.uploadType)
			) {
				await extraPaymentUpload(req, res, OperationType, importInfoObject);
			} else if (
				["Standard Deduction", "Delete Standard Deduction"].includes(
					req.body.uploadType,
				)
			) {
				await extraDeductionsUpload(req, res, OperationType, importInfoObject);
			} else if (req.body.uploadType == "Gross-Pay") {
				await uploadCTC(req, res, FILEDATA, importInfoObject);
			} else if (req.body.uploadType == "Pay Slip Release") {
				await releasePaySlip(req, res, FILEDATA, importInfoObject);
			} else if (req.body.uploadType == "Attendance Assignment") {
				await attendanceAssignment(req, res, FILEDATA, importInfoObject);
			} else if (req.body.uploadType == "Arrears") {
				await arrearsUpload(req, res, OperationType, importInfoObject);
			} else if (req.body.uploadType == "Employment Details") {
				await employmentDetails(req, res, FILEDATA, importInfoObject);
			} else if (req.body.uploadType == "Employee Data") {
				await employeeData(req, res, FILEDATA, importInfoObject);
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getImportInfoList(req, res) {
		try {
			const { month, year } = req.query;
			const querySequence = req.userData.role_id == 2 ? 1 : 2;
			let queryForImportDetails = await importHelper.query(querySequence, {
				year: year,
				month: Number(month) + 1,
				companyId: req.userData.companyId,
				buId: req.userData.buId,
				sbuId: req.userData.sbuId,
				isActive: req.userData.isActive,
			});
			console.log(queryForImportDetails);
			let importInfoList = await db.sequelize.query(queryForImportDetails);
			return respHelper(res, {
				status: 200,
				data: importInfoList[0],
				msg: "Data Fetched Successfully.",
			});
		} catch (e) {
			console.log(e);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong",
			});
		}
	}

	async exportImportedSheets(req, res) {
		try {
			const { reportType, countType, importAutoId, exportSheetAutoId } =
				req.query;
			const sheetName = {
				EXTRA_DEDUCTIONS: "Standard Deduction",
				EXTRA_PAYMENT: "Extra Payment",
				TDS_DEDUCTION: "TDS Deduction",
				LOP: "LOP",
				GROSS_PAY: "Gross-Pay",
				PAYSLIP: "Pay Slip Release",
				DELETE_EXTRA_DEDUCTIONS: "Delete Standard Deduction",
				DELETE_EXTRA_PAYMENT: "Delete Extra Payment",
				DELETE_TDS_DEDUCTION: "Delete TDS Deduction",
				DELETE_LOP: "Delete LOP",
				ATTENDANCE_ASSIGNMENT: "Attendance Assignment",
				ARREARS: "Arrears",
				EMPLOYMENT_DETAILS: "Employment Details",
			};
			const getKeyByValue = async (value) => {
				const result = Object.keys(sheetName).find(
					(key) => sheetName[key] == value,
				);
				return result;
			};
			let sheetVal = await getKeyByValue(exportSheetAutoId);
			if (!exportSheetAutoId) {
				return res.status(400).json({
					status: 400,
					data: [],
					msg: "Sample Sheet Not Available",
				});
			}
			let employeeData = [];
			let importStatus = ["1", "2"].includes(countType) ? [countType] : [1, 2];
			let sheetDataType;
			switch (countType) {
				case "0":
					sheetDataType = "All";
					break;
				case "1":
					sheetDataType = "Success";
					break;
				case "2":
					sheetDataType = "Error";
					break;
				default:
					break;
			}

			let exportData = await db.ImportData.findAll({
				where: {
					importAutoId: importAutoId,
					importStatus: { [Op.in]: importStatus },
				},
				raw: true,
			});
			for (const element of exportData) {
				let mergeObject = {
					...JSON.parse(element.importedRow),
					"Upload Remark": element.importStatusDesc,
				};
				employeeData.push(mergeObject);
			}
			const timestamp = Date.now();
			// Handle scenarios based on conditions
			if (importAutoId) {
				const jsonData = employeeData;
				// Extract columns dynamically from JSON keys
				const columns = Object.keys(jsonData[0]).map((key) => ({
					label: key,
					value: key,
				}));

				const data = [
					{
						sheet: "Employee",
						columns: columns,
						content: jsonData, // Use the JSON array as content
					},
				];

				const settings = {
					fileName: `Total_${Date.now()}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${sheetVal}_${sheetDataType}_${moment(timestamp).format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
				);
				return res.end(report);
			} else {
				return res.status(404).json({
					message: "No active columns found for the given sheet",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			return res.status(500).json({
				message: "An error occurred while fetching data",
			});
		}
	}

	// create api for generate notice period history (for existing users)
	async generateNoticePeriodHistory(req, res) {
		try {
		    // fetch notice period id from employee master table
			const users = await db.employeeMaster.findAll(
				{ where: { 
					"noticePeriodAutoId": { [Op.not]: null },
				    "companyId": { [Op.not]: null },
					"id": { [Op.ne]: 1 } 
				},
				attributes: ["id", "companyId", "noticePeriodAutoId", "dateOfJoining"],
				include: [ 
					{ 
						model: db.NoticePeriodEmploymentHistory,
						as: "noticePeriodHistories",
						required: false,
						where: { employeeId: { [Op.not]: null } }
					}
				],
				having: db.Sequelize.literal('`noticePeriodHistories`.`employeeId` IS NULL') 
			});
			
			if(users.length > 0) {
				await db.NoticePeriodEmploymentHistory.bulkCreate(users);
				return respHelper(res, {
					status: 200,
					msg: "History generated successfully.",
					data: users.length
				});
			}
			else {
				return respHelper(res, {
					status: 404,
					msg: "No data found"
				})
			}
			
		}
		catch(error) {
			console.log(error);
			return respHelper(res, {
				status: 500
			});
		}
	}
}

export default new ImportController();

async function uploadCTC(req, res, FILEDATA, importParams) {
	try {
		if (!req.file) {
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}

		// get financial year
		let financialYearDetails = await importHelper.getFinancialYear();

		if (!financialYearDetails) {
			return respHelper(res, {
				status: 500,
				msg: "Financial Year not found.",
			});
		}
		var PackageDetails = FILEDATA;
		if (!isNaN(PackageDetails[0]["Effective Date"])) {
			console.log(
				importHelper.getFromattedDate(PackageDetails[0]["Effective Date"]),
			);
		}

		let importId = await createImportDetails(importParams);
		let errorArray = [],
			successArray = [];
		for (const employee of PackageDetails) {
			if (!employee["Salary Structure"]) continue;
			let structureDetails = await db.salaryStructure.findAll({
				where: {
					salaryStructureName: employee["Salary Structure"].trim(),
				},
				raw: true,
				attributes: ["salaryStructureName", "salaryStructureAutoId"],
				include: [
					{
						model: db.salarystructurecomponentmapping,
						attributes: [
							"salaryComponentAutoId",
							"salaryStructureAutoId",
							"salaryStructurecomponentmappingAutoId",
						],
						as: "structureMappingDetails",
						include: [
							{
								model: db.salaryComponent,
								attributes: [
									"salaryComponentCode",
									"salaryComponentAlias",
									"includeInPackage",
									"salaryComponentEarningType",
								],
								as: "componentDetails",
							},
							{
								model: db.salarycomponentmapping,
								where: {
									salaryComponentElementAutoId: 21,
								},

								attributes: {
									exclude: [
										"createdAt",
										"createdBy",
										"updatedBy",
										"updatedAt",
										"isActive",
									],
								},
							},
						],
					},
				],
			});
			if (structureDetails.length == 0) {
				await db.ImportInfo.update(
					{
						importStatusDesc:
							"Salary Structure with name " +
							employee["Salary Structure"].trim() +
							" not fount",
						importStatus: 2,
					},
					{ where: { importAutoId: importId } },
				);
			}
			const error = await validator.createDynamicPayPackageSchema(
				structureDetails,
				employee,
			);

			if (error) {
				errorArray.push({
					importedRow: JSON.stringify(employee),
					importAutoId: importId,
					importStatus: 2,
					createdBy: req.userData.id,
					importStatusDesc: error.details[0].message,
				});
				continue;
			}

			let employeeDetails = await db.employeeMaster.findOne({
				where: {
					empCode: employee["Employee ID"],
					isActive: 1,
				},
				raw: true,
				attributes: ["id", "name", "dateOfJoining"],
			});

			employee["Effective Date"] = !isNaN(employee["Effective Date"])
				? importHelper.getFromattedDate(employee["Effective Date"])
				: employee["Effective Date"];
			if (!employeeDetails) {
				console.log(
					"Employee not found or inactive" +
						" for empId : " +
						employee["Employee ID"],
				);
				errorArray.push({
					importedRow: JSON.stringify(employee),
					importAutoId: importId,
					importStatus: 2,
					createdBy: req.userData.id,
					importStatusDesc: "Employee not found",
				});
				continue;
			}

			if (structureDetails.length == 0) {
				return respHelper(res, {
					status: 500,
					msg: "Structure not found.",
				});
			}
			//////////////Pay-Package Uploading///////////
			var ctcFromComponent = 0;
			let includedComponent = [];
			for (const element of structureDetails) {
				let includeInPackage =
					["OTC", "Earning", "Balancing"].includes(
						element[
							"structureMappingDetails.componentDetails.salaryComponentEarningType"
						],
					) &&
					element[
						"structureMappingDetails.salarycomponentmapping.elementValue"
					] == 0
						? 1
						: 0;
				let componentName = element[
					"structureMappingDetails.componentDetails.salaryComponentAlias"
				]
					? element[
							"structureMappingDetails.componentDetails.salaryComponentAlias"
						]
					: element[
							"structureMappingDetails.componentDetails.salaryComponentCode"
						];

				if (
					includeInPackage == 1 &&
					employee[componentName] &&
					!includedComponent.includes(componentName)
				) {
					ctcFromComponent = ctcFromComponent + employee[componentName];
					includedComponent.push(componentName);
				}
			}
			// console.log(
			// 	employee["Employee ID"] + "--" + employee["CTC"],
			// 	ctcFromComponent,
			// );

			if (employee["CTC"] == ctcFromComponent) {
				////////////////Match the ctc///////
				//console.log('CTC Matched',employee['Name']);
				let existingPackage = await db.payPackage.findOne({
					where: { EmployeeId: employeeDetails.id },
					order: [["payPackageAutoId", "DESC"]],
					raw: true,
				});

				const [day, month, year] = employee["Effective Date"]
					.split("-")
					.map(Number);
				if (
					existingPackage &&
					new Date(existingPackage.payPackageEffectiveDate).setHours(0, 0, 0) >
						new Date(year, month - 1, day).setHours(0, 0, 0)
				) {
					errorArray.push({
						importedRow: JSON.stringify(employee),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc:
							"The current effective date can not be smaller than the last effective date.",
					});
					continue;
				} else if (
					employeeDetails &&
					new Date(employeeDetails.dateOfJoining).setHours(0, 0, 0) >
						new Date(year, month - 1, day).setHours(0, 0, 0)
				) {
					errorArray.push({
						importedRow: JSON.stringify(employee),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc:
							"Current Effective-Date can not be less than employee joining date",
					});
					continue;
				} else {
					let packageInserted = await db.payPackage.create(
						{
							EmployeeId: employeeDetails.id,
							payPackageFinancialYear: financialYearDetails?.financialYearName,
							financialYearId: financialYearDetails?.financialYearId,
							payPackageEffectiveDate: importHelper.formatDate(
								year,
								month,
								day,
							), //new Date(year, month - 1, day),
							payPackageMonthlyCTC: employee["CTC"],
							payPackageSalaryStructure:
								structureDetails[0].salaryStructureName, // employee["Salary Structure"],
							payPackageTotalCTC: employee["CTC"],
							payPackageType: "Monthly",
							salaryStructureAutoId: structureDetails[0].salaryStructureAutoId,
							createdBy: req.userData.id,
							createdAt: new Date(),
							isActive: 1,
						},
						{ raw: true },
					);

					if (existingPackage) {
						await db.payPackage.update(
							{ isActive: 0 },
							{
								where: { payPackageAutoId: existingPackage.payPackageAutoId },
							},
						);
					}

					for (const salaryComponent of structureDetails) {
						let componentName = salaryComponent[
							"structureMappingDetails.componentDetails.salaryComponentAlias"
						]
							? salaryComponent[
									"structureMappingDetails.componentDetails.salaryComponentAlias"
								]
							: salaryComponent[
									"structureMappingDetails.componentDetails.salaryComponentCode"
								];

						let exisingPayElement = await db.payElements.findAll({
							where: {
								EmployeeId: employee["Employee ID"],
								payPackageAutoId: packageInserted.dataValues.payPackageAutoId,
								salaryComponentAutoId:
									salaryComponent[
										"structureMappingDetails.componentDetails.salaryComponentAutoId"
									],
							},
						});
						if (exisingPayElement.length == 0 && employee[componentName] > 0) {
							await db.payElements.create({
								EmployeeId: employeeDetails.id,
								salaryComponentAutoId:
									salaryComponent[
										"structureMappingDetails.componentDetails.salaryComponentAutoId"
									],
								payPackageAutoId: packageInserted.dataValues.payPackageAutoId,
								payElementAmount: employee[componentName],
								payElementEffectiveFrom: importHelper.formatDate(
									year,
									month,
									day,
								),
								payElementEffectiveTo: importHelper.formatDate(
									year,
									month,
									day,
								),
								createdBy: req.userData.id,
								createdAt: new Date(),
								isActive: 1,
							});
							//console.log(insertedNewElement);
						}
					}
					successArray.push({
						importedRow: JSON.stringify(employee),
						importAutoId: importId,
						importStatus: 1,
						createdBy: req.userData.id,
						importStatusDesc: "CTC Uploaded Successfully",
					});
				}
			} else {
				errorArray.push({
					importedRow: JSON.stringify(employee),
					importAutoId: importId,
					importStatus: 2,
					createdBy: req.userData.id,
					importStatusDesc:
						"Uploaded CTC Rs." +
						employee["CTC"] +
						" is not matched with component calculated CTC Rs." +
						ctcFromComponent,
				});
			}
		}

		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);

		return respHelper(res, {
			status: 200,
			data: {
				SuccessRecord: successArray.length,
				ErrorRecord: errorArray.length,
			},
			msg: "CTC Uploaded Successfully",
		});
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}

async function extraPaymentUpload(req, res, OperationType, importParams) {
	try {
		if (!req.file) {
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}
		let isActive = req.query.isActive ? parseInt(req.query.isActive) : 1;
		///////////////If File is provided by the users//////////////////
		const workbookEmployee = pkg.readFile(req.file.path);
		const sheetNameEmployee = workbookEmployee.SheetNames[0];
		var tdsDetails = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);
		if (
			(!tdsDetails[0]["Employee ID"] ||
				!tdsDetails[0]["Effective Month"] ||
				!tdsDetails[0]["Amount"] ||
				!tdsDetails[0]["Category"]) &&
			OperationType == 1
		) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}
		if (
			(!tdsDetails[0]["Employee ID"] ||
				!tdsDetails[0]["Effective Month"] ||
				!tdsDetails[0]["Category"]) &&
			OperationType == 2
		) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}
		let importId = await createImportDetails(importParams);

		var errorArray = [],
			successArray = [];
		for (const employeeExtraPayment of tdsDetails) {
			if (employeeExtraPayment["Employee ID"]) {
				// console.log(employeeExtraPayment);
				let employeeDetais = await db.employeeMaster.findOne({
					where: {
						empCode: employeeExtraPayment["Employee ID"],
						isActive: isActive,
					},
					raw: true,
					attributes: ["empCode", "id"],
				});

				if (!employeeDetais) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraPayment),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Employee Not Exists or Acive Anymore.",
					});
					continue;
				}
				let qeury = {
					payMonth: employeeExtraPayment["Effective Month"],
					EmployeeId: employeeDetais.id,
					payStatus: { [Op.in]: [1, 2, 3, 6, 7, 8, 9] },
				};
				let salaryProcessingStatus = await db.payProcessDetails.findOne({
					where: qeury,
					raw: true,
					attributes: ["payProcessDetailAutoId"],
				});
				if (salaryProcessingStatus) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraPayment),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Salary already processed.",
					});
					continue;
				}

				let extraPaymentCategory = await db.CompensationCategoryMaster.findOne({
					where: { name: employeeExtraPayment["Category"] },
					raw: true,
					attribute: ["compensationCategoryId", "name"],
				});

				// console.log(extraPaymentCategory);
				// return;
				if (!extraPaymentCategory) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraPayment),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc:
							"Invalid Category Name " +
							"(" +
							employeeExtraPayment["Category"] +
							")",
					});
					continue;
				}

				let extraPayment = {
					EmployeeId: employeeDetais.id,
					paymentAmount: employeeExtraPayment["Amount"],
					paymentMonth: employeeExtraPayment["Effective Month"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeTds['TDS Month (YYYY-MM)'])),
					category: employeeExtraPayment["Category"],
					empCode: employeeExtraPayment["Employee ID"],
					category: employeeExtraPayment["Category"],
					paymentCategoryId: extraPaymentCategory.compensationCategoryId,
					// delete: employeeExtraPayment["Delete"],
				};
				const { error } = await validator.extraPayment.validate(extraPayment);
				if (error && OperationType == 1) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraPayment),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: error.details[0].message,
					});
				} else {
					let existTDSDetails = await db.extraPayment.findOne({
						where: {
							EmployeeId: extraPayment.EmployeeId,
							paymentMonth: extraPayment.paymentMonth,
							category: extraPayment.category,
						},
						attribute: ["extraPaymentAutoId"],
						raw: true,
					});

					if (!existTDSDetails && OperationType == 2) {
						errorArray.push({
							importedRow: JSON.stringify(employeeExtraPayment),
							importAutoId: importId,
							importStatus: 2,
							createdBy: req.userData.id,
							importStatusDesc: "Data is  not available to delete.",
						});
						continue;
					}

					if (existTDSDetails) {
						if (OperationType == 2) {
							await db.extraPayment.destroy({
								where: {
									extraPaymentAutoId: existTDSDetails.extraPaymentAutoId,
								},
							});
							extraPayment["ACTION_TYPE"] = "DELETE";
							console.log("Extra Payment is getting delete :: ");
						} else {
							extraPayment["updatedBy"] = req.userData.id;
							extraPayment["updatedAt"] = new Date();

							await db.extraPayment.update(extraPayment, {
								where: {
									extraPaymentAutoId: existTDSDetails.extraPaymentAutoId,
								},
							});
							extraPayment["ACTION_TYPE"] = "UPDATE";
						}
					} else {
						extraPayment["createdBy"] = req.userData.id;
						extraPayment["createdAt"] = new Date();
						await db.extraPayment.create(extraPayment);
						extraPayment["ACTION_TYPE"] = "CREATE";
					}
					// successArray.push(extraPayment);
					successArray.push({
						importedRow: JSON.stringify(employeeExtraPayment),
						importAutoId: importId,
						importStatus: 1,
						createdBy: req.userData.id,
						importStatusDesc: ["CREATE", "UPDATE"].includes(
							extraPayment["ACTION_TYPE"],
						)
							? "Payment Uploaded Successfully."
							: "Payment Deleted Successfully.",
					});
				}
			}
		}

		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);

		return respHelper(res, {
			status: 200,
			data: {
				SuccessRecord: successArray.length,
				ErrorRecord: errorArray.length,
			},
			msg: "Payment Uploaded Successfully.",
		});
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}

async function lopUpload(req, res, OperationType, importParams) {
	try {
		if (!req.file) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}
		let isActive = req.query.isActive ? parseInt(req.query.isActive) : 1;
		///////////////If File is provided by the users//////////////////
		const workbookEmployee = pkg.readFile(req.file.path);
		const sheetNameEmployee = workbookEmployee.SheetNames[0];
		var lopDetails = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);
		var errorArray = [],
			successArray = [];
		if (
			(!lopDetails[0]["Employee ID"] ||
				!lopDetails[0]["LOP Month (YYYY-MM)"]) &&
			OperationType == 2
		) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		if (
			(!lopDetails[0]["Employee ID"] ||
				!lopDetails[0]["LOP DAYS"] ||
				!lopDetails[0]["LOP Month (YYYY-MM)"]) &&
			OperationType == 1
		) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		let importId = await createImportDetails(importParams);
		for (const employeeTds of lopDetails) {
			if (employeeTds["Employee ID"]) {
				let employeeDetais = await db.employeeMaster.findOne({
					where: { empCode: employeeTds["Employee ID"], isActive: isActive },
					raw: true,
					attributes: ["empCode", "id"],
				});

				if (!employeeDetais) {
					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Employee Not Exists or Acive Anymore.",
					});
					continue;
				}
				let qeury = {
					payMonth: employeeTds["LOP Month (YYYY-MM)"],
					EmployeeId: employeeDetais.id,
					payStatus: { [Op.in]: [1, 2, 3, 6, 7, 8, 9] },
				};
				let salaryProcessingStatus = await db.payProcessDetails.findOne({
					where: qeury,
					raw: true,
					attributes: ["payProcessDetailAutoId"],
				});
				if (salaryProcessingStatus) {
					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Salary already processed.",
					});
					continue;
				}
				let lopDeductions = {
					EmployeeId: employeeDetais.id,
					lopDays: employeeTds["LOP DAYS"],
					lopMonth: employeeTds["LOP Month (YYYY-MM)"],
					empCode: employeeTds["Employee ID"],
				};
				const { error } =
					await validator.lopValidateSchama.validate(lopDeductions);
				if (error && OperationType == 1) {
					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: error.details[0].message,
					});
				} else {
					let existLOPDetails = await db.lopDeductions.findOne({
						where: {
							empCode: lopDeductions.empCode,
							lopMonth: lopDeductions.lopMonth,
						},
						attributes: ["lopAutoId"],
						raw: true,
					});

					if (!existLOPDetails && OperationType == 2) {
						errorArray.push({
							importedRow: JSON.stringify(employeeTds),
							importAutoId: importId,
							importStatus: 2,
							createdBy: req.userData.id,
							importStatusDesc: "Data is  not available to delete.",
						});
						continue;
					}
					if (existLOPDetails) {
						if (OperationType == 2) {
							await db.lopDeductions.destroy({
								where: {
									lopAutoId: existLOPDetails.lopAutoId,
								},
							});
							lopDeductions["ACTION_TYPE"] = "DELETE";
						} else {
							lopDeductions["updatedBy"] = req.userData.id;
							lopDeductions["updatedAt"] = new Date();

							await db.lopDeductions.update(lopDeductions, {
								where: {
									lopAutoId: existLOPDetails.lopAutoId,
								},
							});
							lopDeductions["ACTION_TYPE"] = "UPDATE";
						}
					} else {
						lopDeductions["createdBy"] = req.userData.id;
						lopDeductions["createdAt"] = new Date();
						await db.lopDeductions.create(lopDeductions);
						lopDeductions["ACTION_TYPE"] = "CREATE";
					}
					successArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 1,
						createdBy: req.userData.id,
						importStatusDesc: ["CREATE", "UPDATE"].includes(
							lopDeductions["ACTION_TYPE"],
						)
							? "Lop Uploaded Successfully."
							: "Lop Deleted Successfully.",
					});
					//successArray.push(lopDeductions);
				}
			}
		}

		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);

		return respHelper(res, {
			status: 200,
			data: {
				SuccessRecord: successArray.length,
				ErrorRecord: errorArray.length,
			},
			msg: "Lop Uploaded Successfully.",
		});
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}

async function extraDeductionsUpload(req, res, OperationType, importParams) {
	var errorArray = [],
		successArray = [];
	try {
		if (!req.file) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}
		let isActive = req.query.isActive ? parseInt(req.query.isActive) : 1;
		///////////////If File is provided by the users//////////////////
		const workbookEmployee = pkg.readFile(req.file.path);
		const sheetNameEmployee = workbookEmployee.SheetNames[0];
		var extraDeductonsDetails = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);

		if (
			(!extraDeductonsDetails[0]["Number Of Deductions"] ||
				!extraDeductonsDetails[0]["Start Month"] ||
				!extraDeductonsDetails[0]["Employee ID"] ||
				!extraDeductonsDetails[0]["Advance Category"] ||
				!extraDeductonsDetails[0]["Total Amount/Percent/Hours/Days"]) &&
			OperationType == 1
		) {
			// let query = await importHelper.query(4,{importId:importId});
			//    await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		if (
			(!extraDeductonsDetails[0]["Number Of Deductions"] ||
				!extraDeductonsDetails[0]["Start Month"] ||
				!extraDeductonsDetails[0]["Employee ID"] ||
				!extraDeductonsDetails[0]["Advance Category"]) &&
			OperationType == 2
		) {
			// let query = await importHelper.query(4,{importId:importId});
			//    await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		let importId = await createImportDetails(importParams);
		for (const employeeExtraDeduction of extraDeductonsDetails) {
			if (employeeExtraDeduction["Employee ID"]) {
				const { error } = await validator.extraDeductionSchema.validate(
					employeeExtraDeduction,
				);
				if (error) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraDeduction),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: error.details[0].message,
					});
					continue;
				}

				let extraDeductionCategory =
					await db.CompensationCategoryMaster.findOne({
						where: { name: employeeExtraDeduction["Advance Category"] },
						raw: true,
						attribute: ["compensationCategoryId", "name"],
					});

				if (!extraDeductionCategory) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraDeduction),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc:
							"Invalid Category Name " +
							"(" +
							employeeExtraDeduction["Advance Category"] +
							")",
					});
					continue;
				}

				let employeeDetais = await db.employeeMaster.findOne({
					where: {
						empCode: employeeExtraDeduction["Employee ID"],
						isActive: isActive,
					},
					raw: true,
					attributes: ["empCode", "id"],
				});

				if (!employeeDetais) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraDeduction),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Employee Not Exists or Acive Anymore.",
					});

					continue;
				}

				let qeury = {
					payMonth: employeeExtraDeduction["Start Month"],
					EmployeeId: employeeDetais.id,
					payStatus: { [Op.in]: [1, 2, 3, 6, 7, 8, 9] },
				};
				let salaryProcessingStatus = await db.payProcessDetails.findOne({
					where: qeury,
					raw: true,
					attributes: ["payProcessDetailAutoId"],
				});
				if (salaryProcessingStatus) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraDeduction),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Salary already processed.",
					});
					continue;
				}

				let extraDeductions = {
					EmployeeId: employeeDetais.id,
					empCode: employeeExtraDeduction["Employee ID"],
					deductionCategory: employeeExtraDeduction["Advance Category"],
					deductionName: employeeExtraDeduction["Advance Name"],
					deductionAmount:
						employeeExtraDeduction["Total Amount/Percent/Hours/Days"],
					startMonth: employeeExtraDeduction["Start Month"],
					numberOfDeductions: employeeExtraDeduction["Number Of Deductions"],
					status: employeeExtraDeduction["Status (Open/Completed)"],
					endMonth: employeeExtraDeduction["End Month"],
					currencyCode: employeeExtraDeduction["Currency ISO Code"],
					changeReason: employeeExtraDeduction["Reason for status change"],
					deductionCategoryId: extraDeductionCategory.compensationCategoryId,
				};

				let existExtraDeductionDetails = await db.extraDeduction.findOne({
					where: {
						empCode: extraDeductions.empCode,
						deductionCategory: extraDeductions.deductionCategory,
						deductionName: extraDeductions.deductionName,
						startMonth: extraDeductions.startMonth,
					},
					attributes: ["extraDeductionsAutoId"],
					raw: true,
				});

				if (OperationType == 2 && !existExtraDeductionDetails) {
					errorArray.push({
						importedRow: JSON.stringify(employeeExtraDeduction),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Data is  not available to delete.",
					});

					continue;
				}

				if (existExtraDeductionDetails) {
					if (OperationType == 2) {
						await db.extraDeduction.destroy({
							where: {
								extraDeductionsAutoId:
									existExtraDeductionDetails.extraDeductionsAutoId,
							},
						});
						extraDeductions["ACTION_TYPE"] = "DELETE";
					} else {
						extraDeductions["updatedBy"] = req.userData.id;
						extraDeductions["updatedAt"] = new Date();

						await db.extraDeduction.update(extraDeductions, {
							where: {
								extraDeductionsAutoId:
									existExtraDeductionDetails.extraDeductionsAutoId,
							},
						});
						extraDeductions["ACTION_TYPE"] = "UPDATE";
					}
				} else {
					extraDeductions["createdBy"] = req.userData.id;
					extraDeductions["createdAt"] = new Date();
					await db.extraDeduction.create(extraDeductions);
					extraDeductions["ACTION_TYPE"] = "CREATE";
				}
				// successArray.push(extraDeductions);
				successArray.push({
					importedRow: JSON.stringify(employeeExtraDeduction),
					importAutoId: importId,
					importStatus: 1,
					createdBy: req.userData.id,
					importStatusDesc: ["CREATE", "UPDATE"].includes(
						extraDeductions["ACTION_TYPE"],
					)
						? "Extra Deductions Uploaded Successfully."
						: "Extra Deductions Deleted Successfully.",
				});
			}
		}

		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);

		return respHelper(res, {
			status: 200,
			data: {
				SuccessRecord: successArray.length,
				ErrorRecord: errorArray.length,
			},
			msg: "Extra Deductions Uploaded Successfully.",
		});
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}
async function tdsUpload(req, res, OperationType, importParams) {
	try {
		if (!req.file) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}
		let isActive = req.query.isActive ? parseInt(req.query.isActive) : 1;

		///////////////If File is provided by the users//////////////////
		const workbookEmployee = pkg.readFile(req.file.path);
		const sheetNameEmployee = workbookEmployee.SheetNames[0];
		var tdsDetails = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);
		//

		if (
			(!tdsDetails[0]["Employee ID"] ||
				!tdsDetails[0]["TDS Deductions"] ||
				!tdsDetails[0]["TDS Month (YYYY-MM)"]) &&
			OperationType == 1
		) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		if (
			(!tdsDetails[0]["Employee ID"] ||
				!tdsDetails[0]["TDS Month (YYYY-MM)"]) &&
			OperationType == 2
		) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}
		let importId = await createImportDetails(importParams);
		var errorArray = [],
			successArray = [];
		for (const employeeTds of tdsDetails) {
			if (employeeTds["Employee ID"]) {
				let employeeDetais = await db.employeeMaster.findOne({
					where: { empCode: employeeTds["Employee ID"], isActive: isActive },
					raw: true,
					attributes: ["empCode", "id"],
				});

				if (!employeeDetais) {
					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Employee Not Exists or Acive Anymore.",
					});
					continue;
				}

				let qeury = {
					payMonth: employeeTds["TDS Month (YYYY-MM)"],
					EmployeeId: employeeDetais.id,
					payStatus: { [Op.in]: [1, 2, 3, 6, 7, 8, 9] },
				};
				let salaryProcessingStatus = await db.payProcessDetails.findOne({
					where: qeury,
					raw: true,
					attributes: ["payProcessDetailAutoId"],
				});
				if (salaryProcessingStatus) {
					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Salary already processed.",
					});
					continue;
				}

				let tdsDeductions = {
					EmployeeId: employeeDetais.id,
					tdsAmount: employeeTds["TDS Deductions"],
					tdsMonth: employeeTds["TDS Month (YYYY-MM)"],
					empCode: employeeTds["Employee ID"],
				};
				const { error } =
					await validator.tdsDeductionsSchema.validate(tdsDeductions);
				if (error && OperationType == 1) {
					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: error.details[0].message,
					});
				} else {
					let existTDSDetails = await db.tdsDeductions.findOne({
						where: {
							EmployeeId: tdsDeductions.EmployeeId,
							tdsMonth: tdsDeductions.tdsMonth,
						},
						attributes: ["tdsDeductionAutoId"],
						raw: true,
					});

					if (OperationType == 2 && !existTDSDetails) {
						errorArray.push({
							importedRow: JSON.stringify(employeeTds),
							importAutoId: importId,
							importStatus: 2,
							createdBy: req.userData.id,
							importStatusDesc: "Data is  not available to delete.",
						});
						continue;
					}

					if (existTDSDetails) {
						if (OperationType == 2) {
							await db.tdsDeductions.destroy({
								where: {
									tdsDeductionAutoId: existTDSDetails.tdsDeductionAutoId,
								},
							});
							tdsDeductions["ACTION_TYPE"] = "DELETE";
						} else {
							tdsDeductions["updatedBy"] = req.userData.id;
							tdsDeductions["updatedAt"] = new Date();

							await db.tdsDeductions.update(tdsDeductions, {
								where: {
									tdsDeductionAutoId: existTDSDetails.tdsDeductionAutoId,
								},
							});
							tdsDeductions["ACTION_TYPE"] = "UPDATE";
						}
					} else {
						tdsDeductions["createdBy"] = req.userData.id;
						tdsDeductions["createdAt"] = new Date();
						await db.tdsDeductions.create(tdsDeductions);
						tdsDeductions["ACTION_TYPE"] = "CREATE";
					}
					//successArray.push(tdsDeductions);
					successArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 1,
						createdBy: req.userData.id,
						importStatusDesc: ["CREATE", "UPDATE"].includes(
							tdsDeductions["ACTION_TYPE"],
						)
							? "TDS Uploaded Successfully."
							: "TDS Deleted Successfully.",
					});
				}
			}
		}

		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);

		return respHelper(res, {
			status: 200,
			data: {
				SuccessRecord: successArray.length,
				ErrorRecord: errorArray.length,
			},
			msg: "TDS Uploaded Successfully.",
		});
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}

async function releasePaySlip(req, res, FILEDATA, importParams) {
	try {
		if (!req.file) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}

		console.log("PaySlip Release:::: ");
		console.log(FILEDATA);
		if (!FILEDATA[0]["Pay Month(YYYY-MM)"] || !FILEDATA[0]["Employee ID"]) {
			// let query = await importHelper.query(4,{importId:importId});
			// await db.sequelize.query(query);
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		let importId = await createImportDetails(importParams);
		var errorArray = [],
			successArray = [];
		for (const paySlipObject of FILEDATA) {
			if (paySlipObject["Pay Month(YYYY-MM)"]) {
				let paymonth = paySlipObject["Pay Month(YYYY-MM)"];
				let employees = paySlipObject["Employee ID"];
				let employeeDetails = await db.employeeMaster.findOne({
					where: { empCode: employees },
					raw: true,
					attributes: ["id"],
				});
				let employeeProcessDetails = await db.payProcessDetails.findOne({
					where: {
						EmployeeId: employeeDetails.id,
						payMonth: paymonth,
						payStatus: { [Op.in]: [7, 9] },
					},
					attributes: ["payProcessDetailAutoId", "proceessId"],
					raw: true,
				});
				if (employeeProcessDetails) {
					await db.payProcessDetails.update(
						{ payStatus: 8 },
						{
							where: {
								payProcessDetailAutoId:
									employeeProcessDetails.payProcessDetailAutoId,
								payStatus: { [Op.not]: 9 },
							},
						},
					); //Update Emplplees pay status in preocess
					await db.paySlips.update(
						{ paySlipStatus: 1 },
						{
							where: {
								paySlipStatus: 0,
								EmployeeId: employeeDetails.id,
								payMonth: paymonth,
							},
						},
					); // upated paySlip status

					let qeury = await importHelper.query(
						3,
						{ processId: employeeProcessDetails.proceessId },
						null,
					);
					let paySlipReleasedCountsInProcess = await db.sequelize.query(qeury);

					if (paySlipReleasedCountsInProcess) {
						if (
							paySlipReleasedCountsInProcess[0][0].total_processed > 0 &&
							paySlipReleasedCountsInProcess[0][0].total_processed ==
								paySlipReleasedCountsInProcess[0][0].total_process_and_released
						) {
							db.payProcessMaster.update(
								{ processFlowId: 12 },
								{
									where: {
										payProcessMasterAutoId: employeeProcessDetails.proceessId,
									},
								},
							);
							db.payProcessDetails.update(
								{ processFlowId: 12 },
								{
									where: {
										payStatus: 9,
									},
								},
							);
						}

						try {
							sendMailAfterSalarySlipRelease(
								[employeeDetails.id],
								paymonth,
								null,
							);
						} catch (e) {
							console.log(e);
						}

						successArray.push({
							importedRow: JSON.stringify(paySlipObject),
							importAutoId: importId,
							importStatus: 1,
							createdBy: req.userData.id,
							importStatusDesc: "Payslip Released Successfully.",
						});
					}
				} else {
					errorArray.push({
						importedRow: JSON.stringify(paySlipObject),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "No PaySlip is available for release.",
					});
				}
			}
		}

		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);

		return respHelper(res, {
			status: 200,
			data: {
				SuccessRecord: successArray.length,
				ErrorRecord: errorArray.length,
			},
			msg: "Payslip Released Successfully.",
		});
	} catch (e) {
		console.log(e);
	}
}

async function arrearsUpload(req, res, OperationType, importParams) {
	try {
		if (!req.file) {
			return respHelper(res, {
				status: 400,
				msg: "File is required!",
			});
		}
		///////////////If File is provided by the users//////////////////
		const workbookEmployee = pkg.readFile(req.file.path);
		const sheetNameEmployee = workbookEmployee.SheetNames[0];
		var arrearsDetais = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);
		if (
			!arrearsDetais[0]["Employee ID"] ||
			!arrearsDetais[0]["Arrear Pay Month (YYYY-MM)"] ||
			!arrearsDetais[0]["Arrear Type(LOP/Increment)"] ||
			!arrearsDetais[0]["Arrear Month (YYYY-MM)"] ||
			!arrearsDetais[0]["Arrear Days"] ||
			!arrearsDetais[0]["Has PF Arrear? (Yes/No)"] ||
			!arrearsDetais[0]["Compute ESIC Arrear (Yes/No)"] ||
			!arrearsDetais[0]["Delete Arrear? (Yes/No)"]
		) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		let financialYearDetails = await importHelper.getFinancialYear(
			new Date().getFullYear(),
		);
		var errorArray = [],
			successArray = [];
		let importId = await createImportDetails(importParams);

		for (const employeeArrears of arrearsDetais) {
			if (employeeArrears["Employee ID"]) {
				let employeeDetais = await db.employeeMaster.findOne({
					where: { empCode: employeeArrears["Employee ID"], isActive: 1 },
					raw: true,
					attributes: ["empCode", "id", "companyId", "buId", "sbuId"],
				});

				if (!employeeDetais) {
					errorArray.push({
						importedRow: JSON.stringify(employeeArrears),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: "Employee not found or deactivated.",
					});

					continue;
				}
				let earningArears = {
					EmployeeId: employeeDetais.id,
					arrearMonth: employeeArrears["Arrear Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeArrears['Arrear Month (YYYY-MM)'])),
					arrearPayMonth: employeeArrears["Arrear Pay Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeArrears['Arrear Pay Month (YYYY-MM)'])),//employeeArrears['Arrear Pay Month (YYYY-MM)'],
					arearDays: employeeArrears["Arrear Days"],
					arearType: employeeArrears["Arrear Type(LOP/Increment)"],
					hasPF: employeeArrears["Has PF Arrear? (Yes/No)"],
					computeESIC: employeeArrears["Compute ESIC Arrear (Yes/No)"],
					empCode: employeeArrears["Employee ID"],
					isActive: 1,
					companyId: employeeDetais.companyId,
					buId: employeeDetais.buId,
					sbuId: employeeDetais.sbuId,
					financialYearId: financialYearDetails.financialYearId,
				};

				console.log(earningArears);

				const { error } =
					await validator.earningArrearsSchema.validate(earningArears);

				if (error) {
					errorArray.push({
						importedRow: JSON.stringify(employeeArrears),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: error.details[0].message,
					});
					continue;
					// return respHelper(res, {
					// 	status: 400,
					// 	msg: error.details[0],
					// });
				} else {
					let existArrear = await db.earningsArears.findOne({
						where: {
							EmployeeId: earningArears.EmployeeId,
							arrearMonth: earningArears.arrearMonth,
							arearType: earningArears.arearType,
						},
						raw: true,
					});

					if (OperationType == 2 && !existArrear) {
						errorArray.push({
							importedRow: JSON.stringify(employeeArrears),
							importAutoId: importId,
							importStatus: 2,
							createdBy: req.userData.id,
							importStatusDesc: "Data is  not available to delete.",
						});

						continue;
					}

					if (existArrear) {
						earningArears["updatedBy"] = req.userData.id;
						earningArears["updatedAt"] = new Date();
						await db.earningsArears.update(earningArears, {
							where: {
								EmployeeId: earningArears.EmployeeId,
								arrearMonth: earningArears.arrearMonth,
								arearType: earningArears.arearType,
							},
						});
						earningArears["ACTION_TYPE"] = "UPDATE";
					} else {
						earningArears["createdBy"] = req.userData.id;
						earningArears["createdAt"] = new Date();
						await db.earningsArears.create(earningArears);
						earningArears["ACTION_TYPE"] = "CREATE";
					}
					successArray.push({
						importedRow: JSON.stringify(employeeArrears),
						importAutoId: importId,
						importStatus: 1,
						createdBy: req.userData.id,
						importStatusDesc: "Arrears Uploaded Successfully.",
					});
				}
			}
		}

		if (importId) {
			let importFinalResult = successArray.concat(errorArray);
			await db.ImportData.bulkCreate(importFinalResult);
			await db.ImportInfo.update(
				{
					importStatusDesc:
						"Import Executed with " +
						successArray.length +
						" success and " +
						errorArray.length +
						" error records",
					importStatus: 1,
				},
				{ where: { importAutoId: importId } },
			);

			return respHelper(res, {
				status: 200,
				data: {
					SuccessRecord: successArray.length,
					ErrorRecord: errorArray.length,
				},
				msg: "Extra Deductions Uploaded Successfully.",
			});
		}
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}
async function sendMailAfterSalarySlipRelease(
	employeeIds,
	payMonth,
	companyLogo,
) {
	console.log(employeeIds);
	console.log(payMonth);
	let allPaySlips = await db.paySlips.findAll({
		where: {
			payMonth: payMonth,
			paySlipStatus: 1,
			sendEmail: 0,
			EmployeeId: { [Op.in]: employeeIds },
		},
		attribute: [
			"paySlipAutoId",
			"EmployeeId",
			"payMonth",
			"paySlipYear",
			"paySlipMonth",
		],
		include: [
			{
				model: db.employeeMaster,
				attribute: ["email", "firstName"],
				include: [
					{
						model: db.companyMaster,
						attributes: ["senderEmail", "companyLogo"],
					},
				],
			},
		],
	});
	for (let i = 0; allPaySlips.length > i; i++) {
		let mailStatus = await eventEmitter.emit(
			"releasePaySlip",
			JSON.stringify({
				email: allPaySlips[i]?.employee?.email,
				firstName: allPaySlips[i]?.employee.firstName,
				month: `${allPaySlips[i]?.paySlipYear} - ${
					financialMonth[allPaySlips[i]?.paySlipMonth]
				}`,
				year_month: `${allPaySlips[i]?.paySlipYear}_${
					financialMonth[allPaySlips[i]?.paySlipMonth]
				}`,
				paySlipAutoId: allPaySlips[i]?.paySlipAutoId,
				companyLogo: allPaySlips[i]?.employee?.companymaster.companyLogo,
				senderEmail: allPaySlips[i]?.employee?.companymaster.senderEmail,
			}),
		);
		if (mailStatus) {
			// update mail status in paySlip table
			await db.paySlips.update(
				{ sendEmail: 1 },
				{ where: { paySlipAutoId: allPaySlips[i]?.paySlipAutoId } },
			);
		}
	}
}

async function createImportDetails(params) {
	let importInfo = await db.ImportInfo.create(params);
	let importInfoRaw = importInfo.get({ plain: true });
	return importInfoRaw.importAutoId;
}

/**
 * Start by Jay
 * Manage Excel sheet functionality
 * Change Attendance Assignment
 * Change Shift, Attendance Policy and WeekOff
 * Change Designation, Department, Employee Type, Job Level, Manager, Cost Center, Company Location, Notice Period
 */

async function attendanceAssignment(req, res, FILEDATA, importParams) {
	if (!req.file) {
		return respHelper(res, {
			status: 400,
			msg: "File is required!",
		});
	}

	let successArray = [];
	let errorArray = [];

	const filterData = FILEDATA.filter((item) => item["Employee ID"]);
	let importId = await createImportDetails(importParams);

	for (let i = 0; filterData.length > i; i++) {
		const isExist = await db.employeeMaster.findOne({
			where: { empCode: String(filterData[i]["Employee ID"]) },
			attributes: [
				"id",
				"empCode",
				"shiftId",
				"weekOffId",
				"attendancePolicyId",
			],
			raw: true,
		});

		if (isExist) {
			if (
				filterData[i]["Enable Biometric Attendance (Yes, No)"] &&
				filterData[i]["Enable Mobile Attendance (Yes, No)"] &&
				filterData[i]["Enable Web Attendance (Yes, No)"]
			) {
				let updateObj = {
					enableBiometricAttendance:
						filterData[i]["Enable Biometric Attendance (Yes, No)"] == "Yes"
							? 1
							: 0,
					enableMobileAttendance:
						filterData[i]["Enable Mobile Attendance (Yes, No)"] == "Yes"
							? 1
							: 0,
					enableWebAttendance:
						filterData[i]["Enable Web Attendance (Yes, No)"] == "Yes" ? 1 : 0,
				};
				await db.employeeMaster.update(updateObj, {
					where: { empCode: String(filterData[i]["Employee ID"]) },
				});

				// push object in success array
				successArray.push({
					importedRow: filterData[i]["Employee ID"],
					importAutoId: importId,
					importStatus: 1,
					createdBy: req.userId,
					importStatusDesc: "Attendance assignment update successfully.",
				});
			}

			let effectedFromDate =
				filterData[i]["Attendance Effective From (YYYY-MM-DD)"];
			effectedFromDate = effectedFromDate
				? convertExcelDate(effectedFromDate)
				: "";

			// fetch shift, weekoff and attendance policy

			if (
				filterData[i]["Shift Name"] &&
				filterData[i]["Week Off Name"] &&
				filterData[i]["Attendance Policy Name"] &&
				effectedFromDate >= moment().format("YYYY-MM-DD") &&
				effectedFromDate
			) {
				let shiftDetails = await db.shiftMaster.findOne({
					where: { shiftName: String(filterData[i]["Shift Name"]) },
					attributes: ["shiftId"],
					raw: true,
				});
				let weekOffDetails = await db.weekOffMaster.findOne({
					where: { weekOffName: String(filterData[i]["Week Off Name"]) },
					attributes: ["weekOffId"],
					raw: true,
				});

				let attendancePolicyDetails = await db.attendancePolicymaster.findOne({
					where: {
						policyName: String(filterData[i]["Attendance Policy Name"]),
					},
					attributes: ["attendancePolicyId"],
					raw: true,
				});
				if (shiftDetails && weekOffDetails && attendancePolicyDetails) {
					const recordsExistForDate = await db.PolicyHistory.findOne({
						raw: true,
						where: {
							fromDate: effectedFromDate,
							needAttendanceCron: 1,
							employeeId: isExist.id,
						},
					});

					if (!recordsExistForDate) {
						let createHistory = {
							employeeId: isExist.id,
							shiftPolicy: shiftDetails
								? shiftDetails.shiftId
								: isExist.shiftId,
							currentshiftPolicy: isExist.shiftId,
							attendancePolicy: attendancePolicyDetails
								? attendancePolicyDetails.attendancePolicyId
								: isExist.attendancePolicyId,
							currentattendancePolicy: isExist.attendancePolicyId,
							weekOffPolicy: weekOffDetails
								? weekOffDetails.weekOffId
								: isExist.weekOffId,
							currentweekOffPolicy: isExist.weekOffId,
							fromDate: effectedFromDate
								? effectedFromDate
								: moment().add(1, "day").format("YYYY-MM-DD"),
							toDate: null,
							createdBy: req.userId,
							createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						};
						await db.PolicyHistory.create(createHistory);

						// push object in success array
						successArray.push({
							importedRow: filterData[i]["Employee ID"],
							importAutoId: importId,
							importStatus: 1,
							createdBy: req.userId,
							importStatusDesc: "Attendance assignment update successfully.",
						});
					} else {
						// push object in failure array
						errorArray.push({
							importedRow: filterData[i]["Employee ID"],
							importAutoId: importId,
							importStatus: 2,
							createdBy: req.userId,
							importStatusDesc: "Record already exist on that date",
						});
						i++;
					}
				} else {
					// push object in failure array
					errorArray.push({
						importedRow: filterData[i]["Employee ID"],
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userId,
						importStatusDesc:
							"Invalid shift, weekoff or attendance policy value",
					});
					i++;
				}
			}

			if (
				!filterData[i]["Shift Name"] &&
				!filterData[i]["Enable Biometric Attendance (Yes, No)"]
			) {
				// push object in failure array
				errorArray.push({
					importedRow: filterData[i]["Employee ID"],
					importAutoId: importId,
					importStatus: 2,
					createdBy: req.userId,
					importStatusDesc:
						effectedFromDate < moment().format("YYYY-MM-DD")
							? "Effective date can't less then from current date."
							: "Invalid shift, weekoff or attendance policy value",
				});
				i++;
			}
		} else {
			// push object in failure array
			errorArray.push({
				importedRow: filterData[i]["Employee ID"],
				importAutoId: importId,
				importStatus: 2,
				createdBy: req.userId,
				importStatusDesc: "Invalid TMC",
			});
			i++;
		}
	}

	if (successArray.length > 0 || errorArray.length > 0) {
		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);
	}

	return respHelper(res, {
		status: 202,
		msg: "Attendance assignment update successfully.",
		data: {
			SuccessRecord: successArray.length,
			ErrorRecord: errorArray.length,
		},
	});
}

async function employmentDetails(req, res, FILEDATA, importParams) {
	if (!req.file) {
		return respHelper(res, {
			status: 400,
			msg: "File is required!",
		});
	}

	let successArray = [];
	let errorArray = [];

	const filterData = FILEDATA.filter((item) => item["Employee ID"]);
	let importId = await createImportDetails(importParams);

	for (let i = 0; filterData.length > i; i++) {
		const isExist = await db.employeeMaster.findOne({
			where: { empCode: String(filterData[i]["Employee ID"]) },
			attributes: ["id", "empCode", "companyId"],
			raw: true,
			include: [{ model: db.jobDetails, attributes: ["dateOfJoining"] }],
		});

		let obj = {
			empCode: filterData[i]["Employee ID"]
				? filterData[i]["Employee ID"].toString()
				: "",
			designationCode: filterData[i]["Designation Code"],
			desFromDate: filterData[i]["Designation Effective From Date(YYYY-MM-DD)"],
			desIsPromotion: filterData[i]["Designation Is Promotion(Yes/No)"],
			jobLevelCode: filterData[i]["Job Level Code"],
			jobLevelFromDate:
				filterData[i]["Job Level Effective From Date(YYYY-MM-DD)"],
			jobLevelIsPromotion: filterData[i]["Job Level Is Promotion(Yes/No)"],
			manager: filterData[i]["Manager"]
				? filterData[i]["Manager"].toString()
				: undefined,
			managerFromDate: filterData[i]["Manager Effective From Date(YYYY-MM-DD)"],
			functionalAreaCode: filterData[i]["Functional Area Code"],
			functionalFromDate:
				filterData[i]["Functional Area Effective From Date(YYYY-MM-DD)"],
			employeeTypeCode: filterData[i]["Employee Type Code"],
			employeeTypeFromDate:
				filterData[i]["Employee Type Effective From Date(YYYY-MM-DD)"],
			companyLocationCode: filterData[i]["Company Location Code"],
			companyLocationFromDate:
				filterData[i]["Company Location Effective From Date(YYYY-MM-DD)"],
			costCenterCode: filterData[i]["Cost Center Code"],
			costCenterFromDate:
				filterData[i]["Cost Center Effective From Date(YYYY-MM-DD)"],
			noticePeriodCode: filterData[i]["Notice Period Code"],
		};

		const { error } = await validator.importEmploymentDetails.validate(obj);

		if (isExist || !error) {
			const today = moment().format("YYYY-MM-DD");
			if (obj.designationCode) {
				console.log("call designation");
				let fromDate = convertExcelDate(obj.desFromDate);
				let parentModel = db.designationMaster;
				let childModel = db.DesignationEmploymentHistory;
				let query = { code: String(obj.designationCode) };
				let attributes = ["designationId"];
				obj["isPromotion"] = obj.desIsPromotion;
				let payload = {
					obj,
					isExist,
					importId,
					req,
					fromDate,
					parentModel,
					childModel,
					query,
					attributes,
				};
				let responseObj = await commonEmploymentDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.employeeTypeCode) {
				console.log("call employee type");
				let fromDate = convertExcelDate(obj.employeeTypeFromDate);
				let parentModel = db.employeeTypeMaster;
				let childModel = db.EmployeeTypeEmploymentHistory;
				let query = { empTypeCode: String(obj.employeeTypeCode) };
				let attributes = ["empTypeId"];
				let payload = {
					obj,
					isExist,
					importId,
					req,
					fromDate,
					parentModel,
					childModel,
					query,
					attributes,
				};
				let responseObj = await commonEmploymentDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.companyLocationCode) {
				console.log("call company location");
				let fromDate = convertExcelDate(obj.companyLocationFromDate);
				let parentModel = db.companyLocationMaster;
				let childModel = db.OfficeLocationEmploymentHistory;
				let query = { companyLocationCode: String(obj.companyLocationCode) };
				let attributes = ["companyLocationId"];
				let payload = {
					obj,
					isExist,
					importId,
					req,
					fromDate,
					parentModel,
					childModel,
					query,
					attributes,
				};
				let responseObj = await commonEmploymentDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.costCenterCode) {
				console.log("call cost center");
				let fromDate = convertExcelDate(obj.costCenterFromDate);
				let parentModel = db.costCenterMaster;
				let childModel = db.CostCenterEmploymentHistory;
				let query = { costCenterCode: String(obj.costCenterCode) };
				let attributes = ["costCenterId"];
				let payload = {
					obj,
					isExist,
					importId,
					req,
					fromDate,
					parentModel,
					childModel,
					query,
					attributes,
				};
				let responseObj = await commonEmploymentDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.functionalAreaCode) {
				console.log("calling functional area function");
				let payload = { obj, isExist, importId, req };
				let responseObj = await employmentFunctionalAreaDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.jobLevelCode) {
				console.log("calling job level function");
				let payload = { obj, isExist, importId, req };
				let responseObj = await employmentJobLevelDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.manager) {
				console.log("calling manager function");
				let payload = { obj, isExist, importId, req };
				let responseObj = await employmentManagerDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			}
			if (obj.noticePeriodCode) {
				console.log("call notice period");
				let fromDate = moment().format("YYYY-MM-DD");
				let parentModel = db.noticePeriodMaster;
				let childModel = db.NoticePeriodEmploymentHistory;
				let query = { noticePeriodCode: String(obj.noticePeriodCode) };
				let attributes = ["noticePeriodAutoId"];
				let payload = {
					obj,
					isExist,
					importId,
					req,
					fromDate,
					parentModel,
					childModel,
					query,
					attributes,
				};
				let responseObj = await commonEmploymentDetails(payload, today);
				if (responseObj.importStatus == 1) {
					successArray.push(responseObj);
				} else {
					errorArray.push(responseObj);
				}
			} else {
				// push object in failure array
				errorArray.push({
					importedRow: obj.empCode,
					importAutoId: importId,
					importStatus: 2,
					createdBy: req.userId,
					importStatusDesc: "Module related column are missing.",
				});
				i++;
			}
		} else {
			// push object in failure array
			errorArray.push({
				importedRow: obj.empCode,
				importAutoId: importId,
				importStatus: 2,
				createdBy: req.userId,
				importStatusDesc: !isExist
					? "Invalid Employee ID"
					: "Required fields are missing.",
			});
			i++;
		}
	}

	if (successArray.length > 0 || errorArray.length > 0) {
		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);
	}

	return respHelper(res, {
		status: 202,
		msg: "Employment Details update successfully.",
		data: {
			SuccessRecord: successArray.length,
			ErrorRecord: errorArray.length,
		},
	});
}

async function employeeData(req, res, FILEDATA, importParams) {
	if (!req.file) {
		return respHelper(res, {
			status: 400,
			msg: "File is required!",
		});
	}

	let successArray = [];
	let errorArray = [];

	const filterData = FILEDATA.filter((item) => item["Employee ID"]);
	let importId = await createImportDetails(importParams);

	const empCodesFromExcel = filterData.map(row => String(row["Employee ID"]));
	const existingEmployees = await db.employeeMaster.findAll({ where: { empCode: empCodesFromExcel }, attributes: ["id", "empCode"], raw: true });

	const employeeMap = new Map();
	existingEmployees.forEach(emp => {
		employeeMap.set(emp.empCode, emp);
	});

	for (const row of filterData) {
		const empCode = String(row["Employee ID"]);
		const employee = employeeMap.get(empCode);

		if (employee) {

			// update data in employee master table
			let lastIncrementDate = (row["Last increment date"]) ? convertExcelDate(row["Last increment date"]) : "";
			const updateEmployeeObj = {
				...( row["First Name"] && { firstName: row["First Name"] }),
				...( row["Middle Name"] && { middleName: row["Middle Name"] }),
				...( row["Last Name"] && { lastName: row["Last Name"] }),
				...( row["First Name"] && row["Last Name"] && { name: `${row["First Name"]} ${row["Last Name"]}` }), 
				...( row["Date Of Joining"] && { lastName: row["Date Of Joining"] }),
				...(row["Workstation (Admin)"] && { workstationAdmin: replaceYesOrNoWithNumber(row["Workstation (Admin)"]) }),
				...(row["Mobile (Admin)"] && { mobileAdmin: replaceYesOrNoWithNumber(row["Mobile (Admin)"]) }),
				...(row["Data Card (Admin)"] && { dataCardAdmin: replaceYesOrNoWithNumber(row["Data Card (Admin)"]) }),
				...(row["Visiting Card (Admin)"] && { visitingCardAdmin: replaceYesOrNoWithNumber(row["Visiting Card (Admin)"]) }),
				...(row["New Customer Name"] && { "newCustomerName": row["New Customer Name"] }),
				...(row["Father Name"] && { "fatherName": row["Father Name"] }),
				...(row["Recruiter Name"] && { "recruiterName": row["Recruiter Name"] }),
				...(row["Offrole CTC"] && { "offRoleCTC": row["Offrole CTC"] }),
				...(row["ESIC/PF Deduction"] && { "ESICPFDeduction": row["ESIC/PF Deduction"] }),
				...(row["IQ Test Applicable"] && { "iqTestApplicable": replaceYesOrNoWithNumber(row["IQ Test Applicable"]) }),
				...(row["Position Type"] && { "positionType": row["Position Type"] }),
				...(lastIncrementDate && { "lastIncrementDate": lastIncrementDate }),
				...(row["Office Mobile Number"] && { "officeMobileNumber": row["Office Mobile Number"] }),
				...(row["Personal Mobile Number"] && { "personalMobileNumber": row["Personal Mobile Number"] }),
				...(row["Aadhaar"] && { "adhrNo": row["Aadhaar"] }),
				...(row["PAN"] && { "panNo": row["PAN"] }),
				...(row["Driving License"] && { "drivingLicence": row["Driving License"] }),
				...(row["Passport Number"] && { "passportNumber": row["Passport Number"] }),
			};

			if(row["First Name"] && row["Last Name"]) {
				updateEmployeeObj.name = `${row["First Name"]} ${row["Last Name"]}`;
			}

			if(row["Salutation"]) {
				// fetch salutation from master table
				const salution = await db.salutationMaster.findOne({ where: { "salutation": row["Salutation"] }, attributes: ["salutationId"], raw: true });
				if(salution) {
				   updateEmployeeObj.salutationId = salution?.salutationId;
				}
			}

			if(row["Highest Qualification"]) {
				// fetch salutation from master table
				const degree = await db.degreeMaster.findOne({ where: { "degreeName": row["Highest Qualification"] }, attributes: ["degreeId"], raw: true });
				if(degree) {
				   updateEmployeeObj.highestQualification = degree?.degreeId;
				}
			}

			if(Object.keys(updateEmployeeObj).length > 0) {
				await db.employeeMaster.update(updateEmployeeObj, {
					where: { "id": employee.id },
				});
			}

			// update data in employee job details table with history
			const updateJobDetails = row["Date Of Joining"] || row["RE(Residence Engineer)"];

			if(updateJobDetails) {
				const existJobDetails = await db.jobDetails.findOne({ where: { userId: employee.id }, raw: true });
				if(existJobDetails) {					
					const updateJobMetaData = {
						...(row["Date Of Joining"] && { "dateOfJoining": row["Date Of Joining"] }),
						...(row["RE(Residence Engineer)"] && { "residentEng": row["RE(Residence Engineer)"] }),
						...(row["Project Code"] && { "projectCode": row["Project Code"] }),
						...(row["Next Appraisal Due"] && { "nextAppraisalDue": row["Next Appraisal Due"] })
					}

					// get probation period
					if(row["Probation Period"]) {
						// verify probation id and calculate probation days
						const getProbationDetails = await db.probationMaster.findOne({
							where: { probationName: row["Probation Period"] },
							attributes: ["probationId", "durationOfProbation"]
						});
						if (getProbationDetails) {
							let durationOfProbation = getProbationDetails.durationOfProbation;
							updateJobMetaData.probationDays = durationOfProbation;
							updateJobMetaData.probationId = getProbationDetails.probationId;
						}
					}

					if(row["Union Code (Increment Cycle)"]) {
						// verify union code
						const getUnionDetails = await db.unionCodIncrementMaster.findOne({
							where: { unionCode: row["Union Code (Increment Cycle)"] },
							attributes: ["unionCodeId"]
						});
						if (getUnionDetails) {
							updateJobMetaData.unionId = getUnionDetails.unionCodeId;
						}
					}

					// generate job details history
					await db.employeeJobDetailsHistory.create(existJobDetails);
					await db.jobDetails.update(updateJobMetaData, { userId: employee.id });
				}
			}

			// update data in employee biographical table
			const biographyDetails = row["Date Of Birth"] || row["Gender"];

			if(biographyDetails) {
				let maritalStatusSince = (row["Marital Status Since"]) ? convertExcelDate(row["Marital Status Since"]) : "";
				const biographyMetaData = {
					...(row["Date Of Birth"] && { "dateOfBirth": row["Date Of Birth"] }),
					...(row["Gender"] && { "gender": row["Gender"] }),
					...(row["Nationality"] && { nationality: row["Nationality"] }),
					...(row["Marital Status"] && { maritalStatus: maritalStatusOptions(row["Marital Status"]) }),
					...(maritalStatusSince && { maritalStatusSince: maritalStatusSince }),
					...(row["Mobile Access"] && { mobileAccess: replaceYesOrNoWithNumber(row["Mobile Access"]) }),
					...(row["Laptop/System (IT)"] && { laptopSystem: row["Laptop/System (IT)"] }),
					...(row["Background Verification (HR)"] && { backgroundVerification: replaceYesOrNoWithNumber(row["Background Verification (HR)"]) }),
				    ...(row["Nominee Name"] && { "nomineeName": row["Nominee Name"] }),
				    ...(row["Nominee Relation"] && { "nomineeRelation": row["Nominee Relation"] })
				}
				await db.biographicalDetails.update(biographyMetaData, { userId: employee.id });
			}

			// add/update data in employee address table with history table

			const currentAddressDetails = row["Current Flat/House/Wing Number"] || row["Current Street/Locality/Area"] ||
			row["Current Landmark"] || row["Current Pincode"] || row["Current Country"] || row["Current State"] || row["Current City"];

			const permanentAddressDetails = row["Permanent Flat/House/Wing Number"] || row["Permanent Street/Locality/Area"] ||
			row["Permanent Landmark"] || row["Permanent Pincode"] || row["Permanent Country"] || row["Permanent State"] || row["Permanent City"];

			const emergencyAddressDetails = row["Emergency Flat/House/Wing Number"] || row["Emergency Street/Locality/Area"] ||
			row["Emergency Landmark"] || row["Emergency Pincode"] || row["Emergency Country"] || row["Emergency State"] ||
			row["Emergency City"];

			if(currentAddressDetails || permanentAddressDetails || emergencyAddressDetails) {
				const updateAddressMetaData = {
					...(row["Current Flat/House/Wing Number"] && { "currentHouse": row["Current Flat/House/Wing Number"] }),
					...(row["Current Street/Locality/Area"] && { "currentStreet": row["Current Street/Locality/Area"] }),
					...(row["Current Landmark"] && { "currentLandmark": row["Current Landmark"] }),
					...(row["Current Pincode"] && { "currentPincodeId": row["Current Pincode"] }),

					...(row["Permanent Flat/House/Wing Number"] && { "permanentHouse": row["Permanent Flat/House/Wing Number"] }),
					...(row["Permanent Street/Locality/Area"] && { "permanentStreet": row["Permanent Street/Locality/Area"] }),
					...(row["Permanent Landmark"] && { "permanentLandmark": row["Permanent Landmark"] }),
					...(row["Permanent Pincode"] && { "permanentPincodeId": row["Permanent Pincode"] }),

					...(row["Emergency Flat/House/Wing Number"] && { "emergencyHouse": row["Emergency Flat/House/Wing Number"] }),
					...(row["Emergency Street/Locality/Area"] && { "emergencyStreet": row["Emergency Street/Locality/Area"] }),
					...(row["Emergency Landmark"] && { "emergencyLandmark": row["Emergency Landmark"] }),
					...(row["Emergency Pincode"] && { "emergencyPincodeId": row["Emergency Pincode"] }),
				}

				if(row["Current Country"] && row["Current State"] && row["Current City"]) {
					let country = await db.countryMaster.findOne({ where: { "countryName": row["Current Country"] }, attributes: ["countryId"], raw: true });
					if(country) {
						let state = await db.stateMaster.findOne({ where: { "stateName": row["Current State"], "countryId": country?.countryId }, attributes: ["stateId"], raw: true });
						if(state) {
							let city = await db.cityMaster.findOne({ where: { "cityName": row["Current City"], "stateId": state?.stateId }, attributes: ["cityId"], raw: true });
							if(city) {
								updateAddressMetaData.currentCountryId = country.countryId;
								updateAddressMetaData.currentStateId = state.stateId;
								updateAddressMetaData.currentCityId = city.cityId;
							}
						}
					}
				}

				if(row["Permanent Country"] && row["Permanent State"] && row["Permanent City"]) {
					let country = await db.countryMaster.findOne({ where: { "countryName": row["Permanent Country"] }, attributes: ["countryId"], raw: true });
					if(country) {
						let state = await db.stateMaster.findOne({ where: { "stateName": row["Permanent State"], "countryId": country?.countryId }, attributes: ["stateId"], raw: true });
						if(state) {
							let city = await db.cityMaster.findOne({ where: { "cityName": row["Permanent City"], "stateId": state?.stateId }, attributes: ["cityId"], raw: true });
							if(city) {
								updateAddressMetaData.permanentCountryId = country.countryId;
								updateAddressMetaData.permanentStateId = state.stateId;
								updateAddressMetaData.permanentCityId = city.cityId;
							}
						}
					}
				}

				if(row["Emergency Country"] && row["Emergency State"] && row["Emergency City"]) {
					let country = await db.countryMaster.findOne({ where: { "countryName": row["Emergency Country"] }, attributes: ["countryId"], raw: true });
					if(country) {
						let state = await db.stateMaster.findOne({ where: { "stateName": row["Emergency State"], "countryId": country?.countryId }, attributes: ["stateId"], raw: true });
						if(state) {
							let city = await db.cityMaster.findOne({ where: { "cityName": row["Emergency City"], "stateId": state?.stateId }, attributes: ["cityId"], raw: true });
							if(city) {
								updateAddressMetaData.emergencyCountryId = country.countryId;
								updateAddressMetaData.emergencyStateId = state.stateId;
								updateAddressMetaData.emergencyCityId = city.cityId;
							}
						}
					}
				}

				const existAddressDetails = await db.employeeAddress.findOne({ where: { employeeId: employee.id }, raw: true });

				if(existAddressDetails) {
					await db.employeeAddress.update(updateAddressMetaData, { employeeId: employee.id });
				}
				else {
					updateAddressMetaData.employeeId = employee.id;
					await db.employeeAddress.create(updateAddressMetaData);
				}
			}

			// update data in employee emergency contact table
			let emergencyDetails = row["Blood Group"] || row["Emergency Contact Relation"] || 
			row["Emergency Contact Name"] || row["Emergency Contact Number"];
			if(emergencyDetails) {
				const existEmergencyDetails = await db.emergencyDetails.findOne({ where: { 'userId': employee.id }, attributes: ['emergencyContactId'] });
				let emergencyMetaData = {
					...(row["Blood Group"] && { "emergencyBloodGroup": row["Blood Group"] }),
					...(row["Emergency Contact Relation"] && { "emergencyContactRelation": row["Emergency Contact Relation"] }),
					...(row["Emergency Contact Name"] && { "emergencyContactName": row["Emergency Contact Name"] }),
					...(row["Emergency Contact Number"] && { "emergencyContactNumber": row["Emergency Contact Number"] })
				}
				if(existEmergencyDetails) {
					await db.employeeAddress.update(emergencyMetaData, { userId: employee.id });
				}
				else {
					emergencyMetaData.userId = employee.id;
					await db.employeeAddress.create(emergencyMetaData);
				}
			}

			// update data in employee payment table
			const bankDetails = row["Account Number"] || row["Bank Name"] || row["Swift/IFSC Code"]
			row["PT Applicability"] || row["PT State"] || row["PT Location"] || row["TDS Applicability"];
			
			if(bankDetails) {
				const existPaymentDetails = await db.paymentDetails.findOne({ where: { 'userId': employee.id }, attributes: ['paymentId'] });
				const getBankDetails = await db.bankMaster.findOne({ where: { 'bankName': row["Bank Name"] }, attributes: ['bankId'], raw: true });
				let ptApplicability = (row["PT Applicability"]) ? replaceYesOrNoWithNumber(row["PT Applicability"]) : "";

				let paymentMetaData = {
					...(row["Account Number"] && { "paymentAccountNumber": row["Account Number"] }),
					...(getBankDetails && { "bankId": getBankDetails?.bankId }),
					...(row["Swift/IFSC Code"] && { "paymentBankIfsc": row["Swift/IFSC Code"] }),
					...(ptApplicability && { ptApplicability: ptApplicability }),
				}

				if(ptApplicability === 'Yes' && row["PT State"] && row["PT Location"]) {
					// fetch pt state and pt location
                    // let ptState = 
				}

				if(existPaymentDetails) {
					await db.paymentDetails.update(paymentMetaData, { userId: employee.id });
				}
				else {
					paymentMetaData.userId = employee.id;
					await db.paymentDetails.create(paymentMetaData);
				}
			}

			// push object in success array
			successArray.push({
				importedRow: empCode,
				importAutoId: importId,
				importStatus: 1,
				createdBy: req.userId,
				importStatusDesc: "Employee data update successfully.",
			});
		} else {
			// push object in failure array
			errorArray.push({
				importedRow: empCode,
				importAutoId: importId,
				importStatus: 2,
				createdBy: req.userId,
				importStatusDesc: "Invalid TMC",
			});
			i++;
		}
	}

	if (successArray.length > 0 || errorArray.length > 0) {
		let importFinalResult = successArray.concat(errorArray);
		await db.ImportData.bulkCreate(importFinalResult);
		await db.ImportInfo.update(
			{
				importStatusDesc:
					"Import Executed with " +
					successArray.length +
					" success and " +
					errorArray.length +
					" error records",
				importStatus: 1,
			},
			{ where: { importAutoId: importId } },
		);
	}

	return respHelper(res, {
		status: 202,
		msg: "Employee data update successfully.",
		data: {
			SuccessRecord: successArray.length,
			ErrorRecord: errorArray.length,
		},
	});
}

const commonEmploymentDetails = async (payload, today) => {
	const recordsExistForDate = await payload.childModel.findOne({
		raw: true,
		where: {
			fromDate: payload.fromDate,
			needAttendanceCron: 0,
			employeeId: payload.isExist.id,
		},
	});

	if (recordsExistForDate) {
		// push object in failure array
		return {
			importedRow: payload.obj.empCode,
			importAutoId: payload.importId,
			importStatus: 2,
			createdBy: payload.req.userId,
			importStatusDesc: "Record already exist for this date.",
		};
	} else {
		let details = await payload.parentModel.findOne({
			where: payload.query,
			attributes: payload.attributes,
			raw: true,
		});

		const lastObj = await payload.childModel.findOne({
			raw: true,
			where: {
				employeeId: payload.isExist.id,
			},
			order: [["createdAt", "DESC"]], // Order by createdAt descending
		});

		let minDate = lastObj?.fromDate
			? lastObj?.fromDate
			: payload.isExist["employeejobdetail.dateOfJoining"];

		if (details && payload.fromDate <= today && payload.fromDate >= minDate) {
			let metaData = {
				employeeId: payload.isExist.id,
				companyId: payload.isExist.companyId,
				...(payload.attributes[0] === "designationId" && {
					designation_id: details.designationId,
				}),
				...(payload.attributes[0] === "empTypeId" && {
					employeeType: details.empTypeId,
				}),
				...(payload.attributes[0] === "companyLocationId" && {
					companyLocationId: details.companyLocationId,
				}),
				...(payload.attributes[0] === "costCenterId" && {
					costId: details.costCenterId,
				}),
				...(payload.attributes[0] === "noticePeriodAutoId" && {
					noticePeriodAutoId: details.noticePeriodAutoId,
				}),
				fromDate: payload.fromDate,
				toDate: null,
				...(payload.obj.isPromotion && {
					isPromotion: payload.obj.isPromotion == "Yes" ? 1 : 0,
				}),
				sourceName: "Import",
			};

			metaData = {
				...metaData,
				createdBy: payload.req.userId,
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
			};
			await payload.childModel.create(metaData);

			const recordsExist = await payload.childModel.findOne({
				raw: true,
				where: {
					employeeId: payload.isExist.id,
				},
				order: [["createdAt", "DESC"]], // Order by createdAt descending
				limit: 1, // Fetch only one record
				offset: 1, // Skip the most recent record
			});

			if (recordsExist) {
				await payload.childModel.update(
					{
						toDate: moment(payload.fromDate)
							.subtract(1, "day")
							.format("YYYY-MM-DD"),
					},
					{ where: { id: recordsExist.id } },
				);
			}

			// UPDATE DESIGNATION TO EMP MASTER TABLE
			let updateDone = await db.employeeMaster.update(
				{
					...(payload.attributes[0] === "designationId" && {
						designation_id: details.designationId,
					}),
					...(payload.attributes[0] === "empTypeId" && {
						employeeType: details.empTypeId,
					}),
					...(payload.attributes[0] === "companyLocationId" && {
						companyLocationId: details.companyLocationId,
					}),
					...(payload.attributes[0] === "costCenterId" && {
						costId: details.costCenterId,
					}),
					...(payload.attributes[0] === "noticePeriodAutoId" && {
						noticePeriodAutoId: details.noticePeriodAutoId,
					}),
					updatedBy: payload.req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						id: payload.isExist.id,
					},
				},
			);

			// push object in success array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 1,
				createdBy: payload.req.userId,
				importStatusDesc: "Employment details update successfully.",
			};
		} else {
			// push object in failure array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 2,
				createdBy: payload.req.userId,
				importStatusDesc: "Invalid module Code or from date.",
			};
		}
	}
};

const employmentJobLevelDetails = async (payload, today) => {
	let fromDate = convertExcelDate(payload.obj.jobLevelFromDate);
	const recordsExistForDate = await db.JobLevelEmploymentHistory.findOne({
		raw: true,
		where: {
			fromDate: fromDate,
			needAttendanceCron: 0,
			employeeId: payload.isExist.id,
		},
	});

	if (recordsExistForDate) {
		// push object in failure array
		return {
			importedRow: payload.obj.empCode,
			importAutoId: payload.importId,
			importStatus: 2,
			createdBy: payload.req.userId,
			importStatusDesc: "Record already exist for this date.",
		};
	} else {
		let details = await db.jobLevelMapping.findOne({
			where: { companyId: payload.isExist.companyId },
			attributes: ["jobLevelMappingId", "bandId", "gradeId", "jobLevelId"],
			raw: true,
			include: [
				{
					model: db.jobLevelMaster,
					attributes: ["jobLevelId"],
					where: { jobLevelCode: payload.obj.jobLevelCode },
				},
			],
		});

		const lastObj = await db.JobLevelEmploymentHistory.findOne({
			raw: true,
			where: {
				employeeId: payload.isExist.id,
			},
			order: [["createdAt", "DESC"]], // Order by createdAt descending
		});

		let minDate = lastObj?.fromDate
			? lastObj?.fromDate
			: payload.isExist["employeejobdetail.dateOfJoining"];

		if (details && fromDate <= today && fromDate >= minDate) {
			let metaData = {
				employeeId: payload.isExist.id,
				companyId: payload.isExist.companyId,
				bandId: details.bandId,
				gradeId: details.gradeId,
				jobLevelId: details.jobLevelId,
				fromDate: fromDate,
				toDate: null,
				isPromotion: payload.obj.jobLevelIsPromotion == "Yes" ? 1 : 0,
				sourceName: "Import",
			};
			metaData = {
				...metaData,
				createdBy: payload.req.userId,
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
			};
			await db.JobLevelEmploymentHistory.create(metaData);

			const recordsExist = await db.JobLevelEmploymentHistory.findOne({
				raw: true,
				where: {
					employeeId: payload.isExist.id,
				},
				order: [["createdAt", "DESC"]], // Order by createdAt descending
				limit: 1, // Fetch only one record
				offset: 1, // Skip the most recent record
			});

			if (recordsExist) {
				await db.JobLevelEmploymentHistory.update(
					{
						toDate: moment(fromDate).subtract(1, "day").format("YYYY-MM-DD"),
					},
					{ where: { id: recordsExist.id } },
				);
			}

			//UPDATE JOB LEVEL TO EMP MASTER TABLE

			let updateDone = await db.jobDetails.update(
				{
					bandId: metaData.bandId,
					gradeId: metaData.gradeId,
					jobLevelId: metaData.jobLevelId,
					updatedBy: payload.req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						userId: payload.isExist.id,
					},
				},
			);

			// push object in success array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 1,
				createdBy: payload.req.userId,
				importStatusDesc: "Employment details update successfully.",
			};
		} else {
			// push object in failure array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 2,
				createdBy: payload.req.userId,
				importStatusDesc: "Invalid module Code or from date.",
			};
		}
	}
};

const employmentManagerDetails = async (payload, today) => {
	let fromDate = convertExcelDate(payload.obj.managerFromDate);

	const recordsExistForDate = await db.managerHistory.findOne({
		raw: true,
		where: {
			fromDate: fromDate,
			needAttendanceCron: 1,
			employeeId: payload.isExist.id,
		},
	});

	if (recordsExistForDate) {
		// push object in failure array
		return {
			importedRow: payload.obj.empCode,
			importAutoId: payload.importId,
			importStatus: 2,
			createdBy: payload.req.userId,
			importStatusDesc: "Record already exist for this date.",
		};
	} else {
		const manager = await db.employeeMaster.findOne({
			where: {
				empCode: payload.obj.manager,
			},
			attributes: ["id"],
			raw: true,
		});

		if (manager && fromDate >= today) {
			let metaData = {
				employeeId: payload.isExist.id,
				managerId: manager.id,
				fromDate: fromDate,
				toDate: null,
				sourceName: "Import",
			};
			metaData = {
				...metaData,
				createdBy: payload.req.userId,
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
			};

			const recordsExistForDate = await db.managerHistory.findOne({
				raw: true,
				where: {
					fromDate: fromDate,
					needAttendanceCron: 1,
					employeeId: payload.isExist.id,
				},
			});
			if (!recordsExistForDate) {
				await db.managerHistory.create(metaData);
				// push object in success array
				return {
					importedRow: payload.obj.empCode,
					importAutoId: payload.importId,
					importStatus: 1,
					createdBy: payload.req.userId,
					importStatusDesc: "Employment details update successfully.",
				};
			} else {
				// push object in failure array
				return {
					importedRow: payload.obj.empCode,
					importAutoId: payload.importId,
					importStatus: 2,
					createdBy: payload.req.userId,
					importStatusDesc: "Data already exist on this date.",
				};
			}
		} else {
			// push object in failure array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 2,
				createdBy: payload.req.userId,
				importStatusDesc:
					"Invalid Employee ID or from date should be greater then or equal to current date.",
			};
		}
	}
};

const employmentFunctionalAreaDetails = async (payload, today) => {
	let fromDate = convertExcelDate(payload.obj.functionalFromDate);
	const recordsExistForDate = await db.DepartmentEmploymentHistory.findOne({
		raw: true,
		where: {
			fromDate: fromDate,
			needAttendanceCron: 1,
			employeeId: payload.isExist.id,
		},
	});

	if (recordsExistForDate) {
		// push object in failure array
		return {
			importedRow: payload.obj.empCode,
			importAutoId: payload.importId,
			importStatus: 2,
			createdBy: payload.req.userId,
			importStatusDesc: "Record already exist for this date.",
		};
	} else {
		const details = await db.functionalAreaMapping.findOne({
			attributes: [],
			raw: true,
			include: [
				{
					model: db.functionalAreaMaster,
					attributes: ["functionalAreaId"],
					where: { functionalAreaCode: payload.obj.functionalAreaCode },
				},
				{
					model: db.departmentMapping,
					attributes: ["departmentId"],
					include: [
						{
							model: db.sbuMapping,
							attributes: ["sbuId"],
							include: [
								{
									model: db.buMapping,
									attributes: ["buId", "companyId", "headId", "buHrId"],
								},
							],
						},
					],
				},
			],
		});

		const lastObj = await db.DepartmentEmploymentHistory.findOne({
			raw: true,
			where: {
				employeeId: payload.isExist.id,
			},
			order: [["createdAt", "DESC"]], // Order by createdAt descending
		});

		let minDate = lastObj?.fromDate
			? lastObj?.fromDate
			: payload.isExist["employeejobdetail.dateOfJoining"];

		if (details && fromDate <= today && fromDate >= minDate) {
			let metaData = {
				employeeId: payload.isExist.id,
				companyId: details["departmentmapping.sbumapping.bumapping.companyId"],
				buId: details["departmentmapping.sbumapping.bumapping.buId"],
				sbuId: details["departmentmapping.sbumapping.sbuId"],
				buHeadId: details["departmentmapping.sbumapping.bumapping.headId"],
				buHRId: details["departmentmapping.sbumapping.bumapping.buHrId"],
				departmentId: details["departmentmapping.departmentId"],
				functionalAreaId: details["functionalareamaster.functionalAreaId"],
				sourceName: "Import",
				fromDate: fromDate,
				toDate: null,
			};
			metaData = {
				...metaData,
				createdBy: payload.req.userId,
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
			};
			await db.DepartmentEmploymentHistory.create(metaData);

			const recordsExist = await db.DepartmentEmploymentHistory.findOne({
				raw: true,
				where: {
					employeeId: payload.isExist.id,
				},
				order: [["createdAt", "DESC"]], // Order by createdAt descending
				limit: 1, // Fetch only one record
				offset: 1, // Skip the most recent record
			});

			if (recordsExist) {
				await db.DepartmentEmploymentHistory.update(
					{
						toDate: moment(fromDate).subtract(1, "day").format("YYYY-MM-DD"),
					},
					{ where: { id: recordsExist.id } },
				);
			}

			// UPDATE DEPARTMENT TO EMP MASTER TABLE
			let updateDone = await db.employeeMaster.update(
				{
					buId: details["departmentmapping.sbumapping.bumapping.buId"],
					sbuId: details["departmentmapping.sbumapping.sbuId"],
					buHeadId: details["departmentmapping.sbumapping.bumapping.headId"],
					buHRId: details["departmentmapping.sbumapping.bumapping.buHrId"],
					departmentId: details["departmentmapping.departmentId"],
					functionalAreaId: details["functionalareamaster.functionalAreaId"],
					updatedBy: payload.req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						id: payload.isExist.id,
					},
				},
			);

			// push object in success array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 1,
				createdBy: payload.req.userId,
				importStatusDesc: "Employment details update successfully.",
			};
		} else {
			// push object in failure array
			return {
				importedRow: payload.obj.empCode,
				importAutoId: payload.importId,
				importStatus: 2,
				createdBy: payload.req.userId,
				importStatusDesc: "Invalid module Code or from date.",
			};
		}
	}
};

// Function to convert Excel serial date to JS Date

const convertExcelDate = (serial) => {
	const date = new Date((serial - 25569) * 86400 * 1000);
	return moment(date).format("YYYY-MM-DD");
};

const replaceYesOrNoWithNumber = (value) => {
	if (value === "Yes") {
		return 1;
	} else {
		return 0;
	}
};

/**
 * end by Jay
 * end Excel sheet functionality
 */
