import { Op, Sequelize, where } from "sequelize";
import db from "../../../config/db.config.js";
import { parse } from "dotenv";
import moment from "moment";

const dbName = process.env.DB_NAME;
let paySlipComponentObject = {
	EmployeeId: "",
	paySlipAutoId: "",
	salaryComponentAutoId: 0,
	paySlipComponentName: "",
	paySlipComponentType: "",
	createdBy: "",
	createdAt: "",
	isActive: 0,
	paySlipComponentAmount: "",
};

const payAfterLOPDeductions = async function (employeesList, lopDeductions) {
	let totalWorkingDays = getDaysInCurrentMonth(),
		dataAfterLopDeductions = [],
		errorArray = [];
	for (const employee of employeesList) {
		try {
			if (!employee.packageDetails) {
				errorArray.push({
					EmployeeId: employee.id,
					Message: "CTC Not Assigned.",
				});
				continue;
			}
			let lopDays = lopDeductions[employee.empCode]
				? lopDeductions[employee.empCode]
				: 0;
			let obj = {
				EmployeeId: employee.id,
				EmployeeName: employee.name,
				ctc: employee.packageDetails.payPackageMonthlyCTC,
				lopDays: lopDays,
				lopDeductions:
					lopDays == 0
						? 0
						: (
								(employee.packageDetails.payPackageMonthlyCTC /
									totalWorkingDays) *
								lopDays
							).toFixed(2),
				totalWorkingDays: totalWorkingDays,
			};
			Object.assign(obj, { netPay: (obj.ctc - obj.lopDeductions).toFixed(2) });
			dataAfterLopDeductions.push(obj);
		} catch (e) {
			errorArray.push({
				EmployeeId: employee.id,
				Message: e.Message,
			});
		}
	}
	return { dataAfterLopDeductions, errorArray };
};

const payAfterTDSDeductions = async function (employeesList, tdsDeductions) {
	let dataAfterTdsDeductions = [];
	for (const employee of employeesList) {
		employee["netPay"] = tdsDeductions[employee.EmployeeId]
			? employee["netPay"] - tdsDeductions[employee.EmployeeId]
			: employee["netPay"];
		employee["tdsDeductions"] = tdsDeductions[employee.EmployeeId]
			? tdsDeductions[employee.EmployeeId]
			: 0;
		// employee["payAfterTds"] = employee["netPay"];
		dataAfterTdsDeductions.push(employee);
	}
	return employeesList;
};

const payAfterStandardDeductions = async function (
	employeesList,
	standardDeductions,
) {
	let dataAfterStandardDeductions = [];
	for (const employee of employeesList) {
		let deduction = 0,
			deductionObject = {};
		employee["deductionName"] = null;
		employee["deductionAmount"] = 0;
		if (!standardDeductions[employee.EmployeeId]) {
			dataAfterStandardDeductions.push(employee);
			continue;
		}

		for (const standdardDeducton of standardDeductions[employee.EmployeeId]) {
			deduction =
				parseFloat(deduction) + parseFloat(standdardDeducton["Total Amount"]);
			employee["deductionName"] =
				employee["deductionName"] == null
					? standdardDeducton["Name"]
					: employee["deductionName"] + "," + standdardDeducton["Name"];
			employee["deductionAmount"] = deduction;
		}
		employee["netPay"] = employee["netPay"] - employee["deductionAmount"];
		// employee["netPayAfterStandardDeduction"] = employee["netPay"];
		dataAfterStandardDeductions.push(employee);
	}
	return dataAfterStandardDeductions;
};

const standardDeductions = async function (data) {
	const deductionsMap = data.reduce((acc, curr) => {
		const employeeId = curr["EmployeeId"];
		const category = curr["deductionCategory"];

		// If the employee ID is not yet in the accumulator, add it
		if (!acc[employeeId]) {
			acc[employeeId] = [];
		}

		// Add the current deduction details for this employee
		acc[employeeId].push({
			Category: category,
			Name: curr["deductionName"],
			"Total Amount": curr["deductionAmount"],
			"Start Month": curr["startMonth"],
			Deductions: curr["numberOfDeductions"],
		});

		return acc;
	}, {});

	return deductionsMap;
};

const getDaysInCurrentMonth = async function (data) {
	const currentYear = data.year;
	const currentMonth = data.month;
	// Get the total number of days in the current month
	const lastDayOfMonth = new Date(currentYear, currentMonth, 0); // Last day of the month
	return lastDayOfMonth.getDate();
};

const actualWorkingDays = async function (data) {
	try {
		const employeeId = data.employeeId;
		const payMonth = data.month;
		const payYear = data.year;
		const queryForCurrentJoiningDate = await query(26, employeeId, {
			payMonth: payMonth,
			payYear: payYear,
		});
		console.log("Query ::::  " + queryForCurrentJoiningDate);
		const employeeDetailsComponentWise = await db.sequelize.query(
			queryForCurrentJoiningDate,
		);
		console.log(employeeDetailsComponentWise);
		if (employeeDetailsComponentWise[0].length == 0) {
			return data.totalWorkingDays;
		} else {
			let joiningDate = employeeDetailsComponentWise[0][0].dateOfJoining;
			let leftDayaInMonth = daysLeftInMonth(joiningDate);
			return leftDayaInMonth;
		}
	} catch (e) {
		console.log(e);
		return null;
	}
};

