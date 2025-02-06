import { Op, where } from "sequelize";
import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import pkg from "xlsx";
import validator from "../../../helper/validator.js";
import { query, raw } from "express";
import message from "../../../constant/messages.js";
import Employee from "../../model/Employee.js";
import paymentHelper from "./paymentHelper.js";
import helper from "../../../helper/helper.js";
import Sequelize from "sequelize";
import { parse } from "dotenv";
import xlsx from "json-as-xlsx";
import { fileURLToPath } from "url"; // Import for resolving __dirname equivalent
import emailTemplate from "../../../email/emailTemplate.js";
import html_to_pdf from "html-pdf-node";
import path from "path"; // Import the path module
import moment from "moment";
import puppeteer from "puppeteer";
import eventEmitter from "../../../services/eventService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbName = process.env.DB_NAME;
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

import Constant from "../../../constant/messages.js";
import service from "./payment.service.js";
import Pagination from "../../../helper/pagination.js";
import logger from "../../../helper/logger.js";
// import puppeteer from "puppeteer";

//import moment, { now } from "moment";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class PaymentController {
	async payElements(req, res) {
		try {
			const user = req.query.user || req.userId;

			const payPackageDetails = await db.payPackage.findOne({
				where: { EmployeeId: user, isActive: 1 },
				raw: true,
				attributes: ["salaryStructureAutoId", "payPackageAutoId"],
				order: [["createdAt", "DESC"]], // Correct order syntax
			});

			if (payPackageDetails) {
				const payElementsData = await db.payElements.findAll({
					where: {
						EmployeeId: user,
						payPackageAutoId: payPackageDetails.payPackageAutoId,
					},
					attributes: {
						exclude: ["createdAt", "createdBy", "updatedBy", "updatedAt"],
					},
					include: [
						{
							model: db.salaryComponent,
							attributes: {
								exclude: [
									"createdAt",
									"createdBy",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
							},
							where: {
								salaryComponentEarningType: { [Op.ne]: ["Deduction"] },
							},
							order: ["salaryComponentSequenceNo", "ASC"],
							as: "salarycomponent",
							include: [
								{
									model: db.salarystructurecomponentmapping,
									where: {
										salaryStructureAutoId:
											payPackageDetails.salaryStructureAutoId,
									},
									attributes: ["salaryStructurecomponentmappingAutoId"],
									include: [
										{
											model: db.salarycomponentmapping,
											where: {
												salaryComponentElementAutoId: 21,
											},
										},
									],
								},
							],
						},
					],
				});

				const filteredData = payElementsData.filter(
					(item) => item.salarycomponent.salaryComponentSequenceNo !== null,
				);

				// Sort the filtered array by `salaryComponentSequenceNo` in ascending order
				const sortedData = filteredData.sort(
					(a, b) =>
						a.salarycomponent.salaryComponentSequenceNo -
						b.salarycomponent.salaryComponentSequenceNo,
				);

				console.log(sortedData);
				return respHelper(res, {
					status: 200,
					msg: Constant.DATA_FETCHED,
					data: sortedData,
				});
			} else {
				return respHelper(res, {
					status: 200,
					msg: Constant.DATA_BLANK,
					data: [],
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async paySlips(req, res) {
		try {
			const user = req.query.user;
			const financialYearId = req.query.financialYearId || "";
			const financialYearName = req.query.financialYear || "";
			const type = parseInt(req.query.type);

			// const paySlip = await db.paySlips.findAll({
			//   where: {
			//     EmployeeId: user ? user : req.userId,
			//     financialYearId: financialYearId,
			//     ...(type === 1 && { paySlipStatus: 1 }),
			//   },
			//  order: [["createdAt", "desc"]],
			//   attributes: { exclude: ["createdAt", "createdBy"] },
			//   include: [
			//     {
			//       model: db.employeeMaster,
			//       attributes: [
			//         "name",
			//         "empCode",
			//         "email",
			//         "designation_id",
			//         "departmentId",
			//         "panNo",
			//         "esicNo",
			//         "uanNo",
			//         "pfNo",
			//         "employeeType",
			//       ],
			//       include: [
			//         {
			//           model: db.departmentMaster,
			//           required: true,
			//           attributes: ["departmentCode", "departmentName"],
			//         },
			//         {
			//           model: db.designationMaster,
			//           required: false,
			//           attributes: ["name"],
			//         },
			//         {
			//           model: db.jobDetails,
			//           attributes: ["dateOfJoining"],
			//         },
			//       ],
			//     },
			//     {
			//       model: db.paySlipComponent,
			//       order: [
			//         [Sequelize.fn('CAST', Sequelize.col('salaryComponentSequenceNo'), 'INTEGER'), 'ASC'],
			//       ],
			//       attributes: {
			//         exclude: [
			//           "createdAt",
			//           "createdBy",
			//           "updatedBy",
			//           "updatedAt",
			//           "isActive",
			//         ],
			//       },

			//     },
			//   ],
			// });

			const paySlip = await db.paySlips.findAll({
				where: {
					EmployeeId: user ? user : req.userId,
					...(financialYearId && { financialYearId: financialYearId }),
					...(financialYearName && { paySlipFinancialYear: financialYearName }),
					...(type === 1 && { paySlipStatus: 1 }),
				},
				order: [[db.paySlipComponent, "salaryComponentSequenceNo", "ASC"]],
				attributes: { exclude: ["createdAt", "createdBy"] },
				include: [
					{
						model: db.employeeMaster,
						attributes: [
							"name",
							"empCode",
							"email",
							"designation_id",
							"departmentId",
							"panNo",
							"esicNo",
							"uanNo",
							"pfNo",
							"employeeType",
						],
						include: [
							{
								model: db.departmentMaster,
								required: true,
								attributes: ["departmentCode", "departmentName"],
							},
							{
								model: db.designationMaster,
								required: false,
								attributes: ["name"],
							},
							{
								model: db.jobDetails,
								attributes: ["dateOfJoining"],
							},
						],
					},
					{
						model: db.paySlipComponent,
						order: [
							[Sequelize.col("salaryComponentSequenceNo"), "ASC"], // Sorting here as well
						],
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
			});

			return respHelper(res, {
				status: 200,
				data: paySlip,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async payPackage(req, res) {
		try {
			const user = req.query.user;
			const financialYearId = req.query.financialYearId || "";
			const financialYearName = req.query.financialYear || "";

			const payPackage = await db.payPackage.findAll({
				where: {
					EmployeeId: user ? user : req.userId,
					...(financialYearId && { financialYearId: financialYearId }),
					...(financialYearName && {
						payPackageFinancialYear: financialYearName,
					}),
					// isActive:1
				},
				order: [["createdAt", "desc"]],
				attributes: {
					exclude: [
						// "createdAt",
						"createdBy",
						"updatedBy",
						"updatedAt",
						// "isActive",
					],
				},
			});

			return respHelper(res, {
				status: 200,
				data: payPackage,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async ctcProration(req, res) {
		try {
			const payPackageAutoId = req.query.payPackageAutoId;
			const payPackageDetails = await db.payPackage.findOne({
				where: { payPackageAutoId: payPackageAutoId, isActive: 1 },
				raw: true,
				attributes: ["salaryStructureAutoId"],
				order: [["createdAt", "DESC"]], // Correct order syntax
			});

			console.log(payPackageDetails.salaryStructureAutoId);
			const payElements = await db.payElements.findAll({
				where: {
					payPackageAutoId,
				},
				include: [
					{
						model: db.salaryComponent,
						attributes: {
							exclude: [
								"createdAt",
								"createdBy",
								"updatedBy",
								"updatedAt",
								"isActive",
								"salaryComponentDescription",
								"salaryComponentType",
								"salaryComponentRemark",
								"salaryComponentCalculation",
								"salaryComponentDependent",
							],
						},
						where: {
							salaryComponentEarningType: { [Op.ne]: ["Deduction"] },
						},
						as: "salarycomponent",
						include: [
							{
								model: db.salarystructurecomponentmapping,
								where: {
									salaryStructureAutoId:
										payPackageDetails.salaryStructureAutoId,
								},
								attributes: ["salaryStructurecomponentmappingAutoId"],
								include: [
									{
										model: db.salarycomponentmapping,
										where: {
											salaryComponentElementAutoId: 21,
										},
									},
								],
							},
						],
					},
				],
				attributes: {
					exclude: [
						"createdAt",
						"createdBy",
						"updatedBy",
						"updatedAt",
						"isActive",
					],
				},
			});

			const filteredData = payElements.filter(
				(item) => item.salarycomponent.salaryComponentSequenceNo !== null,
			);

			// Sort the filtered array by `salaryComponentSequenceNo` in ascending order
			const sortedData = filteredData.sort(
				(a, b) =>
					a.salarycomponent.salaryComponentSequenceNo -
					b.salarycomponent.salaryComponentSequenceNo,
			);
			return respHelper(res, {
				status: 200,
				data: sortedData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	//////////////////////////Payroll working//////////////////
	async componentElementMapping(req, res) {
		try {
			var currentRecord = 0;
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			} else {
				const workbookEmployee = pkg.readFile(req.file.path);
				const sheetNameEmployee = workbookEmployee.SheetNames[0];
				const Employees = pkg.utils.sheet_to_json(
					workbookEmployee.Sheets[sheetNameEmployee],
				);
				const { error } =
					await validator.importMappingForComponentAndElement.validate(
						Employees,
					);
				if (error) {
					return respHelper(res, {
						status: 400,
						msg: error,
					});
				} else {
					for (const element of Employees) {
						let currentMapping = await db.salaryComponentElementMapping.findAll(
							{
								where: {
									salaryComponentAutoId: element.salaryComponentAutoId,
									salaryComponentElementAutoId:
										element.salaryComponentElementAutoId,
								},
							},
						);
						if (currentMapping.length == 0) {
							currentRecord = currentRecord + 1;
							await db.salaryComponentElementMapping.create(element);
						}
					}

					return respHelper(res, {
						status: 200,
						data: "Total " + currentRecord + " records have been updated.",
					});
				}
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getExistingSalaryStrutures(req, res) {
		try {
			const { error } = await validator.salaryStructureListSchema.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error,
				});
			}
			let { structureType, salaryStructureAutoId } = req.body;
			let query =
				structureType == "LIST"
					? {
							where: {
								isActive: 1,
							},
							include: [
								{
									model: db.employeeMaster,
									attributes: ["name", "empCode"],
									as: "salaryStructureCreater",
								},
								{
									model: db.employeeMaster,
									attributes: ["name", "empCode"],
									as: "salaryStructureUpdater",
								},
							],
						}
					: {
							where: {
								salaryStructureAutoId: salaryStructureAutoId,
							},
							attributes: [
								"salaryStructureName",
								"salaryStructureDes",
								"salaryStructureAutoId",
								"hasVariable",
								"hasMonthlyProration",
								"hasAnnuallyProration",
							],
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
												"salaryComponentEarningType",
											],
											as: "componentDetails",
										},
										{
											model: db.salarycomponentmapping,
											attributes: [
												"salaryComponentElementAutoId",
												"salaryComponentAutoId",
												"elementValue",
											],
											as: "componentMappedDetails",
											include: [
												{
													model: db.salarycomponentelement,
													attributes: [
														"salaryComponentElementAutoId",
														"salaryComponentElementName",
														"salaryComponentElementCode",
													],
													as: "componentElementDetails",
												},
											],
										},
									],
								},
							],
						};
			const uniqueEntries = await db.salaryStructure.findAll(query);

			return respHelper(res, {
				status: 200,
				data: uniqueEntries,
			});
		} catch (e) {
			console.log(e);
		}
	}

	async createSalaryStructure(req, res) {
		try {
			const { error } = await validator.salaryStructureCreateSchema.validate(
				req.body.data,
			);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0].message,
				});
			}

			let requestedObject = req.body.data,
				responseObject,
				respMessage;
			//Checking for exising Salary Structure.....
			let existingSalaryStructure = await db.salaryStructure.findAll({
				where: {
					salaryStructureAutoId: requestedObject.salaryStructureAutoId,
				},
				raw: true,
			});
			///////////////Updating Salary Structure.//////////////////
			if (existingSalaryStructure.length > 0) {
				responseObject = await db.salaryStructure.update(
					{
						salaryStructureName: requestedObject.salaryStructureName.trim(),
						salaryStructureDes: requestedObject.salaryStructureDes,
						updatedBy: req.userData.id,
						updatedAt: new Date(),
						isActive: requestedObject.isActive,
						hasAnnuallyProration: requestedObject.hasAnnuallyProration,
						hasMonthlyProration: requestedObject.hasMonthlyProration,
						hasVariable: requestedObject.hasVariable,
					},
					{
						where: {
							salaryStructureAutoId: requestedObject.salaryStructureAutoId,
						},
					},
				);
				respMessage = "Salary Structure Updated";
			} else {
				responseObject = await db.salaryStructure.create({
					salaryStructureName: requestedObject.salaryStructureName,
					salaryStructureDes: requestedObject.salaryStructureName,
					isActive: requestedObject.isActive,
					createdAt: new Date(),
					createdBy: req.userData.id,
					hasAnnuallyProration: requestedObject.hasAnnuallyProration,
					hasMonthlyProration: requestedObject.hasMonthlyProration,
					hasVariable: requestedObject.hasVariable,
				});
				respMessage = "New Salary Structure Created";
			}
			for (const element of requestedObject.structureMappingDetails) {
				console.log(responseObject);

				let salaryStructureAutoId =
					existingSalaryStructure.length == 0
						? responseObject.dataValues.salaryStructureAutoId
						: requestedObject.salaryStructureAutoId;
				let salryStructureComponentMapping =
					await db.salarystructurecomponentmapping.findAll({
						where: {
							salaryComponentAutoId: element.salaryComponentAutoId,
							salaryStructureAutoId: salaryStructureAutoId,
						},
						raw: true,
					});
				///////////////Updating Salary Structure.//////////////////
				if (salryStructureComponentMapping.length > 0) {
					let existingElementMapped = await db.salarycomponentmapping.findAll({
						where: {
							salaryStructurecomponentmappingAutoId:
								salryStructureComponentMapping[0]
									.salaryStructurecomponentmappingAutoId,
							salaryComponentElementAutoId:
								element.salaryComponentElementAutoId,
						},
						raw: true,
					});

					if (existingElementMapped.length == 0) {
						await db.salarycomponentmapping.create({
							salaryComponentAutoId:
								salryStructureComponentMapping[0].salaryComponentAutoId,
							salaryStructurecomponentmappingAutoId:
								salryStructureComponentMapping[0]
									.salaryStructurecomponentmappingAutoId,
							elementValue: element.elementValue,
							salaryComponentElementAutoId:
								element.salaryComponentElementAutoId,
						});
					} else {
						await db.salarycomponentmapping.update(
							{
								salaryComponentAutoId:
									salryStructureComponentMapping[0].salaryComponentAutoId,
								elementValue: element.elementValue,
								salaryComponentElementAutoId:
									element.salaryComponentElementAutoId,
							},
							{
								where: {
									salaryStructurecomponentmappingAutoId:
										salryStructureComponentMapping[0]
											.salaryStructurecomponentmappingAutoId,
									salaryComponentElementAutoId:
										element.salaryComponentElementAutoId,
								},
							},
						);
					}
				} else {
					let mappedSalaryComponent =
						await db.salarystructurecomponentmapping.create({
							salaryComponentAutoId: element.salaryComponentAutoId,
							salaryStructureAutoId: salaryStructureAutoId,
						});
					await db.salarycomponentmapping.create({
						salaryComponentAutoId:
							mappedSalaryComponent.dataValues.salaryComponentAutoId,
						salaryStructurecomponentmappingAutoId:
							mappedSalaryComponent.dataValues
								.salaryStructurecomponentmappingAutoId,
						elementValue: element.elementValue,
						salaryComponentElementAutoId: element.salaryComponentElementAutoId,
					});
				}
			}

			return respHelper(res, {
				status: 200,
				data: responseObject,
				msg: respMessage,
			});
		} catch (e) {
			console.log(e);
		}
	}

	async getSalaryComponentList(req, res) {
		try {
			let requestedObject = req.body.data,
				responseObject,
				respMessage;
			//Checking for exising Salary Structure.....
			let existingSalaryComponents = await db.salaryComponent.findAll({
				where: {
					isActive: 1,
				},
				attributes: [
					"salaryComponentCode",
					"salaryComponentAutoId",
					"salaryComponentAlias",
					"salaryComponentTaxComputationGroup",
					"salaryComponentItDeclaration",
					"salaryComponentEarningType",
				],
				raw: true,
			});
			///////////////Updating Salary Structure.//////////////////
			return respHelper(res, {
				status: 200,
				data: existingSalaryComponents,
				msg: "Salary Component List",
			});
		} catch (e) {
			console.log(e);
		}
	}

	async getDefaultSalaryStructure(req, res) {
		try {
			const defaultComponent = await db.salaryComponent.findAll({
				where: {
					isDefault: 1,
				},
				order: [["compulsoryComponent", "DESC"]],
			});

			const defaultComponentElement = await db.salarycomponentelement.findAll({
				where: { isDefault: 1 },
			});

			const salaryStructure = {
				salaryStructureAutoId: 0,
				salaryStructureName: "",
				salaryStructureDes: "",
				createdAt: 0,
				createdBy: "0",
				updatedBy: "0",
				updatedAt: 0,
				isActive: 1,
				structureMappingDetails: [],
			};

			defaultComponent.forEach((component) => {
				if (component.isActive) {
					// Only include active components
					const mappingDetail = {
						salaryComponentAutoId: component.salaryComponentAutoId,
						salaryStructureAutoId: salaryStructure.salaryStructureAutoId,
						salaryStructurecomponentmappingAutoId: 1, // Assuming static for example
						componentDetails: {
							salaryComponentCode: component.salaryComponentCode,
							salaryComponentAlias: component.salaryComponentAlias, // Assuming empty as per your requirement
							salaryComponentEarningType: component.salaryComponentEarningType,
							compulsoryComponent: component.compulsoryComponent,
						},
						componentMappedDetails: [],
					};

					// Create component mapping details based on your needs
					defaultComponentElement.forEach((element) => {
						if (element.isActive) {
							// Only include active elements
							mappingDetail.componentMappedDetails.push({
								salaryComponentElementAutoId:
									element.salaryComponentElementAutoId,
								salaryComponentAutoId: component.salaryComponentAutoId,
								elementValue: "0", // Assuming static value
								componentElementDetails: {
									salaryComponentElementAutoId:
										element.salaryComponentElementAutoId,
									salaryComponentElementName:
										element.salaryComponentElementName,
									salaryComponentElementCode:
										element.salaryComponentElementCode,
								},
							});
						}
					});

					salaryStructure.structureMappingDetails.push(mappingDetail);

					//console.log(salaryStructure.structureMappingDetails);
				}
			});
			return respHelper(res, {
				status: 200,
				data: [salaryStructure],
			});
		} catch (e) {
			console.log(e);
		}
	}

	async uploadCTC(req, res) {
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			}

			// get financial year
			let financialYearDetails = await paymentHelper.getFinancialYear();

			///////////////If File is provided by the users//////////////////
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			var Employees = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			if (!isNaN(Employees[0]["Effective Date"])) {
				console.log(
					paymentHelper.getFromattedDate(Employees[0]["Effective Date"]),
				);
			}
			let errorArray = [],
				successArray = [];
			for (const employee of Employees) {
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
					return respHelper(res, {
						status: 400,
						msg:
							"Salary Structure With Name " +
							employee["Salary Structure"] +
							" Not Found.",
					});
				}
				const error = await validator.createDynamicPayPackageSchema(
					structureDetails,
					employee,
				);

				if (error) {
					errorArray.push({
						index: errorArray.length + 1,
						employeeID: employee["Employee ID"],
						errorDetails: error.details[0].message,
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

				// console.log("**"+employee["Employee ID"]+"***");

				// return

				if (!employeeDetails) {
					console.log(
						"Employee not found or inactive" +
							" for empId : " +
							employee["Employee ID"],
					);
					errorArray.push({
						index: errorArray.length + 1,
						employeeID: employee["Employee ID"],
						errorDetails: "Employee not found",
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
					//let includeOTNOT=['OTC','Earning','Balancing'].includes(element['structureMappingDetails.componentDetails.salaryComponentEarningType']) && element['structureMappingDetails.salarycomponentmapping.elementValue']==0?"Will Include":"Will Not Include";
					// console.log(element['structureMappingDetails.componentDetails.salaryComponentCode']+"  ::: "+includeOTNOT);//[0]['structureMappingDetails.salarycomponentmapping.elementValue']);
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
				console.log(
					employee["Employee ID"] + "--" + employee["CTC"],
					ctcFromComponent,
				);

				if (employee["CTC"] == ctcFromComponent) {
					////////////////Match the ctc///////
					//console.log('CTC Matched',employee['Name']);
					let existingPackage = await db.payPackage.findOne({
						where: { EmployeeId: employeeDetails.id },
						order: [["payPackageAutoId", "DESC"]],
						raw: true,
					});
					employee["Effective Date"] = !isNaN(employee["Effective Date"])
						? paymentHelper.getFromattedDate(employee["Effective Date"])
						: employee["Effective Date"];
					const [day, month, year] = employee["Effective Date"]
						.split("-")
						.map(Number);
					if (
						existingPackage &&
						new Date(existingPackage.payPackageEffectiveDate).setHours(
							0,
							0,
							0,
						) > new Date(year, month - 1, day).setHours(0, 0, 0)
					) {
						errorArray.push({
							index: errorArray.length + 1,
							employeeID: employee["Employee ID"],
							errorDetails:
								"The current effective date can not be smaller than the last effective date.",
						});
						continue;
					} else if (
						employeeDetails &&
						new Date(employeeDetails.dateOfJoining).setHours(0, 0, 0) >
							new Date(year, month - 1, day).setHours(0, 0, 0)
					) {
						errorArray.push({
							index: errorArray.length + 1,
							employeeID: employee["Employee ID"],
							errorDetails:
								"Current Effective-Date can not be less than employee joining date",
						});
						continue;
					} else {
						let packageInserted = await db.payPackage.create(
							{
								EmployeeId: employeeDetails.id,
								payPackageFinancialYear:
									financialYearDetails?.financialYearName,
								financialYearId: financialYearDetails?.financialYearId,
								payPackageEffectiveDate: formatDate(year, month, day), //new Date(year, month - 1, day),
								payPackageMonthlyCTC: employee["CTC"],
								payPackageSalaryStructure:
									structureDetails[0].salaryStructureName, // employee["Salary Structure"],
								payPackageTotalCTC: employee["CTC"],
								payPackageType: "Monthly",
								salaryStructureAutoId:
									structureDetails[0].salaryStructureAutoId,
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
							if (
								exisingPayElement.length == 0 &&
								employee[componentName] > 0
							) {
								await db.payElements.create({
									EmployeeId: employeeDetails.id,
									salaryComponentAutoId:
										salaryComponent[
											"structureMappingDetails.componentDetails.salaryComponentAutoId"
										],
									payPackageAutoId: packageInserted.dataValues.payPackageAutoId,
									payElementAmount: employee[componentName],
									payElementEffectiveFrom: formatDate(year, month, day),
									payElementEffectiveTo: formatDate(year, month, day),
									createdBy: req.userData.id,
									createdAt: new Date(),
									isActive: 1,
								});
								//console.log(insertedNewElement);
							}
						}
						successArray.push({
							index: successArray.length + 1,
							employeeID: employee["Employee ID"],
							successDetails: "CTC Uploaded Successfully",
						});
					}
				} else {
					errorArray.push({
						index: errorArray.length + 1,
						employeeID: employee["Employee ID"],
						errorDetails: "CTC not matched with component",
					});
					////////////////Do not Matched the ctc///////
					// console.log("CTC Not Matched", employee["Name"]);
				}
			}
			return respHelper(res, {
				status: 200, //successArray.length>0?200:400,
				data: { successArray, errorArray },
				msg:
					successArray.length > 0
						? "Package mapped with " + successArray.length + " employees"
						: "Unable to map package",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async initiateSalary(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}

			// fetch financial year id from year

			let financialYearDetails = await db.financialYearMaster.findOne({
				where: { year: value.selectedYear },
				attributes: ["financialYearId"],
				raw: true,
			});

			let ids = value.departmentId.split(",");
			let allEmployeeQuery = await paymentHelper.query(
				value.departmentId == 0 ? 25 : 19,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
			const result = await db.sequelize.query(allEmployeeQuery);

			if (result[0].length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "No data to process.",
				});
			}

			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnVAlue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			if (returnVAlue.length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "No data to process.",
				});
			}
			const newArray = result[0].filter((item) =>
				returnVAlue.avalialbleEmployees.includes(item.EmployeeId),
			);

			let newProcess = await db.payProcessMaster.create(
				{
					name: "Initial Process",
					description: "Initial Procesd Details Description",
					status: 1,
					payMonth: req.body.paymonth,
					createdBy: req.userData.id,
					createdAt: new Date(),
					isActive: 1,
					processFlowId: 1,
					companyId: value.companyId,
					financialYearId: financialYearDetails?.financialYearId,
					filterType: value.departmentId === "0" ? 1 : 0,
				},
				{ raw: true, attributes: ["payProcessAutoId", "payMonth"] },
			);
			console.log(newProcess);
			const updatedArray = await newArray.map((item) => ({
				EmployeeId: item.EmployeeId,
				EmployeeName: item.EmployeeName,
				createdBy: req.userData.id,
				createdAt: new Date(),
				proceessId: newProcess.dataValues.payProcessMasterAutoId,
				payStatus: 1,
				isActive: 1,
				payRemark: "Salary Initiated",
				salaryMonth: newProcess.dataValues.payMonth,
				payMonth: newProcess.dataValues.payMonth,
				companyId: value.companyId,
			}));
			await db.payProcessDetails.bulkCreate(updatedArray).then((resp) => {
				processSalary({
					processId: newProcess.dataValues.payProcessMasterAutoId,
					req,
				});
			});

			return respHelper(res, {
				status: 200,
				msg: "Successfully Initiated Salary Process",
				data: {
					proceessId: newProcess.dataValues.payProcessMasterAutoId,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	//////////////////////////////UPLOAD SECTION///////////////////////////////////
	async processSalaryAPI(req, res) {
		let actualWorkingDays = await paymentHelper.actualWorkingDays({
			payYear: 2020,
			payMonth: 1,
			employeeId: 1119,
		});

		console.log(actualWorkingDays);
		return;

		let { processId } = req.body;
		var errorArray = [];
		let queryForAllExecutableEmployee = `SELECT pm.payMonth, pd.* FROM payprocessdetails pd JOIN  payprocessmaster pm ON pd.proceessId = pm.payProcessMasterAutoId Where pm.payProcessMasterAutoId= ${processId} AND pd.payStatus in (1);`;
		const result = await db.sequelize.query(queryForAllExecutableEmployee);
		if (result[0].length > 0) {
			const employeeIds = result[0].map((item) => item.EmployeeId);
			const totalWorkingDays = await paymentHelper.getDaysInCurrentMonth({
				year: result[0][0].payMonth.split("-")[0],
				month: result[0][0].payMonth.split("-")[1],
			});
			const salaryRegisterArray = [],
				errorProcessed = [];
			let employees = employeeIds; //[484,560];//employeeIds
			for (const employee of employees) {
				const queryForEmployeePayDetails = await paymentHelper.query(
					11,
					employee,
					{ payMonth: result[0][0].payMonth },
				);
				const employeeDetailsComponentWise = await db.sequelize.query(
					queryForEmployeePayDetails,
				);

				// console.log(employeeDetailsComponentWise);
				const queryForExtraDeductions = await paymentHelper.query(
					14,
					employee,
					result[0][0].payMonth,
				);
				const extraDeductonsDetails = await db.sequelize.query(
					queryForExtraDeductions,
				);
				const payPackageMonthlyCTC =
					parseFloat(
						employeeDetailsComponentWise?.[0]?.[0]?.payPackageMonthlyCTC,
					) || 0;

				const lopDays =
					parseFloat(employeeDetailsComponentWise?.[0]?.[0]?.lopDays) || 0;

				const lopMonthWiseCalculation =
					totalWorkingDays > 0
						? ((payPackageMonthlyCTC / totalWorkingDays) * lopDays).toFixed(2)
						: "0.00";
				const deductionOfLopMonthAmount = Math.max(
					0,
					payPackageMonthlyCTC - parseFloat(lopMonthWiseCalculation),
				);

				async function getMonthAbbreviation(month) {
					const monthNames = [
						"jan",
						"feb",
						"mar",
						"apr",
						"may",
						"jun",
						"jul",
						"aug",
						"sep",
						"oct",
						"nov",
						"dec",
					];

					const monthIndex = parseInt(month, 10) - 1; // Convert to zero-based index
					return monthNames[monthIndex] || "";
				}

				const month = result[0][0].payMonth.split("-")[1];
				const currentMonth = await getMonthAbbreviation(month);

				const ptDynamicAttribute = [currentMonth, "ptAmount"];
				const lwfDynamicAttribute = [currentMonth, "lwfAmount"];
				const ptDeducationDetails = await db.paymentDetails.findOne({
					attributes: [
						"paymentId",
						"userId",
						"ptLocationId",
						"ptApplicability",
						"ptStateId",
					],
					where: { userId: employee },
					raw: true,
					nest: true,
					include: [
						{
							model: db.ptLocationMaster,
							attributes: ["ptLocationId", "ptLocationCode", "stateId"],
							include: [
								{
									model: db.ptMapping,
									attributes: [
										"ptmappingId",
										"minValue",
										"maxValue",
										ptDynamicAttribute,
									],
									required: false,
									where: {
										[Op.and]: [
											{ minValue: { [Op.lte]: deductionOfLopMonthAmount } },
											{ maxValue: { [Op.gte]: deductionOfLopMonthAmount } },
										],
									},
								},
							],
						},
					],
				});

				const lwfDeducationDetails = await db.jobDetails.findOne({
					attributes: [
						"jobId",
						"lwfApplicable",
						"pfApplicability",
						"pfRestricted",
						"esicApplicable",
						"lwfDesignation",
						"lwfState",
					],
					where: {
						userId: employee,
					},
					raw: true,
				});

				let lwfAmount = 0;
				let lwfMappingDetails = null;
				if (lwfDeducationDetails && lwfDeducationDetails.lwfApplicable === 1) {
					lwfMappingDetails = await db.lwfMapping.findOne({
						attributes: ["lwfmappingId", "stateId", lwfDynamicAttribute], // Include the dynamic attribute here
						where: {
							lwfDesignationId: lwfDeducationDetails.lwfDesignation,
							stateId: lwfDeducationDetails.lwfState,
						},
						raw: true,
					});

					if (lwfMappingDetails) {
						lwfAmount = lwfMappingDetails.lwfAmount || 0; // Dynamically use the attribute value
					}
				}
				const extraPaymentAmount = await db.extraPayment.findOne({
					where: {
						EmployeeId: employee,
						paymentMonth: result[0][0].payMonth,
					},
					raw: true,
				});
				const ptAmount1 =
					ptDeducationDetails && ptDeducationDetails.ptApplicability == 1
						? ptDeducationDetails?.ptlocationmaster?.ptmapping?.ptAmount
						: 0;

				const lwfAmount1 = lwfAmount;
				const extraPaymentAmount1 =
					extraPaymentAmount != null ? extraPaymentAmount?.paymentAmount : 0;
				// if (
				//   ptDeducationDetails &&
				//   ptDeducationDetails.ptApplicability == 1 && ptDeducationDetails.ptStateId == null
				// ) {
				//   await db.payProcessDetails.update(
				//     { payStatus: 101, payRemark: "Error with PT calculating" },
				//     {
				//       where: {
				//         EmployeeId: employee,
				//         proceessId: processId,
				//       },
				//     }
				//   );

				//   continue;
				// }
				if (
					!lwfMappingDetails &&
					lwfDeducationDetails &&
					lwfDeducationDetails.lwfApplicable == 1
				) {
					await db.payProcessDetails.update(
						{ payStatus: 101, payRemark: "Error with lwf calculating" },
						{
							where: {
								EmployeeId: employee,
								proceessId: processId,
							},
						},
					);

					continue;
				}
				if (!employeeDetailsComponentWise[0][0].payPackageAutoId) {
					await db.payProcessDetails.update(
						{ payStatus: 101, payRemark: "Pay Package Not Assigned." },
						{
							where: {
								EmployeeId: employee,
								proceessId: processId,
							},
						},
					);

					continue;
				}
				const queryForAffetElementCounts = await paymentHelper.query(
					13,
					employee,
					null,
				);
				const affectComponentCounts = await db.sequelize.query(
					queryForAffetElementCounts,
				);
				const lopSingleUnit = employeeDetailsComponentWise[0][0].lopDays
					? ((employeeDetailsComponentWise[0][0].payPackageMonthlyCTC /
							totalWorkingDays) *
							employeeDetailsComponentWise[0][0].lopDays) /
						affectComponentCounts[0][0].lopAffectCount
					: 0;
				for (const empCopntWiseDetl of employeeDetailsComponentWise[0]) {
					const queryForComponentConfiguration = await paymentHelper.query(
						12,
						empCopntWiseDetl.salaryComponentAutoId,
						null,
					);
					const componentConfiguration = await db.sequelize.query(
						queryForComponentConfiguration,
					);
					let includeInPayPackage =
						["Earning", "Balancing", "OTC"].includes(
							empCopntWiseDetl["salaryComponentEarningType"],
						) &&
						paymentHelper.getElementValue(
							"Exclude From Special Allowance",
							componentConfiguration[0],
						) == 0
							? 1
							: 0;
					empCopntWiseDetl["includeInPackage"] = includeInPayPackage;
					// empCopntWiseDetl["elementMonthlyAmount"] =
					//   paymentHelper.getElementValue(
					//     "Affect Loss Of Pay",
					//     componentConfiguration[0]
					//   ) == 1
					//     ? parseFloat(
					//         empCopntWiseDetl.payElementAmount - lopSingleUnit
					//       ).toFixed(2)
					//     : empCopntWiseDetl.payElementAmount;

					empCopntWiseDetl["elementMonthlyAmount"] =
						(await paymentHelper.getElementValue(
							"Affect Loss Of Pay",
							componentConfiguration[0],
						)) == 1
							? await paymentHelper.arrectLOP(
									empCopntWiseDetl.payElementAmount,
									employeeDetailsComponentWise[0][0].lopDays,
									totalWorkingDays,
								)
							: empCopntWiseDetl.payElementAmount;

					empCopntWiseDetl["totalExtraDeduction"] = extraDeductonsDetails[0][0]
						.totalDeduction
						? extraDeductonsDetails[0][0].totalDeduction
						: 0;
					empCopntWiseDetl["extraDeductionCategories"] =
						extraDeductonsDetails[0][0].deductionCategories
							? extraDeductonsDetails[0][0].deductionCategories
							: "";
					empCopntWiseDetl["createdAt"] = new Date();
					empCopntWiseDetl["createdBy"] = req.userData.id;
					empCopntWiseDetl["payMonth"] = result[0][0].salaryMonth;
					empCopntWiseDetl["ptAmount"] = ptAmount1;
					empCopntWiseDetl["lwfAmount"] = lwfAmount1;
					empCopntWiseDetl["extraPaymentAmount"] = extraPaymentAmount1;
					//////////////////////////////PF-Applicablity Keys////////////////////////
					let pafApplicableComponet = await paymentHelper.getElementValue(
						"Affect PF",
						componentConfiguration[0],
					);
					let esicApplicableComponent = await paymentHelper.getElementValue(
						"Affects ESIC",
						componentConfiguration[0],
					);
					empCopntWiseDetl["isPfApplicableComponent"] = pafApplicableComponet;
					empCopntWiseDetl["isPfApplicable"] =
						lwfDeducationDetails.pfApplicability;
					empCopntWiseDetl["isPfRestriction"] =
						lwfDeducationDetails.pfRestricted;
					empCopntWiseDetl["isEsicApplicable"] =
						lwfDeducationDetails.esicApplicable;
					empCopntWiseDetl["isEsicApplicableComponent"] =
						esicApplicableComponent;
					//////////////////////////////PF-Applicablity Keys//////////////////////////////////
					let existDetails = await db.payMonthlyElements.findOne({
						where: {
							empId: employee,
							salaryComponentAutoId: empCopntWiseDetl.salaryComponentAutoId,
							payMonth: result[0][0].payMonth,
						},
						raw: true,
					});

					if (!existDetails) {
						await db.payMonthlyElements.create(empCopntWiseDetl);
					}
				}

				let payElementComponents = await db.payMonthlyElements.findAll({
					where: {
						empId: employee,
						isPfApplicableComponent: 1,
						payMonth: result[0][0].payMonth,
					},
					raw: true,
				});
				///////////////Calculation And Updation of PF Amount //////////////////////
				let calculatedPF =
					await paymentHelper.getCalculatedPF(payElementComponents);
				let getCalculatedESIC =
					await paymentHelper.getCalculatedESIC(payElementComponents);
				await db.payMonthlyElements.update(
					{
						esicEmployerAmount: getCalculatedESIC.calculatedEmployerESIC,
						esicEmployeeAmount: getCalculatedESIC.calculatedEmployeeESIC,
						pfEmployeeAmount: calculatedPF,
						pfEmployerAmount: calculatedPF,
					},
					{ where: { empId: employee, payMonth: result[0][0].payMonth } },
				);
				///////////////Calculation And Updation of ESIC Amount //////////////////////

				await db.payProcessDetails.update(
					{ payStatus: 2, payRemark: "Salary Processed." },
					{
						where: {
							EmployeeId: employee,
							proceessId: processId,
						},
					},
				);
			}
			db.payProcessMaster.update(
				{ processFlowId: 4 },
				{ where: { payProcessMasterAutoId: processId } },
			);
		} else {
			console.log("NO Data For Processing >>>>>>>>>");
		}
	}

	async arrearsUpload(req, res) {
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
			var errorArray = [],
				successArray = [];
			for (const employeeArrears of arrearsDetais) {
				let earningArears = {
					EmployeeId: employeeArrears["Employee ID"],
					arrearMonth: employeeArrears["Arrear Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeArrears['Arrear Month (YYYY-MM)'])),
					arrearPayMonth: employeeArrears["Arrear Pay Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeArrears['Arrear Pay Month (YYYY-MM)'])),//employeeArrears['Arrear Pay Month (YYYY-MM)'],
					arearDays: employeeArrears["Arrear Days"],
					arearType: employeeArrears["Arrear Type(New Joinee/LOP/Increment)"],
					hasPF: employeeArrears["Has PF Arrear? (Yes/No)"],
					computeESIC: employeeArrears["Compute ESIC Arrear (Yes/No)"],
					createdAt: new Date(),
				};

				const { error } =
					await validator.earningArrearsSchema.validate(earningArears);

				if (error) {
					errorArray.push({
						error: error.details[0].message,
						empId: earningArears.EmployeeId,
					});
					return respHelper(res, {
						status: 400,
						msg: error.details[0],
					});
				} else {
					let existArrear = await db.earningsArears.findOne({
						where: {
							EmployeeId: earningArears.EmployeeId,
							arrearMonth: earningArears.arrearMonth,
							arearType: earningArears.arearType,
						},
						raw: true,
					});

					if (existArrear) {
						await db.earningsArears.update(earningArears, {
							where: {
								EmployeeId: earningArears.EmployeeId,
								arrearMonth: earningArears.arrearMonth,
								arearType: earningArears.arearType,
							},
						});
						earningArears["ACTION_TYPE"] = "UPDATE";
					} else {
						await db.earningsArears.create(earningArears);
						earningArears["ACTION_TYPE"] = "CREATE";
					}
					successArray.push(earningArears);
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async tdsUpload(req, res) {
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
						where: { empCode: employeeTds["Employee ID"], isActive: 1 },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						errorArray.push({
							index: errorArray.length + 1,
							errorDetails: "Employee not found/ deactivated",
							employeeID: employeeTds["Employee ID"],
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
							error: error.details[0].message,
							empId: tdsDeductions.EmployeeId,
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
						successArray.push(tdsDeductions);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "TDS Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async extraPaymentUpload(req, res) {
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
			for (const employeeExtraPayment of tdsDetails) {
				if (employeeExtraPayment["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: {
							empCode: employeeExtraPayment["Employee ID"],
							isActive: 1,
						},
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						errorArray.push({
							index: errorArray.length,
							errorDetails: "Employee not exist.",
							employeeID: employeeExtraPayment["Employee ID"],
						});
						continue;
					}

					let extraPaymentCategory =
						await db.CompensationCategoryMaster.findOne({
							where: { name: employeeExtraPayment["Category"] },
							raw: true,
							attribute: ["compensationCategoryId", "name"],
						});

					// console.log(extraPaymentCategory);
					// return;
					if (!extraPaymentCategory) {
						errorArray.push({
							index: errorArray.length + 1,
							errorDetails:
								"Invalid Category Name " +
								"(" +
								employeeExtraPayment["Category"] +
								")",
							employeeID: employeeExtraPayment["Employee ID"],
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
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: employeeExtraPayment["Employee ID"],
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
						successArray.push(extraPayment);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Extra Payment Uploaded Successfully",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async lopUpload(req, res) {
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
						where: { empCode: employeeTds["Employee ID"], isActive: 1 },
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
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: lopDeductions.empCode,
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
						successArray.push(lopDeductions);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Lop Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async extraDeductionsUpload(req, res) {
		var errorArray = [],
			successArray = [];
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
						errorArray.push({
							index: errorArray.length + 1,
							employeeID: employeeExtraDeduction["Employee ID"],
							errorDetails: error.details[0].message,
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
							index: errorArray.length + 1,
							errorDetails:
								"Invalid Category Name " +
								"(" +
								employeeExtraDeduction["Advance Category"] +
								")",
							employeeID: employeeExtraDeduction["Employee ID"],
						});
						continue;
					}

					let employeeDetais = await db.employeeMaster.findOne({
						where: {
							empCode: employeeExtraDeduction["Employee ID"],
							isActive: 1,
						},
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						errorArray.push({
							index: errorArray.length + 1,
							employeeID: employeeExtraDeduction["Employee ID"],
							errorDetails: "Employee Not Exists or Acive Anymore.",
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
					successArray.push(extraDeductions);
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Extra Deduction Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	//////////////////////////////UPLOAD SECTION///////////////////////////////////

	async getCompanyList(req, res) {
		try {
			let companyList = await db.companyMaster.findAll({
				where: { isActive: 1 },
				raw: true,
				attributes: ["companyId", "companyName"],
			});
			///////////////If File is provided by the users//////////////////
			return respHelper(res, {
				status: 200,
				data: companyList,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getPayGroupsList(req, res) {
		try {
			let paygroupList = await db.departmentMaster.findAll({
				where: { isActive: 1 },
				raw: true,
				attributes: ["departmentId", "departmentName"],
			});
			///////////////If File is provided by the users//////////////////
			let allEmployee = {
				departmentId: 0,
				departmentName: "All Employees",
			};
			paygroupList.unshift(allEmployee);
			return respHelper(res, {
				status: 200,
				data: paygroupList,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async employeesCountForProcess(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}

			let ids = value.departmentId.split(",");
			console.log("Department ID :: " + value.departmentId);

			let employeeForProcessingQuery = await paymentHelper.query(
				value.departmentId == 0 ? 24 : 20,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
			console.log(employeeForProcessingQuery);
			let employeeForProcessing = await db.sequelize.query(
				employeeForProcessingQuery,
			);
			if (
				!employeeForProcessing[0][0] ||
				employeeForProcessing[0][0].length > 0
			) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Data not available.",
				});
			}
			const employeeIds = employeeForProcessing[0].map(
				(employee) => employee.EmployeeId,
			);

			console.log(employeeIds);

			let processingCounts = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);
			return respHelper(res, {
				status: 200,
				data: {
					processed: processingCounts.processedEmployees.length,
					inProcess: processingCounts.inProcessedEployees.length,
					totalEmployee: employeeIds.length,
					available: processingCounts.avalialbleEmployees.length,
					processedData: processingCounts.processedEmployees,
					inProcessData: processingCounts.inProcessedEployees,
					totalEmployeeData: employeeIds,
					availableData: processingCounts.avalialbleEmployees,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getReviewEmployeeDetails(req, res) {
		try {
			const { error } = await validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}
			let payMonthYear = req.body.paymonth.split("-");
			let cutOffDate = payMonthYear[0] + "-" + payMonthYear[1] + "-" + "1";
			let currentDate =
				payMonthYear[0] + "-" + payMonthYear[1] + "-" + new Date().getDate();
			const { departmentId } = req.body;
			let commonQuery = {
				departmentId: { [Op.in]: departmentId.split(",") },
				isActive: 1,
				[Op.and]: [
					db.sequelize.where(
						db.sequelize.fn(
							"STR_TO_DATE",
							db.sequelize.col("dateOfJoining"),
							"%Y-%m-%d",
						),
						{ [Op.lt]: currentDate },
					),
				],
			};

			let allEmployee = await db.employeeMaster.findAll({
				where: commonQuery,
				raw: true,
				attributes: ["id"],
			});
			let employeeIds = allEmployee.map((employee) => employee.id);

			let queryForLastMontCarryForward = {
				id: { [Op.in]: employeeIds },
				payrollInclude: null,
				[Op.and]: [
					db.sequelize.where(
						db.sequelize.fn(
							"STR_TO_DATE",
							db.sequelize.col("dateOfJoining"),
							"%Y-%m-%d",
						),
						{ [Op.lt]: cutOffDate },
					),
				],
			};

			let querynewJoineeCurrentMont = {
				id: { [Op.in]: employeeIds },
				isActive: 1,
				payrollInclude: null,
				[Op.and]: [
					db.sequelize.where(
						db.sequelize.fn(
							"STR_TO_DATE",
							db.sequelize.col("dateOfJoining"),
							"%Y-%m-%d",
						),
						{ [Op.and]: [{ [Op.gte]: cutOffDate }, { [Op.lt]: currentDate }] },
					),
				],
			};

			let queryForReincluded = {
				id: { [Op.in]: employeeIds },
				isActive: 1,
				payrollInclude: 1,
				[Op.and]: [
					db.sequelize.where(
						db.sequelize.fn(
							"STR_TO_DATE",
							db.sequelize.col("dateOfJoining"),
							"%Y-%m-%d",
						),
						{ [Op.lt]: currentDate },
					),
				],
			};

			let queryForExcludeFromCurrentProcess = {
				id: { [Op.in]: employeeIds },
				isActive: 1,
				payrollInclude: 2, //1-Include, 2--exclude
				[Op.and]: [
					db.sequelize.where(
						db.sequelize.fn(
							"STR_TO_DATE",
							db.sequelize.col("dateOfJoining"),
							"%Y-%m-%d",
						),
						{ [Op.lt]: currentDate },
					),
				],
			};

			let balanceFromLast = await db.employeeMaster.findAll({
				where: queryForLastMontCarryForward,
				attributes: ["id"],
			});
			let newJoineeCurrentMont = await db.employeeMaster.findAll({
				where: querynewJoineeCurrentMont,
				attributes: ["id"],
			});
			let reincludedForCurrentMonth = await db.employeeMaster.findAll({
				where: queryForReincluded,
				attributes: ["id"],
			});

			let alreadyProcessed = [];
			// await db.salaryRegister.findAll({
			//   where: { processingStatus: 2, EmployeeId: { [Op.in]: employeeIds } },
			// });
			//1-In-Process/2-Processed/3-Failed
			let excludeFromCurrentProcess = await db.employeeMaster.findAll({
				where: queryForExcludeFromCurrentProcess,
				attributes: ["id"],
			});

			let missingSalaryInformation = await db.employeeMaster.findAll({
				where: {
					id: { [Op.in]: employeeIds }, // Filter by employeeIds
				},
				attributes: ["id"],
				include: [
					{
						model: db.payPackage,
						as: "packageDetails",
						required: false, // Makes the join optional, meaning employees without pay package details will also be included
						where: {
							payPackageAutoId: null, // Filter for employees with no associated pay package
						},
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: {
					includedForProcess: {
						balaceFromLastMonth: balanceFromLast.length,
						newJoineeCurrent: newJoineeCurrentMont.length,
						reincluded: reincludedForCurrentMonth.length,
						totalIncluded:
							balanceFromLast.length +
							newJoineeCurrentMont.length +
							reincludedForCurrentMonth.length,
					},
					excludedForProcess: {
						fnfEmployee: 0,
						alreadyProcessed: alreadyProcessed.length,
						excludeAtProcessLevel: excludeFromCurrentProcess.length,
						missingProfieInfo: missingSalaryInformation.length,
						totalExcluded:
							alreadyProcessed.length +
							excludeFromCurrentProcess.length +
							missingSalaryInformation.length,
					},
					parollBlockers: {
						ctcNotAssigned: missingSalaryInformation.length,
					},
					parollNonBlockers: {
						bankDetails: 0,
					},
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async lopSyncing(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}
			let workingDaysOfMonth = await paymentHelper.getDaysInCurrentMonth({
				year: value.paymonth.split("-")[0],
				month: value.paymonth.split("-")[1],
			});
			let ids = value.departmentId.split(",");

			// get financial year
			let financialYearDetails = await paymentHelper.getFinancialYear();

			let allEmployeeQuery = await paymentHelper.query(
				value.departmentId == 0 ? 25 : 19,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
			const result = await db.sequelize.query(allEmployeeQuery);
			if (result[0].length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "No data to process.",
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnVAlue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);
			var totalLopAmount = 0,
				totalLOPDays = 0;
			let lopDeductions = await db.lopDeductions.findAll({
				where: {
					EmployeeId: { [Op.in]: returnVAlue.avalialbleEmployees },
					lopMonth: req.body.paymonth,
				},
				raw: true,
			});

			for (const lopSingleDetails of lopDeductions) {
				let payPackageDetails = await db.payPackage.findOne({
					where: {
						EmployeeId: lopSingleDetails.EmployeeId,
						payPackageFinancialYear: financialYearDetails?.financialYearName,
					},
					attributes: ["payPackageMonthlyCTC"],
					raw: true,
				});
				let lopAmount =
					(payPackageDetails.payPackageMonthlyCTC / workingDaysOfMonth) *
					lopSingleDetails.lopDays;
				totalLopAmount = lopAmount + totalLopAmount;
				totalLOPDays =
					parseFloat(lopSingleDetails.lopDays) + parseFloat(totalLOPDays);
			}
			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: lopDeductions.length,
					lopAmount: totalLopAmount.toFixed(2),
					totalLOPDays: parseFloat(totalLOPDays).toFixed(1),
					impactedEmployeeDetails: lopDeductions,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async tdsSyncing(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}
			let ids = value.departmentId.split(",");
			let allEmployeeQuery = await paymentHelper.query(
				value.departmentId == 0 ? 25 : 19,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
			const result = await db.sequelize.query(allEmployeeQuery);
			if (result[0].length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "No data to process.",
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnVAlue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);
			var totalTdsAmount = 0,
				totalLOPDays = 0;

			let tdsDeductions = await db.tdsDeductions.findAll({
				where: {
					EmployeeId: { [Op.in]: returnVAlue.avalialbleEmployees },
					tdsMonth: req.body.paymonth,
				},
				raw: true,
			});

			console.log(tdsDeductions);
			for (const tdsSingleDetails of tdsDeductions) {
				console.log(tdsSingleDetails);

				totalTdsAmount += parseFloat(tdsSingleDetails.tdsAmount || 0);
			}
			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: tdsDeductions.length,
					tdsAmount: totalTdsAmount.toFixed(2),
					impactedEmployeeDetails: tdsDeductions,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async extraPaymentSyncing(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}
			let ids = value.departmentId.split(",");
			let allEmployeeQuery = await paymentHelper.query(
				value.departmentId == 0 ? 25 : 19,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
			const result = await db.sequelize.query(allEmployeeQuery);
			if (result[0].length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "No data to process.",
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnVAlue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);
			var totaPaymentAmount = 0,
				uniqueEmployeeImpacted = 0;
			let allDeductionQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(paymentAmount) AS paymentAmount FROM ${dbName}.extrapayment WHERE EmployeeId IN (${returnVAlue.avalialbleEmployees}) AND paymentMonth = '${req.body.paymonth}' GROUP BY EmployeeId, empCode;`;
			let extraPayments = await db.sequelize.query(allDeductionQuery);
			for (const singleEmployeePayment of extraPayments[0]) {
				console.log(singleEmployeePayment);
				totaPaymentAmount += parseFloat(
					singleEmployeePayment.paymentAmount || 0,
				);
				uniqueEmployeeImpacted =
					singleEmployeePayment.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}
			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					paymentAmount: totaPaymentAmount.toFixed(2),
					impactedEmployeeDetails: extraPayments[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async extraDeductionSyncing(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}
			let ids = value.departmentId.split(",");
			let allEmployeeQuery = await paymentHelper.query(
				value.departmentId == 0 ? 25 : 19,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
			const result = await db.sequelize.query(allEmployeeQuery);
			if (result[0].length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "No data to process.",
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnVAlue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);
			var totalExtraDeductionsAmount = 0;
			let allDeductionQuery = `SELECT empCode AS EmployeeId, SUM(deductionAmount) AS TotalDeductionAmount FROM ${dbName}.extradeductions where EmployeeId in(${returnVAlue.avalialbleEmployees.join(
				",",
			)}) and startMonth='${value.paymonth}' GROUP BY empCode `;

			console.log("Deduction Query ::" + allDeductionQuery);

			if (employeeIds.length > 0) {
				let extraDeductions = await db.sequelize.query(allDeductionQuery);
				console.log(extraDeductions[0]);
				for (const extraDeductionSingleDetails of extraDeductions[0]) {
					totalExtraDeductionsAmount += parseFloat(
						extraDeductionSingleDetails.TotalDeductionAmount || 0,
					);
				}
				return respHelper(res, {
					status: 200,
					data: {
						impactedEmployee: extraDeductions[0].length,
						extraDeductionAmount: totalExtraDeductionsAmount.toFixed(2),
						impactedEmployeeDetatils: extraDeductions[0],
					},
				});
			} else {
				return respHelper(res, {
					status: 200,
					data: {
						impactedEmployee: 0,
						extraDeductionAmount: 0,
					},
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async exportSalaryRegister(req, res) {
		try {
			let { processId } = req.body;
			let returnArray = [];
			const queryForProcessedEmploye = await paymentHelper.query(
				17,
				processId,
				null,
			);
			const processedEmployee = await db.sequelize.query(
				queryForProcessedEmploye,
			);
			const employeeIds = processedEmployee[0].map((item) => item.empId);
			const query = await paymentHelper.query(
				1,
				processedEmployee[0][0]["payMonth"],
				employeeIds,
			);

			const result = await db.sequelize.query(query);
			const processedData = groupByEmployeeId(result[0]);
			return respHelper(res, {
				status: 200,
				data: processedData,
			});
		} catch (e) {
			console.log(e);
		}
	}

	// async generatePaySlip(req, res) {
	//   try {
	//     let { processId } = req.body;
	//     let queryForCurrentProcessStatus = await paymentHelper.query(15,processId,null);
	//     let currentProcessStatus = await db.sequelize.query(queryForCurrentProcessStatus);
	//     if(currentProcessStatus[0][0].currentstatus==6)
	//     {
	//       let queryForPayMonthlyElementsForSalarySlip = await paymentHelper.query(16,currentProcessStatus[0][0].payMonth,null);
	//       let payElements = await db.sequelize.query(queryForPayMonthlyElementsForSalarySlip);

	//       console.log(payElements[0])
	//       for (const payMonthlyElement of payElements[0]) {
	//         let isExistPaySlip = await db.paySlips.findOne({where:{
	//           EmployeeId:payMonthlyElement.empId,
	//           paySlipMonth:payMonthlyElement.payMonth.split("-")[1],
	//           paySlipYear:payMonthlyElement.payMonth.split("-")[0]
	//         },raw:true});
	//         let currentMonth=payMonthlyElement.payMonth.split("-")[1];
	//         let currentYear=payMonthlyElement.payMonth.split("-")[0];
	//         let totalWorkingDays =paymentHelper.getDaysInCurrentMonth({month:payMonthlyElement.payMonth.split("-")[1],year:payMonthlyElement.payMonth.split("-")[0]});
	//         let paySlipDuration= `01/${parseInt(currentMonth)+1}/${currentYear}-${totalWorkingDays}/${parseInt(currentMonth)+1}/${currentYear}`;
	//         let paySlipAutoId=isExistPaySlip?isExistPaySlip.paySlipAutoId:null;

	//         if(!isExistPaySlip)
	//         {
	//           let customeDeduction=[];
	//           let totalPayslipDeductons=parseFloat(payMonthlyElement.totalExtraDeduction)+parseFloat(payMonthlyElement.totalComponentDeductions);

	//           let PaySlipNetPay = parseFloat(payMonthlyElement.paySlipGrossEarning)-(parseFloat(payMonthlyElement.tdsAmount)+parseFloat(payMonthlyElement.totalExtraDeduction))
	//           isExistPaySlip= await db.paySlips.create({
	//             EmployeeId:payMonthlyElement.empId,
	//             paySlipMonth:payMonthlyElement.payMonth.split("-")[1],
	//             paySlipYear:payMonthlyElement.payMonth.split("-")[0],
	//             paySlipFinancialYear:'2024-25',
	//             paySlipDuration:paySlipDuration,
	//             paySlipTotalDays:totalWorkingDays,
	//             paySlipWorkingDays:totalWorkingDays-payMonthlyElement.lopDays,
	//             paySlipAbsentDays:payMonthlyElement.lopDays,
	//             paySlipArrearDays:payMonthlyElement.arrearDays,
	//             paySlipGrossEarning:payMonthlyElement.paySlipGrossEarning,
	//             paySlipTotalPay:payMonthlyElement.paySlipTotalPay,
	//             paySlipNetPay:PaySlipNetPay,
	//             paySlipTotalDeduction:totalPayslipDeductons,
	//             paySlipTDS:payMonthlyElement.tdsAmount,
	//             createdBy:req.userData.id,
	//             isActive:1,
	//             paySlipStatus:0,
	//             createdAt:new Date(),
	//           });

	//           console.log(isExistPaySlip);
	//           paySlipAutoId=isExistPaySlip.dataValues.paySlipAutoId?isExistPaySlip.dataValues.paySlipAutoId:paySlipAutoId;

	//           if(payMonthlyElement.tdsAmount>0)
	//           {
	//             customeDeduction.push({
	//               EmployeeId:payMonthlyElement.empId,
	//               paySlipAutoId:paySlipAutoId,
	//               salaryComponentAutoId:0,
	//               paySlipComponentName:"TDS",
	//               paySlipComponentAmount:payMonthlyElement.tdsAmount,
	//               paySlipComponentType:'Deduction',
	//               createdBy:req.userData.id,
	//               createdAt:new Date()
	//             });
	//           }

	//           if(payMonthlyElement.totalExtraDeduction>0)
	//             {
	//               customeDeduction.push({
	//                 EmployeeId:payMonthlyElement.empId,
	//                 paySlipAutoId:paySlipAutoId,
	//                 salaryComponentAutoId:0,
	//                 paySlipComponentName:"Extra Deduction",
	//                 paySlipComponentAmount:payMonthlyElement.totalExtraDeduction,
	//                 paySlipComponentType:'Deduction',
	//                 createdBy:req.userData.id,
	//                 createdAt:new Date()
	//               });
	//             }

	//             await db.paySlipComponent.bulkCreate(customeDeduction);

	//         }
	//         let isExistPayElement = await db.paySlipComponent.findOne({where:{
	//           EmployeeId:payMonthlyElement.empId,
	//           paySlipAutoId:paySlipAutoId,
	//           salaryComponentAutoId:payMonthlyElement.salaryComponentAutoId
	//         },raw:true});

	//         if(!isExistPayElement)
	//         {
	//           await db.paySlipComponent.create({
	//             EmployeeId:payMonthlyElement.empId,
	//             paySlipAutoId:paySlipAutoId,
	//             salaryComponentAutoId:payMonthlyElement.salaryComponentAutoId,
	//             paySlipComponentName:payMonthlyElement.paySlipComponentName,
	//             paySlipComponentAmount:payMonthlyElement.elementMonthlyAmount,
	//             paySlipComponentType:payMonthlyElement.salaryComponentEarningType,
	//             createdBy:req.userData.id,
	//             createdAt:new Date()
	//           });

	//         }

	//       }
	//     }
	//     else
	//     {
	//       return respHelper(res, {
	//         status: 400,
	//         msg: "Porcess is not ready for salary generation",
	//       });
	//     }

	//     return respHelper(res, {
	//       status: 200,
	//       data:currentProcessStatus[0],
	//     });
	//   } catch (e) {
	//     console.log(e);
	//   }
	// }

	async processedEmployeeList(req, res) {
		try {
			let { processId } = req.body;
			let processedEmployees = await db.payProcessDetails.findAll({
				where: { proceessId: processId, payStatus: 2 }, // `proceessId` is not needed in the `where` clause if excluded
				raw: true,
			});

			if (processedEmployees.length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Data not available.",
				});
			}
			const employeeIds = processedEmployees.map((item) => item.EmployeeId);
			const query = await paymentHelper.query(2, employeeIds, 0);
			const result = await db.sequelize.query(query);
			return respHelper(res, {
				status: 200,
				data: result[0],
			});
		} catch (e) {
			console.log(e);
		}
	}

	async releasePaySlip(req, res) {
		try {
			let { processId, empIds } = req.body;

			if (!empIds) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Employee Details not found.",
				});
			}

			let employees = empIds.split(",");

			const queryEmloyeeAlreadyReleased = await paymentHelper.query(
				2,
				employees,
				1,
			);
			const resultAlreadyReleased = await db.sequelize.query(
				queryEmloyeeAlreadyReleased,
			);

			const releasedPaySlipFor = await db.paySlips.update(
				{ paySlipStatus: 1, updatedAt: new Date(), updatedBy: req.userData.id },
				{
					where: {
						paySlipStatus: 0,
						EmployeeId: { [Op.in]: employees },
					},
				},
			);

			return respHelper(res, {
				status: 200,
				data: {
					payslipAlreadyReleased: resultAlreadyReleased[0],
					paySlipReleasedFor: releasedPaySlipFor,
				},
				msg: "Pay Slip Released for " + releasedPaySlipFor[0] + " Employees.",
			});
		} catch (e) {
			console.log(e);
		}
	}

	async getMappedEmployeeWithSalaryStructure(req, res) {
		try {
			let { salaryStructureAutoId } = req.body;
			let getEmp = await db.payPackage.findAll({
				where: {
					salaryStructureAutoId: salaryStructureAutoId,
					isActive: 1,
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "empCode", "name", "buId", "designation_id"],
						include: [
							{
								model: db.buMaster,
								attributes: ["buId", "buName"],
								required: false,
							},
							{
								model: db.designationMaster,
								attributes: ["name"],
								required: false,
							},
						],
					},
				],
				raw: true,
				nest: true,
			});

			let formattedResponse = getEmp.map((item) => ({
				StructureName: item.payPackageSalaryStructure,
				EmployeeId: item.employee.empCode,
				EmployeeName: item.employee.name,
				BuName: item.employee.bumaster?.buName || "",
				DesignationName: item.employee.designationmaster?.name || "",
			}));

			return respHelper(res, {
				status: 200,
				data: formattedResponse,
				msg: "Employee List Fetched Successfully",
			});
		} catch (e) {
			console.log(e);
		}
	}

	async getWipProcessList(req, res) {
		try {
			const { error, value } = await validator.payMonthYearCheck.validate(
				req.body,
			);

			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error,
				});
			}

			let pay_year =
				value.pay_month == "01" ||
				value.pay_month == "02" ||
				value.pay_month == "03"
					? parseInt(value.pay_year) + 1
					: value.pay_year;

			let paymonth = pay_year + "-" + value.pay_month;

			const queryForMappedEmployeeList = await paymentHelper.query(
				4,
				[1, 2, 3, 4, 5, 6, 7, 8, 9],
				{ paymonth: paymonth, companyId: value.companyId },
			);

			const pendingProcessList = await db.sequelize.query(
				queryForMappedEmployeeList,
			);
			return respHelper(res, {
				status: 200,
				data: pendingProcessList[0],
				msg: "Employee List Fetched Successfully",
			});
		} catch (e) {
			console.log(e);
		}
	}

	async getNextAvailableStatuses(req, res) {
		try {
			let { processId } = req.body;
			if (!processId) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Pay Month Not Available",
				});
			}
			const queryForMappedEmployeeList = await paymentHelper.query(
				5,
				processId,
				null,
			);
			const pendingProcessList = await db.sequelize.query(
				queryForMappedEmployeeList,
			);
			const querForAvailableSatusList = await paymentHelper.query(
				7,
				pendingProcessList[0][0].currentstatus,
				null,
			);

			const nextAvailableStatus = await db.sequelize.query(
				querForAvailableSatusList,
			);
			return respHelper(res, {
				status: 200,
				data: nextAvailableStatus[0],
				msg: "Status List Fetched Successfully",
			});
		} catch (e) {
			console.log(e);
		}
	}

	async updateNextStatus(req, res) {
		try {
			let { processId, currentStatusId, nextStatusId } = req.body;

			const queryForMappedEmployeeList = await paymentHelper.query(
				6,
				currentStatusId,
				nextStatusId,
			);
			const getNextAvaiableFlow = await db.sequelize.query(
				queryForMappedEmployeeList,
			);

			if (getNextAvaiableFlow[0].length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Pay Process Flow Not Defined",
				});
			}

			if (nextStatusId == 7) {
				await generatePaySlip({ processId: processId, req });
			} else if (nextStatusId == 8) {
				await releasePaySlip({ processId: processId, req, nextStatusId });
			} else {
				await db.payProcessDetails.update(
					{ payStatus: nextStatusId },
					{ where: { proceessId: processId, payStatus: { [Op.ne]: [101] } } },
				);
			}

			if ([1, 2, 3, 4, 6, 7, 8, 9, 101].includes(nextStatusId)) {
				await db.payProcessMaster.update(
					{
						processFlowId: getNextAvaiableFlow[0][0].refferenceFlowId,
						updatedBy: req.userData.id,
						updatedAt: new Date(),
					},
					{ where: { payProcessMasterAutoId: processId } },
				);
			} else if (nextStatusId == 5) {
				await db.payProcessMaster.destroy({
					where: {
						payProcessMasterAutoId: processId,
					},
				});
				await db.payProcessDetails.destroy({
					where: {
						proceessId: processId,
					},
				});

				await db.payMonthlyElements.destroy({
					where: {
						processId: processId,
					},
				});
			}

			return respHelper(res, {
				status: 200,
				data: getNextAvaiableFlow[0],
				msg: getNextAvaiableFlow[0][0].currentRemark,
			});
		} catch (e) {
			console.log(e);
		}
	}
	async getProcessDetails(req, res) {
		try {
			let { processId } = req.body;
			if (!processId) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Process Id Not Available",
				});
			}
			let stepperDataQuery = null;
			const queryForProcessStatus = await paymentHelper.query(
				9,
				processId,
				null,
			);
			const currentProcessStatus = await db.sequelize.query(
				queryForProcessStatus,
			);
			console.log("currentProcessStatus", currentProcessStatus);
			if ([1, 2].includes(currentProcessStatus[0][0].currentStatusId)) {
				stepperDataQuery = await paymentHelper.query(8, processId, null);
			} else if (currentProcessStatus[0][0].currentStatusId == 3) {
				stepperDataQuery = await paymentHelper.query(10, processId, null);
			} else if (
				[6, 7, 8].includes(currentProcessStatus[0][0].currentStatusId)
			) {
				stepperDataQuery = await paymentHelper.query(18, processId, null);
				console.log(stepperDataQuery);
			}
			const stepperData = await db.sequelize.query(stepperDataQuery);
			return respHelper(res, {
				status: 200,
				data: {
					currentStatusId: currentProcessStatus[0][0].currentStatusId,
					stepperData: stepperData[0],
				},
				msg: "Status List Fetched Successfully",
			});
		} catch (e) {
			console.log(e);
		}
	}

	async buList(req, res) {
		try {
			const companyId = req.query.companyId;
			let query = {
				companyId: companyId,
				...(req.userData.role_id == 4 && { buHrId: req.userId }),
			};
			let subQuery = { isActive: 1 };
			const buData = await db.buMapping.findAll({
				where: query,
				include: [
					{
						model: db.buMaster,
						where: subQuery,
						attributes: ["buId", "buName", "buCode"],
					},
				],
			});

			// Extract only the relevant fields
			const responseData = buData.map((item) => ({
				buId: item.bumaster.buId,
				buName: item.bumaster.buName,
				buCode: item.bumaster.buCode,
			}));
			const allEmployees = { buId: 0, buName: "All Employees", buCode: "ALL" };

			// Add the new object at the beginning of the array
			responseData.unshift(allEmployees);

			return respHelper(res, {
				status: 200,
				data: responseData,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				message: "An error occurred while fetching BU data.",
			});
		}
	}

	async salaryComponentList(req, res) {
		try {
			const { salalryStructureAutoId } = req.query;
			const getComponentAutoIds =
				await db.salarystructurecomponentmapping.findAll({
					attributes: ["salaryComponentAutoId", "salaryStructureAutoId"],
					where: {
						salaryStructureAutoId: {
							[Op.not]: salalryStructureAutoId, // Exclude records with this value
						},
					},
					include: [
						{
							model: db.salaryComponent,
							attributes: [
								"salaryComponentCode",
								"salaryComponentAlias",
								"salaryComponentEarningType",
							],
							as: "componentDetails",
						},
					],
				});
			return respHelper(res, {
				status: 200,
				data: {
					getComponentAutoIds: getComponentAutoIds,
				},
				msg: "List Fetched Successfully",
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				message: "An error occurred while fetching BU data.",
			});
		}
	}

	async exportSample(req, res) {
		try {
			const {
				exportSheetAutoId,
				salalryStructureAutoId,
				employeeIds,
				payMonth,
				processId,
			} = req.query;

			let fileNameType = req.query.fileNameType || "";
			let customSheetName = "";
			if (fileNameType === "1") {
				customSheetName = "Total Employees";
			} else if (fileNameType === "2") {
				customSheetName = "Payroll Processing Employees";
			}

			console.log(req.query);

			const sheetName = {
				"TDS Deduction Sample": 1,
				"LOP Deduction Sample": 2,
				"Extra Payment Sample": 3,
				"Standard Deduction Sample": 4,
				"Salary Structure Component": 5,
				"Processed Employee": 6,
				"In Process Employee": 7,
				"Total Employee": 8,
				"Available Employee": 9,
				"LOP Impacted Employees": 10,
				"Extra Payment Impacted Employees": 11,
				"Extra Deduction Impacted Employees": 12,
				"TDS Impacted Employees": 13,
				"Total Processed": 14,
				"Successfully Processed": 15,
				"Failed in Process": 16,
			};

			const getKeyByValue = async (value) => {
				const result = Object.keys(sheetName).find(
					(key) => sheetName[key] == value,
				);
				return result;
			};

			let sheetVal = await getKeyByValue(exportSheetAutoId);
			sheetVal = customSheetName ? customSheetName : sheetVal;

			// Check for required exportSheetAutoId
			if (!exportSheetAutoId) {
				return res.status(400).json({
					status: 400,
					data: [],
					msg: "Sample Sheet Not Available",
				});
			}

			// Fetch columns for the export sheet
			const getColumns = await db.exportSheetMapping.findAll({
				attributes: ["columnName"],
				where: {
					isActive: 1,
					exportSheetAutoId,
				},
				raw: true,
				nest: true,
			});

			let arr = [];

			// Fetch salary structure details if salalryStructureAutoId is provided
			if (salalryStructureAutoId && salalryStructureAutoId != 0) {
				const getComponentAutoIds =
					await db.salarystructurecomponentmapping.findAll({
						attributes: ["salaryComponentAutoId"],
						where: { salaryStructureAutoId: salalryStructureAutoId },
						include: [
							{
								model: db.salaryComponent,
								attributes: ["salaryComponentCode", "salaryComponentAlias"],
								as: "componentDetails",
							},
						],
						raw: true,
						nest: true,
					});

				arr = await Promise.all(
					getComponentAutoIds.map(async (item) => ({
						columnName:
							item.componentDetails.salaryComponentAlias?.trim() ||
							item.componentDetails.salaryComponentCode,
					})),
				);
			}
			// return
			let employeeData = [];
			if (salalryStructureAutoId == 0 && exportSheetAutoId == 6) {
				let query = "";
				const employeeIdss = employeeIds.split(",");
				console.log(employeeIds);
				query = `
        SELECT name,empCode FROM ${dbName}.employee where id in (${employeeIdss})`;

				if (query) {
					const [results] = await db.sequelize.query(query, { raw: true });
					employeeData = results;
				}
				console.log(employeeData);
			}

			if (
				salalryStructureAutoId == 0 &&
				[10, 11, 12, 13, 14, 15, 16].includes(Number(exportSheetAutoId))
			) {
				let query = "";
				const employeeIdss = employeeIds.split(","); // [employeeIds];
				// employeeIdss.map(id => `'${id}'`).join(', ')
				// console.log(employeeIdss);

				//return
				const impactedEmployeeQueryObject = {
					10: `SELECT empCode as EmployeeId , lopDays as "LOP Days" FROM ${dbName}.lopdeductions where lopMonth ='${payMonth}' and empCode in(${employeeIdss
						.map((id) => `'${id}'`)
						.join(", ")});`,
					11: `SELECT paymentAmount as "Extra Payment Amount",empCode as EmployeeId FROM ${dbName}.extrapayment where paymentMonth='${payMonth}' and  empCode in(${employeeIdss
						.map((id) => `'${id}'`)
						.join(", ")});`,
					12: `SELECT empCode AS EmployeeId ,SUM(deductionAmount) AS TotalDeductionAmount FROM ${dbName}.extradeductions where empCode in(${employeeIdss
						.map((id) => `'${id}'`)
						.join(", ")}) and startMonth='${payMonth}' GROUP BY empCode;`,
					13: `SELECT empCode as EmployeeId, tdsAmount as 'TDS Amount' FROM ${dbName}.tdsdeductions where empCode in(${employeeIdss
						.map((id) => `'${id}'`)
						.join(", ")}) and tdsMonth='${payMonth}';`,
					14: `SELECT  p.payRemark as Remark, e.empCode as EmployeeId FROM ${dbName}.payprocessdetails p JOIN employee e ON p.EmployeeId = e.id WHERE p.proceessId = ${processId};`,
					15: `SELECT  p.payRemark as Remark, e.empCode as EmployeeId FROM ${dbName}.payprocessdetails p JOIN employee e ON p.EmployeeId = e.id WHERE p.proceessId = ${processId} AND p.payStatus IN (2);`,
					16: `SELECT  p.payRemark as Remark, e.empCode as EmployeeId FROM ${dbName}.payprocessdetails p JOIN employee e ON p.EmployeeId = e.id WHERE p.proceessId = ${processId} AND p.payStatus IN (101);`,
				};
				query = impactedEmployeeQueryObject[exportSheetAutoId];
				if (query) {
					const [results] = await db.sequelize.query(query, { raw: true });
					employeeData = results;
				}
				console.log(query);
			}

			// return;
			const timestamp = Date.now();

			// Handle scenarios based on conditions
			if (getColumns.length > 0 && salalryStructureAutoId != 0) {
				const mergeColumns = [...getColumns, ...arr];
				const headers = mergeColumns.map((item) => item.columnName);
				const columns = headers.map((value) => ({
					label: value,
					value: value,
				}));

				const data = [
					{
						sheet: "Salary Component",
						columns,
						content: [],
					},
				];

				const settings = {
					fileName: `Component_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${sheetVal}_${timestamp}.xlsx`,
				);
				return res.end(report);
			} else if (getColumns.length > 0 && salalryStructureAutoId == 0) {
				const mergeColumns = [...getColumns, ...arr];
				const headers = mergeColumns.map((item) => item.columnName);
				const columns = headers.map((value) => ({
					label: value,
					value: value,
				}));

				const data = [
					{
						sheet: "Salary Component",
						columns,
						content: [],
					},
				];

				const settings = {
					fileName: `Component_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${sheetVal}_${timestamp}.xlsx`,
				);
				return res.end(report);
			} else if (
				getColumns.length == 0 &&
				salalryStructureAutoId == 0 &&
				[6, 7, 8, 9].includes(Number(exportSheetAutoId))
			) {
				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee Code", value: "empCode" },
							{ label: "Employee Name", value: "name" },
						],
						content: employeeData,
					},
				];

				const settings = {
					fileName: `Total_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${sheetVal}_${timestamp}.xlsx`,
				);
				return res.end(report);
			} else if (
				getColumns.length == 0 &&
				salalryStructureAutoId == 0 &&
				[10, 11, 12, 13, 14, 15, 16].includes(Number(exportSheetAutoId))
			) {
				const columnsFroExcel = {
					10: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "Lop Days", value: "LOP Days" },
					],
					11: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "Extra Amount", value: "Extra Payment Amount" },
					],
					12: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "Deduction Amount", value: "TotalDeductionAmount" },
					],
					13: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "TDS Amount", value: "TDS Amount" },
					],
					14: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "Remark", value: "Remark" },
					],
					15: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "Remark", value: "Remark" },
					],
					16: [
						{ label: "Employee Code", value: "EmployeeId" },
						{ label: "Remark", value: "Remark" },
					],
				};

				const data = [
					{
						sheet: "Employee",
						columns: columnsFroExcel[exportSheetAutoId],
						content: employeeData,
					},
				];

				const settings = {
					fileName: `Total_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${sheetVal}_${timestamp}.xlsx`,
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

	async employeesListForProcessing(req, res) {
		try {
			let { companyId, year, month } = req.query;
			//let employeeForProcessingQuery = `SELECT DISTINCT e.empCode as empId ,e.name as empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive=1`;
			//let employeeForProcessingQuery = `SELECT DISTINCT e.empCode as empId ,e.name as empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive=1`;
			let employeeForProcessingQuery = `SELECT DISTINCT ejd.dateOfJoining, e.empCode AS empId, e.name AS empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive = 1 AND (YEAR(ejd.dateOfJoining) < ${year} OR (YEAR(ejd.dateOfJoining) = ${year} AND MONTH(ejd.dateOfJoining) <= ${month}));`;

			console.log(employeeForProcessingQuery);

			let employeeForProcessing = await db.sequelize.query(
				employeeForProcessingQuery,
			);
			if (
				!employeeForProcessing[0][0] ||
				employeeForProcessing[0][0].length > 0
			) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Data not available.",
				});
			}

			return respHelper(res, {
				status: 200,
				data: employeeForProcessing[0],
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	//   async salarySlipPdf(req, res) {
	//     console.log("i am here")
	//     try {
	//       // Fetch salary details
	//       const { paySlipAutoId } = req.query;
	//       // const salaryDetails = await salaryPaySlip(paySlipAutoId);
	//       const salaryDetails = await paymentHelper.salaryPaySlip(paySlipAutoId);

	//       if (!salaryDetails || salaryDetails.length === 0) {
	//         return res.status(404).send("Salary details not found.");
	//       }

	//       const processPayslipComponents = (payslipcomponents = []) => {
	//         const result = { earnings: [], deductions: [] };
	//         payslipcomponents.forEach((item) => {
	//           if (
	//             item.paySlipComponentType === "Earning" ||
	//             item.paySlipComponentType === "Balancing"
	//           ) {
	//             result.earnings.push(item);
	//           } else if (item.paySlipComponentType === "Deduction") {
	//             result.deductions.push(item);
	//           }
	//         });
	//         return result;
	//       };

	//       const paySlipComponent = processPayslipComponents(
	//         salaryDetails[0].payslipcomponents
	//       );

	//       const employee = salaryDetails[0].employee;
	// console.log('employee',employee)

	//       const monthNames = [
	//         "Jan", "Feb", "Mar", "Apr", "May", "Jun",
	//         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	//       ];
	//       const monthNamesFullName = [
	//         "January", "February", "March", "April", "May", "June",
	//         "July", "August", "September", "October", "November", "December"
	//       ];
	//       // Extract month and year from salaryDetails
	//       const monthIndex = parseInt(salaryDetails[0]?.paySlipMonth, 10) - 1; // Convert 1-based index to 0-based
	//       const currentMonthFullName = monthNamesFullName[monthIndex];
	//       // Function to determine the last day of the month
	//         const getLastDayOfMonth = (year, monthIndex) => {
	//           return new Date(year, monthIndex + 1, 0).getDate(); // Add 1 to the month index, then set date to 0
	//         };

	//         // Calculate last day of the month
	//         const lastDay = getLastDayOfMonth(year, monthIndex);
	//       const currentMonth =
	//         monthNames[parseInt(salaryDetails[0]?.paySlipMonth, 10) - 1] || "";

	//         // Calculate total days in the month
	//         const totalDays = getTotalDaysInMonth(salaryDetails[0]?.paySlipMonth, monthIndex);

	//         const duration = `1st ${currentMonthFullName}, ${salaryDetails[0]?.paySlipMonth} to ${lastDay} ${currentMonthFullName}, ${salaryDetails[0]?.paySlipMonth}`;
	//         const body = {
	//         name: employee.name || "",
	//         employeeCode: employee?.empCode || "",
	//         employeeType: employee?.employeetypemaster?.emptypename || "",
	//         designation: employee?.designationmaster?.name || "",
	//         department: employee?.departmentmaster?.departmentName || "N/A",
	//         panNo: employee?.panNo || "",
	//         dateOfJoining: moment(
	//           employee?.employeejobdetail?.dateOfJoining
	//         ).isValid()
	//           ? moment(employee.employeejobdetail.dateOfJoining).format("DD-MM-YYYY")
	//           : "",
	//         workingDays: salaryDetails[0]?.paySlipWorkingDays || "",
	//         companyName: employee?.companymaster?.companyName || "",
	//         currentOfficeLocation:
	//           employee?.companylocationmaster?.citymaster?.cityName || "",
	//         companyAddress: employee?.companylocationmaster?.address1 || "",
	//         grossEarnings: Number.isFinite(+salaryDetails[0]?.paySlipGrossEarning)
	//           ? parseInt(salaryDetails[0].paySlipGrossEarning)
	//           : "",
	//         totalPay: Number.isFinite(+salaryDetails[0]?.paySlipTotalPay)
	//           ? parseInt(salaryDetails[0].paySlipTotalPay)
	//           : "",
	//         totalDeductions: Number.isFinite(
	//           +salaryDetails[0]?.paySlipTotalDeduction
	//         )
	//           ? parseInt(salaryDetails[0].paySlipTotalDeduction)
	//           : "",
	//         lop:
	//           salaryDetails[0]?.paySlipTotalDays &&
	//           salaryDetails[0]?.paySlipWorkingDays
	//             ? salaryDetails[0].paySlipTotalDays -
	//               salaryDetails[0].paySlipWorkingDays
	//             : "",
	//         paySlipComponent: paySlipComponent || [],
	//         netPay: Number.isFinite(+salaryDetails[0]?.paySlipGrossEarning)
	//           ? parseInt(salaryDetails[0].paySlipGrossEarning) -
	//             parseInt(salaryDetails[0].paySlipTotalDeduction)
	//           : "",
	//         month: currentMonth || "",
	//         year: salaryDetails[0]?.paySlipYear || "",
	//         duration:duration,
	//         noOfDaysInMonth:totalDays,
	//         uanNo:"",
	//         totalArrearDays:0
	//       };

	//       const letter = await emailTemplate.salarySlipPdf(body);

	//       const file = { content: letter };

	//     const options = {
	//       format: "A4",
	//       puppeteer: {
	//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
	//         executablePath: "/usr/bin/chromium-browser", // Adjust this path as needed
	//       },
	//     };

	//    html_to_pdf.generatePdf(file, options, (error, success) => {
	//         // console.timeEnd("Generate PDF");

	//         if (error) {
	//           console.error("PDF generation error:", error);
	//           return res.status(500).send("Error generating PDF");
	//         }

	//         res.set({
	//           "Content-Type": "application/pdf",
	//           "Content-Disposition": `attachment; filename="salary_slip.pdf"`,
	//         });
	//         res.end(success);
	//       });
	//       // const options = { format: "A4" };
	//       // const file = { content: letter };

	//       // html_to_pdf.generatePdf(file, options, (error, success) => {
	//       //   // console.timeEnd("Generate PDF");

	//       //   if (error) {
	//       //     console.error("PDF generation error:", error);
	//       //     return res.status(500).send("Error generating PDF");
	//       //   }

	//       //   res.set({
	//       //     "Content-Type": "application/pdf",
	//       //     "Content-Disposition": `attachment; filename="salary_slip.pdf"`,
	//       //   });
	//       //   res.end(success);
	//       // });
	//     } catch (error) {
	//       console.error("Something Went Wrong:", error);
	//       res.status(500).send("Something Went Wrong");
	//     }
	//   }

	// async salarySlipPdf(req, res) {
	//   try {
	//     // Fetch salary details
	//     const {paySlipAutoId } = req.query;
	//     const salaryDetails = await paymentHelper.salaryPaySlip(paySlipAutoId);

	//     if (!salaryDetails || salaryDetails.length === 0) {
	//       return res.status(404).send("Salary details not found.");
	//     }

	//     const processPayslipComponents = (payslipcomponents = []) => {
	//       const result = { earnings: [], deductions: [] };
	//       payslipcomponents.forEach((item) => {
	//         if (
	//           item.paySlipComponentType === "Earning" ||
	//           item.paySlipComponentType === "Balancing"
	//         ) {
	//           result.earnings.push(item);
	//         } else if (item.paySlipComponentType === "Deduction") {
	//           result.deductions.push(item);
	//         }
	//       });
	//       return result;
	//     };

	//     const paySlipComponent = processPayslipComponents(
	//       salaryDetails[0].payslipcomponents
	//     );

	//     const employee = salaryDetails[0].employee;

	//     async function getMonthAbbreviation(month) {
	//       const monthNames = [
	//         "Jan", "Feb", "Mar", "Apr", "May", "Jun",
	//         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	//       ];

	//       const monthIndex = parseInt(month, 10) - 1; // Convert to zero-based index
	//       return monthNames[monthIndex] || "";
	//     }
	//     const month = salaryDetails[0]?.paySlipMonth;
	//     const currentMonth = await getMonthAbbreviation(month);
	//     const body = {
	//       name: employee.name || "",
	//       employeeCode: employee?.empCode || "",
	//       employeeType: employee?.employeetypemaster?.emptypename || "",
	//       designation: employee?.designationmaster?.name || "",
	//       department: employee?.departmentmaster?.departmentName || "N/A",
	//       panNo: employee?.panNo || "",
	//       dateOfJoining: moment(
	//         employee?.employeejobdetail?.dateOfJoining
	//       ).isValid()
	//         ? moment(employee.employeejobdetail.dateOfJoining).format(
	//             "DD-MM-YYYY"
	//           )
	//         : "",
	//       workingDays: salaryDetails[0]?.paySlipWorkingDays || "",
	//       companyName: employee?.companymaster?.companyName || "",
	//       currentOfficeLocation:
	//         employee?.companylocationmaster?.citymaster?.cityName || "",
	//       companyAddress: employee?.companylocationmaster?.address1 || "",
	//       grossEarnings: Number.isFinite(+salaryDetails[0]?.paySlipGrossEarning)
	//         ? parseInt(salaryDetails[0].paySlipGrossEarning)
	//         : "",
	//       totalPay: Number.isFinite(+salaryDetails[0]?.paySlipTotalPay)
	//         ? parseInt(salaryDetails[0].paySlipTotalPay)
	//         : "",
	//       totalDeductions: Number.isFinite(
	//         +salaryDetails[0]?.paySlipTotalDeduction
	//       )
	//         ? parseInt(salaryDetails[0].paySlipTotalDeduction)
	//         : "",
	//       lop:
	//         salaryDetails[0]?.paySlipTotalDays &&
	//         salaryDetails[0]?.paySlipWorkingDays
	//           ? salaryDetails[0].paySlipTotalDays -
	//             salaryDetails[0].paySlipWorkingDays
	//           : "",
	//       paySlipComponent: paySlipComponent || [],
	//       netPay: Number.isFinite(+salaryDetails[0]?.paySlipGrossEarning)
	//         ? parseInt(salaryDetails[0].paySlipGrossEarning)-parseInt(salaryDetails[0].paySlipTotalDeduction)
	//         : "",
	//       month: currentMonth|| "",
	//       year: salaryDetails[0]?.paySlipYear || "",
	//     };

	//     const letter = await emailTemplate.salarySlipPdf(body);
	//     const options = { format: "A4" };
	//     const file = { content: letter };

	//     html_to_pdf.generatePdf(file, options, (error, success) => {
	//       // console.timeEnd("Generate PDF");

	//       if (error) {
	//         console.error("PDF generation error:", error);
	//         return res.status(500).send("Error generating PDF");
	//       }

	//       res.set({
	//         "Content-Type": "application/pdf",
	//         "Content-Disposition": `attachment; filename="salary_slip.pdf"`,
	//       });
	//       res.end(success);
	//     });
	//   } catch (error) {
	//     console.error("Something Went Wrong:", error);
	//     res.status(500).send("Something Went Wrong");
	//   }
	// }
	/**
	 * Create APIs for extra deduction and extra payment
	 */

	// start by jay

	async extraDeduction(req, res) {
		try {
			// Fetch extra payment deduction list
			let model = db.extraDeduction;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;
			let userId = req.query.user || req.userId;
			let financialYearId = req.query.financialYearId || "";
			const type = parseInt(req.query.type);

			let query = {
				EmployeeId: userId,
				isActive: 1,
				...(search && { deductionName: { [Op.like]: `%${search}%` } }),
				...(financialYearId && { financialYearId: financialYearId }),
				...(type === 1 && { status: 1 }),
			};

			let aggregate = {
				where: query,
				attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
				order: [["extraDeductionsAutoId", "ASC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{
						model: db.CompensationCategoryMaster,
						attributes: ["compensationCategoryId", "name", "type"],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };

			return respHelper(res, {
				status: response.status,
				msg: response.message,
				data: obj,
			});
		} catch (error) {
			console.log(error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async createExtraDeduction(req, res) {
		try {
			const result = await validator.extraDeductionFormSchema.validateAsync(
				req.body,
			);
			let matchQuery = { id: result.EmployeeId };
			let getDetails = await service.details(db.employeeMaster, matchQuery);

			if (getDetails.status === 200) {
				let model = db.extraDeduction;
				let userId = req.userId;
				let endMonth = result.endMonth || result.startMonth;
				result["endMonth"] = endMonth;
				result["empCode"] = getDetails?.data?.empCode;

				let query = {
					EmployeeId: result.EmployeeId,
					startMonth: result.startMonth,
					deductionCategoryId: result.deductionCategoryId,
					deductionName: result.deductionName,
				};
				let moduleName = "Extra Deduction";

				// get category name
				let getCategoryDetails = await db.CompensationCategoryMaster.findOne({
					where: { compensationCategoryId: result.deductionCategoryId },
					attributes: ["name"],
					raw: true,
				});
				if (getCategoryDetails) {
					result["deductionCategory"] = getCategoryDetails?.name;
				}

				let metaData = { ...result, createdBy: userId, createdAt: moment() };
				let response = {};

				// let date = new Date(`${result.startMonth}-01`);
				// date.setMonth(date.getMonth() -1);
				// let oneMonthBefore = date.toISOString().slice(0, 7);

				// let findQuery = { EmployeeId: result.EmployeeId, startMonth: oneMonthBefore };
				// let isExist = await service.details(model, findQuery);
				// if(isExist.status === 200) {

				matchQuery = {
					EmployeeId: result.EmployeeId,
					payMonth: result.startMonth,
				};
				getDetails = await service.details(db.paySlips, matchQuery);
				if (getDetails.status == 200) {
					return respHelper(res, {
						status: 400,
						msg: "Salary slip already exist.",
					});
				} else {
					if (result.startMonth == result.endMonth) {
						response = await service.create(model, metaData, query, moduleName);
					} else {
						const start = new Date(result.startMonth + "-01"); // Start date
						const end = new Date(result.endMonth + "-01"); // End date

						if (end > start) {
							let current = new Date(start);

							while (current <= end) {
								const yearMonth = `${current.getFullYear()}-${String(
									current.getMonth() + 1,
								).padStart(2, "0")}`;
								current.setMonth(current.getMonth() + 1); // Move to the next month
								metaData = {
									...metaData,
									startMonth: yearMonth,
									endMonth: yearMonth,
								};
								query = {
									EmployeeId: result.EmployeeId,
									deductionCategoryId: result.deductionCategoryId,
									startMonth: yearMonth,
									deductionName: result.deductionName,
								};
								response = await service.create(
									model,
									metaData,
									query,
									moduleName,
								);
							}
						}
					}
					return respHelper(res, response);
				}

				// }
				// else {
				//   return respHelper(res, { status: 400, msg: 'Previous month data is not exist', data: {} });
				// }
			} else {
				return respHelper(res, {
					status: 400,
					msg: "TMC is not exist",
					data: {},
				});
			}
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateExtraDeduction(req, res) {
		try {
			const result = await validator.extraDeductionFormSchema.validateAsync(
				req.body,
			);
			let model = db.extraDeduction;
			let query = {
				extraDeductionsAutoId: req.params.id,
			};

			let findQuery = {
				EmployeeId: result.EmployeeId,
				startMonth: result.startMonth,
				deductionCategoryId: result.deductionCategoryId,
				deductionName: result.deductionName,
				extraDeductionsAutoId: { [Op.not]: req.params.id },
			};

			let isExist = await service.details(model, findQuery);
			if (isExist.status == 200) {
				return respHelper(res, {
					status: 400,
					msg: Constant.ALREADY_EXISTS.replace("<module>", "Extra Deduction"),
					data: {},
				});
			} else {
				// get category name
				let getCategoryDetails = await db.CompensationCategoryMaster.findOne({
					where: { compensationCategoryId: result.deductionCategoryId },
					attributes: ["name"],
					raw: true,
				});
				if (getCategoryDetails) {
					result["deductionCategory"] = getCategoryDetails?.name;
				}

				let metaData = {
					...result,
					updatedBy: req.userId,
					updatedAt: moment(),
				};
				let response = await service.update(model, metaData, query);
				return respHelper(res, response);
			}
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteExtraDeduction(req, res) {
		try {
			let model = db.extraDeduction;
			let query = { extraDeductionsAutoId: req.params.id, status: 0 };
			let moduleName = "Extra Deduction";
			let response = await service.delete(model, query, moduleName);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async extraPayment(req, res) {
		try {
			// Fetch extra payment deduction list
			let model = db.extraPayment;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;
			let userId = req.query.user || req.userId;
			let financialYearId = req.query.financialYearId || "";
			const type = parseInt(req.query.type);

			let query = {
				EmployeeId: userId,
				isActive: 1,
				...(search && { category: { [Op.like]: `%${search}%` } }),
				...(financialYearId && { financialYearId: financialYearId }),
				...(type === 1 && { status: 1 }),
			};

			let aggregate = {
				where: query,
				attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
				order: [["extraPaymentAutoId", "ASC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{
						model: db.CompensationCategoryMaster,
						attributes: ["compensationCategoryId", "name", "type"],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };

			return respHelper(res, {
				status: response.status,
				msg: response.message,
				data: obj,
			});
		} catch (error) {
			console.log(error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async createExtraPayment(req, res) {
		try {
			const result = await validator.extraPaymentFormSchema.validateAsync(
				req.body,
			);
			let matchQuery = { id: result.EmployeeId };
			let getDetails = await service.details(db.employeeMaster, matchQuery);

			if (getDetails.status === 200) {
				let model = db.extraPayment;
				let userId = req.userId;

				// get category name
				let getCategoryDetails = await db.CompensationCategoryMaster.findOne({
					where: { compensationCategoryId: result.paymentCategoryId },
					attributes: ["name"],
					raw: true,
				});
				if (getCategoryDetails) {
					result["category"] = getCategoryDetails?.name;
				}

				let metaData = {
					...result,
					createdAt: moment(),
					createdBy: userId,
					empCode: getDetails?.data?.empCode,
				};

				matchQuery = {
					EmployeeId: result.EmployeeId,
					payMonth: result.paymentMonth,
				};
				getDetails = await service.details(db.paySlips, matchQuery);
				if (getDetails.status == 200) {
					return respHelper(res, {
						status: 400,
						msg: "Salary slip already exist.",
					});
				} else {
					let response = await model.create(metaData);
					return respHelper(res, {
						status: 201,
						msg: Constant.INSERT_SUCCESS,
						data: response,
					});
				}
			} else {
				return respHelper(res, {
					status: 400,
					msg: "TMC is not exist",
					data: {},
				});
			}
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateExtraPayment(req, res) {
		try {
			const result = await validator.extraPaymentFormSchema.validateAsync(
				req.body,
			);
			let model = db.extraPayment;
			let query = { extraPaymentAutoId: req.params.id };

			// get category name
			let getCategoryDetails = await db.CompensationCategoryMaster.findOne({
				where: { compensationCategoryId: result.paymentCategoryId },
				attributes: ["name"],
				raw: true,
			});
			if (getCategoryDetails) {
				result["category"] = getCategoryDetails?.name;
			}

			let metaData = { ...result, updatedAt: moment(), updatedBy: req.userId };
			let response = await service.update(model, metaData, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteExtraPayment(req, res) {
		try {
			let model = db.extraPayment;
			let query = { extraPaymentAutoId: req.params.id, status: 0 };
			let moduleName = "Extra Payment";
			let response = await service.delete(model, query, moduleName);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async payProcessCardList(req, res) {
		try {
			// Fetch pay process details list
			const { error } = await validator.payProcessCardSchema.validate(req.body);

			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0].message,
				});
			}

			let model = db.financialYearMaster;
			let financialYear = parseInt(req.body.selectedYear) || "";
			let companyId = req.body.companyId || "";

			let query = {
				isActive: 1,
				...(financialYear && { year: financialYear }),
			};

			let processQuery = {
				isActive: 1,
				...(companyId && { companyId: companyId }),
			};

			let attribute = { exclude: ["createdBy", "updatedBy", "updatedAt"] };

			let aggregate = {
				where: query,
				attributes: attribute,
				include: [
					{
						model: db.payProcessMaster,
						as: "payprocessmaster",
						attributes: [
							"payProcessMasterAutoId",
							"name",
							"payMonth",
							[
								Sequelize.literal(
									`(SELECT COUNT(proceessId) 
                   FROM payprocessdetails pd 
                   WHERE pd.payMonth = payprocessmaster.payMonth 
                   AND pd.companyId = payprocessmaster.companyId
                  )`,
								),
								"pay_count", // Alias for the computed column
							],
						],
						where: processQuery,
						order: [["payProcessMasterAutoId", "DESC"]],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let payProcessList = response?.data[0]?.payprocessmaster;

			const currentFinancialMonth = [
				{ value: 3, key: "April", customValue: `${financialYear}-04` },
				{ value: 4, key: "May", customValue: `${financialYear}-05` },
				{ value: 5, key: "June", customValue: `${financialYear}-06` },
				{ value: 6, key: "July", customValue: `${financialYear}-07` },
				{ value: 7, key: "Aug", customValue: `${financialYear}-08` },
				{ value: 8, key: "Sep", customValue: `${financialYear}-09` },
				{ value: 9, key: "Oct", customValue: `${financialYear}-10` },
				{ value: 10, key: "Nov", customValue: `${financialYear}-11` },
				{ value: 11, key: "Dec", customValue: `${financialYear}-12` },
				{ value: 0, key: "Jan", customValue: `${financialYear + 1}-01` },
				{ value: 1, key: "Feb", customValue: `${financialYear + 1}-02` },
				{ value: 2, key: "March", customValue: `${financialYear + 1}-03` },
			];

			// Map the `payprocess` array to include `value` and `key`
			const updatePayProcess = currentFinancialMonth.map((item) => {
				const matchedItem = payProcessList?.find((m) => {
					// const month = m.payMonth.split("-")[1]; // Extract the month (e.g., "01" -> "1")
					return item.customValue === m.payMonth;
				});

				return {
					processId: matchedItem
						? matchedItem.dataValues?.payProcessMasterAutoId
						: 0,
					pay_count: matchedItem ? matchedItem.dataValues?.pay_count : 0,
					value: item.value,
					key: item.key,
				};
			});

			return respHelper(res, {
				status: response.status,
				msg: "Data fetched successfully",
				data: updatePayProcess,
			});
		} catch (error) {
			console.log(error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async checkPaySlipMail(req, res) {
		try {
			let EmployeeIds = req.body.EmployeeIds;
			let paySlipMonth = req.body.paySlipMonth;

			let currentProcess = await db.payProcessMaster.findOne({
				where: { payProcessMasterAutoId: 1 },
				include: [{ model: db.companyMaster }],
				raw: true,
			});

			let allPaySlips = await db.paySlips.findAll({
				where: {
					paySlipMonth: paySlipMonth,
					paySlipStatus: 1,
					sendEmail: 0,
					EmployeeId: { [Op.in]: EmployeeIds },
				},
				attribute: [
					"paySlipAutoId",
					"EmployeeId",
					"payMonth",
					"paySlipYear",
					"paySlipMonth",
				],
				include: [
					{ model: db.employeeMaster, attribute: ["email", "firstName"] },
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
						companyLogo: currentProcess["companymaster.companyLogo"],
					}),
				);
				if (mailStatus) {
					await db.paySlips.update(
						{ sendEmail: 1 },
						{ where: { paySlipAutoId: allPaySlips[i]?.paySlipAutoId } },
					);
				}
			}

			// await db.extraDeduction.update(
			//   { status: 1, updatedAt: moment(), updatedBy: req.userId },
			//   { where: { EmployeeId: { [Op.in]: EmployeeIds }, startMonth: paySlipMonth } }
			// );

			// await db.extraPayment.update(
			//   { status: 1, updatedAt: moment(), updatedBy: req.userId },
			//   { where: { EmployeeId: { [Op.in]: EmployeeIds }, paymentMonth: paySlipMonth } }
			// );

			return respHelper(res, {
				status: 200,
				msg:
					allPaySlips.length > 0
						? "Mail send successfully"
						: "No employee found",
				data: {},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async salarySlipPdf(req, res) {
		console.log("i am thereee>>>>>>>");
		try {
			// Fetch salary details
			const { paySlipAutoId } = req.query;
			// const salaryDetails = await salaryPaySlip(paySlipAutoId);
			const salaryDetails = await paymentHelper.salaryPaySlip(paySlipAutoId);

			// console.log(salaryDetails)
			// return

			if (!salaryDetails || salaryDetails.length === 0) {
				return res.status(404).send("Salary details not found.");
			}

			const processPayslipComponents = (payslipcomponents = []) => {
				const result = { earnings: [], deductions: [] };
				payslipcomponents.forEach((item) => {
					if (
						item.paySlipComponentType === "Earning" ||
						item.paySlipComponentType === "Balancing"
					) {
						result.earnings.push(item);
					} else if (item.paySlipComponentType === "Deduction") {
						result.deductions.push(item);
					}
				});
				return result;
			};

			const paySlipComponent = processPayslipComponents(
				salaryDetails[0].payslipcomponents,
			);

			// console.log(salaryDetails[0].employee);
			// return
			const employee = salaryDetails[0].employee;
			// const monthNames = [
			//   "Jan", "Feb", "Mar", "Apr", "May", "Jun",
			//   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			// ];
			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];

			const monthNamesFullName = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];
			// Extract month and year from salaryDetails
			const monthIndex = parseInt(salaryDetails[0]?.paySlipMonth, 10) - 1; // Convert 1-based index to 0-based
			const currentMonthFullName = monthNamesFullName[monthIndex];
			// Function to determine the last day of the month
			const getLastDayOfMonth = (year, monthIndex) => {
				return new Date(year, monthIndex + 1, 0).getDate(); // Add 1 to the month index, then set date to 0
			};

			// Calculate last day of the month
			const lastDay = getLastDayOfMonth(
				salaryDetails[0]?.paySlipMonth,
				monthIndex,
			);
			const currentMonth =
				monthNames[parseInt(salaryDetails[0]?.paySlipMonth, 10) - 1] || "";

			// Calculate total days in the month
			// Function to determine the total days in the month
			const getTotalDaysInMonth = (year, monthIndex) => {
				return new Date(year, monthIndex + 1, 0).getDate(); // Add 1 to the month index, then set date to 0
			};
			const totalDays = getTotalDaysInMonth(
				salaryDetails[0]?.paySlipMonth,
				monthIndex,
			);

			const duration = `1st ${currentMonthFullName}, ${salaryDetails[0]?.paySlipYear} to ${lastDay} ${currentMonthFullName}, ${salaryDetails[0]?.paySlipYear}`;

			console.log(employee);

			const body = {
				name: employee.name || "",
				employeeCode: employee?.empCode || "",
				employeeType: employee?.employeetypemaster?.emptypename || "N.A",
				designation: employee?.designationmaster?.name || "N.A",
				department: employee?.departmentmaster?.departmentName || "N.A",
				panNo: employee?.panNo || "N.A",
				dateOfJoining: moment(
					employee?.employeejobdetail?.dateOfJoining,
				).isValid()
					? moment(employee.employeejobdetail.dateOfJoining).format(
							"DD-MM-YYYY",
						)
					: "N.A",
				workingDays: salaryDetails[0]?.paySlipWorkingDays || "N.A",
				companyName: employee?.companymaster?.companyName || "N.A",
				companyLogo: employee?.companymaster?.companyLogo || "N.A",
				currentOfficeLocation:
					employee?.companylocationmaster?.citymaster?.cityName || "N.A",
				companyAddress: employee?.companylocationmaster?.address1 || "N.A",
				grossEarnings: Number.isFinite(+salaryDetails[0]?.paySlipGrossEarning)
					? parseInt(salaryDetails[0].paySlipGrossEarning)
					: "",
				totalPay: Number.isFinite(+salaryDetails[0]?.paySlipTotalPay)
					? parseInt(salaryDetails[0].paySlipTotalPay)
					: "",
				totalDeductions: Number.isFinite(
					+salaryDetails[0]?.paySlipTotalDeduction,
				)
					? parseInt(salaryDetails[0].paySlipTotalDeduction)
					: "",
				// lop:
				//   salaryDetails[0]?.paySlipTotalDays &&
				//   salaryDetails[0]?.paySlipWorkingDays
				//     ? salaryDetails[0].paySlipTotalDays -
				//       salaryDetails[0].paySlipWorkingDays
				//     : "",
				lop: salaryDetails[0]?.paySlipAbsentDays
					? salaryDetails[0]?.paySlipAbsentDays
					: 0,
				paySlipComponent: paySlipComponent || [],
				netPay: Number.isFinite(+salaryDetails[0]?.paySlipGrossEarning)
					? parseInt(salaryDetails[0].paySlipGrossEarning) -
						parseInt(salaryDetails[0].paySlipTotalDeduction)
					: "",
				month: currentMonth || "N.A",
				year: salaryDetails[0]?.paySlipYear || "N.A",
				duration: duration,
				noOfDaysInMonth: salaryDetails[0]?.paySlipTotalDays || "N.A", //totalDays,
				uanNo: employee?.employeejobdetail?.uanNumber || "N.A",
				totalArrearDays: salaryDetails[0]?.paySlipArrearDays,
				providentFund: employee?.employeejobdetail?.pfNumber || "N.A",
				esicNo: employee?.employeejobdetail?.esicNumber || "N.A",
			};

			//const letter = await generateSalarySlipHtml(body); // Generate the HTML for the salary slip
			const letter = await emailTemplate.salarySlipPdf(body);

			console.log(letter);
			// Puppeteer for PDF generation
			const browser = await puppeteer.launch({
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
				headless: true,
			});
			const page = await browser.newPage();

			// Set HTML content
			await page.setContent(letter, { waitUntil: "networkidle0" });

			// Generate PDF
			const pdfBuffer = await page.pdf({
				format: "A4",
				printBackground: true,
			});

			await browser.close();

			// Set response headers and send the PDF
			res.set({
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="salary_slip.pdf"`,
			});
			res.end(pdfBuffer);
		} catch (error) {
			console.error("Something Went Wrong:", error);
			res.status(500).send("Something Went Wrong");
		}
	}

	async generateSinglePaySlip(req, res) {
		try {
			const result = await validator.generatePaySlipSchema.validateAsync(
				req.body,
			);
			let { EmployeeId, payMonth } = result;

			// verify salary slip exist or not
			let matchQuery = { EmployeeId: EmployeeId, payMonth: payMonth };
			let model = db.paySlips;
			let doc = await service.details(model, matchQuery);

			// verify pay process details
			let payProcessDetailsQuery = {
				EmployeeId: EmployeeId,
				payMonth: payMonth,
				payStatus: { [Op.in]: [1, 2, 3, 6, 7, 8, 9] },
			};
			let doc1 = await service.details(
				db.payProcessDetails,
				payProcessDetailsQuery,
			);

			if (doc.status == 200) {
				return respHelper(res, {
					status: 400,
					msg: Constant.ALREADY_EXISTS.replace("<module>", "Salary Slip"),
				});
			} else if (doc1.status == 200) {
				return respHelper(res, {
					status: 400,
					msg: "Pay process in the progress",
				});
			} else {
				// fetch employee details
				let employeeDetails = await db.employeeMaster.findOne({
					where: { id: EmployeeId },
					attributes: ["id", "companyId"],
				});
				let yearMonth = payMonth.split("-");
				let generatePaySlipQuery = `SELECT DISTINCT ejd.dateOfJoining, e.empCode AS empId, e.name AS empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${employeeDetails?.companyId}) AND e.isActive = 1 AND (YEAR(ejd.dateOfJoining) < ${yearMonth[0]} OR (YEAR(ejd.dateOfJoining) = ${yearMonth[0]} AND MONTH(ejd.dateOfJoining) <= ${yearMonth[1]})) AND e.id = ${EmployeeId};`;
				let queryResponse = await db.sequelize.query(generatePaySlipQuery);

				if (queryResponse[0].length > 0) {
					// add or update TDS deduction and LOP deduction
					await addUpdateTDSDeductionAndLOPDeduction(req, result);

					const totalWorkingDays = await paymentHelper.getDaysInCurrentMonth({
						year: payMonth.split("-")[0],
						month: payMonth.split("-")[1],
					});

					let employees = [EmployeeId]; //[484,560];//employeeIds
					for (const employee of employees) {
						const actualWorkingDays = await paymentHelper.actualWorkingDays({
							employeeId: employee,
							// year: result[0][0].payMonth.split("-")[0],
							// month: result[0][0].payMonth.split("-")[1],
							year: payMonth.split("-")[0],
							month: payMonth.split("-")[1],
							totalWorkingDays: totalWorkingDays,
						});
						if (!actualWorkingDays) {
							return respHelper(res, {
								status: 400,
								msg: "Issue with Employee Date of Joining.",
							});
						}
						const queryForEmployeePayDetails = await paymentHelper.query(
							11,
							employee,
							{ payMonth: result.payMonth },
						);
						console.log(
							"queryForEmployeePayDetails ::: " + queryForEmployeePayDetails,
						);
						const employeeDetailsComponentWise = await db.sequelize.query(
							queryForEmployeePayDetails,
						);
						// console.log(employeeDetailsComponentWise[0]);
						// return
						const queryForExtraDeductions = await paymentHelper.query(
							14,
							employee,
							result.payMonth,
						);
						const extraDeductonsDetails = await db.sequelize.query(
							queryForExtraDeductions,
						);
						const payPackageMonthlyCTC =
							parseFloat(
								employeeDetailsComponentWise?.[0]?.[0]?.payPackageMonthlyCTC,
							) || 0;

						const lopDays =
							parseFloat(employeeDetailsComponentWise?.[0]?.[0]?.lopDays) || 0;

						const lopMonthWiseCalculation =
							totalWorkingDays > 0
								? ((payPackageMonthlyCTC / totalWorkingDays) * lopDays).toFixed(
										2,
									)
								: "0.00";
						const deductionOfLopMonthAmount = Math.max(
							0,
							payPackageMonthlyCTC - parseFloat(lopMonthWiseCalculation),
						);
						async function getMonthAbbreviation(month) {
							const monthNames = [
								"jan",
								"feb",
								"mar",
								"apr",
								"may",
								"jun",
								"jul",
								"aug",
								"sep",
								"oct",
								"nov",
								"dec",
							];

							const monthIndex = parseInt(month, 10) - 1; // Convert to zero-based index
							return monthNames[monthIndex] || "";
						}

						const month = result.payMonth.split("-")[1];
						const currentMonth = await getMonthAbbreviation(month);

						const ptDynamicAttribute = [currentMonth, "ptAmount"];
						const lwfDynamicAttribute = [currentMonth, "lwfAmount"];
						const ptDeducationDetails = await db.paymentDetails.findOne({
							attributes: [
								"paymentId",
								"userId",
								"ptLocationId",
								"ptApplicability",
								"ptStateId",
							],
							where: { userId: employee },
							raw: true,
							nest: true,
							include: [
								{
									model: db.ptLocationMaster,
									attributes: ["ptLocationId", "ptLocationCode", "stateId"],
									include: [
										{
											model: db.ptMapping,
											attributes: [
												"ptmappingId",
												"minValue",
												"maxValue",
												ptDynamicAttribute,
											],
											required: false,
											where: {
												[Op.and]: [
													{ minValue: { [Op.lte]: deductionOfLopMonthAmount } },
													{ maxValue: { [Op.gte]: deductionOfLopMonthAmount } },
												],
											},
										},
									],
								},
							],
						});

						const lwfDeducationDetails = await db.jobDetails.findOne({
							attributes: [
								"jobId",
								"lwfApplicable",
								"pfApplicability",
								"pfRestricted",
								"esicApplicable",
								"lwfDesignation",
								"lwfState",
							],
							where: {
								userId: employee,
							},
							raw: true,
						});

						let lwfAmount = 0;
						let lwfMappingDetails = null;

						if (
							lwfDeducationDetails &&
							lwfDeducationDetails.lwfApplicable === 1
						) {
							lwfMappingDetails = await db.lwfMapping.findOne({
								attributes: [
									"lwfmappingId",
									"lwfDesignationId",
									"stateId",
									lwfDynamicAttribute,
								], // Include the dynamic attribute here
								where: {
									lwfDesignationId: lwfDeducationDetails.lwfDesignation,
									stateId: lwfDeducationDetails.lwfState,
								},
								raw: true,
							});

							if (lwfMappingDetails) {
								lwfAmount = lwfMappingDetails.lwfAmount || 0;
							}
						}

						let allDeductionQuery = `SELECT SUM(paymentAmount) AS totalExtraPayment, GROUP_CONCAT(category,'(',paymentAmount,')'  ORDER BY category SEPARATOR ' | ') AS paymentCategories FROM extrapayment WHERE paymentMonth = '${result.payMonth}' AND EmployeeId = ${employee};`;

						let extraPaymentAmount =
							await db.sequelize.query(allDeductionQuery);
						const ptAmount1 =
							ptDeducationDetails && ptDeducationDetails.ptApplicability == 1
								? ptDeducationDetails?.ptlocationmaster?.ptmapping?.ptAmount
								: 0;
						const lwfAmount1 = lwfAmount;

						const extraPaymentAmount1 =
							extraPaymentAmount[0].length > 0
								? extraPaymentAmount[0][0]?.totalExtraPayment
								: 0;

						if (!lwfDeducationDetails) {
							await db.payProcessDetails.update(
								{
									payStatus: 101,
									payRemark: "Employee job details not found.",
								},
								{
									where: {
										EmployeeId: employee,
										proceessId: processId,
									},
								},
							);

							continue;
						}
						if (!employeeDetailsComponentWise[0][0].payPackageAutoId) {
							await db.payProcessDetails.update(
								{ payStatus: 101, payRemark: "Pay Package Not Assigned." },
								{
									where: {
										EmployeeId: employee,
										proceessId: processId,
									},
								},
							);

							continue;
						}
						const queryForAffetElementCounts = await paymentHelper.query(
							13,
							employee,
							null,
						);
						const affectComponentCounts = await db.sequelize.query(
							queryForAffetElementCounts,
						);
						// const lopSingleUnit = employeeDetailsComponentWise[0][0].lopDays
						//   ? ((employeeDetailsComponentWise[0][0].payPackageMonthlyCTC /
						//       totalWorkingDays) *
						//       employeeDetailsComponentWise[0][0].lopDays) /
						//     affectComponentCounts[0][0].lopAffectCount
						//   : 0;
						for (const empCopntWiseDetl of employeeDetailsComponentWise[0]) {
							const queryForComponentConfiguration = await paymentHelper.query(
								12,
								empCopntWiseDetl.salaryComponentAutoId,
								empCopntWiseDetl.salaryStructureAutoId,
							);
							const componentConfiguration = await db.sequelize.query(
								queryForComponentConfiguration,
							);
							let includeInPayPackage =
								["Earning", "Balancing"].includes(
									empCopntWiseDetl["salaryComponentEarningType"],
								) &&
								paymentHelper.getElementValue(
									"Exclude From Special Allowance",
									componentConfiguration[0],
								) == 0
									? 1
									: 0;
							empCopntWiseDetl["includeInPackage"] = includeInPayPackage;
							// empCopntWiseDetl["elementMonthlyAmount"] =
							//   paymentHelper.getElementValue(
							//     "Affect Loss Of Pay",
							//     componentConfiguration[0]
							//   ) == 1
							//     ? parseFloat(
							//         empCopntWiseDetl.payElementAmount - lopSingleUnit
							//       ).toFixed(2)
							//     : empCopntWiseDetl.payElementAmount;

							// empCopntWiseDetl["elementMonthlyAmount"] =
							//   (await paymentHelper.getElementValue(
							//     "Affect Loss Of Pay",
							//     componentConfiguration[0]
							//   )) == 1
							//     ? paymentHelper.customRound(
							//         await paymentHelper.arrectLOP(
							//           empCopntWiseDetl.payElementAmount,
							//           employeeDetailsComponentWise[0][0].lopDays,
							//           totalWorkingDays
							//         )
							//       )
							//     : paymentHelper.customRound(empCopntWiseDetl.payElementAmount);

							empCopntWiseDetl["elementMonthlyAmount"] =
								await paymentHelper.getActualMonthlyAmount(
									empCopntWiseDetl.payElementAmount,
									totalWorkingDays,
									actualWorkingDays,
								);
							empCopntWiseDetl["elementMonthlyAmount"] =
								(await paymentHelper.getElementValue(
									"Affect Loss Of Pay",
									componentConfiguration[0],
								)) == 1
									? paymentHelper.customRound(
											await paymentHelper.arrectLOP(
												empCopntWiseDetl["elementMonthlyAmount"],
												employeeDetailsComponentWise[0][0].lopDays,
												actualWorkingDays,
											),
										)
									: paymentHelper.customRound(
											empCopntWiseDetl["elementMonthlyAmount"],
										);

							empCopntWiseDetl["totalExtraDeduction"] =
								extraDeductonsDetails[0][0].totalDeduction
									? extraDeductonsDetails[0][0].totalDeduction
									: 0;
							empCopntWiseDetl["extraDeductionCategories"] =
								extraDeductonsDetails[0][0].deductionCategories
									? extraDeductonsDetails[0][0].deductionCategories
									: "";
							empCopntWiseDetl["createdAt"] = new Date();
							empCopntWiseDetl["createdBy"] = req.userData.id;
							empCopntWiseDetl["payMonth"] = result.payMonth;
							empCopntWiseDetl["ptAmount"] = ptAmount1;
							empCopntWiseDetl["lwfAmount"] = lwfAmount1;
							empCopntWiseDetl["extraPaymentAmount"] = extraPaymentAmount1;
							empCopntWiseDetl["extraPaymentCategories"] =
								extraPaymentAmount[0][0]?.paymentCategories;
							empCopntWiseDetl["processId"] = 0;
							//////////////////////////////PF-Applicablity Keys////////////////////////
							let pafApplicableComponet = await paymentHelper.getElementValue(
								"Affect PF",
								componentConfiguration[0],
							);
							let esicApplicableComponent = await paymentHelper.getElementValue(
								"Affects ESIC",
								componentConfiguration[0],
							);
							let pfElementOnMorethan15000AndRestrictionNo =
								paymentHelper.getElementValue(
									"Affect PF >15000 No Restriction",
									componentConfiguration[0],
								);
							empCopntWiseDetl["isPfApplicableComponent"] =
								pafApplicableComponet;
							empCopntWiseDetl["isPfApplicable"] =
								lwfDeducationDetails.pfApplicability;
							empCopntWiseDetl["isPfRestriction"] =
								lwfDeducationDetails.pfRestricted;
							empCopntWiseDetl["isEsicApplicable"] =
								lwfDeducationDetails.esicApplicable;
							empCopntWiseDetl["isEsicApplicableComponent"] =
								esicApplicableComponent;
							empCopntWiseDetl["pfApplicable15000AndNoRestriction"] =
								pfElementOnMorethan15000AndRestrictionNo;
							empCopntWiseDetl["totalWorkingDays"] = totalWorkingDays;
							empCopntWiseDetl["actualWorkingDays"] = actualWorkingDays;
							//////////////////////////////PF-Applicablity Keys//////////////////////////////////
							let existDetails = await db.payMonthlyElements.findOne({
								where: {
									empId: employee,
									salaryComponentAutoId: empCopntWiseDetl.salaryComponentAutoId,
									payMonth: result.payMonth,
								},
								raw: true,
							});
							if (!existDetails) {
								await db.payMonthlyElements.create(empCopntWiseDetl);
							}
						}

						let payElementComponents = await db.payMonthlyElements.findAll({
							where: {
								empId: employee,
								salaryComponentEarningType: {
									[Op.in]: ["Earning", "Balancing"],
								},
								payMonth: result.payMonth,
							},
							raw: true,
						});
						///////////////Calculation And Updation of PF Amount //////////////////////
						let calculatedPF =
							await paymentHelper.getCalculatedPF(payElementComponents);
						let getCalculatedESIC =
							await paymentHelper.getCalculatedESIC(payElementComponents);
						await db.payMonthlyElements.update(
							{
								esicEmployerAmount: getCalculatedESIC.calculatedEmployerESIC,
								esicEmployeeAmount: getCalculatedESIC.calculatedEmployeeESIC,
								pfEmployeeAmount: calculatedPF,
								pfEmployerAmount: calculatedPF,
							},
							{ where: { empId: employee, payMonth: result.payMonth } },
						);
						///////////////Calculation And Updation of ESIC Amount //////////////////////
					}

					let metaData = { EmployeeId, req };
					// console.log("salary process completed");
					let status = await callSinglePaySlipFun(metaData);

					if (status == true) {
						// update status of extra payment and extra deduction
						await db.extraDeduction.update(
							{ status: 1, updatedAt: moment(), updatedBy: req.userId },
							{
								where: {
									EmployeeId: EmployeeId,
									startMonth: payMonth,
								},
							},
						);

						await db.extraPayment.update(
							{ status: 1, updatedAt: moment(), updatedBy: req.userId },
							{
								where: {
									EmployeeId: EmployeeId,
									paymentMonth: payMonth,
								},
							},
						);

						return respHelper(res, {
							status: 200,
							msg: "Salary slip generated successfully",
						});
					} else {
						return respHelper(res, {
							status: 422,
							msg: "We are not able to generate salary slip, because of some issue occurred.",
						});
					}
				} else {
					return respHelper(res, {
						status: 400,
						msg: "Date of joining should be less than or equal to the selected month.",
					});
				}
			}
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async releaseSinglePaySlip(req, res) {
		try {
			let model = db.paySlips;
			let query = { paySlipAutoId: req.params.id };
			let metaData = {
				paySlipStatus: 1,
				updatedAt: moment(),
				updatedBy: req.userId,
			};
			let response = await service.update(model, metaData, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteSinglePaySlip(req, res) {
		try {
			let { id } = req.params;
			let paySlipDetails = await db.paySlips.findOne({
				where: { paySlipAutoId: id },
				attributes: ["EmployeeId", "payMonth"],
				raw: true,
			});

			if (paySlipDetails) {
				let deletedCount1 = await db.payMonthlyElements.destroy({
					where: {
						empId: paySlipDetails?.EmployeeId,
						payMonth: paySlipDetails?.payMonth,
					},
				});
				let deletedCount2 = await db.paySlipComponent.destroy({
					where: { paySlipAutoId: id },
				});
				let deletedCount3 = await db.paySlips.destroy({
					where: { paySlipAutoId: id },
				});

				if (deletedCount1 > 0 && deletedCount2 && deletedCount3) {
					// update status of extra payment and extra deduction
					await db.extraDeduction.update(
						{ status: 0, updatedAt: moment(), updatedBy: req.userId },
						{
							where: {
								EmployeeId: paySlipDetails?.EmployeeId,
								startMonth: paySlipDetails?.payMonth,
							},
						},
					);

					await db.extraPayment.update(
						{ status: 0, updatedAt: moment(), updatedBy: req.userId },
						{
							where: {
								EmployeeId: paySlipDetails?.EmployeeId,
								paymentMonth: paySlipDetails?.payMonth,
							},
						},
					);

					return respHelper(res, {
						status: 200,
						msg: Constant.DETAILS_DELETED.replace("<module>", "Pay slip"),
					});
				} else {
					return respHelper(res, { status: 400, msg: "Bad request" });
				}
			} else {
				return respHelper(res, { status: 404, msg: Constant.NOT_FOUND });
			}
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getPayMonth(req, res) {
		try {
			let { EmployeeId } = req.params;
			let selectYear = parseInt(req.query.selectYear) || 2024;

			let months = [
				{ id: 4, value: `${selectYear}-04`, label: `${selectYear}-04` },
				{ id: 5, value: `${selectYear}-05`, label: `${selectYear}-05` },
				{ id: 6, value: `${selectYear}-06`, label: `${selectYear}-06` },
				{ id: 7, value: `${selectYear}-07`, label: `${selectYear}-07` },
				{ id: 8, value: `${selectYear}-08`, label: `${selectYear}-08` },
				{ id: 9, value: `${selectYear}-09`, label: `${selectYear}-09` },
				{ id: 10, value: `${selectYear}-10`, label: `${selectYear}-10` },
				{ id: 11, value: `${selectYear}-11`, label: `${selectYear}-11` },
				{ id: 12, value: `${selectYear}-12`, label: `${selectYear}-12` },
				{
					id: 1,
					value: `${parseInt(selectYear) + 1}-01`,
					label: `${parseInt(selectYear) + 1}-01`,
				},
				{
					id: 2,
					value: `${parseInt(selectYear) + 1}-02`,
					label: `${parseInt(selectYear) + 1}-02`,
				},
				{
					id: 3,
					value: `${parseInt(selectYear) + 1}-03`,
					label: `${parseInt(selectYear) + 1}-03`,
				},
			];

			let paySlips = await db.paySlips.findAll({
				where: { EmployeeId: EmployeeId },
				attributes: ["EmployeeId", "payMonth", "paySlipMonth"],
				raw: true,
			});

			if (paySlips.length > 0) {
				// manage financial year month
				let modifiedMonths = [];
				months.map((item) => {
					const matchedItem = paySlips?.find((m) => {
						return item.id === m.paySlipMonth;
					});
					if (matchedItem === undefined) {
						modifiedMonths.push(item);
					}
				});

				return respHelper(res, {
					status: 200,
					msg: Constant.DATA_FETCHED,
					data: modifiedMonths,
				});
			} else {
				return respHelper(res, {
					status: 200,
					msg: Constant.DATA_FETCHED,
					data: months,
				});
			}
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// End by jay
}

const groupByEmployeeId = (data) => {
	const groupedData = {};
	data.forEach((item) => {
		const employeeId = item["Employee Id"];
		if (!groupedData[employeeId]) {
			let totalEarning = parseFloat(
				parseFloat(item["Gross Earning"] ? item["Gross Earning"] : 0) +
					parseFloat(
						item["EXTRA PAYMENT AMOUNT"] ? item["EXTRA PAYMENT AMOUNT"] : 0,
					),
			);
			let totalDeduction = parseFloat(
				parseFloat(item["TDS Amount"] ? item["TDS Amount"] : 0) +
					parseFloat(item["PT AMOUNT"] ? item["PT AMOUNT"] : 0) +
					parseFloat(item["LWF AMOUNT"] ? item["LWF AMOUNT"] : 0) +
					parseFloat(item["PF Employer"] ? item["PF Employer"] : 0) +
					parseFloat(item["EXTRA DEDUCTION"] ? item["EXTRA DEDUCTION"] : 0),
			);
			let payableAmount = totalEarning - totalDeduction;
			payableAmount = paymentHelper.customRound(payableAmount);
			groupedData[employeeId] = {
				"Employee Id": employeeId,
				"Employee Name": item["Employee Name"],
				"LOP Days": item["LOP Days"],
				"Arrears Month": item["Arrears Month"],
				"Arrears Days": item["Arrears Days"],
				"TDS Month": item["TDS Month"],
				"TDS Amount": item["TDS Amount"],
				"Net Pay": item["Net Pay"],
				"Monthly Pay": payableAmount != "N/A" ? payableAmount : "0.0",
				"Extra Deduction Categories": item["Advance Name"],
				"Total Extra Deduction Amount": item["Advance Amount"],
				"PT Amount": item["PT AMOUNT"],
				"LWF Amount": item["LWF AMOUNT"],
				"Extra Payment Categories": item["EXTRA PAYMENT CATEGORIES"],
				"Extra Payment Amount": item["EXTRA PAYMENT AMOUNT"],
				"ESIC Employer": item["ESIC Employer"],
				"ESIC Employee": item["ESIC Employee"],
				"PF Employee": item["PF Employee"],
				"PF Employer": item["PF Employer"],
			};
			//p.esicEmployerAmount as ESIC EMPLOYER,p.esicEmployeeAmount as ESIC EMPLOYEE,p.pfEmployeeAmount as PF EMPLOYEE,p.pfEmployerAmount as PF EMPLOYER,
		}

		if (["Balancing", "Earning"].includes(item["salaryComponentEarningType"])) {
			Object.assign(groupedData[employeeId], {
				[item["Element Name"]]: item["Element Amount"]
					? paymentHelper.customRound(item["Element Amount"])
					: item["Element Amount"],
			});
			Object.assign(groupedData[employeeId], {
				[item["Element Name"] + " Monthly"]: item["Monthly Element Amount"]
					? paymentHelper.customRound(item["Monthly Element Amount"])
					: item["Monthly Element Amount"],
			});
		}
	});

	return Object.values(groupedData); // Convert the grouped data object back to an array
};

function formatDate(year, month, day) {
	const date = new Date(year, month - 1, day);
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

async function processSalary(data) {
	let { processId, req } = data;
	var errorArray = [];
	let queryForAllExecutableEmployee = `SELECT pm.payMonth, pd.* FROM payprocessdetails pd JOIN  payprocessmaster pm ON pd.proceessId = pm.payProcessMasterAutoId Where pm.payProcessMasterAutoId= ${processId} AND pd.payStatus in (1);`;
	const result = await db.sequelize.query(queryForAllExecutableEmployee);
	if (result[0].length > 0) {
		const employeeIds = result[0].map((item) => item.EmployeeId);
		const totalWorkingDays = await paymentHelper.getDaysInCurrentMonth({
			year: result[0][0].payMonth.split("-")[0],
			month: result[0][0].payMonth.split("-")[1],
		});
		const salaryRegisterArray = [],
			errorProcessed = [];
		let employees = employeeIds; //[484,560];//employeeIds
		for (const employee of employees) {
			const actualWorkingDays = await paymentHelper.actualWorkingDays({
				employeeId: employee,
				year: result[0][0].payMonth.split("-")[0],
				month: result[0][0].payMonth.split("-")[1],
				totalWorkingDays: totalWorkingDays,
			});

			if (!actualWorkingDays) {
				await db.payProcessDetails.update(
					{ payStatus: 101, payRemark: "Issue with Employee Date of Joining." },
					{
						where: {
							EmployeeId: employee,
							proceessId: processId,
						},
					},
				);
				continue;
			}
			const queryForEmployeePayDetails = await paymentHelper.query(
				11,
				employee,
				{ payMonth: result[0][0].payMonth },
			);
			const employeeDetailsComponentWise = await db.sequelize.query(
				queryForEmployeePayDetails,
			);
			console.log(
				"queryForEmployeePayDetails   ::: ",
				queryForEmployeePayDetails,
			);
			const queryForExtraDeductions = await paymentHelper.query(
				14,
				employee,
				result[0][0].payMonth,
			);
			const extraDeductonsDetails = await db.sequelize.query(
				queryForExtraDeductions,
			);
			const payPackageMonthlyCTC =
				parseFloat(
					employeeDetailsComponentWise?.[0]?.[0]?.payPackageMonthlyCTC,
				) || 0;

			const lopDays =
				parseFloat(employeeDetailsComponentWise?.[0]?.[0]?.lopDays) || 0;

			const lopMonthWiseCalculation =
				totalWorkingDays > 0
					? ((payPackageMonthlyCTC / totalWorkingDays) * lopDays).toFixed(2)
					: "0.00";
			const deductionOfLopMonthAmount = Math.max(
				0,
				payPackageMonthlyCTC - parseFloat(lopMonthWiseCalculation),
			);
			async function getMonthAbbreviation(month) {
				const monthNames = [
					"jan",
					"feb",
					"mar",
					"apr",
					"may",
					"jun",
					"jul",
					"aug",
					"sep",
					"oct",
					"nov",
					"dec",
				];

				const monthIndex = parseInt(month, 10) - 1; // Convert to zero-based index
				return monthNames[monthIndex] || "";
			}

			const month = result[0][0].payMonth.split("-")[1];
			const currentMonth = await getMonthAbbreviation(month);

			const ptDynamicAttribute = [currentMonth, "ptAmount"];
			const lwfDynamicAttribute = [currentMonth, "lwfAmount"];
			const ptDeducationDetails = await db.paymentDetails.findOne({
				attributes: [
					"paymentId",
					"userId",
					"ptLocationId",
					"ptApplicability",
					"ptStateId",
				],
				where: { userId: employee },
				raw: true,
				nest: true,
				include: [
					{
						model: db.ptLocationMaster,
						attributes: ["ptLocationId", "ptLocationCode", "stateId"],
						include: [
							{
								model: db.ptMapping,
								attributes: [
									"ptmappingId",
									"minValue",
									"maxValue",
									ptDynamicAttribute,
								],
								required: false,
								where: {
									[Op.and]: [
										{ minValue: { [Op.lte]: deductionOfLopMonthAmount } },
										{ maxValue: { [Op.gte]: deductionOfLopMonthAmount } },
									],
								},
							},
						],
					},
				],
			});

			const lwfDeducationDetails = await db.jobDetails.findOne({
				attributes: [
					"jobId",
					"lwfApplicable",
					"pfApplicability",
					"pfRestricted",
					"esicApplicable",
					"lwfDesignation",
					"lwfState",
				],
				where: {
					userId: employee,
				},
				raw: true,
			});

			let lwfAmount = 0;
			let lwfMappingDetails = null;

			if (lwfDeducationDetails && lwfDeducationDetails.lwfApplicable === 1) {
				lwfMappingDetails = await db.lwfMapping.findOne({
					attributes: [
						"lwfmappingId",
						"lwfDesignationId",
						"stateId",
						lwfDynamicAttribute,
					], // Include the dynamic attribute here
					where: {
						lwfDesignationId: lwfDeducationDetails.lwfDesignation,
						stateId: lwfDeducationDetails.lwfState,
					},
					raw: true,
				});

				if (lwfMappingDetails) {
					lwfAmount = lwfMappingDetails.lwfAmount || 0;
				}
			}
			let allDeductionQuery = `SELECT SUM(paymentAmount) AS totalExtraPayment, GROUP_CONCAT(category,'(',paymentAmount,')'  ORDER BY category SEPARATOR ' | ') AS paymentCategories FROM extrapayment WHERE paymentMonth = '${result[0][0].payMonth}' AND EmployeeId = ${employee};`;
			let extraPaymentAmount = await db.sequelize.query(allDeductionQuery);
			const ptAmount1 =
				ptDeducationDetails && ptDeducationDetails.ptApplicability == 1
					? ptDeducationDetails?.ptlocationmaster?.ptmapping?.ptAmount
					: 0;
			const lwfAmount1 = lwfAmount;

			const extraPaymentAmount1 =
				extraPaymentAmount[0].length > 0
					? extraPaymentAmount[0][0]?.totalExtraPayment
					: 0;
			if (!lwfDeducationDetails) {
				await db.payProcessDetails.update(
					{ payStatus: 101, payRemark: "Employee job details not found." },
					{
						where: {
							EmployeeId: employee,
							proceessId: processId,
						},
					},
				);

				continue;
			}
			if (!employeeDetailsComponentWise[0][0].payPackageAutoId) {
				await db.payProcessDetails.update(
					{ payStatus: 101, payRemark: "Pay Package Not Assigned." },
					{
						where: {
							EmployeeId: employee,
							proceessId: processId,
						},
					},
				);

				continue;
			}
			// const queryForAffetElementCounts = await paymentHelper.query(
			//   13,
			//   employee,
			//   null
			// );
			// const affectComponentCounts = await db.sequelize.query(
			//   queryForAffetElementCounts
			// );
			for (const empCopntWiseDetl of employeeDetailsComponentWise[0]) {
				console.log("**********empCopntWiseDetl************");
				console.log(empCopntWiseDetl);
				console.log("**********empCopntWiseDetl************");

				const queryForComponentConfiguration = await paymentHelper.query(
					12,
					empCopntWiseDetl.salaryComponentAutoId,
					empCopntWiseDetl.salaryStructureAutoId,
				);
				const componentConfiguration = await db.sequelize.query(
					queryForComponentConfiguration,
				);
				let includeInPayPackage =
					["Earning", "Balancing"].includes(
						empCopntWiseDetl["salaryComponentEarningType"],
					) &&
					paymentHelper.getElementValue(
						"Exclude From Special Allowance",
						componentConfiguration[0],
					) == 0
						? 1
						: 0;
				empCopntWiseDetl["includeInPackage"] = includeInPayPackage;
				empCopntWiseDetl["elementMonthlyAmount"] =
					await paymentHelper.getActualMonthlyAmount(
						empCopntWiseDetl.payElementAmount,
						totalWorkingDays,
						actualWorkingDays,
					);
				empCopntWiseDetl["elementMonthlyAmount"] =
					(await paymentHelper.getElementValue(
						"Affect Loss Of Pay",
						componentConfiguration[0],
					)) == 1
						? paymentHelper.customRound(
								await paymentHelper.arrectLOP(
									empCopntWiseDetl["elementMonthlyAmount"],
									employeeDetailsComponentWise[0][0].lopDays,
									totalWorkingDays,
								),
							)
						: paymentHelper.customRound(
								empCopntWiseDetl["elementMonthlyAmount"],
							);

				empCopntWiseDetl["totalExtraDeduction"] = extraDeductonsDetails[0][0]
					.totalDeduction
					? extraDeductonsDetails[0][0].totalDeduction
					: 0;
				empCopntWiseDetl["extraDeductionCategories"] =
					extraDeductonsDetails[0][0].deductionCategories
						? extraDeductonsDetails[0][0].deductionCategories
						: "";
				empCopntWiseDetl["createdAt"] = new Date();
				empCopntWiseDetl["createdBy"] = req.userData.id;
				empCopntWiseDetl["payMonth"] = result[0][0].salaryMonth;
				empCopntWiseDetl["ptAmount"] = ptAmount1;
				empCopntWiseDetl["lwfAmount"] = lwfAmount1;
				empCopntWiseDetl["extraPaymentAmount"] = extraPaymentAmount1;
				empCopntWiseDetl["extraPaymentCategories"] =
					extraPaymentAmount[0][0]?.paymentCategories;
				empCopntWiseDetl["processId"] = processId;
				//////////////////////////////PF-Applicablity Keys////////////////////////
				let pafApplicableComponet = await paymentHelper.getElementValue(
					"Affect PF",
					componentConfiguration[0],
				);
				let esicApplicableComponent = await paymentHelper.getElementValue(
					"Affects ESIC",
					componentConfiguration[0],
				);
				let pfElementOnMorethan15000AndRestrictionNo =
					paymentHelper.getElementValue(
						"Affect PF >15000 No Restriction",
						componentConfiguration[0],
					);
				empCopntWiseDetl["isPfApplicableComponent"] = pafApplicableComponet;
				empCopntWiseDetl["isPfApplicable"] =
					lwfDeducationDetails.pfApplicability;
				empCopntWiseDetl["isPfRestriction"] = lwfDeducationDetails.pfRestricted;
				empCopntWiseDetl["isEsicApplicable"] =
					lwfDeducationDetails.esicApplicable;
				empCopntWiseDetl["isEsicApplicableComponent"] = esicApplicableComponent;
				empCopntWiseDetl["pfApplicable15000AndNoRestriction"] =
					pfElementOnMorethan15000AndRestrictionNo;
				empCopntWiseDetl["totalWorkingDays"] = totalWorkingDays;
				empCopntWiseDetl["actualWorkingDays"] = actualWorkingDays;
				empCopntWiseDetl["salaryComponentSequenceNo"] =
					empCopntWiseDetl["salaryComponentSequenceNo"];
				//////////////////////////////PF-Applicablity Keys//////////////////////////////////
				let existDetails = await db.payMonthlyElements.findOne({
					where: {
						empId: employee,
						salaryComponentAutoId: empCopntWiseDetl.salaryComponentAutoId,
						payMonth: result[0][0].payMonth,
					},
					raw: true,
				});
				if (!existDetails) {
					await db.payMonthlyElements.create(empCopntWiseDetl);
				}
			}

			let payElementComponents = await db.payMonthlyElements.findAll({
				where: {
					empId: employee,
					salaryComponentEarningType: { [Op.in]: ["Earning", "Balancing"] },
					payMonth: result[0][0].payMonth,
				},
				raw: true,
			});
			///////////////Calculation And Updation of PF Amount //////////////////////
			let calculatedPF =
				await paymentHelper.getCalculatedPF(payElementComponents);
			let getCalculatedESIC =
				await paymentHelper.getCalculatedESIC(payElementComponents);
			await db.payMonthlyElements.update(
				{
					esicEmployerAmount: getCalculatedESIC.calculatedEmployerESIC,
					esicEmployeeAmount: getCalculatedESIC.calculatedEmployeeESIC,
					pfEmployeeAmount: calculatedPF,
					pfEmployerAmount: calculatedPF,
				},
				{ where: { empId: employee, payMonth: result[0][0].payMonth } },
			);
			///////////////Calculation And Updation of ESIC Amount //////////////////////

			await db.payProcessDetails.update(
				{ payStatus: 2, payRemark: "Salary Processed." },
				{
					where: {
						EmployeeId: employee,
						proceessId: processId,
					},
				},
			);
		}
		db.payProcessMaster.update(
			{ processFlowId: 4 },
			{ where: { payProcessMasterAutoId: processId } },
		);
	} else {
		console.log("NO Data For Processing >>>>>>>>>");
	}
}

async function generatePaySlip(data) {
	console.log("generate pay slip");
	try {
		let { processId, req } = data;

		// get financial year
		let financialYearDetails = await paymentHelper.getFinancialYear();

		let queryForCurrentProcessStatus = await paymentHelper.query(
			15,
			processId,
			null,
		);
		let currentProcessStatus = await db.sequelize.query(
			queryForCurrentProcessStatus,
		);

		if (currentProcessStatus[0][0].currentstatus == 6) {
			let queryForAllEmployeeInProcess = await paymentHelper.query(
				23,
				processId,
				null,
			);
			let employeeInProcess = await db.sequelize.query(
				queryForAllEmployeeInProcess,
			);
			const employeeIds = employeeInProcess[0].map((item) => item.EmployeeId);
			let queryForPayMonthlyElementsForSalarySlip = await paymentHelper.query(
				16,
				currentProcessStatus[0][0].payMonth,
				employeeIds,
			);
			console.log(
				"queryForPayMonthlyElementsForSalarySlip  :: ",
				queryForPayMonthlyElementsForSalarySlip,
			);
			let payElements = await db.sequelize.query(
				queryForPayMonthlyElementsForSalarySlip,
			);

			console.log(payElements);
			for (const payMonthlyElement of payElements[0]) {
				let isExistPaySlip = await db.paySlips.findOne({
					where: {
						EmployeeId: payMonthlyElement.empId,
						paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
						paySlipYear: payMonthlyElement.payMonth.split("-")[0],
					},
					raw: true,
				});
				let currentMonth = payMonthlyElement.payMonth.split("-")[1];
				let currentYear = payMonthlyElement.payMonth.split("-")[0];
				let totalWorkingDays = await paymentHelper.getDaysInCurrentMonth({
					month: payMonthlyElement.payMonth.split("-")[1],
					year: payMonthlyElement.payMonth.split("-")[0],
				});
				let paySlipDuration = `01/${parseInt(
					currentMonth,
				)}/${currentYear}-${totalWorkingDays}/${parseInt(
					currentMonth,
				)}/${currentYear}`;
				let paySlipAutoId = isExistPaySlip
					? isExistPaySlip.paySlipAutoId
					: null;

				if (!isExistPaySlip) {
					let customeDeduction = [];
					let totalPayslipDeductons =
						parseFloat(
							payMonthlyElement.totalExtraDeduction
								? payMonthlyElement.totalExtraDeduction
								: 0,
						) +
						parseFloat(
							payMonthlyElement.esicEmployeeAmount
								? payMonthlyElement.esicEmployeeAmount
								: 0,
						) +
						parseFloat(
							payMonthlyElement.pfEmployeeAmount
								? payMonthlyElement.pfEmployeeAmount
								: 0,
						) +
						parseFloat(
							payMonthlyElement.tdsAmount ? payMonthlyElement.tdsAmount : 0,
						) +
						parseFloat(
							payMonthlyElement.ptAmount ? payMonthlyElement.ptAmount : 0,
						) +
						parseFloat(
							payMonthlyElement.lwfAmount ? payMonthlyElement.lwfAmount : 0,
						);
					totalPayslipDeductons = paymentHelper.customRound(
						totalPayslipDeductons,
					);
					let PaySlipNetPay =
						parseFloat(payMonthlyElement.paySlipGrossEarning) +
						parseFloat(
							payMonthlyElement.extrapaymentAmount
								? payMonthlyElement.extrapaymentAmount
								: 0,
						);
					PaySlipNetPay =
						parseFloat(PaySlipNetPay) - parseFloat(totalPayslipDeductons);
					PaySlipNetPay = paymentHelper.customRound(PaySlipNetPay);
					let GrossPayAfterExtraPay =
						parseFloat(payMonthlyElement.paySlipGrossEarning) +
						parseFloat(
							payMonthlyElement.extrapaymentAmount
								? payMonthlyElement.extrapaymentAmount
								: 0,
						);
					GrossPayAfterExtraPay = paymentHelper.customRound(
						GrossPayAfterExtraPay,
					);
					isExistPaySlip = await db.paySlips.create({
						EmployeeId: payMonthlyElement.empId,
						paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
						paySlipYear: payMonthlyElement.payMonth.split("-")[0],
						paySlipFinancialYear: financialYearDetails?.financialYearName,
						financialYearId: financialYearDetails?.financialYearId,
						paySlipDuration: paySlipDuration,
						paySlipTotalDays: payMonthlyElement.totalWorkingDays,
						paySlipWorkingDays:
							payMonthlyElement.actualWorkingDays - payMonthlyElement.lopDays,
						paySlipAbsentDays: payMonthlyElement.lopDays,
						paySlipArrearDays: payMonthlyElement.arrearDays,
						paySlipGrossEarning: GrossPayAfterExtraPay,
						paySlipTotalPay: payMonthlyElement.paySlipTotalPay,
						paySlipNetPay: PaySlipNetPay,
						paySlipTotalDeduction: totalPayslipDeductons
							? totalPayslipDeductons
							: 0,
						paySlipTDS: payMonthlyElement.tdsAmount
							? payMonthlyElement.tdsAmount
							: 0,
						createdBy: req.userData.id,
						isActive: 1,
						paySlipStatus: 0,
						createdAt: new Date(),
						payMonth: payMonthlyElement.payMonth,
					});
					paySlipAutoId = isExistPaySlip.dataValues.paySlipAutoId
						? isExistPaySlip.dataValues.paySlipAutoId
						: paySlipAutoId;
					if (payMonthlyElement.tdsAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "TDS",
							paySlipComponentAmount: payMonthlyElement.tdsAmount,
							paySlipComponentType: "Deduction",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}

					if (payMonthlyElement.ptAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "Professional Tax",
							paySlipComponentAmount: payMonthlyElement.ptAmount,
							paySlipComponentType: "Deduction",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}

					if (payMonthlyElement.lwfAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "Lwf Tax",
							paySlipComponentAmount: payMonthlyElement.lwfAmount,
							paySlipComponentType: "Deduction",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}

					// if (payMonthlyElement.extrapaymentAmount > 0) {
					//   customeDeduction.push({
					//     EmployeeId: payMonthlyElement.empId,
					//     paySlipAutoId: paySlipAutoId,
					//     salaryComponentAutoId: 0,
					//     paySlipComponentName: "Extra Payment",
					//     paySlipComponentAmount: payMonthlyElement.extrapaymentAmount,
					//     paySlipComponentType: "Earning",
					//     createdBy: req.userData.id,
					//     createdAt: new Date(),
					//   });
					// }

					if (payMonthlyElement.esicEmployeeAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "ESIC Eployee",
							paySlipComponentAmount: payMonthlyElement.esicEmployeeAmount,
							paySlipComponentType: "Deduction",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}

					if (payMonthlyElement.pfEmployeeAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "PF Employee",
							paySlipComponentAmount: payMonthlyElement.pfEmployeeAmount,
							paySlipComponentType: "Deduction",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}
					let getExtraDeductions =
						await paymentHelper.getExtraDeductionsElements(
							payMonthlyElement.payMonth,
							payMonthlyElement.empId,
							paySlipAutoId,
							req.userData.id,
						);
					let getExtraEarnings = await paymentHelper.getExtraEarningElements(
						payMonthlyElement.payMonth,
						payMonthlyElement.empId,
						paySlipAutoId,
						req.userData.id,
					);
					customeDeduction = customeDeduction.concat(getExtraDeductions);
					customeDeduction = customeDeduction.concat(getExtraEarnings);
					await db.paySlipComponent.bulkCreate(customeDeduction);
				}

				let isExistPayElement = await db.paySlipComponent.findOne({
					where: {
						EmployeeId: payMonthlyElement.empId,
						paySlipAutoId: paySlipAutoId,
						salaryComponentAutoId: payMonthlyElement.salaryComponentAutoId,
					},
					raw: true,
				});

				if (
					!isExistPayElement &&
					["Earning", "Balancing"].includes(
						payMonthlyElement.salaryComponentEarningType,
					)
				) {
					await db.paySlipComponent.create({
						EmployeeId: payMonthlyElement.empId,
						paySlipAutoId: paySlipAutoId,
						salaryComponentAutoId: payMonthlyElement.salaryComponentAutoId,
						paySlipComponentName: payMonthlyElement.paySlipComponentName,
						paySlipComponentAmount: payMonthlyElement.elementMonthlyAmount
							? paymentHelper.customRound(
									payMonthlyElement.elementMonthlyAmount,
								)
							: payMonthlyElement.elementMonthlyAmount,
						paySlipComponentType: payMonthlyElement.salaryComponentEarningType,
						createdBy: req.userData.id,
						createdAt: new Date(),
						fixedPayElementAmount: payMonthlyElement.payElementAmount,
						salaryComponentSequenceNo:
							payMonthlyElement.salaryComponentSequenceNo,
					});
				}
				await db.payProcessDetails.update(
					{ payStatus: 7 },
					{
						where: {
							EmployeeId: payMonthlyElement.empId,
							proceessId: processId,
						},
					},
				);
			}
		} else {
			console.log("Porcess is not ready for salary generation");
		}
	} catch (e) {
		console.log(e);
	}
}

async function releasePaySlip(data) {
	try {
		let { processId, req } = data;
		let employeeIds = [];
		let currentProcess = await db.payProcessMaster.findOne({
			where: { payProcessMasterAutoId: processId },
			include: [{ model: db.companyMaster }],
			raw: true,
		});
		if (currentProcess) {
			let employeeForReleasePaySlip = await db.payProcessDetails.findAll({
				where: {
					proceessId: processId,
					payMonth: currentProcess.payMonth,
					payStatus: 7,
				},
				raw: true,
				attributes: ["EmployeeId"],
			});
			for (const employee of employeeForReleasePaySlip) {
				employeeIds.push(employee.EmployeeId);
			}

			await db.paySlips.update(
				{ paySlipStatus: 1 },
				{ where: { EmployeeId: { [Op.in]: employeeIds } } },
			);
			await db.payProcessDetails.update(
				{ payStatus: 8 },
				{ where: { proceessId: processId } },
			);

			// complete status of extra payment and extra deduction

			await db.extraDeduction.update(
				{ status: 1, updatedAt: moment(), updatedBy: req.userId },
				{
					where: {
						EmployeeId: { [Op.in]: employeeIds },
						startMonth: currentProcess.payMonth,
					},
				},
			);

			await db.extraPayment.update(
				{ status: 1, updatedAt: moment(), updatedBy: req.userId },
				{
					where: {
						EmployeeId: { [Op.in]: employeeIds },
						paymentMonth: currentProcess.payMonth,
					},
				},
			);

			// send confirmation mail to employee after salary slip release
			if (employeeIds.length > 0) {
				let companyLogo = currentProcess["companymaster.companyLogo"];
				sendMailAfterSalarySlipRelease(
					employeeIds,
					currentProcess.payMonth,
					companyLogo,
				);
			}
		}
	} catch (e) {
		console.log(e);
	}
}

async function availableEmployeeForProcessing(employeeIds, paymonth) {
	try {
		let queryForInProcess = await paymentHelper.query(
			21,
			employeeIds,
			paymonth,
		);
		let queryForProcessed = await paymentHelper.query(
			22,
			employeeIds,
			paymonth,
		);
		let inProcessedEployees = await db.sequelize.query(queryForInProcess);
		let processedEmployees = await db.sequelize.query(queryForProcessed);
		const processExcluded = processedEmployees[0].map((item) =>
			parseInt(item.EmployeeId),
		);
		const inProcessExcluded = inProcessedEployees[0].map((item) =>
			parseInt(item.EmployeeId),
		);
		let avalialbleEmployees = employeeIds.filter(
			(item) => !processExcluded.includes(item),
		);
		avalialbleEmployees = avalialbleEmployees.filter(
			(item) => !inProcessExcluded.includes(item),
		);
		return {
			inProcessedEployees: inProcessExcluded,
			processedEmployees: processExcluded,
			avalialbleEmployees,
		};
	} catch (e) {
		console.log(e);
	}
}

async function sendMailAfterSalarySlipRelease(
	employeeIds,
	payMonth,
	companyLogo,
) {
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
		include: [{ model: db.employeeMaster, attribute: ["email", "firstName"] }],
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
				companyLogo: companyLogo,
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

async function callSinglePaySlipFun(data) {
	let { EmployeeId, req } = data;
	const employeeIds = [EmployeeId];
	// get financial year
	let financialYearDetails = await paymentHelper.getFinancialYear();

	let queryForPayMonthlyElementsForSalarySlip = await paymentHelper.query(
		16,
		req.body.payMonth,
		employeeIds,
	);

	let payElements = await db.sequelize.query(
		queryForPayMonthlyElementsForSalarySlip,
	);

	for (const payMonthlyElement of payElements[0]) {
		let isExistPaySlip = await db.paySlips.findOne({
			where: {
				EmployeeId: payMonthlyElement.empId,
				paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
				paySlipYear: payMonthlyElement.payMonth.split("-")[0],
			},
			raw: true,
		});
		let currentMonth = payMonthlyElement.payMonth.split("-")[1];
		let currentYear = payMonthlyElement.payMonth.split("-")[0];
		let totalWorkingDays = await paymentHelper.getDaysInCurrentMonth({
			month: payMonthlyElement.payMonth.split("-")[1],
			year: payMonthlyElement.payMonth.split("-")[0],
		});
		let paySlipDuration = `01/${parseInt(
			currentMonth,
		)}/${currentYear}-${totalWorkingDays}/${parseInt(
			currentMonth,
		)}/${currentYear}`;
		let paySlipAutoId = isExistPaySlip ? isExistPaySlip.paySlipAutoId : null;

		if (!isExistPaySlip) {
			let customeDeduction = [];
			let totalPayslipDeductons =
				parseFloat(
					payMonthlyElement.totalExtraDeduction
						? payMonthlyElement.totalExtraDeduction
						: 0,
				) +
				parseFloat(
					payMonthlyElement.esicEmployeeAmount
						? payMonthlyElement.esicEmployeeAmount
						: 0,
				) +
				parseFloat(
					payMonthlyElement.pfEmployeeAmount
						? payMonthlyElement.pfEmployeeAmount
						: 0,
				) +
				parseFloat(
					payMonthlyElement.tdsAmount ? payMonthlyElement.tdsAmount : 0,
				) +
				parseFloat(
					payMonthlyElement.ptAmount ? payMonthlyElement.ptAmount : 0,
				) +
				parseFloat(
					payMonthlyElement.lwfAmount ? payMonthlyElement.lwfAmount : 0,
				);
			totalPayslipDeductons = paymentHelper.customRound(totalPayslipDeductons);
			let PaySlipNetPay =
				parseFloat(payMonthlyElement.paySlipGrossEarning) +
				parseFloat(
					payMonthlyElement.extrapaymentAmount
						? payMonthlyElement.extrapaymentAmount
						: 0,
				);
			PaySlipNetPay =
				parseFloat(PaySlipNetPay) - parseFloat(totalPayslipDeductons);
			PaySlipNetPay = paymentHelper.customRound(PaySlipNetPay);
			let GrossPayAfterExtraPay =
				parseFloat(payMonthlyElement.paySlipGrossEarning) +
				parseFloat(
					payMonthlyElement.extrapaymentAmount
						? payMonthlyElement.extrapaymentAmount
						: 0,
				);
			GrossPayAfterExtraPay = paymentHelper.customRound(GrossPayAfterExtraPay);
			isExistPaySlip = await db.paySlips.create({
				EmployeeId: payMonthlyElement.empId,
				paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
				paySlipYear: payMonthlyElement.payMonth.split("-")[0],
				paySlipFinancialYear: financialYearDetails?.financialYearName,
				financialYearId: financialYearDetails?.financialYearId,
				paySlipDuration: paySlipDuration,
				paySlipTotalDays: totalWorkingDays,
				paySlipWorkingDays: totalWorkingDays - payMonthlyElement.lopDays,
				paySlipAbsentDays: payMonthlyElement.lopDays,
				paySlipArrearDays: payMonthlyElement.arrearDays,
				paySlipGrossEarning: GrossPayAfterExtraPay,
				paySlipTotalPay: payMonthlyElement.paySlipTotalPay,
				paySlipNetPay: PaySlipNetPay,
				paySlipTotalDeduction: totalPayslipDeductons
					? totalPayslipDeductons
					: 0,
				paySlipTDS: payMonthlyElement.tdsAmount
					? payMonthlyElement.tdsAmount
					: 0,
				createdBy: req.userData.id,
				isActive: 1,
				paySlipStatus: 0,
				createdAt: new Date(),
				payMonth: payMonthlyElement.payMonth,
			});
			paySlipAutoId = isExistPaySlip.dataValues.paySlipAutoId
				? isExistPaySlip.dataValues.paySlipAutoId
				: paySlipAutoId;
			if (payMonthlyElement.tdsAmount > 0) {
				customeDeduction.push({
					EmployeeId: payMonthlyElement.empId,
					paySlipAutoId: paySlipAutoId,
					salaryComponentAutoId: 0,
					paySlipComponentName: "TDS",
					paySlipComponentAmount: payMonthlyElement.tdsAmount,
					paySlipComponentType: "Deduction",
					createdBy: req.userData.id,
					createdAt: new Date(),
				});
			}

			if (payMonthlyElement.ptAmount > 0) {
				customeDeduction.push({
					EmployeeId: payMonthlyElement.empId,
					paySlipAutoId: paySlipAutoId,
					salaryComponentAutoId: 0,
					paySlipComponentName: "Professional Tax",
					paySlipComponentAmount: payMonthlyElement.ptAmount,
					paySlipComponentType: "Deduction",
					createdBy: req.userData.id,
					createdAt: new Date(),
				});
			}

			if (payMonthlyElement.lwfAmount > 0) {
				customeDeduction.push({
					EmployeeId: payMonthlyElement.empId,
					paySlipAutoId: paySlipAutoId,
					salaryComponentAutoId: 0,
					paySlipComponentName: "Lwf Tax",
					paySlipComponentAmount: payMonthlyElement.lwfAmount,
					paySlipComponentType: "Deduction",
					createdBy: req.userData.id,
					createdAt: new Date(),
				});
			}

			if (payMonthlyElement.esicEmployeeAmount > 0) {
				customeDeduction.push({
					EmployeeId: payMonthlyElement.empId,
					paySlipAutoId: paySlipAutoId,
					salaryComponentAutoId: 0,
					paySlipComponentName: "ESIC Eployee",
					paySlipComponentAmount: payMonthlyElement.esicEmployeeAmount,
					paySlipComponentType: "Deduction",
					createdBy: req.userData.id,
					createdAt: new Date(),
				});
			}

			if (payMonthlyElement.pfEmployeeAmount > 0) {
				customeDeduction.push({
					EmployeeId: payMonthlyElement.empId,
					paySlipAutoId: paySlipAutoId,
					salaryComponentAutoId: 0,
					paySlipComponentName: "PF Employee",
					paySlipComponentAmount: payMonthlyElement.pfEmployeeAmount,
					paySlipComponentType: "Deduction",
					createdBy: req.userData.id,
					createdAt: new Date(),
				});
			}
			let getExtraDeductions = await paymentHelper.getExtraDeductionsElements(
				payMonthlyElement.payMonth,
				payMonthlyElement.empId,
				paySlipAutoId,
				req.userData.id,
			);
			let getExtraEarnings = await paymentHelper.getExtraEarningElements(
				payMonthlyElement.payMonth,
				payMonthlyElement.empId,
				paySlipAutoId,
				req.userData.id,
			);
			customeDeduction = customeDeduction.concat(getExtraDeductions);
			customeDeduction = customeDeduction.concat(getExtraEarnings);
			await db.paySlipComponent.bulkCreate(customeDeduction);
		}

		let isExistPayElement = await db.paySlipComponent.findOne({
			where: {
				EmployeeId: payMonthlyElement.empId,
				paySlipAutoId: paySlipAutoId,
				salaryComponentAutoId: payMonthlyElement.salaryComponentAutoId,
			},
			raw: true,
		});

		if (
			!isExistPayElement &&
			["Earning", "Balancing"].includes(
				payMonthlyElement.salaryComponentEarningType,
			)
		) {
			await db.paySlipComponent.create({
				EmployeeId: payMonthlyElement.empId,
				paySlipAutoId: paySlipAutoId,
				salaryComponentAutoId: payMonthlyElement.salaryComponentAutoId,
				paySlipComponentName: payMonthlyElement.paySlipComponentName,
				paySlipComponentAmount: payMonthlyElement.elementMonthlyAmount
					? paymentHelper.customRound(payMonthlyElement.elementMonthlyAmount)
					: payMonthlyElement.elementMonthlyAmount,
				paySlipComponentType: payMonthlyElement.salaryComponentEarningType,
				createdBy: req.userData.id,
				createdAt: new Date(),
				fixedPayElementAmount: payMonthlyElement.payElementAmount,
			});
		}
	}

	// console.log("pay slip generated");
	return true;
}

async function addUpdateTDSDeductionAndLOPDeduction(req, result) {
	let matchQuery = { id: result.EmployeeId };
	let getDetails = await service.details(db.employeeMaster, matchQuery);

	if (getDetails.status === 200) {
		let empCode = getDetails.data?.empCode;
		let lopQuery = { EmployeeId: result.EmployeeId, lopMonth: result.payMonth };

		let isExistLOP = await service.details(db.lopDeductions, lopQuery);
		if (isExistLOP.status === 200) {
			await db.lopDeductions.update(
				{ lopDays: result.lopDays, updatedBy: req.userId, updatedAt: moment() },
				{ where: lopQuery },
			);
		} else {
			let lopObject = {
				EmployeeId: result.EmployeeId,
				lopMonth: result.payMonth,
				lopDays: result.lopDays,
				createdBy: req.userId,
				empCode: empCode,
				createdAt: moment(),
			};
			await db.lopDeductions.create(lopObject);
		}

		let tdsQuery = { EmployeeId: result.EmployeeId, tdsMonth: result.payMonth };

		let isExistTDS = await service.details(db.tdsDeductions, tdsQuery);
		if (isExistTDS.status === 200) {
			await db.tdsDeductions.update(
				{
					tdsAmount: result.tdsAmount,
					updatedBy: req.userId,
					updatedAt: moment(),
				},
				{ where: tdsQuery },
			);
		} else {
			let tdsObject = {
				EmployeeId: result.EmployeeId,
				tdsMonth: result.payMonth,
				tdsAmount: result.tdsAmount,
				createdBy: req.userId,
				empCode: empCode,
				createdAt: moment(),
			};
			await db.tdsDeductions.create(tdsObject);
		}
	}
}

export default new PaymentController();
