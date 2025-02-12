const dbName = process.env.DB_NAME;
import db from "../../../config/db.config.js";
async function query(caseId, data, data2) {
	switch (caseId) {
		case 1:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
				data == 1 ? "buId" : "empCode"
			} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")})AND (YEAR(ejd.dateOfJoining) < ${data2.paymonth.split("-")[0]} OR (YEAR(ejd.dateOfJoining) = ${data2.paymonth.split("-")[0]} AND MONTH(ejd.dateOfJoining) <= ${data2.paymonth.split("-")[1]}));`;
			break;
		case 2:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId = ${data2.companyId} AND e.isActive = 0 AND (YEAR(e.dateOfexit) < ${data2.paymonth.split("-")[0]} OR (YEAR(e.dateOfexit) = ${data2.paymonth.split("-")[0]} AND MONTH(e.dateOfexit) <= ${data2.paymonth.split("-")[1]}))  AND e.dateOfexit is not null;`;
			break;
		case 3:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(1,2,3,5,6,7) and payMonth='${data2}' and EmployeeId  in (${data});`;
			break;
		case 4:
			return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(8,9)   and payMonth='${data2}' and EmployeeId  in (${data});`;
			break;
		// case 5:
		// 	return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
		// 		data == 1 ? "buId" : "empCode"
		// 	} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")}
        //   ) AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${
		// 				data2.paymonth
		// 			}' OR (ppd.payStatus in (101,4))));;`;
		// 	break;
		// case 6:
		// 	return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.companyId=${data2.companyId} AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${data2.paymonth}' OR (ppd.payStatus in (101,4))));`;
		// 	break;
		case 5:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) <= MONTH(CURDATE()) OR YEAR(e.dateOfexit) <= YEAR(CURDATE())) AND e.isActive=0 AND p.payPackageAutoId IS NOT NULL AND e.companyId=${data2.companyId} AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${data2.paymonth}' OR (ppd.payStatus in (101,4))));`;
			break;
		case 6:
			return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NOT NULL OR MONTH(e.dateOfexit) <= MONTH(CURDATE()) OR YEAR(e.dateOfexit) <= YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
				data == 1 ? "buId" : "empCode"
			} IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")}
            ) AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${
							data2.paymonth
						}' OR (ppd.payStatus in (101,4))));;`;
			break;

		case 7:
			return `SELECT e.name as empName, e.id as empId, lop.lopMonth, lop.lopDays, earn.arrearMonth, earn.arearDays, tds.tdsMonth, tds.tdsAmount, pp.payPackageAutoId, pp.salaryStructureAutoId, pp.payPackageMonthlyCTC, pp.payPackageEffectiveDate, pe.payElementAmount, sc.salaryComponentSequenceNo,sc.salaryComponentAutoId, sc.salaryComponentCode, sc.salaryComponentAlias, sc.salaryComponentEarningType, sc.includeInPackage FROM employee e LEFT JOIN lopdeductions lop ON e.id = lop.EmployeeId AND lop.lopMonth = "${data2.payMonth}" LEFT JOIN earningarrears earn ON e.id = earn.EmployeeId AND earn.arrearMonth = "${data2.payMonth}"  LEFT JOIN tdsdeductions tds ON e.id = tds.EmployeeId AND tds.tdsMonth = "${data2.payMonth}" LEFT JOIN paypackage pp ON e.id = pp.EmployeeId LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE e.id = ${data}  and pp.isActive=1;`; //11
			break;
		case 8:
			return `SELECT userId, dateOfJoining FROM employeejobdetails WHERE YEAR(dateOfJoining)=${data2.payYear} AND MONTH(dateOfJoining)=${data2.payMonth} AND userId=${data};`; //26
			break;
		case 9:
			return `SELECT sscm.salaryComponentAutoId, sscm.salaryStructureAutoId, scm.salaryComponentElementAutoId, scm.elementValue, sce.salaryComponentElementName, sce.salaryComponentElementCode FROM ${dbName}.salarystructurecomponentmapping sscm JOIN ${dbName}.salarycomponentmapping scm ON sscm.salaryStructurecomponentmappingAutoId = scm.salaryStructurecomponentmappingAutoId JOIN ${dbName}.salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sscm.salaryComponentAutoId = ${data} AND sscm.salaryStructureAutoId = ${data2};`; // 12
			break;
      case 10:
        return `SELECT pm.payMonth, pd.EmployeeId as empId FROM ${dbName}.payprocessmaster pm INNER JOIN ${dbName}.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId WHERE pm.payProcessMasterAutoId = ${data} AND pd.payStatus in(2,3,4,5,6,7,8,9)`;//17
        break;
        case 11:
          //return `SELECT  p.salaryComponentEarningType,p.esicEmployerAmount as "ESIC Employer",p.esicEmployeeAmount as "ESIC Employee",p.pfEmployeeAmount as "PF Employee",p.pfEmployerAmount as "PF Employer",p.salaryComponentCode,p.includeInPackage,p.isPfApplicableComponent,p.isPfApplicable,p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) - SUM(CASE WHEN p.salaryComponentEarningType = 'Deduction' THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`;
          return `SELECT p.totalExtraDeduction as "EXTRA DEDUCTION",p.extraPaymentCategories as "EXTRA PAYMENT CATEGORIES",p.salaryComponentEarningType, p.esicEmployerAmount AS "ESIC Employer", p.esicEmployeeAmount AS "ESIC Employee", p.pfEmployeeAmount AS "PF Employee", p.pfEmployerAmount AS "PF Employer", p.salaryComponentCode, p.includeInPackage, p.isPfApplicableComponent, p.isPfApplicable, p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning", ed.deductionCategory AS "Deduction Category", ed.deductionAmount AS "Deduction Amount" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id LEFT JOIN ${dbName}.extradeductions ed ON p.empId = ed.EmployeeId AND p.payMonth = ed.startMonth WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`//1
          break;
          case 12:
            return `SELECT pf.refferenceFlowId, ps.currentRemark FROM ${dbName}.payprocessflowmaster pf INNER JOIN ${dbName}.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.nextstatus = ${data2} AND pf.currentstatus = ${data}`;6
            break;
            case 13:
              return `SELECT ppm.payMonth, ppm.payProcessMasterAutoId, ppfm.currentstatus, ps.name as statusName FROM ${dbName}.payprocessmaster ppm JOIN ${dbName}.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN ${dbName}.paystatusmaster ps ON ppfm.currentstatus = ps.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`//13
              break;
              case 14:
                return `SELECT EmployeeId FROM tara.payprocessdetails where proceessId=${data} and payStatus in(6);`;
                break;
                case 15:
                  return `SELECT salaryComponentSequenceNo,actualWorkingDays,totalWorkingDays,payElementAmount,pfEmployeeAmount, esicEmployeeAmount, empId, tdsAmount, ptAmount, lwfAmount, extrapaymentAmount, COALESCE(NULLIF(TRIM(lopDays), ''), 0) AS lopDays, COALESCE(NULLIF(TRIM(arrearDays), ''), 0) AS arrearDays, payPackageMonthlyCTC, payElementAmount, salaryComponentAutoId, salaryComponentEarningType, elementMonthlyAmount, totalExtraDeduction, payMonth, SUM(payElementAmount) OVER (PARTITION BY empId) AS paySlipTotalPay, COALESCE(NULLIF(TRIM(salaryComponentAlias), ''), salaryComponentCode) AS paySlipComponentName, SUM(CASE WHEN salaryComponentEarningType in ('Earning','Balancing') THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS paySlipGrossEarning, SUM(CASE WHEN salaryComponentEarningType = 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS totalComponentDeductions FROM ${dbName}.paymonthlyelement WHERE payMonth = '${data}' AND (includeInPackage = 1 OR salaryComponentEarningType = 'Deduction') AND empId IN (${data2});`//16
                  break;
		default:
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
function getElementValue(name, data) {
	const item = data.find((item) => item.salaryComponentElementName === name);
	// console.log(name);
	// console.log(item?item.elementValue:0);
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
  getFinancialYear
};
