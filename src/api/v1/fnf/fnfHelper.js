const dbName = process.env.DB_NAME;
import db from "../../../config/db.config.js";
import moment from "moment";

async function query(caseId, data, data2) {
	switch (caseId) {
		case 1:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NOT NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
				data == 1 ? "buId" : "empCode"
			} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")}) AND (YEAR(e.dateOfexit) = ${data2.paymonth.split("-")[0]} AND MONTH(e.dateOfexit) = ${data2.paymonth.split("-")[1]});`;
			break;
		case 2:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NOT NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId = ${data2.companyId} AND e.isActive = 0 AND (YEAR(e.dateOfexit) = ${data2.paymonth.split("-")[0]} AND MONTH(e.dateOfexit) = ${data2.paymonth.split("-")[1]})  AND e.dateOfexit is not null;`;
			break;
		case 3:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(1,2,3,5,6,7) and EmployeeId  in (${data}) and processType='FnF';`; //payMonth='${data2}' and
			break;
		case 4:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(8,9)   and  EmployeeId  in (${data}) and processType='FnF';`; //payMonth='${data2}' and
			break;
		case 5:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName, e.dateOfexit, ejd.dateOfJoining  FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN tara.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NOT NULL AND MONTH(e.dateOfexit) = '${data2.paymonth.split("-")[1]}' AND YEAR(e.dateOfexit) = '${data2.paymonth.split("-")[0]}') AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
				data == 1 ? "buId" : "empCode"
			} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")}
          ) AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${
						data2.paymonth
					}' OR (ppd.payStatus in (101,4))));;`;
			break;
		case 6:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName, e.dateOfexit, ejd.dateOfJoining FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN tara.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NOT NULL AND MONTH(e.dateOfexit) = '${data2.paymonth.split("-")[1]}' AND YEAR(e.dateOfexit) = '${data2.paymonth.split("-")[0]}') AND  p.payPackageAutoId IS NOT NULL AND e.companyId=${data2.companyId} AND e.isActive=0 AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${data2.paymonth}' OR (ppd.payStatus in (101,4))));`;
			break;
		// case 7:
		// 	return `SELECT e.name as empName, e.id as empId, lop.lopMonth, lop.lopDays, earn.arrearMonth, earn.arearDays, tds.tdsMonth, tds.tdsAmount, pp.payPackageAutoId, pp.salaryStructureAutoId, pp.payPackageMonthlyCTC, pp.payPackageEffectiveDate, pe.payElementAmount, sc.salaryComponentSequenceNo,sc.salaryComponentAutoId, sc.salaryComponentCode, sc.salaryComponentAlias, sc.salaryComponentEarningType, sc.includeInPackage FROM employee e LEFT JOIN lopdeductions lop ON e.id = lop.EmployeeId AND lop.lopMonth = "${data2.payMonth}" LEFT JOIN earningarrears earn ON e.id = earn.EmployeeId AND earn.arrearMonth = "${data2.payMonth}"  LEFT JOIN tdsdeductions tds ON e.id = tds.EmployeeId AND tds.tdsMonth = "${data2.payMonth}" LEFT JOIN paypackage pp ON e.id = pp.EmployeeId LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE e.id = ${data}  and pp.isActive=1;`; //11
		// 	break;
		case 7:
			return `SELECT e.name as empName, e.id as empId, lop.lopMonth, lop.lopDays, earn.arrearMonth, earn.arearDays, tds.tdsMonth, tds.tdsAmount, pp.payPackageAutoId, pp.salaryStructureAutoId, pp.payPackageMonthlyCTC, pp.payPackageEffectiveDate, pe.payElementAmount, sc.salaryComponentSequenceNo,sc.salaryComponentAutoId, sc.salaryComponentCode, sc.salaryComponentAlias, sc.salaryComponentEarningType, sc.includeInPackage, le.leaveEncashmentDays, gor.gratuityYears FROM employee e LEFT JOIN lopdeductions lop ON e.id = lop.EmployeeId AND lop.lopMonth = "${data2.payMonth}" LEFT JOIN earningarrears earn ON e.id = earn.EmployeeId AND earn.arrearMonth = "${data2.payMonth}"  LEFT JOIN tdsdeductions tds ON e.id = tds.EmployeeId AND tds.tdsMonth = "${data2.payMonth}" LEFT JOIN leavencashmentoverrides le ON e.id = le.EmployeeId LEFT JOIN gratuityoverrides gor ON e.id = gor.EmployeeId LEFT JOIN paypackage pp ON e.id = pp.EmployeeId LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE e.id = ${data}  and pp.isActive=1;`; //11
			break;
		case 8:
			//return `SELECT userId, dateOfJoining FROM employeejobdetails WHERE YEAR(dateOfJoining)=${data2.payYear} AND MONTH(dateOfJoining)=${data2.payMonth} AND userId=${data};`; //26
			  //return `SELECT id, dateOfexit FROM tara_hrms_live.employee WHERE YEAR(dateOfexit)=${data2.payYear} AND MONTH(dateOfexit)=${data2.payMonth} AND id=${data}`
			  return `SELECT e.dateOfexit, e.id, ejd.dateOfJoining FROM tara_hrms_live.employee e JOIN tara_hrms_live.employeejobdetails ejd ON e.id = ejd.userId WHERE e.id = ${data};`		
			  break;
		case 9:
			return `SELECT sscm.salaryComponentAutoId, sscm.salaryStructureAutoId, scm.salaryComponentElementAutoId, scm.elementValue, sce.salaryComponentElementName, sce.salaryComponentElementCode FROM ${dbName}.salarystructurecomponentmapping sscm JOIN ${dbName}.salarycomponentmapping scm ON sscm.salaryStructurecomponentmappingAutoId = scm.salaryStructurecomponentmappingAutoId JOIN ${dbName}.salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sscm.salaryComponentAutoId = ${data} AND sscm.salaryStructureAutoId = ${data2};`; // 12
			break;
		case 10:
			return `SELECT pm.payMonth, pd.EmployeeId as empId FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId WHERE pm.payProcessMasterAutoId = ${data} AND pd.payStatus in(2,3,4,5,6,7,8,9)`; //17
			break;
		case 11:
			//return `SELECT  p.salaryComponentEarningType,p.esicEmployerAmount as "ESIC Employer",p.esicEmployeeAmount as "ESIC Employee",p.pfEmployeeAmount as "PF Employee",p.pfEmployerAmount as "PF Employer",p.salaryComponentCode,p.includeInPackage,p.isPfApplicableComponent,p.isPfApplicable,p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) - SUM(CASE WHEN p.salaryComponentEarningType = 'Deduction' THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`;
			//return `SELECT p.noticeRecoveryAmount,p.ExtraBenefitAmount,p.leaveEncashmentDays,p.leaveEncashmentAmount,p.gratuityAmount,p.totalExtraDeduction as "EXTRA DEDUCTION",p.extraPaymentCategories as "EXTRA PAYMENT CATEGORIES",p.salaryComponentEarningType, p.esicEmployerAmount AS "ESIC Employer", p.esicEmployeeAmount AS "ESIC Employee", p.pfEmployeeAmount AS "PF Employee", p.pfEmployerAmount AS "PF Employer", p.salaryComponentCode, p.includeInPackage, p.isPfApplicableComponent, p.isPfApplicable, p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning", ed.deductionCategory AS "Deduction Category", ed.deductionAmount AS "Deduction Amount" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id LEFT JOIN ${dbName}.extradeductions ed ON p.empId = ed.EmployeeId AND p.payMonth = ed.startMonth WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`; //1
			return `SELECT p.noticeRecoveryAmount,p.ExtraBenefitAmount,p.leaveEncashmentDays,p.leaveEncashmentAmount,p.gratuityAmount,p.actualWorkingDays "Present Days",p.totalWorkingDays AS "Total Days", e.dateOfexit AS "Exit Date", ej.dateOfJoining AS "Date of Joining", p.totalExtraDeduction AS "EXTRA DEDUCTION", p.extraPaymentCategories AS "EXTRA PAYMENT CATEGORIES", p.salaryComponentEarningType, p.esicEmployerAmount AS "ESIC Employer", p.esicEmployeeAmount AS "ESIC Employee", p.pfEmployeeAmount AS "PF Employee", p.pfEmployerAmount AS "PF Employer", p.salaryComponentCode, p.includeInPackage, p.isPfApplicableComponent, p.isPfApplicable, p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning", ed.deductionCategory AS "Deduction Category", ed.deductionAmount AS "Deduction Amount", bu.buName AS "Business Unit", epd.paymentAccountNumber AS "Account No", epd.paymentBankName AS "Bank Name", epd.paymentBankIfsc AS "IFSC" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id LEFT JOIN ${dbName}.employeejobdetails ej ON e.id = ej.userId LEFT JOIN ${dbName}.extradeductions ed ON p.empId = ed.EmployeeId AND p.payMonth = ed.startMonth LEFT JOIN ${dbName}.bumaster bu ON e.buId = bu.buId LEFT JOIN ${dbName}.employeepaymentdetails epd ON e.id = epd.userId WHERE p.payMonth = '${data}' AND p.empId IN (${data2})  order by salaryComponentSequenceNo desc;`;
			break;
		case 12:
			return `SELECT pf.refferenceFlowId, ps.currentRemark FROM ${dbName}.payprocessflowmaster pf INNER JOIN ${dbName}.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.nextstatus = ${data2} AND pf.currentstatus = ${data}`; //6
			break;
		case 13:
			return `SELECT ppm.payMonth, ppm.payProcessMasterAutoId, ppfm.currentstatus, ps.name as statusName FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN ${dbName}.paystatusmaster ps ON ppfm.currentstatus = ps.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`; //13
			break;
		case 14:
			return `SELECT EmployeeId FROM tara.payprocessdetails where proceessId=${data} and payStatus in(6);`;
			break;
		case 15:
			return `SELECT noticePeriodRecoveryDays,leaveEncashmentDays,noticeRecoveryAmount,ExtraBenefitAmount,leaveEncashmentAmount,gratuityAmount, salaryComponentSequenceNo,actualWorkingDays,totalWorkingDays,payElementAmount,pfEmployeeAmount, esicEmployeeAmount, empId, tdsAmount, ptAmount, lwfAmount, extrapaymentAmount, COALESCE(NULLIF(TRIM(lopDays), ''), 0) AS lopDays, COALESCE(NULLIF(TRIM(arrearDays), ''), 0) AS arrearDays, payPackageMonthlyCTC, payElementAmount, salaryComponentAutoId, salaryComponentEarningType, elementMonthlyAmount, totalExtraDeduction, payMonth, SUM(payElementAmount) OVER (PARTITION BY empId) AS paySlipTotalPay, COALESCE(NULLIF(TRIM(salaryComponentAlias), ''), salaryComponentCode) AS paySlipComponentName, SUM(CASE WHEN salaryComponentEarningType in ('Earning','Balancing') THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS paySlipGrossEarning, SUM(CASE WHEN salaryComponentEarningType = 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS totalComponentDeductions FROM ${dbName}.paymonthlyelement WHERE payMonth = '${data}' AND (includeInPackage = 1 OR salaryComponentEarningType = 'Deduction') AND empId IN (${data2});`; //16
			break;
		case 16:
			return `SELECT ppm.payProcessMasterAutoId AS processId,ppm.payMonth as payMonth, psm.payProcessStatusAutoId AS currentStatusId, psm.name AS statusName FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN ${dbName}.paystatusmaster psm ON ppfm.currentstatus = psm.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`; //9
			break;
		case 17:
			return `SELECT ppm.payProcessMasterAutoId, COUNT(CASE WHEN ppd.payStatus = 2 THEN 1 END) AS successfullyProcessed, COUNT(CASE WHEN ppd.payStatus in(101) THEN 1 END) AS processedWithError, COUNT(CASE WHEN ppd.payStatus = 1 THEN 1 END) AS pendingForProcess, COUNT(CASE WHEN ppd.payStatus != 1 THEN 1 END) * 100.0 / COUNT(*) AS totalProcessedPercentage, COUNT(CASE WHEN ppd.payStatus not in(1) THEN 1 END) AS totalProcessed FROM  ${dbName}.payprocessmaster ppm JOIN  ${dbName}.payprocessdetails ppd ON ppm.payProcessMasterAutoId = ppd.proceessId WHERE ppm.payProcessMasterAutoId = ${data} GROUP BY ppm.payProcessMasterAutoId;`; //8
			break;
		case 18:
			return `SELECT pm.payProcessMasterAutoId, pd.ctc, pd.lopDays, pd.totalWorkingDays, pd.tdsdeductions, pd.netPay, pd.deductionAmount, pd.arrearAmount, pd.loanAmont, pd.salaryMonth, pd.deductionName, pd.lopdeductions, pp.payPackageEffectiveDate, pe.salaryComponentAutoId, pe.payElementAmount, sc.includeInPackage, sc.includeInPackage, sc.salaryComponentEarningType FROM  ${dbName}.payprocessmaster pm JOIN  ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId JOIN  ${dbName}.paypackage pp ON pd.EmployeeId = pp.EmployeeId JOIN  ${dbName}.payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId JOIN  ${dbName}.salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE pm.payProcessMasterAutoId = 1 AND pd.payStatus = 2 AND pd.EmployeeId = 484`; //10
			break;
		case 19:
			return `SELECT (SELECT COUNT(*) FROM  ${dbName}.payslip ps JOIN  ${dbName}.payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus=7) AS paySlipGenerated, (SELECT COUNT(*) FROM  ${dbName}.payprocessdetails ppd WHERE ppd.proceessId = ${data} and payStatus!=101) AS totalEmployees, (SELECT COUNT(*) FROM  ${dbName}.payslip ps JOIN  ${dbName}.payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} AND ps.paySlipStatus = 1) AS paySlipReleased, CASE WHEN (SELECT COUNT(*) FROM  ${dbName}.payprocessdetails ppd WHERE ppd.proceessId = ${data}) = 0 THEN 0 ELSE (SELECT COUNT(*) FROM  ${dbName}.payslip ps JOIN  ${dbName}.payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus!=101) * 100.0 / (SELECT COUNT(*) FROM  ${dbName}.payprocessdetails ppd WHERE ppd.proceessId = ${data}   and payStatus!=101) END AS paySlipPercentage;`; //18
			break;
		case 20:
			return `SELECT ppm.payMonth, ppm.payProcessMasterAutoId, ppfm.currentstatus, ps.name as statusName FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN ${dbName}.paystatusmaster ps ON ppfm.currentstatus = ps.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`; //15
			break;
		case 21:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails where proceessId=${data} and payStatus in(6);`; //23
			break;
		case 22:
			return `SELECT SUM(deductionAmount) AS totalDeduction, GROUP_CONCAT(deductionCategory,'(',deductionAmount,')'  ORDER BY deductionCategory SEPARATOR ' | ') AS deductionCategories FROM ${dbName}.extradeductions WHERE startMonth = '${data2}' AND EmployeeId = ${data};`; //14
			break;
			case 23:
			//return `SELECT SUM(ptAmount) AS ptAggregateAmount, GROUP_CONCAT(empCode) AS ptImpactedEmployees FROM ${dbName}.ptoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND ptMonth = '${data.deductionMonth}' CROSS JOIN (SELECT SUM(lwfAmount) AS lwfAggregateAmount, GROUP_CONCAT(empCode) AS lwfImpactedEmployees FROM ${dbName}.lwfoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND lwfMonth = '${data.deductionMonth}') AS lwf CROSS JOIN (SELECT SUM(recoveryDays) AS noticeAggregateDays, GROUP_CONCAT(empCode) AS noticeImpactedEmployees FROM ${dbName}.noticerecoveryovrrides WHERE EmployeeId IN (${data.impactedEmployees}) AND payMonth = '${data.deductionMonth}') AS nr;`; //14
			//return `SELECT pt.ptAggregateAmount, pt.ptImpactedEmployees, lwf.lwfAggregateAmount, lwf.lwfImpactedEmployees, nr.noticeAggregateDays, nr.noticeImpactedEmployees FROM (SELECT SUM(ptAmount) AS ptAggregateAmount, GROUP_CONCAT(empCode) AS ptImpactedEmployees FROM ${dbName}.ptoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND ptMonth = '${data.deductionMonth}') AS pt CROSS JOIN (SELECT SUM(lwfAmount) AS lwfAggregateAmount, GROUP_CONCAT(empCode) AS lwfImpactedEmployees FROM ${dbName}.lwfoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND lwfMonth = '${data.deductionMonth}') AS lwf CROSS JOIN (SELECT SUM(recoveryDays) AS noticeAggregateDays, GROUP_CONCAT(empCode) AS noticeImpactedEmployees FROM ${dbName}.noticerecoveryovrrides WHERE EmployeeId IN (${data.impactedEmployees}) AND payMonth = '${data.deductionMonth}') AS nr;`
			 return `SELECT    ue.uniqueEmployeeCounts,pt.ptAggregateAmount, pt.ptImpactedEmployees, lwf.lwfAggregateAmount, lwf.lwfImpactedEmployees, nr.noticeAggregateDays, nr.noticeImpactedEmployees, ed.extraDeductionAggregateAmount, ed.extraDeductionImpactedEmployees, tds.tdsAggregateAmount, tds.tdsImpactedEmployees FROM (SELECT SUM(ptAmount) AS ptAggregateAmount, GROUP_CONCAT( DISTINCT empCode) AS ptImpactedEmployees FROM ${dbName}.ptoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND ptMonth = '${data.deductionMonth}') AS pt CROSS JOIN (SELECT SUM(lwfAmount) AS lwfAggregateAmount, GROUP_CONCAT( DISTINCT empCode) AS lwfImpactedEmployees FROM ${dbName}.lwfoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND lwfMonth = '${data.deductionMonth}') AS lwf CROSS JOIN (SELECT SUM(recoveryDays) AS noticeAggregateDays, GROUP_CONCAT( DISTINCT empCode) AS noticeImpactedEmployees FROM ${dbName}.noticerecoveryovrrides WHERE EmployeeId IN (${data.impactedEmployees}))  AS nr CROSS JOIN (SELECT SUM(deductionAmount) AS extraDeductionAggregateAmount, GROUP_CONCAT( DISTINCT empCode) AS extraDeductionImpactedEmployees FROM ${dbName}.extradeductions WHERE EmployeeId IN (${data.impactedEmployees}) AND startMonth = '${data.deductionMonth}') AS ed CROSS JOIN (SELECT SUM(tdsAmount) AS tdsAggregateAmount, GROUP_CONCAT( DISTINCT empCode) AS tdsImpactedEmployees FROM ${dbName}.tdsdeductions WHERE EmployeeId IN (${data.impactedEmployees}) AND tdsMonth = '${data.deductionMonth}') AS tds CROSS JOIN (SELECT COUNT(DISTINCT EmployeeId) AS uniqueEmployeeCounts FROM (SELECT EmployeeId FROM ${dbName}.ptoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND ptMonth = '${data.deductionMonth}' UNION SELECT EmployeeId FROM ${dbName}.lwfoverrides WHERE EmployeeId IN (${data.impactedEmployees}) AND lwfMonth = '${data.deductionMonth}' UNION SELECT EmployeeId FROM ${dbName}.noticerecoveryovrrides WHERE EmployeeId IN (${data.impactedEmployees})  UNION SELECT EmployeeId FROM ${dbName}.extradeductions WHERE EmployeeId IN (${data.impactedEmployees}) AND startMonth = '${data.deductionMonth}' UNION SELECT EmployeeId FROM ${dbName}.tdsdeductions WHERE EmployeeId IN (${data.impactedEmployees}) AND tdsMonth = '${data.deductionMonth}') AS combined_ids) AS ue;`
			break;	
			case 24: 
			return `SELECT e.empCode, e.id, s.l2RecoveryDays, l.availableLeave FROM ${dbName}.employee e JOIN ${dbName}.separationmaster s ON e.id = s.employeeId JOIN ${dbName}.leavemapping l ON e.id = l.EmployeeId JOIN ${dbName}.leavemaster lm ON l.leaveAutoId = lm.leaveId WHERE lm.leaveCode = 'EL' AND e.id IN (${data.employeeIds});`
	}
}

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
		const queryForCurrentJoiningDate = await query(8, employeeId, {
			payMonth: payMonth,
			payYear: payYear,
		});
		console.log("Query ::::  " + queryForCurrentJoiningDate);
		const currentMonthJoiningDetails = await db.sequelize.query(
			queryForCurrentJoiningDate,
		);
		console.log(currentMonthJoiningDetails);
		let exitDate = currentMonthJoiningDetails[0][0].dateOfexit;
		let dateOfJoining = currentMonthJoiningDetails[0][0].dateOfJoining;
		let leftDayaInMonth = workingDaysInMonth(exitDate,dateOfJoining);
		return leftDayaInMonth;

	} catch (e) {
		console.log(e);
		return null;
	}
};
function getElementValue(name, data) {
	const item = data.find((item) => item.salaryComponentElementName === name);
	return item ? item.elementValue : 0; // Return elementValue or null if not found
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
function customRound(num) {
	const decimalPart = num - Math.floor(num);
	if (decimalPart <= 0.5) {
		return Math.floor(num); // Round down
	} else {
		return Math.ceil(num); // Round up
	}
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
function getPercentagePart(total, percentage) {
	return (total * (percentage / 100)).toFixed(2);
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

	calculatedEmployeeESIC = getPercentagePart(esicApplicableAmount, 0.75);
	calculatedEmployerESIC = getPercentagePart(esicApplicableAmount, 3.25);
	console.log("Applicable ESIC Amount :: " + esicApplicableAmount);
	return { calculatedEmployerESIC, calculatedEmployeeESIC }; // Return elementValue or null if not found
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

async function getFinancialYear(date = moment()) {
	const startMonth = 3; // 0 based index of month 3 for april
	const year = date.year(); // get year
	// if the month before april, consider it is previous financial year
	const financialYearStart = date.month() < startMonth ? year - 1 : year;
	const financialYearEnd = (financialYearStart + 1).toString().slice(-2);

	// get financial year id from table
	let financialYearDetails = await db.financialYearMaster.findOne({
		where: { year: financialYearStart, isActive: 1 },
		attributes: ["financialYearId", "financialYearName"],
		raw: true,
	});
	//  return `${financialYearStart}-${financialYearEnd}`;
	return financialYearDetails;
}

async function arrectLOP(componentAmount, lopDays, totalWorkingdays) {
	let amountAfterLop = 0;
	amountAfterLop = (componentAmount / totalWorkingdays) * lopDays;
	return componentAmount - amountAfterLop;
}

// async function calculateGratuity(
// 	basicAmount,
// 	dateOfJoining,
// 	dateOfExit,
// 	gratuityMinYears,
// 	gratuityYears,
// ) {

// 	console.log(dateOfJoining ," dateOfJoining")
// 	console.log(dateOfExit ," dateOfExit")
// 	console.log(gratuityMinYears ," gratuityMinYears")
// 	console.log(gratuityYears ," gratuityYears")

// 	let gratuityAmountToCalculate = 0;
// 	for (const element of basicAmount) {
// 		if (element.isGratuityApplicable == 1) {
// 			gratuityAmountToCalculate =
// 				parseFloat(gratuityAmountToCalculate) +
// 				parseFloat(element.payElementAmount);
// 		}
// 	}
// 	if (gratuityYears) {
// 		//console.log("GRATUITY CALCULATION BY OVERRIDE YEARS")
// 		gratuityYears = customRound(gratuityYears);
// 		return {
// 			gratuityYears,
// 			gratuityAmount:
// 				gratuityYears >= gratuityMinYears
// 					? ((gratuityAmountToCalculate * 15) / 26) * gratuityYears
// 					: 0,
// 		};
// 	} else {
// 		//console.log("GRATUITY CALCULATION BY SYSTEM YEARS")
// 		const startDate = moment(dateOfJoining);
// 		const endDate = moment(dateOfExit);
// 		let years = endDate.diff(startDate, "years");
// 		startDate.add(years, "years"); // Adjust startDate forward by counted years
// 		const months = endDate.diff(startDate, "months");
// 		startDate.add(months, "months"); // Adjust startDate forward by counted months
// 		const days = endDate.diff(startDate, "days");
// 		years = months > 6 || (months == 6 && days > 0) ? years + 1 : years;
// 		console.log(`${years} years, ${months} months, and ${days} days`);
// 		return {
// 			years,
// 			gratuityAmount:
// 				years >= gratuityMinYears
// 					? ((gratuityAmountToCalculate * 15) / 26) * years
// 					: 0,
// 		};
// 	}
// }

async function calculateGratuity(payMonthlyElements, gratuityYears) {
	let employeejobdetails = await db.employeeMaster.findOne({
		where: { id: payMonthlyElements[0].empId },
		raw: true,
		include: [
			{
				model: db.jobDetails,
				attributes: ["dateOfJoining"],
				as: "employeeJobDetails",
			},
		],
		attributes: ["dateOfExit"],
		nest: true,
	});
	let dateOfJoining = employeejobdetails.employeeJobDetails.dateOfJoining;
	let dateOfExit = employeejobdetails.dateOfExit;
	let gratuityMinYears = 5;
	let gratuityAmountToCalculate = 0;
	for (const element of payMonthlyElements) {
		if (element.isGratuityApplicable == 1) {
			gratuityAmountToCalculate =
				parseFloat(gratuityAmountToCalculate) +
				parseFloat(element.payElementAmount);
		}
	}
	if (gratuityYears) {
		//console.log("GRATUITY CALCULATION BY OVERRIDE YEARS")
		gratuityYears = customRound(gratuityYears);
		return {
			gratuityYears,
			gratuityAmount:
				gratuityYears >= gratuityMinYears
					? ((gratuityAmountToCalculate * 15) / 26) * gratuityYears
					: 0,
		};
	} else {
		//console.log("GRATUITY CALCULATION BY SYSTEM YEARS")
		const startDate = moment(dateOfJoining);
		const endDate = moment(dateOfExit);
		let years = endDate.diff(startDate, "years");
		startDate.add(years, "years"); // Adjust startDate forward by counted years
		const months = endDate.diff(startDate, "months");
		startDate.add(months, "months"); // Adjust startDate forward by counted months
		const days = endDate.diff(startDate, "days");
		years = months > 6 || (months == 6 && days > 0) ? years + 1 : years;
		console.log(`${years} years, ${months} months, and ${days} days`);
		return {
			years,
			gratuityAmount:
				years >= gratuityMinYears
					? ((gratuityAmountToCalculate * 15) / 26) * years
					: 0,
		};
	}
}
async function leaveEncashmentAmount(applicableComponents, encashmentDays) {
	if (!encashmentDays) {
		return 0;
	}
	let encashmentApplicableAmount = 0;
	for (const element of applicableComponents) {
		if (element.isLeaveEncashmentApplicable == 1) {
			encashmentApplicableAmount =
				parseFloat(encashmentApplicableAmount) +
				parseFloat(element.payElementAmount);
		}
	}
	console.log(
		"Leave Encashment Applicable Amount :: ",
		encashmentApplicableAmount,
	);
	encashmentApplicableAmount =
		(encashmentApplicableAmount / 30) * encashmentDays;
	return encashmentApplicableAmount;
}


async function noticePeriodRecoveryAmount(applicableComponents, recoveryDays) {
	if (!recoveryDays) {
		return 0;
	}
	let recoveryApplicableAmount = 0;
	for (const element of applicableComponents) {
		if (element.isNoticeRecoveryApplicable == 1) {
			recoveryApplicableAmount =
				parseFloat(recoveryApplicableAmount) +
				parseFloat(element.payElementAmount);
		}
	}
	console.log(
		"Leave Encashment Applicable Amount :: ",
		recoveryApplicableAmount,
	);
	recoveryApplicableAmount =
		(recoveryApplicableAmount / 30) * recoveryDays;
	return recoveryApplicableAmount;
}



async function getExitMonth(employeeId)
{
	let employeeExitDetails = await db.employeeMaster.findOne({where:{id:employeeId},attributes:['id',"dateOfExit"],raw:true});
	const exitMonth = `${new Date(employeeExitDetails.dateOfExit).getFullYear()}-${String(new Date(employeeExitDetails.dateOfExit).getMonth() + 1).padStart(2, '0')}`;
	return exitMonth;
}

function workingDaysInMonth(dateOfExit,dateOfJoining) {
	var daysLeft=0;
	const exitDate = new Date(dateOfExit);
	const joiningDate = new Date(dateOfJoining);
	// Get the current month and year from the date
	const exitYear = exitDate.getFullYear();
	const exitMonth = exitDate.getMonth(); // Note: Month is 0-indexed (0 = January)

	const joiningYear = joiningDate.getFullYear();
	const joiningMonth = joiningDate.getMonth(); // Note: Month is 0-indexed (0 = January)


	const exitDay = exitDate.getDate();
	const joiningDay = joiningDate.getDate();


	if(exitMonth==joiningMonth && exitYear==joiningYear )
	{
		//If Employee Join and Exit in the same month.....
		daysLeft = (exitDay - joiningDay) + 1;
	}
	else
	{
		//If Employee Join in different month and Exit in the different month.....
		 daysLeft = exitDay;
	}
	// Calculate the remaining days including the given date
	return daysLeft;
}


export default {
	query,
	getDaysInCurrentMonth,
	actualWorkingDays,
	getElementValue,
	getActualMonthlyAmount,
	customRound,
	getCalculatedPF,
	getPercentagePart,
	getCalculatedESIC,
	getExtraEarningElements,
	getExtraDeductionsElements,
	getFinancialYear,
	arrectLOP,
	calculateGratuity,
	leaveEncashmentAmount,
	getExitMonth,
	noticePeriodRecoveryAmount
};
