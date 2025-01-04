import db from "../../../config/db.config.js";

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
  standardDeductions
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

const salaryPaySlip = async function (paySlipAutoId) {
    try {
      const paySlip = await db.paySlips.findAll({
        where: {
          paySlipAutoId: paySlipAutoId,
        },
        order: [["createdAt", "desc"]],
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
                model: db.employeeTypeMaster,
                 attributes:["emptypename"]
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
                attributes: ["dateOfJoining"],
              },
              {
                model: db.companyLocationMaster,
                attributes: ["companyLocationId","companyId", "address1", "companyLocationCode"],
                include:[{
                  model:db.cityMaster,
                  attributes:['cityName']
                },
                {
                  model:db.stateMaster,
                  attributes:['stateName']
                }]
              },
              {
                 model: db.companyMaster,
                 attributes: ["companyName"]
              }
            ],
          },
          {
            model: db.paySlipComponent,
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

      return paySlip
      // return respHelper(res, {
      //   status: 200,
      //   data: paySlip,
      // });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

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
  console.log(date);
  return date;
}
// async function query(caseId, data, data2) {
//   switch (caseId) {
//     case 1:
//       return `SELECT p.includeInPackage, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extraPaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) - SUM(CASE WHEN p.salaryComponentEarningType = 'Deduction' THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning" FROM tara.paymonthlyelement p JOIN tara.employee e ON p.empId = e.id WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`;
//       break;
//     case 2:
//       return `SELECT p.EmployeeId, p.paySlipNetPay, e.name AS EmployeeName, e.empCode AS EmployeeCode, d.name AS Designation, b.buName AS BU FROM payslip p JOIN employee e ON p.EmployeeId = e.id JOIN designationmaster d ON e.designation_id = d.designationId JOIN bumaster b ON e.buId = b.buId WHERE p.EmployeeId IN (${data}) AND paySlipStatus = ${data2}`;
//       break;
//     case 3:
//       return `SELECT salarystructure.salaryStructureName as StructureName,  employee.id, employee.empCode as EmployeeId , employee.name as EmployeeName, bumaster.buName as BuName, designationmaster.name as DesignationName FROM salarystructure JOIN paypackage ON salarystructure.salaryStructureName = paypackage.payPackageSalaryStructure JOIN employee ON paypackage.EmployeeId = employee.id JOIN bumaster ON employee.buId = bumaster.buId JOIN designationmaster ON employee.designation_id = designationmaster.designationId WHERE salarystructure.salaryStructureAutoId = ${data}`;
//       break;
//     case 4:
//       return `SELECT pm.name AS process_name, pm.payMonth, pm.payProcessMasterAutoId as processId , pm.createdAt, pm.updatedBy, pm.updatedAt, pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description, e.name AS created_by_name FROM payprocessmaster pm INNER JOIN payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN paystatusmaster ps ON pf.currentstatus = ps.payProcessStatusAutoId LEFT JOIN employee e ON pm.createdBy = e.id WHERE ps.payProcessStatusAutoId IN (${data}) AND pm.payMonth = "${data2.paymonth}" AND pm.companyId = ${data2.companyId}`;
//       break;
//     case 5:
//       return `SELECT pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, pf.currentstatus, ps.name AS status_name, ps.description AS status_description FROM payprocessmaster pm INNER JOIN payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pm.payProcessMasterAutoId = ${data};`;
//       break;
//     case 6:
//       return `SELECT pf.refferenceFlowId, ps.currentRemark FROM tara.payprocessflowmaster pf INNER JOIN tara.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.nextstatus = ${data2} AND pf.currentstatus = ${data}`;
//       break;

//     case 7:
//       return `SELECT pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description FROM payprocessflowmaster pf INNER JOIN paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.currentstatus = ${data}`;
//     break;
//       case 8:
//         return `SELECT ppm.payProcessMasterAutoId, COUNT(CASE WHEN ppd.payStatus = 2 THEN 1 END) AS successfullyProcessed, COUNT(CASE WHEN ppd.payStatus = 3 THEN 1 END) AS processedWithError, COUNT(CASE WHEN ppd.payStatus = 1 THEN 1 END) AS pendingForProcess, COUNT(CASE WHEN ppd.payStatus != 1 THEN 1 END) * 100.0 / COUNT(*) AS totalProcessedPercentage, COUNT(CASE WHEN ppd.payStatus IN (2, 3) THEN 1 END) AS totalProcessed FROM payprocessmaster ppm JOIN payprocessdetails ppd ON ppm.payProcessMasterAutoId = ppd.proceessId WHERE ppm.payProcessMasterAutoId = ${data} GROUP BY ppm.payProcessMasterAutoId;`
//      break;
//      case 9:
//         return `SELECT ppm.payProcessMasterAutoId AS processId,ppm.payMonth as payMonth, psm.payProcessStatusAutoId AS currentStatusId, psm.name AS statusName FROM payprocessmaster ppm JOIN payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN paystatusmaster psm ON ppfm.currentstatus = psm.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`
//      break;
//      case 10:
//       return `SELECT pm.payProcessMasterAutoId, pd.ctc, pd.lopDays, pd.totalWorkingDays, pd.tdsDeductions, pd.netPay, pd.deductionAmount, pd.arrearAmount, pd.loanAmont, pd.salaryMonth, pd.deductionName, pd.lopDeductions, pp.payPackageEffectiveDate, pe.salaryComponentAutoId, pe.payElementAmount, sc.includeInPackage, sc.includeInPackage, sc.salaryComponentEarningType FROM payprocessmaster pm JOIN payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId JOIN paypackage pp ON pd.EmployeeId = pp.EmployeeId JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE pm.payProcessMasterAutoId = 1 AND pd.payStatus = 2 AND pd.EmployeeId = 484`
//       break;
//       case 11:
//         return `SELECT e.name as empName, e.id as empId, lop.lopMonth, lop.lopDays, earn.arrearMonth, earn.arearDays, tds.tdsMonth, tds.tdsAmount, pp.payPackageAutoId, pp.payPackageMonthlyCTC, pp.payPackageEffectiveDate, pe.payElementAmount, sc.salaryComponentAutoId, sc.salaryComponentCode, sc.salaryComponentAlias, sc.salaryComponentEarningType, sc.includeInPackage FROM employee e LEFT JOIN lopdeductions lop ON e.id = lop.EmployeeId AND lop.lopMonth = "${data2.payMonth}" LEFT JOIN earningarrears earn ON e.id = earn.EmployeeId AND earn.arrearMonth = "${data2.payMonth}"  LEFT JOIN tdsdeductions tds ON e.id = tds.EmployeeId AND tds.tdsMonth = "${data2.payMonth}" LEFT JOIN paypackage pp ON e.id = pp.EmployeeId LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE e.id = ${data}`
//    break;
//    case 12 :
//     return `SELECT sc.salaryComponentAutoId, scm.elementValue, sce.salaryComponentElementAutoId, sce.salaryComponentElementName FROM salarycomponent sc JOIN salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId JOIN salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sc.salaryComponentAutoId = ${data}`
//     break;

//     case 13: return `SELECT COUNT(CASE WHEN scm.salaryComponentElementAutoId = 1 AND scm.elementValue = 1 THEN 1 END) AS lopAffectCount, COUNT(CASE WHEN scm.salaryComponentElementAutoId = 2 AND scm.elementValue = 1 THEN 1 END) AS arrearAffectCount, COUNT(CASE WHEN scm.salaryComponentElementAutoId = 3 AND scm.elementValue = 1 THEN 1 END) AS leaveEncashmentCount FROM paypackage pp LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId LEFT JOIN salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId WHERE pp.EmployeeId = ${data}`
//     break;

//     case 14: return `SELECT SUM(deductionAmount) AS totalDeduction, GROUP_CONCAT(deductionCategory ORDER BY deductionCategory SEPARATOR ' | ') AS deductionCategories FROM extradeductions WHERE startMonth = '${data2}' AND EmployeeId = ${data};`
//     break;

//     case 15:return `SELECT ppm.payMonth, ppm.payProcessMasterAutoId, ppfm.currentstatus, ps.name as statusName FROM tara.payprocessmaster ppm JOIN tara.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN tara.paystatusmaster ps ON ppfm.currentstatus = ps.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`
//     break;

//     case 16 : return `SELECT empId, tdsAmount, ptAmount, lwfAmount, extraPaymentAmount, COALESCE(NULLIF(TRIM(lopDays), ''), 0) AS lopDays, COALESCE(NULLIF(TRIM(arrearDays), ''), 0) AS arrearDays, payPackageMonthlyCTC, payElementAmount, salaryComponentAutoId, salaryComponentEarningType, elementMonthlyAmount, totalExtraDeduction, payMonth, SUM(payElementAmount) OVER (PARTITION BY empId) AS paySlipTotalPay, COALESCE(NULLIF(TRIM(salaryComponentAlias), ''), salaryComponentCode) AS paySlipComponentName, SUM(CASE WHEN salaryComponentEarningType != 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) - SUM(CASE WHEN salaryComponentEarningType = 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS paySlipGrossEarning, SUM(CASE WHEN salaryComponentEarningType = 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS totalComponentDeductions FROM tara.paymonthlyelement WHERE payMonth = '${data}' AND (includeInPackage = 1 OR salaryComponentEarningType = 'Deduction')`;
//     break;

//     case 17: return `SELECT pm.payMonth, pd.EmployeeId as empId FROM tara.payprocessmaster pm INNER JOIN tara.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId WHERE pm.payProcessMasterAutoId = ${data} AND pd.payStatus = 2`;
//     break;
//     case 18: return`SELECT (SELECT COUNT(*) FROM tara.payprocessdetails WHERE payMonth = '${data2.paymonth}') AS totalEmployees, (SELECT COUNT(*) FROM tara.payslip WHERE paySlipMonth = ${data2.month} AND paySlipYear = ${data2.year}) AS total_payslips, (SELECT COUNT(*) FROM tara.payslip WHERE paySlipMonth = ${data2.month} AND paySlipYear = ${data2.year} AND paySlipStatus = 1) AS paySlipReleased, COUNT(ps.paySlipAutoId) AS paySlipGenerated, ROUND((COUNT(ps.paySlipAutoId) * 100.0) / (SELECT COUNT(*) FROM tara.payprocessdetails WHERE payMonth = '${data2.paymonth}'), 2) AS paySlipPercentage FROM tara.payprocessdetails pd LEFT JOIN tara.payslip ps ON pd.EmployeeId = ps.EmployeeId WHERE pd.payMonth = '${data2.paymonth}' AND ps.paySlipMonth = ${data2.month} AND ps.paySlipYear = ${data2.year};`;
//     break;
//     default:
//   }
// }
async function query(caseId, data, data2) {
  switch (caseId) {
    case 1:
      return `SELECT  p.salaryComponentEarningType,p.esicEmployerAmount as "ESIC Employer",p.esicEmployeeAmount as "ESIC Employee",p.pfEmployeeAmount as "PF Employee",p.pfEmployerAmount as "PF Employer",p.salaryComponentCode,p.includeInPackage,p.isPfApplicableComponent,p.isPfApplicable,p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) - SUM(CASE WHEN p.salaryComponentEarningType = 'Deduction' THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning" FROM tara.paymonthlyelement p JOIN tara.employee e ON p.empId = e.id WHERE p.payMonth = '${data}' AND p.empId IN (${data2});`;
      break;
    case 2:
      return `SELECT p.EmployeeId, p.paySlipNetPay, e.name AS EmployeeName, e.empCode AS EmployeeCode, d.name AS Designation, b.buName AS BU FROM payslip p JOIN employee e ON p.EmployeeId = e.id JOIN designationmaster d ON e.designation_id = d.designationId JOIN bumaster b ON e.buId = b.buId WHERE p.EmployeeId IN (${data}) AND paySlipStatus = ${data2}`;
      break;
    case 3:
      return `SELECT salarystructure.salaryStructureName as StructureName,  employee.id, employee.empCode as EmployeeId , employee.name as EmployeeName, bumaster.buName as BuName, designationmaster.name as DesignationName FROM salarystructure JOIN paypackage ON salarystructure.salaryStructureName = paypackage.payPackageSalaryStructure JOIN employee ON paypackage.EmployeeId = employee.id JOIN bumaster ON employee.buId = bumaster.buId JOIN designationmaster ON employee.designation_id = designationmaster.designationId WHERE salarystructure.salaryStructureAutoId = ${data}`;
      break;
    case 4:
      return `SELECT pm.name AS process_name, pm.payMonth, pm.payProcessMasterAutoId as processId , pm.createdAt, pm.updatedBy, pm.updatedAt, pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description, e.name AS created_by_name FROM payprocessmaster pm INNER JOIN payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN paystatusmaster ps ON pf.currentstatus = ps.payProcessStatusAutoId LEFT JOIN employee e ON pm.createdBy = e.id WHERE ps.payProcessStatusAutoId IN (${data}) AND pm.payMonth = "${data2.paymonth}" AND pm.companyId = ${data2.companyId}`;
      break;
    case 5:
      return `SELECT pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, pf.currentstatus, ps.name AS status_name, ps.description AS status_description FROM payprocessmaster pm INNER JOIN payprocessflowmaster pf ON pm.processFlowId = pf.payProcessFlowMasterAutoId INNER JOIN paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pm.payProcessMasterAutoId = ${data};`;
      break;
    case 6:
      return `SELECT pf.refferenceFlowId, ps.currentRemark FROM tara.payprocessflowmaster pf INNER JOIN tara.paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.nextstatus = ${data2} AND pf.currentstatus = ${data}`;
      break;

    case 7:
      return `SELECT pf.currentstatus, pf.nextstatus, pf.refferenceFlowId, pf.endOfFlow, ps.name AS status_name, ps.description AS status_description FROM payprocessflowmaster pf INNER JOIN paystatusmaster ps ON pf.nextstatus = ps.payProcessStatusAutoId WHERE pf.currentstatus = ${data}`;
      break;
    case 8:
      return `SELECT ppm.payProcessMasterAutoId, COUNT(CASE WHEN ppd.payStatus = 2 THEN 1 END) AS successfullyProcessed, COUNT(CASE WHEN ppd.payStatus in(101) THEN 1 END) AS processedWithError, COUNT(CASE WHEN ppd.payStatus = 1 THEN 1 END) AS pendingForProcess, COUNT(CASE WHEN ppd.payStatus != 1 THEN 1 END) * 100.0 / COUNT(*) AS totalProcessedPercentage, COUNT(CASE WHEN ppd.payStatus not in(1) THEN 1 END) AS totalProcessed FROM payprocessmaster ppm JOIN payprocessdetails ppd ON ppm.payProcessMasterAutoId = ppd.proceessId WHERE ppm.payProcessMasterAutoId = ${data} GROUP BY ppm.payProcessMasterAutoId;`;
      break;
    case 9:
      return `SELECT ppm.payProcessMasterAutoId AS processId,ppm.payMonth as payMonth, psm.payProcessStatusAutoId AS currentStatusId, psm.name AS statusName FROM payprocessmaster ppm JOIN payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN paystatusmaster psm ON ppfm.currentstatus = psm.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`;
      break;
    case 10:
      return `SELECT pm.payProcessMasterAutoId, pd.ctc, pd.lopDays, pd.totalWorkingDays, pd.tdsdeductions, pd.netPay, pd.deductionAmount, pd.arrearAmount, pd.loanAmont, pd.salaryMonth, pd.deductionName, pd.lopdeductions, pp.payPackageEffectiveDate, pe.salaryComponentAutoId, pe.payElementAmount, sc.includeInPackage, sc.includeInPackage, sc.salaryComponentEarningType FROM payprocessmaster pm JOIN payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId JOIN paypackage pp ON pd.EmployeeId = pp.EmployeeId JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE pm.payProcessMasterAutoId = 1 AND pd.payStatus = 2 AND pd.EmployeeId = 484`;
      break;
    case 11:
      return `SELECT e.name as empName, e.id as empId, lop.lopMonth, lop.lopDays, earn.arrearMonth, earn.arearDays, tds.tdsMonth, tds.tdsAmount, pp.payPackageAutoId, pp.salaryStructureAutoId, pp.payPackageMonthlyCTC, pp.payPackageEffectiveDate, pe.payElementAmount, sc.salaryComponentAutoId, sc.salaryComponentCode, sc.salaryComponentAlias, sc.salaryComponentEarningType, sc.includeInPackage FROM employee e LEFT JOIN lopdeductions lop ON e.id = lop.EmployeeId AND lop.lopMonth = "${data2.payMonth}" LEFT JOIN earningarrears earn ON e.id = earn.EmployeeId AND earn.arrearMonth = "${data2.payMonth}"  LEFT JOIN tdsdeductions tds ON e.id = tds.EmployeeId AND tds.tdsMonth = "${data2.payMonth}" LEFT JOIN paypackage pp ON e.id = pp.EmployeeId LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId WHERE e.id = ${data}`;
      break;
    case 12:
      //return `SELECT sc.salaryComponentAutoId, scm.elementValue, sce.salaryComponentElementAutoId, sce.salaryComponentElementName FROM salarycomponent sc JOIN salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId JOIN salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sc.salaryComponentAutoId = ${data}`;
      return `SELECT sscm.salaryComponentAutoId, sscm.salaryStructureAutoId, scm.salaryComponentElementAutoId, scm.elementValue, sce.salaryComponentElementName, sce.salaryComponentElementCode FROM tara.salarystructurecomponentmapping sscm JOIN tara.salarycomponentmapping scm ON sscm.salaryStructurecomponentmappingAutoId = scm.salaryStructurecomponentmappingAutoId JOIN tara.salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sscm.salaryComponentAutoId = ${data} AND sscm.salaryStructureAutoId = ${data2};`
      
      break;

    case 13:
      return `SELECT COUNT(CASE WHEN scm.salaryComponentElementAutoId = 1 AND scm.elementValue = 1 THEN 1 END) AS lopAffectCount, COUNT(CASE WHEN scm.salaryComponentElementAutoId = 2 AND scm.elementValue = 1 THEN 1 END) AS arrearAffectCount, COUNT(CASE WHEN scm.salaryComponentElementAutoId = 3 AND scm.elementValue = 1 THEN 1 END) AS leaveEncashmentCount FROM paypackage pp LEFT JOIN payelement pe ON pp.payPackageAutoId = pe.payPackageAutoId LEFT JOIN salarycomponent sc ON pe.salaryComponentAutoId = sc.salaryComponentAutoId LEFT JOIN salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId WHERE pp.EmployeeId = ${data}`;
      break;

    case 14:
      return `SELECT SUM(deductionAmount) AS totalDeduction, GROUP_CONCAT(deductionCategory ORDER BY deductionCategory SEPARATOR ' | ') AS deductionCategories FROM extradeductions WHERE startMonth = '${data2}' AND EmployeeId = ${data};`;
      break;

    case 15:
      return `SELECT ppm.payMonth, ppm.payProcessMasterAutoId, ppfm.currentstatus, ps.name as statusName FROM tara.payprocessmaster ppm JOIN tara.payprocessflowmaster ppfm ON ppm.processFlowId = ppfm.payProcessFlowMasterAutoId JOIN tara.paystatusmaster ps ON ppfm.currentstatus = ps.payProcessStatusAutoId WHERE ppm.payProcessMasterAutoId = ${data};`;
      break;

    case 16:
      return `SELECT pfEmployeeAmount, esicEmployeeAmount, empId, tdsAmount, ptAmount, lwfAmount, extrapaymentAmount, COALESCE(NULLIF(TRIM(lopDays), ''), 0) AS lopDays, COALESCE(NULLIF(TRIM(arrearDays), ''), 0) AS arrearDays, payPackageMonthlyCTC, payElementAmount, salaryComponentAutoId, salaryComponentEarningType, elementMonthlyAmount, totalExtraDeduction, payMonth, SUM(payElementAmount) OVER (PARTITION BY empId) AS paySlipTotalPay, COALESCE(NULLIF(TRIM(salaryComponentAlias), ''), salaryComponentCode) AS paySlipComponentName, SUM(CASE WHEN salaryComponentEarningType in ('Earning','Balancing') THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS paySlipGrossEarning, SUM(CASE WHEN salaryComponentEarningType = 'Deduction' THEN elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY empId) AS totalComponentDeductions FROM tara.paymonthlyelement WHERE payMonth = '${data}' AND (includeInPackage = 1 OR salaryComponentEarningType = 'Deduction') AND empId IN (${data2});`;
      break;

    case 17:
      return `SELECT pm.payMonth, pd.EmployeeId as empId FROM tara.payprocessmaster pm INNER JOIN tara.payprocessdetails pd ON pm.payProcessMasterAutoId = pd.proceessId WHERE pm.payProcessMasterAutoId = ${data} AND pd.payStatus in(2,3,4,5,6,7)`;
      break;
    // case 18: return`SELECT (SELECT COUNT(*) FROM tara.payprocessdetails WHERE payMonth = '${data2.paymonth}') AS totalEmployees, (SELECT COUNT(*) FROM tara.payslip WHERE paySlipMonth = ${data2.month} AND paySlipYear = ${data2.year}) AS total_payslips, (SELECT COUNT(*) FROM tara.payslip WHERE paySlipMonth = ${data2.month} AND paySlipYear = ${data2.year} AND paySlipStatus = 1) AS paySlipReleased, COUNT(ps.paySlipAutoId) AS paySlipGenerated, ROUND((COUNT(ps.paySlipAutoId) * 100.0) / (SELECT COUNT(*) FROM tara.payprocessdetails WHERE payMonth = '${data2.paymonth}'), 2) AS paySlipPercentage FROM tara.payprocessdetails pd LEFT JOIN tara.payslip ps ON pd.EmployeeId = ps.EmployeeId WHERE pd.payMonth = '${data2.paymonth}' AND ps.paySlipMonth = ${data2.month} AND ps.paySlipYear = ${data2.year};`;
    // break;
    case 18:
      //return `SELECT (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data}) AS paySlipGenerated, (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data} and payStatus=6) AS totalEmployees, (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} AND ps.paySlipStatus = 1) AS paySlipReleased, CASE WHEN (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}) = 0 THEN 0 ELSE (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data}) * 100.0 / (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}) END AS paySlipPercentage;`;
      return `SELECT (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus=7) AS paySlipGenerated, (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data} and payStatus!=101) AS totalEmployees, (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} AND ps.paySlipStatus = 1) AS paySlipReleased, CASE WHEN (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}) = 0 THEN 0 ELSE (SELECT COUNT(*) FROM payslip ps JOIN payprocessdetails ppd ON ppd.EmployeeId = ps.EmployeeId AND ppd.payMonth = ps.payMonth WHERE ppd.proceessId = ${data} and payStatus!=101) * 100.0 / (SELECT COUNT(*) FROM payprocessdetails ppd WHERE ppd.proceessId = ${data}   and payStatus!=101) END AS paySlipPercentage;`
      break;

    case 19:
      return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.${
        data == 1 ? "buId" : "empCode"
      } IN (${
        data2.departmentId
      }) AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${
        data2.paymonth
      }' OR (ppd.payStatus = 101)));;`;
      break;
    case 20:
      return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.${
        data == 1 ? "buId" : "empCode"
      } IN (${data2.departmentId});`;
      break;
    case 21:
      return `SELECT EmployeeId FROM tara.payprocessdetails  where payStatus in(1,2,3,4,5,6,7)   and payMonth='${data2}' and EmployeeId  in (${data});`;
      break;
    case 22:
      return `SELECT EmployeeId FROM tara.payprocessdetails  where payStatus in(8,9)   and payMonth='${data2}' and EmployeeId  in (${data});`;
      break;
    case 23:
      return `SELECT EmployeeId FROM tara.payprocessdetails where proceessId=${data} and payStatus in(6);`;
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
  // console.log(data);
  const item = data.find((item) => item.salaryComponentElementName === name);
  return item ? item.elementValue : null; // Return elementValue or null if not found
}
function getPayComponentObject(
  employeePackageDetails,
  processedEmployee,
  newPaySlip,
  req,
  deductionType
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
                  processedEmployee.ctc
                )
              )
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
    applicablePFAmount = 0;
  if (monthlyElementPay[0].isPfApplicable == 0) return calculatedPF;
  applicablePFAmount =
    monthlyElementPay[0].isPfRestriction == 1
      ? await monthlyElementPay
          .filter((element) => element.isPfApplicableComponent == 1)
          .reduce(async (sumPromise, element) => {
            const sum = await sumPromise; // Resolve the previous sum
            return sum + parseFloat(element["elementMonthlyAmount"]);
          }, Promise.resolve(0))
      : monthlyElementPay.find((item) => item["salaryComponentCode"] === "Basic")?.[
          "elementMonthlyAmount"
        ] || null; // Start with a resolved promise of 0

  if (monthlyElementPay[0].isPfRestriction == 1) {
    calculatedPF=applicablePFAmount<15000?getPercentagePart(applicablePFAmount,12):1800;
  } else {
    calculatedPF=getPercentagePart(applicablePFAmount,12);
  }
  console.log("Applicable PF Amount :: " + applicablePFAmount);
  return calculatedPF; // Return elementValue or null if not found
}



async function getCalculatedESIC(monthlyElementPay) {
  let calculatedEmployeeESIC = 0,calculatedEmployerESIC,
    esicApplicableAmount = 0;
  if (monthlyElementPay[0].isEsicApplicable == 0) return calculatedEmployeeESIC;
  esicApplicableAmount =
  await monthlyElementPay
  .filter((element) => element.isEsicApplicableComponent == 1)
  .reduce(async (sumPromise, element) => {
    console.log("ESIC AMOUNT ::",element["elementMonthlyAmount"]);
    const sum = await sumPromise; // Resolve the previous sum
    return sum + parseFloat(element["elementMonthlyAmount"]);
  }, Promise.resolve(0)); // Start with a resolved promise of 0

  calculatedEmployeeESIC=getPercentagePart(esicApplicableAmount,0.75);
  calculatedEmployerESIC=getPercentagePart(esicApplicableAmount,3.25);
  console.log("Applicable ESIC Amount :: " + esicApplicableAmount);
  return {calculatedEmployerESIC,calculatedEmployeeESIC}; // Return elementValue or null if not found
}

async function arrectLOP(componentAmount,lopDays,totalWorkingdays) {
  let amountAfterLop=0;
  amountAfterLop=(componentAmount/totalWorkingdays)*lopDays;
  return  (componentAmount-amountAfterLop);
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
  salaryPaySlip
};
