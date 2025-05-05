import respHelper from "../../../helper/respHelper.js";
import importHelper from "./arrearsHelper.js";
import db from "../../../config/db.config.js";
import validator from "../../../helper/validator.js";
import xlsx from "json-as-xlsx";
import pkg from "xlsx";
import { Op, where } from "sequelize";
import moment from "moment";
import { raw } from "mysql2";
import eventEmitter from "../../../services/eventService.js";
import arrearsHelper from "./arrearsHelper.js";
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
	async getMonthWiseArrearsList(req, res) {
		try {
			let arrearPayMonth = req.body.arrearPayMonth;
			let status = req.body.status;
			let arrearListQuery = await arrearsHelper.query(1, arrearPayMonth, {status:status});
			let arrearsData = await db.sequelize.query(arrearListQuery);
			console.log(arrearListQuery);
			return respHelper(res, {
				status: 200,	
				data: arrearsData[0],
				msg: "Arrears Fethed Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async processArrears(req, res) {
		try {
			let arrearsAutoIds = req.body.arrearsAutoIds;
			let arrearsTypeId = req.body.arrearsTypeId;

			return respHelper(res, {
				status: 200,
				data: { arrearsAutoIds, arrearsTypeId },
				msg: "Arrears Processed Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
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
