const dbName = process.env.DB_NAME;

async function query(caseId, data, data2) {
  switch (caseId) {
    case 1:
      return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
        data == 1 ? "buId" : "empCode"
      } IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")})AND (YEAR(ejd.dateOfJoining) < ${data2.paymonth.split("-")[0]} OR (YEAR(ejd.dateOfJoining) = ${data2.paymonth.split("-")[0]} AND MONTH(ejd.dateOfJoining) <= ${data2.paymonth.split("-")[1]}));`;
      break;
       case 2:
        return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId LEFT JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId = ${data2.companyId} AND e.isActive = 0 AND (YEAR(e.dateOfexit) < ${data2.paymonth.split('-')[0]} OR (YEAR(e.dateOfexit) = ${data2.paymonth.split('-')[0]} AND MONTH(e.dateOfexit) <= ${data2.paymonth.split('-')[1]}))  AND e.dateOfexit is not null;`
      break;
      case 3:
        return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(1,2,3,5,6,7) and payMonth='${data2}' and EmployeeId  in (${data});`;
        break;
      case 4:
        return `SELECT EmployeeId FROM ${dbName}.payprocessdetails  where payStatus in(8,9)   and payMonth='${data2}' and EmployeeId  in (${data});`;
        break;
      case 5:
          return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.isActive=0 AND e.${
            data == 1 ? "buId" : "empCode"
          } IN (${data2.departmentId.map((id) => `'${id}'`).join(", ")}
          ) AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${
            data2.paymonth
          }' OR (ppd.payStatus in (101,4))));;`;
        break;
      case 6:
        return `SELECT DISTINCT e.id AS EmployeeId, e.name AS EmployeeName FROM ${dbName}.employee e LEFT JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId LEFT JOIN ${dbName}.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND  p.payPackageAutoId IS NOT NULL AND e.companyId=${data2.companyId} AND (ppd.payProcessDetailAutoId IS NULL OR (ppd.payMonth != '${data2.paymonth}' OR (ppd.payStatus in (101,4))));`;
        break;
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
    default:
  }
}



export default {
  query,
};