const salaryPaySlip = async function (paySlipAutoId) {
	try {
		const paySlip = await db.paySlips.findAll({
			where: {
				paySlipAutoId: paySlipAutoId,
			},
			// order: [["createdAt", "desc"]],
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
							model: db.buMaster,
							attributes: ["buName"],
						},
						{
							model: db.employeeTypeMaster,
							attributes: ["emptypename"],
						},
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
							attributes: [
								"dateOfJoining",
								"uanNumber",
								"esicNumber",
								"pfNumber",
							],
						},
						{
							model: db.companyLocationMaster,
							attributes: [
								"companyLocationId",
								"companyId",
								"address1",
								"companyLocationCode",
							],
							include: [
								{
									model: db.cityMaster,
									attributes: ["cityName"],
								},
								{
									model: db.stateMaster,
									attributes: ["stateName"],
								},
							],
						},
						{
							model: db.companyMaster,
							attributes: ["companyName", "companyLogo"],
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
		// console.log(paySlip)
		return paySlip;
		// return respHelper(res, {
		//   status: 200,
		//   data: paySlip,
		// });
	} catch (error) {
		console.log(error);
		// return respHelper(res, {
		// 	status: 500,
		// });
	}
};

function getPercentage(part, total) {
	if (total === 0) {
		throw new Error("Total cannot be zero.");
	}

	return ((part / total) * 100).toFixed(2);
}

function getPercentagePart(total, percentage) {
	return (total * (percentage / 100)).toFixed(2);
}

function getFromattedDate(dateInIntger) {
	const formattedDate = new Date((dateInIntger - 25569) * 86400 * 1000); // Convert Excel serial to JS Date
	// Extract day, month, and year
	const day = String(formattedDate.getDate()).padStart(2, "0"); // Pad single-digit days
	const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
	const year = formattedDate.getFullYear();

	const date = `${day}-${month}-${year}`; // Format as DD-MM-YYYY
	// console.log("*************DATE***********");
	// console.log(date);
	// console.log("*************DATE***********");
	return date;
}

async function query(caseId, data, data2) {
	switch (caseId) {
		case 1:
			//return `SELECT  p.salaryComponentEarningType,p.esicEmployerAmount as "ESIC Employer",p.esicEmployeeAmount as "ESIC Employee",p.pfEmployeeAmount as "PF Employee",p.pfEmployerAmount as "PF Employer",p.salaryComponentCode,p.includeInPackage,p.isPfApplicableComponent,p.isPfApplicable,p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) - SUM(CASE WHEN p.salaryComponentEarningType = 'Deduction' THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`;
			//return `SELECT p.totalExtraDeduction as "EXTRA DEDUCTION",p.extraPaymentCategories as "EXTRA PAYMENT CATEGORIES",p.salaryComponentEarningType, p.esicEmployerAmount AS "ESIC Employer", p.esicEmployeeAmount AS "ESIC Employee", p.pfEmployeeAmount AS "PF Employee", p.pfEmployerAmount AS "PF Employer", p.salaryComponentCode, p.includeInPackage, p.isPfApplicableComponent, p.isPfApplicable, p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning", ed.deductionCategory AS "Deduction Category", ed.deductionAmount AS "Deduction Amount" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id LEFT JOIN ${dbName}.extradeductions ed ON p.empId = ed.EmployeeId AND p.payMonth = ed.startMonth WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`;
			return `SELECT p.actualWorkingDays "Present Days",p.totalWorkingDays AS "Total Days", e.dateOfexit AS "Exit Date", ej.dateOfJoining AS "Date of Joining", p.totalExtraDeduction AS "EXTRA DEDUCTION", p.extraPaymentCategories AS "EXTRA PAYMENT CATEGORIES", p.salaryComponentEarningType, p.esicEmployerAmount AS "ESIC Employer", p.esicEmployeeAmount AS "ESIC Employee", p.pfEmployeeAmount AS "PF Employee", p.pfEmployerAmount AS "PF Employer", p.salaryComponentCode, p.includeInPackage, p.isPfApplicableComponent, p.isPfApplicable, p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning", ed.deductionCategory AS "Deduction Category", ed.deductionAmount AS "Deduction Amount", bu.buName AS "Business Unit", epd.paymentAccountNumber AS "Account No", epd.paymentBankName AS "Bank Name", epd.paymentBankIfsc AS "IFSC" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id LEFT JOIN ${dbName}.employeejobdetails ej ON e.id = ej.userId LEFT JOIN ${dbName}.extradeductions ed ON p.empId = ed.EmployeeId AND p.payMonth = ed.startMonth LEFT JOIN ${dbName}.bumaster bu ON e.buId = bu.buId LEFT JOIN ${dbName}.employeepaymentdetails epd ON e.id = epd.userId WHERE p.payMonth = '${data}' AND p.empId IN (${data2})  order by salaryComponentSequenceNo desc;`;
			break;
		case 2:
			return `SELECT p.EmployeeId, p.paySlipNetPay, e.name AS EmployeeName, e.empCode AS EmployeeCode, d.name AS Designation, b.buName AS BU FROM ${dbName}.payslip p JOIN ${dbName}.employee e ON p.EmployeeId = e.id JOIN ${dbName}.designationmaster d ON e.designation_id = d.designationId JOIN ${dbName}.bumaster b ON e.buId = b.buId WHERE p.EmployeeId IN (${data}) AND paySlipStatus = ${data2}`;
			break;
		case 3:
			return `SELECT salarystructure.salaryStructureName as StructureName,  employee.id, employee.empCode as EmployeeId , employee.name as EmployeeName, bumaster.buName as BuName, designationmaster.name as DesignationName FROM ${dbName}.salarystructure JOIN ${dbName}.paypackage ON salarystructure.salaryStructureName = paypackage.payPackageSalaryStructure JOIN ${dbName}.employee ON paypackage.EmployeeId = employee.id JOIN ${dbName}.bumaster ON employee.buId = bumaster.buId JOIN ${dbName}.designationmaster ON employee.designation_id = designationmaster.designationId WHERE salarystructure.salaryStructureAutoId = ${data}`;
			break;
		case 4:
			//			return `SELECT pm.name AS process_name, pm.payMonth, pm.payProcessMasterAutoId as processId , pm.createdAt, pm.updatedBy, pm.updatedAt,pm.processType, pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description, e.name AS created_by_name, cm.companyName AS company_name, COUNT(pd.proceessId) AS process_details_count, pm.filterType FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN ${dbName}.paystatusmaster ps ON pf.currentstatus = ps.payProcessStatusAutoId LEFT JOIN ${dbName}.employee e ON pm.createdBy = e.id INNER JOIN ${dbName}.companymaster cm ON pm.companyId = cm.companyId LEFT JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId WHERE ps.payProcessStatusAutoId IN (${data}) AND pm.payMonth = "${data2.paymonth}" AND pm.companyId = ${data2.companyId} AND pm.processType='${data2.processType}' GROUP BY pm.payProcessMasterAutoId`;
			//return `SELECT pm.name AS process_name, pm.payMonth, pm.payProcessMasterAutoId AS processId, pm.createdAt, pm.updatedBy, pm.updatedAt, pm.processType, pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description, e.name AS created_by_name, cm.companyName AS company_name, COUNT(pd.proceessId) AS process_details_count, pm.filterType, COUNT(CASE WHEN psli.paySlipStatus = 1 THEN 1 END) AS paySlipRelease, COUNT(CASE WHEN psli.paySlipStatus IN (0,1) THEN 1 END) AS paySlipGenerated, GROUP_CONCAT(CASE WHEN psli.paySlipStatus = 1 THEN psli.EmployeeId END) AS paySlipReleaseIds, GROUP_CONCAT(CASE WHEN psli.paySlipStatus IN (0,1) THEN psli.EmployeeId END) AS paySlipGeneratedIds,GROUP_CONCAT(CASE WHEN psli.paySlipStatus IN (0) THEN psli.EmployeeId END) AS paySlipNeedToGeneratedIds FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN ${dbName}.paystatusmaster ps ON pf.currentstatus = ps.payProcessStatusAutoId LEFT JOIN ${dbName}.employee e ON pm.createdBy = e.id INNER JOIN ${dbName}.companymaster cm ON pm.companyId = cm.companyId LEFT JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId LEFT JOIN ${dbName}.payslip psli ON pd.EmployeeId = psli.EmployeeId AND pd.payMonth = psli.payMonth WHERE ps.payProcessStatusAutoId IN (${data}) AND pm.payMonth = "${data2.paymonth}" AND pm.companyId = ${data2.companyId} AND pm.processType = '${data2.processType}' GROUP BY pm.payProcessMasterAutoId;`
			return `SELECT pm.name AS process_name, pm.payMonth, pm.payProcessMasterAutoId AS processId, pm.createdAt, pm.updatedBy, pm.updatedAt, pm.processType, pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description, e.name AS created_by_name, cm.companyName AS company_name, COUNT(pd.proceessId) AS process_details_count, pm.filterType, COUNT(CASE WHEN psli.paySlipStatus = 1 THEN 1 END) AS paySlipRelease, COUNT(CASE WHEN psli.paySlipStatus IN (0, 1) THEN 1 END) AS paySlipGenerated, (SELECT COUNT(CASE WHEN psli_inner.paySlipStatus = 1 THEN 1 END) FROM ${dbName}.payslip psli_inner INNER JOIN ${dbName}.payprocessdetails pd_inner ON pd_inner.EmployeeId = psli_inner.EmployeeId AND pd_inner.payMonth = psli_inner.payMonth WHERE pd_inner.payMonth = "${data2.paymonth}" AND pd_inner.companyId = ${data2.companyId}) AS paySlipReleaseTotal, (SELECT COUNT(CASE WHEN psli_inner.paySlipStatus IN (0, 1) THEN 1 END) FROM ${dbName}.payslip psli_inner INNER JOIN ${dbName}.payprocessdetails pd_inner ON pd_inner.EmployeeId = psli_inner.EmployeeId AND pd_inner.payMonth = psli_inner.payMonth WHERE pd_inner.payMonth = "${data2.paymonth}" AND pd_inner.companyId = ${data2.companyId}) AS paySlipGeneratedTotal, GROUP_CONCAT(CASE WHEN psli.paySlipStatus = 1 THEN psli.EmployeeId END) AS paySlipReleaseIds, GROUP_CONCAT(CASE WHEN psli.paySlipStatus IN (0, 1) THEN psli.EmployeeId END) AS paySlipGeneratedIds, (SELECT GROUP_CONCAT(psli_inner.EmployeeId) FROM ${dbName}.payslip psli_inner INNER JOIN ${dbName}.payprocessdetails pd_inner ON pd_inner.EmployeeId = psli_inner.EmployeeId AND pd_inner.payMonth = psli_inner.payMonth WHERE psli_inner.paySlipStatus = 1 AND pd_inner.payMonth = "${data2.paymonth}" AND pd_inner.companyId = ${data2.companyId}) AS paySlipReleaseIdsTotal, (SELECT GROUP_CONCAT(psli_inner.EmployeeId) FROM ${dbName}.payslip psli_inner INNER JOIN ${dbName}.payprocessdetails pd_inner ON pd_inner.EmployeeId = psli_inner.EmployeeId AND pd_inner.payMonth = psli_inner.payMonth WHERE psli_inner.paySlipStatus IN (0,1) AND pd_inner.payMonth = "${data2.paymonth}" AND pd_inner.companyId = ${data2.companyId}) AS paySlipGeneratedIdsTotal, GROUP_CONCAT(CASE WHEN psli.paySlipStatus = 0 THEN psli.EmployeeId END) AS paySlipNeedToGeneratedIds, (SELECT GROUP_CONCAT(psli_inner.EmployeeId) FROM ${dbName}.payslip psli_inner INNER JOIN ${dbName}.payprocessdetails pd_inner ON pd_inner.EmployeeId = psli_inner.EmployeeId AND pd_inner.payMonth = psli_inner.payMonth WHERE psli_inner.paySlipStatus = 0 AND pd_inner.payMonth = "${data2.paymonth}" AND pd_inner.companyId = ${data2.companyId}) AS paySlipNeedToGeneratedIdsTotal FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN ${dbName}.paystatusmaster ps ON pf.currentstatus = ps.payProcessStatusAutoId LEFT JOIN ${dbName}.employee e ON pm.createdBy = e.id INNER JOIN ${dbName}.companymaster cm ON pm.companyId = cm.companyId LEFT JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId LEFT JOIN ${dbName}.payslip psli ON pd.EmployeeId = psli.EmployeeId AND pd.payMonth = psli.payMonth WHERE ps.payProcessStatusAutoId IN (${data}) AND pm.payMonth = "${data2.paymonth}" AND pm.companyId = ${data2.companyId} AND pm.processType = '${data2.processType}' GROUP BY pm.payProcessMasterAutoId;`;
			break;
		case 5:
			return `SELECT pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, pf.currentstatus, ps.name AS status_name, ps.description AS status_description FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN ${dbName}.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pm.payProcessMasterAutoId = ${data};`;
			break;
		case 6:
			return `SELECT pf.refferenceFlowId, ps.currentRemark FROM ${dbName}.payprocessflowmaster pf INNER JOIN ${dbName}.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.nextstatus = ${data2} AND pf.currentstatus = ${data}`;
			break;

		case 7:
			return `SELECT pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description FROM ${dbName}.payprocessflowmaster pf INNER JOIN ${dbName}.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.currentstatus = ${data}`;
			break;
		case 8:
			return `SELECT ppm.payProcessMasterAutoId, COUNT(CASE WHEN ppd.payStatus = 2 THEN 1 END) AS successfullyProcessed, COUNT(CASE WHEN ppd.payStatus in(101) THEN 1 END) AS processedWithError, COUNT(CASE WHEN ppd.payStatus = 1 THEN 1 END) AS pendingForProcess, COUNT(CASE WHEN ppd.payStatus != 1 THEN 1 END) * 100.0 / COUNT(*) AS totalProcessedPercentage, COUNT(CASE WHEN ppd.payStatus not in(1) THEN 1 END) AS totalProcessed FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessdetails ppd ON ppm.payProcessMasterAutoId = ppd.proceessId WHERE ppm.payProcessMasterAutoId = ${data} GROUP BY ppm.payProcessMasterAutoId;`;
			break;
		case 9:
			return `SELECT ppm.payProcessMasterAutoId AS processId,ppm.payMonth as payMonth, psm.payProcessStatusAutoId AS currentStatusId, psm.name AS statusName FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN ${dbName}.paystatusmaster psm ON ppfm.currentstatus = psm.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`;
			break;
		case 10:
			return `SELECT pm.payProcessMasterAutoId, pd.ctc, pd.lopDays, pd.totalWorkingDays, pd.tdsdeductions, pd.netPay, pd.deductionAmount, pd.arrearAmount, pd.loanAmont, pd.salaryMonth, pd.deductionName, pd.lopdeductions, pp.payPackageEffectiveDate, pe.salaryComponentAutoId, pe.payElementAmount, sc.includeInPackage, sc.includeInPackage, sc.salaryComponentEarningType FROM ${dbName}.payprocessmaster pm JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId JOIN ${dbName}.paypackage pp ON pd.EmployeeId = pp.EmployeeId JOIN ${dbName}.payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId JOIN ${dbName}.salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE pm.payProcessMasterAutoId = 1 AND pd.payStatus = 2 AND pd.EmployeeId = 484`;
			break;
		case 11:
			return `SELECT e.name as empName, e.id as empId, lop.lopMonth, lop.lopDays, earn.arrearMonth, earn.arearDays, tds.tdsMonth, tds.tdsAmount, pp.payPackageAutoId, pp.salaryStructureAutoId, pp.payPackageMonthlyCTC, pp.payPackageEffectiveDate, pe.payElementAmount, sc.salaryComponentSequenceNo,sc.salaryComponentAutoId, sc.salaryComponentCode, sc.salaryComponentAlias, sc.salaryComponentEarningType, sc.includeInPackage FROM ${dbName}.employee e LEFT JOIN ${dbName}.lopdeductions lop ON e.id = lop.EmployeeId AND lop.lopMonth = "${data2.payMonth}" LEFT JOIN ${dbName}.earningarrears earn ON e.id = earn.EmployeeId AND earn.arrearMonth = "${data2.payMonth}"  LEFT JOIN ${dbName}.tdsdeductions tds ON e.id = tds.EmployeeId AND tds.tdsMonth = "${data2.payMonth}" LEFT JOIN ${dbName}.paypackage pp ON e.id = pp.EmployeeId LEFT JOIN ${dbName}.payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN ${dbName}.salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE e.id = ${data}  and pp.isActive=1`;
			break;
		case 12:
			//return `SELECT sc.salaryComponentAutoId, scm.elementValue, sce.salaryComponentElementAutoId, sce.salaryComponentElementName FROM salarycomponent sc JOIN salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId JOIN salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sc.salaryComponentAutoId = ${data}`;
			return `SELECT sscm.salaryComponentAutoId, sscm.salaryStructureAutoId, scm.salaryComponentElementAutoId, scm.elementValue, sce.salaryComponentElementName, sce.salaryComponentElementCode FROM ${dbName}.salarystructurecomponentmapping sscm JOIN ${dbName}.salarycomponentmapping scm ON sscm.salaryStructurecomponentmappingAutoId = scm.salaryStructurecomponentmappingAutoId JOIN ${dbName}.salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sscm.salaryComponentAutoId = ${data} AND sscm.salaryStructureAutoId = ${data2};`;

			break;

		case 13:
			return `SELECT COUNT(CASE WHEN scm.salaryComponentElementAutoId = 1 AND scm.elementValue = 1 THEN 1 END) AS lopAffectCount, COUNT(CASE WHEN scm.salaryComponentElementAutoId = 2 AND scm.elementValue = 1 THEN 1 END) AS arrearAffectCount, COUNT(CASE WHEN scm.salaryComponentElementAutoId = 3 AND scm.elementValue = 1 THEN 1 END) AS leaveEncashmentCount FROM ${dbName}.paypackage pp LEFT JOIN ${dbName}.payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN ${dbName}.salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId LEFT JOIN ${dbName}.salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId WHERE pp.EmployeeId = ${data}`;
			break;

		case 14:
			return `SELECT SUM(deductionAmount) AS totalDeduction, GROUP_CONCAT(deductionCategory,'(',deductionAmount,')'  ORDER BY deductionCategory SEPARATOR ' | ') AS deductionCategories FROM ${dbName}.extradeductions WHERE startMonth = '${data2}' AND EmployeeId = ${data};`;
			break;

		case 15:
			return `SELECT ppm.payMonth, ppm.payProcessMasterAutoId, ppfm.currentstatus, ps.name as statusName FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN ${dbName}.paystatusmaster ps ON ppfm.currentstatus = ps.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`;
			break;

		case 16:
			return `SELECT salaryComponentSequenceNo,actualWorkingDays,totalWorkingDays,payElementAmount,pfEmployeeAmount, esicEmployeeAmount, empId, tdsAmount, ptAmount, lwfAmount, extrapaymentAmount, COALESCE(NULLIF(TRIM(lopDays), ''), 0) AS lopDays, COALESCE(NULLIF(TRIM(arrearDays), ''), 0) AS arrearDays, payPackageMonthlyCTC, payElementAmount, salaryComponentAutoId, salaryComponentEarningType, elementMonthlyAmount, totalExtraDeduction, payMonth, SUM(payElementAmount) OVER (PARTITION BY empId) AS paySlipTotalPay, COALESCE(NULLIF(TRIM(salaryComponentAlias), ''), salaryComponentCode) AS paySlipComponentName, SUM(CASE WHEN salaryComponentEarningType in ('Earning','Balancing') THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS paySlipGrossEarning, SUM(CASE WHEN salaryComponentEarningType = 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS totalComponentDeductions FROM ${dbName}.paymonthlyelement WHERE payMonth = '${data}' AND (includeInPackage = 1 OR salaryComponentEarningType = 'Deduction') AND empId IN (${data2});`;
			break;

		case 17:
			return `SELECT pm.payMonth, pd.EmployeeId as empId FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId WHERE pm.payProcessMasterAutoId = ${data} AND pd.payStatus in(2,3,4,5,6,7,8,9)`;
			break;
		// case 18: return`SELECT (SELECT COUNT(*) FROM ${dbName}.payprocessdetails WHERE payMonth = '${data2.paymonth}') AS totalEmployees, (SELECT COUNT(*) FROM ${dbName}.payslip WHERE paySlipMonth = ${data2.month} AND paySlipYear = ${data2.year}) AS total_payslips, (SELECT COUNT(*) FROM ${dbName}.payslip WHERE paySlipMonth = ${data2.month} AND paySlipYear = ${data2.year} AND paySlipStatus = 1) AS paySlipReleased, COUNT(ps.paySlipAutoId) AS paySlipGenerated, ROUND((COUNT(ps.paySlipAutoId) * 100.0) / (SELECT COUNT(*) FROM ${dbName}.payprocessdetails WHERE payMonth = '${data2.paymonth}'), 2) AS paySlipPercentage FROM ${dbName}.payprocessdetails pd LEFT JOIN ${dbName}.payslip ps ON pd.EmployeeId = ps.EmployeeId WHERE pd.payMonth = '${data2.paymonth}' AND ps.paySlipMonth = ${data2.month} AND ps.paySlipYear = ${data2.year};`;
		// break;
		case 18:
			//return `SELECT (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data}) AS paySlipGenerated, (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data} and payStatus=6) AS totalEmployees, (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} AND ps.paySlipStatus = 1) AS paySlipReleased, CASE WHEN (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}) = 0 THEN 0 ELSE (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data}) * 100.0 / (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}) END AS paySlipPercentage;`;
			//return `SELECT (SELECT COUNT(*) FROM payslip AS ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus=7) AS paySlipGenerated, (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data} and payStatus!=101) AS totalEmployees, (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} AND ps.paySlipStatus = 1) AS paySlipReleased, CASE WHEN (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}) = 0 THEN 0 ELSE (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus!=101) * 100.0 / (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}   and payStatus!=101) END AS paySlipPercentage;`;
			return `SELECT (SELECT COUNT(*) FROM ${dbName}.payslip ps JOIN ${dbName}.payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus=7) AS paySlipGenerated, (SELECT COUNT(*) FROM ${dbName}.payprocessdetails ppd WHERE ppd.proceessId = ${data} and payStatus!=101) AS totalEmployees, (SELECT COUNT(*) FROM ${dbName}.payslip ps JOIN ${dbName}.payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} AND ps.paySlipStatus = 1) AS paySlipReleased, CASE WHEN (SELECT COUNT(*) FROM ${dbName}.payprocessdetails ppd WHERE ppd.proceessId = ${data}) = 0 THEN 0 ELSE (SELECT COUNT(*) FROM ${dbName}.payslip ps JOIN ${dbName}.payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus!=101) * 100.0 / (SELECT COUNT(*) FROM ${dbName}.payprocessdetails ppd WHERE ppd.proceessId = ${data}   and payStatus!=101) END AS paySlipPercentage;`;
			break;

		case 19:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=1 AND e.${
				data == 1 ? "buId" : "empCode"
			} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")}
      ) AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${
				data2.paymonth
			}' OR (ppd.payStatus in (101,4))));;`;
			break;
		case 20:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=1 AND e.${
				data == 1 ? "buId" : "empCode"
			} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")})AND (YEAR(ejd.dateOfJoining) < ${data2.paymonth.split("-")[0]} OR (YEAR(ejd.dateOfJoining) = ${data2.paymonth.split("-")[0]} AND MONTH(ejd.dateOfJoining) <= ${data2.paymonth.split("-")[1]}));`;
			break;
		//${data2.paymonth.split("-")[0]}
		// case 20:
		//   return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId = 1 AND e.isActive = 1 AND MONTH(ejd.dateOfJoining) <= 4 AND YEAR(ejd.dateOfJoining) <= 2022;`
		//   break;
		case 21:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(1,2,3,5,6,7) and payMonth='${data2}' and EmployeeId  in (${data});`;
			break;
		case 22:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(8,9)   and payMonth='${data2}' and EmployeeId  in (${data});`;
			break;
		case 23:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails where proceessId=${data} and payStatus in(6);`;
			break;
		case 24:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId = ${data2.companyId} AND e.isActive = 1 ${data2.buCondition} AND (YEAR(ejd.dateOfJoining) < ${data2.paymonth.split("-")[0]} OR (YEAR(ejd.dateOfJoining) = ${data2.paymonth.split("-")[0]} AND MONTH(ejd.dateOfJoining) <= ${data2.paymonth.split("-")[1]}));`;
			break;
		case 25:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.companyId=${data2.companyId} AND e.isActive=1 ${data2.buCondition} AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${data2.paymonth}' OR (ppd.payStatus in (101,4))));`;
			break;
		case 26:
			return `SELECT userId, dateOfJoining FROM ${dbName}.employeejobdetails WHERE YEAR(dateOfJoining)=${data2.payYear} AND MONTH(dateOfJoining)=${data2.payMonth} AND userId=${data};`;
			break;
		default:
	}
}
function getPaySlipObject(processedEmployee, createdBy) {
	let paySlipDuration =
		"01" +
		"/" +
		processedEmployee.salaryMonth.split("-")[1] +
		"/" +
		processedEmployee.salaryMonth.split("-")[0] +
		"-" +
		processedEmployee.totalWorkingDays +
		"/" +
		processedEmployee.salaryMonth.split("-")[1] +
		"/" +
		processedEmployee.salaryMonth.split("-")[0];
	let paySlipObject = {
		EmployeeId: processedEmployee.EmployeeId,
		paySlipMonth: parseInt(processedEmployee.salaryMonth.split("-")[1]),
		paySlipYear: processedEmployee.salaryMonth.split("-")[0],
		paySlipFinancialYear: "2024-25",
		paySlipDuration: paySlipDuration,
		paySlipTotalDays: processedEmployee.totalWorkingDays,
		paySlipAbsentDays: processedEmployee.lopDays,
		paySlipArrearDays: 0,
		paySlipGrossEarning: processedEmployee.ctc,
		paySlipTotalPay: processedEmployee.netPay,
		paySlipNetPay: processedEmployee.netPay,
		paySlipTotalDeduction:
			parseFloat(processedEmployee.lopDeductions) +
			parseFloat(processedEmployee.deductionAmount) +
			parseFloat(processedEmployee.tdsDeductions),
		createdBy: createdBy,
		createdAt: new Date(),
		paySlipWorkingDays:
			parseInt(processedEmployee.totalWorkingDays) -
			parseInt(processedEmployee.lopDays),
		paySlipTDS: processedEmployee.tdsDeductions,
	};
	return paySlipObject;
}
function getElementValue(name, data) {
	const item = data.find((item) => item.salaryComponentElementName === name);
	// console.log(name);
	// console.log(item?item.elementValue:0);
	return item ? item.elementValue : 0; // Return elementValue or null if not found
}
function getPayComponentObject(
	employeePackageDetails,
	processedEmployee,
	newPaySlip,
	req,
	deductionType,
) {
	let paySlipComponentObj;
	if (deductionType == "SalaryComponent") {
		paySlipComponentObj = {
			EmployeeId: employeePackageDetails.EmployeeId,
			paySlipAutoId: newPaySlip.dataValues.paySlipAutoId,
			salaryComponentAutoId: employeePackageDetails.salaryComponentAutoId,
			paySlipComponentName: employeePackageDetails.salaryComponentAlias
				? employeePackageDetails.salaryComponentAlias
				: employeePackageDetails.salaryComponentCode,
			paySlipComponentType: employeePackageDetails.salaryComponentEarningType,
			createdBy: req.userData.id,
			createdAt: new Date(),
			isActive: 0,
			paySlipComponentAmount:
				employeePackageDetails.salaryComponentEarningType == "Earning"
					? parseFloat(employeePackageDetails.payElementAmount) -
						parseFloat(
							getPercentagePart(
								employeePackageDetails.payElementAmount,
								getPercentage(
									processedEmployee.lopDeductions,
									processedEmployee.ctc,
								),
							),
						)
					: parseFloat(employeePackageDetails.payElementAmount),
		};
	} else {
		paySlipComponentObj = {
			EmployeeId: processedEmployee.EmployeeId,
			paySlipAutoId: newPaySlip.dataValues.paySlipAutoId,
			salaryComponentAutoId: 0,
			paySlipComponentName: deductionType,
			paySlipComponentType: "Deduction",
			createdBy: req.userData.id,
			createdAt: new Date(),
			isActive: 0,
			paySlipComponentAmount: employeePackageDetails,
		};
	}

	return paySlipComponentObj;
}

