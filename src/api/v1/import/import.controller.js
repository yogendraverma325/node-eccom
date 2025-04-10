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
			];

			console.log(req.body.uploadType);

			if (!availableServices.includes(req.body.uploadType)) {
				return respHelper(res, {
					status: 400,
					msg: "Service is comming soon : " + req.body.uploadType,
				});
			}

			let importInfoObject = {
				createdBy: req.userData.id,
				importType: req.body.uploadType,
				importTableName: req.body.uploadType,
				buId: req.userData.buId,
				sbuId: req.userData.sbuId,
				companyId: req.userData.companyId,
			};

			let importInfo = await db.ImportInfo.create(importInfoObject);
			let importInfoRaw = importInfo.get({ plain: true });

			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			var FILEDATA = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);

			if (req.body.uploadType == "LOP") {
				await lopUpload(req, res, FILEDATA, importInfoRaw.importAutoId);
			} else if (req.body.uploadType == "TDS Deduction") {
				await tdsUpload(req, res, FILEDATA, importInfoRaw.importAutoId);
			} else if (req.body.uploadType == "Extra Payment") {
				await extraPaymentUpload(
					req,
					res,
					FILEDATA,
					importInfoRaw.importAutoId,
				);
			} else if (req.body.uploadType == "Standard Deduction") {
				await extraDeductionsUpload(
					req,
					res,
					FILEDATA,
					importInfoRaw.importAutoId,
				);
			} else if (req.body.uploadType == "Gross-Pay") {
				await uploadCTC(req, res, FILEDATA, importInfoRaw.importAutoId);
			} else if (req.body.uploadType == "Pay Slip Release") {
				await releasePaySlip(req, res, FILEDATA, importInfoRaw.importAutoId);
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
			// console.log("Role ID");
			// console.log(req.userData.role_id);
			// console.log("Role ID");
			let importInfoList = await db.sequelize.query(queryForImportDetails);
			// console.log(queryForImportDetails);
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
}

export default new ImportController();

