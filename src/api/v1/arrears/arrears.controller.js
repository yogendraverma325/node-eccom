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
import payMonthlyElements from "../../model/payMonthlyElements.js";
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
			let arrearType = req.body.arrearsTypeId == "1" ? "LOP" : "Increment";
			let companyId = req.body.companyId;
			let arrearListQuery = await arrearsHelper.query(1, arrearPayMonth, {
				status: status,
				arrearType: arrearType,
				companyId: companyId,
			});
			let arrearsCountQuery = await arrearsHelper.query(2, arrearPayMonth, {
				companyId: companyId,
				arrearType: arrearType,
			});
			let arrearsData = await db.sequelize.query(arrearListQuery);
			let arrearsCountData = await db.sequelize.query(arrearsCountQuery);

			//console.log(arrearsCountQuery);

			return respHelper(res, {
				status: 200,
				data: {
					arrearsList: arrearsData[0],
					arrearsCount: arrearsCountData[0][0],
				},
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
			let arrearsAutoIds = req.body.arrearsAutoIds
				? req.body.arrearsAutoIds.split(",")
				: [];
			let arrearsTypeId = req.body.arrearsTypeId;
			let processingArreresList = await db.earningsArears.findAll({
				where: { earningArrearAutoId: { [Op.in]: arrearsAutoIds }, status: 1 },
				raw: true,
			});

			if (processingArreresList.length == 0) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: "Arrears Data Not Found Processing or Already Processed.",
				});
			}
			await processingArrears(req, res, processingArreresList);
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteArrears(req, res) {
		try {
			let arrearsAutoIds = req.body.arrearsAutoIds
				? req.body.arrearsAutoIds.split(",")
				: [];
			let arrearsTypeId = req.body.arrearsTypeId;
			let deletedRecords = await db.earningsArears.destroy({
				where: { earningArrearAutoId: { [Op.in]: arrearsAutoIds } },
				raw: true,
			});
			return respHelper(res, {
				status: 200,
				data: deletedRecords,
				msg: "Delete operation successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async employeeListForArrears(req, res) {
		try {
			let searchString = req.body.searchString;
			let employeeListForArrears = await db.employeeMaster.findAll({
				where: {
					[Op.or]: [
						{ name: { [Op.like]: `%${searchString}%` } },
						{ email: { [Op.like]: `%${searchString}%` } },
						{ empCode: { [Op.like]: `%${searchString}%` } },
					],
					isActive: 1,
				},
				attributes: [
					["name", "empName"],
					["empCode", "empId"],
					"buId",
					"sbuId",
					"companyId",
					"id",
				],
			});

			return respHelper(res, {
				status: 200,
				data: employeeListForArrears,
				msg: "Employee List Fetched Successfully.",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async addEditSingleArrear(req, res) {
		try {
			const { error, value } = await validator.addEditSingleArrear.validate(
				req.body,
			);
			let operationType;

			if (error) {
				return respHelper(res, {
					status: 400,
					data: [],
					msg: error.details[0].message,
				});
			}
			let existingArrear = await db.earningsArears.findOne({
				where: { arrearMonth: value.arrearMonth, EmployeeId: value.EmployeeId },
				raw: true,
			});
			if (!existingArrear) {
				db.earningsArears.create(value);
				operationType = "Created";
			} else {
				db.earningsArears.update(value, {
					where: { earningArrearAutoId: existingArrear.earningArrearAutoId },
				});
				operationType = "Updated";
			}

			return respHelper(res, {
				status: 200,
				data: value,
				msg: "Arrears " + operationType + " Successfully.",
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

async function processingArrears(req, res, arrearsDataForProcessing) {
	try {
		let failedCount = 0,
			successCounts = 0;
		for (const arrear of arrearsDataForProcessing) {
			console.log(arrear.arearType + "Arrears....");
			if (arrear.arearType == "Increment") {
				let arrearsUpdateDetails = await incrementArrearsProcessing(arrear);
				failedCount = arrearsUpdateDetails.failedCount + failedCount;
				successCounts = arrearsUpdateDetails.successCounts + successCounts;
			} else if (arrear.arearType == "LOP") {
				let arrearsUpdateDetails = await lopArrearsProcessing(arrear);

				failedCount = arrearsUpdateDetails.failedCount + failedCount;
				successCounts = arrearsUpdateDetails.successCounts + successCounts;
			}
		}
		return respHelper(res, {
			status: 200,
			data: [],
			msg:
				"Arrears processing completed successfully with " +
				successCounts +
				" completed and" +
				failedCount +
				"failed records.",
		});
	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}

async function lopArrearsProcessing(arrear) {
	let failedCount = 0,
		successCounts = 0,
		updateObject = null;
	let arrearDetails = null;
	let arrearsMonthPayDetails = await db.payMonthlyElements.findAll({
		where: { empId: arrear.EmployeeId, payMonth: arrear.arrearMonth },
		raw: true,
	});

	// console.log(arrear.arrearMonth,arrear.EmployeeId);
	//return

	if (arrearsMonthPayDetails.length == 0) {
		failedCount = failedCount + 1;
		await db.earningsArears.update(
			{
				status: 2,
				processingRemark:
					"PaySlip not generated for the month " + arrear.arrearMonth,
				processedOn: new Date(),
			},
			{ where: { earningArrearAutoId: arrear.earningArrearAutoId } },
		);
	}
	if (
		arrearsMonthPayDetails[0].totalWorkingDays ==
		arrearsMonthPayDetails[0].actualWorkingDays
	) {
		failedCount = failedCount + 1;

		updateObject = {
			status: 2,
			processingRemark:
				"No lop deducions found for the month " + arrear.arrearMonth,
			processedOn: new Date(),
		};
	} else if (arrearsMonthPayDetails[0].lopDays < arrear.arearDays) {
		failedCount = failedCount + 1;
		updateObject = {
			status: 2,
			processingRemark: "Arreras days exeeding lops in " + arrear.arrearMonth,
			processedOn: new Date(),
		};
	} else if (arrearsMonthPayDetails[0].lopDays >= arrear.arearDays) {
		successCounts = successCounts + 1;
		if (arrearsMonthPayDetails.length > 0) {
			arrearDetails = await arrearsHelper.calculateArrersAmount(
				arrearsMonthPayDetails,
				arrear.arearDays,
				arrear.earningArrearAutoId,
			);
			updateObject = {
				status: 3,
				processingRemark: "Arrear Processed Successfully",
				processedOn: new Date(),
				//arrearsDetails: JSON.stringify(arrearDetails),
			};
		} else {
			failedCount = failedCount + 1;
			updateObject = {
				status: 2,
				processingRemark: "Arreras days exeeding lops in " + arrear.arrearMonth,
				processedOn: new Date(),
			};
		}
	}
	await db.earningsArears.update(updateObject, {
		where: { earningArrearAutoId: arrear.earningArrearAutoId },
	});
	if (arrearDetails && updateObject.status == 3) {
		await db.earningsArearAmounts.bulkCreate(arrearDetails);
	}
	return { failedCount, successCounts };
}

async function incrementArrearsProcessing(arrear) {
	let failedCount = 0,
		successCounts = 0,
		updateObject = null,
		arrearsDetails = [];

	try {
		let previousPayPackageDetails = await db.payElements.findAll({
			where: { payPackageAutoId: arrear.lastPackageId },
			raw: true,
			include: [
				{
					model: db.salaryComponent,
					required: true,
					attributes: [
						"salaryComponentAutoId",
						"salaryComponentAlias",
						"salaryComponentCode",
						"salaryComponentEarningType",
					],
					where: {
						salaryComponentEarningType: { [Op.in]: ["Earning", "Balancing"] },
					},
				},
			],
		});
		let currentPayPackageDetails = await db.payElements.findAll({
			where: { payPackageAutoId: arrear.currentPackageId },
			raw: true,
			include: [
				{
					model: db.salaryComponent,
					required: true,
					attributes: [
						"salaryComponentAutoId",
						"salaryComponentAlias",
						"salaryComponentCode",
						"salaryComponentEarningType",
						"salaryComponentSequenceNo",
					],
					where: {
						salaryComponentEarningType: { [Op.in]: ["Earning", "Balancing"] },
					},
				},
			],
		});

		await currentPayPackageDetails.map((current) => {
			const previous = previousPayPackageDetails.find(
				(item) => item.salaryComponentAutoId === current.salaryComponentAutoId,
			);
			const previousAmount = parseFloat(previous?.payElementAmount || 0);
			const currentAmount = parseFloat(current.payElementAmount);
			const arrearAmount =
				currentAmount - previousAmount == 0
					? 0
					: ((currentAmount - previousAmount) / arrear.paySlipTotalDays) *
						arrear.arearDays;

			let arrearObject = {};
			arrearObject["arrearName"] = current[
				"salarycomponent.salaryComponentAlias"
			]
				? current["salarycomponent.salaryComponentAlias"]
				: current["salarycomponent.salaryComponentCode"];
			arrearObject["arrearAmunt"] = arrearAmount.toFixed(2);
			arrearObject["type"] = "Earning"; // current['salarycomponent.salaryComponentEarningType'];
			arrearObject["seq"] =
				current["salarycomponent.salaryComponentSequenceNo"];

				arrearObject["componentAutoId"] =
				current["salarycomponent.salaryComponentAutoId"];
					arrearObject["componentAutoId"] =
				current["salarycomponent.salaryComponentAutoId"];
				arrearObject["earningArrearAutoId"]=arrear.earningArrearAutoId,
			arrearsDetails.push(arrearObject);
		});
		//return
		let payMonth = moment().format("YYYY-MM");
		updateObject = {
			status: 3,
			processingRemark: "Arrear Processed Successfully",
			processedOn: new Date(),
			//arrearsDetails: JSON.stringify(arrearsDetails),
			arrearPayMonth: payMonth,
		};

		await db.earningsArears.update(updateObject, {
			where: { earningArrearAutoId: arrear.earningArrearAutoId },
		});
			if (arrearsDetails && updateObject.status == 3) {
			    await db.earningsArearAmounts.bulkCreate(arrearsDetails);
		}
		successCounts = 1;
	} catch (e) {
		failedCount = 1;
		updateObject = {
			status: 3,
			processingRemark: "Something went wrong",
			processedOn: new Date(),
		};

		await db.earningsArears.update(updateObject, {
			where: { earningArrearAutoId: arrear.earningArrearAutoId },
		});

	
	}

	return { failedCount, successCounts };
}