async function getCalculatedPF(monthlyElementPay) {
	let calculatedPF = 0,
		applicablePFAmountRestrictionYes = 0,
		applicablePFAmountRestrictionNo = 0,
		actualApplicableAmount = 0;
	if (monthlyElementPay[0].isPfApplicable == 0) return calculatedPF;

	applicablePFAmountRestrictionYes = await monthlyElementPay
		.filter((element) => element.isPfApplicableComponent == 1)
		.reduce(async (sumPromise, element) => {
			const sum = await sumPromise; // Resolve the previous sum
			return sum + parseFloat(element["elementMonthlyAmount"]);
		}, Promise.resolve(0));

	applicablePFAmountRestrictionNo =
		monthlyElementPay.find(
			(item) => item["pfApplicable15000AndNoRestriction"] === 1,
		)?.["elementMonthlyAmount"] || null; // Start with a resolved promise of 0

	if (monthlyElementPay[0].isPfRestriction == 1) {
		calculatedPF =
			applicablePFAmountRestrictionYes < 15000
				? getPercentagePart(applicablePFAmountRestrictionYes, 12)
				: 1800;
		actualApplicableAmount = applicablePFAmountRestrictionYes;
	} else if (
		monthlyElementPay[0].isPfRestriction == 0 &&
		applicablePFAmountRestrictionNo >= 15000
	) {
		calculatedPF = getPercentagePart(applicablePFAmountRestrictionNo, 12);
		actualApplicableAmount = applicablePFAmountRestrictionNo;
	} else if (
		monthlyElementPay[0].isPfRestriction == 0 &&
		applicablePFAmountRestrictionNo < 15000
	) {
		calculatedPF = getPercentagePart(applicablePFAmountRestrictionYes, 12);
		actualApplicableAmount = applicablePFAmountRestrictionYes;
	}
	// console.log("Applicable PF Amount Actual:: " + actualApplicableAmount);
	// console.log("Applicable PF Amount YES :: " + applicablePFAmountRestrictionYes);
	// console.log("Applicable PF Amount No:: " + applicablePFAmountRestrictionNo);
	return calculatedPF; // Return elementValue or null if not found
}

