import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import validator from "../../../helper/validator.js";
import fnfHelper from "./fnfHelper.js";
import pkg from "xlsx";
import paymentHelper from "../payments/paymentHelper.js";
const dbName = process.env.DB_NAME;


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

      let employeeForProcessingQuery = await fnfHelper.query(
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
      let employeeForProcessingQuery =  `SELECT DISTINCT ejd.dateOfJoining, e.empCode AS empId, e.name AS empName FROM ${dbName}.employee e JOIN ${dbName}.paypackage p ON e.id = p.EmployeeId JOIN ${dbName}.employeejobdetails ejd ON e.id = ejd.userId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND p.payPackageAutoId IS NOT NULL AND e.companyId IN (${companyId}) AND e.isActive = 0 AND (YEAR(e.dateOfExit) < ${year} OR (YEAR(e.dateOfExit) = ${year} AND MONTH(e.dateOfExit) <= ${month}));`;
    
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
            let existDetails = await db.gratuityOverrides.findOne({
              where: {
                empCode: gratuityOverrides.empCode,
                payMonth: gratuityOverrides.payMonth,
              },
              raw: true,
            });
            if (existDetails) {
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
  
  async uploadLeaveEncashment(req, res) {
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
      var jsonArr = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];

      if (!jsonArr[0]["Employee ID"]) {
        return respHelper(res, {
          status: 400,
          msg: "Invalid File Format",
        });
      }

      for (const employeeTds of jsonArr) {
        if (employeeTds["Employee ID"]) {
          let employeeDetais = await db.employeeMaster.findOne({
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let obj = {
            EmployeeId: employeeDetais.id,
            leaveEncashmentDays: employeeTds["LEAVE ENCASHMENT DAYS"],
            payMonth: employeeTds["PAY Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.leaveEncashmentValidateSchama.validate(
            obj
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: obj.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existDetails = await db.leaveEncashmentOverrides.findOne({
              where: {
                empCode: obj.empCode,
                payMonth: obj.payMonth,
              },
              raw: true,
            });
            if (existDetails) {
              obj["updatedBy"] = req.userData.id;
              obj["updatedAt"] = new Date();

              await db.leaveEncashmentOverrides.update(obj, {
                where: {
                  EmployeeId: obj.EmployeeId,
                  payMonth: obj.payMonth,
                  empCode: obj.empCode,
                },
              });
              obj["ACTION_TYPE"] = "UPDATE";
            } else {
              obj["createdBy"] = req.userData.id;
              obj["createdAt"] = new Date();
              await db.leaveEncashmentOverrides.create(obj);
              obj["ACTION_TYPE"] = "CREATE";
            }
            successArray.push(obj);
          }
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
        msg: "Leave Encashment Uploaded Successfully.",
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async uploadPT(req, res) {
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
      var jsonArr = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];

      if (!jsonArr[0]["Employee ID"]) {
        return respHelper(res, {
          status: 400,
          msg: "Invalid File Format",
        });
      }

      for (const employeeTds of jsonArr) {
        if (employeeTds["Employee ID"]) {
          let employeeDetais = await db.employeeMaster.findOne({
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let obj = {
            EmployeeId: employeeDetais.id,
            ptAmount: employeeTds["PT AMOUNT"],
            ptMonth: employeeTds["PT Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.ptValidateSchama.validate(
            obj
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: obj.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existDetails = await db.PTOverrides.findOne({
              where: {
                empCode: obj.empCode,
                ptMonth: obj.ptMonth,
              },
              raw: true,
            });
            if (existDetails) {
              obj["updatedBy"] = req.userData.id;
              obj["updatedAt"] = new Date();

              await db.PTOverrides.update(obj, {
                where: {
                  EmployeeId: obj.EmployeeId,
                  ptMonth: obj.ptMonth,
                  empCode: obj.empCode,
                },
              });
              obj["ACTION_TYPE"] = "UPDATE";
            } else {
              obj["createdBy"] = req.userData.id;
              obj["createdAt"] = new Date();
              await db.PTOverrides.create(obj);
              obj["ACTION_TYPE"] = "CREATE";
            }
            successArray.push(obj);
          }
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
        msg: "Leave Encashment Uploaded Successfully.",
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async uploadLWF(req, res) {
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
      var jsonArr = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];

      if (!jsonArr[0]["Employee ID"]) {
        return respHelper(res, {
          status: 400,
          msg: "Invalid File Format",
        });
      }

      for (const employeeTds of jsonArr) {
        if (employeeTds["Employee ID"]) {
          let employeeDetais = await db.employeeMaster.findOne({
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let obj = {
            EmployeeId: employeeDetais.id,
            lwfAmount: employeeTds["LWF AMOUNT"],
            lwfMonth: employeeTds["LWF Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.lwfValidateSchama.validate(
            obj
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: obj.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existDetails = await db.LWFOverrides.findOne({
              where: {
                empCode: obj.empCode,
                lwfMonth: obj.lwfMonth,
              },
              raw: true,
            });
            if (existDetails) {
              obj["updatedBy"] = req.userData.id;
              obj["updatedAt"] = new Date();

              await db.LWFOverrides.update(obj, {
                where: {
                  EmployeeId: obj.EmployeeId,
                  lwfMonth: obj.lwfMonth,
                  empCode: obj.empCode,
                },
              });
              obj["ACTION_TYPE"] = "UPDATE";
            } else {
              obj["createdBy"] = req.userData.id;
              obj["createdAt"] = new Date();
              await db.LWFOverrides.create(obj);
              obj["ACTION_TYPE"] = "CREATE";
            }
            successArray.push(obj);
          }
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
        msg: "LWF Uploaded Successfully.",
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async uploadNoticeRecovery(req, res) {
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
      var jsonArr = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];

      if (!jsonArr[0]["Employee ID"]) {
        return respHelper(res, {
          status: 400,
          msg: "Invalid File Format",
        });
      }

      for (const employeeTds of jsonArr) {
        if (employeeTds["Employee ID"]) {
          let employeeDetais = await db.employeeMaster.findOne({
            where: { empCode: employeeTds["Employee ID"], isActive: 1 },
            raw: true,
            attributes: ["empCode", "id"],
          });

          if (!employeeDetais) {
            continue;
          }

          let obj = {
            EmployeeId: employeeDetais.id,
            recoveryDays: employeeTds["RECOVERY DAYS"],
            payMonth: employeeTds["PAY Month (YYYY-MM)"],
            empCode: employeeTds["Employee ID"],
          };
          const { error } = await validator.noticeRecoveryValidateSchama.validate(
            obj
          );
          if (error) {
            errorArray.push({
              index: errorArray.length + 1,
              error: error.details[0].message,
              employeeID: obj.empCode,
            });
            // return respHelper(res, {
            //   status: 400,
            //   msg: error.details[0],
            // });
          } else {
            let existDetails = await db.noticeRecoveryOverrides.findOne({
              where: {
                empCode: obj.empCode,
                payMonth: obj.payMonth,
              },
              raw: true,
            });
            if (existDetails) {
              obj["updatedBy"] = req.userData.id;
              obj["updatedAt"] = new Date();

              await db.noticeRecoveryOverrides.update(obj, {
                where: {
                  EmployeeId: obj.EmployeeId,
                  payMonth: obj.payMonth,
                  empCode: obj.empCode,
                },
              });
              obj["ACTION_TYPE"] = "UPDATE";
            } else {
              obj["createdBy"] = req.userData.id;
              obj["createdAt"] = new Date();
              await db.noticeRecoveryOverrides.create(obj);
              obj["ACTION_TYPE"] = "CREATE";
            }
            successArray.push(obj);
          }
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
        msg: "Notice Recovery Uploaded Successfully.",
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async gratuitySyncing(req, res) {
    try {
      const { error, value } = validator.employeesForPayrollProcess.validate(req.body);
      if(error) {
        return respHelper(res, { status: 400, msg: error.details[0] });
      }   
      let ids = value.departmentId.split(",");

      let allEmployeeQuery = await fnfHelper.query(
        value.departmentId == 0 ? 6 : 5,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId
        }
      );

      const result = await db.sequelize.query(allEmployeeQuery);
      if(result[0].length == 0) {
        return respHelper(res, { status: 400, msg: "No data to progress.", data: [] });
      }
      const employeeIds = result[0].map((employee) => employee.EmployeeId);
      let returnValue = await availableEmployeeForProcessing(employeeIds, value.paymonth);

      var totalGratuityDays = 0,
          uniqueEmployeeImpacted = 0;
      let allGratuityQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(gratuityDays) AS gratuityDays from ${dbName}.gratuityoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND payMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;
      
      let gratuities = await db.sequelize.query(allGratuityQuery);

      for(const singleEmployee of gratuities[0]) {
        totalGratuityDays += parseFloat(singleEmployee.gratuityDays || 0);
        uniqueEmployeeImpacted = singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted 
      }

      return respHelper(res, { status: 200, 
        data: {
          impactedEmployee: uniqueEmployeeImpacted,
          gratuityDays: totalGratuityDays.toFixed(2),
          impactedEmployeeDetails: gratuities[0] 
        }
      })
    }
    catch(error) {
      console.log(error);
      return respHelper(res, { status: 500 });
    }
  }

  async leaveEncashmentSyncing(req, res) {
    try {
      const { error, value } = validator.employeesForPayrollProcess.validate(req.body);
      if(error) {
        return respHelper(res, { status: 400, msg: error.details[0] });
      }   
      let ids = value.departmentId.split(",");

      let allEmployeeQuery = await fnfHelper.query(
        value.departmentId == 0 ? 6 : 5,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId
        }
      );

      const result = await db.sequelize.query(allEmployeeQuery);
      if(result[0].length == 0) {
        return respHelper(res, { status: 400, msg: "No data to progress.", data: [] });
      }
      const employeeIds = result[0].map((employee) => employee.EmployeeId);
      let returnValue = await availableEmployeeForProcessing(employeeIds, value.paymonth);

      var totalLeaveEncashmentDays = 0,
          uniqueEmployeeImpacted = 0;
      let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(leaveEncashmentDays) AS leaveEncashmentDays from ${dbName}.leavencashmentoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND payMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;
      
      let allData = await db.sequelize.query(finalQuery);

      for(const singleEmployee of allData[0]) {
        totalLeaveEncashmentDays += parseFloat(singleEmployee.leaveEncashmentDays || 0);
        uniqueEmployeeImpacted = singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted 
      }

      return respHelper(res, { status: 200, 
        data: {
          impactedEmployee: uniqueEmployeeImpacted,
          leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
          impactedEmployeeDetails: allData[0] 
        }
      })
    }
    catch(error) {
      console.log(error);
      return respHelper(res, { status: 500 });
    }
  }

  async PTSyncing(req, res) {
    try {
      const { error, value } = validator.employeesForPayrollProcess.validate(req.body);
      if(error) {
        return respHelper(res, { status: 400, msg: error.details[0] });
      }   
      let ids = value.departmentId.split(",");

      let allEmployeeQuery = await fnfHelper.query(
        value.departmentId == 0 ? 6 : 5,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId
        }
      );

      const result = await db.sequelize.query(allEmployeeQuery);
      if(result[0].length == 0) {
        return respHelper(res, { status: 400, msg: "No data to progress.", data: [] });
      }
      const employeeIds = result[0].map((employee) => employee.EmployeeId);
      let returnValue = await availableEmployeeForProcessing(employeeIds, value.paymonth);

      var totalLeaveEncashmentDays = 0,
          uniqueEmployeeImpacted = 0;
      let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(ptAmount) AS ptAmount from ${dbName}.ptoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND ptMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;
      
      let allData = await db.sequelize.query(finalQuery);

      for(const singleEmployee of allData[0]) {
        totalLeaveEncashmentDays += parseFloat(singleEmployee.leaveEncashmentDays || 0);
        uniqueEmployeeImpacted = singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted 
      }

      return respHelper(res, { status: 200, 
        data: {
          impactedEmployee: uniqueEmployeeImpacted,
          leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
          impactedEmployeeDetails: allData[0] 
        }
      })
    }
    catch(error) {
      console.log(error);
      return respHelper(res, { status: 500 });
    }
  }

  async LWFSyncing(req, res) {
    try {
      const { error, value } = validator.employeesForPayrollProcess.validate(req.body);
      if(error) {
        return respHelper(res, { status: 400, msg: error.details[0] });
      }   
      let ids = value.departmentId.split(",");

      let allEmployeeQuery = await fnfHelper.query(
        value.departmentId == 0 ? 6 : 5,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId
        }
      );

      const result = await db.sequelize.query(allEmployeeQuery);
      if(result[0].length == 0) {
        return respHelper(res, { status: 400, msg: "No data to progress.", data: [] });
      }
      const employeeIds = result[0].map((employee) => employee.EmployeeId);
      let returnValue = await availableEmployeeForProcessing(employeeIds, value.paymonth);

      var totalLeaveEncashmentDays = 0,
          uniqueEmployeeImpacted = 0;
      let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(lwfAmount) AS lwfAmount from ${dbName}.lwfoverrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND lwfMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;
      
      let allData = await db.sequelize.query(finalQuery);

      for(const singleEmployee of allData[0]) {
        totalLeaveEncashmentDays += parseFloat(singleEmployee.leaveEncashmentDays || 0);
        uniqueEmployeeImpacted = singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted 
      }

      return respHelper(res, { status: 200, 
        data: {
          impactedEmployee: uniqueEmployeeImpacted,
          leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
          impactedEmployeeDetails: allData[0] 
        }
      })
    }
    catch(error) {
      console.log(error);
      return respHelper(res, { status: 500 });
    }
  }

  async noticeRecoverySyncing(req, res) {
    try {
      const { error, value } = validator.employeesForPayrollProcess.validate(req.body);
      if(error) {
        return respHelper(res, { status: 400, msg: error.details[0] });
      }   
      let ids = value.departmentId.split(",");

      let allEmployeeQuery = await fnfHelper.query(
        value.departmentId == 0 ? 6 : 5,
        value.processingType,
        {
          departmentId: ids,
          paymonth: value.paymonth,
          companyId: value.companyId
        }
      );

      const result = await db.sequelize.query(allEmployeeQuery);
      if(result[0].length == 0) {
        return respHelper(res, { status: 400, msg: "No data to progress.", data: [] });
      }
      const employeeIds = result[0].map((employee) => employee.EmployeeId);
      let returnValue = await availableEmployeeForProcessing(employeeIds, value.paymonth);

      var totalLeaveEncashmentDays = 0,
          uniqueEmployeeImpacted = 0;
      let finalQuery = `SELECT EmployeeId, empCode, COUNT(DISTINCT EmployeeId) AS uniqueEmployeeImpacted, SUM(recoveryDays) AS recoveryDays from ${dbName}.noticerecoveryovrrides WHERE EmployeeId IN (${returnValue.avalialbleEmployees}) AND payMonth = "${value.paymonth}" GROUP BY EmployeeId, empCode;`;
      
      let allData = await db.sequelize.query(finalQuery);

      for(const singleEmployee of allData[0]) {
        totalLeaveEncashmentDays += parseFloat(singleEmployee.leaveEncashmentDays || 0);
        uniqueEmployeeImpacted = singleEmployee.uniqueEmployeeImpacted + uniqueEmployeeImpacted 
      }

      return respHelper(res, { status: 200, 
        data: {
          impactedEmployee: uniqueEmployeeImpacted,
          leaveEncashmentDays: totalLeaveEncashmentDays.toFixed(2),
          impactedEmployeeDetails: allData[0] 
        }
      })
    }
    catch(error) {
      console.log(error);
      return respHelper(res, { status: 500 });
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
    let queryForInProcess = await fnfHelper.query(
      3,
      employeeIds,
      paymonth
    );
    let queryForProcessed = await fnfHelper.query(
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