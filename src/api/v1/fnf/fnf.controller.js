import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import validator from "../../../helper/validator.js";
import paymentHelper from "./fnfHelper.js";




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

          let lopDeductions = {
            EmployeeId: employeeDetais.id,
            lopDays: employeeTds["LOP DAYS"],
            lopMonth: employeeTds["LOP Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.lopValidateSchama.validate(
            lopDeductions
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: lopDeductions.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existTDSDetails = await db.lopDeductions.findOne({
              where: {
                empCode: lopDeductions.empCode,
                lopMonth: lopDeductions.lopMonth,
              },
              raw: true,
            });
            if (existTDSDetails) {
              lopDeductions["updatedBy"] = req.userData.id;
              lopDeductions["updatedAt"] = new Date();

              await db.lopDeductions.update(lopDeductions, {
                where: {
                  EmployeeId: lopDeductions.EmployeeId,
                  lopMonth: lopDeductions.lopMonth,
                  empCode: lopDeductions.empCode,
                },
              });
              lopDeductions["ACTION_TYPE"] = "UPDATE";
            } else {
              lopDeductions["createdBy"] = req.userData.id;
              lopDeductions["createdAt"] = new Date();
              await db.lopDeductions.create(lopDeductions);
              lopDeductions["ACTION_TYPE"] = "CREATE";
            }
            successArray.push(lopDeductions);
          }
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
        msg: "Lop Uploaded Successfully.",
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }  
  
  async lopUpload(req, res) {
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
      var lopDetails = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];

      if (!lopDetails[0]["Employee ID"]) {
        return respHelper(res, {
          status: 400,
          msg: "Invalid File Format",
        });
      }

      for (const employeeTds of lopDetails) {
        if (employeeTds["Employee ID"]) {
          let employeeDetais = await db.employeeMaster.findOne({
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let lopDeductions = {
            EmployeeId: employeeDetais.id,
            lopDays: employeeTds["LOP DAYS"],
            lopMonth: employeeTds["LOP Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.lopValidateSchama.validate(
            lopDeductions
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: lopDeductions.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existTDSDetails = await db.lopDeductions.findOne({
              where: {
                empCode: lopDeductions.empCode,
                lopMonth: lopDeductions.lopMonth,
              },
              raw: true,
            });
            if (existTDSDetails) {
              lopDeductions["updatedBy"] = req.userData.id;
              lopDeductions["updatedAt"] = new Date();

              await db.lopDeductions.update(lopDeductions, {
                where: {
                  EmployeeId: lopDeductions.EmployeeId,
                  lopMonth: lopDeductions.lopMonth,
                  empCode: lopDeductions.empCode,
                },
              });
              lopDeductions["ACTION_TYPE"] = "UPDATE";
            } else {
              lopDeductions["createdBy"] = req.userData.id;
              lopDeductions["createdAt"] = new Date();
              await db.lopDeductions.create(lopDeductions);
              lopDeductions["ACTION_TYPE"] = "CREATE";
            }
            successArray.push(lopDeductions);
          }
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
        msg: "Lop Uploaded Successfully.",
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
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
      let financialYearDetails = await db.financialYearMaster.findOne({ where : { 'year': value.selectedYear }, attributes: ['financialYearId'], raw: true }); 
      let ids = value.departmentId.split(",");
      let allEmployeeQuery = await paymentHelper.query(
        value.departmentId == 0 ? 5 : 6,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId,
        }
      );
      // console.log(allEmployeeQuery);
      const result = await db.sequelize.query(allEmployeeQuery);
      if (result[0].length == 0) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "No data to process.",
        });
      }


      // return respHelper(res, {
      //   status: 200,
      //   data: result,
      //   msg: "No data to process.",
      // });

      const employeeIds = result[0].map((employee) => employee.EmployeeId);
      let returnVAlue = await availableEmployeeForProcessing(
        employeeIds,
        value.paymonth
      );

      if (returnVAlue.length == 0) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "No data to process.",
        });
      }
      const newArray = result[0].filter((item) =>
        returnVAlue.avalialbleEmployees.includes(item.EmployeeId)
      );

      console.log(newArray);

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
        },
        { raw: true, attributes: ["payProcessAutoId", "payMonth"] }
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
      }));
      await db.payProcessDetails.bulkCreate(updatedArray).then((resp) => {
        // processSalary({
        //   processId: newProcess.dataValues.payProcessMasterAutoId,
        //   req,
        // });
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