async function getCalculatedESIC(monthlyElementPay) {
	let calculatedEmployeeESIC = 0,
		calculatedEmployerESIC,
		esicApplicableAmount = 0;
	if (monthlyElementPay[0].isEsicApplicable == 0)
		return { calculatedEmployerESIC: 0, calculatedEmployeeESIC: 0 };
	esicApplicableAmount = await monthlyElementPay
		.filter((element) => element.isEsicApplicableComponent == 1)
		.reduce(async (sumPromise, element) => {
			console.log("ESIC AMOUNT ::", element["elementMonthlyAmount"]);
			const sum = await sumPromise; // Resolve the previous sum
			return sum + parseFloat(element["elementMonthlyAmount"]);
		}, Promise.resolve(0)); // Start with a resolved promise of 0

	calculatedEmployeeESIC = customHigherRound(
		getPercentagePart(esicApplicableAmount, 0.75),
	);
	calculatedEmployerESIC = customHigherRound(
		getPercentagePart(esicApplicableAmount, 3.25),
	);
	//console.log("Applicable ESIC Amount :: " + esicApplicableAmount);
	return { calculatedEmployeeESIC, calculatedEmployeeESIC }; // Return elementValue or null if not found
}

async function arrectLOP(componentAmount, lopDays, totalWorkingdays) {
	let amountAfterLop = 0;
	amountAfterLop = (componentAmount / totalWorkingdays) * lopDays;
	return componentAmount - amountAfterLop;
}

