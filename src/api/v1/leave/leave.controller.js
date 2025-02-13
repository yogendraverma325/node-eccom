import respHelper from "../../../helper/respHelper.js";
import db from "../../../config/db.config.js";
import moment from "moment";
import message from "../../../constant/messages.js";
import validator from "../../../helper/validator.js";
import helper from "../../../helper/helper.js";
import eventEmitter from "../../../services/eventService.js";
import { Op } from "sequelize";

var _this = this;

class LeaveController {
	async history(req, res) {
		try {
			const user = req.query.user;
			const year = req.query.year;
			const month = req.query.month;

			const attendanceData = await db.employeeLeaveTransactions.findAndCountAll(
				{
					where: {
						employeeId: user ? user : req.userId,
						appliedFor: {
							[Op.and]: [
								{ [Op.gte]: `${year}-${month}-01` },
								{
									[Op.lte]: `${year}-${month}-${moment(
										`${year}-${month}`,
										"YYYY-MM",
									).daysInMonth()}`,
								},
							],
						},
					},
				},
			);

			return respHelper(res, {
				status: 200,
				data: attendanceData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async leaveMapping(req, res) {
		try {
			const userId = req.query.user || req.userId;
			let leaveData = await helper.empLeaveDetails(userId, 0);
			return respHelper(res, {
				status: 200,
				data: leaveData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async leaveRequestList(req, res) {
		try {
			const query = req.query.listFor;
			const user = req.query.user;
			const regularizeList = await db.EmployeeLeaveHeader.findAll({
				where: Object.assign(
					query === "raisedByMe"
						? {
								employeeId: req.userId,
								source: { [Op.ne]: "system_generated" },
								status: "pending",
							}
						: {
								pendingAt: req.userId,
								status: "pending",
								...(user && { employeeId: user }),
							},
				),

				attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name"],
					},
					{
						model: db.leaveMaster,
						required: false,
						as: "leaveMasterDetails",
						attributes: ["leaveName", "leaveCode"],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: regularizeList,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateLeaveRequest(req, res) {
		try {
			const result = await validator.updateLeaveRequest.validateAsync(req.body);

			let leaveIds = result.employeeLeaveTransactionsIds.split(",");
			let countLeave = await db.EmployeeLeaveHeader.count({
				where: {
					status: "pending",
					pendingAt: req.userId,
					employeeleaveheaderID: leaveIds,
				},
			});

			if (leaveIds.length != countLeave) {
				return respHelper(res, {
					status: 402,
					msg: message.LEAVE.NO_UPDATE,
				});
			}
			await db.employeeLeaveTransactions.update(
				{
					status: result.status,
					updatedBy: req.userId,
					managerRemark: result.remark != "" ? result.remark : null,
					updatedAt: moment(),
				},
				{
					where: {
						employeeleaveheaderID: leaveIds,
					},
				},
			);
			await db.EmployeeLeaveHeader.update(
				{
					status: result.status,
					updatedBy: req.userId,
					managerRemark: result.remark != "" ? result.remark : null,
					updatedAt: moment(),
				},
				{
					where: {
						employeeleaveheaderID: leaveIds,
					},
				},
			);
			if (result.status == "approved") {
				for (const leaveID of leaveIds) {
					let leaveHeaderSingleRecords = await db.EmployeeLeaveHeader.findOne({
						where: {
							employeeleaveheaderID: leaveID,
						},
					});
					console.log("action on comp"),
						console.log({
							employeeId: leaveHeaderSingleRecords.employeeId,
							employeeLeaveTransactionsIds: leaveID,
							status: 1,
							remarks: result.remark != "" ? result.remark : null,
							userId: req.userId,
						});
					if (
						leaveHeaderSingleRecords &&
						leaveHeaderSingleRecords.leaveAutoId == 9
					) {
						const employeeId = leaveHeaderSingleRecords.employeeId;
						const employeeLeaveTransactionsIds = leaveID;
						const status = 1;
						const remarks = result.remark != "" ? result.remark : null;
						const userId = req.userId;

						await helper.actionOnLeaveCompOff(
							employeeId,
							employeeLeaveTransactionsIds,
							status,
							remarks,
							userId,
						);
					}

					const existingRecord = await db.employeeLeaveTransactions.findOne({
						where: { employeeleaveheaderID: leaveID },
					});

					if (existingRecord) {
						await db.attendanceMaster.update(
							Object.assign(
								existingRecord.dataValues.isHalfDay === 0 ||
									existingRecord.dataValues.halfDayFor === 1
									? {
											attendanceLateBy: "00:00:00",
										}
									: {},
							),
							{
								where: {
									attendanceDate: existingRecord.dataValues.appliedFor,
									employeeId: existingRecord.dataValues.employeeId,
								},
							},
						);

						if (
							existingRecord.leaveAutoId === 6 ||
							existingRecord.leaveAutoId === 9
						) {
							const lwpLeave = await db.leaveMapping.findOne({
								where: {
									EmployeeId: existingRecord.employeeId,
									leaveAutoId: existingRecord.leaveAutoId,
								},
							});

							if (lwpLeave) {
								await db.leaveMapping.increment(
									{ utilizedThisYear: parseFloat(existingRecord.leaveCount) },
									{
										where: {
											EmployeeId: existingRecord.employeeId,
											leaveAutoId: existingRecord.leaveAutoId,
										},
									},
								);
							} else {
								await db.leaveMapping.create({
									EmployeeId: existingRecord.employeeId,
									leaveAutoId: existingRecord.leaveAutoId,
									availableLeave: 0,
									utilizedThisYear: parseFloat(existingRecord.leaveCount),
									creditedFromLastYear: 0,
									annualAllotment: 0,
									accruedThisYear: 0,
								});
							}
						} else {
							await db.leaveMapping.increment(
								{ utilizedThisYear: parseFloat(existingRecord.leaveCount) },
								{
									where: {
										EmployeeId: existingRecord.employeeId,
										leaveAutoId: existingRecord.leaveAutoId,
									},
								},
							);
							await db.leaveMapping.increment(
								{ availableLeave: -parseFloat(existingRecord.leaveCount) },
								{
									where: {
										EmployeeId: existingRecord.employeeId,
										leaveAutoId: existingRecord.leaveAutoId,
									},
								},
							);
						}
					}
					//  else {
					// await db.User.create(record, { transaction });
					// }
				}
			}

			for (const leaveID of leaveIds) {
				const leaveTransactionDetails =
					await db.employeeLeaveTransactions.findOne({
						raw: true,
						where: {
							employeeleaveheaderID: leaveID,
						},
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "email"],
								include: [
									{
										model: db.employeeMaster,
										as: "managerData",
										attributes: ["name"],
									},
								],
							},
							{
								model: db.leaveMaster,
								as: "leaveMasterDetails",
								attributes: ["leaveName"],
							},
						],
						attributes: ["fromDate", "toDate"],
					});

				const obj = {
					email: leaveTransactionDetails["employee.email"],
					status: result.status === "approved" ? "Approved" : "Rejected",
					fromDate: leaveTransactionDetails.fromDate,
					toDate: leaveTransactionDetails.toDate,
					leaveType: leaveTransactionDetails["leaveMasterDetails.leaveName"],
					managerName: leaveTransactionDetails["employee.managerData.name"],
					requesterName: leaveTransactionDetails["employee.name"],
				};
				eventEmitter.emit("leaveAckMail", JSON.stringify(obj));
			}

			return respHelper(res, {
				status: 200,
				data: countLeave,
				msg: message.UPDATE_SUCCESS.replace("<module>", "Leave"),
			});
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	//   async requestForLeave(req, res) {
	//     try {
	//       const result = await validator.leaveRequestSchema.validateAsync(req.body);

	//       const leaveCountForDates = await db.employeeLeaveTransactions.findAll({
	//         where: {
	//           appliedFor: {
	//             [Op.between]: [req.body.fromDate, req.body.toDate],
	//           },
	//           status: {
	//             [Op.ne]: "revoked",
	//           },
	//           employeeId: req.body.employeeId,
	//         },
	//       });

	//       const fromDateReq = req.body.fromDate;
	//       const toDateReq = req.body.toDate;
	//       const daysDifferenceReq = moment(toDateReq).diff(
	//         moment(fromDateReq),
	//         "days"
	//       );
	//       if (daysDifferenceReq > parseInt(process.env.LEAVE_LIMIT)) {
	//         return respHelper(res, {
	//           status: 404,
	//           data: {},
	//           msg: message.LEAVE.LEAVE_LIMIT,
	//         });
	//       }
	//       var inputs = [];
	//       for (let i = -1; i < daysDifferenceReq; i++) {
	//         let appliedFor = moment(fromDateReq)
	//           .add(i + 1, "days")
	//           .format("YYYY-MM-DD");

	//         let halfDayFor = 0;
	//         let isHalfDay = 0;

	//         if (daysDifferenceReq == 0) {
	//           isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
	//           halfDayFor = req.body.firstDayHalf;
	//         } else {
	//           if (i + 1 == 0) {
	//             isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
	//             halfDayFor = req.body.firstDayHalf;
	//           } else if (i + 1 == daysDifferenceReq) {
	//             isHalfDay = req.body.lastDayHalf != 0 ? 1 : 0;
	//             halfDayFor = req.body.lastDayHalf;
	//           }
	//         }
	//         inputs = leaveCountForDates.filter((el) => {
	//           if (el.appliedFor == appliedFor) {
	//             if (el.isHalfDay == 1) {
	//               if (halfDayFor == 0) {
	//                 return true;
	//               } else {
	//                 if (el.halfDayFor == halfDayFor) {
	//                   return true;
	//                 } else {
	//                   return false;
	//                 }
	//               }
	//             } else {
	//               return true;
	//             }
	//           } else {
	//             return true;
	//           }
	//         });
	//       }
	//       if (inputs.length > 0) {
	//         return respHelper(res, {
	//           status: 402,
	//           msg: message.LEAVE.DATES_NOT_APPLICABLE,
	//         });
	//       }
	//       let EMP_DATA = await helper.getEmpProfile(req.body.employeeId);
	//       let leaveData = await helper.empLeaveDetails(
	//         req.body.employeeId,
	//         req.body.leaveAutoId
	//       );

	//       const fromDate = req.body.fromDate;
	//       const toDate = req.body.toDate;
	//       let arr = [];
	//       let leaveDays = 0;
	//       const daysDifference = moment(toDate).diff(moment(fromDate), "days");
	//       let uuid = "id_" + moment().format("YYYYMMDDHHmmss");
	//       for (let i = -1; i < daysDifference; i++) {

	//         let appliedFor = moment(fromDate)
	//           .add(i + 1, "days")
	//           .format("YYYY-MM-DD");
	// console.log("appliedForappliedForappliedFor",appliedFor)
	//         let halfDayFor = 0;
	//         let isHalfDay = 0;

	//         if (daysDifference == 0) {
	//           isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
	//           halfDayFor = req.body.firstDayHalf;
	//         } else {
	//           if (i + 1 == 0) {
	//             isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
	//             halfDayFor = req.body.firstDayHalf;
	//           } else if (i + 1 == daysDifference) {
	//             isHalfDay = req.body.lastDayHalf != 0 ? 1 : 0;
	//             halfDayFor = req.body.lastDayHalf;
	//           }
	//         }

	//         if (isHalfDay) {
	//           leaveDays += 0.5;
	//         } else {
	//           leaveDays += 1;
	//         }

	//         let leaveId = 6;
	//         if (leaveData) {
	//           leaveId = req.body.leaveAutoId;
	//           if (leaveId != 6) {
	//             let pendingLeaveCountList =
	//               await db.employeeLeaveTransactions.findAll({
	//                 where: {
	//                   status: "pending",
	//                   employeeId: req.body.employeeId,
	//                   leaveAutoId: leaveId,
	//                 },
	//               });
	//             let pendingLeaveCount = 0;
	//             pendingLeaveCountList.map((el) => {
	//               pendingLeaveCount += parseFloat(el.leaveCount);
	//             });

	//             if (
	//               pendingLeaveCount + leaveDays >=
	//               parseFloat(leaveData.availableLeave)
	//             ) {
	//               leaveId = 6;
	//             }
	//           }
	//         }
	//         const recordData = {
	//           employeeId: req.body.employeeId, // Replace with actual employee ID
	//           attendanceShiftId: EMP_DATA.shiftId, // Replace with actual attendance shift ID
	//           attendancePolicyId: EMP_DATA.attendancePolicyId, // Replace with actual attendance policy ID
	//           leaveAutoId: leaveId, // Replace with actual leave auto ID
	//           appliedOn: moment().format("YYYY-MM-DD"), // Replace with actual applied on date
	//           appliedFor: appliedFor, // Replace with actual applied for date
	//           isHalfDay: isHalfDay, // Replace with actual is half day value (0 or 1)
	//           halfDayFor: halfDayFor, // Replace with actual half day for value
	//           status: "pending", // Replace with actual status
	//           reason: req.body.reason, // Replace with actual reason
	//           leaveCount: isHalfDay == 1 ? 0.5 : 1,
	//           message: req.body.message,
	//           leaveAttachment:
	//             result.attachment != ""
	//               ? await helper.fileUpload(
	//                 result.attachment,
	//                 `leaveAttachment_${uuid}`,
	//                 `uploads/${EMP_DATA.empCode}`
	//               )
	//               : null,
	//           pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
	//           createdBy: req.userId, // Replace with actual creator user ID
	//           createdAt: moment(), // Replace with actual creation date
	//           batch_id: uuid,
	//         };
	//         arr.push(recordData);

	//         //const record = await db.employeeLeaveTransactions.create(recordData);
	//       }

	//       return respHelper(res, {
	//         status: 200,
	//         data: arr,
	//         msg: message.LEAVE.RECORDED,
	//       });
	//     } catch (error) {
	//       if (error.isJoi === true) {
	//         return respHelper(res, {
	//           status: 422,
	//           msg: error.details[0].message,
	//         });
	//       }
	//       console.log("error", error);
	//       return respHelper(res, {
	//         status: 500,
	//       });
	//     }
	//   }
	async requestForLeave(req, res) {
		try {
			const result = await validator.leaveRequestSchema.validateAsync(req.body);



			let EMP_DATA = await helper.getEmpProfile(req.body.employeeId);

			const fromDateReq = req.body.fromDate;
			const toDateReq = req.body.toDate;
			const startDate = moment(fromDateReq);
			const endDate = moment(toDateReq);
			const daysDifferenceReq = moment(toDateReq).diff(
				moment(fromDateReq),
				"days",
			);
			// if (daysDifferenceReq > parseInt(process.env.LEAVE_LIMIT)) {
			// 	return respHelper(res, {
			// 		status: 404,
			// 		data: {},
			// 		msg: message.LEAVE.LEAVE_LIMIT.replace("#", process.env.LEAVE_LIMIT),
			// 	});
			// }
			const leaveMasterData = await helper.leaveDetailsMaster(
				result.leaveAutoId,
				EMP_DATA,
			);
			const onProbation = req.userData["employeejobdetail.confirmationDate"];
			const onNoticePeriod =
				req.userData["employeejobdetail.noticePeriodStatus"];

			// Fetch employee details and leave counts in parallel

			const remainingLeaveCountRESP = await helper.remainingLeaveCount(
				startDate,
				endDate,
				EMP_DATA.weekOffId,
				EMP_DATA.companyLocationId,
				EMP_DATA.companyId,
				result.leaveAutoId,
			);

			if (onProbation == null) {
				if (leaveMasterData.maximum_leave_allowed_in_probation != 0) {
					let probationLeaveCount = await helper.leaveCountForUserForMonth(
						req.body.employeeId,
						req.userData["employeejobdetail.dateOfJoining"],
						req.body.leaveAutoId,
						"YES",
						toDateReq,
					);
					if (
						probationLeaveCount >
						leaveMasterData.maximum_leave_allowed_in_probation
					) {
						return respHelper(res, {
							status: 404,
							data: {},
							msg: message.LEAVE.ON_PRAOBATION_LEAVE_COUNT.replace(
								"#",
								leaveMasterData.maximum_leave_allowed_in_probation,
							),
						});
					}
				}
			}
			if (
				onNoticePeriod == 1 ||
				onNoticePeriod == true ||
				onNoticePeriod == "true"
			) {
				if (leaveMasterData.maximum_leave_allowed_in_notice_period != 0) {
					let probationLeaveCount = await helper.leaveCountForUserForMonth(
						req.body.employeeId,
						req.userData["employeejobdetail.dateOfJoining"],
						req.body.leaveAutoId,
						"YES",
						toDateReq,
					);
					if (
						probationLeaveCount >
						leaveMasterData.maximum_leave_allowed_in_notice_period
					) {
						return respHelper(res, {
							status: 404,
							data: {},
							msg: message.LEAVE.ON_NOTICE_LEAVE_COUNT.replace(
								"#",
								leaveMasterData.maximum_leave_allowed_in_notice_period,
							),
						});
					}
				}
			}
			if (!leaveMasterData) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.NO_LEAVE,
				});
			}
			if (req.body.firstDayHalf != 0 || req.body.lastDayHalf != 0) {
				if (leaveMasterData.canTakeHalfDay == 0) {
					return respHelper(res, {
						status: 404,
						data: {},
						msg:
							message.LEAVE.HALF_DAY_NOT_ALLOWED +
							` for ${leaveMasterData?.companyleaveMasterDetails?.leaveName}`,
					});
				}
			}

			const fromDateOnly = moment(fromDateReq).startOf("day");

			// Get the current date (only the date part)
			const currentDateOnly = moment().startOf("day");

			// Calculate the difference in days
			const differenceInDays = remainingLeaveCountRESP.length;
			const differenceInDaystotal = currentDateOnly.diff(fromDateOnly, "days");
			console.log(
				"differenceInDays",
				differenceInDays,
				"differenceInDaystotal",
				differenceInDaystotal,
			);
			if (differenceInDaystotal > 0) {
				if (leaveMasterData.is_back_date_allowed == 0) {
					return respHelper(res, {
						status: 404,
						data: {},
						msg: message.LEAVE.BACK_DATED_LEAVE_NOT_ALLOWED,
					});
				}
				if (differenceInDaystotal > leaveMasterData.back_days_max) {
					return respHelper(res, {
						status: 404,
						data: {},
						msg: message.LEAVE.BACK_DATED_LIMIT.replace(
							"#",
							leaveMasterData.back_days_max,
						),
					});
				}
			}

			if (leaveMasterData.is_application_on_holiday_weekly_off == 1) {
				let dates = [];

				while (startDate.isSameOrBefore(endDate)) {
					dates.push(startDate.format("YYYY-MM-DD")); // Add formatted date to array
					startDate.add(1, "day"); // Move to the next day
				}

				if (leaveMasterData.weekly_prefix_policy == 2) {
					let prefixDate = moment(fromDateReq)
						.subtract(1, "day")
						.format("YYYY-MM-DD");

					let checkWeekOff = await helper.checkWeekOffOfEMPforData(
						EMP_DATA?.weekOffId,
						prefixDate,
					);

					if (checkWeekOff > 0) {
						return respHelper(res, {
							status: 404,
							data: {},
							msg: message.LEAVE.PREPOSTFIX.replace("#", "Weekoff").replace(
								"@",
								"Prefix",
							),
						});
					}
				}

				if (leaveMasterData.weekly_suffix_policy == 2) {
					let subfixDate = moment(toDateReq).add(1, "day").format("YYYY-MM-DD");
					let checkWeekOff = await helper.checkWeekOffOfEMPforData(
						EMP_DATA?.weekOffId,
						subfixDate,
					);
					if (checkWeekOff > 0) {
						return respHelper(res, {
							status: 404,
							data: {},
							msg: message.LEAVE.PREPOSTFIX.replace("#", "Weekoff").replace(
								"@",
								"Suffix",
							),
						});
					}
				}

				if (leaveMasterData.holiday_prefix_policy == 2) {
					let prefixDate = moment(fromDateReq)
						.subtract(1, "day")
						.format("YYYY-MM-DD");

					let leaveCheck = await helper.checkHolidayEMPforData(
						EMP_DATA?.companyLocationId,
						prefixDate,
					);
					if (leaveCheck) {
						return respHelper(res, {
							status: 404,
							data: {},
							msg: message.LEAVE.PREPOSTFIX.replace("#", "Holiday").replace(
								"@",
								"Prefix",
							),
						});
					}
				}
				if (leaveMasterData.holiday_suffix_policy == 2) {
					let prefixDate = moment(toDateReq).add(1, "day").format("YYYY-MM-DD");

					let leaveCheck = await helper.checkHolidayEMPforData(
						EMP_DATA?.companyLocationId,
						prefixDate,
					);
					if (leaveCheck) {
						return respHelper(res, {
							status: 404,
							data: {},
							msg: message.LEAVE.PREPOSTFIX.replace("#", "Holiday").replace(
								"@",
								"Suffix",
							),
						});
					}
				}
			}

			let workingdays = daysDifferenceReq + 1;
			if (
				leaveMasterData?.max_consecutive_count != 0 &&
				workingdays > leaveMasterData?.max_consecutive_count
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.MAX_CONSECUTIVE.replace(
						"#",
						leaveMasterData?.max_consecutive_count,
					),
				});
			}

			if (
				leaveMasterData?.minConsecutiveDay != 0 &&
				workingdays < leaveMasterData?.minConsecutiveDay
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.MIN_CONSECUTIVE.replace(
						"#",
						leaveMasterData?.minConsecutiveDay,
					),
				});
			}

			if (
				leaveMasterData.attachmentRequired == true &&
				result.attachment == ""
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.ATTACHMENT_REQUIRED,
				});
			}
			if (
				leaveMasterData.attachmentRequiredafterdays != 0 &&
				leaveMasterData.attachmentRequired == false &&
				result.attachment == "" &&
				workingdays >= leaveMasterData.attachmentRequiredafterdays
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.ATTACHMENT_REQUIRED_DAYS.replace(
						"#",
						leaveMasterData.attachmentRequiredafterdays,
					),
				});
			}
			if (leaveMasterData.messageRequired == true && result.message == "") {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.MESSAGE_REQUIRED,
				});
			}
			if (
				leaveMasterData.messageRequired == false &&
				leaveMasterData.messageRequiredafterdays != 0 &&
				result.message == "" &&
				workingdays >= leaveMasterData.messageRequiredafterdays
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.MESSAGE_REQUIRED_DAYS.replace(
						"#",
						leaveMasterData.messageRequiredafterdays,
					),
				});
			}

			let monthCount = await helper.leaveCountForUserForMonth(
				req.body.employeeId,
				fromDateReq,
				req.body.leaveAutoId,
			);

			console.log("monthCount", leaveMasterData?.max_month_count, monthCount);

			if (
				leaveMasterData?.max_month_count != 0 &&
				monthCount >= leaveMasterData?.max_month_count
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.MAX_DAY_MONTH.replace(
						"#",
						leaveMasterData?.max_month_count,
					),
				});
			}

			let monthCountTo = await helper.leaveCountForUserForMonth(
				req.body.employeeId,
				toDateReq,
				req.body.leaveAutoId,
			);

			if (
				leaveMasterData?.max_month_count != 0 &&
				monthCountTo >= leaveMasterData?.max_month_count
			) {
				return respHelper(res, {
					status: 404,
					data: {},
					msg: message.LEAVE.MAX_DAY_MONTH.replace(
						"#",
						leaveMasterData?.max_month_count,
					),
				});
			}
			const leaveCountForDates = await db.employeeLeaveTransactions.findAll({
				where: {
					appliedFor: {
						[Op.between]: [req.body.fromDate, req.body.toDate],
					},
					status: {
						[Op.ne]: "revoked",
					},
					employeeId: req.body.employeeId,
				},
			});

			var inputs = [];
			for (let i = -1; i < daysDifferenceReq; i++) {
				let appliedFor = moment(fromDateReq)
					.add(i + 1, "days")
					.format("YYYY-MM-DD");

				let halfDayFor = 0;
				let isHalfDay = 0;

				if (daysDifferenceReq == 0) {
					isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
					halfDayFor = req.body.firstDayHalf;
				} else {
					if (i + 1 == 0) {
						isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
						halfDayFor = req.body.firstDayHalf;
					} else if (i + 1 == daysDifferenceReq) {
						isHalfDay = req.body.lastDayHalf != 0 ? 1 : 0;
						halfDayFor = req.body.lastDayHalf;
					}
				}
				inputs = leaveCountForDates.filter((el) => {
					if (el.appliedFor == appliedFor) {
						if (el.status == "rejected") {
							return false;
						} else {
							if (el.isHalfDay == 1) {
								if (halfDayFor == 0) {
									return true;
								} else {
									if (el.halfDayFor == halfDayFor) {
										return true;
									} else {
										return false;
									}
								}
							} else {
								return true;
							}
						}
					} else {
						return true;
					}
				});
			}
			if (inputs.length > 0) {
				return respHelper(res, {
					status: 402,
					msg: message.LEAVE.DATES_NOT_APPLICABLE,
				});
			}

			let leaveData = await helper.empLeaveDetails(
				req.body.employeeId,
				req.body.leaveAutoId,
			);

			console.log("remainingLeaveCountRESP dfff", remainingLeaveCountRESP);
			const fromDate = remainingLeaveCountRESP[0];
			const toDate =
				remainingLeaveCountRESP.length == 1
					? remainingLeaveCountRESP[0]
					: remainingLeaveCountRESP[remainingLeaveCountRESP.length - 1];
			console.log("remainingLeaveCountRESP dfff", fromDate);
			console.log("remainingLeaveCountRESP dfff", toDate);
			let arr = [];
			let leaveDays = 0;
			let pendingLeaveCount = 0;
			let leaveId = 6;
			const daysDifference = moment(toDate).diff(moment(fromDate), "days");
			let uuid =
				"id_" + moment().format("YYYYMMDDHHmmss") + req.body.employeeId;
			console.log("daysDifference", daysDifference);
			for (let i = -1; i < daysDifference; i++) {
				let appliedFor = moment(fromDate)
					.add(i + 1, "days")
					.format("YYYY-MM-DD");
				let halfDayFor = 0;
				let isHalfDay = 0;
				// let isDayWorking = await helper.isDayWorking(
				// 	appliedFor,
				// 	EMP_DATA.weekOffId,
				// 	EMP_DATA.companyLocationId,
				// );

				if (remainingLeaveCountRESP.includes(appliedFor)) {
					if (daysDifference == 0) {
						isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
						halfDayFor = req.body.firstDayHalf;
					} else {
						if (i + 1 == 0) {
							isHalfDay = req.body.firstDayHalf != 0 ? 1 : 0;
							halfDayFor = req.body.firstDayHalf;
						} else if (i + 1 == daysDifference) {
							isHalfDay = req.body.lastDayHalf != 0 ? 1 : 0;
							halfDayFor = req.body.lastDayHalf;
						}
					}

					if (isHalfDay) {
						leaveDays += 0.5;
					} else {
						leaveDays += 1;
					}

					if (leaveData) {
						leaveId = req.body.leaveAutoId;
					}

					const recordData = {
						employeeId: req.body.employeeId, // Replace with actual employee ID
						attendanceShiftId: EMP_DATA.shiftId, // Replace with actual attendance shift ID
						attendancePolicyId: EMP_DATA.attendancePolicyId, // Replace with actual attendance policy ID
						leaveAutoId: leaveId, // Replace with actual leave auto ID
						appliedOn: moment().format("YYYY-MM-DD"), // Replace with actual applied on date
						appliedFor: appliedFor, // Replace with actual applied for date
						isHalfDay: isHalfDay, // Replace with actual is half day value (0 or 1)
						halfDayFor: halfDayFor, // Replace with actual half day for value
						status: "pending", // Replace with actual status
						reason: req.body.reason, // Replace with actual reason
						leaveCount: isHalfDay == 1 ? 0.5 : 1,
						message: req.body.message,
						leaveAttachment:
							result.attachment != ""
								? await helper.fileUpload(
										result.attachment,
										`leaveAttachment_${uuid}`,
										`uploads/${EMP_DATA.empCode}`,
									)
								: null,
						pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
						createdBy: req.userId, // Replace with actual creator user ID
						createdAt: moment(), // Replace with actual creation date
						batch_id: uuid,
						weekOffId: EMP_DATA.weekOffId,
						fromDate: req.body.fromDate,
						toDate: req.body.toDate,
						source: req.device,
					};
					arr.push(recordData);
					// const record = await db.employeeLeaveTransactions.create(recordData);
				}
				//const record = await db.employeeLeaveTransactions.bulkCreate(arr);
			}

			if (leaveId != 6) {
				let pendingLeaveCountList = await db.employeeLeaveTransactions.findAll({
					where: {
						status: "pending",
						employeeId: req.body.employeeId,
						leaveAutoId: leaveId,
					},
				});
				pendingLeaveCountList.map((el) => {
					pendingLeaveCount += parseFloat(el.leaveCount);
				});

				if (leaveData) {
					if (
						pendingLeaveCount + leaveDays >
						parseFloat(leaveData.availableLeave)
					) {
						return respHelper(res, {
							status: 400,
							data: arr,
							msg: "Insufficient leave balance",
						});
					}
				}
			}

			// Perform bulk insert
			if (arr.length == 0) {
				return respHelper(res, {
					status: 400,
					data: arr,
					msg: message.LEAVE.LEAVE_NOT_APPLICABLE,
				});
			}
			if (
				leaveMasterData &&
				leaveMasterData.can_club_with_other == 1 &&
				leaveMasterData.club_with_any == 0
			) {
				let prefixDate = moment(fromDateReq)
					.subtract(1, "day")
					.format("YYYY-MM-DD");
				let suffixDate = moment(toDateReq).add(1, "day").format("YYYY-MM-DD");
				console.log("prefixDate", prefixDate, "suffixDate", suffixDate);

				let leaveCount = await helper.checkLeaveClupEMPforDate(
					[prefixDate, suffixDate],
					req.body.leaveAutoId,
					EMP_DATA,
				);
				if (leaveCount != 0) {
					return respHelper(res, {
						status: 400,
						data: arr,
						msg: message.LEAVE.CLUB_NOT_ALLOWED,
					});
				}
			}

			let headerInsert = await db.EmployeeLeaveHeader.create({
				employeeId: req.body.employeeId, // Replace with actual employee ID
				attendanceShiftId: EMP_DATA.shiftId, // Replace with actual attendance shift ID
				attendancePolicyId: EMP_DATA.attendancePolicyId, // Replace with actual attendance policy ID
				leaveAutoId: leaveId, // Replace with actual leave auto ID
				appliedOn: moment().format("YYYY-MM-DD"), // Replace with actual applied on date
				status: "pending", // Replace with actual status
				reason: req.body.reason, // Replace with actual reason
				isHalfDay: req.body.firstDayHalf == 0 ? 0 : 1, // Replace with actual is half day value (0 or 1)
				halfDayFor: req.body.firstDayHalf, // Replace with actual half day for value
				isHalfDaySecond: req.body.lastDayHalf == 0 ? 0 : 1, // Replace with actual is half day value (0 or 1)
				halfDayForSecond: req.body.lastDayHalf, // Replace with actual half day for value
				leaveCount: leaveDays,
				message: req.body.message,
				isMultipleDays: daysDifference == 0 ? 0 : 1,
				leaveAttachment:
					result.attachment != ""
						? await helper.fileUpload(
								result.attachment,
								`leaveAttachment_${uuid}`,
								`uploads/${EMP_DATA.empCode}`,
							)
						: null,
				pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
				createdBy: req.userId, // Replace with actual creator user ID
				createdAt: moment(), // Replace with actual creation date
				batch_id: uuid,
				weekOffId: EMP_DATA.weekOffId,
				fromDate: req.body.fromDate,
				toDate: req.body.toDate,
				source: req.device,
			});
			arr = arr.map((obj) => {
				return {
					...obj,
					employeeleaveheaderID: headerInsert.employeeleaveheaderID,
				}; // Add the new key-value pair
			});

			await db.employeeLeaveTransactions.bulkCreate(arr);

			const employeeData = await db.employeeMaster.findOne({
				where: {
					id: result.employeeId,
				},
				attributes: ["name", "email"],
				include: [
					{
						model: db.employeeMaster,
						as: "managerData",
						attributes: ["name", "email"],
					},
				],
			});
			const leaveType = await db.leaveMaster.findOne({
				where: {
					leaveId: result.leaveAutoId,
				},
				attributes: ["leaveName"],
			});

			const recipientsEmail = await db.employeeMaster.findAll({
				raw: true,
				where: {
					id: result.recipientsIds.split(","),
				},
				attributes: ["email"],
			});

			eventEmitter.emit(
				"leaveRequestMail",
				JSON.stringify({
					requesterName: employeeData.dataValues.name,
					leaveFromDate: result.fromDate,
					leaveToDate: result.toDate,
					userRemark: result.message,
					leaveType: leaveType.dataValues.leaveName,
					managerName: employeeData.dataValues.managerData.name,
					managerEmail: employeeData.dataValues.managerData.email,
					cc: recipientsEmail.map((user) => user.email).join(","),
				}),
			);

			return respHelper(res, {
				status: 200,
				data: arr,
				msg: message.LEAVE.RECORDED,
			});
		} catch (error) {
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async revokeLeaveRequest(req, res) {
		try {
			const result = await validator.revoekLeaveRequest.validateAsync(req.body);

			let leaveIds = result.employeeLeaveTransactionsIds.split(",");
			let countLeave = await db.EmployeeLeaveHeader.count({
				where: {
					status: "pending",
					employeeleaveheaderID: leaveIds,
				},
			});

			if (leaveIds.length != countLeave) {
				return respHelper(res, {
					status: 402,
					msg: message.LEAVE.NO_UPDATE,
				});
			}
			await db.EmployeeLeaveHeader.update(
				{
					status: "revoked",
					updatedBy: req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						employeeleaveheaderID: leaveIds,
					},
				},
			);
			await db.employeeLeaveTransactions.update(
				{
					status: "revoked",
					updatedBy: req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						employeeleaveheaderID: leaveIds,
					},
				},
			);

			const employeeData = await db.employeeLeaveTransactions.findOne({
				raw: true,
				where: {
					employeeleaveheaderID: leaveIds[0],
				},
				attributes: ["fromDate", "toDate"],
				include: [
					{
						model: db.leaveMaster,
						as: "leaveMasterDetails",
						attributes: ["leaveName", "leaveCode"],
					},
					{
						model: db.employeeMaster,
						attributes: ["name"],
						include: [
							{
								model: db.employeeMaster,
								as: "managerData",
								attributes: ["name", "email"],
							},
						],
					},
				],
			});

			const obj = {
				empName: employeeData["employee.name"],
				managerName: employeeData["employee.managerData.name"],
				managerEmail: employeeData["employee.managerData.email"],
				leaveType: `${employeeData["leaveMasterDetails.leaveName"]} (${employeeData["leaveMasterDetails.leaveCode"]})`,
				fromDate: employeeData.fromDate,
				toDate: employeeData.toDate,
			};

			eventEmitter.emit("revokeLeaveRequest", JSON.stringify(obj));

			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.LEAVE.REVOKED,
			});
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// async leaveRemainingCount(req, res) {
	//   try {
	//     const {
	//       leaveAutoId,
	//       startDate,
	//       endDate,
	//       employeeFor,
	//       leaveFirstHalf,
	//       leaveSecondHalf,
	//     } = req.body;
	//     const daysDifferenceReq = moment(endDate).diff(moment(startDate), "days");

	//     if (daysDifferenceReq > parseInt(process.env.LEAVE_LIMIT)) {
	//       return respHelper(res, {
	//         status: 404,
	//         data: {},
	//         msg: message.LEAVE.LEAVE_LIMIT,
	//       });
	//     }

	//     let getCombinedVal = await helper.getCombineValue(
	//       leaveFirstHalf,
	//       leaveSecondHalf
	//     );
	//     let employeeId = employeeFor == 0 ? req.userId : employeeFor;
	//     let employeeWeekOfId = await db.employeeMaster.findOne({
	//       where: { id: employeeId },
	//     });

	//     let totalWorkingDays = await helper.remainingLeaveCount(
	//       startDate,
	//       endDate,
	//       employeeWeekOfId.weekOffId,
	//       employeeWeekOfId.companyLocationId
	//     );

	//     let pendingLeaveCountList = await db.employeeLeaveTransactions.findAll({
	//       where: {
	//         status: "pending",
	//         employeeId: employeeId,
	//         leaveAutoId: leaveAutoId,
	//       },
	//     });

	//     let pendingLeaveCount = 0;
	//     pendingLeaveCountList.map((el) => {
	//       pendingLeaveCount += parseFloat(el.leaveCount);
	//     });

	//     const availableLeaveCount = await db.leaveMapping.findOne({
	//       where: {
	//         EmployeeId: employeeId,
	//         leaveAutoId: leaveAutoId,
	//       },
	//     });
	//     let totalAvailableLeave = availableLeaveCount
	//       ? parseFloat(availableLeaveCount.availableLeave).toFixed(2) -
	//           parseFloat(pendingLeaveCount).toFixed(2) <
	//         0
	//         ? "0.00"
	//         : parseFloat(availableLeaveCount.availableLeave) -
	//           parseFloat(pendingLeaveCount).toFixed(2)
	//       : "0.00";

	//     let unpaidLeave =
	//       parseFloat(availableLeaveCount.availableLeave) -
	//         parseFloat(totalWorkingDays).toFixed(2) <
	//       0
	//         ? -parseFloat(
	//             parseFloat(availableLeaveCount.availableLeave) -
	//               parseFloat(totalWorkingDays).toFixed(2)
	//           )
	//         : 0;

	//     let totalWorkingDaysCalculated =
	//       totalWorkingDays > 0
	//         ? parseFloat(totalWorkingDays).toFixed(2) -
	//           parseFloat(getCombinedVal).toFixed(2)
	//         : 0;

	//     let unpaidLeaveCalculated =
	//       unpaidLeave - parseFloat(getCombinedVal).toFixed(2) < 0
	//         ? 0
	//         : unpaidLeave - parseFloat(getCombinedVal).toFixed(2);

	//     return respHelper(res, {
	//       status: 200,
	//       data: {
	//         totalWorkingDays: totalWorkingDaysCalculated,
	//         availableLeave:
	//           parseFloat(availableLeaveCount.availableLeave) -
	//             parseFloat(totalWorkingDaysCalculated) <
	//           0
	//             ? 0
	//             : parseFloat(availableLeaveCount.availableLeave) -
	//               parseFloat(totalWorkingDaysCalculated),
	//         unpaidLeave:
	//           parseFloat(availableLeaveCount.availableLeave) -
	//             parseFloat(totalWorkingDaysCalculated) <
	//           0
	//             ? -(
	//                 parseFloat(availableLeaveCount.availableLeave) -
	//                 parseFloat(totalWorkingDaysCalculated)
	//               )
	//             : 0, //(totalWorkingDaysCalculated-totalAvailableLeave)>0?totalWorkingDaysCalculated-totalAvailableLeave:0,
	//       },
	//       msg: message.LEAVE.REMAINING_LEAVES,
	//     });
	//   } catch (error) {
	//     console.error(error);
	//     return res.status(500).json({
	//       message: "Internal server error",
	//     });
	//   }
	// }

	// async leaveRemainingCount(req, res) {
	//   try {
	//     console.time("Total Execution Time");
	//     console.time("Initial Validation");

	//     const {
	//       leaveAutoId,
	//       startDate,
	//       endDate,
	//       employeeFor,
	//       leaveFirstHalf,
	//       leaveSecondHalf,
	//     } = req.body;

	//     const daysDifferenceReq = moment(endDate).diff(moment(startDate), "days");

	//     if (daysDifferenceReq > parseInt(process.env.LEAVE_LIMIT)) {
	//       console.timeEnd("Initial Validation");
	//       console.timeEnd("Total Execution Time");
	//       return respHelper(res, {
	//         status: 404,
	//         data: {},
	//         msg: message.LEAVE.LEAVE_LIMIT,
	//       });
	//     }

	//     console.timeEnd("Initial Validation");
	//     console.time("Helper Function getCombineValue");

	//     const getCombinedVal = await helper.getCombineValue(
	//       leaveFirstHalf,
	//       leaveSecondHalf
	//     );

	//     console.timeEnd("Helper Function getCombineValue");
	//     console.time("Database Queries");

	//     const employeeId = employeeFor == 0 ? req.userId : employeeFor;

	//     const employeeData = await db.sequelize.transaction(
	//       async (transaction) => {
	//         const employee = await db.employeeMaster.findOne({
	//           where: { id: employeeId },
	//           attributes: ["weekOffId", "companyLocationId"],
	//           transaction,
	//         });

	//         const pendingLeaves = await db.employeeLeaveTransactions.findAll({
	//           where: {
	//             status: "pending",
	//             employeeId: employeeId,
	//             leaveAutoId: leaveAutoId,
	//           },
	//           attributes: ["leaveCount"],
	//           transaction,
	//         });

	//         const leaveMapping = await db.leaveMapping.findOne({
	//           where: {
	//             EmployeeId: employeeId,
	//             leaveAutoId: leaveAutoId,
	//           },
	//           attributes: ["availableLeave"],
	//           transaction,
	//         });

	//         return { employee, pendingLeaves, leaveMapping };
	//       }
	//     );

	//     console.timeEnd("Database Queries");
	//     console.time("Calculations");

	//     const { employee, pendingLeaves, leaveMapping } = employeeData;

	//     if (!employee) {
	//       console.timeEnd("Calculations");
	//       console.timeEnd("Total Execution Time");
	//       return respHelper(res, {
	//         status: 200,
	//         data: {
	//           totalWorkingDays: 0,
	//           availableLeave: 0,
	//           unpaidLeave: 0,
	//         },
	//         msg: message.LEAVE.REMAINING_LEAVES,
	//       });
	//     }

	//     const totalWorkingDays = await helper.remainingLeaveCount(
	//       startDate,
	//       endDate,
	//       employee.weekOffId,
	//       employee.companyLocationId
	//     );

	//     const pendingLeaveCount = pendingLeaves.reduce(
	//       (acc, el) => acc + parseFloat(el.leaveCount),
	//       0
	//     );

	//     const availableLeave = leaveMapping
	//       ? parseFloat(leaveMapping.availableLeave) - pendingLeaveCount
	//       : 0;
	//     const unpaidLeave = Math.max(0, totalWorkingDays - availableLeave);
	//     const totalWorkingDaysCalculated = Math.max(
	//       0,
	//       totalWorkingDays - getCombinedVal
	//     );
	//     const unpaidLeaveCalculated = Math.max(0, unpaidLeave - getCombinedVal);

	//     const earnedLeave = Math.max(0, availableLeave);
	//     const unpaidLeaveResult = Math.max(0, unpaidLeaveCalculated);

	//     console.timeEnd("Calculations");
	//     console.timeEnd("Total Execution Time");

	//     return respHelper(res, {
	//       status: 200,
	//       data: {
	//         totalWorkingDays: totalWorkingDaysCalculated,
	//         availableLeave: earnedLeave,
	//         unpaidLeave: unpaidLeaveResult,
	//       },
	//       msg: message.LEAVE.REMAINING_LEAVES,
	//     });
	//   } catch (error) {
	//     console.error(error);
	//     return res.status(500).json({
	//       message: "Internal server error",
	//     });
	//   }
	// }
	async leaveRemainingCount(req, res) {
		try {
			const {
				leaveAutoId,
				startDate,
				endDate,
				employeeFor,
				leaveFirstHalf,
				leaveSecondHalf,
			} = req.body;

			const daysDifferenceReq = moment(endDate).diff(moment(startDate), "days");

			// if (daysDifferenceReq > parseInt(process.env.LEAVE_LIMIT)) {
			// 	return respHelper(res, {
			// 		status: 404,
			// 		data: {},
			// 		msg: message.LEAVE.LEAVE_LIMIT.replace("#", process.env.LEAVE_LIMIT),
			// 	});
			// }

			// const getCombinedVal = await helper.getCombineValue(
			//   leaveFirstHalf,
			//   leaveSecondHalf,
			//   startDate,
			//   endDate,
			//   companyLocationId
			// );
			const employeeId = employeeFor == 0 ? req.userId : employeeFor;

			// Fetch employee details and leave counts in parallel
			const [employeeWeekOfId, pendingLeaveCountList, availableLeaveCount] =
				await Promise.all([
					db.employeeMaster.findOne({ where: { id: employeeId } }),
					db.employeeLeaveTransactions.findAll({
						where: {
							status: "pending",
							employeeId: employeeId,
							leaveAutoId: leaveAutoId,
						},
					}),
					db.leaveMapping.findOne({
						where: {
							EmployeeId: employeeId,
							leaveAutoId: leaveAutoId,
						},
					}),
				]);

			// Calculate total working days
			const remainingLeaveCountRESP = await helper.remainingLeaveCount(
				startDate,
				endDate,
				employeeWeekOfId.weekOffId,
				employeeWeekOfId.companyLocationId,
				employeeWeekOfId.companyId,
				leaveAutoId,
			);
			const totalWorkingDays = remainingLeaveCountRESP.length;
			const getCombinedVal = await helper.getCombineValue(
				leaveFirstHalf,
				leaveSecondHalf,
				startDate,
				endDate,
				employeeWeekOfId.companyLocationId,
				employeeWeekOfId.weekOffId,
			);
			// Calculate pending leave count
			const pendingLeaveCount = pendingLeaveCountList.reduce(
				(acc, el) => acc + parseFloat(el.leaveCount),
				0,
			);

			const totalWorkingDaysCalculated = Math.max(
				0,
				totalWorkingDays - getCombinedVal,
			);
			let countDeductingPending =
				availableLeaveCount.availableLeave - pendingLeaveCount;
			let a = totalWorkingDaysCalculated;
			let b =
				totalWorkingDaysCalculated < countDeductingPending
					? totalWorkingDaysCalculated
					: countDeductingPending;
			let c = b > 0 ? a - b : a;

			if (leaveAutoId == 6 || leaveAutoId == 9) {
				b = a;
			}

			return respHelper(res, {
				status: 200,
				data: {
					totalWorkingDays: a,
					availableLeave: b,
					unpaidLeave: c < 0 ? 0 : c,
				},
				msg: message.LEAVE.REMAINING_LEAVES,
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				message: "Internal server error",
			});
		}
	}

	async leaveHistory(req, res) {
		try {
			const year = req.params.year;
			const employeeId = req.query.user || req.userId;
			const result = [];
			const grandLeaveTotal = [];
			let grandTotalLeaveCount = 0; // Initialize grand total leave count

			// Helper function to get the month name
			const getMonthName = (month) => {
				const date = new Date();
				date.setDate(1); // Ensure it doesn't overflow
				date.setMonth(month - 1);
				return date.toLocaleString("default", { month: "long" });
			};

			const leaveAutoIds = new Set();

			const idFromLeaveTransaction = await db.EmployeeLeaveHeader.findAll({
				attributes: ["leaveAutoId"],
				where: { employeeId: employeeId },
				raw: true,
			});

			idFromLeaveTransaction.forEach((item) =>
				leaveAutoIds.add(item.leaveAutoId),
			);

			const currentMappedIds = await db.leaveMapping.findAll({
				attributes: ["leaveAutoId"],
				where: { EmployeeId: employeeId },
				raw: true,
			});

			currentMappedIds.forEach((item) => leaveAutoIds.add(item.leaveAutoId));

			const uniqueMappedIds = Array.from(leaveAutoIds);

			const leaveMasterDetails = await db.leaveMaster.findAll({
				attributes: ["leaveId", "leaveName", "leaveCode"],
				raw: true,
				where: {
					leaveId: uniqueMappedIds,
				},
			});

			// Create a map for leaveId to leaveName
			const leaveMasterMap = leaveMasterDetails.reduce((map, leave) => {
				map[leave.leaveId] = leave.leaveName;
				return map;
			}, {});

			// Fetch all leave transactions for the given employee and year
			const startDate = `${year}-01-01`;
			const endDate = `${year}-12-31`;

			const attendanceData = await db.employeeLeaveTransactions.findAll({
				attributes: [
					"employeeId",
					"leaveAutoId",
					[db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")), "month"],
					[
						db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
						"totalLeaveCount",
					],
				],
				where: {
					employeeId: employeeId,
					status: "approved",
					appliedFor: {
						[db.Sequelize.Op.between]: [startDate, endDate],
					},
				},
				group: [
					"employeeId",
					"leaveAutoId",
					db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")),
				],
				raw: true,
			});

			// Group data by month and leave type
			const groupedData = {};
			attendanceData.forEach((item) => {
				const month = getMonthName(item.month);
				if (!groupedData[month]) {
					groupedData[month] = {};
				}
				groupedData[month][item.leaveAutoId] = item.totalLeaveCount;
			});

			console.log("groupedData", groupedData);
			// Create the result array
			for (let month = 1; month <= 12; month++) {
				const monthName = getMonthName(month);
				const attendanceDataForMonth = [];
				let totalLeaveCountForMonth = 0;

				function getMonthName(month) {
					const monthNames = {
						1: "January",
						2: "February",
						3: "March",
						4: "April",
						5: "May",
						6: "June",
						7: "July",
						8: "August",
						9: "September",
						10: "October",
						11: "November",
						12: "December",
					};

					return monthNames[month] ? monthNames[month] : "Invalid month number";
				}
				leaveMasterDetails.forEach((leave) => {
					const leaveCount =
						groupedData[monthName] && groupedData[monthName][leave.leaveId]
							? groupedData[monthName][leave.leaveId]
							: 0;
					totalLeaveCountForMonth += parseFloat(leaveCount);

					attendanceDataForMonth.push({
						leaveAutoId: leave.leaveId,
						leaveType: leave.leaveName,
						leaveCode: leave.leaveCode,
						totalLeaveCount: leaveCount,
					});
				});

				grandTotalLeaveCount += totalLeaveCountForMonth; // Update grand total leave count

				result.push({
					monthNumber: moment(getMonthName(month), "MMMM").format("MM"),
					month: getMonthName(month),
					totalMonthLeave: totalLeaveCountForMonth,
					attendanceData: attendanceDataForMonth,
				});
			}

			// Add the grand total to the result
			grandLeaveTotal.push({
				month: "Total",
				totalMonthLeave: grandTotalLeaveCount.toFixed(2),
				attendanceData: [],
			});

			return respHelper(res, {
				status: 200,
				data: {
					totalYearLeaves:
						grandLeaveTotal[0].totalMonthLeave == "0.00"
							? 0
							: grandLeaveTotal[0].totalMonthLeave,
					monthWiseLeaves: result,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async leaveHistoryDetails(req, res) {
		try {
			const { leaveAutoId, month, year, user } = req.query;
			const employeeId = user || req.userId;

			const whereCondtion = {
				employeeId: employeeId,
				leaveAutoId: leaveAutoId,
				status: "approved",
				fromDate: {
					[Op.and]: [
						{ [Op.gte]: `${year}-${month}-01` },
						{
							[Op.lte]: `${year}-${month}-${moment(
								`${year}-${month}`,
								"YYYY-MM",
							).daysInMonth()}`,
						},
					],
				},
			};
			const attendanceData = await db.EmployeeLeaveHeader.findAll({
				attributes: {
					exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
				},
				where: whereCondtion,
				include: [
					{
						model: db.leaveMaster,
						attributes: ["leaveId", "leaveName", "leaveCode"],
						as: "leaveMasterDetails",
					},
				],
				order: [["employeeleaveheaderID", "desc"]],
			});
			return respHelper(res, {
				status: 200,
				data: attendanceData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async leaveIdUpdateForOffRole(req, res) {
		try {
			// Step 1: Fetch employee IDs with employeeType = 4
			const employees = await db.employeeMaster.findAll({
				attributes: ["id"],
				where: {
					employeeType: 3,
				},

				raw: true, // Fetch only raw data (no sequelize model wrapping)
			});
			// Step 2: Extract the employee IDs into an array
			const employeeIds = employees.map((emp) => emp.id);
			if (employeeIds.length > 0) {
				// Step 3: Update the leaveMapping table for those employees
				await db.leaveMapping.destroy({
					where: {
						leaveAutoId: 1,
						EmployeeId: {
							[Op.in]: employeeIds,
						},
					},
				});

				return respHelper(res, {
					status: 200,
					message: "Leave updated successfully",
				});
			} else {
				return respHelper(res, {
					status: 404,
					message: "No employees found with employeeType = 4",
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	async leaveIdDeleteELForOffRole(req, res) {
		try {
			// Step 1: Fetch employee IDs with employeeType = 4
			const employees = await db.employeeMaster.findAll({
				attributes: ["id"],
				where: {
					employeeType: 3,
				},

				raw: true, // Fetch only raw data (no sequelize model wrapping)
			});
			// Step 2: Extract the employee IDs into an array
			const employeeIds = employees.map((emp) => emp.id);
			if (employeeIds.length > 0) {
				// Step 3: Update the leaveMapping table for those employees
				await db.leaveMapping.update(
					{ leaveAutoId: 1, availableLeave: req.body.availableLeave },
					{
						where: {
							EmployeeId: {
								[Op.in]: employeeIds,
							},
						},
					},
				);

				return respHelper(res, {
					status: 200,
					message: "Leave updated successfully",
				});
			} else {
				return respHelper(res, {
					status: 404,
					message: "No employees found with employeeType = 4",
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	async leaveAssignEmployee(req, res) {
		try {
			// Fetch employees and their leave mappings
			const employees = await db.employeeMaster.findAll({
				attributes: ["id", "employeeType"],
				where: {
					isActive: 1,
					employeeType: [3, 4],
				},
				include: [
					{
						model: db.leaveMapping,
						attributes: ["leaveMappingId", "EmployeeId"],
						as: "employeeLeaves",
						required: false, // Fetch employees even if there are no leave mappings
					},
				],
			});

			// Filter employees where employeeLeaves is an empty array
			const filteredEmployees = employees.filter(
				(employee) => employee.employeeLeaves.length === 0,
			);

			for (let index = 0; index < filteredEmployees.length; index++) {
				const element = filteredEmployees[index];
				if (element.employeeType == 3) {
					const objOffRole = {
						EmployeeId: element.id,
						leaveAutoId: 6,
					};
					await db.leaveMapping.create(objOffRole);
				}
				if (element.employeeType == 4) {
					const objOffRole = [
						{
							EmployeeId: element.id,
							leaveAutoId: 1,
						},
						{
							EmployeeId: element.id,
							leaveAutoId: 6,
						},
					];
					await db.leaveMapping.bulkCreate(objOffRole);
				}
			}

			return respHelper(res, {
				status: 200,
				message: "Leave updated successfully",
				data: filteredEmployees.length,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	//working fine
	// async leaveHistory(req, res) {
	//   try {
	//     const year = req.params.year;
	//     const employeeId = req.userId;
	//     const result = [];

	//     // Helper function to get the month name
	//     const getMonthName = (month) => {
	//       const date = new Date();
	//       date.setMonth(month - 1);
	//       return date.toLocaleString("default", { month: "long" });
	//     };

	//     // Fetch all leaveMaster details once
	//     const leaveMasterDetails = await db.leaveMaster.findAll({
	//       attributes: ["leaveId", "leaveName"],
	//       raw: true,
	//     });

	//     // Create a map for leaveId to leaveName
	//     const leaveMasterMap = leaveMasterDetails.reduce((map, leave) => {
	//       map[leave.leaveId] = leave.leaveName;
	//       return map;
	//     }, {});

	//     // Fetch all leave transactions for the given employee and year
	//     const startDate = `${year}-01-01`;
	//     const endDate = `${year}-12-31`;

	//     const attendanceData = await db.employeeLeaveTransactions.findAll({
	//       attributes: [
	//         "employeeId",
	//         "leaveAutoId",
	//         [
	//           db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")),
	//           "month",
	//         ],
	//         [
	//           db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
	//           "totalLeaveCount",
	//         ],
	//       ],
	//       where: {
	//         employeeId: employeeId,
	//         status: "approved",
	//         appliedFor: {
	//           [db.Sequelize.Op.between]: [startDate, endDate],
	//         },
	//       },
	//       group: ["employeeId", "leaveAutoId", db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor"))],
	//       raw: true,
	//     });

	//     // Group data by month and leave type
	//     const groupedData = {};
	//     attendanceData.forEach((item) => {
	//       const month = getMonthName(item.month);
	//       if (!groupedData[month]) {
	//         groupedData[month] = {};
	//       }
	//       groupedData[month][item.leaveAutoId] = item.totalLeaveCount;
	//     });

	//     // Create the result array
	//     for (let month = 1; month <= 12; month++) {
	//       const monthName = getMonthName(month);
	//       const attendanceDataForMonth = [];
	//       let totalLeaveCountForMonth = 0;

	//       leaveMasterDetails.forEach(leave => {
	//         const leaveCount = groupedData[monthName] && groupedData[monthName][leave.leaveId] ? groupedData[monthName][leave.leaveId] : 0;
	//         totalLeaveCountForMonth += parseFloat(leaveCount);

	//         attendanceDataForMonth.push({
	//           leaveType: leave.leaveName,
	//           totalLeaveCount: leaveCount,
	//         });
	//       });

	//       result.push({
	//         month: monthName,
	//         totalMonthLeave: totalLeaveCountForMonth,
	//         attendanceData: attendanceDataForMonth,
	//       });
	//     }

	//     return respHelper(res, {
	//       status: 200,
	//       data: result,
	//     });
	//   } catch (error) {
	//     console.log(error);
	//     return respHelper(res, {
	//       status: 500,
	//     });
	//   }
	// }

	// working fine time execution time fine
	// async leaveHistory(req, res) {
	//   try {
	//     const year = "2024";
	//     const employeeId = 365;
	//     const result = [];

	//     const formatMonth = (month) => month.toString().padStart(2, "0");

	//     // Fetch all leaveMaster details once
	//     const leaveMasterDetails = await db.leaveMaster.findAll({
	//       attributes: ["leaveId", "leaveName"],
	//       raw: true,
	//     });

	//     // Create a map for leaveId to leaveName
	//     const leaveMasterMap = leaveMasterDetails.reduce((map, leave) => {
	//       map[leave.leaveId] = leave.leaveName;
	//       return map;
	//     }, {});

	//     // Fetch all leave transactions for the given employee and year
	//     const startDate = `${year}-01-01`;
	//     const endDate = `${year}-12-31`;

	//     const attendanceData = await db.employeeLeaveTransactions.findAll({
	//       attributes: [
	//         "employeeId",
	//         "leaveAutoId",
	//         [
	//           db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")),
	//           "month",
	//         ],
	//         [
	//           db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
	//           "totalLeaveCount",
	//         ],
	//       ],
	//       where: {
	//         employeeId: employeeId,
	//         status: "approved",
	//         appliedFor: {
	//           [db.Sequelize.Op.between]: [startDate, endDate],
	//         },
	//       },
	//       group: ["employeeId", "leaveAutoId", db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor"))],
	//       raw: true,
	//     });

	//     // Group data by month and leave type
	//     const groupedData = {};
	//     attendanceData.forEach((item) => {
	//       const month = formatMonth(item.month);
	//       if (!groupedData[month]) {
	//         groupedData[month] = [];
	//       }
	//       groupedData[month].push({
	//         leaveType: leaveMasterMap[item.leaveAutoId] || "Unknown",
	//         totalLeaveCount: item.totalLeaveCount,
	//       });
	//     });

	//     // Create the result array
	//     for (let month = 1; month <= 12; month++) {
	//       const formattedMonth = formatMonth(month);
	//       result.push({
	//         month: formattedMonth,
	//         attendanceData: groupedData[formattedMonth] || [],
	//       });
	//     }

	//     return respHelper(res, {
	//       status: 200,
	//       data: result,
	//     });
	//   } catch (error) {
	//     console.log(error);
	//     return respHelper(res, {
	//       status: 500,
	//     });
	//   }
	// }

	//this is working fine but taking time
	// async leaveHistory(req, res) {
	//   try {
	//     const year = "2024";
	//     const employeeId = 365;
	//     const result = [];

	//     const formatMonth = (month) => month.toString().padStart(2, "0");

	//     // Fetch distinct leaveAutoIds for the given employee
	//     // Fetch distinct leaveIds
	//     const leaveIds = await db.leaveMaster.findAll({
	//       attributes: [
	//         [db.Sequelize.fn("DISTINCT", db.Sequelize.col("leaveId")), "leaveId"],
	//       ],
	//       raw: true, // To get plain objects instead of Sequelize instances
	//     });

	//     for (let index = 0; index < leaveIds.length; index++) {
	//       const leaveAutoId = leaveIds[index].leaveId;
	//       // Fetch leaveMaster details for the current leaveAutoId
	//       const leaveMasterDetails = await db.leaveMaster.findOne({
	//         where: { leaveId: leaveAutoId },
	//         raw: true, // To get plain object instead of Sequelize instance
	//       });

	//       for (let month = 1; month <= 12; month++) {
	//         const startDate = `${year}-${formatMonth(month)}-01`;
	//         const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Correctly get the last day of the current month

	//         // Fetch attendance data for the current month and leaveAutoId
	//         const attendanceData = await db.employeeLeaveTransactions.findAll({
	//           attributes: [
	//             "employeeId",
	//             [
	//               db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
	//               "totalLeaveCount",
	//             ],
	//           ],
	//           where: {
	//             employeeId: employeeId,
	//             leaveAutoId: leaveAutoId,
	//             status: "approved",
	//             appliedFor: {
	//               [db.Sequelize.Op.between]: [startDate, endDate],
	//             },
	//           },
	//           group: ["employeeId", "leaveAutoId"],
	//           raw: true, // To get plain objects instead of Sequelize instances
	//         });

	//         result.push({
	//           month: formatMonth(month),
	//           leaveType: leaveMasterDetails
	//             ? leaveMasterDetails.leaveName
	//             : "Unknown",
	//           attendanceData: attendanceData,
	//         });
	//       }
	//     }

	//     return respHelper(res, {
	//       status: 200,
	//       data: result,
	//     });
	//   } catch (error) {
	//     console.log(error);
	//     return respHelper(res, {
	//       status: 500,
	//     });
	//   }
	// }

	// async leaveHistory(req, res) {
	//   try {
	//     const year = "2024";
	//     const employeeId = 365;
	//     const result = [];

	//     const formatMonth = (month) => month.toString().padStart(2, "0");

	//     const allLeaveIds = await db.leaveMaster.findAll({attributes:['leaveId']});
	//     console.log("allLeaveIdsallLeaveIds",allLeaveIds)
	//     // Fetch unique leaveAutoIds for the given employee
	//     const leaveIds = await db.employeeLeaveTransactions.findAll({
	//       attributes: ["leaveAutoId"],
	//       where: {
	//         status: "approved",
	//         employeeId: employeeId,
	//       },
	//       group: ["leaveAutoId"],
	//       raw: true, // To get plain objects instead of Sequelize instances
	//     });

	//     for (let index = 0; index < leaveIds.length; index++) {
	//       const leaveAutoId = leaveIds[index].leaveAutoId;

	//       // Fetch leaveMaster details for the current leaveAutoId
	//       const leaveMasterDetails = await db.leaveMaster.findOne({ where: { leaveId: leaveAutoId } });

	//       for (let month = 1; month <= 12; month++) {
	//         const startDate = `${year}-${formatMonth(month)}-01`;
	//         const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Correctly get the last day of the current month

	//         // Fetch attendance data for the current month and leaveAutoId
	//         const attendanceData = await db.employeeLeaveTransactions.findAll({
	//           attributes: [
	//             "employeeId",
	//             [fn("sum", col("leaveCount")), "totalLeaveCount"],
	//           ],
	//           where: {
	//             employeeId: employeeId,
	//             leaveAutoId: leaveAutoId,
	//             status: "approved",
	//             appliedFor: {
	//               [Op.between]: [startDate, endDate],
	//             },
	//           },
	//           group: ["employeeId", "leaveAutoId"],
	//           raw: true, // To get plain objects instead of Sequelize instances
	//         });

	//         result.push({
	//           month: formatMonth(month),
	//           leaveType: leaveMasterDetails.leaveName,
	//           attendanceData: attendanceData,
	//         });
	//       }
	//     }

	//     return respHelper(res, {
	//       status: 200,
	//       data: result,
	//     });
	//   } catch (error) {
	//     console.log(error);
	//     return respHelper(res, {
	//       status: 500,
	//     });
	//   }
	// }

	async leaveRequestListBulk(req, res) {
		try {
			const query = req.query.listFor;
			const limit = req.query.limit * 1 || 100;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const search = req.query.search || null;

			const regularizeList = await db.EmployeeLeaveHeader.findAndCountAll({
				where: Object.assign(
					query === "raisedByMe"
						? {
								employeeId: { [Op.ne]: req.userId },
								source: { [Op.ne]: "system_generated" },
								status: "pending",
							}
						: {
								status: "pending",
								employeeId: { [Op.ne]: req.userId },
							},
				),

				attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name"],
						where: {
							...(search && {
								[Op.or]: [
									{ name: { [Op.like]: `%${search}%` } }, // Search in 'name'
									{ empCode: { [Op.like]: `%${search}%` } }, // Search in 'tmc'
								],
							}),
						},
					},
					{
						model: db.leaveMaster,
						required: false,
						as: "leaveMasterDetails",
						attributes: ["leaveName", "leaveCode"],
					},
				],
				order: [["employeeleaveheaderID", "desc"]],
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: regularizeList,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateLeaveRequestBulk(req, res) {
		try {
			const result = await validator.updateLeaveRequest.validateAsync(req.body);

			let leaveIds = result.employeeLeaveTransactionsIds.split(",");
			let countLeave = await db.EmployeeLeaveHeader.count({
				where: {
					status: "pending",
					//pendingAt: req.userId,
					employeeleaveheaderID: leaveIds,
				},
			});

			if (leaveIds.length != countLeave) {
				return respHelper(res, {
					status: 402,
					msg: message.LEAVE.NO_UPDATE,
				});
			}
			let actionTaker = await db.employeeMaster.findOne({
				where: {
					id: req.userId,
				},
				attributes: ["name"],
			});
			await db.employeeLeaveTransactions.update(
				{
					status: result.status,
					updatedBy: req.userId,
					managerRemark: result.remark != "" ? result.remark : null,
					updatedAt: moment(),
				},
				{
					where: {
						employeeleaveheaderID: leaveIds,
					},
				},
			);
			await db.EmployeeLeaveHeader.update(
				{
					status: result.status,
					updatedBy: req.userId,
					managerRemark: result.remark != "" ? result.remark : null,
					updatedAt: moment(),
				},
				{
					where: {
						employeeleaveheaderID: leaveIds,
					},
				},
			);
			if (result.status == "approved") {
				for (const leaveID of leaveIds) {
					const existingRecord = await db.employeeLeaveTransactions.findOne({
						where: { employeeleaveheaderID: leaveID },
					});

					if (existingRecord) {
						if (existingRecord && existingRecord.leaveAutoId == 9) {
							const employeeId = existingRecord.employeeId;
							const employeeLeaveTransactionsIds = leaveID;
							const status = 1;
							const remarks = result.remark != "" ? result.remark : null;
							const userId = req.userId;

							await helper.actionOnLeaveCompOff(
								employeeId,
								employeeLeaveTransactionsIds,
								status,
								remarks,
								userId,
							);
						}
						await db.attendanceMaster.update(
							Object.assign(
								existingRecord.dataValues.isHalfDay === 0 ||
									existingRecord.dataValues.halfDayFor === 1
									? {
											attendanceLateBy: "00:00:00",
										}
									: {},
							),
							{
								where: {
									attendanceDate: existingRecord.dataValues.appliedFor,
									employeeId: existingRecord.dataValues.employeeId,
								},
							},
						);

						if (existingRecord.leaveAutoId === 6) {
							const lwpLeave = await db.leaveMapping.findOne({
								where: {
									EmployeeId: existingRecord.employeeId,
									leaveAutoId: existingRecord.leaveAutoId,
								},
							});

							if (lwpLeave) {
								await db.leaveMapping.increment(
									{ utilizedThisYear: parseFloat(existingRecord.leaveCount) },
									{
										where: {
											EmployeeId: existingRecord.employeeId,
											leaveAutoId: existingRecord.leaveAutoId,
										},
									},
								);
							} else {
								await db.leaveMapping.create({
									EmployeeId: existingRecord.employeeId,
									leaveAutoId: existingRecord.leaveAutoId,
									availableLeave: 0,
									utilizedThisYear: parseFloat(existingRecord.leaveCount),
									creditedFromLastYear: 0,
									annualAllotment: 0,
									accruedThisYear: 0,
								});
							}
						} else {
							await db.leaveMapping.increment(
								{ utilizedThisYear: parseFloat(existingRecord.leaveCount) },
								{
									where: {
										EmployeeId: existingRecord.employeeId,
										leaveAutoId: existingRecord.leaveAutoId,
									},
								},
							);
							await db.leaveMapping.increment(
								{ availableLeave: -parseFloat(existingRecord.leaveCount) },
								{
									where: {
										EmployeeId: existingRecord.employeeId,
										leaveAutoId: existingRecord.leaveAutoId,
									},
								},
							);
						}
					}
					//  else {
					// await db.User.create(record, { transaction });
					// }
				}
			}

			for (const leaveID of leaveIds) {
				const leaveTransactionDetails =
					await db.employeeLeaveTransactions.findOne({
						raw: true,
						where: {
							employeeleaveheaderID: leaveID,
						},
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "email"],
								include: [
									{
										model: db.employeeMaster,
										as: "managerData",
										attributes: ["name"],
									},
								],
							},
							{
								model: db.leaveMaster,
								as: "leaveMasterDetails",
								attributes: ["leaveName"],
							},
						],
						attributes: ["fromDate", "toDate"],
					});

				const obj = {
					email: leaveTransactionDetails["employee.email"],
					status: result.status === "approved" ? "Approved" : "Rejected",
					fromDate: leaveTransactionDetails.fromDate,
					toDate: leaveTransactionDetails.toDate,
					leaveType: leaveTransactionDetails["leaveMasterDetails.leaveName"],
					managerName: actionTaker ? actionTaker.name : "",
					requesterName: leaveTransactionDetails["employee.name"],
				};
				eventEmitter.emit("leaveAckMail", JSON.stringify(obj));
			}

			return respHelper(res, {
				status: 200,
				data: countLeave,
				msg: message.UPDATE_SUCCESS.replace("<module>", "Leave"),
			});
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async leaveAssignEmployeeToAll(req, res) {
		try {
			const employees = await db.employeeMaster.findAll({
				attributes: ["id", "empCode", "employeeType", "companyId"],
				where: {
					isActive: 1,
					//empCode : req.body.empCode
					...(req.body.empCode && {
						empCode: { [Op.in]: req.body.empCode.split(",") },
					}),
				},
				include: [
					{
						model: db.companyMaster,
						attributes: ["companyName"],
						required: true,
						include: [
							{
								model: db.leaveCompanyMapping,
								attributes: [
									"leaveCompanyId",
									"leaveAutoId",
									"companyId",
									"empType",
									"genderApplicable",
									"defaultLeaveCount",
									"maritalApplicable",
								],
							},
						],
					},
					{
						model: db.biographicalDetails,
						attributes: ["biographicalId", "maritalStatus", "gender"],
						required: true,
					},
				],
			});

			const leaveMaster = await db.leaveCompanyMapping.findAll({
				attributes: ["leaveAutoId", "companyId", "defaultLeaveCount"],
			});

			const leaveMasterLookup = leaveMaster.reduce((acc, leave) => {
				// Use a composite key combining leaveIdAutoId and companyId
				const compositeKey = `${leave.leaveAutoId}-${leave.companyId}`;
				acc[compositeKey] = leave.defaultLeaveCount;
				return acc;
			}, {});

			for (const employee of employees) {
				const { gender, maritalStatus } =
					employee.dataValues.employeebiographicaldetail;
				const leaveCompanyMappings =
					employee.dataValues.companymaster?.leavecompanymappings || [];
				const leaveAutoIds = leaveCompanyMappings.map(
					(mapping) => mapping.leaveAutoId,
				);
				const genderNumber =
					gender === "Male" ? 1 : gender === "Female" ? 2 : 3;
				const companyId = employee.dataValues.companyId;
				const employeeId = employee.dataValues.id;
				// if (employee.dataValues.employeeType != 3 && (gender === "Male" || gender === "Female") && (maritalStatus == 2 || maritalStatus == 3) ) {
				if (employee.dataValues.employeeType != 3) {
					if (
						(genderNumber == 1 || genderNumber == 2) &&
						(maritalStatus == 2 || maritalStatus == 3)
					) {
						console.log("Male || Female && single");

						const getAllGenderBasedLeave = await db.leaveCompanyMapping.findAll(
							{
								attributes: [
									"leaveCompanyId",
									"leaveAutoId",
									"companyId",
									"empType",
									"genderApplicable",
									"defaultLeaveCount",
									"maritalApplicable",
								],
								where: {
									companyId: companyId,
									genderApplicable: {
										[Op.or]: [
											{ [Op.like]: "1,%" }, // Starts with "1,"
											{ [Op.like]: "%,1,%" }, // Contains ",1,"
											{ [Op.like]: "%,1" }, // Ends with ",1"
											{ [Op.eq]: "1" }, // Exactly matches "1"
											{ [Op.like]: "2,%" }, // Starts with "2,"
											{ [Op.like]: "%,2,%" }, // Contains ",2,"
											{ [Op.like]: "%,2" }, // Ends with ",2"
											{ [Op.eq]: "2" }, // Exactly matches "2"
										],
									},
									maritalApplicable: {
										[Op.or]: [
											{ [Op.like]: "2,%" }, // Starts with "2,"
											{ [Op.like]: "%,2,%" }, // Contains ",2,"
											{ [Op.like]: "%,2" }, // Ends with ",2"
											{ [Op.eq]: "2" }, // Exactly matches "2"
											{ [Op.like]: "3,%" }, // Starts with "3,"
											{ [Op.like]: "%,3,%" }, // Contains ",3,"
											{ [Op.like]: "%,3" }, // Ends with ",3"
											{ [Op.eq]: "3" }, // Exactly matches "3"
											{ [Op.like]: "4,%" }, // Starts with "4,"
											{ [Op.like]: "%,4,%" }, // Contains ",4,"
											{ [Op.like]: "%,4" }, // Ends with ",4"
											{ [Op.eq]: "4" }, // Exactly matches "4"
											{ [Op.eq]: "5" }, // Exactly matches "5"
										],
									},
									leaveAutoId: { [Op.notIn]: [3, 4] },
								},

								raw: true,
							},
						);

						const existingMappedLeave = await db.leaveMapping.findAll({
							attributes: ["leaveAutoId"],
							where: {
								isActive: 1,
								EmployeeId: employeeId,
							},
						});

						// Extract `leaveAutoId` values from both arrays
						const genderBasedLeaveIds = getAllGenderBasedLeave.map(
							(leave) => leave.leaveAutoId,
						);
						console.log("genderBasedLeaveIds", genderBasedLeaveIds);
						const existingMappedLeaveIds = existingMappedLeave.map(
							(leave) => leave.leaveAutoId,
						);
						console.log("existingMappedLeaveIds", existingMappedLeaveIds);

						// Find common `leaveAutoId` values
						const commonLeaveAutoIds = genderBasedLeaveIds.filter(
							(id) => !existingMappedLeaveIds.includes(id),
						);

						console.log("Common leaveAutoIds:", commonLeaveAutoIds);

						// Update `isActive` to 0 for overlapping leaveAutoIds
						await db.leaveMapping.update(
							{ isActive: 0 },
							{
								where: {
									EmployeeId: employee.dataValues.id,
									leaveAutoId: [3, 4],
									isActive: 1,
								},
							},
						);

						//         // Prepare new leave records for bulk insertion
						const newLeaves = commonLeaveAutoIds.map((leaveAutoId) => {
							const compositeKey = `${leaveAutoId}-${employee.dataValues.companyId}`;
							return {
								EmployeeId: employee.id,
								leaveAutoId: leaveAutoId,
								availableLeave: leaveMasterLookup[compositeKey] || 0,
								accruedThisYear: leaveMasterLookup[compositeKey] || 0,
								isActive: 1,
							};
						});

						// Bulk insert new leave records
						if (newLeaves.length > 0) {
							await db.leaveMapping.bulkCreate(newLeaves);
							console.log(
								`Inserted ${newLeaves.length} new leaves for Employee ID: ${employee.id}`,
							);
						} else {
							console.log(
								`No new leaves to insert for Employee ID: ${employee.id}`,
							);
						}
					}
					if (genderNumber == 1 && maritalStatus == 1) {
						console.log("Male && Married");
						const getAllGenderBasedLeave = await db.leaveCompanyMapping.findAll(
							{
								attributes: [
									"leaveCompanyId",
									"leaveAutoId",
									"companyId",
									"empType",
									"genderApplicable",
									"defaultLeaveCount",
									"maritalApplicable",
								],
								where: {
									companyId: companyId,
									genderApplicable: {
										[Op.or]: [
											{ [Op.like]: "1,%" }, // Starts with "1,"
											{ [Op.like]: "%,1,%" }, // Contains ",1,"
											{ [Op.like]: "%,1" }, // Ends with ",1"
											{ [Op.eq]: "1" }, // Exactly matches "1"
										],
									},
									maritalApplicable: {
										[Op.or]: [
											{ [Op.like]: "1,%" }, // Starts with "2,"
											{ [Op.like]: "%,1,%" }, // Contains ",2,"
											{ [Op.like]: "%,1" }, // Ends with ",2"
											{ [Op.eq]: "1" }, // Exactly matches "2"
										],
									},
									leaveAutoId: { [Op.notIn]: [5] },
								},
								raw: true,
							},
						);

						const existingMappedLeave = await db.leaveMapping.findAll({
							attributes: ["leaveAutoId"],
							where: {
								isActive: 1,
								EmployeeId: employeeId,
							},
						});

						// Extract `leaveAutoId` values from both arrays
						const genderBasedLeaveIds = getAllGenderBasedLeave.map(
							(leave) => leave.leaveAutoId,
						);
						console.log("genderBasedLeaveIds", genderBasedLeaveIds);
						const existingMappedLeaveIds = existingMappedLeave.map(
							(leave) => leave.leaveAutoId,
						);
						console.log("existingMappedLeaveIds", existingMappedLeaveIds);

						// Find common `leaveAutoId` values
						const commonLeaveAutoIds = genderBasedLeaveIds.filter(
							(id) => !existingMappedLeaveIds.includes(id),
						);

						console.log("Common leaveAutoIds:", commonLeaveAutoIds);

						// Update `isActive` to 0 for overlapping leaveAutoIds
						await db.leaveMapping.update(
							{ isActive: 0 },
							{
								where: {
									EmployeeId: employee.dataValues.id,
									leaveAutoId: [3, 5],
									isActive: 1,
								},
							},
						);

						// Prepare new leave records for bulk insertion
						const newLeaves = commonLeaveAutoIds.map((leaveAutoId) => {
							const compositeKey = `${leaveAutoId}-${employee.dataValues.companyId}`;
							return {
								EmployeeId: employee.id,
								leaveAutoId: leaveAutoId,
								availableLeave: leaveMasterLookup[compositeKey] || 0,
								accruedThisYear: leaveMasterLookup[compositeKey] || 0,
								isActive: 1,
							};
						});

						// Bulk insert new leave records
						if (newLeaves.length > 0) {
							await db.leaveMapping.bulkCreate(newLeaves);
							console.log(
								`Inserted ${newLeaves.length} new leaves for Employee ID: ${employee.id}`,
							);
						} else {
							console.log(
								`No new leaves to insert for Employee ID: ${employee.id}`,
							);
						}
					}
					if (genderNumber == 2 && maritalStatus == 1) {
						console.log("Female && Married");
						const getAllGenderBasedLeave = await db.leaveCompanyMapping.findAll(
							{
								attributes: [
									"leaveCompanyId",
									"leaveAutoId",
									"companyId",
									"empType",
									"defaultLeaveCount",
									"maritalApplicable",
									"genderApplicable",
								],
								where: {
									companyId: companyId,
									genderApplicable: {
										[Op.or]: [
											{ [Op.like]: "2,%" },
											{ [Op.like]: "%,2,%" },
											{ [Op.like]: "%,2" },
											{ [Op.eq]: "2" },
										],
									},
									maritalApplicable: {
										[Op.or]: [
											{ [Op.like]: "1,%" },
											{ [Op.like]: "%,1,%" },
											{ [Op.like]: "%,1" },
											{ [Op.eq]: "1" },
										],
									},
									leaveAutoId: { [Op.notIn]: [5] },
								},
								raw: true,
							},
						);

						const existingMappedLeave = await db.leaveMapping.findAll({
							attributes: ["leaveAutoId"],
							where: {
								isActive: 1,
								EmployeeId: employeeId,
							},
						});

						// Extract `leaveAutoId` values from both arrays
						const genderBasedLeaveIds = getAllGenderBasedLeave.map(
							(leave) => leave.leaveAutoId,
						);
						const existingMappedLeaveIds = existingMappedLeave.map(
							(leave) => leave.leaveAutoId,
						);

						// Find common `leaveAutoId` values
						const commonLeaveAutoIds = genderBasedLeaveIds.filter(
							(id) => !existingMappedLeaveIds.includes(id),
						);

						console.log("Common leaveAutoIds:", commonLeaveAutoIds);

						// Update `isActive` to 0 for overlapping leaveAutoIds
						await db.leaveMapping.update(
							{ isActive: 0 },
							{
								where: {
									EmployeeId: employee.dataValues.id,
									leaveAutoId: [4, 5],
									isActive: 1,
								},
							},
						);

						// Prepare new leave records for bulk insertion
						const newLeaves = commonLeaveAutoIds.map((leaveAutoId) => {
							const compositeKey = `${leaveAutoId}-${employee.dataValues.companyId}`;
							return {
								EmployeeId: employee.id,
								leaveAutoId: leaveAutoId,
								availableLeave: leaveMasterLookup[compositeKey] || 0,
								accruedThisYear: leaveMasterLookup[compositeKey] || 0,
								isActive: 1,
							};
						});

						// Bulk insert new leave records
						if (newLeaves.length > 0) {
							await db.leaveMapping.bulkCreate(newLeaves);
							console.log(
								`Inserted ${newLeaves.length} new leaves for Employee ID: ${employee.id}`,
							);
						} else {
							console.log(
								`No new leaves to insert for Employee ID: ${employee.id}`,
							);
						}
					}
				} else {
					const compositeKey = `${6}-${employee.dataValues.companyId}`;
					const offRoleObj = {
						EmployeeId: employee.id,
						leaveAutoId: 6,
						availableLeave: leaveMasterLookup[compositeKey] || 0,
						accruedThisYear: leaveMasterLookup[compositeKey] || 0,
						isActive: 1,
					};
					const [created] = await db.leaveMapping.findOrCreate({
						where: {
							EmployeeId: employee.id,
							leaveAutoId: 6,
							isActive: 1,
						},
						defaults: offRoleObj, // Use this to provide the default values if the record is created
					});

					if (created) {
						console.log("New record created:");
					} else {
						console.log("Record already exists:");
					}
				}
			}

			return respHelper(res, {
				status: 200,
				message: "Leave updated successfully",
				data: employees.length,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	// API to credit leave using cron on particular date

	// async leaveCreditMonthCron(req, res) {
	//   const transaction = await db.sequelize.transaction(); // Start a new transaction
	//   try {
	//     const getMappedLeave = await db.leaveMapping.findAll({
	//       attributes: ["EmployeeId", "leaveAutoId"],
	//       where: { isActive: 1 },
	//       include: [
	//         {
	//           model: db.employeeMaster,
	//           attributes: ["companyId"],
	//           where: {
	//             isActive: 1,
	//             companyId: { [Op.ne]: null }, // Ensures companyId is not null
	//           },
	//         },
	//       ],
	//       raw: true,
	//     });

	//     // Loop over the employees
	//     for (const employee of getMappedLeave) {
	//       // Fetch the increment value based on the employee's company and leaveAutoId
	//       const getIncrementValue = await db.leaveCompanyMapping.findOne({
	//         where: {
	//           companyId: employee["employee.companyId"],
	//           leaveAutoId: employee.leaveAutoId,
	//           iterationDistribution: { [Op.ne]: parseFloat(0) },
	//           creditDayOfMonth: moment().format("D"),
	//         },
	//         transaction, // Ensure the query runs within the transaction
	//       });

	//       // If an increment value exists, update the leave data
	//       if (getIncrementValue) {
	//         await db.leaveMapping.increment(
	//           {
	//             availableLeave: getIncrementValue.iterationDistribution,
	//             accruedThisYear: getIncrementValue.iterationDistribution,
	//           },
	//           {
	//             where: {
	//               leaveAutoId: employee.leaveAutoId,
	//               EmployeeId: employee.EmployeeId,
	//             },
	//             transaction, // Ensure the increment runs within the transaction
	//           }
	//         );
	//       } else {
	//         console.log("No iteration distribution found for", employee.EmployeeId);
	//       }
	//     }

	//     // Commit the transaction after all operations
	//     await transaction.commit();

	//     // Return the success response
	//     return respHelper(res, {
	//       status: 200,
	//       message: "Leave updated successfully",
	//       data: getMappedLeave.length, // Number of employees processed
	//     });
	//   } catch (error) {
	//     // Rollback the transaction in case of an error
	//     await transaction.rollback();
	//     console.error("Error during leave credit update:", error);
	//     return respHelper(res, {
	//       status: 500,
	//       message: "Internal Server Error",
	//     });
	//   }
	// }

	async leaveCreditMonthCron(req, res) {
		const cronLeaveMapped = await helper.leaveCreditMonthCron();
		return respHelper(res, {
			status: cronLeaveMapped.status,
			message: cronLeaveMapped.message,
			data: cronLeaveMapped.data, // Number of employees processed
		});
	}
}

export default new LeaveController();
