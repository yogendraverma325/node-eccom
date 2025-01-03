import { Op, fn, col } from "sequelize";
import db from "../../../config/db.config.js";
import moment from "moment";
import eventEmitter from "../../../services/eventService.js";
import xlsx from "json-as-xlsx";
import fs from "fs";
import logger from "../../../helper/logger.js";
import helper from "../../../helper/helper.js";
import respHelper from "../../../helper/respHelper.js";
import emailTemplate from "../../../email/emailTemplate.js";
import html_to_pdf from "html-pdf-node";

class CronController {
  async updateAttendance() {
    const existEmployees = await db.employeeMaster.findAll({
      attributes: ["id", "empCode", "name", "email", "shiftId"],
      include: [
        {
          model: db.shiftMaster,
          attributes: [
            "shiftName",
            "shiftStartTime",
            "shiftEndTime",
            "shiftFlexiStartTime",
            "shiftFlexiEndTime",
          ],
        },
      ],
    });

    for (const iterator of existEmployees) {
      const existAttendance = await db.attendanceMaster.findOne({
        where: {
          attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
          employeeId: iterator.dataValues.id,
        },
      });

      if (!existAttendance) {
        await db.attendanceMaster.create({
          attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
          employeeId: iterator.dataValues.id,
          attendanceShiftId: iterator.dataValues.shiftId,
          attendancePresentStatus: "Absent",
        });
      } else {
        await db.attendanceMaster.update(
          {
            attendancePresentStatus:
              existAttendance.dataValues.attendanceStatus === "Punch In"
                ? "Single Punch Absent"
                : "Absent",
          },
          {
            where: {
              attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
              employeeId: iterator.dataValues.id,
            },
          }
        );
      }
    }
  }

  async updateActiveStatus() {
    const existsUsers = await db.employeeMaster.findAll({
      raw: true,
      where: {
        accountRecoveryTime: {
          [Op.lt]: `${moment().format("YYYY-MM-DD HH:mm")}:00`,
        },
      },
    });

    if (existsUsers.length > 0) {
      for (const iterator of existsUsers) {
        await db.employeeMaster.update(
          {
            wrongPasswordCount: 0,
            accountRecoveryTime: null,
          },
          {
            where: {
              id: iterator.id,
            },
          }
        );
      }
    }
  }

  async EarnedLeaveCreditCron() {
    const earnedLeaveDetails = await db.leaveMaster.findAll({
      raw: true,
      where: {
        iterationDistribution: {[Op.ne]: 0},
        creditDayOfMonth: moment().format("D"),
      },
    });
    await Promise.all(
      earnedLeaveDetails.map(async (singleItem) => {
        await db.leaveMapping.increment(
          {
            availableLeave: parseFloat(singleItem.iterationDistribution),
            accruedThisYear: parseFloat(singleItem.iterationDistribution),
          },
          {
            where: {
              leaveAutoId: singleItem.leaveId,
              EmployeeId: 3201,
            },
          }
        );
      })
    );

    // if (earnedLeaveDetails) {
    //   let value = parseFloat(earnedLeaveDetails.iterationDistribution).toFixed(
    //     2
    //   );

    // } else {
    //   console.log("not found");
    // }
  }

