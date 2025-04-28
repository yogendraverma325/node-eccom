import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import validator from "../../../helper/validator.js";
import fnfHelper from "./fnfHelper.js";
import pkg from "xlsx";
const dbName = process.env.DB_NAME;
import { Op, where } from "sequelize";
import moment from "moment";

class FnfController {
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
			let employeeForProcessingQuery = await fnfHelper.query(
				value.departmentId == 0 ? 2 : 1,
				value.processingType,
				{
					departmentId: ids,
					paymonth: value.paymonth,
					companyId: value.companyId,
				},
			);
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

			// console.log(employeeIds);
			// console.log(employeeForProcessingQuery);

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

	async employeesListForFnfProcessing(req, res) {
		try {
			let { companyId, year, month } = req.query;
//			let employeeForProcessingQuery = `SELECT DISTINCT ejd.dateOfJoining, e.empCode AS empId, e.name AS empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NOT NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive = 0 AND (YEAR(e.dateOfExit) < ${year} OR (YEAR(e.dateOfExit) = ${year} AND MONTH(e.dateOfExit) <= ${month}));`;

			let employeeForProcessingQuery = `SELECT DISTINCT ejd.dateOfJoining, e.empCode AS empId, e.name AS empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NOT NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive = 0 AND (YEAR(e.dateOfExit) = ${year} AND MONTH(e.dateOfExit) = ${month});`;

			let employeeForProcessing = await db.sequelize.query(
				employeeForProcessingQuery,
			);

			//console.log(employeeForProcessingQuery);

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

	async uploadGratuity(req, res) {
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			}
			let isActive = parseInt(req.query.isActive);

			///////////////If File is provided by the users//////////////////
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			var gratuityDetails = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			var errorArray = [],
				successArray = [];

			if (
				!gratuityDetails[0]["Employee ID"] ||
				!gratuityDetails[0]["Gratuity Years"]
			) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid File Format",
				});
			}

			for (const employeeTds of gratuityDetails) {
				if (employeeTds["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: { empCode: employeeTds["Employee ID"], isActive: isActive },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						continue;
					}

					let gratuityOverrides = {
						EmployeeId: employeeDetais.id,
						gratuityYears: employeeTds["Gratuity Years"],
						empCode: employeeTds["Employee ID"],
					};
					const { error } =
						await validator.gratuityValidateSchama.validate(gratuityOverrides);
					if (error) {
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: gratuityOverrides.empCode,
						});
					} else {
						let existDetails = await db.gratuityOverrides.findOne({
							where: {
								empCode: gratuityOverrides.empCode,
							},
							raw: true,
						});
						if (existDetails) {
							gratuityOverrides["updatedBy"] = req.userData.id;
							gratuityOverrides["updatedAt"] = new Date();

							await db.gratuityOverrides.update(gratuityOverrides, {
								where: {
									EmployeeId: gratuityOverrides.EmployeeId,
									empCode: gratuityOverrides.empCode,
								},
							});
							gratuityOverrides["ACTION_TYPE"] = "UPDATE";
						} else {
							gratuityOverrides["createdBy"] = req.userData.id;
							gratuityOverrides["createdAt"] = new Date();
							await db.gratuityOverrides.create(gratuityOverrides);
							gratuityOverrides["ACTION_TYPE"] = "CREATE";
						}
						successArray.push(gratuityOverrides);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Gratuity Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async uploadLeaveEncashment(req, res) {
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			}
			let isActive = parseInt(req.query.isActive);

			///////////////If File is provided by the users//////////////////
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			var jsonArr = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			var errorArray = [],
				successArray = [];

			if (!jsonArr[0]["Employee ID"]) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid File Format",
				});
			}

			for (const employeeTds of jsonArr) {
				if (employeeTds["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: { empCode: employeeTds["Employee ID"], isActive: isActive },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						continue;
					}

					let obj = {
						EmployeeId: employeeDetais.id,
						leaveEncashmentDays: employeeTds["LEAVE ENCASHMENT DAYS"],
						// payMonth: employeeTds["PAY Month (YYYY-MM)"],
						empCode: employeeTds["Employee ID"],
					};
					const { error } =
						await validator.leaveEncashmentValidateSchama.validate(obj);
					if (error) {
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: obj.empCode,
						});
						// return respHelper(res, {
						//   status: 400,
						//   msg: error.details[0],
						// });
					} else {
						let existDetails = await db.leaveEncashmentOverrides.findOne({
							where: {
								empCode: obj.empCode,
								// payMonth: obj.payMonth,
							},
							raw: true,
						});
						if (existDetails) {
							obj["updatedBy"] = req.userData.id;
							obj["updatedAt"] = new Date();

							await db.leaveEncashmentOverrides.update(obj, {
								where: {
									EmployeeId: obj.EmployeeId,
									// payMonth: obj.payMonth,
									empCode: obj.empCode,
								},
							});
							obj["ACTION_TYPE"] = "UPDATE";
						} else {
							obj["createdBy"] = req.userData.id;
							obj["createdAt"] = new Date();
							await db.leaveEncashmentOverrides.create(obj);
							obj["ACTION_TYPE"] = "CREATE";
						}
						successArray.push(obj);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Leave Encashment Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async uploadPT(req, res) {
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
			var jsonArr = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			var errorArray = [],
				successArray = [];

			if (!jsonArr[0]["Employee ID"]) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid File Format",
				});
			}
			for (const employeeTds of jsonArr) {
				if (employeeTds["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: { empCode: employeeTds["Employee ID"], isActive: 0 },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						continue;
					}

					let obj = {
						EmployeeId: employeeDetais.id,
						ptAmount: employeeTds["PT Amount"],
						ptMonth: employeeTds["PT Month (YYYY-MM)"],
						empCode: employeeTds["Employee ID"],
					};
					console.log(obj);
					const { error } = await validator.ptValidateSchama.validate(obj);
					if (error) {
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: obj.empCode,
						});
					} else {
						let existDetails = await db.PTOverrides.findOne({
							where: {
								empCode: obj.empCode,
								ptMonth: obj.ptMonth,
							},
							raw: true,
						});
						console.log(existDetails);
						if (existDetails) {
							obj["updatedBy"] = req.userData.id;
							obj["updatedAt"] = new Date();

							await db.PTOverrides.update(obj, {
								where: {
									EmployeeId: obj.EmployeeId,
									ptMonth: obj.ptMonth,
									empCode: obj.empCode,
								},
							});
							obj["ACTION_TYPE"] = "UPDATE";
						} else {
							obj["createdBy"] = req.userData.id;
							obj["createdAt"] = new Date();
							await db.PTOverrides.create(obj);
							obj["ACTION_TYPE"] = "CREATE";
						}
						successArray.push(obj);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Professional Tax Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async uploadLWF(req, res) {
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
			var jsonArr = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			var errorArray = [],
				successArray = [];

			if (!jsonArr[0]["Employee ID"]) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid File Format",
				});
			}
			console.log(jsonArr);

			for (const employeeTds of jsonArr) {
				if (employeeTds["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: { empCode: employeeTds["Employee ID"], isActive: 0 },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						continue;
					}

					let obj = {
						EmployeeId: employeeDetais.id,
						lwfAmount: employeeTds["LWF Amount"],
						lwfMonth: employeeTds["LWF Month (YYYY-MM)"],
						empCode: employeeTds["Employee ID"],
					};
					console.log(obj);
					const { error } = await validator.lwfValidateSchama.validate(obj);
					if (error) {
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: obj.empCode,
						});
						// return respHelper(res, {
						//   status: 400,
						//   msg: error.details[0],
						// });
					} else {
						let existDetails = await db.LWFOverrides.findOne({
							where: {
								empCode: obj.empCode,
								lwfMonth: obj.lwfMonth,
							},
							raw: true,
						});
						if (existDetails) {
							obj["updatedBy"] = req.userData.id;
							obj["updatedAt"] = new Date();

							await db.LWFOverrides.update(obj, {
								where: {
									EmployeeId: obj.EmployeeId,
									lwfMonth: obj.lwfMonth,
									empCode: obj.empCode,
								},
							});
							obj["ACTION_TYPE"] = "UPDATE";
						} else {
							obj["createdBy"] = req.userData.id;
							obj["createdAt"] = new Date();
							await db.LWFOverrides.create(obj);
							obj["ACTION_TYPE"] = "CREATE";
						}
						successArray.push(obj);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "LWF Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async uploadNoticeRecovery(req, res) {
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
			var jsonArr = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			var errorArray = [],
				successArray = [];

			if (!jsonArr[0]["Employee ID"]) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid File Format",
				});
			}

			for (const employeeTds of jsonArr) {
				if (employeeTds["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: { empCode: employeeTds["Employee ID"], isActive: 0 },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						continue;
					}

					let obj = {
						EmployeeId: employeeDetais.id,
						recoveryDays: employeeTds["Notice Period Recovery Days"],
						// payMonth: employeeTds["PAY Month (YYYY-MM)"],
						empCode: employeeTds["Employee ID"],
					};
					const { error } =
						await validator.noticeRecoveryValidateSchama.validate(obj);
					if (error) {
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: obj.empCode,
						});
					} else {
						let existDetails = await db.noticeRecoveryOverrides.findOne({
							where: {
								empCode: obj.empCode,
								// payMonth: obj.payMonth,
							},
							raw: true,
						});
						if (existDetails) {
							obj["updatedBy"] = req.userData.id;
							obj["updatedAt"] = new Date();

							await db.noticeRecoveryOverrides.update(obj, {
								where: {
									EmployeeId: obj.EmployeeId,
									// payMonth: obj.payMonth,
									empCode: obj.empCode,
								},
							});
							obj["ACTION_TYPE"] = "UPDATE";
						} else {
							obj["createdBy"] = req.userData.id;
							obj["createdAt"] = new Date();
							await db.noticeRecoveryOverrides.create(obj);
							obj["ACTION_TYPE"] = "CREATE";
						}
						successArray.push(obj);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Notice Recovery Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async gratuitySyncing(req, res) {
		try {
			const { error, value } = validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, { status: 400, msg: error.details[0] });
			}
			let ids = value.departmentId.split(",");

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					msg: "No data to progress.",
					data: [],
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnValue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			var totalGratuityDays = 0,
				uniqueEmployeeImpacted = 0;
			let allGratuityQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(gratuityYears) AS gratuityYears from ${dbName}.gratuityoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) GROUP BY EmployeeId, empCode;`;

			let gratuities = await db.sequelize.query(allGratuityQuery);

			for (const singleEmployee of gratuities[0]) {
				totalGratuityDays += parseFloat(singleEmployee.gratuityYears || 0);
				uniqueEmployeeImpacted =
					singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}

			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					impactedDaysYears: totalGratuityDays.toFixed(2),
					impactedEmployeeDetails: gratuities[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async leaveEncashmentSyncing(req, res) {
		try {
			const { error, value } = validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, { status: 400, msg: error.details[0] });
			}
			let ids = value.departmentId.split(",");

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					msg: "No data to progress.",
					data: [],
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnValue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			var totalLeaveEncashmentDays = 0,
				uniqueEmployeeImpacted = 0;
			let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(leaveEncashmentDays) AS leaveEncashmentDays from ${dbName}.leavencashmentoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees})  GROUP BY EmployeeId, empCode;`;

			let allData = await db.sequelize.query(finalQuery);

			for (const singleEmployee of allData[0]) {
				totalLeaveEncashmentDays += parseFloat(
					singleEmployee.leaveEncashmentDays || 0,
				);
				uniqueEmployeeImpacted =
					singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}

			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					impactedDaysYears: totalLeaveEncashmentDays.toFixed(2),
					impactedEmployeeDetails: allData[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async PTSyncing(req, res) {
		try {
			const { error, value } = validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, { status: 400, msg: error.details[0] });
			}
			let ids = value.departmentId.split(",");

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					msg: "No data to progress.",
					data: [],
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnValue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			var totalLeaveEncashmentDays = 0,
				uniqueEmployeeImpacted = 0;
			let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(ptAmount) AS ptAmount from ${dbName}.ptoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND ptMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;

			let allData = await db.sequelize.query(finalQuery);

			for (const singleEmployee of allData[0]) {
				totalLeaveEncashmentDays += parseFloat(
					singleEmployee.leaveEncashmentDays || 0,
				);
				uniqueEmployeeImpacted =
					singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}

			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
					impactedEmployeeDetails: allData[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async LWFSyncing(req, res) {
		try {
			const { error, value } = validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, { status: 400, msg: error.details[0] });
			}
			let ids = value.departmentId.split(",");

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					msg: "No data to progress.",
					data: [],
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnValue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			var totalLeaveEncashmentDays = 0,
				uniqueEmployeeImpacted = 0;
			let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(lwfAmount) AS lwfAmount from ${dbName}.lwfoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND lwfMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;

			let allData = await db.sequelize.query(finalQuery);

			for (const singleEmployee of allData[0]) {
				totalLeaveEncashmentDays += parseFloat(
					singleEmployee.leaveEncashmentDays || 0,
				);
				uniqueEmployeeImpacted =
					singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}

			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
					impactedEmployeeDetails: allData[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async noticeRecoverySyncing(req, res) {
		try {
			const { error, value } = validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, { status: 400, msg: error.details[0] });
			}
			let ids = value.departmentId.split(",");

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					msg: "No data to progress.",
					data: [],
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnValue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			var totalLeaveEncashmentDays = 0,
				uniqueEmployeeImpacted = 0;
			let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(recoveryDays) AS recoveryDays from ${dbName}.noticerecoveryovrrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND payMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;

			let allData = await db.sequelize.query(finalQuery);

			for (const singleEmployee of allData[0]) {
				totalLeaveEncashmentDays += parseFloat(
					singleEmployee.leaveEncashmentDays || 0,
				);
				uniqueEmployeeImpacted =
					singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}

			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
					impactedEmployeeDetails: allData[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async initiateFnf(req, res) {
		try {
			const { error, value } =
				await validator.employeesForPayrollProcess.validate(req.body);
			if (error) {
				return respHelper(res, {
					status: 400,
					msg: error.details[0],
				});
			}
			let financialYearDetails = await db.financialYearMaster.findOne({
				where: { year: value.selectedYear },
				attributes: ["financialYearId"],
				raw: true,
			});
			//console.log(financialYearDetails);
			let ids = value.departmentId.split(",");
			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					name: "Initial FNF Process",
					description: "Initial FNF Procesd Details Description",
					status: 1,
					payMonth: req.body.paymonth,
					createdBy: req.userData.id,
					createdAt: new Date(),
					isActive: 1,
					processFlowId: 1,
					companyId: value.companyId,
					financialYearId: financialYearDetails?.financialYearId,
					filterType: value.departmentId === "0" ? 1 : 0,
					processType: "FnF",
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
				payRemark: "FNF Initiated",
				salaryMonth: newProcess.dataValues.payMonth,
				payMonth: newProcess.dataValues.payMonth,
				companyId: value.companyId,
				dateOfJoining: item.dateOfJoining,
				dateOfexit: item.dateOfexit,
				processType: "FnF",
			}));
			await db.payProcessDetails.bulkCreate(updatedArray).then((resp) => {
				processFnf({
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

	async processingFNF(req, res) {
		await processFnf({ processId: 1, req: req });
	}

	async exportFnfSalaryRegister(req, res) {
		try {
			let { processId } = req.body;
			let returnArray = [];
			const queryForProcessedEmploye = await fnfHelper.query(
				10,
				processId,
				null,
			);
			const processedEmployee = await db.sequelize.query(
				queryForProcessedEmploye,
			);
			const employeeIds = processedEmployee[0].map((item) => item.empId);
			const query = await fnfHelper.query(
				11,
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

	async updateNextStatus(req, res) {
		try {
			let { processId, currentStatusId, nextStatusId } = req.body;
			const queryForMappedEmployeeList = await fnfHelper.query(
				12,
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
			let workingDaysOfMonth = await fnfHelper.getDaysInCurrentMonth({
				year: value.paymonth.split("-")[0],
				month: value.paymonth.split("-")[1],
			});
			let ids = value.departmentId.split(",");

			// get financial year
			let financialYearDetails = await fnfHelper.getFinancialYear();

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
			let allExtraPaymenetQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(paymentAmount) AS paymentAmount FROM ${dbName}.extrapayment WHERE EmployeeId IN (${returnVAlue.avalialbleEmployees}) AND paymentMonth = '${req.body.paymonth}' GROUP BY EmployeeId, empCode;`;
			let extraPayments = await db.sequelize.query(allExtraPaymenetQuery);
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
			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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

	// end sync lop, tds, extra payment and extra deduction by jay

	async uploadExtraBenefit(req, res) {
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: "File is required!",
				});
			}
			let isActive = parseInt(req.query.isActive);

			///////////////If File is provided by the users//////////////////
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			var gratuityDetails = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);
			var errorArray = [],
				successArray = [];

			if (!gratuityDetails[0]["Employee ID"]) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid File Format",
				});
			}

			for (const employeeTds of gratuityDetails) {
				if (employeeTds["Employee ID"]) {
					let employeeDetais = await db.employeeMaster.findOne({
						where: { empCode: employeeTds["Employee ID"], isActive: isActive },
						raw: true,
						attributes: ["empCode", "id"],
					});

					if (!employeeDetais) {
						continue;
					}

					let obj = {
						EmployeeId: employeeDetais.id,
						benefitAmount: employeeTds["Extra Benefit Amount"],
						empCode: employeeTds["Employee ID"],
					};
					const { error } =
						await validator.extraBenefitValidateSchama.validate(obj);
					if (error) {
						errorArray.push({
							index: errorArray.length + 1,
							error: error.details[0].message,
							employeeID: obj.empCode,
						});
						// return respHelper(res, {
						//   status: 400,
						//   msg: error.details[0],
						// });
					} else {
						let existDetails = await db.ExtraBenefits.findOne({
							where: {
								empCode: obj.empCode,
							},
							raw: true,
						});
						if (existDetails) {
							obj["updatedBy"] = req.userData.id;
							obj["updatedAt"] = new Date();

							await db.ExtraBenefits.update(obj, {
								where: {
									EmployeeId: obj.EmployeeId,
									empCode: obj.empCode,
								},
							});
							obj["ACTION_TYPE"] = "UPDATE";
						} else {
							obj["createdBy"] = req.userData.id;
							obj["createdAt"] = new Date();
							await db.ExtraBenefits.create(obj);
							obj["ACTION_TYPE"] = "CREATE";
						}
						successArray.push(obj);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				data: { errorArray, successArray },
				msg: "Extra benefit Uploaded Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async extraBenefitSyncing(req, res) {
		try {
			const { error, value } = validator.employeesForPayrollProcess.validate(
				req.body,
			);
			if (error) {
				return respHelper(res, { status: 400, msg: error.details[0] });
			}
			let ids = value.departmentId.split(",");

			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
					msg: "No data to progress.",
					data: [],
				});
			}
			const employeeIds = result[0].map((employee) => employee.EmployeeId);
			let returnValue = await availableEmployeeForProcessing(
				employeeIds,
				value.paymonth,
			);

			var totalExtraBenefit = 0,
				uniqueEmployeeImpacted = 0;
			//let allExtraBenefitQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(benefitAmount) AS benefitAmount from ${dbName}.extrabenefit WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND payMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;
			let allExtraBenefitQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(benefitAmount) AS benefitAmount from ${dbName}.extrabenefit WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) GROUP BY EmployeeId, empCode;`;

			let extraBenefits = await db.sequelize.query(allExtraBenefitQuery);

			for (const singleEmployee of extraBenefits[0]) {
				totalExtraBenefit += parseFloat(singleEmployee.benefitAmount || 0);
				uniqueEmployeeImpacted =
					singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted;
			}

			return respHelper(res, {
				status: 200,
				data: {
					impactedEmployee: uniqueEmployeeImpacted,
					paymentAmount: totalExtraBenefit.toFixed(2),
					impactedEmployeeDetails: extraBenefits[0],
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async getFnfProcessDetails(req, res) {
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
			const queryForProcessStatus = await fnfHelper.query(16, processId, null);
			const currentProcessStatus = await db.sequelize.query(
				queryForProcessStatus,
			);
			if ([1, 2].includes(currentProcessStatus[0][0].currentStatusId)) {
				stepperDataQuery = await fnfHelper.query(17, processId, null);
			} else if (currentProcessStatus[0][0].currentStatusId == 3) {
				stepperDataQuery = await fnfHelper.query(18, processId, null);
			} else if (
				[6, 7, 8].includes(currentProcessStatus[0][0].currentStatusId)
			) {
				stepperDataQuery = await fnfHelper.query(19, processId, null);
				//console.log(stepperDataQuery);
			}
			//console.log(stepperDataQuery);
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

	async updateGratuityEncahsments(req, res) {
		try {
			let { employeeIds } = req.body;
			if (!employeeIds) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Eployees Ids Not Available",
				});
			}
			/////////////////////Gratuiy
			let employeeIDsArray = employeeIds.split(",");
			for (const element of employeeIDsArray) {
				let employeejobdetails = await db.employeeMaster.findOne({
					where: { id: element },
					raw: true,
					include: [
						{
							model: db.jobDetails,
							attributes: ["dateOfJoining"],
							as: "employeeJobDetails",
						},
					],
					attributes: ["dateOfExit", "empCode"],
					nest: true,
				});
				let dateOfJoining = employeejobdetails.employeeJobDetails.dateOfJoining;
				let dateOfExit = employeejobdetails.dateOfExit;
				let gratuityMinYears = 5;
				const startDate = moment(dateOfJoining);
				const endDate = moment(dateOfExit);
				let years = endDate.diff(startDate, "years");
				startDate.add(years, "years"); // Adjust startDate forward by counted years
				const months = endDate.diff(startDate, "months");
				startDate.add(months, "months"); // Adjust startDate forward by counted months
				const days = endDate.diff(startDate, "days");
				years = months > 6 || (months == 6 && days > 0) ? years + 1 : years;

				if (years >= gratuityMinYears) {
					let existingGratuityDetails = await db.gratuityOverrides.findOne({
						where: {
							EmployeeId: element,
						},
					});
					if (existingGratuityDetails) {
						await db.gratuityOverrides.update(
							{
								gratuityYears: years,
								updatedBy: req.userData.id,
								updatedAt: new Date(),
							},
							{
								where: {
									EmployeeId: element,
								},
							},
						);
					} else {
						await db.gratuityOverrides.create({
							EmployeeId: element,
							gratuityYears: years,
							createdBy: req.userData.id,
							isActive: 1,
							empCode: employeejobdetails.empCode,
							createdAt: new Date(),
						});
					}
				}
			}

			let leaveEncashmentAndRevcoveryDaysQuery = await fnfHelper.query(24, {
				employeeIds: employeeIds,
			});
			const leaveEncashmentAndRevcoveryDaysData = await db.sequelize.query(
				leaveEncashmentAndRevcoveryDaysQuery,
			);
			for (const leaveEncashAndRevoceryObj of leaveEncashmentAndRevcoveryDaysData[0]) {
				if(leaveEncashAndRevoceryObj.l2RecoveryDays && leaveEncashAndRevoceryObj.l2RecoveryDays>0)
				{
					console.log(leaveEncashAndRevoceryObj.l2RecoveryDays);
					let recoveryDaysData = await db.noticeRecoveryOverrides.findOne({
						where: { employeeId: leaveEncashAndRevoceryObj.id },
						attributes: ["recoveryDaysAutoId"],
						raw: true,
					});
	
					if (recoveryDaysData) {
						await db.noticeRecoveryOverrides.update(
							{ recoveryDays: leaveEncashAndRevoceryObj.availableLeave },
							{ where: { EmployeeId: leaveEncashAndRevoceryObj.id } },
						);
					} else {
						await db.noticeRecoveryOverrides.create({
							EmployeeId: leaveEncashAndRevoceryObj.id,
							recoveryDays: leaveEncashAndRevoceryObj.l2RecoveryDays
								? leaveEncashAndRevoceryObj.l2RecoveryDays
								: 0,
							createdBy: req.userData.id,
							createdAt: new Date(),
							empCode:leaveEncashAndRevoceryObj.empCode
						});
					}
				}


				if(leaveEncashAndRevoceryObj.availableLeave && leaveEncashAndRevoceryObj.availableLeave>0)
				{
					let leaveEncashmentData = await db.leaveEncashmentOverrides.findOne({
						where: { EmployeeId: leaveEncashAndRevoceryObj.id },
						attributes: ["leaveEncashmentAutoId"],
						raw: true,
					});
			
					if (leaveEncashmentData) {
						await db.leaveEncashmentOverrides.update(
							{ leaveEncashmentDays: leaveEncashAndRevoceryObj.availableLeave },
							{ where: { EmployeeId: leaveEncashAndRevoceryObj.id } },
						);
					} else {
						await db.leaveEncashmentOverrides.create({
							EmployeeId: leaveEncashAndRevoceryObj.id,
							leaveEncashmentDays: leaveEncashAndRevoceryObj.availableLeave,
							createdBy: req.userData.id,
							createdAt: new Date(),
							empCode:leaveEncashAndRevoceryObj.empCode
						});
					}
				}
		
			}

			return respHelper(res, {
				status: 200,
				data: [],
				msg: "Status List Fetched Successfully",
			});
		} catch (e) {
			console.log(e);
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
	async syncDeductions(req, res) {
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
			let allEmployeeQuery = await fnfHelper.query(
				value.departmentId == 0 ? 6 : 5,
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
			let deductionQuery = await fnfHelper.query(23, {
				deductionMonth: req.body.paymonth,
				impactedEmployees: returnVAlue.avalialbleEmployees,
			});
			let dedcutionDetails = await db.sequelize.query(deductionQuery);
			Object.assign(dedcutionDetails[0][0], {
				ptImpactedCounts: dedcutionDetails[0][0].ptImpactedEmployees
					? dedcutionDetails[0][0].ptImpactedEmployees.split(",").length
					: 0,
			});
			Object.assign(dedcutionDetails[0][0], {
				lwfImpactedCounts: dedcutionDetails[0][0].lwfImpactedEmployees
					? dedcutionDetails[0][0].lwfImpactedEmployees.split(",").length
					: 0,
			});
			Object.assign(dedcutionDetails[0][0], {
				noticePeriodImpactedCounts: dedcutionDetails[0][0].noticeImpactedEmployees
					? dedcutionDetails[0][0].noticeImpactedEmployees.split(",").length
					: 0,
			});

			Object.assign(dedcutionDetails[0][0], {
				extraDeductionImpactedCounts: dedcutionDetails[0][0].extraDeductionImpactedEmployees
					? dedcutionDetails[0][0].extraDeductionImpactedEmployees.split(",")
							.length
					: 0,
			});
			Object.assign(dedcutionDetails[0][0], {
				tdsImpactedCounts: dedcutionDetails[0][0]
					? dedcutionDetails[0][0].tdsImpactedEmployees.split(",").length
					: 0,
			});
			console.log(dedcutionDetails[0][0]);
			return respHelper(res, {
				status: 200,
				data: dedcutionDetails[0],
				msg: "Synced All Deductions",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
}

// const groupByEmployeeId = (data) => {
// 	const groupedData = {};
// 	data.forEach((item) => {
// 		const employeeId = item["Employee Id"];
// 		if (!groupedData[employeeId]) {
// 			let totalEarning = parseFloat(
// 				parseFloat(item["Gross Earning"] ? item["Gross Earning"] : 0) +
// 					parseFloat(
// 						item["EXTRA PAYMENT AMOUNT"] ? item["EXTRA PAYMENT AMOUNT"] : 0
// 					)+
// 					parseFloat(
// 						item["leaveEncashmentAmount"] ? item["leaveEncashmentAmount"] : 0
// 					)+
// 					parseFloat(
// 						item["gratuityAmount"] ? item["gratuityAmount"] : 0
// 					)+parseFloat(
// 						item["ExtraBenefitAmount"] ? item["ExtraBenefitAmount"] : 0
// 					)
// 			);
// 			let totalDeduction = parseFloat(
// 				parseFloat(item["TDS Amount"] ? item["TDS Amount"] : 0) +
// 					parseFloat(item["PT AMOUNT"] ? item["PT AMOUNT"] : 0) +
// 					parseFloat(item["LWF AMOUNT"] ? item["LWF AMOUNT"] : 0) +
// 					parseFloat(item["PF Employer"] ? item["PF Employer"] : 0) +
// 					parseFloat(item["EXTRA DEDUCTION"] ? item["EXTRA DEDUCTION"] : 0)+
// 					parseFloat(item["noticeRecoveryAmount"] ? item["noticeRecoveryAmount"] : 0),
// 			);
// 			let payableAmount = totalEarning - totalDeduction;
// 			console.log("totalEarning :::::::::::",item["Gross Earning"]);
// 			console.log("totalDeduction :::::::::::",totalDeduction);
// 			payableAmount = fnfHelper.customRound(payableAmount);
// 			groupedData[employeeId] = {
// 				"Employee Id": employeeId,
// 				"Employee Name": item["Employee Name"],
// 				"LOP Days": item["LOP Days"],
// 				"Arrears Month": item["Arrears Month"],
// 				"Arrears Days": item["Arrears Days"],
// 				"TDS Month": item["TDS Month"],
// 				"TDS Amount": item["TDS Amount"],
// 				"Net Pay": item["Net Pay"],
// 				"Monthly Pay": payableAmount != "N/A" ? payableAmount : "0.0",
// 				"Extra Deduction Categories": item["Advance Name"],
// 				"Total Extra Deduction Amount": item["Advance Amount"],
// 				"PT Amount": item["PT AMOUNT"],
// 				"LWF Amount": item["LWF AMOUNT"],
// 				"Extra Payment Categories": item["EXTRA PAYMENT CATEGORIES"],
// 				"Extra Payment Amount": item["EXTRA PAYMENT AMOUNT"],
// 				"ESIC Employer": item["ESIC Employer"],
// 				"ESIC Employee": item["ESIC Employee"],
// 				"PF Employee": item["PF Employee"],
// 				"PF Employer": item["PF Employer"],
// 				Gratuity: item["gratuityAmount"],
// 				"Leave Encashment Days": item['leaveEncashmentDays'],
// 				"Leave Encashment Amount": item["leaveEncashmentAmount"],
// 				"Extra Benefit Amount": item["ExtraBenefitAmount"],
// 				"Notice Recovery Amount":item["noticeRecoveryAmount"]
// 			};
// 			//p.esicEmployerAmount as ESIC EMPLOYER,p.esicEmployeeAmount as ESIC EMPLOYEE,p.pfEmployeeAmount as PF EMPLOYEE,p.pfEmployerAmount as PF EMPLOYER,
// 		}

// 		if (["Balancing", "Earning"].includes(item["salaryComponentEarningType"])) {
// 			Object.assign(groupedData[employeeId], {
// 				[item["Element Name"]]: item["Element Amount"]
// 					? fnfHelper.customRound(item["Element Amount"])
// 					: item["Element Amount"],
// 			});
// 			Object.assign(groupedData[employeeId], {
// 				[item["Element Name"] + " Monthly"]: item["Monthly Element Amount"]
// 					? fnfHelper.customRound(item["Monthly Element Amount"])
// 					: item["Monthly Element Amount"],
// 			});
// 		}
// 	});

// 	return Object.values(groupedData); // Convert the grouped data object back to an array
// };


const groupByEmployeeId = (data) => {
	const groupedData = {};

	//console.log(data);
	// return;
	data.forEach((item, index) => {
		const employeeId = item["Employee Id"];
		let totalEarning = parseFloat(
			parseFloat(item["Gross Earning"] ? item["Gross Earning"] : 0) +
				parseFloat(
					item["EXTRA PAYMENT AMOUNT"] ? item["EXTRA PAYMENT AMOUNT"] : 0,
				)+parseFloat(
					item["leaveEncashmentAmount"] ? item["leaveEncashmentAmount"] : 0
				)+
				parseFloat(
					item["gratuityAmount"] ? item["gratuityAmount"] : 0
				)
		);
		// +parseFloat(
		// 	item["ExtraBenefitAmount"] ? item["ExtraBenefitAmount"] : 0
		// )/// excluted on request of Rag and Mukesh
		let totalDeduction = parseFloat(
			parseFloat(item["TDS Amount"] ? item["TDS Amount"] : 0) +
				parseFloat(item["PT AMOUNT"] ? item["PT AMOUNT"] : 0) +
				parseFloat(item["LWF AMOUNT"] ? item["LWF AMOUNT"] : 0) +
				parseFloat(item["PF Employee"] ? item["PF Employee"] : 0) +
				parseFloat(item["ESIC Employee"] ? item["ESIC Employee"] : 0) +
				parseFloat(item["EXTRA DEDUCTION"] ? item["EXTRA DEDUCTION"] : 0)+
				parseFloat(item["noticeRecoveryAmount"] ? item["noticeRecoveryAmount"] : 0),
		);
		totalDeduction=fnfHelper.customRound(totalDeduction)
		let payableAmount = totalEarning - totalDeduction;
		payableAmount = fnfHelper.customRound(payableAmount);

		if (!groupedData[employeeId]) {
			groupedData[employeeId] = {
				"Employee Id": employeeId, //1
				"Employee Name": item["Employee Name"], //2
				"Date of Joining": item["Date of Joining"]?moment(item["Date of Joining"]).format("YYYY-MM-DD"):'N/A', //3
				"Exit Date": item["Exit Date"]?moment(item["Exit Date"]).format("YYYY-MM-DD"):'N/A', //4
				"Total Days": item["Total Days"], //5
				"LOP Days": item["LOP Days"], //6
				"Arrears Days": item["Arrears Days"], //7
				"Present Days": item["Present Days"] ? item["Present Days"] : 0, //8
				"Business Unit": item["Business Unit"], //9
				"Account No": item["Account No"], //10
				"Bank Name": item["Bank Name"], //11
				IFSC: item["IFSC"], //12
				"Monthly CTC": item["Net Pay"], //13
				"Gross Salary": totalEarning, //24
				"Income Tax": item["TDS Amount"], //25
				"Professional Tax": item["PT AMOUNT"], //26
				"ESIC Employee": item["ESIC Employee"], //27
				"Statuary PF": item["PF Employee"], //28
				///////////////FNF-Particular Details////////////////////
				Gratuity: item["gratuityAmount"],
				"Leave Encashment Days": item['leaveEncashmentDays'],
				"Leave Encashment Amount": item["leaveEncashmentAmount"],
				// "Extra Benefit Amount": item["ExtraBenefitAmount"],// excluted on request of Rag and Mukesh
				"Notice Recovery Amount":item["noticeRecoveryAmount"],
				///////////////FNF-Particular Details////////////////////
				// "Personal Deduction Categories": item["Advance Name"],//29
				// "Personal Deduction": item["Advance Amount"],//30
				"Standard Deductions Categories": item["Advance Name"], //29
				"Standard Deductions": item["Advance Amount"], //30
				"LWF Amount": item["LWF AMOUNT"], //31
				"Total Deductions": totalDeduction, //32
				/////Added ///////////
				"Extra Payment Categories": item["EXTRA PAYMENT CATEGORIES"], //33
				"Extra Payment Amount": item["EXTRA PAYMENT AMOUNT"], //34
				"Net Salary": payableAmount != "N/A" ? payableAmount : "0.0", //35
			};
		}

		if (["Balancing", "Earning"].includes(item["salaryComponentEarningType"])) {
			Object.assign(groupedData[employeeId], {
				[item["Element Name"]]: item["Monthly Element Amount"]
					? fnfHelper.customRound(item["Monthly Element Amount"])
					: item["Monthly Element Amount"],
				[item["Element Name"] + " Arrear"]: 0,
			});
			Object.assign(groupedData[employeeId], {
				[item["Element Name"] + " Arrear"]: 0,
			});

			let newObj = {
				[item["Element Name"]]: item["Monthly Element Amount"]
					? fnfHelper.customRound(item["Monthly Element Amount"])
					: item["Monthly Element Amount"],
				[item["Element Name"] + " Arrear"]: 0,
			};

			groupedData[employeeId] = mergeObjects(
				groupedData[employeeId],
				newObj,
				"Monthly CTC",
			);
		}
	});
	return Object.values(groupedData); // Convert the grouped data object back to an array
};

const mergeObjects = (objA, objB, afterKey) => {
	const result = {};
	Object.keys(objA).forEach((key) => {
		result[key] = objA[key];
		if (key === afterKey) {
			Object.keys(objB).forEach((keyB) => {
				result[keyB] = objB[keyB];
			});
		}
	});
	return result;
};


async function processFnf(data) {
	let { processId, req } = data;
	let queryForAllExecutableEmployee = `SELECT pm.payMonth, pd.* FROM payprocessdetails pd JOIN  payprocessmaster pm ON pd.proceessId = pm.payProcessMasterAutoId Where pm.payProcessMasterAutoId= ${processId} AND pd.payStatus in (1);`;
	const result = await db.sequelize.query(queryForAllExecutableEmployee);
	if (result[0].length > 0) {
		const employeeIds = result[0].map((item) => item.EmployeeId);
		const totalWorkingDays = await fnfHelper.getDaysInCurrentMonth({
			year: result[0][0].payMonth.split("-")[0],
			month: result[0][0].payMonth.split("-")[1],
		});

		let employees = employeeIds; //[484,560];//

		for (const employee of employees) {
			var actualWorkingDays = await fnfHelper.actualWorkingDays({
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

			////////////////Verification for PayPackage Assigned/////////////
			const queryForEmployeePayDetails = await fnfHelper.query(7, employee, {
				payMonth: result[0][0].payMonth,
			});
			const employeeDetailsComponentWise = await db.sequelize.query(
				queryForEmployeePayDetails,
			);
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
			const payPackageMonthlyCTC =
				parseFloat(
					employeeDetailsComponentWise?.[0]?.[0]?.payPackageMonthlyCTC,
				) || 0;
			const lopDays =
				parseFloat(employeeDetailsComponentWise?.[0]?.[0]?.lopDays) || 0;
				let actualWorkingDaysBeforeLop=actualWorkingDays;	
				actualWorkingDays = actualWorkingDays - lopDays;
			////////////////Verification for PayPackage Assigned/////////////

			//////////////////Extra Deduciton Verification/////////////
			const queryForExtraDeductions = await fnfHelper.query(
				22,
				employee,
				result[0][0].payMonth,
			);
			const extraDeductonsDetails = await db.sequelize.query(
				queryForExtraDeductions,
			);

			//////////////////Extra Deduciton Verification/////////////

			//////Verified Till here////////

			///////////////////PT/Extraction-Calculation Section////////////// Verified
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
			///////////////////PT/Extraction-Calculation Section////////////Verified

			////////////////////LWF-PT Variable validate and initialize////////////Verified
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

			const ptAmount1 =
				ptDeducationDetails && ptDeducationDetails.ptApplicability == 1
					? ptDeducationDetails?.ptlocationmaster?.ptmapping?.ptAmount
					: 0;
			const lwfAmount1 = lwfAmount;

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
			////////////////////LWF-PT Variable validate and initialize////////////Verified
			/////////////////////////Extra-Payment Extraction//////////////////Verified

			// let allExtraPaymenetQuery = `SELECT SUM(paymentAmount) AS totalExtraPayment, GROUP_CONCAT(category,'(',paymentAmount,')'  ORDER BY category SEPARATOR ' | ') AS paymentCategories FROM extrapayment WHERE paymentMonth = '${result[0][0].payMonth}' AND EmployeeId = ${employee};`;

			let allExtraPaymenetQuery = `SELECT e.id AS EmployeeId, eb.benefitAmount AS ExtraBenefitAmount, epSummary.totalExtraPayment, epSummary.paymentCategories, lco.leaveEncashmentDays ,gor.gratuityYears FROM ${dbName}.employee e LEFT JOIN ${dbName}.extrabenefit eb ON e.id = eb.EmployeeId LEFT JOIN (SELECT EmployeeId, SUM(paymentAmount) AS totalExtraPayment, GROUP_CONCAT(category, '(', paymentAmount, ')' ORDER BY category SEPARATOR ' | ') AS paymentCategories FROM ${dbName}.extrapayment where paymentMonth="${result[0][0].salaryMonth}" and EmployeeId = ${employee} GROUP BY EmployeeId) epSummary ON e.id = epSummary.EmployeeId LEFT JOIN ${dbName}.leavencashmentoverrides lco ON e.id = lco.EmployeeId LEFT JOIN ${dbName}.gratuityoverrides gor ON e.id = gor.EmployeeId WHERE e.id =${employee};`
			let allExtraEarnings = await db.sequelize.query(allExtraPaymenetQuery);
			let deductionQuery = await fnfHelper.query(23, {
				deductionMonth: result[0][0].salaryMonth,
				impactedEmployees: employee,
			});
			let dedcutionDetails = await db.sequelize.query(deductionQuery);
			const {
				EmployeeId,
				ExtraBenefitAmount,
				totalExtraPayment,
				paymentCategories,
				leaveEncashmentDays,
				gratuityYears
			  }= allExtraEarnings[0][0];
			for (const empCopntWiseDetl of employeeDetailsComponentWise[0]) {
				const queryForComponentConfiguration = await fnfHelper.query(
					9,
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
					fnfHelper.getElementValue(
						"Exclude From Special Allowance",
						componentConfiguration[0],
					) == 0
						? 1
						: 0;
				empCopntWiseDetl["includeInPackage"] = includeInPayPackage;
				empCopntWiseDetl["elementMonthlyAmount"] =
					await fnfHelper.getActualMonthlyAmount(
						empCopntWiseDetl.payElementAmount,
						totalWorkingDays,
						actualWorkingDaysBeforeLop,
					);
				empCopntWiseDetl["elementMonthlyAmount"] =
					(await fnfHelper.getElementValue(
						"Affect Loss Of Pay",
						componentConfiguration[0],
					)) == 1
						? fnfHelper.customRound(
								await fnfHelper.arrectLOP(
									empCopntWiseDetl["elementMonthlyAmount"],
									employeeDetailsComponentWise[0][0].lopDays,
									actualWorkingDaysBeforeLop,
								),
							)
						: fnfHelper.customRound(empCopntWiseDetl["elementMonthlyAmount"]);

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
				empCopntWiseDetl["ptAmount"] = dedcutionDetails[0][0].ptAggregateAmount?dedcutionDetails[0][0].ptAggregateAmount:ptAmount1;
				empCopntWiseDetl["lwfAmount"] = dedcutionDetails[0][0].lwfAggregateAmount?dedcutionDetails[0][0].lwfAggregateAmount:lwfAmount1;
				empCopntWiseDetl["extraPaymentAmount"] = totalExtraPayment?totalExtraPayment:0;
				empCopntWiseDetl["extraPaymentCategories"] =paymentCategories?paymentCategories:"";
				empCopntWiseDetl["processId"] = processId;

				////////////////////////////////PF-Applicablity Keys////////////////////////
				let pafApplicableComponet = await fnfHelper.getElementValue(
					"Affect PF",
					componentConfiguration[0],
				);
				let esicApplicableComponent = await fnfHelper.getElementValue(
					"Affects ESIC",
					componentConfiguration[0],
				);
				let pfElementOnMorethan15000AndRestrictionNo =
					fnfHelper.getElementValue(
						"Affect PF >15000 No Restriction",
						componentConfiguration[0],
					);

				let isGratuityApplicable = fnfHelper.getElementValue(
					"Gratuity Applicable",
					componentConfiguration[0],
				);
				let isLeaveEncashmentApplicable = fnfHelper.getElementValue(
					"Affects Leave Encashments",
					componentConfiguration[0],
				);

				let isNoticeRecoveryApplicable = fnfHelper.getElementValue(
					"Affects Recovery Days",componentConfiguration[0]
				)
				empCopntWiseDetl["isPfApplicableComponent"] = pafApplicableComponet;
				empCopntWiseDetl["isPfApplicable"] =
					lwfDeducationDetails.pfApplicability;
				empCopntWiseDetl["isPfRestriction"] = lwfDeducationDetails.pfRestricted;
				empCopntWiseDetl["isEsicApplicable"] =
					lwfDeducationDetails.esicApplicable;
				empCopntWiseDetl["isEsicApplicableComponent"] = esicApplicableComponent;
				empCopntWiseDetl["pfApplicable15000AndNoRestriction"] =
					pfElementOnMorethan15000AndRestrictionNo;
				empCopntWiseDetl["totalWorkingDays"] = actualWorkingDaysBeforeLop;
				empCopntWiseDetl["actualWorkingDays"] = actualWorkingDays;
				empCopntWiseDetl["salaryComponentSequenceNo"] =
					empCopntWiseDetl["salaryComponentSequenceNo"];
				empCopntWiseDetl["isGratuityApplicable"] = isGratuityApplicable;
				empCopntWiseDetl["isLeaveEncashmentApplicable"] =
					isLeaveEncashmentApplicable;
				empCopntWiseDetl['leaveEncashmentDays']=leaveEncashmentDays?leaveEncashmentDays:0;	
				empCopntWiseDetl['ExtraBenefitAmount'] = ExtraBenefitAmount?ExtraBenefitAmount:0;
				empCopntWiseDetl['noticePeriodRecoveryDays'] =dedcutionDetails[0][0].noticeAggregateDays?dedcutionDetails[0][0].noticeAggregateDays:0;
				empCopntWiseDetl['isNoticeRecoveryApplicable']=isNoticeRecoveryApplicable;
			
				// console.log(empCopntWiseDetl);
				//  continue;
				// //////////////////////////////PF-Applicablity Keys//////////////////////////////////
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
			/////////////////Calculation And Updation of PF Amount //////////////////////
			let calculatedPF = await fnfHelper.getCalculatedPF(payElementComponents);
			let getCalculatedESIC =
				await fnfHelper.getCalculatedESIC(payElementComponents);
			let getCalculatedGratuity = await fnfHelper.calculateGratuity(
				payElementComponents,
				gratuityYears?gratuityYears:0,
			);
			// console.log(getCalculatedGratuity);
			// return;
			let leaveEncashmentAmount = await fnfHelper.leaveEncashmentAmount(
				payElementComponents,
				leaveEncashmentDays?leaveEncashmentDays:0,
			);
			//console.log(getCalculatedGratuity);
			let noticePeriodRecoveryAmount = await fnfHelper.noticePeriodRecoveryAmount(
				payElementComponents,
				dedcutionDetails[0][0].noticeAggregateDays?dedcutionDetails[0][0].noticeAggregateDays:0
			);
			console.log("Notice Period Recovery Amount :: ",noticePeriodRecoveryAmount);
			/////////////////Calculation And Updation of PF Amount //////////////////////
			//console.log('Encanshment Amount :: '+fnfHelper.customRound(leaveEncashmentAmount));
			await db.payMonthlyElements.update(
				{
					esicEmployerAmount: getCalculatedESIC.calculatedEmployerESIC,
					esicEmployeeAmount: getCalculatedESIC.calculatedEmployeeESIC,
					pfEmployeeAmount: calculatedPF,
					pfEmployerAmount: calculatedPF,
					gratuityAmount:
						getCalculatedGratuity.gratuityAmount > 0
							? fnfHelper.customRound(getCalculatedGratuity.gratuityAmount)
							: 0,
					leaveEncashmentAmount: fnfHelper.customRound(leaveEncashmentAmount),
					noticeRecoveryAmount: fnfHelper.customRound(noticePeriodRecoveryAmount),

				},
				{ where: { empId: employee, payMonth: result[0][0].payMonth } },
			);
			// /////////////////Calculation And Updation of ESIC Amount //////////////////////
			await db.payProcessDetails.update(
				{ payStatus: 2, payRemark: "FNF Processed." },
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

// End by jay

// start sync lop, tds, extra payment and extra deduction by jay

async function availableEmployeeForProcessing(employeeIds, paymonth) {
	try {
		let queryForInProcess = await fnfHelper.query(3, employeeIds, paymonth);
		let queryForProcessed = await fnfHelper.query(4, employeeIds, paymonth);
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

async function generatePaySlip(data) {
	// console.log("generate pay slip:::::");
	try {
		let { processId, req } = data;

		// get financial year
		let financialYearDetails = await fnfHelper.getFinancialYear();

		let queryForCurrentProcessStatus = await fnfHelper.query(
			20,
			processId,
			null,
		);
		let currentProcessStatus = await db.sequelize.query(
			queryForCurrentProcessStatus,
		);
		if (currentProcessStatus[0][0].currentstatus == 6) {
			let queryForAllEmployeeInProcess = await fnfHelper.query(
				21,
				processId,
				null,
			);
			let employeeInProcess = await db.sequelize.query(
				queryForAllEmployeeInProcess,
			);

			const employeeIds = employeeInProcess[0].map((item) => item.EmployeeId);
			let queryForPayMonthlyElementsForSalarySlip = await fnfHelper.query(
				15,
				currentProcessStatus[0][0].payMonth,
				employeeIds,
			);
		
			let payElements = await db.sequelize.query(
				queryForPayMonthlyElementsForSalarySlip,
			);

			for (const payMonthlyElement of payElements[0]) {
				let employeeExitDate = await db.employeeMaster.findOne({where:{id:payMonthlyElement.empId},attributes:['dateOfexit'],raw:true});
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
				let totalWorkingDays = await fnfHelper.getDaysInCurrentMonth({
					month: payMonthlyElement.payMonth.split("-")[1],
					year: payMonthlyElement.payMonth.split("-")[0],
				});


				let paySlipDuration = `01/${parseInt(
					currentMonth,
				)}/${currentYear}-${new Date(employeeExitDate.dateOfexit).getDate()}/${parseInt(
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
						)+parseFloat(
							payMonthlyElement.noticeRecoveryAmount ? payMonthlyElement.noticeRecoveryAmount : 0,
						);
					totalPayslipDeductons = fnfHelper.customRound(totalPayslipDeductons);
					//console.log("Total Pay Slip Deductions :: ",totalPayslipDeductons);
					let PaySlipNetPay =
						parseFloat(payMonthlyElement.paySlipGrossEarning) +
						parseFloat(
							payMonthlyElement.extrapaymentAmount
								? payMonthlyElement.extrapaymentAmount
								: 0,
						)+	parseFloat(
							payMonthlyElement.ExtraBenefitAmount
								? payMonthlyElement.ExtraBenefitAmount
								: 0,
						)+	parseFloat(
							payMonthlyElement.leaveEncashmentAmount
								? payMonthlyElement.leaveEncashmentAmount
								: 0,
						)+parseFloat(
							payMonthlyElement.gratuityAmount
								? payMonthlyElement.gratuityAmount
								: 0,
						);
					PaySlipNetPay =
						parseFloat(PaySlipNetPay) - parseFloat(totalPayslipDeductons);
					PaySlipNetPay = fnfHelper.customRound(PaySlipNetPay);
					let GrossPayAfterExtraPay =
						parseFloat(payMonthlyElement.paySlipGrossEarning) +
						parseFloat(
							payMonthlyElement.extrapaymentAmount
								? payMonthlyElement.extrapaymentAmount
								: 0,
						);
					GrossPayAfterExtraPay =
						GrossPayAfterExtraPay +
						parseFloat(
							payMonthlyElement.gratuityAmount
								? payMonthlyElement.gratuityAmount
								: 0,
						);
					GrossPayAfterExtraPay =
						GrossPayAfterExtraPay +
						parseFloat(
							payMonthlyElement.leaveEncashmentAmount
								? payMonthlyElement.leaveEncashmentAmount
								: 0,
						);
						GrossPayAfterExtraPay =
						GrossPayAfterExtraPay +
						parseFloat(
							payMonthlyElement.ExtraBenefitAmount
								? payMonthlyElement.ExtraBenefitAmount
								: 0,
						);					
					GrossPayAfterExtraPay = fnfHelper.customRound(GrossPayAfterExtraPay);
					isExistPaySlip = await db.paySlips.create({
						EmployeeId: payMonthlyElement.empId,
						paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
						paySlipYear: payMonthlyElement.payMonth.split("-")[0],
						paySlipFinancialYear: financialYearDetails?.financialYearName,
						financialYearId: financialYearDetails?.financialYearId,
						paySlipDuration: paySlipDuration,
						paySlipTotalDays: totalWorkingDays,
						paySlipWorkingDays:
							payMonthlyElement.totalWorkingDays - payMonthlyElement.lopDays,
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
						encashmentDays:payMonthlyElement.leaveEncashmentDays,
						recoveryDays:payMonthlyElement.noticePeriodRecoveryDays,
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
							paySlipComponentName: "LWF Tax",
							paySlipComponentAmount: payMonthlyElement.lwfAmount,
							paySlipComponentType: "Deduction",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}

					if (payMonthlyElement.noticeRecoveryAmount > 0) {
					  customeDeduction.push({
					    EmployeeId: payMonthlyElement.empId,
					    paySlipAutoId: paySlipAutoId,
					    salaryComponentAutoId: 0,
					    paySlipComponentName: "Notice Period Recovery Amount",
					    paySlipComponentAmount: payMonthlyElement.noticeRecoveryAmount,
					    paySlipComponentType: "Deduction",
					    createdBy: req.userData.id,
					    createdAt: new Date(),
						salaryComponentSequenceNo: 999,
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
							salaryComponentSequenceNo: 999,
						});
					}

					if (payMonthlyElement.gratuityAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "Gratuity",
							paySlipComponentAmount: payMonthlyElement.gratuityAmount,
							paySlipComponentType: "Earning",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}
					if (payMonthlyElement.leaveEncashmentAmount > 0) {
						customeDeduction.push({
							EmployeeId: payMonthlyElement.empId,
							paySlipAutoId: paySlipAutoId,
							salaryComponentAutoId: 0,
							paySlipComponentName: "Leave Encashment",
							paySlipComponentAmount: payMonthlyElement.leaveEncashmentAmount,
							paySlipComponentType: "Earning",
							createdBy: req.userData.id,
							createdAt: new Date(),
							salaryComponentSequenceNo: 999,
						});
					}

					if (payMonthlyElement.ExtraBenefitAmount > 0) {
						customeDeduction.push({
						  EmployeeId: payMonthlyElement.empId,
						  paySlipAutoId: paySlipAutoId,
						  salaryComponentAutoId: 0,
						  paySlipComponentName: "Extra Benefit",
						  paySlipComponentAmount: payMonthlyElement.ExtraBenefitAmount,
						  paySlipComponentType: "Earning",
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
					let getExtraDeductions = await fnfHelper.getExtraDeductionsElements(
						payMonthlyElement.payMonth,
						payMonthlyElement.empId,
						paySlipAutoId,
						req.userData.id,
					);
					let getExtraEarnings = await fnfHelper.getExtraEarningElements(
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
							? fnfHelper.customRound(payMonthlyElement.elementMonthlyAmount)
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
				// sendMailAfterSalarySlipRelease(
				//   employeeIds,
				//   currentProcess.payMonth,
				//   companyLogo,
				// );
			}
		}
	} catch (e) {
		console.log(e);
	}
}

export default new FnfController();
