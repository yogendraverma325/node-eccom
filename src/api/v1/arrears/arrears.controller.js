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
			let companyId  =req.body.companyId;
			let arrearListQuery = await arrearsHelper.query(1, arrearPayMonth, {
				status: status,
				arrearType: arrearType,
				companyId:companyId
			});
			let arrearsCountQuery = await arrearsHelper.query(2, arrearPayMonth,{
				companyId:companyId
			});
			let arrearsData = await db.sequelize.query(arrearListQuery);
			let arrearsCountData = await db.sequelize.query(arrearsCountQuery);


			console.log(arrearListQuery);

			return respHelper(res, {
				status: 200,
				data: {arrearsList:arrearsData[0],arrearsCount:arrearsCountData[0][0]},
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

			if (arrearsTypeId == "1") {
				await processLopArrears(req, res, processingArreresList);
			}
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
			let deletedRecords=await db.earningsArears.destroy({
				where: { earningArrearAutoId: { [Op.in]: arrearsAutoIds } },
				raw: true,
			});
			return respHelper(res, {
				status: 200,
				data:deletedRecords,
				msg: "Delete operation successfully.",
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

async function processLopArrears(req, res, arrearsDataForProcessing) {
	try {
		let failedCount=0,successCounts=0;
		for (const arrear of arrearsDataForProcessing) {
			let paidMonthPaySlipDetails = await db.paySlips.findOne({
				where: { EmployeeId: arrear.EmployeeId, payMonth: arrear.arrearMonth },
				raw: true,
			});
			console.log(paidMonthPaySlipDetails);
			if (!paidMonthPaySlipDetails) {
				failedCount=failedCount+1;
				await db.earningsArears.update(
					{
						status: 2,
						processingRemark:
							"PaySlip not generated for the month " + arrear.arrearMonth,
							processedOn:new Date()
					},
					{ where: { earningArrearAutoId: arrear.earningArrearAutoId } },
				);
				continue;
			}
			if (
				paidMonthPaySlipDetails.paySlipTotalDays ==
				paidMonthPaySlipDetails.paySlipWorkingDays
			) {
				failedCount=failedCount+1;
				db.earningsArears.update(
					{
						status: 2,
						processingRemark:
							"No lop deducions found for the month " + arrear.arrearMonth,
							processedOn:new Date()
					},
					{ where: { earningArrearAutoId: arrear.earningArrearAutoId } },
				);
				continue;
			}
			if (paidMonthPaySlipDetails.paySlipAbsentDays < arrear.arearDays) {
				failedCount=failedCount+1;
				db.earningsArears.update(
					{
						status: 2,
						processingRemark:
							"Arreras days exeeding lops in " + arrear.arrearMonth,
							processedOn:new Date()
					},
					{ where: { earningArrearAutoId: arrear.earningArrearAutoId } },
				);
				continue;
			}

			if (paidMonthPaySlipDetails.paySlipAbsentDays >= arrear.arearDays) {
				successCounts=successCounts+1;
				db.earningsArears.update(
					{
						status: 3,
						processingRemark: "Arrears Processed Successfully.",
						updatedBy: req.userData.id,
						processedOn:new Date()
					},
					{ where: { earningArrearAutoId: arrear.earningArrearAutoId } },
				);
				continue;
			}
		}
		return respHelper(res, {
			status: 200,
			data:[],
			msg: "Arrears processing completed successfully with "+successCounts+" completed and"+failedCount+"failed records.",
		});

	} catch (error) {
		console.log(error);
		return respHelper(res, {
			status: 500,
		});
	}
}
