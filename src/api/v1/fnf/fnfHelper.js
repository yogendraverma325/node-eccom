async function query(caseId, data, data2) {
  switch (caseId) {
    case 1:
      return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN tara.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
        data == 1 ? "buId" : "empCode"
      } IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")})AND (YEAR(ejd.dateOfJoining) < ${data2.paymonth.split("-")[0]} OR (YEAR(ejd.dateOfJoining) = ${data2.paymonth.split("-")[0]} AND MONTH(ejd.dateOfJoining) <= ${data2.paymonth.split("-")[1]}));`;
      break;
       case 2:
        return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN tara.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId = ${data2.companyId} AND e.isActive = 0 AND (YEAR(e.dateOfexit) < ${data2.paymonth.split('-')[0]} OR (YEAR(e.dateOfexit) = ${data2.paymonth.split('-')[0]} AND MONTH(e.dateOfexit) <= ${data2.paymonth.split('-')[1]}))  AND e.dateOfexit is not null;`
      break;
      case 3:
        return `SELECT EmployeeId FROM tara.payprocessdetails  where payStatus in(1,2,3,5,6,7) and payMonth='${data2}' and EmployeeId  in (${data});`;
        break;
      case 4:
        return `SELECT EmployeeId FROM tara.payprocessdetails  where payStatus in(8,9)   and payMonth='${data2}' and EmployeeId  in (${data});`;
        break;
    default:
  }
}



export default {
  query,
};
