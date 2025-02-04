import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import validator from "../../../helper/validator.js";
import paymentHelper from "./fnfHelper.js";
import pkg from "xlsx";

class PaymentController {


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
        value.departmentId == 0 ? 2 : 1,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId,
        }
      );
      console.log(employeeForProcessingQuery);
      let employeeForProcessing = await db.sequelize.query(
        employeeForProcessingQuery
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
        (employee) => employee.EmployeeId
      );

      console.log(employeeIds);

      let processingCounts = await availableEmployeeForProcessing(
        employeeIds,
        value.paymonth
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
      let { companyId ,year,month} = req.query;
      let employeeForProcessingQuery =  `SELECT DISTINCT ejd.dateOfJoining, e.empCode AS empId, e.name AS empName FROM tara.employee e JOIN tara.paypackage p ON e.id = p.EmployeeId JOIN tara.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive = 0 AND (YEAR(e.dateOfExit) < ${year} OR (YEAR(e.dateOfExit) = ${year} AND MONTH(e.dateOfExit) <= ${month}));`;
      console.log(employeeForProcessingQuery)
    
      let employeeForProcessing = await db.sequelize.query(
        employeeForProcessingQuery
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

  async uploadGratuity(req, res) {
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
      var gratuityDetails = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
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
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let gratuityOverrides = {
            EmployeeId: employeeDetais.id,
            gratuityDays: employeeTds["GRATUITY DAYS"],
            payMonth: employeeTds["PAY Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.gratuityValidateSchama.validate(
            gratuityOverrides
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: gratuityOverrides.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existTDSDetails = await db.gratuityOverrides.findOne({
              where: {
                empCode: gratuityOverrides.empCode,
                payMonth: gratuityOverrides.payMonth,
              },
              raw: true,
            });
            if (existTDSDetails) {
              gratuityOverrides["updatedBy"] = req.userData.id;
              gratuityOverrides["updatedAt"] = new Date();

              await db.gratuityOverrides.update(gratuityOverrides, {
                where: {
                  EmployeeId: gratuityOverrides.EmployeeId,
                  payMonth: gratuityOverrides.payMonth,
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
  
  async uploadGratuity(req, res) {
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
      var gratuityDetails = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
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
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let gratuityOverrides = {
            EmployeeId: employeeDetais.id,
            gratuityDays: employeeTds["GRATUITY DAYS"],
            payMonth: employeeTds["PAY Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.gratuityValidateSchama.validate(
            gratuityOverrides
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: gratuityOverrides.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existTDSDetails = await db.gratuityOverrides.findOne({
              where: {
                empCode: gratuityOverrides.empCode,
                payMonth: gratuityOverrides.payMonth,
              },
              raw: true,
            });
            if (existTDSDetails) {
              gratuityOverrides["updatedBy"] = req.userData.id;
              gratuityOverrides["updatedAt"] = new Date();

              await db.gratuityOverrides.update(gratuityOverrides, {
                where: {
                  EmployeeId: gratuityOverrides.EmployeeId,
                  payMonth: gratuityOverrides.payMonth,
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

  // End by jay
}


async function availableEmployeeForProcessing(employeeIds, paymonth) {
  try {
    let queryForInProcess = await paymentHelper.query(
      3,
      employeeIds,
      paymonth
    );
    let queryForProcessed = await paymentHelper.query(
      4,
      employeeIds,
      paymonth
    );
    let inProcessedEployees = await db.sequelize.query(queryForInProcess);
    let processedEmployees = await db.sequelize.query(queryForProcessed);
    const processExcluded = processedEmployees[0].map((item) =>
      parseInt(item.EmployeeId)
    );
    const inProcessExcluded = inProcessedEployees[0].map((item) =>
      parseInt(item.EmployeeId)
    );
    let avalialbleEmployees = employeeIds.filter(
      (item) => !processExcluded.includes(item)
    );
    avalialbleEmployees = avalialbleEmployees.filter(
      (item) => !inProcessExcluded.includes(item)
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





export default new PaymentController();
