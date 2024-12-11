// import db from "../../../config/db.config.js";
// import respHelper from '../../../helper/respHelper.js'

// class PaymentController {
//     async payElements(req, res) {
//         try {
//             const user = req.query.user

//             const payElementsData = await db.payElements.findAll({
//                 where: {
//                     EmployeeId: (user) ? user : req.userId
//                 },
//                 attributes: { exclude: ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', 'isActive'] },
//                 include: [{
//                     model: db.salaryComponent,
//                     attributes: { exclude: ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', 'isActive'] },
//                 }]
//             })

//             return respHelper(res, {
//                 status: 200,
//                 data: payElementsData
//             })
//         } catch (error) {
//             console.log(error)
//             return respHelper(res, {
//                 status: 500
//             })
//         }
//     }

//     async paySlips(req, res) {
//         try {
//             const user = req.query.user
//             const financialYear = req.query.financialYear

//             const paySlip = await db.paySlips.findAll({
//                 where:
//                 {
//                     EmployeeId: (user) ? user : req.userId,
//                     paySlipFinancialYear: financialYear
//                 },
//                 order: [['createdAt', 'desc']],
//                 attributes: { exclude: ['createdAt', 'createdBy'] },
//                 include: [{
//                     model: db.employeeMaster,
//                     attributes: ['name', 'empCode', 'email', 'designation_id', 'departmentId', 'panNo', 'esicNo', 'uanNo', 'pfNo', 'employeeType'],
//                     include: [{
//                         model: db.departmentMaster,
//                         required: true,
//                         attributes: ["departmentCode", "departmentName"]
//                     },
//                     {
//                         model: db.designationMaster,
//                         required: false,
//                         attributes: ['name']
//                     },
//                     {
//                         model: db.jobDetails,
//                         attributes: ['dateOfJoining']
//                     }
//                     ]
//                 },
//                 {
//                     model: db.paySlipComponent,
//                     attributes: { exclude: ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', 'isActive'] },
//                 }]
//             })

//             return respHelper(res, {
//                 status: 200,
//                 data: paySlip
//             })

//         } catch (error) {
//             console.log(error)
//             return respHelper(res, {
//                 status: 500
//             })
//         }
//     }

//     async payPackage(req, res) {
//         try {
//             const user = req.query.user
//             const financialYear = req.query.financialYear

//             const payPackage = await db.payPackage.findAll({
//                 where: {
//                     EmployeeId: (user) ? user : req.userId,
//                     payPackageFinancialYear: financialYear
//                 },
//                 order: [['createdAt', 'desc']],
//                 attributes: { exclude: ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', 'isActive'] },
//             })

//             return respHelper(res, {
//                 status: 200,
//                 data: payPackage
//             })

//         } catch (error) {
//             console.log(error)
//             return respHelper(res, {
//                 status: 500
//             })
//         }
//     }

//     async ctcProration(req, res) {
//         try {
//             const payPackageAutoId = req.query.payPackageAutoId

//             const payElements = await db.payElements.findAll({
//                 where: {
//                     payPackageAutoId
//                 },
//                 include: [{
//                     model: db.salaryComponent,
//                     attributes: { exclude: ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', 'isActive'] },
//                 }],
//                 attributes: { exclude: ['createdAt', 'createdBy', 'updatedBy', 'updatedAt', 'isActive'] },
//             })

//             return respHelper(res, {
//                 status: 200,
//                 data: payElements
//             })

//         } catch (error) {
//             console.log(error)
//             return respHelper(res, {
//                 status: 500
//             })
//         }
//     }
// }

// export default new PaymentController();