async function getExtraDeductionsElements(
	payMonth,
	EmployeeId,
	paySlipAutoId,
	userId,
) {
	let extraDeducionsElements = [];

	let extraDeductions = await db.extraDeduction.findAll({
		where: {
			EmployeeId: EmployeeId,
			startMonth: payMonth,
		},
		raw: true,
	});

	if (extraDeductions.length > 0) {
		for (const extraDeductoinObject of extraDeductions) {
			extraDeducionsElements.push({
				EmployeeId: EmployeeId,
				paySlipAutoId: paySlipAutoId,
				salaryComponentAutoId: 0,
				paySlipComponentName: extraDeductoinObject.deductionCategory,
				paySlipComponentAmount: extraDeductoinObject.deductionAmount,
				paySlipComponentType: "Deduction",
				createdBy: userId,
				createdAt: new Date(),
				salaryComponentSequenceNo: 999,
			});
		}
	}
	return extraDeducionsElements;
}

async function getExtraEarningElements(
	payMonth,
	EmployeeId,
	paySlipAutoId,
	userId,
) {
	let extraDeducionsElements = [];

	let extraEarning = await db.extraPayment.findAll({
		where: {
			EmployeeId: EmployeeId,
			paymentMonth: payMonth,
		},
		raw: true,
	});

	if (extraEarning.length > 0) {
		for (const extraEarningObject of extraEarning) {
			extraDeducionsElements.push({
				EmployeeId: EmployeeId,
				paySlipAutoId: paySlipAutoId,
				salaryComponentAutoId: 0,
				paySlipComponentName: extraEarningObject.category,
				paySlipComponentAmount: extraEarningObject.paymentAmount,
				paySlipComponentType: "Earning",
				createdBy: userId,
				createdAt: new Date(),
				salaryComponentSequenceNo: 999,
			});
		}
	}
	return extraDeducionsElements;
}