async function uploadCTC(req, res, FILEDATA, importId) {
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

async function extraPaymentUpload(req, res, FILEDATA, importId) {
	try
	{
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

		if (!tdsDetails[0]["Employee ID"] || !tdsDetails[0]["Effective Month"] || !tdsDetails[0]["Category"] || !tdsDetails['Amount']) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		var errorArray = [],
			successArray = [];
		for (const employeeExtraPayment of tdsDetails) {
			if (employeeExtraPayment["Employee ID"]) {
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
						importStatusDesc: "Employee not exist.",
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
				};

				// console.log(extraPayment);
				// return;
				const { error } = await validator.extraPayment.validate(extraPayment);
				if (error) {
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
						raw: true,
					});

					if (existTDSDetails) {
						extraPayment["updatedBy"] = req.userData.id;
						extraPayment["updatedAt"] = new Date();

						await db.extraPayment.update(extraPayment, {
							where: {
								EmployeeId: extraPayment.EmployeeId,
								paymentMonth: extraPayment.paymentMonth,
								category: extraPayment.category,
							},
						});
						extraPayment["ACTION_TYPE"] = "UPDATE";
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
						importStatusDesc: "Payment Uploaded Successfully.",
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

async function lopUpload(req, res, FILEDATA, importId) {
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
		var lopDetails = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);
		var errorArray = [],
			successArray = [];

		if (!lopDetails[0]["Employee ID"]) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		for (const employeeTds of lopDetails) {
			if (employeeTds["Employee ID"]) {
				let employeeDetais = await db.employeeMaster.findOne({
					where: { empCode: employeeTds["Employee ID"], isActive: isActive },
					raw: true,
					attributes: ["empCode", "id"],
				});

				if (!employeeDetais) {
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
				if (error) {
					// errorArray.push({
					// 	index: errorArray.length + 1,
					// 	error: error.details[0].message,
					// 	employeeID: lopDeductions.empCode,
					// });

					errorArray.push({
						importedRow: JSON.stringify(employeeTds),
						importAutoId: importId,
						importStatus: 2,
						createdBy: req.userData.id,
						importStatusDesc: error.details[0].message,
					});
					// return respHelper(res, {
					//   status: 400,
					//   msg: error.details[0],
					// });
				} else {
					let existTDSDetails = await db.lopDeductions.findOne({
						where: {
							empCode: lopDeductions.empCode,
							lopMonth: lopDeductions.lopMonth,
						},
						raw: true,
					});
					if (existTDSDetails) {
						lopDeductions["updatedBy"] = req.userData.id;
						lopDeductions["updatedAt"] = new Date();

						await db.lopDeductions.update(lopDeductions, {
							where: {
								EmployeeId: lopDeductions.EmployeeId,
								lopMonth: lopDeductions.lopMonth,
								empCode: lopDeductions.empCode,
							},
						});
						lopDeductions["ACTION_TYPE"] = "UPDATE";
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
						importStatusDesc: "Lop Uploaded Successfully.",
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

async function extraDeductionsUpload(req, res, FILEDATA, importId) {
	var errorArray = [],
		successArray = [];
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
		var extraDeductonsDetails = pkg.utils.sheet_to_json(
			workbookEmployee.Sheets[sheetNameEmployee],
		);

		if (!extraDeductonsDetails[0]["Employee ID"]) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

		for (const employeeExtraDeduction of extraDeductonsDetails) {
			if (employeeExtraDeduction["Employee ID"]) {
				const { error } = await validator.extraDeductionSchema.validate(
					employeeExtraDeduction,
				);
				if (error) {
					// errorArray.push({
					// 	index: errorArray.length + 1,
					// 	employeeID: employeeExtraDeduction["Employee ID"],
					// 	errorDetails: error.details[0].message,
					// });
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
					raw: true,
				});

				if (existExtraDeductionDetails) {
					extraDeductions["updatedBy"] = req.userData.id;
					extraDeductions["updatedAt"] = new Date();

					await db.extraDeduction.update(extraDeductions, {
						where: {
							empCode: extraDeductions.empCode,
							deductionCategory: extraDeductions.deductionCategory,
							deductionName: extraDeductions.deductionName,
							startMonth: extraDeductions.startMonth,
						},
					});
					extraDeductions["ACTION_TYPE"] = "UPDATE";
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
					importStatusDesc: "Extra Deductions Uploaded Successfully.",
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

async function tdsUpload(req, res, FILEDATA, importId) {
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
		if (!tdsDetails[0]["Employee ID"]) {
			return respHelper(res, {
				status: 400,
				msg: "Invalid File Format",
			});
		}

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
						importStatusDesc: "Employee not found/ deactivated",
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
				if (error) {
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
						raw: true,
					});

					if (existTDSDetails) {
						tdsDeductions["updatedBy"] = req.userData.id;
						tdsDeductions["updatedAt"] = new Date();

						await db.tdsDeductions.update(tdsDeductions, {
							where: {
								EmployeeId: tdsDeductions.EmployeeId,
								tdsMonth: tdsDeductions.tdsMonth,
							},
						});
						tdsDeductions["ACTION_TYPE"] = "UPDATE";
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
						importStatusDesc: "TDS Uploaded Successfully.",
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

async function releasePaySlip(req, res, FILEDATA, importId) {
	try {
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
						payStatus: {[Op.in]:[7,9]},
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
									payStatus:{[Op.not]:9}
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

					if(paySlipReleasedCountsInProcess)
					{
						if(paySlipReleasedCountsInProcess[0][0].total_processed>0 && paySlipReleasedCountsInProcess[0][0].total_processed==paySlipReleasedCountsInProcess[0][0].total_process_and_released)
						{
							db.payProcessMaster.update({processFlowId:12},{where:{
								payProcessMasterAutoId:employeeProcessDetails.proceessId
							}});
							db.payProcessDetails.update({processFlowId:12},{where:{
								payStatus:9
							}});
						}
				
						try {
							sendMailAfterSalarySlipRelease([employeeDetails.id], paymonth, null);
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