import { Op, where } from "sequelize";
import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import pkg from "xlsx";
import validator from "../../../helper/validator.js";
import { raw } from "express";
import message from "../../../constant/messages.js";
import Employee from "../../model/Employee.js";
import paymentHelper from "./paymentHelper.js";
import helper from "../../../helper/helper.js";
import Sequelize from "sequelize";
import { parse } from "dotenv";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PaymentController {
  async payElements(req, res) {
    try {
      const user = req.query.user;

      const payElementsData = await db.payElements.findAll({
        where: {
          EmployeeId: user ? user : req.userId,
        },
        attributes: {
          exclude: [
            "createdAt",
            "createdBy",
            "updatedBy",
            "updatedAt",
            "isActive",
          ],
        },
        include: [
          {
            model: db.salaryComponent,
            attributes: {
              exclude: [
                "createdAt",
                "createdBy",
                "updatedBy",
                "updatedAt",
                "isActive",
              ],
            },
            where: {
              salaryComponentEarningType: { [Op.ne]: ["Deduction"] },
            },
            order: ["includeInPackage", "DESC"],
            as: "salarycomponent",
          },
        ],
      });

      return respHelper(res, {
        status: 200,
        data: payElementsData,
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async paySlips(req, res) {
    try {
      const user = req.query.user;
      const financialYear = req.query.financialYear;

      const paySlip = await db.paySlips.findAll({
        where: {
          EmployeeId: user ? user : req.userId,
          paySlipFinancialYear: financialYear,
          paySlipStatus: 1,
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

      return respHelper(res, {
        status: 200,
        data: paySlip,
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async payPackage(req, res) {
    try {
      const user = req.query.user;
      const financialYear = req.query.financialYear;

      const payPackage = await db.payPackage.findAll({
        where: {
          EmployeeId: user ? user : req.userId,
          payPackageFinancialYear: financialYear,
        },
        order: [["createdAt", "desc"]],
        attributes: {
          exclude: [
            "createdAt",
            "createdBy",
            "updatedBy",
            "updatedAt",
            "isActive",
          ],
        },
      });

      return respHelper(res, {
        status: 200,
        data: payPackage,
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async ctcProration(req, res) {
    try {
      const payPackageAutoId = req.query.payPackageAutoId;
      const payElements = await db.payElements.findAll({
        where: {
          payPackageAutoId,
        },
        include: [
          {
            model: db.salaryComponent,
            attributes: {
              exclude: [
                "createdAt",
                "createdBy",
                "updatedBy",
                "updatedAt",
                "isActive",
              ],
            },
            where: {
              salaryComponentEarningType: { [Op.ne]: ["Deduction"] },
            },
            as: "salarycomponent",
          },
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
      });

      return respHelper(res, {
        status: 200,
        data: payElements,
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }
  //////////////////////////Payroll working//////////////////
  async componentElementMapping(req, res) {
    try {
      var currentRecord = 0;
      if (!req.file) {
        return respHelper(res, {
          status: 400,
          msg: "File is required!",
        });
      } else {
        const workbookEmployee = pkg.readFile(req.file.path);
        const sheetNameEmployee = workbookEmployee.SheetNames[0];
        const Employees = pkg.utils.sheet_to_json(
          workbookEmployee.Sheets[sheetNameEmployee]
        );
        const { error } =
          await validator.importMappingForComponentAndElement.validate(
            Employees
          );
        if (error) {
          return respHelper(res, {
            status: 400,
            msg: error,
          });
        } else {
          for (const element of Employees) {
            let currentMapping = await db.salaryComponentElementMapping.findAll(
              {
                where: {
                  salaryComponentAutoId: element.salaryComponentAutoId,
                  salaryComponentElementAutoId:
                    element.salaryComponentElementAutoId,
                },
              }
            );
            if (currentMapping.length == 0) {
              currentRecord = currentRecord + 1;
              await db.salaryComponentElementMapping.create(element);
            }
          }

          return respHelper(res, {
            status: 200,
            data: "Total " + currentRecord + " records have been updated.",
          });
        }
      }
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async getExistingSalaryStrutures(req, res) {
    try {
      const { error } = await validator.salaryStructureListSchema.validate(
        req.body
      );
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error,
        });
      }
      let { structureType, salaryStructureAutoId } = req.body;
      let query =
        structureType == "LIST"
          ? {
              where: {
                isActive: 1,
              },
              include: [
                {
                  model: db.employeeMaster,
                  attributes: ["name", "empCode"],
                  as: "salaryStructureCreater",
                },
                {
                  model: db.employeeMaster,
                  attributes: ["name", "empCode"],
                  as: "salaryStructureUpdater",
                },
              ],
            }
          : {
              where: {
                salaryStructureAutoId: salaryStructureAutoId,
              },
              attributes: [
                "salaryStructureName",
                "salaryStructureDes",
                "salaryStructureAutoId",
                "hasVariable",
                "hasMonthlyProration",
                "hasAnnuallyProration",
              ],
              include: [
                {
                  model: db.salarystructurecomponentmapping,
                  attributes: [
                    "salaryComponentAutoId",
                    "salaryStructureAutoId",
                    "salaryStructurecomponentmappingAutoId",
                  ],
                  as: "structureMappingDetails",
                  include: [
                    {
                      model: db.salaryComponent,
                      attributes: [
                        "salaryComponentCode",
                        "salaryComponentAlias",
                        "salaryComponentEarningType",
                      ],
                      as: "componentDetails",
                    },
                    {
                      model: db.salarycomponentmapping,
                      attributes: [
                        "salaryComponentElementAutoId",
                        "salaryComponentAutoId",
                        "elementValue",
                      ],
                      as: "componentMappedDetails",
                      include: [
                        {
                          model: db.salarycomponentelement,
                          attributes: [
                            "salaryComponentElementAutoId",
                            "salaryComponentElementName",
                            "salaryComponentElementCode",
                          ],
                          as: "componentElementDetails",
                        },
                      ],
                    },
                  ],
                },
              ],
            };
      const uniqueEntries = await db.salaryStructure.findAll(query);

      return respHelper(res, {
        status: 200,
        data: uniqueEntries,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async createSalaryStructure(req, res) {
    try {
      const { error } = await validator.salaryStructureCreateSchema.validate(
        req.body.data
      );
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }

      let requestedObject = req.body.data,
        responseObject,
        respMessage;
      //Checking for exising Salary Structure.....
      let existingSalaryStructure = await db.salaryStructure.findAll({
        where: {
          salaryStructureAutoId: requestedObject.salaryStructureAutoId,
        },
        raw: true,
      });
      ///////////////Updating Salary Structure.//////////////////
      if (existingSalaryStructure.length > 0) {
        responseObject = await db.salaryStructure.update(
          {
            salaryStructureName: requestedObject.salaryStructureName,
            salaryStructureDes: requestedObject.salaryStructureDes,
            updatedBy: req.userData.id,
            updatedAt: new Date(),
            isActive: requestedObject.isActive,
            hasAnnuallyProration: requestedObject.hasAnnuallyProration,
            hasMonthlyProration: requestedObject.hasMonthlyProration,
            hasVariable: requestedObject.hasVariable,
          },
          {
            where: {
              salaryStructureAutoId: requestedObject.salaryStructureAutoId,
            },
          }
        );
        respMessage = "Salary Structure Updated";
      } else {
        responseObject = await db.salaryStructure.create({
          salaryStructureName: requestedObject.salaryStructureName,
          salaryStructureDes: requestedObject.salaryStructureName,
          isActive: requestedObject.isActive,
          createdAt: new Date(),
          createdBy: req.userData.id,
          hasAnnuallyProration: requestedObject.hasAnnuallyProration,
          hasMonthlyProration: requestedObject.hasMonthlyProration,
          hasVariable: requestedObject.hasVariable,
        });
        respMessage = "New Salary Structure Created";
      }
      for (const element of requestedObject.structureMappingDetails) {
        console.log(responseObject);

        let salaryStructureAutoId =
          existingSalaryStructure.length == 0
            ? responseObject.dataValues.salaryStructureAutoId
            : requestedObject.salaryStructureAutoId;
        let salryStructureComponentMapping =
          await db.salarystructurecomponentmapping.findAll({
            where: {
              salaryComponentAutoId: element.salaryComponentAutoId,
              salaryStructureAutoId: salaryStructureAutoId,
            },
            raw: true,
          });
        ///////////////Updating Salary Structure.//////////////////
        if (salryStructureComponentMapping.length > 0) {
          let existingElementMapped = await db.salarycomponentmapping.findAll({
            where: {
              salaryStructurecomponentmappingAutoId:
                salryStructureComponentMapping[0]
                  .salaryStructurecomponentmappingAutoId,
              salaryComponentElementAutoId:
                element.salaryComponentElementAutoId,
            },
            raw: true,
          });

          if (existingElementMapped.length == 0) {
            await db.salarycomponentmapping.create({
              salaryComponentAutoId:
                salryStructureComponentMapping[0].salaryComponentAutoId,
              salaryStructurecomponentmappingAutoId:
                salryStructureComponentMapping[0]
                  .salaryStructurecomponentmappingAutoId,
              elementValue: element.elementValue,
              salaryComponentElementAutoId:
                element.salaryComponentElementAutoId,
            });
          } else {
            await db.salarycomponentmapping.update(
              {
                salaryComponentAutoId:
                  salryStructureComponentMapping[0].salaryComponentAutoId,
                elementValue: element.elementValue,
                salaryComponentElementAutoId:
                  element.salaryComponentElementAutoId,
              },
              {
                where: {
                  salaryStructurecomponentmappingAutoId:
                    salryStructureComponentMapping[0]
                      .salaryStructurecomponentmappingAutoId,
                  salaryComponentElementAutoId:
                    element.salaryComponentElementAutoId,
                },
              }
            );
          }
        } else {
          let mappedSalaryComponent =
            await db.salarystructurecomponentmapping.create({
              salaryComponentAutoId: element.salaryComponentAutoId,
              salaryStructureAutoId: salaryStructureAutoId,
            });
          await db.salarycomponentmapping.create({
            salaryComponentAutoId:
              mappedSalaryComponent.dataValues.salaryComponentAutoId,
            salaryStructurecomponentmappingAutoId:
              mappedSalaryComponent.dataValues
                .salaryStructurecomponentmappingAutoId,
            elementValue: element.elementValue,
            salaryComponentElementAutoId: element.salaryComponentElementAutoId,
          });
        }
      }

      return respHelper(res, {
        status: 200,
        data: responseObject,
        msg: respMessage,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getSalaryComponentList(req, res) {
    try {
      let requestedObject = req.body.data,
        responseObject,
        respMessage;
      //Checking for exising Salary Structure.....
      let existingSalaryComponents = await db.salaryComponent.findAll({
        where: {
          isActive: 1,
        },
        attributes: [
          "salaryComponentCode",
          "salaryComponentAutoId",
          "salaryComponentAlias",
          "salaryComponentTaxComputationGroup",
          "salaryComponentItDeclaration",
          "salaryComponentEarningType",
        ],
        raw: true,
      });
      ///////////////Updating Salary Structure.//////////////////
      return respHelper(res, {
        status: 200,
        data: existingSalaryComponents,
        msg: "Salary Component List",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getDefaultSalaryStructure(req, res) {
    try {
      const defaultComponent = await db.salaryComponent.findAll({
        where: {
          isDefault: 1,
        },
        order: [["compulsoryComponent", "DESC"]],
      });

      const defaultComponentElement = await db.salarycomponentelement.findAll({
        where: { isDefault: 1 },
      });

      const salaryStructure = {
        salaryStructureAutoId: 0,
        salaryStructureName: "",
        salaryStructureDes: "",
        createdAt: 0,
        createdBy: "0",
        updatedBy: "0",
        updatedAt: 0,
        isActive: 1,
        structureMappingDetails: [],
      };

      defaultComponent.forEach((component) => {
        if (component.isActive) {
          // Only include active components
          const mappingDetail = {
            salaryComponentAutoId: component.salaryComponentAutoId,
            salaryStructureAutoId: salaryStructure.salaryStructureAutoId,
            salaryStructurecomponentmappingAutoId: 1, // Assuming static for example
            componentDetails: {
              salaryComponentCode: component.salaryComponentCode,
              salaryComponentAlias: component.salaryComponentAlias, // Assuming empty as per your requirement
              salaryComponentEarningType: component.salaryComponentEarningType,
              compulsoryComponent: component.compulsoryComponent,
            },
            componentMappedDetails: [],
          };

          // Create component mapping details based on your needs
          defaultComponentElement.forEach((element) => {
            if (element.isActive) {
              // Only include active elements
              mappingDetail.componentMappedDetails.push({
                salaryComponentElementAutoId:
                  element.salaryComponentElementAutoId,
                salaryComponentAutoId: component.salaryComponentAutoId,
                elementValue: "0", // Assuming static value
                componentElementDetails: {
                  salaryComponentElementAutoId:
                    element.salaryComponentElementAutoId,
                  salaryComponentElementName:
                    element.salaryComponentElementName,
                  salaryComponentElementCode:
                    element.salaryComponentElementCode,
                },
              });
            }
          });

          salaryStructure.structureMappingDetails.push(mappingDetail);

          //console.log(salaryStructure.structureMappingDetails);
        }
      });
      return respHelper(res, {
        status: 200,
        data: [salaryStructure],
      });
    } catch (e) {
      console.log(e);
    }
  }

  async uploadCTC(req, res) {
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
      var Employees = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      // console.log(Employees);
      let errorArray = [],
        successArray = [];
      for (const employee of Employees) {
        // console.log(employee);
        let employeeDetails = await db.employeeMaster.findOne({
          where: {
            empCode: employee["Email/Employee ID"],
          },
          raw: true,
          attributes: ["id", "name"],
        });

        if (!employeeDetails) {
          console.log(
            "Empoyee not found" +
              " for empId : " +
              employee["Email/Employee ID"]
          );
          errorArray.push({
            index: errorArray.length + 1,
            employeeID: employee["Email/Employee ID"],
            errorDetails: "Empoyee not found",
          });
          continue;
        }

        let structureDetails = await db.salaryStructure.findAll({
          where: {
            salaryStructureName: employee["Salary Structure"],
          },
          raw: true,
          attributes: ["salaryStructureName", "salaryStructureAutoId"],
          include: [
            {
              model: db.salarystructurecomponentmapping,
              attributes: [
                "salaryComponentAutoId",
                "salaryStructureAutoId",
                "salaryStructurecomponentmappingAutoId",
              ],
              as: "structureMappingDetails",
              include: [
                {
                  model: db.salaryComponent,
                  attributes: [
                    "salaryComponentCode",
                    "salaryComponentAlias",
                    "includeInPackage",
                  ],
                  as: "componentDetails",
                },
              ],
            },
          ],
        });

        const error = await validator.createDynamicPayPackageSchema(
          structureDetails,
          employee
        );
        if (error) {
          console.log(
            error.details[0].message +
              " for empId : " +
              employee["Email/Employee ID"] +
              " --- " +
              employee["Effective Date"]
          );
          errorArray.push({
            index: errorArray.length + 1,
            employeeID: employee["Email/Employee ID"],
            errorDetails: error.details[0].message,
          });
          continue;
        }
        //////////////Pay-Package Uploading///////////
        var ctcFromComponent = 0;
        for (const element of structureDetails) {
          let componentName = element[
            "structureMappingDetails.componentDetails.salaryComponentAlias"
          ]
            ? element[
                "structureMappingDetails.componentDetails.salaryComponentAlias"
              ]
            : element[
                "structureMappingDetails.componentDetails.salaryComponentCode"
              ];
          let includeInPackage =
            element[
              "structureMappingDetails.componentDetails.includeInPackage"
            ];
          if (includeInPackage == 1) {
            ctcFromComponent = ctcFromComponent + employee[componentName];
          }
        }
        //console.log(employee['Name']+"--"+employee['CTC'],ctcFromComponent)
        if (employee["CTC"] == ctcFromComponent) {
          ////////////////Match the ctc///////
          //console.log('CTC Matched',employee['Name']);
          let existingPackage = await db.payPackage.findOne({
            where: { EmployeeId: employeeDetails.id },
            order: [["payPackageAutoId", "DESC"]],
            raw: true,
          });
          const [day, month, year] = employee["Effective Date"]
            .split("-")
            .map(Number);
          if (
            existingPackage &&
            new Date(existingPackage.payPackageEffectiveDate) >=
              new Date(year, month - 1, day)
          ) {
            // console.log(
            //   "Current Effective-Date can not be greater/ equal than last effective date ",
            //   employee["Name"]
            // );
            errorArray.push({
              index: errorArray.length + 1,
              employeeID: employee["Email/Employee ID"],
              errorDetails:
                "Current Effective-Date can not be greater than last effective date ",
            });
            continue;
          } else {
            let packageInserted = await db.payPackage.create(
              {
                EmployeeId: employeeDetails.id,
                payPackageFinancialYear: "2024-25",
                payPackageEffectiveDate: formatDate(year, month, day), //new Date(year, month - 1, day),
                payPackageMonthlyCTC: employee["CTC"],
                payPackageSalaryStructure: employee["Salary Structure"],
                payPackageTotalCTC: employee["CTC"],
                payPackageType: "Monthly",
                createdBy: req.userData.id,
                createdAt: new Date(),
                isActive: 1,
              },
              { raw: true }
            );

            for (const salaryComponent of structureDetails) {
              let componentName = salaryComponent[
                "structureMappingDetails.componentDetails.salaryComponentAlias"
              ]
                ? salaryComponent[
                    "structureMappingDetails.componentDetails.salaryComponentAlias"
                  ]
                : salaryComponent[
                    "structureMappingDetails.componentDetails.salaryComponentCode"
                  ];

              let exisingPayElement = await db.payElements.findAll({
                where: {
                  EmployeeId: employee["Email/Employee ID"],
                  payPackageAutoId: packageInserted.dataValues.payPackageAutoId,
                  salaryComponentAutoId:
                    salaryComponent[
                      "structureMappingDetails.componentDetails.salaryComponentAutoId"
                    ],
                },
              });
              if (
                exisingPayElement.length == 0 &&
                employee[componentName] > 0
              ) {
                let insertedNewElement = await db.payElements.create({
                  EmployeeId: employeeDetails.id,
                  salaryComponentAutoId:
                    salaryComponent[
                      "structureMappingDetails.componentDetails.salaryComponentAutoId"
                    ],
                  payPackageAutoId: packageInserted.dataValues.payPackageAutoId,
                  payElementAmount: employee[componentName],
                  payElementEffectiveFrom: formatDate(year, month, day),
                  payElementEffectiveTo: formatDate(year, month, day),
                  createdBy: req.userData.id,
                  createdAt: new Date(),
                  isActive: 1,
                });
                //console.log(insertedNewElement);
              }
            }
            successArray.push({
              index: successArray.length + 1,
              employeeID: employee["Email/Employee ID"],
              successDetails: "CTC Uploaded Successfully",
            });
          }
        } else {
          errorArray.push({
            index: errorArray.length + 1,
            employeeID: employee["Email/Employee ID"],
            errorDetails: "CTC not matched with component",
          });
          ////////////////Do not Matched the ctc///////
          // console.log("CTC Not Matched", employee["Name"]);
        }
      }
      return respHelper(res, {
        status: 200,
        data: { successArray, errorArray },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async initiateSalary(req, res) {
    try {
      const { error, value } =
        await validator.employeesForPayrollProcess.validate(req.body);
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }
      let allEmployeeQuery = `SELECT e.id,e.name FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.departmentId IN (${value.departmentId.split(
        ","
      )}) AND ppd.payProcessDetailAutoId IS NULL;`;
      const result = await db.sequelize.query(allEmployeeQuery);

      let newProcess = await db.payProcessMaster.create(
        {
          name: "Initial Process",
          description: "Initial Procesd Details Description",
          status: 1,
          payMonth: req.body.paymonth,
          createdBy: req.userData.id,
          createdAt: new Date(),
          isActive: 1,
          processFlowId: 1,
          companyId: 1,
        },
        { raw: true, attributes: ["payProcessAutoId", "payMonth"] }
      );
      const updatedArray = result[0].map((item) => ({
        EmployeeId: item.id,
        EmployeeName: item.name,
        createdBy: req.userData.id,
        createdAt: new Date(),
        proceessId: newProcess.dataValues.payProcessMasterAutoId,
        payStatus: 1,
        isActive: 1,
        payRemark: "Salary Initiated",
        salaryMonth: newProcess.dataValues.payMonth,
      }));
      await db.payProcessDetails.bulkCreate(updatedArray).then((resp) => {
        processSalary({
          processId: newProcess.dataValues.payProcessMasterAutoId,
          req,
        });
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

  async processSalaryAPI(req, res) {
    let { processId } = req.body;
    var errorArray = [];
    let queryForAllExecutableEmployee = `SELECT pm.payMonth, pd.* FROM payProcessDetails pd JOIN  payProcessMaster pm ON pd.proceessId = pm.payProcessMasterAutoId Where pm.payProcessMasterAutoId= ${processId} AND pd.payStatus in (1);`;
    const result = await db.sequelize.query(queryForAllExecutableEmployee);
    if (result[0].length == 0) {
      return respHelper(res, {
        status: 400,
        data: [],
        msg: "No data to process.",
      });
    }
    const employeeIds = result[0].map((item) => item.EmployeeId);
    const totalWorkingDays = paymentHelper.getDaysInCurrentMonth({
      year: result[0][0].payMonth.split("-")[0],
      month: result[0][0].payMonth.split("-")[1],
    });
    const salaryRegisterArray = [],
      errorProcessed = [];
    let employees = [484, 560]; //employeeIds
    for (const employee of employees) {
      const queryForEmployeePayDetails = await paymentHelper.query(
        11,
        employee,
        { payMonth: result[0][0].payMonth }
      );
      const employeeDetailsComponentWise = await db.sequelize.query(
        queryForEmployeePayDetails
      );
      const queryForExtraDeductions = await paymentHelper.query(
        14,
        employee,
        result[0][0].payMonth
      );
      const extraDeductonsDetails = await db.sequelize.query(
        queryForExtraDeductions
      );

      const lopMonthWiseCalculation =
        employeeDetailsComponentWise.length > 0
          ? employeeDetailsComponentWise[0][0].payPackageMonthlyCTC
            ? (
                (employeeDetailsComponentWise[0][0].payPackageMonthlyCTC /
                  totalWorkingDays) *
                employeeDetailsComponentWise[0][0].lopDays
              ).toFixed(2)
            : "0.00"
          : "0.00";

      const deductionOfLopMonthAmount = Math.max(
        0,
        parseFloat(employeeDetailsComponentWise[0][0].payPackageMonthlyCTC) -
          lopMonthWiseCalculation
      );
      const currentMonth = new Date()
        .toLocaleString("default", { month: "short" })
        .toLowerCase();
      const ptDynamicAttribute = [currentMonth, "ptAmount"];
      const lwfDynamicAttribute = [currentMonth, "lwfAmount"];

      const ptDeducationDetails = await db.employeeMaster.findOne({
        attributes: ["id", "empCode"],
        where: { id: employee },
        raw: true,
        nest: true,
        include: [
          {
            model: db.ptLocationMaster,
            attributes: ["ptLocationId", "ptLocationCode", "stateId"],
            include: [
              {
                model: db.ptMapping,
                attributes: [
                  "ptmappingId",
                  "minValue",
                  "maxValue",
                  ptDynamicAttribute,
                ],
                required: false,
                where: {
                  [Op.and]: [
                    { minValue: { [Op.lte]: deductionOfLopMonthAmount } },
                    { maxValue: { [Op.gte]: deductionOfLopMonthAmount } },
                  ],
                },
              },
            ],
          },
        ],
      });

      const lwfDeducationDetails = await db.employeeMaster.findOne({
        attributes: ["id", "empCode"],
        where: { id: employee },
        raw: true,
        nest: true,
        include: [
          {
            model: db.lwfDesignationMaster,
            attributes: ["lwfDesignationId"],
            include: [
              {
                model: db.lwfMapping,
                attributes: ["lwfmappingId", lwfDynamicAttribute],
              },
            ],
          },
        ],
      });
      const extraPaymentAmount = await db.extraPayment.findOne({
        where: {
          EmployeeId: employee,
          paymentMonth: result[0][0].payMonth,
        },
        raw: true,
      });

      const ptAmount1 = ptDeducationDetails
        ? ptDeducationDetails?.ptlocationmaster?.ptMapping?.ptAmount
        : 0;
      const lwfAmount1 = lwfDeducationDetails
        ? lwfDeducationDetails?.lwfdesignationmaster?.lwfmapping?.lwfAmount
        : 0;
      const extraPaymentAmount1 = extraPaymentAmount
        ? extraPaymentAmount?.paymentAmount
        : 0;
      if (!employeeDetailsComponentWise[0][0].payPackageAutoId) {
        await db.payProcessDetails.update(
          { payStatus: 2, payRemark: "Pay Package Not Assigned." },
          {
            where: {
              EmployeeId: employee,
              proceessId: processId,
            },
          }
        );

        continue;
      }
      const queryForAffetElementCounts = await paymentHelper.query(
        13,
        employee,
        null
      );
      const affectComponentCounts = await db.sequelize.query(
        queryForAffetElementCounts
      );
      const lopSingleUnit = employeeDetailsComponentWise[0][0].lopDays
        ? ((employeeDetailsComponentWise[0][0].payPackageMonthlyCTC /
            totalWorkingDays) *
            employeeDetailsComponentWise[0][0].lopDays) /
          affectComponentCounts[0][0].lopAffectCount
        : 0;

      for (const employeeComponentWiseDetails of employeeDetailsComponentWise[0]) {
        const queryForComponentConfiguration = await paymentHelper.query(
          12,
          employeeComponentWiseDetails.salaryComponentAutoId,
          null
        );
        const componentConfiguration = await db.sequelize.query(
          queryForComponentConfiguration
        );
        employeeComponentWiseDetails["elementMonthlyAmount"] =
          paymentHelper.getElementValue(
            "Affect Loss Of Pay",
            componentConfiguration[0]
          ) == 1
            ? parseFloat(
                employeeComponentWiseDetails.payElementAmount - lopSingleUnit
              ).toFixed(2)
            : employeeComponentWiseDetails.payElementAmount;
        employeeComponentWiseDetails["totalExtraDeduction"] =
          extraDeductonsDetails[0][0].totalDeduction
            ? extraDeductonsDetails[0][0].totalDeduction
            : 0;
        employeeComponentWiseDetails["extraDeductionCategories"] =
          extraDeductonsDetails[0][0].deductionCategories
            ? extraDeductonsDetails[0][0].deductionCategories
            : "";
        employeeComponentWiseDetails["createdAt"] = new Date();
        employeeComponentWiseDetails["createdBy"] = req.userData.id;
        employeeComponentWiseDetails["payMonth"] = result[0][0].payMonth;
        employeeComponentWiseDetails["ptAmount"] = ptAmount1;
        employeeComponentWiseDetails["lwfAmount"] = lwfAmount1;
        employeeComponentWiseDetails["extraPaymentAmount"] = extraPaymentAmount1;

        salaryRegisterArray.push(employeeComponentWiseDetails);

        let existDetails = await db.payMonthlyElements.findOne({
          where: {
            empId: employee,
            salaryComponentAutoId:
              employeeComponentWiseDetails.salaryComponentAutoId,
            payMonth: result[0][0].payMonth,
          },
          raw: true,
        });
        console.log(existDetails);
        if (!existDetails) {
          await db.payMonthlyElements.create(employeeComponentWiseDetails);
        }
      }
      await db.payProcessDetails.update(
        { payStatus: 2, payRemark: "Salary Processed." },
        {
          where: {
            EmployeeId: employee,
            proceessId: processId,
          },
        }
      );
      await delay(5000);
    }

    db.payProcessMaster.update(
      { processFlowId: 4 },
      { where: { payProcessMasterAutoId: processId } }
    );
    // //////////////////////Creating a Salary Run Process///////////////////////
    return respHelper(res, {
      status: 200,
      data: salaryRegisterArray,
    });
  }

  // async processSalary(req) {
  //   let { processId } = req.body;
  //   var errorArray = [];
  //   let queryForAllExecutableEmployee = `SELECT pm.payMonth, pd.* FROM payProcessDetails pd JOIN  payProcessMaster pm ON pd.proceessId = pm.payProcessMasterAutoId Where pm.payProcessMasterAutoId= ${processId} AND pd.payStatus in (1,2,3);`;
  //   const result = await db.sequelize.query(queryForAllExecutableEmployee);
  //   if (result[0].length == 0) {
  //     return respHelper(res, {
  //       status: 400,
  //       data: [],
  //       msg: "No data to process.",
  //     });
  //   }
  //   const employeeIds = result[0].map((item) => item.EmployeeId);
  //   let Employees = await db.employeeMaster.findAll({
  //     attributes: [
  //       "empCode",
  //       "id",
  //       "name",
  //       "dateOfJoining",
  //       "designation_id",
  //       "buId",
  //       "departmentId",
  //       "panNo",
  //     ],
  //     where: {
  //       id: { [Op.in]: employeeIds },
  //     },
  //     include: [
  //       {
  //         model: db.jobDetails,
  //         attributes: [
  //           "pfRestricted",
  //           "pfApplicability",
  //           "pfNumber",
  //           "restrictCompanyPf",
  //           "epfApplicable",
  //           "esicApplicable",
  //           "esicNumber",
  //           "lwfDesignation",
  //           "lwfState",
  //         ],
  //         as: "employeeJobDetails",
  //       },
  //       {
  //         model: db.payPackage,
  //         required: false,
  //         attributes: [
  //           "payPackageMonthlyCTC",
  //           "payPackageFinancialYear",
  //           "payPackageEffectiveDate",
  //           "payPackageAutoId",
  //         ],
  //         as: "packageDetails",
  //         // include:[
  //         //   {
  //         //     model:db.payElements,
  //         //     as:"empPayElements",
  //         //     attributes:['salaryComponentAutoId','payElementAmount'],

  //         //     include:{
  //         //       model:db.salaryComponent,
  //         //       as:"salaryComponentDetails",
  //         //       where:{
  //         //         includeInPackage:1
  //         //       },
  //         //       attributes:['includeInPackage',"salaryComponentEarningType","salaryComponentCode","salaryComponentAlias"]
  //         //     }
  //         //   }
  //         // ]
  //       },
  //     ],
  //     // raw: true,
  //     nest: true,
  //   });
  //   let lopDeductions = await db.lopDeductions.findAll({
  //     where: {
  //       EmployeeId: { [Op.in]: employeeIds },
  //       lopMonth: result[0][0]["payMonth"],
  //     },
  //     raw: true,
  //   });
  //   const lopDaysMap = lopDeductions.reduce((acc, curr) => {
  //     acc[curr["empCode"]] = curr["lopDays"];
  //     return acc;
  //   }, {});
  //   let tdsDeductions = await db.tdsDeductions.findAll({
  //     where: {
  //       EmployeeId: { [Op.in]: employeeIds },
  //       tdsMonth: result[0][0]["payMonth"],
  //     },
  //     raw: true,
  //   });
  //   /////////////////TDS-DEDUCTIONS//////////////////
  //   const tdsDeduction = tdsDeductions.reduce((acc, curr) => {
  //     acc[curr["EmployeeId"]] = curr["tdsAmount"];
  //     return acc;
  //   }, {});
  //   let payAfterLopdeductions = await paymentHelper.payAfterLOPDeductions(
  //     Employees,
  //     lopDaysMap
  //   );
  //   errorArray = errorArray.concat(payAfterLopdeductions.errorArray);
  //   let payAfterTDSDeductions = await paymentHelper.payAfterTDSDeductions(
  //     payAfterLopdeductions.dataAfterLopDeductions,
  //     tdsDeduction
  //   );

  //   let extraDeductions = await db.extraDeduction.findAll({
  //     where: {
  //       EmployeeId: { [Op.in]: employeeIds },
  //       startMonth: result[0][0]["payMonth"],
  //     },
  //     raw: true,
  //   });
  //   const standardDeductons = await paymentHelper.standardDeductions(
  //     extraDeductions
  //   );
  //   let payAFterStarndarDeductions =
  //     await paymentHelper.payAfterStandardDeductions(
  //       payAfterTDSDeductions,
  //       standardDeductons
  //     );
  //   for (const errorProcessed of errorArray) {
  //     await db.payProcessDetails.update(
  //       { payStatus: 3, payRemark: errorProcessed.Message },
  //       {
  //         where: {
  //           EmployeeId: errorProcessed.EmployeeId,
  //           proceessId: processId,
  //         },
  //       }
  //     );

  //     console.log(errorProcessed);
  //   }
  //   for (const successProcessed of payAFterStarndarDeductions) {
  //     successProcessed["payStatus"] = 2;
  //     successProcessed["payRemark"] = "Successfully Processed";
  //     successProcessed["updatedBy"] = result[0][0]["createdBy"];
  //     successProcessed["updatedAt"] = new Date();
  //     await db.payProcessDetails.update(successProcessed, {
  //       where: {
  //         EmployeeId: successProcessed.EmployeeId,
  //         proceessId: processId,
  //       },
  //     });
  //   }

  //   db.payProcessMaster.update(
  //     { processFlowId: 2 },
  //     { where: { payProcessMasterAutoId: processId } }
  //   );
  //   //////////////////////Creating a Salary Run Process///////////////////////
  //   return respHelper(res, {
  //     status: 200,
  //     data: {
  //       salaryProcessedFor: payAFterStarndarDeductions.length,
  //       erroCount: errorArray.length,
  //       totalProcessed: result[0].length,
  //       errorArray: errorArray,
  //     },
  //   });
  // }

  //////////////////////////////UPLOAD SECTION///////////////////////////////////
  async arrearsUpload(req, res) {
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
      var arrearsDetais = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];
      for (const employeeArrears of arrearsDetais) {
        let earningArears = {
          EmployeeId: employeeArrears["Email/Employee ID"],
          arrearMonth: employeeArrears["Arrear Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeArrears['Arrear Month (YYYY-MM)'])),
          arrearPayMonth: employeeArrears["Arrear Pay Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeArrears['Arrear Pay Month (YYYY-MM)'])),//employeeArrears['Arrear Pay Month (YYYY-MM)'],
          arearDays: employeeArrears["Arrear Days"],
          arearType: employeeArrears["Arrear Type(New Joinee/LOP/Increment)"],
          hasPF: employeeArrears["Has PF Arrear? (Yes/No)"],
          computeESIC: employeeArrears["Compute ESIC Arrear (Yes/No)"],
          createdAt: new Date(),
        };

        const { error } = await validator.earningArrearsSchema.validate(
          earningArears
        );

        if (error) {
          errorArray.push({
            error: error.details[0].message,
            empId: earningArears.EmployeeId,
          });
          return respHelper(res, {
            status: 400,
            msg: error.details[0],
          });
        } else {
          let existArrear = await db.earningsArears.findOne({
            where: {
              EmployeeId: earningArears.EmployeeId,
              arrearMonth: earningArears.arrearMonth,
              arearType: earningArears.arearType,
            },
            raw: true,
          });

          if (existArrear) {
            await db.earningsArears.update(earningArears, {
              where: {
                EmployeeId: earningArears.EmployeeId,
                arrearMonth: earningArears.arrearMonth,
                arearType: earningArears.arearType,
              },
            });
            earningArears["ACTION_TYPE"] = "UPDATE";
          } else {
            await db.earningsArears.create(earningArears);
            earningArears["ACTION_TYPE"] = "CREATE";
          }
          successArray.push(earningArears);
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async tdsUpload(req, res) {
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
      var tdsDetails = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];
      for (const employeeTds of tdsDetails) {
        let employeeDetais = await db.employeeMaster.findOne({
          where: { empCode: employeeTds["Email/Employee ID"], isActive: 1 },
          raw: true,
          attributes: ["empCode", "id"],
        });

        let tdsDeductions = {
          EmployeeId: employeeDetais.id,
          tdsAmount: employeeTds["TDS Deductions"],
          tdsMonth: employeeTds["TDS Month (YYYY-MM)"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeTds['TDS Month (YYYY-MM)'])),
          empCode: employeeTds["Email/Employee ID"],
        };
        const { error } = await validator.tdsDeductionsSchema.validate(
          tdsDeductions
        );
        if (error) {
          errorArray.push({
            error: error.details[0].message,
            empId: tdsDeductions.EmployeeId,
          });
          return respHelper(res, {
            status: 400,
            msg: error.details[0],
          });
        } else {
          let existTDSDetails = await db.tdsDeductions.findOne({
            where: {
              EmployeeId: tdsDeductions.EmployeeId,
              tdsMonth: tdsDeductions.tdsMonth,
            },
            raw: true,
          });

          if (existTDSDetails) {
            tdsDeductions["updatedBy"] = req.userData.id;
            tdsDeductions["updatedAt"] = new Date();

            await db.tdsDeductions.update(tdsDeductions, {
              where: {
                EmployeeId: tdsDeductions.EmployeeId,
                tdsMonth: tdsDeductions.tdsMonth,
              },
            });
            tdsDeductions["ACTION_TYPE"] = "UPDATE";
          } else {
            tdsDeductions["createdBy"] = req.userData.id;
            tdsDeductions["createdAt"] = new Date();
            await db.tdsDeductions.create(tdsDeductions);
            tdsDeductions["ACTION_TYPE"] = "CREATE";
          }
          successArray.push(tdsDeductions);
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async extraPaymentUpload(req, res) {
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
      var tdsDetails = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );
      var errorArray = [],
        successArray = [];
      for (const employeeExtraPayment of tdsDetails) {
        let employeeDetais = await db.employeeMaster.findOne({
          where: {
            empCode: employeeExtraPayment["Email/Employee ID"],
            isActive: 1,
          },
          raw: true,
          attributes: ["empCode", "id"],
        });

        let extraPayment = {
          EmployeeId: employeeDetais.id,
          paymentAmount: employeeExtraPayment["Amount"],
          paymentMonth: employeeExtraPayment["Effective Month"], //helper.formatToYYYYMM(helper.excelDateToJSDate(employeeTds['TDS Month (YYYY-MM)'])),
          empCode: employeeExtraPayment["Email/Employee ID"],
          category: employeeExtraPayment["Category"],
        };
        console.log("extraPayment", extraPayment);
        const { error } = await validator.extraPayment.validate(extraPayment);
        if (error) {
          errorArray.push({
            error: error.details[0].message,
            empId: extraPayment.EmployeeId,
          });
          return respHelper(res, {
            status: 400,
            msg: error.details[0],
          });
        } else {
          let existTDSDetails = await db.extraPayment.findOne({
            where: {
              EmployeeId: extraPayment.EmployeeId,
              paymentMonth: extraPayment.paymentMonth,
            },
            raw: true,
          });

          if (existTDSDetails) {
            extraPayment["updatedBy"] = req.userData.id;
            extraPayment["updatedAt"] = new Date();

            await db.extraPayment.update(extraPayment, {
              where: {
                EmployeeId: extraPayment.EmployeeId,
                paymentMonth: extraPayment.paymentMonth,
              },
            });
            extraPayment["ACTION_TYPE"] = "UPDATE";
          } else {
            extraPayment["createdBy"] = req.userData.id;
            extraPayment["createdAt"] = new Date();
            await db.extraPayment.create(extraPayment);
            extraPayment["ACTION_TYPE"] = "CREATE";
          }
          successArray.push(extraPayment);
        }
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
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
      for (const employeeTds of lopDetails) {
        let employeeDetais = await db.employeeMaster.findOne({
          where: { empCode: employeeTds["Email/Employee ID"], isActive: 1 },
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
          empCode: employeeTds["Email/Employee ID"],
        };
        const { error } = await validator.lopValidateSchama.validate(
          lopDeductions
        );
        if (error) {
          errorArray.push({
            error: error.details[0].message,
            empId: lopDeductions.EmployeeId,
          });
          return respHelper(res, {
            status: 400,
            msg: error.details[0],
          });
        } else {
          let existTDSDetails = await db.lopDeductions.findOne({
            where: {
              empCode: lopDeductions.EmployeeId,
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

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async extraDeductionsUpload(req, res) {
    var errorArray = [],
      successArray = [];
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
      var extraDeductonsDetails = pkg.utils.sheet_to_json(
        workbookEmployee.Sheets[sheetNameEmployee]
      );

      for (const employeeExtraDeduction of extraDeductonsDetails) {
        const { error } = await validator.extraDeductionSchema.validate(
          employeeExtraDeduction
        );
        if (error) {
          errorArray.push({
            index: errorArray.length + 1,
            employeeID: employeeExtraDeduction["Email/Employee ID"],
            errorDetails: error.details[0].message,
          });
          continue;
        }
        let employeeDetais = await db.employeeMaster.findOne({
          where: {
            empCode: employeeExtraDeduction["Email/Employee ID"],
            isActive: 1,
          },
          raw: true,
          attributes: ["empCode", "id"],
        });

        if (!employeeDetais) {
          errorArray.push({
            index: errorArray.length + 1,
            employeeID: employeeExtraDeduction["Email/Employee ID"],
            errorDetails: "Employee Not Exists or Acive Anymore.",
          });
          continue;
        }

        let extraDeductions = {
          EmployeeId: employeeDetais.id,
          empCode: employeeExtraDeduction["Email/Employee ID"],
          deductionCategory: employeeExtraDeduction["Advance Category"],
          deductionName: employeeExtraDeduction["Advance Name"],
          deductionAmount:
            employeeExtraDeduction["Total Amount/Percent/Hours/Days"],
          startMonth: employeeExtraDeduction["Start Month"],
          numberOfDeductions: employeeExtraDeduction["Number Of Deductions"],
          status: employeeExtraDeduction["Status (Open/Completed)"],
          endMonth: employeeExtraDeduction["End Month"],
          currencyCode: employeeExtraDeduction["Currency ISO Code"],
          changeReason: employeeExtraDeduction["Reason for status change"],
        };

        let existExtraDeductionDetails = await db.extraDeduction.findOne({
          where: {
            empCode: extraDeductions.empCode,
            deductionCategory: extraDeductions.deductionCategory,
            deductionName: extraDeductions.deductionName,
            startMonth: extraDeductions.startMonth,
          },
          raw: true,
        });

        if (existExtraDeductionDetails) {
          extraDeductions["updatedBy"] = req.userData.id;
          extraDeductions["updatedAt"] = new Date();

          await db.extraDeduction.update(extraDeductions, {
            where: {
              empCode: extraDeductions.empCode,
              deductionCategory: extraDeductions.deductionCategory,
              deductionName: extraDeductions.deductionName,
              startMonth: extraDeductions.startMonth,
            },
          });
          extraDeductions["ACTION_TYPE"] = "UPDATE";
        } else {
          extraDeductions["createdBy"] = req.userData.id;
          extraDeductions["createdAt"] = new Date();
          await db.extraDeduction.create(extraDeductions);
          extraDeductions["ACTION_TYPE"] = "CREATE";
        }
        successArray.push(extraDeductions);
      }

      return respHelper(res, {
        status: 200,
        data: { errorArray, successArray },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }
  //////////////////////////////UPLOAD SECTION///////////////////////////////////

  async getCompanyList(req, res) {
    try {
      let companyList = await db.companyMaster.findAll({
        where: { isActive: 1 },
        raw: true,
        attributes: ["companyId", "companyName"],
      });
      ///////////////If File is provided by the users//////////////////
      return respHelper(res, {
        status: 200,
        data: companyList,
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async getPayGroupsList(req, res) {
    try {
      let paygroupList = await db.departmentMaster.findAll({
        where: { isActive: 1 },
        raw: true,
        attributes: ["departmentId", "departmentName"],
      });
      ///////////////If File is provided by the users//////////////////
      let allEmployee = {
        departmentId: 0,
        departmentName: "All Employees",
      };
      paygroupList.unshift(allEmployee);
      return respHelper(res, {
        status: 200,
        data: paygroupList,
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

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

      console.log(value);

      let employeeForProcessingQuery = `SELECT e.id AS EmployeeId FROM tara.employee e JOIN tara.paypackage p ON e.id = p.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.departmentId IN (${value.departmentId.split(
        ","
      )})`;
      let employeeForProcessing = await db.sequelize.query(
        employeeForProcessingQuery
      );
      const employeeIds = employeeForProcessing[0].map(
        (employee) => employee.EmployeeId
      );
      let countsForProcessing = `SELECT SUM(CASE WHEN payStatus = 7 THEN 1 ELSE 0 END) AS processed, SUM(CASE WHEN payStatus != 7 THEN 1 ELSE 0 END) AS inProcess, COUNT(DISTINCT EmployeeId) - COUNT(payStatus) AS available, COUNT(EmployeeId) AS totalEmployee FROM tara.payprocessdetails WHERE payMonth = '${value.paymonth}' AND EmployeeId IN (${employeeIds});`;
      let employeeProcessCount = await db.sequelize.query(countsForProcessing);
      return respHelper(res, {
        status: 200,
        data: {
          processed: employeeProcessCount[0][0].processed,
          inProcess: employeeProcessCount[0][0].inProcess,
          totalEmployee: employeeIds.length,
          available:
            employeeIds.length -
            (employeeProcessCount[0][0].processed +
              employeeProcessCount[0][0].inProcess),
        },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async getReviewEmployeeDetails(req, res) {
    try {
      const { error } = await validator.employeesForPayrollProcess.validate(
        req.body
      );
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }
      let payMonthYear = req.body.paymonth.split("-");
      let cutOffDate = payMonthYear[0] + "-" + payMonthYear[1] + "-" + "1";
      let currentDate =
        payMonthYear[0] + "-" + payMonthYear[1] + "-" + new Date().getDate();
      const { departmentId } = req.body;
      let commonQuery = {
        departmentId: { [Op.in]: departmentId.split(",") },
        isActive: 1,
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn(
              "STR_TO_DATE",
              db.sequelize.col("dateOfJoining"),
              "%Y-%m-%d"
            ),
            { [Op.lt]: currentDate }
          ),
        ],
      };

      let allEmployee = await db.employeeMaster.findAll({
        where: commonQuery,
        raw: true,
        attributes: ["id"],
      });
      let employeeIds = allEmployee.map((employee) => employee.id);

      let queryForLastMontCarryForward = {
        id: { [Op.in]: employeeIds },
        payrollInclude: null,
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn(
              "STR_TO_DATE",
              db.sequelize.col("dateOfJoining"),
              "%Y-%m-%d"
            ),
            { [Op.lt]: cutOffDate }
          ),
        ],
      };

      let querynewJoineeCurrentMont = {
        id: { [Op.in]: employeeIds },
        isActive: 1,
        payrollInclude: null,
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn(
              "STR_TO_DATE",
              db.sequelize.col("dateOfJoining"),
              "%Y-%m-%d"
            ),
            { [Op.and]: [{ [Op.gte]: cutOffDate }, { [Op.lt]: currentDate }] }
          ),
        ],
      };

      let queryForReincluded = {
        id: { [Op.in]: employeeIds },
        isActive: 1,
        payrollInclude: 1,
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn(
              "STR_TO_DATE",
              db.sequelize.col("dateOfJoining"),
              "%Y-%m-%d"
            ),
            { [Op.lt]: currentDate }
          ),
        ],
      };

      let queryForExcludeFromCurrentProcess = {
        id: { [Op.in]: employeeIds },
        isActive: 1,
        payrollInclude: 2, //1-Include, 2--exclude
        [Op.and]: [
          db.sequelize.where(
            db.sequelize.fn(
              "STR_TO_DATE",
              db.sequelize.col("dateOfJoining"),
              "%Y-%m-%d"
            ),
            { [Op.lt]: currentDate }
          ),
        ],
      };

      let balanceFromLast = await db.employeeMaster.findAll({
        where: queryForLastMontCarryForward,
        attributes: ["id"],
      });
      let newJoineeCurrentMont = await db.employeeMaster.findAll({
        where: querynewJoineeCurrentMont,
        attributes: ["id"],
      });
      let reincludedForCurrentMonth = await db.employeeMaster.findAll({
        where: queryForReincluded,
        attributes: ["id"],
      });

      let alreadyProcessed = [];
      // await db.salaryRegister.findAll({
      //   where: { processingStatus: 2, EmployeeId: { [Op.in]: employeeIds } },
      // });
      //1-In-Process/2-Processed/3-Failed
      let excludeFromCurrentProcess = await db.employeeMaster.findAll({
        where: queryForExcludeFromCurrentProcess,
        attributes: ["id"],
      });

      let missingSalaryInformation = await db.employeeMaster.findAll({
        where: {
          id: { [Op.in]: employeeIds }, // Filter by employeeIds
        },
        attributes: ["id"],
        include: [
          {
            model: db.payPackage,
            as: "packageDetails",
            required: false, // Makes the join optional, meaning employees without pay package details will also be included
            where: {
              payPackageAutoId: null, // Filter for employees with no associated pay package
            },
          },
        ],
      });

      return respHelper(res, {
        status: 200,
        data: {
          includedForProcess: {
            balaceFromLastMonth: balanceFromLast.length,
            newJoineeCurrent: newJoineeCurrentMont.length,
            reincluded: reincludedForCurrentMonth.length,
            totalIncluded:
              balanceFromLast.length +
              newJoineeCurrentMont.length +
              reincludedForCurrentMonth.length,
          },
          excludedForProcess: {
            fnfEmployee: 0,
            alreadyProcessed: alreadyProcessed.length,
            excludeAtProcessLevel: excludeFromCurrentProcess.length,
            missingProfieInfo: missingSalaryInformation.length,
            totalExcluded:
              alreadyProcessed.length +
              excludeFromCurrentProcess.length +
              missingSalaryInformation.length,
          },
          parollBlockers: {
            ctcNotAssigned: missingSalaryInformation.length,
          },
          parollNonBlockers: {
            bankDetails: 0,
          },
        },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async lopSyncing(req, res) {
    try {
      const { error, value } =
        await validator.employeesForPayrollProcess.validate(req.body);
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }

      let workingDaysOfMonth = paymentHelper.getDaysInCurrentMonth({
        year: value.paymonth.split("-")[0],
        month: value.paymonth.split("-")[1],
      });
      let allEmployeeQuery = `SELECT e.id AS id FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.departmentId IN (${value.departmentId.split(
        ","
      )}) AND ppd.payProcessDetailAutoId IS NULL;`;
      const result = await db.sequelize.query(allEmployeeQuery);
      var totalLopAmount = 0,
        totalLOPDays = 0;
      let employeeIds = result[0].map((employee) => employee.id);
      let lopDeductions = await db.lopDeductions.findAll({
        where: {
          EmployeeId: { [Op.in]: employeeIds },
          lopMonth: req.body.paymonth,
        },
        raw: true,
      });

      for (const lopSingleDetails of lopDeductions) {
        let payPackageDetails = await db.payPackage.findOne({
          where: {
            EmployeeId: lopSingleDetails.EmployeeId,
            payPackageFinancialYear: "2024-25",
          },
          attributes: ["payPackageMonthlyCTC"],
          raw: true,
        });

        console.log(workingDaysOfMonth);

        let lopAmount =
          (payPackageDetails.payPackageMonthlyCTC / workingDaysOfMonth) *
          lopSingleDetails.lopDays;
        totalLopAmount = lopAmount + totalLopAmount;
        totalLOPDays = lopSingleDetails.lopDays + totalLOPDays;

        console.log(lopAmount);
      }
      return respHelper(res, {
        status: 200,
        data: {
          impactedEmployee: lopDeductions.length,
          lopAmount: totalLopAmount.toFixed(2),
          totalLOPDays: totalLOPDays,
        },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async tdsSyncing(req, res) {
    try {
      const { error, value } =
        await validator.employeesForPayrollProcess.validate(req.body);
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }
      let allEmployeeQuery = `SELECT e.id AS id FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.departmentId IN (${value.departmentId.split(
        ","
      )}) AND ppd.payProcessDetailAutoId IS NULL;`;
      const result = await db.sequelize.query(allEmployeeQuery);
      var totalTdsAmount = 0,
        totalLOPDays = 0;
      let employeeIds = result[0].map((employee) => employee.id);
      let tdsDeductions = await db.tdsDeductions.findAll({
        where: {
          EmployeeId: { [Op.in]: employeeIds },
          tdsMonth: req.body.paymonth,
        },
        raw: true,
      });

      console.log(tdsDeductions);
      for (const tdsSingleDetails of tdsDeductions) {
        console.log(tdsSingleDetails);

        totalTdsAmount += parseFloat(tdsSingleDetails.tdsAmount || 0);
      }
      return respHelper(res, {
        status: 200,
        data: {
          impactedEmployee: tdsDeductions.length,
          tdsAmount: totalTdsAmount.toFixed(2),
        },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async extraPaymentSyncing(req, res) {
    try {
      const { error, value } =
        await validator.employeesForPayrollProcess.validate(req.body);
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }
      let allEmployeeQuery = `SELECT e.id AS id FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.departmentId IN (${value.departmentId.split(
        ","
      )}) AND ppd.payProcessDetailAutoId IS NULL;`;
      const result = await db.sequelize.query(allEmployeeQuery);
      var totaPaymentAmount = 0,
        totalLOPDays = 0;
      let employeeIds = result[0].map((employee) => employee.id);
      let tdsDeductions = await db.extraPayment.findAll({
        where: {
          EmployeeId: { [Op.in]: employeeIds },
          paymentMonth: req.body.paymonth,
        },
        raw: true,
      });
      console.log("tdsDeductions", tdsDeductions);
      for (const tdsSingleDetails of tdsDeductions) {
        console.log(tdsSingleDetails);

        totaPaymentAmount += parseFloat(tdsSingleDetails.paymentAmount || 0);
      }
      return respHelper(res, {
        status: 200,
        data: {
          impactedEmployee: tdsDeductions.length,
          paymentAmount: totaPaymentAmount.toFixed(2),
        },
      });
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async extraDeductionSyncing(req, res) {
    try {
      const { error, value } =
        await validator.employeesForPayrollProcess.validate(req.body);
      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error.details[0],
        });
      }
      let allEmployeeQuery = `SELECT e.id AS id FROM tara.employee e LEFT JOIN tara.paypackage p ON e.id = p.EmployeeId LEFT JOIN tara.payprocessdetails ppd ON e.id = ppd.EmployeeId WHERE (e.dateOfexit IS NULL OR MONTH(e.dateOfexit) != MONTH(CURDATE()) OR YEAR(e.dateOfexit) != YEAR(CURDATE())) AND e.dateOfJoining < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND p.payPackageAutoId IS NOT NULL AND e.departmentId IN (${value.departmentId.split(
        ","
      )}) AND ppd.payProcessDetailAutoId IS NULL;`;
      const result = await db.sequelize.query(allEmployeeQuery);
      var totalExtraDeductionsAmount = 0;
      let employeeIds =
        result[0].length > 0 ? result[0].map((employee) => employee.id) : [];
      let allDeductionQuery = `SELECT empCode AS EmployeeId, SUM(deductionAmount) AS TotalDeductionAmount FROM tara.extradeductions where EmployeeId in(${employeeIds.join(
        ","
      )}) GROUP BY empCode`;

      console.log("Deduction Query ::" + allDeductionQuery);

      if (employeeIds.length > 0) {
        let extraDeductions = await db.sequelize.query(allDeductionQuery);
        console.log(extraDeductions[0]);
        for (const extraDeductionSingleDetails of extraDeductions[0]) {
          totalExtraDeductionsAmount += parseFloat(
            extraDeductionSingleDetails.TotalDeductionAmount || 0
          );
        }
        return respHelper(res, {
          status: 200,
          data: {
            impactedEmployee: extraDeductions[0].length,
            extraDeductionAmount: totalExtraDeductionsAmount.toFixed(2),
          },
        });
      } else {
        return respHelper(res, {
          status: 200,
          data: {
            impactedEmployee: 0,
            extraDeductionAmount: 0,
          },
        });
      }
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async exportSalaryRegister(req, res) {
    try {
      let { processId } = req.body;
      let returnArray = [];
      const queryForProcessedEmploye = await paymentHelper.query(17, processId, null);
      const processedEmployee = await db.sequelize.query(
        queryForProcessedEmploye
      );

      console.log(processedEmployee);

      const employeeIds = processedEmployee[0].map((item) => item.empId);
      const query = await paymentHelper.query(
        1,
        processedEmployee[0][0]["payMonth"],
        employeeIds
      );
      const result = await db.sequelize.query(query);
      console.log("result", result[0]);
      const processedData = groupByEmployeeId(result[0]);
      return respHelper(res, {
        status: 200,
        data: processedData,
      });
    } catch (e) {
      console.log(e);
    }
  }

  // async generatePaySlip(req, res) {
  //   try {
  //     let { processId } = req.body;
  //     let queryForCurrentProcessStatus = await paymentHelper.query(15,processId,null);
  //     let currentProcessStatus = await db.sequelize.query(queryForCurrentProcessStatus);
  //     if(currentProcessStatus[0][0].currentstatus==6)
  //     {
  //       let queryForPayMonthlyElementsForSalarySlip = await paymentHelper.query(16,currentProcessStatus[0][0].payMonth,null);
  //       let payElements = await db.sequelize.query(queryForPayMonthlyElementsForSalarySlip);

  //       console.log(payElements[0])
  //       for (const payMonthlyElement of payElements[0]) {
  //         let isExistPaySlip = await db.paySlips.findOne({where:{
  //           EmployeeId:payMonthlyElement.empId,
  //           paySlipMonth:payMonthlyElement.payMonth.split("-")[1],
  //           paySlipYear:payMonthlyElement.payMonth.split("-")[0]
  //         },raw:true});
  //         let currentMonth=payMonthlyElement.payMonth.split("-")[1];
  //         let currentYear=payMonthlyElement.payMonth.split("-")[0];
  //         let totalWorkingDays =paymentHelper.getDaysInCurrentMonth({month:payMonthlyElement.payMonth.split("-")[1],year:payMonthlyElement.payMonth.split("-")[0]});
  //         let paySlipDuration= `01/${parseInt(currentMonth)+1}/${currentYear}-${totalWorkingDays}/${parseInt(currentMonth)+1}/${currentYear}`;
  //         let paySlipAutoId=isExistPaySlip?isExistPaySlip.paySlipAutoId:null;

  //         if(!isExistPaySlip)
  //         {
  //           let customeDeduction=[];
  //           let totalPayslipDeductons=parseFloat(payMonthlyElement.totalExtraDeduction)+parseFloat(payMonthlyElement.totalComponentDeductions);

  //           let PaySlipNetPay = parseFloat(payMonthlyElement.paySlipGrossEarning)-(parseFloat(payMonthlyElement.tdsAmount)+parseFloat(payMonthlyElement.totalExtraDeduction))
  //           isExistPaySlip= await db.paySlips.create({
  //             EmployeeId:payMonthlyElement.empId,
  //             paySlipMonth:payMonthlyElement.payMonth.split("-")[1],
  //             paySlipYear:payMonthlyElement.payMonth.split("-")[0],
  //             paySlipFinancialYear:'2024-25',
  //             paySlipDuration:paySlipDuration,
  //             paySlipTotalDays:totalWorkingDays,
  //             paySlipWorkingDays:totalWorkingDays-payMonthlyElement.lopDays,
  //             paySlipAbsentDays:payMonthlyElement.lopDays,
  //             paySlipArrearDays:payMonthlyElement.arrearDays,
  //             paySlipGrossEarning:payMonthlyElement.paySlipGrossEarning,
  //             paySlipTotalPay:payMonthlyElement.paySlipTotalPay,
  //             paySlipNetPay:PaySlipNetPay,
  //             paySlipTotalDeduction:totalPayslipDeductons,
  //             paySlipTDS:payMonthlyElement.tdsAmount,
  //             createdBy:req.userData.id,
  //             isActive:1,
  //             paySlipStatus:0,
  //             createdAt:new Date(),
  //           });

  //           console.log(isExistPaySlip);
  //           paySlipAutoId=isExistPaySlip.dataValues.paySlipAutoId?isExistPaySlip.dataValues.paySlipAutoId:paySlipAutoId;

  //           if(payMonthlyElement.tdsAmount>0)
  //           {
  //             customeDeduction.push({
  //               EmployeeId:payMonthlyElement.empId,
  //               paySlipAutoId:paySlipAutoId,
  //               salaryComponentAutoId:0,
  //               paySlipComponentName:"TDS",
  //               paySlipComponentAmount:payMonthlyElement.tdsAmount,
  //               paySlipComponentType:'Deduction',
  //               createdBy:req.userData.id,
  //               createdAt:new Date()
  //             });
  //           }

  //           if(payMonthlyElement.totalExtraDeduction>0)
  //             {
  //               customeDeduction.push({
  //                 EmployeeId:payMonthlyElement.empId,
  //                 paySlipAutoId:paySlipAutoId,
  //                 salaryComponentAutoId:0,
  //                 paySlipComponentName:"Extra Deduction",
  //                 paySlipComponentAmount:payMonthlyElement.totalExtraDeduction,
  //                 paySlipComponentType:'Deduction',
  //                 createdBy:req.userData.id,
  //                 createdAt:new Date()
  //               });
  //             }

  //             await db.paySlipComponent.bulkCreate(customeDeduction);

  //         }
  //         let isExistPayElement = await db.paySlipComponent.findOne({where:{
  //           EmployeeId:payMonthlyElement.empId,
  //           paySlipAutoId:paySlipAutoId,
  //           salaryComponentAutoId:payMonthlyElement.salaryComponentAutoId
  //         },raw:true});

  //         if(!isExistPayElement)
  //         {
  //           await db.paySlipComponent.create({
  //             EmployeeId:payMonthlyElement.empId,
  //             paySlipAutoId:paySlipAutoId,
  //             salaryComponentAutoId:payMonthlyElement.salaryComponentAutoId,
  //             paySlipComponentName:payMonthlyElement.paySlipComponentName,
  //             paySlipComponentAmount:payMonthlyElement.elementMonthlyAmount,
  //             paySlipComponentType:payMonthlyElement.salaryComponentEarningType,
  //             createdBy:req.userData.id,
  //             createdAt:new Date()
  //           });

  //         }

  //       }
  //     }
  //     else
  //     {
  //       return respHelper(res, {
  //         status: 400,
  //         msg: "Porcess is not ready for salary generation",
  //       });
  //     }

  //     return respHelper(res, {
  //       status: 200,
  //       data:currentProcessStatus[0],
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  async processedEmployeeList(req, res) {
    try {
      let { processId } = req.body;
      let processedEmployees = await db.payProcessDetails.findAll({
        where: { proceessId: processId, payStatus: 2 }, // `proceessId` is not needed in the `where` clause if excluded
        raw: true,
      });

      if (processedEmployees.length == 0) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "Data not available.",
        });
      }
      const employeeIds = processedEmployees.map((item) => item.EmployeeId);
      const query = paymentHelper.query(2, employeeIds, 0);
      const result = await db.sequelize.query(query);
      return respHelper(res, {
        status: 200,
        data: result[0],
      });
    } catch (e) {
      console.log(e);
    }
  }

  async releasePaySlip(req, res) {
    try {
      let { processId, empIds } = req.body;

      if (!empIds) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "Employee Details not found.",
        });
      }

      let employees = empIds.split(",");

      const queryEmloyeeAlreadyReleased = paymentHelper.query(2, employees, 1);
      const resultAlreadyReleased = await db.sequelize.query(
        queryEmloyeeAlreadyReleased
      );

      const releasedPaySlipFor = await db.paySlips.update(
        { paySlipStatus: 1, updatedAt: new Date(), updatedBy: req.userData.id },
        {
          where: {
            paySlipStatus: 0,
            EmployeeId: { [Op.in]: employees },
          },
        }
      );

      return respHelper(res, {
        status: 200,
        data: {
          payslipAlreadyReleased: resultAlreadyReleased[0],
          paySlipReleasedFor: releasedPaySlipFor,
        },
        msg: "Pay Slip Released for " + releasedPaySlipFor[0] + " Employees.",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getMappedEmployeeWithSalaryStructure(req, res) {
    try {
      let { salaryStructureAutoId } = req.body;

      console.log(salaryStructureAutoId);

      if (!salaryStructureAutoId) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "Salary Structure Details Not Found.",
        });
      }
      const queryForMappedEmployeeList = paymentHelper.query(
        3,
        salaryStructureAutoId,
        null
      );
      const resultMappedEmployeesList = await db.sequelize.query(
        queryForMappedEmployeeList
      );

      console.log(queryForMappedEmployeeList);
      return respHelper(res, {
        status: 200,
        data: resultMappedEmployeesList[0],
        msg: "Employee List Fetched Successfully",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getWipProcessList(req, res) {
    try {
      const { error, value } = await validator.payMonthYearCheck.validate(
        req.body
      );

      if (error) {
        return respHelper(res, {
          status: 400,
          msg: error,
        });
      }
      let paymonth = value.pay_year + "-" + value.pay_month;
      const queryForMappedEmployeeList = await paymentHelper.query(
        4,
        [1, 2, 3, 4, 5, 6, 7, 8],
        { paymonth: paymonth, companyId: value.companyId }
      );

      const pendingProcessList = await db.sequelize.query(
        queryForMappedEmployeeList
      );
      return respHelper(res, {
        status: 200,
        data: pendingProcessList[0],
        msg: "Employee List Fetched Successfully",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getNextAvailableStatuses(req, res) {
    try {
      let { processId } = req.body;
      if (!processId) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "Pay Month Not Available",
        });
      }
      const queryForMappedEmployeeList = await paymentHelper.query(
        5,
        processId,
        null
      );
      const pendingProcessList = await db.sequelize.query(
        queryForMappedEmployeeList
      );
      const querForAvailableSatusList = await paymentHelper.query(
        7,
        pendingProcessList[0][0].currentstatus,
        null
      );

      const nextAvailableStatus = await db.sequelize.query(
        querForAvailableSatusList
      );
      return respHelper(res, {
        status: 200,
        data: nextAvailableStatus[0],
        msg: "Status List Fetched Successfully",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async updateNextStatus(req, res) {
    try {
      let { processId, currentStatusId, nextStatusId } = req.body;

      const queryForMappedEmployeeList = await paymentHelper.query(
        6,
        currentStatusId,
        nextStatusId
      );
      const getNextAvaiableFlow = await db.sequelize.query(
        queryForMappedEmployeeList
      );

      if (getNextAvaiableFlow[0].length == 0) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "Pay Process Flow Not Defined",
        });
      }

      if ((nextStatusId = 7)) {
        await generatePaySlip({ processId: processId, req });
      }

      await db.payProcessMaster.update(
        {
          processFlowId: getNextAvaiableFlow[0][0].refferenceFlowId,
          updatedBy: req.userData.id,
          updatedAt: new Date(),
        },
        { where: { payProcessMasterAutoId: processId } }
      );
      return respHelper(res, {
        status: 200,
        data: getNextAvaiableFlow[0],
        msg: getNextAvaiableFlow[0][0].currentRemark,
      });
    } catch (e) {
      console.log(e);
    }
  }
  async getProcessDetails(req, res) {
    try {
      let { processId } = req.body;
      if (!processId) {
        return respHelper(res, {
          status: 400,
          data: [],
          msg: "Process Id Not Available",
        });
      }
      let stepperDataQuery = null;
      const queryForProcessStatus = await paymentHelper.query(
        9,
        processId,
        null
      );
      const currentProcessStatus = await db.sequelize.query(
        queryForProcessStatus
      );
      if ([1, 2].includes(currentProcessStatus[0][0].currentStatusId)) {
        stepperDataQuery = await paymentHelper.query(8, processId, null);
      } else if (currentProcessStatus[0][0].currentStatusId == 3) {
        stepperDataQuery = await paymentHelper.query(10, processId, null);
      } else if (
        [6, 7, 8].includes(currentProcessStatus[0][0].currentStatusId)
      ) {
        stepperDataQuery = await paymentHelper.query(18, processId, {
          paymonth: "2024-09",
          month: 9,
          year: 2024,
        });
      }
      const stepperData = await db.sequelize.query(stepperDataQuery);
      return respHelper(res, {
        status: 200,
        data: {
          currentStatusId: currentProcessStatus[0][0].currentStatusId,
          stepperData: stepperData[0],
        },
        msg: "Status List Fetched Successfully",
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const groupByEmployeeId = (data) => {
  const groupedData = {};

  data.forEach((item) => {
    const employeeId = item["Employee Id"];

    if (!groupedData[employeeId]) {
      groupedData[employeeId] = {
        "Employee Id": employeeId,
        "Employee Name": item["Employee Name"],
        "LOP Days": item["LOP Days"],
        "Arrears Month": item["Arrears Month"],
        "Arrears Days": item["Arrears Days"],
        "TDS Month": item["TDS Month"],
        "TDS Amount": item["TDS Amount"],
        "Net Pay": item["Net Pay"],
        "Advance Name": item["Advance Name"],
        "Advance Amount": item["Advance Amount"],
        "PT Amount": item["PT AMOUNT"],
        "LWF Amount": item["LWF AMOUNT"],
        "Extra Payment Amount":item["EXTRA PAYMENT AMOUNT"],
        
      };
    }

    Object.assign(groupedData[employeeId], {
      [item["Element Name"]]: item["Element Amount"],
    });
    if (item["includeInPackage"] == 1) {
      Object.assign(groupedData[employeeId], {
        [item["Element Name"] + " Monthly"]: item["Monthly Element Amount"],
      });
    }
  });

  return Object.values(groupedData); // Convert the grouped data object back to an array
};

function formatDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function processSalary(data) {
  let { processId, req } = data;
  var errorArray = [];
  let queryForAllExecutableEmployee = `SELECT pm.payMonth, pd.* FROM payProcessDetails pd JOIN  payProcessMaster pm ON pd.proceessId = pm.payProcessMasterAutoId Where pm.payProcessMasterAutoId= ${processId} AND pd.payStatus in (1);`;
  const result = await db.sequelize.query(queryForAllExecutableEmployee);
  // if (result[0].length == 0) {
  //   return respHelper(res, {
  //     status: 400,
  //     data: [],
  //     msg: "No data to process.",
  //   });
  // }

  if (result[0].length > 0) {
    const employeeIds = result[0].map((item) => item.EmployeeId);
    const totalWorkingDays = paymentHelper.getDaysInCurrentMonth({
      year: result[0][0].payMonth.split("-")[0],
      month: result[0][0].payMonth.split("-")[1],
    });
    const salaryRegisterArray = [],
      errorProcessed = [];
    let employees = employeeIds; //[484,560];//employeeIds
    for (const employee of employees) {
      const queryForEmployeePayDetails = await paymentHelper.query(
        11,
        employee,
        { payMonth: result[0][0].payMonth }
      );
      const employeeDetailsComponentWise = await db.sequelize.query(
        queryForEmployeePayDetails
      );
      const queryForExtraDeductions = await paymentHelper.query(
        14,
        employee,
        result[0][0].payMonth
      );
      const extraDeductonsDetails = await db.sequelize.query(
        queryForExtraDeductions
      );

      //pt and lwf deduction
      const lopMonthWiseCalculation =
        employeeDetailsComponentWise.length > 0
          ? employeeDetailsComponentWise[0][0].payPackageMonthlyCTC
            ? (
                (employeeDetailsComponentWise[0][0].payPackageMonthlyCTC /
                  totalWorkingDays) *
                employeeDetailsComponentWise[0][0].lopDays
              ).toFixed(2)
            : "0.00"
          : "0.00";

      const deductionOfLopMonthAmount = Math.max(
        0,
        parseFloat(employeeDetailsComponentWise[0][0].payPackageMonthlyCTC) -
          lopMonthWiseCalculation
      );
      const currentMonth = new Date()
        .toLocaleString("default", { month: "short" })
        .toLowerCase();
      const ptDynamicAttribute = [currentMonth, "ptAmount"];
      const lwfDynamicAttribute = [currentMonth, "lwfAmount"];

      const ptDeducationDetails = await db.employeeMaster.findOne({
        attributes: ["id", "empCode"],
        where: { id: employee },
        raw: true,
        nest: true,
        include: [
          {
            model: db.ptLocationMaster,
            attributes: ["ptLocationId", "ptLocationCode", "stateId"],
            include: [
              {
                model: db.ptMapping,
                attributes: [
                  "ptmappingId",
                  "minValue",
                  "maxValue",
                  ptDynamicAttribute,
                ],
                required: false,
                where: {
                  [Op.and]: [
                    { minValue: { [Op.lte]: deductionOfLopMonthAmount } },
                    { maxValue: { [Op.gte]: deductionOfLopMonthAmount } },
                  ],
                },
              },
            ],
          },
        ],
      });

      const lwfDeducationDetails = await db.employeeMaster.findOne({
        attributes: ["id", "empCode"],
        where: { id: employee },
        raw: true,
        nest: true,
        include: [
          {
            model: db.lwfDesignationMaster,
            attributes: ["lwfDesignationId"],
            include: [
              {
                model: db.lwfMapping,
                attributes: ["lwfmappingId", lwfDynamicAttribute],
              },
            ],
          },
        ],
      });
      console.log("result[0][0].payMonth", result[0][0].payMonth);
      const extraPaymentAmount = await db.extraPayment.findOne({
        where: {
          EmployeeId: employee,
          paymentMonth: result[0][0].payMonth,
        },
        raw: true,
      });

      const ptAmount1 = ptDeducationDetails
        ? ptDeducationDetails?.ptlocationmaster?.ptMapping?.ptAmount
        : 0;
      const lwfAmount1 = lwfDeducationDetails
        ? lwfDeducationDetails?.lwfdesignationmaster?.lwfmapping?.lwfAmount
        : 0;

        const extraPaymentAmount1 = extraPaymentAmount
        ? extraPaymentAmount?.paymentAmount
        : 0;
      //>>>>>>>>>>>>

      if (!employeeDetailsComponentWise[0][0].payPackageAutoId) {
        await db.payProcessDetails.update(
          { payStatus: 2, payRemark: "Pay Package Not Assigned." },
          {
            where: {
              EmployeeId: employee,
              proceessId: processId,
            },
          }
        );

        continue;
      }
      const queryForAffetElementCounts = await paymentHelper.query(
        13,
        employee,
        null
      );
      const affectComponentCounts = await db.sequelize.query(
        queryForAffetElementCounts
      );
      const lopSingleUnit = employeeDetailsComponentWise[0][0].lopDays
        ? ((employeeDetailsComponentWise[0][0].payPackageMonthlyCTC /
            totalWorkingDays) *
            employeeDetailsComponentWise[0][0].lopDays) /
          affectComponentCounts[0][0].lopAffectCount
        : 0;

      for (const employeeComponentWiseDetails of employeeDetailsComponentWise[0]) {
        const queryForComponentConfiguration = await paymentHelper.query(
          12,
          employeeComponentWiseDetails.salaryComponentAutoId,
          null
        );
        const componentConfiguration = await db.sequelize.query(
          queryForComponentConfiguration
        );
        employeeComponentWiseDetails["elementMonthlyAmount"] =
          paymentHelper.getElementValue(
            "Affect Loss Of Pay",
            componentConfiguration[0]
          ) == 1
            ? parseFloat(
                employeeComponentWiseDetails.payElementAmount - lopSingleUnit
              ).toFixed(2)
            : employeeComponentWiseDetails.payElementAmount;
        employeeComponentWiseDetails["totalExtraDeduction"] =
          extraDeductonsDetails[0][0].totalDeduction
            ? extraDeductonsDetails[0][0].totalDeduction
            : 0;
        employeeComponentWiseDetails["extraDeductionCategories"] =
          extraDeductonsDetails[0][0].deductionCategories
            ? extraDeductonsDetails[0][0].deductionCategories
            : "";
        employeeComponentWiseDetails["createdAt"] = new Date();
        employeeComponentWiseDetails["createdBy"] = req.userData.id;
        employeeComponentWiseDetails["payMonth"] = result[0][0].payMonth;
        employeeComponentWiseDetails["ptAmount"] = ptAmount1;
        employeeComponentWiseDetails["lwfAmount"] = lwfAmount1;
        employeeComponentWiseDetails["extraPaymentAmount"] = extraPaymentAmount1;

        salaryRegisterArray.push(employeeComponentWiseDetails);
        let existDetails = await db.payMonthlyElements.findOne({
          where: {
            empId: employee,
            salaryComponentAutoId:
              employeeComponentWiseDetails.salaryComponentAutoId,
            payMonth: result[0][0].payMonth,
          },
          raw: true,
        });
        console.log(existDetails);
        if (!existDetails) {
          await db.payMonthlyElements.create(employeeComponentWiseDetails);
        }
      }
      await db.payProcessDetails.update(
        { payStatus: 2, payRemark: "Salary Processed." },
        {
          where: {
            EmployeeId: employee,
            proceessId: processId,
          },
        }
      );
      await delay(1000);
    }

    db.payProcessMaster.update(
      { processFlowId: 4 },
      { where: { payProcessMasterAutoId: processId } }
    );
  } else {
    console.log("NO Data For Processing >>>>>>>>>");
  }

  // //////////////////////Creating a Salary Run Process///////////////////////
  // return respHelper(res, {
  //   status: 200,
  //   data: salaryRegisterArray,
  // });
}

async function generatePaySlip(data) {
  console.log("generate pay slip");
  try {
    let { processId, req } = data;
    let queryForCurrentProcessStatus = await paymentHelper.query(
      15,
      processId,
      null
    );
    let currentProcessStatus = await db.sequelize.query(
      queryForCurrentProcessStatus
    );
    if (currentProcessStatus[0][0].currentstatus == 6) {
      let queryForPayMonthlyElementsForSalarySlip = await paymentHelper.query(
        16,
        currentProcessStatus[0][0].payMonth,
        null
      );
      let payElements = await db.sequelize.query(
        queryForPayMonthlyElementsForSalarySlip
      );
      console.log("payElementspayElements", payElements[0]);

      for (const payMonthlyElement of payElements[0]) {
        let isExistPaySlip = await db.paySlips.findOne({
          where: {
            EmployeeId: payMonthlyElement.empId,
            paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
            paySlipYear: payMonthlyElement.payMonth.split("-")[0],
          },
          raw: true,
        });
        let currentMonth = payMonthlyElement.payMonth.split("-")[1];
        let currentYear = payMonthlyElement.payMonth.split("-")[0];
        let totalWorkingDays = paymentHelper.getDaysInCurrentMonth({
          month: payMonthlyElement.payMonth.split("-")[1],
          year: payMonthlyElement.payMonth.split("-")[0],
        });
        let paySlipDuration = `01/${
          parseInt(currentMonth) + 1
        }/${currentYear}-${totalWorkingDays}/${
          parseInt(currentMonth) + 1
        }/${currentYear}`;
        let paySlipAutoId = isExistPaySlip
          ? isExistPaySlip.paySlipAutoId
          : null;

        if (!isExistPaySlip) {
          let customeDeduction = [];
          let totalPayslipDeductons =
            parseFloat(payMonthlyElement.totalExtraDeduction) +
            parseFloat(payMonthlyElement.totalComponentDeductions);

          let PaySlipNetPay =
            parseFloat(payMonthlyElement.paySlipGrossEarning) -
            (parseFloat(payMonthlyElement.tdsAmount) +
              parseFloat(payMonthlyElement.totalExtraDeduction) +
              parseFloat(payMonthlyElement.ptAmount) +
              parseFloat(payMonthlyElement.lwfAmount));
          isExistPaySlip = await db.paySlips.create({
            EmployeeId: payMonthlyElement.empId,
            paySlipMonth: payMonthlyElement.payMonth.split("-")[1],
            paySlipYear: payMonthlyElement.payMonth.split("-")[0],
            paySlipFinancialYear: "2024-25",
            paySlipDuration: paySlipDuration,
            paySlipTotalDays: totalWorkingDays,
            paySlipWorkingDays: totalWorkingDays - payMonthlyElement.lopDays,
            paySlipAbsentDays: payMonthlyElement.lopDays,
            paySlipArrearDays: payMonthlyElement.arrearDays,
            paySlipGrossEarning: payMonthlyElement.paySlipGrossEarning,
            paySlipTotalPay: payMonthlyElement.paySlipTotalPay,
            paySlipNetPay: PaySlipNetPay,
            paySlipTotalDeduction: totalPayslipDeductons,
            paySlipTDS: payMonthlyElement.tdsAmount,
            createdBy: req.userData.id,
            isActive: 1,
            paySlipStatus: 0,
            createdAt: new Date(),
          });
          paySlipAutoId = isExistPaySlip.dataValues.paySlipAutoId
            ? isExistPaySlip.dataValues.paySlipAutoId
            : paySlipAutoId;
          if (payMonthlyElement.tdsAmount > 0) {
            customeDeduction.push({
              EmployeeId: payMonthlyElement.empId,
              paySlipAutoId: paySlipAutoId,
              salaryComponentAutoId: 0,
              paySlipComponentName: "TDS",
              paySlipComponentAmount: payMonthlyElement.tdsAmount,
              paySlipComponentType: "Deduction",
              createdBy: req.userData.id,
              createdAt: new Date(),
            });
          }

          if (payMonthlyElement.totalExtraDeduction > 0) {
            customeDeduction.push({
              EmployeeId: payMonthlyElement.empId,
              paySlipAutoId: paySlipAutoId,
              salaryComponentAutoId: 0,
              paySlipComponentName: "Extra Deduction",
              paySlipComponentAmount: payMonthlyElement.totalExtraDeduction,
              paySlipComponentType: "Deduction",
              createdBy: req.userData.id,
              createdAt: new Date(),
            });
          }

          if (payMonthlyElement.ptAmount > 0) {
            customeDeduction.push({
              EmployeeId: payMonthlyElement.empId,
              paySlipAutoId: paySlipAutoId,
              salaryComponentAutoId: 0,
              paySlipComponentName: "Professional Tax",
              paySlipComponentAmount: payMonthlyElement.ptAmount,
              paySlipComponentType: "Deduction",
              createdBy: req.userData.id,
              createdAt: new Date(),
            });
          }

          if (payMonthlyElement.lwfAmount > 0) {
            customeDeduction.push({
              EmployeeId: payMonthlyElement.empId,
              paySlipAutoId: paySlipAutoId,
              salaryComponentAutoId: 0,
              paySlipComponentName: "Lwf Tax",
              paySlipComponentAmount: payMonthlyElement.lwfAmount,
              paySlipComponentType: "Deduction",
              createdBy: req.userData.id,
              createdAt: new Date(),
            });
          }

          if (payMonthlyElement.extraPaymentAmount > 0) {
            customeDeduction.push({
              EmployeeId: payMonthlyElement.empId,
              paySlipAutoId: paySlipAutoId,
              salaryComponentAutoId: 0,
              paySlipComponentName: "Extra Payment",
              paySlipComponentAmount: payMonthlyElement.extraPaymentAmount,
              paySlipComponentType: "Earning",
              createdBy: req.userData.id,
              createdAt: new Date(),
            });
          }
          console.log("payMonthlyElement", payMonthlyElement);

          await db.paySlipComponent.bulkCreate(customeDeduction);
        }

        let isExistPayElement = await db.paySlipComponent.findOne({
          where: {
            EmployeeId: payMonthlyElement.empId,
            paySlipAutoId: paySlipAutoId,
            salaryComponentAutoId: payMonthlyElement.salaryComponentAutoId,
          },
          raw: true,
        });

        if (!isExistPayElement) {
          await db.paySlipComponent.create({
            EmployeeId: payMonthlyElement.empId,
            paySlipAutoId: paySlipAutoId,
            salaryComponentAutoId: payMonthlyElement.salaryComponentAutoId,
            paySlipComponentName: payMonthlyElement.paySlipComponentName,
            paySlipComponentAmount: payMonthlyElement.elementMonthlyAmount,
            paySlipComponentType: payMonthlyElement.salaryComponentEarningType,
            createdBy: req.userData.id,
            createdAt: new Date(),
          });
        }
        await delay(500);
      }
    } else {
      console.log("Porcess is not ready for salary generation");
    }
  } catch (e) {
    console.log(e);
  }
}

export default new PaymentController();