function customRound(num) {
	const decimalPart = num - Math.floor(num);
	if (decimalPart <= 0.5) {
		return Math.floor(num); // Round down
	} else {
		return Math.ceil(num); // Round up
	}
}

function customHigherRound(num) {
	const decimalPart = num - Math.floor(num);
	if (decimalPart <= 0.0) {
		return Math.floor(num); // Round down
	} else {
		return Math.ceil(num); // Round up
	}
}
function daysLeftInMonth(dateString) {
	const date = new Date(dateString);

	// Get the current month and year from the date
	const year = date.getFullYear();
	const month = date.getMonth(); // Note: Month is 0-indexed (0 = January)

	// Get the total days in the current month
	const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

	// Get the day of the month from the given date
	const currentDay = date.getDate();

	// Calculate the remaining days including the given date
	const daysLeft = totalDaysInMonth - currentDay + 1;

	return daysLeft;
}

async function getActualMonthlyAmount(
	componentAmount,
	totalWorkingDays,
	actualWorkingDays,
) {
	const monthlyAmount =
		(componentAmount / totalWorkingDays) * actualWorkingDays;

	return monthlyAmount;
}

// create function by jay fot get financial year
async function getFinancialYear(selectedYear) {
	const date = moment();
	const startMonth = 3; // 0 based index of month 3 for april
	const year = date.year(); // get year
	// if the month before april, consider it is previous financial year
	const financialYearStart = date.month() < startMonth ? year - 1 : year;
	const financialYearEnd = (financialYearStart + 1).toString().slice(-2);
	const financialYear = selectedYear ? selectedYear : financialYearStart;

	// get financial year id from table
	let financialYearDetails = await db.financialYearMaster.findOne({
		where: { year: financialYear, isActive: 1 },
		attributes: ["financialYearId", "financialYearName"],
		raw: true,
	});
	//  return `${financialYearStart}-${financialYearEnd}`;
	return financialYearDetails;
}

export default {
	payAfterLOPDeductions,
	payAfterTDSDeductions,
	payAfterStandardDeductions,
	standardDeductions,
	getDaysInCurrentMonth,
	getPercentage,
	getPercentagePart,
	query,
	getPaySlipObject,
	getPayComponentObject,
	getElementValue,
	getFromattedDate,
	getCalculatedPF,
	getCalculatedESIC,
	arrectLOP,
	salaryPaySlip,
	getExtraDeductionsElements,
	getExtraEarningElements,
	customRound,
	actualWorkingDays,
	getActualMonthlyAmount,
	getFinancialYear,
	customHigherRound,
};