  async updateManager() {
    const managerData = await db.managerHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });
    if (managerData.length != 0) {
      for (const element of managerData) {
        let lastDayDate = moment(element.fromDate).format("YYYY-MM-DD");

        const userData = await db.employeeMaster.findOne({
          attributes: ["id", "manager"],
          where: {
            id: element.employeeId,
          },
        });

        const currentManagerOfTheEmployee = await db.managerHistory.findOne({
          raw: true,
          where: {
            needAttendanceCron: 0,
            toDate: {
              [Op.eq]: null,
            },
            employeeId: element.employeeId,
          },
        });
        if (currentManagerOfTheEmployee) {
          //MARKING LAST MANAGER WITH LAST DATE
          await db.managerHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentManagerOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST MANAGER WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.managerHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE MANGER TO EMP MASTER TABLE

        ///TRANSFER ALL RECORDS TO NEW MANAGER

        await db.regularizationMaster.update(
          {
            regularizeManagerId: element.managerId,
          },
          {
            where: {
              regularizeStatus: "Pending",
              createdBy: element.employeeId,
            },
          }
        );
        await db.employeeLeaveTransactions.update(
          {
            pendingAt: element.managerId,
          },
          {
            where: {
              status: "pending",
              createdBy: element.employeeId,
            },
          }
        );
        await db.EmployeeLeaveHeader.update(
          {
            pendingAt: element.managerId,
          },
          {
            where: {
              status: "pending",
              createdBy: element.employeeId,
            },
          }
        );

        let sepExist = await db.separationMaster.findOne({
          where: {
            finalStatus: 2,
            employeeId: element.employeeId,
          },
        });
        if (sepExist) {
          let dataAudit = await db.separationMaster.update(
            {
              pendingAt: element.managerId,
            },
            {
              where: {
                finalStatus: 2,
                employeeId: element.employeeId,
                pendingAt: userData.manager,
              },
            }
          );
          console.log("sepExist", sepExist);

          let res_sep = await db.separationTrail.update(
            {
              pendingAt: element.managerId,
            },
            {
              where: {
                pending: 1,
                separationAutoId: sepExist.resignationAutoId,
                pendingAt: userData.manager,
              },
            }
          );
        }
        let updateDone = await db.employeeMaster.update(
          {
            manager: element.managerId,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );

        //UPDATE MANGER TO EMP MASTER TABLE
      }
    }
  }

  async updatePolicy() {
    const listData = await db.PolicyHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });
    if (listData.length != 0) {
      for (const element of listData) {
        let lastDayDate = moment(element.fromDate).format("YYYY-MM-DD");
        const currentRecord = await db.PolicyHistory.findOne({
          raw: true,
          where: {
            toDate: {
              [Op.eq]: null,
            },
            employeeId: element.employeeId,
            needAttendanceCron: 0,
          },
        });
        if (currentRecord) {
          //MARKING LAST REDORDS WITH LAST DATE
          await db.PolicyHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentRecord.id,
              },
            }
          );
          //MARKING LAST REDORDS WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.PolicyHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE POLICY TO EMP MASTER TABLE
        await db.employeeMaster.update(
          {
            shiftId: element.shiftPolicy,
            attendancePolicyId: element.attendancePolicy,
            weekOffId: element.weekOffPolicy,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );
      }
    }
  }

  async blockAccess() {
    const date = moment().subtract(1, "day").format("YYYY-MM-DD");
    const userList = await db.separationMaster.findAll({
      where: {
        l2LastWorkingDay: date,
        finalStatus: 9,
      },
    });

    if (userList.length > 0) {
      for (const element of userList) {
        await db.employeeMaster.update(
          {
            dateOfexit: date,
            isActive: 0,
          },
          {
            where: {
              id: element.dataValues.employeeId,
            },
          }
        );
      }
    }
  }

  async prePasswordExpiryNotification() {
    try {
      const existsUserData = await db.employeeMaster.findAll({
        where: {
          isActive: 1,
          passwordExpiryDate: {
            [Op.lte]: moment()
              .add(parseInt(process.env.PRE_PASSWORD_EXPIRY_ALERT_DAYS), "day")
              .format("YYYY-MM-DD"),
            [Op.gt]: moment().format("YYYY-MM-DD"),
          },
        },
        attributes: ["name", "email", "passwordExpiryDate"],
        include: [
          {
            model: db.companyMaster,
            attributes: ["companyName"],
          },
        ],
      });
      for (const element of existsUserData) {
        eventEmitter.emit(
          "prePasswordExpiry",
          JSON.stringify({
            name: element.dataValues.name,
            email: element.dataValues.email,
            passwordExpiryDate: moment(
              element.dataValues.passwordExpiryDate
            ).format("DD-MM-YYYY"),
            companyName: element.dataValues.companymaster.companyName,
            daysLeft: moment(element.dataValues.passwordExpiryDate).diff(
              moment(),
              "days"
            ),
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async postPasswordExpiryNotification() {
    try {
      const existsUserData = await db.employeeMaster.findAll({
        where: {
          isActive: 1,
          passwordExpiryDate: {
            [Op.lt]: moment().format("YYYY-MM-DD"),
            [Op.gte]: moment()
              .subtract(
                parseInt(process.env.POST_PASSWORD_EXPIRY_ALERT_DAYS),
                "day"
              )
              .format("YYYY-MM-DD"),
          },
        },
        attributes: ["name", "email", "passwordExpiryDate"],
        include: [
          {
            model: db.companyMaster,
            attributes: ["companyName"],
          },
        ],
      });

      for (const element of existsUserData) {
        eventEmitter.emit(
          "postPasswordExpiry",
          JSON.stringify({
            name: element.dataValues.name,
            email: element.dataValues.email,
            passwordExpiryDate: moment(
              element.dataValues.passwordExpiryDate
            ).format("DD-MM-YYYY"),
            companyName: element.dataValues.companymaster.companyName,
            daysLeft: moment().diff(
              moment(element.dataValues.passwordExpiryDate),
              "days"
            ),
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
  async newJoinEmployee() {
    try {
      let today = moment().format("YYYY-MM-DD");
      let condition = { createdAt: { [Op.gte]: `${today} 00:00:00` } };
      let attributes = [
        "empCode",
        "name",
        "personalEmail",
        "personalMobileNumber",
        "dateOfJoining",
        "manager",
        "designation_id",
        "buId",
      ];

      let docs = await db.employeeMaster.findAll({
        where: condition,
        attributes: attributes,
        include: [
          {
            model: db.employeeMaster,
            attributes: ["id", "empCode"],
            as: "managerData",
          },
          {
            model: db.designationMaster,
            attributes: ["designationId", "name", "code"],
          },
          { model: db.buMaster, attributes: ["buId", "buName"] },
          {
            model: db.companyLocationMaster,
            attributes: [
              "companyLocationId",
              "address1",
              "companyLocationCode",
            ],
            include: [{ model: db.cityMaster, attributes: ["cityName"] }],
          },
          {
            model: db.jobDetails,
            attributes: ["jobId", "jobLevelId"],
            include: [
              { model: db.jobLevelMaster, attributes: ["jobLevelCode"] },
            ],
          },
          {
            model: db.biographicalDetails,
            attributes: ["mobileAccess", "laptopSystem"],
          },
          {
            model: db.emergencyDetails,
            attributes: ["emergencyContactNumber", "emergencyBloodGroup"],
          },
        ],
      });

      console.log("New Joining Employee Cron", docs.length);

      if (docs.length > 0) {
        const sheetName = `uploads/temp/NewJoinEmployee_${today}`; //+ dt.getTime();
        fs.writeFileSync(sheetName + ".xlsx", "", { flag: "a+" }, (err) => {
          if (err) {
            console.error("Error writing file:", err);
            return;
          }
          console.log("File created successfully!");
        });

        let data = [
          {
            sheet: `Sheet1`,
            columns: [
              { label: "Employee_TMC", value: "empCode" },
              { label: "Employee_Name", value: "name" },
              {
                label: "Employee_Designation",
                value: (row) =>
                  row.designationmaster ? row.designationmaster.name : "-",
              },
              { label: "DateOfJoining", value: "dateOfJoining" },
              {
                label: "Office_City",
                value: (row) =>
                  row.companylocationmaster
                    ? row.companylocationmaster.citymaster.cityName
                    : "-",
              },
              {
                label: "Employee_Grade",
                value: (row) =>
                  row.employeejobdetail.joblevelmaster
                    ? row.employeejobdetail.joblevelmaster.jobLevelCode
                    : "-",
              },
              {
                label: "Business_Unit",
                value: (row) => (row.bumaster ? row.bumaster.buName : "-"),
              },
              { label: "Personal_Email", value: "personalEmail" },
              {
                label: "ReportingManager_TMC",
                value: (row) =>
                  row.managerData ? row.managerData.empCode : "-",
              },
              { label: "Mobile_No", value: "personalMobileNumber" },
              {
                label: "IsLaptop",
                value: (row) =>
                  row.employeebiographicaldetail
                    ? row.employeebiographicaldetail.laptopSystem
                    : "-",
              },
              {
                label: "IsMobile",
                value: (row) =>
                  row.employeebiographicaldetail.mobileAccess === true
                    ? "Yes"
                    : row.employeebiographicaldetail.mobileAccess === false
                    ? "No"
                    : "-",
              },
              {
                label: "Blood_Group",
                value: (row) =>
                  row.employeeemergencycontact
                    ? row.employeeemergencycontact.emergencyBloodGroup
                    : "-",
              },
              {
                label: "Emergency_ContactNo",
                value: (row) =>
                  row.employeeemergencycontact
                    ? row.employeeemergencycontact.emergencyContactNumber
                    : "-",
              },
            ],
            content: docs,
          },
        ];

        const settings = {
          fileName: sheetName,
          extraLength: 3,
          writeMode: "writeFile",
          writeOptions: {},
          RTL: false,
        };

        let current = moment().format("DD-MMM-YYYY HH:mm");
        let yesterday = moment().subtract(1, "days");
        yesterday = moment(yesterday).format("DD-MMM-YYYY HH:mm");

        xlsx(data, settings, () => {
          // return res.download(sheetName + ".xlsx");
          eventEmitter.emit(
            "newJoinEmployeeMail",
            JSON.stringify({
              today: today,
              current: current,
              yesterday: yesterday,
            })
          );
        });
      }
    } catch (error) {
      logger.error("Error while export new join employee report", error);
      // return respHelper(res, { status: 500, msg: error?.parent?.sqlMessage });
    }
  }

  ///CONFIRMATION
  async generateConfirmation() {
    const confimationData = await db.jobDetails.findAll({
      where: {
        dateOfProbationTriggerDate: {
          [Op.eq]: moment().format("YYYY-MM-DD"), // Fetch records where slaEndDate is less than today
        },
        confirmationGenerated: 0,
      },
      attributes: ["userId", "jobLevelId", "dateOfProbationEnd"],
      include: {
        model: db.employeeMaster,
        attributes: [
          "id",
          "name",
          "confimationPolicyAutoId",
          "manager",
          "empCode",
        ],
        required: true,
        where: {
          isActive: 1,
        },
        include: [
          {
            model: db.Confimationpolicy,
            required: true,
            where: {
              isActive: 1,
            },
          },
          {
            model: db.designationMaster,
            required: true,
            attributes: ["designationId", "name"],
          },
        ],
      },
    });

    for (const Singleconfimation of confimationData) {
      let checkJobLevelAssignmnet = await db.Confirmationassignment.findOne({
        where: {
          confirmationAssignmentAutoId:
            Singleconfimation?.employee?.confimationpolicy?.confirmationAssignmentAutoId.split(
              ","
            ),
          jobLevelId: {
            [Op.or]: [
              { [Op.like]: `${Singleconfimation.jobLevelId},%` },
              { [Op.like]: `%,${Singleconfimation.jobLevelId},%` },
              { [Op.like]: `%,${Singleconfimation.jobLevelId}` },
              { [Op.eq]: `${Singleconfimation.jobLevelId}` },
            ],
          },
        },
      });
      if (checkJobLevelAssignmnet) {
        let respfrom = await helper.generateFieldsForgivenLevel(
          Singleconfimation?.employee?.confimationPolicyAutoId,
          1
        );
        if (respfrom.levelFound) {
          const createdData = await db.Confirmationinitiated.create({
            employeeId: Singleconfimation?.userId,
            level: respfrom.level,
            triggerDate: moment().format("YYYY-MM-DD"),
            dueDate: Singleconfimation?.dateOfProbationEnd,
            createdBy: 1,
            status: 0,
            confirmationExtentionCount: 0,
            confirmationExtentionCountAllowed:
              Singleconfimation?.employee?.confimationpolicy
                ?.confirmationExtention,
          });
          await db.Confirmationaudittrail.create({
            confirmationinitiatedAutoId:
              createdData.confirmationinitiatedAutoId,
            createdBy: 1,
            status: 1,
            level: 0,
            message: "Confirmation Initiated",
            confirmationAction: 0,
          });
          await db.jobDetails.update(
            {
              confirmationGenerated: 1,
            },
            {
              where: {
                userId: Singleconfimation.userId,
              },
            }
          );
          let EMP_DATA_SELF = await helper.getEmpProfile(
            Singleconfimation?.userId
          ); // SELF Manager
          // if (respfrom.level == 1) {
          let ownerId = 0;
          if (respfrom?.levelData?.ownerRole == "SELF") {
            ownerId = Singleconfimation?.userId;
          } else if (respfrom?.levelData?.ownerRole == "MANAGER") {
            ownerId = EMP_DATA_SELF?.managerData?.id;
          } else if (respfrom?.levelData?.ownerRole == "L2_MANAGER") {
            let EMP_DATA = await helper.getEmpProfile(
              EMP_DATA_SELF?.managerData?.id
            ); // L2 Manager
            ownerId = EMP_DATA?.id;
          } else if (respfrom?.levelData?.ownerRole == "ADMIN") {
            let admin = await db.employeeMaster.findOne({
              where: {
                role_id: 2,
                isActive: 1,
              },
            });
            ownerId = admin?.id;
          } else if (respfrom?.levelData?.ownerRole == "BUHR") {
            ownerId = EMP_DATA_SELF?.buHRId;
          }
          if (respfrom?.levelData?.ownerRole == "SELF") {
            await db.Confirmationaudittrail.create({
              confirmationinitiatedAutoId:
                createdData.confirmationinitiatedAutoId,
              createdBy: 1,
              status: 0,
              level: 0,
              message: `Pending for Confirmation By ${Singleconfimation?.employee?.name} (${Singleconfimation?.employee?.empCode})`,
              confirmationAction: 0,
            });
            // eventEmitter.emit(
            //   "selfReviewConfirnation",
            //   JSON.stringify(Singleconfimation)
            // );
          } else {
            let ESCALTERDATA = await helper.getEmpProfile(ownerId); // NEXT Status DATA
            await db.Confirmationaudittrail.create({
              confirmationinitiatedAutoId:
                createdData.confirmationinitiatedAutoId,
              createdBy: 1,
              status: 0,
              level: 0,
              message: `Pending for Confirmation By ${ESCALTERDATA?.name} (${ESCALTERDATA?.empCode})`,
              confirmationAction: 0,
            });

            // eventEmitter.emit(
            //   "confirmationWorkflowNextLevel",
            //   JSON.stringify({
            //     ESCALTERDATA: ESCALTERDATA,
            //     EMP_DATA: EMP_DATA_SELF,
            //   })
            // );
          }

          ///ADMIN VIEW
          await db.Confirmationowners.create({
            confirmationinitiatedAutoId:
              createdData.confirmationinitiatedAutoId,
            employeeId: 1982,
            level: respfrom.level,
            canTakeAction: 1,
            canTakeActionExtend: 1,
            confirmationFormGroupId:
              respfrom?.levelData?.confirmationFormGroupId,
            slaEndDate: null,
            createdBy: 1,
          });
          ///ADMIN VIEW
          await db.Confirmationowners.create({
            confirmationinitiatedAutoId:
              createdData.confirmationinitiatedAutoId,
            employeeId: ownerId,
            level: respfrom.level,
            canTakeAction: 1,
            canTakeActionExtend:
              respfrom?.levelData?.ownerRole == "SELF" ? 0 : 1,
            confirmationFormGroupId:
              respfrom?.levelData?.confirmationFormGroupId,
            slaEndDate: moment()
              .add(respfrom?.levelData?.maxCompletionDay, "days")
              .format("YYYY-MM-DD"),
            createdBy: 1,
          });
          const formFields = await db.Confirmatoinformfields.findAll({
            where: {
              confirmationFormGroupId:
                respfrom?.levelData?.confirmationFormGroupId,
              level: respfrom.level,
            },
          });
          let bulkArray = [];
          for (const formField of formFields) {
            bulkArray.push({
              confirmationinitiatedAutoId:
                createdData.confirmationinitiatedAutoId,
              confirmationFormGroupId: formField.confirmationFormGroupId,
              confirmatoinformfieldsAutoId:
                formField.confirmatoinformfieldsAutoId,
              employeeId: ownerId,
              values: "",
              level: respfrom.level,
              createdBy: 1,
            });
          }
          if (bulkArray.length > 0) {
            await db.Confirmationformfilledvalues.bulkCreate(bulkArray);
          }
          // }
        }
      }
    }
  }
  async checkSLAOfConfirmation() {
    let givenTimeExpiredRecordsFromLevel = await db.Confirmationowners.findAll({
      where: {
        slaEndDate: {
          [Op.lte]: moment().format("YYYY-MM-DD"), // Fetch records where slaEndDate is less than today
        },
        isCompleted: 0,
        escalted:0
      },
      include: [
        {
          model: db.employeeMaster,
          attributes: ["empCode", "name", "id"],
          where: {
            isActive: 1,
          },
          include: {
            model: db.employeeMaster,
            required: true,
            attributes: ["id", "name", "empCode"],
            as: "managerData",
            where: {
              isActive: 1,
            },
          },
        },
        {
          model: db.Confirmationinitiated,
          include: {
            model: db.employeeMaster,
            where: {
              isActive: 1,
            },
          },
          where: {
            status: 0,
            onHold: 0,
          },
        },
      ],
    });
    for (const singleRecords of givenTimeExpiredRecordsFromLevel) {
      let levelownerData = await db.Confirmationpolicyworkflow.findOne({
        where: {
          confimationPolicyAutoId:
            singleRecords?.confirmationinitiated?.employee
              ?.confimationPolicyAutoId,
          isEnable: 1,
          level: singleRecords?.level,
        },
      });

      if (levelownerData) {
        let ESCALTERDATA = await helper.getEmpProfile(
          singleRecords?.employee?.managerData?.id
        ); // ESCLATER DATA
        let EMP_DATA = await helper.getEmpProfile(
          singleRecords?.confirmationinitiated?.employee?.id
        ); // EMP DATA

        // eventEmitter.emit(
        //   "confirmationSLABreachEmailBody",
        //   JSON.stringify({
        //     ESCALTERDATA: ESCALTERDATA,
        //     EMP_DATA: EMP_DATA,
        //   })
        // );

        await db.Confirmationowners.update(
          {
            escalted:1
          },
          {
            where: {
          confirmationinitiatedAutoId:
          singleRecords.confirmationinitiatedAutoId,
          level: singleRecords?.level,
            },
          }
        );

        await db.Confirmationowners.create({
          confirmationinitiatedAutoId:
            singleRecords.confirmationinitiatedAutoId,
          employeeId: singleRecords?.employee?.managerData?.id,
          level: singleRecords?.level,
          canTakeAction: singleRecords?.canTakeAction,
          canTakeActionExtend: singleRecords?.canTakeActionExtend,
          confirmationFormGroupId: singleRecords?.confirmationFormGroupId,
          // slaEndDate: moment()
          //   .add(levelownerData.maxCompletionDay, "days")
          //   .format("YYYY-MM-DD"),
          createdBy: 1,
        });
      }

      await db.Confirmationaudittrail.create({
        confirmationinitiatedAutoId: singleRecords.confirmationinitiatedAutoId,
        createdBy: 1,
        status: 0,
        level: singleRecords.level,
        message: `not Completed by level ${singleRecords.level} ${singleRecords?.employee?.name} (${singleRecords?.employee?.empCode}) , escalated to  ${singleRecords?.employee?.managerData?.name} (${singleRecords?.employee?.managerData?.empCode})`,
        confirmationAction: 0,
      });
    }
  }
  async checkConfirmatonHold() {
    let givenTimeExpiredRecordsFromLevel =
      await db.Confirmationinitiated.findAll({
        where: {
          dueDate: {
            [Op.lte]: moment().format("YYYY-MM-DD"), // Fetch records where slaEndDate is less than today
          },
          status: 0,
          onHold: 0,
        },
      });
    for (const element of givenTimeExpiredRecordsFromLevel) {
      let empAndPolicyData = await db.employeeMaster.findOne({
        where: {
          id: element.employeeId,
        },
        include: {
          model: db.Confimationpolicy,
          required: true,
          where: {
            isActive: 1,
          },
        },
      });
      if (empAndPolicyData) {
        await db.Confirmationinitiated.update(
          {
            onHold: 1,
            holdEndDate: moment()
              .add(empAndPolicyData?.confimationpolicy.holdDays, "days")
              .format("YYYY-MM-DD"),
          },
          {
            where: {
              confirmationinitiatedAutoId: element?.confirmationinitiatedAutoId,
            },
          }
        );
      }
    }
  }
  async checkExtentionEnd() {
    let extentionEndList = await db.Confirmationinitiated.findAll({
      where: {
        status: 2,
        onHold: 0,
      },
      include: {
        model: db.employeeMaster,
        required: true,
        attributes: ["id", "name", "confimationPolicyAutoId"],
        include: [
          {
            model: db.Confimationpolicy,
            required: true,
            where: {
              isActive: 1,
            },
            include: {
              model: db.Confirmationpolicyworkflow,
              required: true,
            },
          },
          {
            model: db.jobDetails,
            attributes: ["jobId", "dateOfJoining", "dateOfProbationEnd"],
            required: true,
            where: {
              dateOfProbationTriggerDate: {
                [Op.eq]: moment().format("YYYY-MM-DD"), // Fetch records where slaEndDate is less than today
              },
            },
          },
        ],
      },
    });
    for (const singleextentionEndList of extentionEndList) {
      let workflows =
        singleextentionEndList?.employee?.confimationpolicy
          ?.confimationpolicyworkflows;
      let actualWorkFlow = workflows.find(
        (workflow) => workflow.level === singleextentionEndList.level
      );
      if (actualWorkFlow) {
        let lastOwner = await db.Confirmationowners.findOne({
          where: {
            confirmationinitiatedAutoId:
              singleextentionEndList.confirmationinitiatedAutoId,
            level: singleextentionEndList.level,
          },
        });

        await db.Confirmationinitiated.update(
          {
            status: 0,
          },
          {
            where: {
              confirmationinitiatedAutoId:
                singleextentionEndList.confirmationinitiatedAutoId,
            },
          }
        );

        let EMP_DATA_SELF = await db.employeeMaster.findOne({
          where: {
            id: singleextentionEndList.employeeId,
          },
        });

        let ESCALTERDATA = await helper.getEmpProfile(lastOwner.employeeId); // NEXT Status DATA

        // eventEmitter.emit(
        //   "confirmationWorkflowNextLevel",
        //   JSON.stringify({
        //     ESCALTERDATA: ESCALTERDATA,
        //     EMP_DATA: EMP_DATA_SELF,
        //   })
        // );

        await db.Confirmationaudittrail.create({
          confirmationinitiatedAutoId:
            singleextentionEndList.confirmationinitiatedAutoId,
          createdBy: 1,
          status: 1,
          level: singleextentionEndList.level,
          message: `Confirmation Re-Initiated for approval at ${ESCALTERDATA.name} (${ESCALTERDATA.empCode})`,
          confirmationAction: 0,
        });

        await db.Confirmationowners.update(
          {
            canTakeAction: actualWorkFlow?.isEnable == 1 ? 1 : 0,
            canTakeActionExtend: actualWorkFlow?.isEnable == 1 ? 1 : 0,
            isCompleted: 0,
          },
          {
            where: {
              confirmationinitiatedAutoId:
                singleextentionEndList.confirmationinitiatedAutoId,
              level: singleextentionEndList.level,
            },
          }
        );
      }
    }
  }
  async generatConfiramtionletter() {
    let whoseConfirmationDateIsTodayList =
      await db.Confirmationinitiated.findAll({
        where: {
          status: 1,
        },
        include: {
          model: db.employeeMaster,
          required: true,
          attributes: ["id", "name", "confimationPolicyAutoId"],
          include: [
            {
              model: db.jobDetails,
              attributes: [
                "jobId",
                "dateOfJoining",
                "dateOfProbationEnd",
                "confirmationDate",
              ],
              required: true,
              where: {
                dateOfProbationEnd: {
                  [Op.lte]: moment().format("YYYY-MM-DD"), // Fetch records where slaEndDate is less than today
                },
                confirmationDate: {
                  [Op.is]: null, // This checks if the column `confirmationDate` is null
                },
              },
            },
          ],
        },
      });
    for (const SingleConfirmationDateIsTodayList of whoseConfirmationDateIsTodayList) {
      const confirmationData = await db.Confirmationinitiated.findOne({
        where: {
          confirmationinitiatedAutoId:
            SingleConfirmationDateIsTodayList?.confirmationinitiatedAutoId,
        },
      });
      if (confirmationData) {
        await db.jobDetails.update(
          {
            confirmationDate:
              SingleConfirmationDateIsTodayList?.employee?.employeejobdetail
                ?.dateOfProbationEnd,
          },
          {
            where: {
              userId: SingleConfirmationDateIsTodayList?.employeeId,
            },
          }
        );

        const employeeData = await db.jobDetails.findOne({
          where: {
            userId: SingleConfirmationDateIsTodayList?.employeeId,
          },
          attributes: ["userId", "jobLevelId", "dateOfProbationEnd"],
          include: {
            model: db.employeeMaster,
            attributes: ["id", "name", "confimationPolicyAutoId"],
            require: true,
            where: {
              isActive: 1,
            },
            include: {
              model: db.Confimationpolicy,
              require: true,
              where: {
                isActive: 1,
              },
            },
          },
        });

        let EMP_DATA_SELF = await helper.getEmpProfile(
          SingleConfirmationDateIsTodayList?.employeeId
        ); // SELF Manager
        let signatureAuthority = await helper.getSigningAuthorityDate(
          "CONFIRMATION",
          EMP_DATA_SELF
        ); // SELF Manager

        const confirmationPolicyData = await db.Confimationpolicy.findOne({
          where: {
            confimationPolicyAutoId:
              employeeData?.employee?.confimationPolicyAutoId,
          },
          attributes: [
            "confiramtionEmailCC",
            "confiramtionRequestEmailCC",
            "extendEmailCC",
          ],
        });
        let cc_arrays = [];
        if (confirmationPolicyData) {
          let holdRowCCData =
            confirmationPolicyData?.dataValues?.confiramtionEmailCC.split(",");
          if (holdRowCCData.length > 0) {
            for (const single_cc_array of holdRowCCData) {
              if (single_cc_array == "MANAGER") {
                cc_arrays.push(
                  EMP_DATA_SELF?.dataValues.managerData?.dataValues?.email
                );
              } else if (single_cc_array == "BUHR") {
                cc_arrays.push(
                  EMP_DATA_SELF?.dataValues?.buhrData?.dataValues?.email
                );
              }
            }
          }
        }

        // eventEmitter.emit(
        //   "confirmationLetter",
        //   JSON.stringify({
        //     EMP_DATA_SELF: EMP_DATA_SELF,
        //     confirmationData: confirmationData,
        //     signatureAuthority: signatureAuthority,
        //     cc: cc_arrays.join(","),
        //   })
        // );
      }
    }
  }
  ///CONFIRMATION
  async updateDesignation() {
    const docs = await db.DesignationEmploymentHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });

    if (docs.length > 0) {
      for (const element of docs) {
        let lastDayDate = moment(element.fromDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        const currentDataOfTheEmployee =
          await db.DesignationEmploymentHistory.findOne({
            raw: true,
            where: {
              needAttendanceCron: 0,
              toDate: {
                [Op.eq]: null,
              },
              employeeId: element.employeeId,
            },
          });

        if (currentDataOfTheEmployee) {
          //MARKING LAST DESIGNATION WITH LAST DATE

          await db.DesignationEmploymentHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentDataOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST DESIGNATION WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.DesignationEmploymentHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE DESIGNATION TO EMP MASTER TABLE

        let updateDone = await db.employeeMaster.update(
          {
            designation_id: element.designation_id,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );
      }
    }
  }

  async updateDepartment() {
    const docs = await db.DepartmentEmploymentHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });

    if (docs.length > 0) {
      for (const element of docs) {
        let lastDayDate = moment(element.fromDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        const currentDataOfTheEmployee =
          await db.DepartmentEmploymentHistory.findOne({
            raw: true,
            where: {
              needAttendanceCron: 0,
              toDate: {
                [Op.eq]: null,
              },
              employeeId: element.employeeId,
            },
          });

        if (currentDataOfTheEmployee) {
          //MARKING LAST DEPARTMENT WITH LAST DATE

          await db.DepartmentEmploymentHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentDataOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST DEPARTMENT WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.DepartmentEmploymentHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE DEPARTMENT TO EMP MASTER TABLE

        let updateDone = await db.employeeMaster.update(
          {
            buId: element.buId,
            sbuId: element.sbuId,
            buHRId: element.buHRId,
            buHeadId: element.buHeadId,
            departmentId: element.departmentId,
            functionalAreaId: element.functionalAreaId,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );
      }
    }
  }

  async updateCostCenter() {
    const docs = await db.CostCenterEmploymentHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });

    if (docs.length > 0) {
      for (const element of docs) {
        let lastDayDate = moment(element.fromDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        const currentDataOfTheEmployee =
          await db.CostCenterEmploymentHistory.findOne({
            raw: true,
            where: {
              needAttendanceCron: 0,
              toDate: {
                [Op.eq]: null,
              },
              employeeId: element.employeeId,
            },
          });

        if (currentDataOfTheEmployee) {
          //MARKING LAST COST CENTER WITH LAST DATE

          await db.CostCenterEmploymentHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentDataOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST DEPARTMENT WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.CostCenterEmploymentHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE COST CENTER TO EMP MASTER TABLE

        let updateDone = await db.employeeMaster.update(
          {
            costId: element.costId,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );
      }
    }
  }

  async updateCompanyLocation() {
    const docs = await db.OfficeLocationEmploymentHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });

    if (docs.length > 0) {
      for (const element of docs) {
        let lastDayDate = moment(element.fromDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        const currentDataOfTheEmployee =
          await db.OfficeLocationEmploymentHistory.findOne({
            raw: true,
            where: {
              needAttendanceCron: 0,
              toDate: {
                [Op.eq]: null,
              },
              employeeId: element.employeeId,
            },
          });

        if (currentDataOfTheEmployee) {
          //MARKING LAST COMPANY LOCATION WITH LAST DATE

          await db.OfficeLocationEmploymentHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentDataOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST COMPANY LOCATION WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.OfficeLocationEmploymentHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE COMPANY LOCATION TO EMP MASTER TABLE

        let updateDone = await db.employeeMaster.update(
          {
            companyLocationId: element.companyLocationId,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );
      }
    }
  }

  async updateJobLevel() {
    const docs = await db.JobLevelEmploymentHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });

    if (docs.length > 0) {
      for (const element of docs) {
        let lastDayDate = moment(element.fromDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        const currentDataOfTheEmployee =
          await db.JobLevelEmploymentHistory.findOne({
            raw: true,
            where: {
              needAttendanceCron: 0,
              toDate: {
                [Op.eq]: null,
              },
              employeeId: element.employeeId,
            },
          });

        if (currentDataOfTheEmployee) {
          //MARKING LAST JOB LEVEL WITH LAST DATE

          await db.JobLevelEmploymentHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentDataOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST JOB LEVEL WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.JobLevelEmploymentHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE JOB LEVEL TO EMP MASTER TABLE

        let updateDone = await db.jobDetails.update(
          {
            bandId: element.bandId,
            gradeId: element.gradeId,
            jobLevelId: element.jobLevelId,
          },
          {
            where: {
              userId: element.employeeId,
            },
          }
        );
      }
    }
  }

  async updateEmployeeType() {
    const docs = await db.EmployeeTypeEmploymentHistory.findAll({
      raw: true,
      where: {
        fromDate: moment().format("YYYY-MM-DD"),
        needAttendanceCron: 1,
      },
    });

    if (docs.length > 0) {
      for (const element of docs) {
        let lastDayDate = moment(element.fromDate)
          .subtract(1, "day")
          .format("YYYY-MM-DD");

        const currentDataOfTheEmployee =
          await db.EmployeeTypeEmploymentHistory.findOne({
            raw: true,
            where: {
              needAttendanceCron: 0,
              toDate: {
                [Op.eq]: null,
              },
              employeeId: element.employeeId,
            },
          });

        if (currentDataOfTheEmployee) {
          //MARKING LAST EMPLOYEE TYPE WITH LAST DATE

          await db.EmployeeTypeEmploymentHistory.update(
            {
              toDate: lastDayDate,
              updatedBy: 1,
            },
            {
              where: {
                id: currentDataOfTheEmployee.id,
              },
            }
          );
          //MARKING LAST EMPLOYEE TYPE WITH LAST DATE
        }
        //DISBALE CURRENT DATE DATA
        await db.EmployeeTypeEmploymentHistory.update(
          {
            needAttendanceCron: 0,
            updatedBy: 1,
          },
          {
            where: {
              id: element.id,
            },
          }
        );
        //DISBALE CURRENT DATE DATA

        //UPDATE EMPLOYEE TYPE TO EMP MASTER TABLE

        let updateDone = await db.employeeMaster.update(
          {
            employeeType: element.employeeType,
          },
          {
            where: {
              id: element.employeeId,
            },
          }
        );
      }
    }
  }

  async onBoardLeaveMapping(){
    try {
      const employees = await db.employeeMaster.findAll({
        attributes: ["id", "empCode", "employeeType"],
        where: {
          isActive: 1,
          employeeType: [1,4,5]
          //empCode:20492
        },
        include: [
          {
            model: db.biographicalDetails,
            attributes:['biographicalId','maritalStatus','gender']
          },
          {
            model: db.leaveMapping,
            attributes: ["leaveMappingId", "EmployeeId"],
            as: "employeeLeaves",
            required: false, // Fetch employees even if there are no leave mappings
          },
        ],
      });

      const leaveMaster = await db.leaveMaster.findAll({
        attributes:['leaveId','defaultLeaveCount'],
        where: {
          leaveId: {
            [Op.in]: [3, 4, 5]
          }          
        }
      })

      const filteredEmployees = employees.filter(
        (employee) => employee.employeeLeaves.length === 0
      );
      

      const leaveMasterLookup = leaveMaster.reduce((acc, leave) => {
        acc[leave.leaveId] = leave.defaultLeaveCount;
        return acc;
      }, {});
      
      for (let index = 0; index < filteredEmployees.length; index++) {
        const element = filteredEmployees[index]; 
        const { gender, maritalStatus } = element.dataValues.employeebiographicaldetail;
        if ((gender === "Male" || gender === "Female") && maritalStatus == 2) {
          console.log("Male single or Female single");
          const objLeave = {
            EmployeeId: element.id,
            leaveAutoId: 5,
            availableLeave: leaveMasterLookup[5] || 0, 
            accruedThisYear: leaveMasterLookup[5] || 0
          };
          console.log("objLeave",objLeave)
          // await db.leaveMapping.create(objLeave);
        }
  
        if (gender === "Male" && maritalStatus == 1) {
          const objLeave = {
            EmployeeId: element.id,
            leaveAutoId: 4,
            availableLeave: leaveMasterLookup[4] || 0, 
            accruedThisYear: leaveMasterLookup[4] || 0
          };
          // await db.leaveMapping.create(objLeave);
        }
  
        if (gender === "Female" && maritalStatus == 1) {
          const objLeave = {
            EmployeeId: element.id,
            leaveAutoId: 3,
            availableLeave: leaveMasterLookup[3] || 0, 
            accruedThisYear: leaveMasterLookup[3] || 0
          };
          // await db.leaveMapping.create(objLeave);
        }
      }

      // return respHelper(res, {
      //   status: 200,
      //   message: "Leave updated successfully",
      //   data: filteredEmployees.length,
      // });
    
    } catch (error) {
      console.log(error);
      return respHelper(res, {
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
}

export default new CronController();
