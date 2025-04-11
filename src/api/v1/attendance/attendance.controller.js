import respHelper from "../../../helper/respHelper.js";
import db from "../../../config/db.config.js";
import moment from "moment";
import message from "../../../constant/messages.js";
import validator from "../../../helper/validator.js";
import helper from "../../../helper/helper.js";
import eventEmitter from "../../../services/eventService.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import pkg from "xlsx";
import logger from "../../../helper/logger.js";
import pushNotificationEmitter from "../../../services/pushNotificationEventService.js"; // New Import Sandeep
var _this = null;
class AttendanceController {
	constructor() {
		_this = this;
	}

	async attendance(req, res) {
		try {
			const result = await validator.attendanceSchema.validateAsync(req.body);
			if (result.locationType == "Office") {
				const distanceQuery = `
					SELECT 
					companyLocationId, 
					(6371 * acos(
					cos(radians(:userLat)) *
					cos(radians(latitude)) *
					cos(radians(longitude) - radians(:userLon)) +
					sin(radians(:userLat)) *
					sin(radians(latitude))
					)) AS distance
					FROM companylocationmaster
					HAVING distance <= ${process.env.RADIUS_LIMIT / 1000}; -- 0.5 km = 500 meters
				`;
				let userLat = result.latitude;
				let userLon = result.longitude;
				const withInLocatoinRange = await db.sequelize.query(distanceQuery, {
					replacements: { userLat, userLon },
					type: db.QueryTypes.SELECT,
				});
				if (withInLocatoinRange[0].length == 0) {
					return respHelper(res, {
						status: 404,
						msg: message.RADIUS_MESSAGE.replace("#", process.env.RADIUS_LIMIT),
					});
				}
			}

			const currentDate = moment();

			await db.AttendanceLogs.create({
				employeeId: req.userId,
				location: result.location,
				locationType: result.locationType,
				lat: result.latitude,
				userRemark: result.remark != "" ? result.remark : null,
				long: result.longitude,
				createdBy: req.userId,
				device: req.device,
			});
			// Sandeep

			const existEmployee = await db.employeeMaster.findOne({
				where: {
					id: req.userId,
					isActive: 1,
				},
				attributes: [
					"empCode",
					"name",
					"email",
					"weekOffId",
					"companyLocationId",
					"requiredAttendanceApproval",
					"enableMobileAttendance",
					"enableWebAttendance",
				],
				include: [
					{
						model: db.AttendanceRoster,
						required: false,
						where: {
							attendanceDate: currentDate.format("YYYY-MM-DD"),
							isActive: true,
						},
						attributes: ["shiftId", "weekOffId"],
						include: [
							{
								model: db.shiftMaster,
								attributes: [
									"shiftId",
									"shiftName",
									"shiftStartTime",
									"shiftEndTime",
									"isOverNight",
								],
							},
						],
					},
					{
						model: db.shiftMaster,
						required: false,
						attributes: [
							"shiftId",
							"shiftName",
							"shiftStartTime",
							"shiftEndTime",
							"isOverNight",
						],
						where: {
							isActive: true,
						},
					},
					{
						model: db.attendancePolicymaster,
						required: false,
						where: {
							isActive: true,
						},
					},
				],
			});

			if (!existEmployee) {
				return respHelper(res, {
					status: 200,
					data: existEmployee,
					msg: message.USER_NOT_EXIST,
				});
			}
			if (!existEmployee.shiftsmaster) {
				return respHelper(res, {
					status: 404,
					msg: message.SHIFT.NO_SHIFT,
				});
			}

			if (!existEmployee.attendancePolicymaster) {
				return respHelper(res, {
					status: 404,
					msg: message.ATTENDANCE_POLICY_DID_NOT_MAP,
				});
			}

			const mobileRegex = /(Android\s*\(.*?\)|IOS\s*\(.*?\))/g;
			if (
				mobileRegex.test(req.device) &&
				!existEmployee.enableMobileAttendance
			) {
				return respHelper(res, {
					status: 400,
					msg: message.MOBILE_ATTENDANCE_NOT_ALLOWED,
				});
			}

			const webregex =
				/(Mobile|Desktop).*?(Chrome|Firefox|Safari|Edge|Opera|Brave)|.*?(Chrome|Firefox|Safari|Edge|Opera|Brave).*?(Mobile|Desktop)/i;
			if (webregex.test(req.device) && !existEmployee.enableWebAttendance) {
				return respHelper(res, {
					status: 400,
					msg: message.WEB_ATTENDANCE_NOT_ALLOWED,
				});
			}

			if (
				(existEmployee.attendanceroster
					? existEmployee.attendanceroster.shiftsmaster.isOverNight
					: existEmployee.shiftsmaster.isOverNight) == 0
			) {
				const checkAttendance = await db.attendanceMaster.findOne({
					raw: true,
					where: {
						employeeId: req.userId,
						attendanceDate: currentDate.format("YYYY-MM-DD"),
					},
				});

				if (!checkAttendance) {
					const shiftStartTime = existEmployee.attendanceroster
						? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
						: existEmployee.shiftsmaster.shiftStartTime;
					const givenShiftTime = moment(
						`${currentDate.format("YYYY-MM-DD")} ${shiftStartTime}`,
						"YYYY-MM-DD HH:mm:ss",
					);
					const acutalShiftTime = moment(
						`${currentDate.format("YYYY-MM-DD")} ${shiftStartTime}`,
						"YYYY-MM-DD HH:mm:ss",
					);
					acutalShiftTime.subtract(
						existEmployee.attendancePolicymaster.allowBufferTime == 1
							? existEmployee.attendancePolicymaster.bufferTimePre
							: 0,
						"minutes",
					); // Add buffer time  to the selected time if buffer allow

					if (
						acutalShiftTime.format("YYYY-MM-DD") <
						givenShiftTime.format("YYYY-MM-DD")
					) {
					} else {
						const assignedShiftStartTime = existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
							: existEmployee.shiftsmaster.shiftStartTime;
						let shiftStartTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time
						shiftStartTime.subtract(
							existEmployee.attendancePolicymaster.allowBufferTime == 1
								? existEmployee.attendancePolicymaster.bufferTimePre
								: 0,
							"minutes",
						); // Add buffer time  to the selected time if buffer allow

						const finalShiftStartTime = shiftStartTime.format("HH:mm");
						const finalShiftStartTimeFormat = shiftStartTime.format("hh:mm A");
						if (currentDate.format("HH:mm") < finalShiftStartTime) {
							const assignedShiftEndTime = existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftsmaster.shiftEndTime
								: existEmployee.shiftsmaster.shiftEndTime;
							let shiftEndTime = moment(assignedShiftEndTime, "HH:mm"); // set shift start time

							shiftEndTime.subtract(
								existEmployee.attendancePolicymaster.allowBufferTime == 1
									? existEmployee.attendancePolicymaster.bufferTimePost
									: 0,
								"minutes",
							); // Add buffer time  to the selected time if buffer allow

							const finalShiftEndTime = shiftEndTime.format("HH:mm");
							const finalShiftEndimeFormat = shiftEndTime.format("hh:mm A");
							// campare shift time and current time inclu
							return respHelper(res, {
								status: 400,
								msg: `Your shift time starts from ${currentDate.format(
									"DD-MM-YYYY",
								)} at ${finalShiftStartTimeFormat} and end on ${currentDate.format(
									"DD-MM-YYYY",
								)} at ${finalShiftEndimeFormat}`,
							});
						}
					}

					let graceTime = moment(shiftStartTime, "HH:mm"); // set shift start time

					graceTime.add(
						existEmployee.attendancePolicymaster.allowBufferTime == 1
							? existEmployee.attendancePolicymaster.graceTimeClockIn
							: 0,
						"minutes",
					); // Add buffer time  to the selected time if buffer allow

					const withGraceTime = graceTime.format("HH:mm");

					let creationObject = {
						attendanceDate: currentDate.format("YYYY-MM-DD"),
						employeeId: req.userId,
						attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
						attendanceShiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePunchInTime: currentDate.format("HH:mm:ss"),
						attendanceStatus: "Punch In",
						attendanceLateBy: await helper.calculateLateBy(
							currentDate.format("HH:mm:ss"),
							withGraceTime,
						),
						attendancePresentStatus: "present",
						attendancePunchInRemark: result.remark,
						attendancePunchInLocationType: result.locationType,
						attendancePunchInLocation: result.location,
						attendancePunchInLatitude: result.latitude,
						attendancePunchInLongitude: result.longitude,
						createdBy: req.userId,
						attendancePolicyId: req.userData.attendancePolicyId,
						createdAt: currentDate,
						punchInSource: req.device,
						holidayCompanyLocationConfigurationID:
							existEmployee.companyLocationId,
					};

					if (!existEmployee.dataValues.requiredAttendanceApproval) {
						await db.attendanceMaster.create(creationObject);
					}

					const attendanceHistory = await db.attendanceHistory.findOne({
						where: {
							date: currentDate.format("YYYY-MM-DD"),
							employeeId: req.userId,
						},
					});

					await db.attendanceHistory.create({
						date: currentDate.format("YYYY-MM-DD"),
						time: currentDate.format("HH:mm:ss"),
						status: attendanceHistory ? "Punch Out" : "Punch In",
						employeeId: req.userId,
						location: result.location,
						locationType: result.locationType,
						lat: result.latitude,
						userRemark: result.remark != "" ? result.remark : null,
						attendanceStatus: !existEmployee.dataValues
							.requiredAttendanceApproval
							? "approved"
							: "pending",
						long: result.longitude,
						createdBy: req.userId,
						createdAt: currentDate,
						device: req.device,
						shiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePolicyId: req.userData.attendancePolicyId,
						companyLocationId: existEmployee.companyLocationId,
					});

					return respHelper(res, {
						status: 200,
						msg: attendanceHistory
							? message.PUNCH_OUT_SUCCESS
							: message.PUNCH_IN_SUCCESS,
					});
				} else {
					if (!existEmployee.dataValues.requiredAttendanceApproval) {
						await db.attendanceMaster.update(
							{
								attendancePunchOutTime: currentDate.format("HH:mm:ss"),
								attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
								attendancePunchOutLocationType: result.locationType,
								attendanceStatus: "Punch Out",
								attendancePunchOutRemark: result.remark,
								attendanceWorkingTime: await helper.timeDifference(
									`${checkAttendance.attandanceShiftStartDate} ${checkAttendance.attendancePunchInTime}`,
									`${currentDate.format("YYYY-MM-DD")} ${currentDate.format(
										"HH:mm:ss",
									)}`,
								),
								attendancePunchOutLocation: result.location,
								attendancePunchOutLatitude: result.latitude,
								attendancePunchOutLongitude: result.longitude,
								punchOutSource: req.device,
								updatedBy: req.userId,
							},
							{
								where: {
									attendanceDate: currentDate.format("YYYY-MM-DD"),
									employeeId: req.userId,
								},
							},
						);
					}

					const attendanceHistory = await db.attendanceHistory.findOne({
						where: {
							date: currentDate.format("YYYY-MM-DD"),
							employeeId: req.userId,
						},
					});

					await db.attendanceHistory.create({
						date: currentDate.format("YYYY-MM-DD"),
						time: currentDate.format("HH:mm:ss"),
						status: attendanceHistory ? "Punch Out" : "Punch In",
						employeeId: req.userId,
						location: result.location,
						locationType: result.locationType,
						lat: result.latitude,
						userRemark: result.remark != "" ? result.remark : null,
						attendanceStatus: !existEmployee.dataValues
							.requiredAttendanceApproval
							? "approved"
							: "pending",
						long: result.longitude,
						createdBy: req.userId,
						createdAt: currentDate,
						device: req.device,
						shiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePolicyId: req.userData.attendancePolicyId,
						companyLocationId: existEmployee.companyLocationId,
					});

					return respHelper(res, {
						status: 200,
						msg: attendanceHistory
							? message.PUNCH_OUT_SUCCESS
							: message.PUNCH_IN_SUCCESS,
					});
				}
			} else {
				// Over night code

				const assignedShiftStartTime = existEmployee.attendanceroster
					? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
					: existEmployee.shiftsmaster.shiftStartTime;
				let ShiftStartTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time

				ShiftStartTime.subtract(
					existEmployee.attendancePolicymaster.allowBufferTime == 1
						? existEmployee.attendancePolicymaster.bufferTimePre
						: 0,
					"minutes",
				); // Add buffer time  to the selected time if buffer allow

				const finalShiftStartTime = ShiftStartTime.format("HH:mm");

				const assignedShiftEndTime = existEmployee.attendanceroster
					? existEmployee.attendanceroster.shiftsmaster.shiftEndTime
					: existEmployee.shiftsmaster.shiftEndTime;
				let shiftEndtime = moment(assignedShiftEndTime, "HH:mm"); // set shift start time

				shiftEndtime.add(
					existEmployee.attendancePolicymaster.allowBufferTime == 1
						? existEmployee.attendancePolicymaster.bufferTimePost
						: 0,
					"minutes",
				); // subtract grace time  to the selected time if buffer allow

				const finalShiftEndTime = shiftEndtime.format("HH:mm");
				const tommorow = currentDate.clone().add(1, "days");

				const combinedDateTimeCurrentDay = moment(
					`${currentDate.format("YYYY-MM-DD")} ${finalShiftStartTime}`,
					"YYYY-MM-DD HH:mm:ss",
				);
				const combinedDateTimeNextDay = moment(
					`${tommorow.format("YYYY-MM-DD")} ${finalShiftEndTime}`,
					"YYYY-MM-DD HH:mm:ss",
				);

				if (
					currentDate > combinedDateTimeCurrentDay &&
					currentDate < combinedDateTimeNextDay
				) {
					const checkAttendance = await db.attendanceMaster.findOne({
						raw: true,
						where: {
							employeeId: req.userId,
							attendanceDate: currentDate.format("YYYY-MM-DD"),
						},
					});

					if (checkAttendance) {
						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.update(
								{
									attendancePunchOutTime: currentDate.format("HH:mm:ss"),
									attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
									attendancePunchOutLocationType: result.locationType,
									attendanceStatus: "Punch Out",
									attendancePunchOutRemark: result.remark,
									attendanceWorkingTime: await helper.timeDifference(
										`${checkAttendance.attandanceShiftStartDate} ${checkAttendance.attendancePunchInTime}`,
										`${currentDate.format("YYYY-MM-DD")} ${currentDate.format(
											"HH:mm:ss",
										)}`,
									),
									attendancePunchOutLocation: result.location,
									attendancePunchOutLatitude: result.latitude,
									attendancePunchOutLongitude: result.longitude,
									punchOutSource: req.device,
									updatedBy: req.userId,
								},
								{
									where: {
										attendanceDate: currentDate.format("YYYY-MM-DD"),
										employeeId: req.userId,
									},
								},
							);
						}

						const attendanceHistory = await db.attendanceHistory.findOne({
							where: {
								date: currentDate.format("YYYY-MM-DD"),
								employeeId: req.userId,
							},
						});

						await db.attendanceHistory.create({
							date: currentDate.format("YYYY-MM-DD"),
							time: currentDate.format("HH:mm:ss"),
							status: attendanceHistory ? "Punch Out" : "Punch In",
							employeeId: req.userId,
							location: result.location,
							lat: result.latitude,
							long: result.longitude,
							createdBy: req.userId,
							createdAt: currentDate,
							locationType: result.locationType,
							userRemark: result.remark != "" ? result.remark : null,
							attendanceStatus: !existEmployee.dataValues
								.requiredAttendanceApproval
								? "approved"
								: "pending",
							device: req.device,
							shiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePolicyId: req.userData.attendancePolicyId,
							companyLocationId: existEmployee.companyLocationId,
						});

						return respHelper(res, {
							status: 200,
							msg: attendanceHistory
								? message.PUNCH_OUT_SUCCESS
								: message.PUNCH_IN_SUCCESS,
						});
					} else {
						const assignedShiftStartTime = existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
							: existEmployee.shiftsmaster.shiftStartTime;
						let graceTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time

						graceTime.add(
							existEmployee.attendancePolicymaster.allowBufferTime == 1
								? existEmployee.attendancePolicymaster.graceTimeClockIn
								: 0,
							"minutes",
						); // Add buffer time  to the selected time if buffer allow

						const withGraceTime = graceTime.format("HH:mm");
						let creationObject = {
							attendanceDate: currentDate.format("YYYY-MM-DD"),
							employeeId: req.userId,
							attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
							attendanceShiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftsmaster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePunchInTime: currentDate.format("HH:mm:ss"),
							attendanceStatus: "Punch In",
							attendanceLateBy: await helper.calculateLateBy(
								currentDate.format("HH:mm:ss"),
								withGraceTime,
							),
							attendancePresentStatus: "present",
							attendancePunchInRemark: result.remark,
							attendancePunchInLocationType: result.locationType,
							attendancePunchInLocation: result.location,
							attendancePunchInLatitude: result.latitude,
							attendancePunchInLongitude: result.longitude,
							createdBy: req.userId,
							attendancePolicyId: req.userData.attendancePolicyId,
							createdAt: currentDate,
							punchInSource: req.device,
							holidayCompanyLocationConfigurationID:
								existEmployee.companyLocationId,
						};

						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.create(creationObject);
						}

						const attendanceHistory = await db.attendanceHistory.findOne({
							where: {
								date: currentDate.format("YYYY-MM-DD"),
								employeeId: req.userId,
							},
						});

						await db.attendanceHistory.create({
							date: currentDate.format("YYYY-MM-DD"),
							time: currentDate.format("HH:mm:ss"),
							status: attendanceHistory ? "Punch Out" : "Punch In",
							employeeId: req.userId,
							location: result.location,
							locationType: result.locationType,
							lat: result.latitude,
							userRemark: result.remark != "" ? result.remark : null,
							attendanceStatus: !existEmployee.dataValues
								.requiredAttendanceApproval
								? "approved"
								: "pending",
							long: result.longitude,
							createdBy: req.userId,
							createdAt: currentDate,
							device: req.device,
							shiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePolicyId: req.userData.attendancePolicyId,
							companyLocationId: existEmployee.companyLocationId,
						});

						return respHelper(res, {
							status: 200,
							msg: attendanceHistory
								? message.PUNCH_OUT_SUCCESS
								: message.PUNCH_IN_SUCCESS,
						});
					}
				} else {
					const yerterdayDate = combinedDateTimeCurrentDay
						.clone()
						.subtract(1, "days");

					const combinedDateTimeCurrentDayClone = combinedDateTimeCurrentDay
						.clone()
						.subtract(1, "days");
					const combinedDateTimeNextDayClone = combinedDateTimeNextDay
						.clone()
						.subtract(1, "days");

					if (
						currentDate > combinedDateTimeCurrentDayClone &&
						currentDate < combinedDateTimeNextDayClone
					) {
					} else {
						return respHelper(res, {
							status: 400,
							msg: `Your shift time starts from ${combinedDateTimeCurrentDay.format("DD MMMM YYYY [at] hh:mm A")} and end on ${combinedDateTimeNextDay.format("DD MMMM YYYY [at] hh:mm A")}`,
						});
					}
					const lastDayAttendace = await db.attendanceMaster.findOne({
						raw: true,
						where: {
							employeeId: req.userId,
							attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
						},
					});
					if (lastDayAttendace) {
						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.update(
								{
									attendancePunchOutTime: currentDate.format("HH:mm:ss"),
									attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
									attendancePunchOutLocationType: result.locationType,
									attendanceStatus: "Punch Out",
									attendancePunchOutRemark: result.remark,
									attendanceWorkingTime: await helper.timeDifference(
										`${yerterdayDate.format("YYYY-MM-DD")} ${
											lastDayAttendace.attendancePunchInTime
										}`,
										`${currentDate.format("YYYY-MM-DD")} ${currentDate.format(
											"HH:mm:ss",
										)}`,
									),
									attendancePunchOutLocation: result.location,
									attendancePunchOutLatitude: result.latitude,
									attendancePunchOutLongitude: result.longitude,
									punchOutSource: req.device,
									updatedBy: req.userId,
								},
								{
									where: {
										attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
										employeeId: req.userId,
									},
								},
							);
						}

						const attendanceHistory = await db.attendanceHistory.findOne({
							where: {
								date: yerterdayDate.format("YYYY-MM-DD"),
								employeeId: req.userId,
							},
						});

						await db.attendanceHistory.create({
							date: currentDate.format("YYYY-MM-DD"),
							time: currentDate.format("HH:mm:ss"),
							status: attendanceHistory ? "Punch Out" : "Punch In",
							employeeId: req.userId,
							location: result.location,
							lat: result.latitude,
							long: result.longitude,
							createdBy: req.userId,
							createdAt: currentDate,
							locationType: result.locationType,
							userRemark: result.remark != "" ? result.remark : null,
							attendanceStatus: !existEmployee.dataValues
								.requiredAttendanceApproval
								? "approved"
								: "pending",
							device: req.device,
							shiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePolicyId: req.userData.attendancePolicyId,
							companyLocationId: existEmployee.companyLocationId,
						});

						return respHelper(res, {
							status: 200,
							msg: attendanceHistory
								? message.PUNCH_OUT_SUCCESS
								: message.PUNCH_IN_SUCCESS,
						});
					} else {
						const assignedShiftStartTime = existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
							: existEmployee.shiftsmaster.shiftStartTime;
						let graceTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time

						graceTime.add(
							existEmployee.attendancePolicymaster.allowBufferTime == 1
								? existEmployee.attendancePolicymaster.graceTimeClockIn
								: 0,
							"minutes",
						); // Add buffer time  to the selected time if buffer allow
						const withGraceTime = graceTime.format("HH:mm:ss");
						let creationObject = {
							attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
							employeeId: req.userId,
							attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
							attendanceShiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftsmaster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePunchInTime: currentDate.format("HH:mm:ss"),
							attendanceStatus: "Punch In",
							attendanceLateBy: await helper.calculateLateBy(
								currentDate.format("HH:mm:ss"),
								withGraceTime,
								yerterdayDate.format("YYYY-MM-DD"),
								currentDate.format("YYYY-MM-DD"),
							),
							attendancePresentStatus: "present",
							attendancePunchInRemark: result.remark,
							attendancePunchInLocationType: result.locationType,
							attendancePunchInLocation: result.location,
							attendancePunchInLatitude: result.latitude,
							attendancePunchInLongitude: result.longitude,
							createdBy: req.userId,
							attendancePolicyId: req.userData.attendancePolicyId,
							createdAt: currentDate,
							holidayCompanyLocationConfigurationID:
								existEmployee.companyLocationId,
							punchInSource: req.device,
						};

						const attendanceHistory = await db.attendanceHistory.findOne({
							where: {
								date: yerterdayDate.format("YYYY-MM-DD"),
								employeeId: req.userId,
							},
						});

						await db.attendanceHistory.create({
							date: yerterdayDate.format("YYYY-MM-DD"),
							time: yerterdayDate.format("HH:mm:ss"),
							status: attendanceHistory ? "Punch Out" : "Punch In",
							employeeId: req.userId,
							location: result.location,
							lat: result.latitude,
							long: result.longitude,
							createdBy: req.userId,
							createdAt: currentDate,
							locationType: result.locationType,
							userRemark: result.remark != "" ? result.remark : null,
							attendanceStatus: !existEmployee.dataValues
								.requiredAttendanceApproval
								? "approved"
								: "pending",
							device: req.device,
							shiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePolicyId: req.userData.attendancePolicyId,
							companyLocationId: existEmployee.companyLocationId,
						});

						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.create(creationObject);
						}

						return respHelper(res, {
							status: 200,
							msg: attendanceHistory
								? message.PUNCH_OUT_SUCCESS
								: message.PUNCH_IN_SUCCESS,
						});
					}
				}
			}
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

	async regularizeRequest(req, res) {
		try {
			const result = await validator.regularizeRequest.validateAsync(req.body);

			const punchInDateTime = moment(
				`${result.fromDate}T${result.punchInTime}`,
			);
			const punchOutDateTime = moment(
				`${result.toDate}T${result.punchOutTime}`,
			);

			if (
				result.punchInTime == "00:00:00" ||
				result.punchOutTime == "00:00:00"
			) {
				return respHelper(res, {
					status: 400,
					msg: message.ZERO_TIME,
				});
			}

			if (result.punchInTime == result.punchOutTime) {
				return respHelper(res, {
					status: 400,
					msg: message.NOT_SAME,
				});
			}

			if (punchOutDateTime.isBefore(punchInDateTime)) {
				return respHelper(res, {
					status: 400,
					msg: message.TIME_LESS, // "PunchOut time can't be less than PunchIn time."
				});
			}

			if (moment().isBefore(result.fromDate)) {
				return respHelper(res, {
					status: 400,
					msg: message.ATTENDANCE_DATE_CANNOT_AFTER_TODAY,
				});
			}

			let attendanceData = await db.attendanceMaster.findOne({
				where: {
					attendanceAutoId: result.attendanceAutoId,
				},
				attributes: [
					"attendancePunchInTime",
					"attendancePunchOutTime",
					"attendanceRegularizeCount",
				],
				include: [
					{
						model: db.regularizationMaster,
						as: "latest_Regularization_Request",
						limit: 1,
						order: [["createdAt", "desc"]],
						attributes: ["regularizeStatus"],
					},
					{
						model: db.employeeMaster,
						attributes: ["name", "email"],
						include: [
							{
								model: db.companyMaster,
								attributes: ["senderEmail", "companyLogo"],
							},
							{
								model: db.employeeMaster,
								required: false,
								as: "managerData",
								attributes: ["id", "name", "email"],
							},
						],
					},
				],
			});

			if (!attendanceData) {
				return respHelper(res, {
					status: 404,
					msg: message.ATTENDANCE_NOT_AVAILABLE,
				});
			}

			if (
				attendanceData.dataValues.latest_Regularization_Request.length != 0 &&
				(attendanceData.dataValues.latest_Regularization_Request[0]
					.regularizeStatus === "Pending" ||
					attendanceData.dataValues.latest_Regularization_Request[0]
						.regularizeStatus === "Approved")
			) {
				return respHelper(res, {
					status: 400,
					msg: message.ALREADY_REQUESTED.replace("<module>", "Regularization"),
				});
			}

			if (
				attendanceData &&
				attendanceData.dataValues.attendanceRegularizeCount >= 3
			) {
				return respHelper(res, {
					status: 400,
					msg: message.MAXIMUM_REGULARIZATION_LIMIT,
				});
			}

			await db.regularizationMaster.create({
				attendanceAutoId: result.attendanceAutoId,
				regularizePunchInDate: result.fromDate,
				regularizePunchOutDate: result.toDate,
				regularizeUserRemark: result.remark,
				regularizeManagerId: attendanceData.dataValues.employee.managerData.id,
				regularizePunchInTime: result.punchInTime,
				regularizePunchOutTime: result.punchOutTime,
				regularizeLocationType: result.locationType,
				actualPunchIn: attendanceData.dataValues.attendancePunchInTime,
				actualPunchOut: attendanceData.dataValues.attendancePunchOutTime,
				regularizeReason: result.reason,
				regularizeStatus: "Pending",
				createdBy: req.userId,
				createdAt: moment(),
			});

			await helper.revokeAppliedLeave(result.fromDate, req.userId);

			eventEmitter.emit(
				"regularizeRequestMail",
				JSON.stringify({
					requesterName: attendanceData.dataValues.employee.name,
					attendenceFromDate: result.fromDate,
					attendenceToDate: result.toDate,
					userRemark: result.remark,
					managerName: attendanceData.dataValues.employee.managerData.name,
					managerEmail: attendanceData.dataValues.employee.managerData.email,
					senderEmail:
						attendanceData.dataValues.employee.companymaster.senderEmail,
					companyLogo:
						attendanceData.dataValues.employee.companymaster.companyLogo,
				}),
			);
			pushNotificationEmitter.emit(
                "sendNotification", {
                title: message.ATTENDANCE_REQ,
                body: message.ATTENDANCE_SUBMIT.replace("<name>", attendanceData.dataValues.employee.name),
                employeeId:attendanceData.dataValues.employee.managerData.id,
            });

			await db.attendanceMaster.update(
				{
					attendanceRegularizeCount: !attendanceData
						? 1
						: attendanceData.dataValues.attendanceRegularizeCount + 1,
					attendanceRegularizeStatus: "Pending",
				},
				{
					where: {
						attendanceAutoId: result.attendanceAutoId,
					},
				},
			);

			return respHelper(res, {
				status: 200,
				msg: message.REGULARIZE_REQUEST_SUCCESSFULL,
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

	//old implmentation
	// async attendanceList(req, res) {
	//   try {
	//     const user = req.query.user;
	//     const year = req.query.year;
	//     const month = req.query.month;
	//     const companyLocationId = req.userData.companyLocationId;
	//     let averageWorkingTime = [];
	//     let calculateLateTime = [];
	//     let calculateleaveDays = [];
	//     let calculateUnpaidleaveDays = [];
	//     let calculatePresentDays = [];
	//     let calculateAbsentDays = [];
	//     let calculateSinglePunchAbsent = [];

	//     if (!year || !month) {
	//       return respHelper(res, {
	//         status: 400,
	//         msg: "Please Fill Month and Year",
	//       });
	//     }

	//     const getLocationBasedHolidays = await db.holidayCompanyLocationConfiguration.findAll({
	//       where: { companyLocationId: companyLocationId },
	//       include: [{
	//         model: db.holidayMaster,
	//         required: true,
	//         as: "holidayDetails",
	//         attributes: ["holidayName", "holidayDate"],
	//         where: { isActive: 1 },
	//       }],
	//     });

	//     const attendanceData = await db.attendanceMaster.findAndCountAll({
	//       where: {
	//         employeeId: user ? user : req.userId,
	//         attendanceDate: {
	//           [Op.and]: [
	//             { [Op.gte]: `${year}-${month}-01` },
	//             { [Op.lte]: `${year}-${month}-${moment(`${year}-${month}`, "YYYY-MM").daysInMonth()}` },
	//           ],
	//         },
	//       },
	//       attributes: { exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"] },
	//       include: [
	//         {
	//           model: db.regularizationMaster.scope("latest"),
	//           required: false,
	//           row: true,
	//           as: "latest_Regularization_Request",
	//           attributes: ["regularizeStatus", "regularizeId"],
	//           where: { regularizeStatus: ["Pending", "Approved"] },
	//         },
	//         {
	//           model: db.holidayCompanyLocationConfiguration,
	//           required: false,
	//           as: "holidayLocationMappingDetails",
	//           include: {
	//             model: db.holidayMaster,
	//             required: true,
	//             as: "holidayDetails",
	//             attributes: ["holidayName", "holidayDate"],
	//             where: { isActive: 1 },
	//           },
	//         },
	//         {
	//           model: db.employeeLeaveTransactions,
	//           required: false,
	//           as: "employeeLeaveTransactionDetails",
	//           attributes: ["status", "employeeLeaveTransactionsId", "isHalfDay", "halfDayFor", "reason", "leaveAutoId"],
	//           limit: 2,
	//           where: { status: ["pending", "approved"], employeeId: user ? user : req.userId },
	//           include: {
	//             model: db.leaveMaster,
	//             required: false,
	//             as: "leaveMasterDetails",
	//             attributes: ["leaveName", "leaveCode"],
	//           },
	//         },
	//       ],
	//     });

	//     const monthDays = await db.CalenderYear.findAll({
	//       attributes: ["calenderId", "date", "year", "month", "fullDate"],
	//       where: { month: month, year: year },
	//     });

	//     for (const iterator of attendanceData.rows) {

	//       if (iterator.dataValues.attendanceWorkingTime) {
	//         averageWorkingTime.push(iterator.dataValues.attendanceWorkingTime);
	//       }
	//       if (iterator.dataValues.attendanceLateBy && iterator.dataValues.attendanceLateBy != "00:00:00") {
	//         calculateLateTime.push(iterator.dataValues.attendanceLateBy);
	//       }
	//       switch (iterator.dataValues.attendancePresentStatus) {
	//         case "absent":
	//           calculateAbsentDays.push(iterator.dataValues.attendanceAutoId);
	//           break;
	//         case "present":
	//           calculatePresentDays.push(iterator.dataValues.attendanceAutoId);
	//           break;
	//         case "singlePunchAbsent":
	//           calculateSinglePunchAbsent.push(iterator.dataValues.attendanceAutoId);
	//           break;
	//         case "leave":
	//           calculateleaveDays.push(iterator.dataValues.attendanceAutoId);
	//           break;
	//         case "unpaidLeave":
	//           calculateUnpaidleaveDays.push(iterator.dataValues.attendanceAutoId);
	//           break;
	//       }
	//     }

	//     let holidayDates = {};
	//     getLocationBasedHolidays.forEach((locationHoliday) => {
	//       if (locationHoliday.holidayDetails) {
	//         holidayDates[locationHoliday.holidayDetails.holidayDate] = {
	//           holidayDate: locationHoliday.holidayDetails.holidayDate,
	//           holidayName: locationHoliday.holidayDetails.holidayName,
	//         };
	//       }
	//     });

	//     const attendanceMap = attendanceData.rows.reduce((map, record) => {
	//       map[record.attendanceDate] = record;
	//       return map;
	//     }, {});

	//     let i = 0;
	//     const result = await Promise.all(monthDays.map(async (day) => {
	//       const attendance = attendanceMap[day.fullDate] || null;
	//       const holiday = holidayDates[day.fullDate] || null;
	//       const employeeLeaveTransactionDetails = await db.employeeLeaveTransactions.findAll({
	//         attributes: [
	//           "status",
	//           "employeeLeaveTransactionsId",
	//           "isHalfDay",
	//           "halfDayFor",
	//           "reason",
	//           "leaveAutoId",
	//         ],
	//         where: { employeeId: req.userId, appliedFor: attendance ? attendance.attendanceDate : day.fullDate },
	//         include: {
	//           model: db.leaveMaster,
	//           required: false,
	//           as: "leaveMasterDetails",
	//           attributes: ["leaveName", "leaveCode"],
	//         },
	//       });

	//       return {
	//         attendanceAutoId: attendance ? attendance.attendanceAutoId : i++,
	//         employeeId: attendance ? attendance.employeeId : 0,
	//         attendanceShiftId: attendance ? attendance.attendanceShiftId : 0,
	//         attendancePolicyId: attendance ? attendance.attendancePolicyId : 0,
	//         attendanceRegularizeId: attendance ? attendance.attendanceRegularizeId : 0,
	//         attendanceDate: attendance ? attendance.attendanceDate : day.fullDate,
	//         day: moment(attendance ? attendance.attendanceDate : day.fullDate).format('dddd'),
	//         attandanceShiftStartDate: attendance ? attendance.attandanceShiftStartDate : day.fullDate,
	//         attendanceShiftEndDate: attendance ? attendance.attendanceShiftEndDate : day.fullDate,
	//         attendancePunchInTime: attendance ? attendance.attendancePunchInTime : null,
	//         attendancePunchOutTime: attendance ? attendance.attendancePunchOutTime : null,
	//         attendanceLateBy: attendance ? attendance.attendanceLateBy : "",
	//         attendancePunchInRemark: attendance ? attendance.attendancePunchInRemark : "",
	//         attendancePunchOutRemark: attendance ? attendance.attendancePunchOutRemark : "",
	//         attendancePunchInLocationType: attendance ? attendance.attendancePunchInLocationType : "",
	//         attendancePunchOutLocationType: attendance ? attendance.attendancePunchOutLocationType : "",
	//         attendanceStatus: attendance ? attendance.attendanceStatus : "NA",
	//         attendancePresentStatus: attendance ? attendance.attendancePresentStatus : "NA",
	//         attendanceRegularizeStatus: attendance ? attendance.attendanceRegularizeStatus : "NA",
	//         attendanceManagerUpdateDate: attendance ? attendance.attendanceManagerUpdateDate : "NA",
	//         attendancePunchInLocation: attendance ? attendance.attendancePunchInLocation : "NA",
	//         attendancePunchInLatitude: attendance ? attendance.attendancePunchInLatitude : "",
	//         attendancePunchInLongitude: attendance ? attendance.attendancePunchInLongitude : "",
	//         attendancePunchOutLocation: attendance ? attendance.attendancePunchOutLocation : "",
	//         attendancePunchOutLatitude: attendance ? attendance.attendancePunchOutLatitude : "",
	//         attendancePunchOutLongitude: attendance ? attendance.attendancePunchOutLongitude : "",
	//         attendanceWorkingTime: attendance ? attendance.attendanceWorkingTime : null,
	//         attendanceRegularizeCount: attendance ? attendance.attendanceRegularizeCount : 0,
	//         employeeLeaveTransactionsId: attendance ? attendance.employeeLeaveTransactionsId : i,
	//         needAttendanceCron: attendance ? attendance.needAttendanceCron : 0,
	//         holidayCompanyLocationConfigurationID: attendance ? attendance.holidayCompanyLocationConfigurationID : 0,
	//         holidayLocationMappingDetails: holiday ? [holiday] : [],
	//         latest_Regularization_Request: attendance ? attendance.latest_Regularization_Request : [],
	//         employeeLeaveTransactionDetails: employeeLeaveTransactionDetails,
	//       };
	//     }));

	//     return respHelper(res, {
	//       status: 200,
	//       data: {
	//         statics: {
	//           lateTime: await helper.calculateTime(calculateLateTime),
	//           averageWorkingTime: await helper.calculateAverageHours(averageWorkingTime),
	//           absentDays: calculateAbsentDays.length,
	//           presentDays: calculatePresentDays.length,
	//           singlePunchAbsentDays: calculateSinglePunchAbsent.length,
	//           leaveDays: calculateleaveDays.length,
	//           unpaidLeaveDays: calculateUnpaidleaveDays.length,
	//         },
	//         attendanceData: {
	//           count: result.length,
	//           rows: result,
	//         },
	//       },
	//     });
	//   } catch (error) {
	//     console.log(error);
	//     return respHelper(res, { status: 500 });
	//   }
	// }

	//new implementation
	// async attendanceList(req, res) {
	//   try {
	//     const user = req.query.user;
	//     const year = req.query.year;
	//     const month = req.query.month;
	//     const companyLocationId = req.userData.companyLocationId;

	//     if (!year || !month) {
	//       return respHelper(res, {
	//         status: 400,
	//         msg: "Please Fill Month and Year",
	//       });
	//     }

	//     // Fetch all required data in bulk
	//     const [locationBasedHolidays, attendanceData, monthDays, employeeLeaveTransactions] = await Promise.all([
	//       db.holidayCompanyLocationConfiguration.findAll({
	//         where: { companyLocationId: companyLocationId },
	//         include: [{
	//           model: db.holidayMaster,
	//           required: true,
	//           as: "holidayDetails",
	//           attributes: ["holidayName", "holidayDate"],
	//           where: { isActive: 1 },
	//         }],
	//       }),
	//       db.attendanceMaster.findAll({
	//         where: {
	//           employeeId: user || req.userId,
	//           attendanceDate: {
	//             [Op.between]: [
	//               `${year}-${month}-01`,
	//               `${year}-${month}-${moment(`${year}-${month}`, "YYYY-MM").daysInMonth()}`,
	//             ],
	//           },
	//         },
	//         attributes: { exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"] },
	//         include: [
	//           {
	//             model: db.regularizationMaster.scope("latest"),
	//             required: false,
	//             as: "latest_Regularization_Request",
	//             attributes: ["regularizeStatus", "regularizeId"],
	//             where: { regularizeStatus: ["Pending", "Approved"] },
	//           },
	//           {
	//             model: db.holidayCompanyLocationConfiguration,
	//             required: false,
	//             as: "holidayLocationMappingDetails",
	//             include: {
	//               model: db.holidayMaster,
	//               required: true,
	//               as: "holidayDetails",
	//               attributes: ["holidayName", "holidayDate"],
	//               where: { isActive: 1 },
	//             },
	//           },
	//           {
	//             model: db.employeeLeaveTransactions,
	//             required: false,
	//             as: "employeeLeaveTransactionDetails",
	//             attributes: ["status", "employeeLeaveTransactionsId", "isHalfDay", "halfDayFor", "reason", "leaveAutoId"],
	//             where: { status: ["pending", "approved"], employeeId: user || req.userId },
	//             include: {
	//               model: db.leaveMaster,
	//               required: false,
	//               as: "leaveMasterDetails",
	//               attributes: ["leaveName", "leaveCode"],
	//             },
	//           },
	//         ],
	//       }),
	//       db.CalenderYear.findAll({
	//         attributes: ["calenderId", "date", "year", "month", "fullDate"],
	//         where: { month: month, year: year },
	//       }),
	//       db.employeeLeaveTransactions.findAll({
	//         attributes: ["status", "employeeLeaveTransactionsId", "isHalfDay", "halfDayFor", "reason", "leaveAutoId"],
	//         where: {
	//           employeeId: req.userId,
	//           appliedFor: {
	//             [Op.between]: [
	//               `${year}-${month}-01`,
	//               `${year}-${month}-${moment(`${year}-${month}`, "YYYY-MM").daysInMonth()}`,
	//             ],
	//           },
	//         },
	//         include: {
	//           model: db.leaveMaster,
	//           required: false,
	//           as: "leaveMasterDetails",
	//           attributes: ["leaveName", "leaveCode"],
	//         },
	//       }),
	//     ]);

	//     // Process holidays
	//     const holidayDates = locationBasedHolidays.reduce((acc, locationHoliday) => {
	//       if (locationHoliday.holidayDetails) {
	//         acc[locationHoliday.holidayDetails.holidayDate] = {
	//           holidayDate: locationHoliday.holidayDetails.holidayDate,
	//           holidayName: locationHoliday.holidayDetails.holidayName,
	//         };
	//       }
	//       return acc;
	//     }, {});

	//     // Process attendance data
	//     let averageWorkingTime = [];
	//     let calculateLateTime = [];
	//     let calculateleaveDays = [];
	//     let calculateUnpaidleaveDays = [];
	//     let calculatePresentDays = [];
	//     let calculateAbsentDays = [];
	//     let calculateSinglePunchAbsent = [];

	//     const attendanceMap = attendanceData.reduce((acc, record) => {
	//       const data = record.dataValues;
	//       acc[data.attendanceDate] = record;
	//       if (data.attendanceWorkingTime) {
	//         averageWorkingTime.push(data.attendanceWorkingTime);
	//       }
	//       if (data.attendanceLateBy && data.attendanceLateBy !== "00:00:00") {
	//         calculateLateTime.push(data.attendanceLateBy);
	//       }
	//       switch (data.attendancePresentStatus) {
	//         case "absent":
	//           calculateAbsentDays.push(data.attendanceAutoId);
	//           break;
	//         case "present":
	//           calculatePresentDays.push(data.attendanceAutoId);
	//           break;
	//         case "singlePunchAbsent":
	//           calculateSinglePunchAbsent.push(data.attendanceAutoId);
	//           break;
	//         case "leave":
	//           calculateleaveDays.push(data.attendanceAutoId);
	//           break;
	//         case "unpaidLeave":
	//           calculateUnpaidleaveDays.push(data.attendanceAutoId);
	//           break;
	//       }
	//       return acc;
	//     }, {});

	//     // Combine monthDays with attendance and holiday data
	//     const result = monthDays.map(day => {
	//       const fullDate = day.fullDate;
	//       const attendance = attendanceMap[fullDate] || {};
	//       const holiday = holidayDates[fullDate] || null;
	//       const leaveTransactions = employeeLeaveTransactions.filter(tx => tx.appliedFor === fullDate);

	//       return {
	//         attendanceAutoId: attendance.attendanceAutoId || 0,
	//         employeeId: attendance.employeeId || 0,
	//         attendanceShiftId: attendance.attendanceShiftId || 0,
	//         attendancePolicyId: attendance.attendancePolicyId || 0,
	//         attendanceRegularizeId: attendance.attendanceRegularizeId || 0,
	//         attendanceDate: attendance.attendanceDate || fullDate,
	//         day: moment(fullDate).format('dddd'),
	//         attandanceShiftStartDate: attendance.attandanceShiftStartDate || fullDate,
	//         attendanceShiftEndDate: attendance.attendanceShiftEndDate || fullDate,
	//         attendancePunchInTime: attendance.attendancePunchInTime || null,
	//         attendancePunchOutTime: attendance.attendancePunchOutTime || null,
	//         attendanceLateBy: attendance.attendanceLateBy || "",
	//         attendancePunchInRemark: attendance.attendancePunchInRemark || "",
	//         attendancePunchOutRemark: attendance.attendancePunchOutRemark || "",
	//         attendancePunchInLocationType: attendance.attendancePunchInLocationType || "",
	//         attendancePunchOutLocationType: attendance.attendancePunchOutLocationType || "",
	//         attendanceStatus: attendance.attendanceStatus || "NA",
	//         attendancePresentStatus: attendance.attendancePresentStatus || "NA",
	//         attendanceRegularizeStatus: attendance.attendanceRegularizeStatus || "NA",
	//         attendanceManagerUpdateDate: attendance.attendanceManagerUpdateDate || "NA",
	//         attendancePunchInLocation: attendance.attendancePunchInLocation || "NA",
	//         attendancePunchInLatitude: attendance.attendancePunchInLatitude || "",
	//         attendancePunchInLongitude: attendance.attendancePunchInLongitude || "",
	//         attendancePunchOutLocation: attendance.attendancePunchOutLocation || "",
	//         attendancePunchOutLatitude: attendance.attendancePunchOutLatitude || "",
	//         attendancePunchOutLongitude: attendance.attendancePunchOutLongitude || "",
	//         attendanceWorkingTime: attendance.attendanceWorkingTime || null,
	//         attendanceRegularizeCount: attendance.attendanceRegularizeCount || 0,
	//         employeeLeaveTransactionsId: attendance.employeeLeaveTransactionsId || 0,
	//         needAttendanceCron: attendance.needAttendanceCron || 0,
	//         holidayCompanyLocationConfigurationID: attendance.holidayCompanyLocationConfigurationID || 0,
	//         holidayLocationMappingDetails: holiday ? [holiday] : [],
	//         latest_Regularization_Request: attendance.latest_Regularization_Request || [],
	//         employeeLeaveTransactionDetails: leaveTransactions,
	//       };
	//     });

	//     return respHelper(res, {
	//       status: 200,
	//       data: {
	//         statics: {
	//           lateTime: await helper.calculateTime(calculateLateTime),
	//           averageWorkingTime: await helper.calculateAverageHours(averageWorkingTime),
	//           absentDays: calculateAbsentDays.length,
	//           presentDays: calculatePresentDays.length,
	//           singlePunchAbsentDays: calculateSinglePunchAbsent.length,
	//           leaveDays: calculateleaveDays.length,
	//           unpaidLeaveDays: calculateUnpaidleaveDays.length,
	//         },
	//         attendanceData: {
	//           count: result.length,
	//           rows: result,
	//         },
	//       },
	//     });
	//   } catch (error) {
	//     console.log(error);
	//     return respHelper(res, { status: 500 });
	//   }
	// }

	async attendanceList(req, res) {
		try {
			const user = req.query.user || req.userId;
			const year = req.query.year;
			const month = req.query.month;

			const companyWeekShift = await db.employeeMaster.findOne({
				attributes: ["id", "companyLocationId", "weekOffId", "shiftId"],
				where: { id: user },
			});

			const companyLocationId = companyWeekShift
				? companyWeekShift.companyLocationId
				: 0; //req.userData.companyLocationId;
			const shiftId = companyWeekShift ? companyWeekShift.shiftId : 0; //req.userData.shiftId;

			if (!year || !month) {
				return respHelper(res, {
					status: 400,
					msg: "Please Fill Month and Year",
				});
			}

			const getUserDetails = await db.employeeMaster.findOne({
				attributes: ["id", "name", "empCode", "profileImage"],
				where: { id: user },
				include: [
					{
						model: db.attendancePolicymaster,
						attributes: ["policyName", "policyCode"],
					},
					{
						model: db.shiftMaster,
						attributes: ["shiftName", "shiftStartTime", "shiftEndTime"],
					},
					{
						model: db.weekOffMaster,
						attributes: ["weekOffName", "nonWorkingDays"],
					},
				],
			});

			const startDateLeaves = `${year}-${month}-01`;
			const endDateLeaves = moment()
				.year(year)
				.month(month - 1)
				.endOf("month")
				.format("YYYY-MM-DD"); //`${year}-${month}-31`;

			// Fetch all required data in bulk
			const [
				locationBasedHolidays,
				attendanceData,
				monthDays,
				employeeLeaveTransactions,
				shiftMasters,
				//leaveLevelApproval
			] = await Promise.all([
				db.holidayCompanyLocationConfiguration.findAll({
					where: { companyLocationId: companyLocationId },
					include: [
						{
							model: db.holidayMaster,
							required: true,
							as: "holidayDetails",
							attributes: ["holidayName", "holidayDate"],
							where: { isActive: 1 },
						},
					],
				}),
				db.attendanceMaster.findAll({
					where: {
						employeeId: user,
						attendanceDate: {
							[Op.between]: [
								`${year}-${month}-01`,
								`${year}-${month}-${moment(
									`${year}-${month}`,
									"YYYY-MM",
								).daysInMonth()}`,
							],
						},
					},
					attributes: {
						exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
					},
					include: [
						{
							model: db.regularizationMaster.scope("latest"),
							required: false,
							as: "latest_Regularization_Request",
							attributes: [
								"regularizePunchInDate",
								"regularizePunchOutDate",
								"regularizeUserRemark",
								"regularizeLocationType",
								"regularizePunchInTime",
								"regularizePunchOutTime",
								"regularizeReason",
								"regularizeStatus",
								"regularizeManagerRemark",
								"regularizeId",
								"createdAt",
								"updatedAt",
								"updatedBy",
								"createdBy",
							],
							where: { regularizeStatus: ["Pending", "Approved"] },
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name"],
									as: "attendanceUpdatedBy",
									include: {
										model: db.roleMaster,
										attributes: ["name"],
									},
								},
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name"],
									as: "attendanceCreatedBy",
									include: {
										model: db.roleMaster,
										attributes: ["name"],
									},
								},
							],
						},
						{
							model: db.holidayCompanyLocationConfiguration,
							required: false,
							as: "holidayLocationMappingDetails",
							include: {
								model: db.holidayMaster,
								required: true,
								as: "holidayDetails",
								attributes: ["holidayName", "holidayDate"],
								where: { isActive: 1 },
							},
						},
						{
							model: db.employeeLeaveTransactions,
							required: false,
							as: "employeeLeaveTransactionDetails",
							attributes: [
								"status",
								"employeeLeaveTransactionsId",
								"isHalfDay",
								"halfDayFor",
								"reason",
								"leaveAutoId",
								"createdAt",
								"updatedAt",
							],
							where: {
								status: ["pending", "approved"],
								employeeId: user,
							},
							include: [
								{
									model: db.leaveMaster,
									required: false,
									as: "leaveMasterDetails",
									attributes: ["leaveName", "leaveCode"],
								},
							],
						},
					],
				}),
				Calender(month, year),
				// db.CalenderYear.findAll({
				//   attributes: ["calenderId", "date", "year", "month", "fullDate"],
				//   where: { month: month, year: year },
				// }),
				db.employeeLeaveTransactions.findAll({
					attributes: [
						"status",
						"employeeLeaveTransactionsId",
						"isHalfDay",
						"halfDayFor",
						"reason",
						"message",
						"leaveAutoId",
						"appliedOn",
						"appliedFor",
						"leaveCount",
						"fromDate",
						"toDate",
						"createdAt",
						"managerRemark",
						"leaveAttachment",
						"updatedAt",
					],
					where: {
						employeeId: user,
						appliedFor: {
							[Op.between]: [
								`${year}-${month}-01`,
								`${year}-${month}-${moment(
									`${year}-${month}`,
									"YYYY-MM",
								).daysInMonth()}`,
							],
						},
					},
					include: [
						{
							model: db.leaveMaster,
							required: false,
							as: "leaveMasterDetails",
							attributes: ["leaveName", "leaveCode"],
						},
						{
							model: db.EmployeeLeaveHeader,
							attributes: ["employeeleaveheaderID", "role"],
							include: [
								{
									model: db.leaveApprovalTrails,
									required: false,
									separate: true, // Ensures sorting is applied properly
									include: [
										{
											model: db.employeeMaster,
											attributes: ["id", "empCode", "name"],
										},
									],
									order: [["leaveTrailAutoId", "ASC"]],
								},
								{
									model: db.employeeMaster,
									attributes: ["id", "name", "empCode"],
									as: "leaveUpdatedBy",
									required: false,
								},
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name"],
									as: "leaveCreatedBy",
									required: false,
								},
							],
						},
					],
					order: [["employeeLeaveTransactionsId", "desc"]],
					//limit: 1
				}),
				db.shiftMaster.findAll({
					attributes: [
						"shiftId",
						"shiftName",
						"shiftStartTime",
						"shiftEndTime",
						"shiftRemark",
						"isOverNight",
					],
				}),
			]);

			// Create a map for shiftMaster data
			const shiftMasterMap = shiftMasters.reduce((map, shift) => {
				map[shift.shiftId] = shift;
				return map;
			}, {});

			const monthLeaves = await db.employeeLeaveTransactions.findAll({
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
					employeeId: user,
					status: "approved",
					appliedFor: {
						[db.Sequelize.Op.between]: [startDateLeaves, endDateLeaves],
					},
				},
				group: [
					"employeeId",
					"leaveAutoId",
					db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")),
				],
				raw: true,
			});
			let monthleaveCount = 0,
				unpaidmonthleaveCount = 0;
			for (const element of monthLeaves) {
				monthleaveCount += parseFloat(element.totalLeaveCount);
			}
			const monthUpaidLeave = await db.employeeLeaveTransactions.findAll({
				attributes: [
					"employeeId",
					[db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")), "month"],
					[
						db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
						"totalLeaveCount",
					],
				],
				where: {
					employeeId: user,
					status: "approved",
					leaveAutoId: 6,
					appliedFor: {
						[db.Sequelize.Op.between]: [startDateLeaves, endDateLeaves],
					},
				},
				group: [
					"employeeId",
					db.Sequelize.fn("MONTH", db.Sequelize.col("appliedFor")),
				],
				raw: true,
			});

			for (const element of monthUpaidLeave) {
				unpaidmonthleaveCount += parseFloat(element.totalLeaveCount);
			}
			// Process holidays//
			const holidayDates = locationBasedHolidays.reduce(
				(acc, locationHoliday) => {
					if (locationHoliday.holidayDetails) {
						acc[locationHoliday.holidayDetails.holidayDate] = {
							holidayDate: locationHoliday.holidayDetails.holidayDate,
							holidayName: locationHoliday.holidayDetails.holidayName,
						};
					}
					return acc;
				},
				{},
			);

			// Process attendance data
			let averageWorkingTime = [];
			let calculateLateTime = [];
			let calculateleaveDays = [];
			let calculateUnpaidleaveDays = [];
			let calculatePresentDays = [];
			let calculateAbsentDays = [];
			let calculateSinglePunchAbsent = [];

			const attendanceMap = attendanceData.reduce((acc, record) => {
				const data = record.dataValues;
				acc[data.attendanceDate] = record;
				if (data.attendanceWorkingTime) {
					averageWorkingTime.push(data.attendanceWorkingTime);
				}
				if (data.attendanceLateBy && data.attendanceLateBy !== "00:00:00") {
					calculateLateTime.push(data.attendanceLateBy);
				}
				switch (data.attendancePresentStatus) {
					case "absent":
						calculateAbsentDays.push(data.attendanceAutoId);
						break;
					case "present":
						calculatePresentDays.push(data.attendanceAutoId);
						break;
					case "singlePunchAbsent":
						calculateSinglePunchAbsent.push(data.attendanceAutoId);
						break;
					case "leave":
						calculateleaveDays.push(data.attendanceAutoId);
						break;
					case "unpaidLeave":
						calculateUnpaidleaveDays.push(data.attendanceAutoId);
						break;
				}
				return acc;
			}, {});

			// Combine monthDays with attendance and holiday data
			const result = await Promise.all(
				monthDays.map(async (day) => {
					const fullDate = day.fullDate;
					const attendance = attendanceMap[fullDate] || {};
					const holiday = holidayDates[fullDate] || null;
					const leaveTransactions = employeeLeaveTransactions.filter(
						(tx) => tx.appliedFor === fullDate,
					);
					const shiftMaster =
						shiftMasterMap[attendance.attendanceShiftId] ||
						shiftMasterMap[shiftId];

					let dayCode = parseInt(moment(fullDate).format("d")) + 1;
					let momentDate = moment(fullDate);
					let dayOfMonth = momentDate.date();
					let occurrence = Math.ceil(dayOfMonth / 7);
					const attendaceRoster = await db.AttendanceRoster.findOne({
						where: {
							employeeId: user,
							attendanceDate: day.fullDate,
						},
						include: [
							{
								model: db.shiftMaster,
								attributes: [
									"shiftId",
									"shiftName",
									"shiftStartTime",
									"shiftEndTime",
									"shiftRemark",
								],
							},
						],
					});
					const weekOffId = attendaceRoster
						? attendaceRoster.dataValues.weekOffId
						: companyWeekShift
							? companyWeekShift.weekOffId
							: 0;
					let currentWeekOffId = attendance.weekOffId || weekOffId;

					let occurrenceDayCondition = {};
					switch (occurrence) {
						case 1:
							occurrenceDayCondition = {
								dayId: dayCode,
								isfirstDayOff: 1,
								weekOffId: currentWeekOffId,
							};
							break;
						case 2:
							occurrenceDayCondition = {
								dayId: dayCode,
								isSecondDayOff: 1,
								weekOffId: currentWeekOffId,
							};
							break;
						case 3:
							occurrenceDayCondition = {
								dayId: dayCode,
								isThirdyDayOff: 1,
								weekOffId: currentWeekOffId,
							};
							break;
						case 4:
							occurrenceDayCondition = {
								dayId: dayCode,
								isFourthDayOff: 1,
								weekOffId: currentWeekOffId,
							};
							break;
						case 5:
							occurrenceDayCondition = {
								dayId: dayCode,
								isFivethDayOff: 1,
								weekOffId: currentWeekOffId,
							};
							break;
						default:
							occurrenceDayCondition = {};
					}
					let checkWeekOff = await db.weekOffDayMappingMaster.findOne({
						where: occurrenceDayCondition,
					});

					const attendancceDate = attendance.attendanceDate || fullDate;
					const daysDifference = moment().diff(attendancceDate, "days");
					return Object.assign(
						daysDifference > 0 &&
							daysDifference <= parseInt(process.env.REGULARIZE_DAYS_LIMIT)
							? {
									enableRegularize: true,
								}
							: {
									enableRegularize: false,
								},
						{
							attendanceAutoId: attendance.attendanceAutoId || 0,
							employeeId: attendance.employeeId || 0,
							attendanceShiftId: attendance.attendanceShiftId || 0,
							attendancePolicyId: attendance.attendancePolicyId || 0,
							attendanceWeekOffId: attendance.weekOffId || weekOffId,
							attendanceRegularizeId: attendance.attendanceRegularizeId || 0,
							attendanceDate: attendance.attendanceDate || fullDate,
							day: moment(fullDate).format("dddd"),
							attandanceShiftStartDate:
								attendance.attandanceShiftStartDate || fullDate,
							attendanceShiftEndDate:
								attendance.attendanceShiftEndDate || fullDate,
							attendancePunchInTime: attendance.attendancePunchInTime || null,
							attendancePunchOutTime: attendance.attendancePunchOutTime || null,
							attendanceLateBy: attendance.attendanceLateBy || "",
							attendancePunchInRemark: attendance.attendancePunchInRemark || "",
							attendancePunchOutRemark:
								attendance.attendancePunchOutRemark || "",
							attendancePunchInLocationType:
								attendance.attendancePunchInLocationType || "",
							attendancePunchOutLocationType:
								attendance.attendancePunchOutLocationType || "",
							attendanceStatus: attendance.attendanceStatus || "NA",
							attendancePresentStatus:
								attendance.attendancePresentStatus !== undefined &&
								attendance.attendancePresentStatus !== "weeklyOff" &&
								attendance.attendancePresentStatus !== "holiday"
									? attendance.attendancePresentStatus
									: (attendance.attendancePresentStatus == undefined &&
												checkWeekOff !== null) ||
										  attendance.attendancePresentStatus == "weeklyOff" ||
										  holiday !== null
										? null
										: "NA",
							// : checkWeekOff !== null
							//   ? "weeklyOff"
							//   : "NA",

							isWeeklyOff: checkWeekOff !== null ? [checkWeekOff] : [],
							attendanceRegularizeStatus:
								attendance.attendanceRegularizeStatus || "NA",
							attendanceManagerUpdateDate:
								attendance.attendanceManagerUpdateDate || "NA",
							attendancePunchInLocation:
								attendance.attendancePunchInLocation || "NA",
							attendancePunchInLatitude:
								attendance.attendancePunchInLatitude || "",
							attendancePunchInLongitude:
								attendance.attendancePunchInLongitude || "",
							attendancePunchOutLocation:
								attendance.attendancePunchOutLocation || "",
							attendancePunchOutLatitude:
								attendance.attendancePunchOutLatitude || "",
							attendancePunchOutLongitude:
								attendance.attendancePunchOutLongitude || "",
							attendanceWorkingTime: attendance.attendanceWorkingTime || null,
							attendanceRegularizeCount:
								attendance.attendanceRegularizeCount || 0,
							employeeLeaveTransactionsId:
								attendance.employeeLeaveTransactionsId || 0,
							needAttendanceCron: attendance.needAttendanceCron || 0,
							holidayCompanyLocationConfigurationID:
								attendance.holidayCompanyLocationConfigurationID || 0,
							holidayLocationMappingDetails: holiday ? [holiday] : [],

							latest_Regularization_Request:
								attendance.latest_Regularization_Request || [],
							employeeLeaveTransactionDetails: leaveTransactions,
							attendanceShiftEmployee: attendaceRoster
								? attendaceRoster.dataValues.shiftsmaster
								: shiftMaster,
							//leaveapprovaltrails:leaveLevelTrail?leaveLevelTrail.leaveapprovaltrails:[]
						},
					);
				}),
			);
			return respHelper(res, {
				status: 200,
				data: {
					statics: {
						lateTime: await helper.calculateAverageHours(calculateLateTime),
						averageWorkingTime:
							await helper.calculateAverageHours(averageWorkingTime),
						absentDays: calculateAbsentDays.length,
						presentDays: calculatePresentDays.length,
						singlePunchAbsentDays: calculateSinglePunchAbsent.length,
						leaveDays: monthleaveCount,
						unpaidLeaveDays: unpaidmonthleaveCount,
					},
					getUserDetails: getUserDetails,
					attendanceData: {
						count: result.length,
						rows: result,
					},
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, { status: 500 });
		}
	}

	async approveRegularizationRequest(req, res) {
		try {
			const result =
				await validator.approveRegularizationRequestSchema.validateAsync(
					req.body,
				);
			let respRegulariaeId = result.regularizeId.split(",");

			for (const singleids of respRegulariaeId) {
				result.regularizeId = singleids;
				const regularizeData = await db.regularizationMaster.findOne({
					raw: true,
					where: {
						regularizeId: result.regularizeId,
						regularizeManagerId: req.userId,
					},
					include: [
						{
							model: db.attendanceMaster,
							attributes: ["attendanceAutoId", "employeeId"],
							include: [
								{
									model: db.employeeMaster,
									attributes: ["attendancePolicyId", "name", "email"],
									include: [
										{
											model: db.companyMaster,
											attributes: ["senderEmail", "companyLogo"],
										},
										{
											model: db.employeeMaster,
											as: "managerData",
											attributes: ["name"],
										},
										{
											model: db.shiftMaster,
											required: false,
											attributes: [
												"shiftId",
												"shiftName",
												"shiftStartTime",
												"shiftEndTime",
												"isOverNight",
											],
											where: {
												isActive: true,
											},
										},
										{
											model: db.attendancePolicymaster,
											attributes: ["graceTimeClockIn"],
											where: {
												isActive: true,
											},
										},
									],
								},
							],
						},
					],
				});
				if (!regularizeData) {
					return respHelper(res, {
						status: 400,
						msg: message.LEAVE.NO_UPDATE,
					});
				}

				let graceTime = moment(
					regularizeData[
						"attendancemaster.employee.shiftsmaster.shiftStartTime"
					],
					"HH:mm",
				); // set shift start time

				graceTime.add(
					regularizeData[
						"attendancemaster.employee.attendancePolicymaster.graceTimeClockIn"
					],
					"minutes",
				); // Add buffer time  to the selected time if buffer allow

				const withGraceTime = graceTime.format("HH:mm");
				await db.regularizationMaster.update(
					{
						regularizeManagerRemark: result.remark != "" ? result.remark : null,
						regularizeStatus: result.status ? "Approved" : "Rejected",
						updatedBy: req.userId,
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					},
					{
						where: {
							regularizeId: result.regularizeId,
						},
					},
				);

				if (result.status) {
					console.log(
						regularizeData.regularizePunchInTime,
						withGraceTime,
						regularizeData.regularizePunchInDate,
						regularizeData.regularizePunchOutDate,
					);
					await db.attendanceMaster.update(
						{
							attendanceDate: regularizeData.regularizePunchInDate,
							attendanceWorkingTime: await helper.timeDifference(
								`${regularizeData.regularizePunchInDate} ${regularizeData.regularizePunchInTime}`,
								`${regularizeData.regularizePunchOutDate} ${regularizeData.regularizePunchOutTime}`,
							),
							attendancePresentStatus: "present",
							//attandanceShiftStartDate: regularizeData.regularizePunchInDate,
							// attendanceShiftEndDate: regularizeData.regularizePunchOutDate,
							attendancePunchInTime: regularizeData.regularizePunchInTime,
							attendancePunchOutTime: regularizeData.regularizePunchOutTime,
							attendanceRegularizeUserRemark:
								regularizeData.regularizeUserRemark,
							attendanceRegularizeManagerRemark:
								regularizeData.regularizeManagerRemark,
							attendanceRegularizeReason: regularizeData.regularizeReason,
							attendanceRegularizeStatus: "Approved",
							attendanceLateBy: await helper.calculateLateBy(
								regularizeData.regularizePunchInTime,
								withGraceTime,
								regularizeData.regularizePunchInDate,
								regularizeData.regularizePunchInDate,
							),
							createdBy: req.userId,
							//createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							updatedBy: req.userId,
							updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							where: {
								attendanceAutoId: regularizeData.attendanceAutoId,
							},
						},
					);
					_this.attedanceCronManual(
						regularizeData.attendanceAutoId,
						regularizeData.regularizePunchInDate,
					);
				} else {
					await db.attendanceMaster.update(
						{
							attendanceRegularizeStatus: "Rejected",
						},
						{
							where: {
								attendanceAutoId: regularizeData.attendanceAutoId,
							},
						},
					);

					const attendanceData = await db.attendanceMaster.findOne({
						where: {
							attendanceAutoId: regularizeData.attendanceAutoId,
						},
					});

					const autoGeneratedLeave = await db.EmployeeLeaveHeader.findOne({
						where: {
							employeeId: attendanceData.dataValues.employeeId,
							toDate: attendanceData.dataValues.attendanceDate,
							fromDate: attendanceData.dataValues.attendanceDate,
							source: "system_generated",
						},
					});

					if (autoGeneratedLeave) {
						await db.EmployeeLeaveHeader.update(
							{
								status: "approved",
							},
							{
								where: {
									employeeleaveheaderID:
										autoGeneratedLeave.dataValues.employeeleaveheaderID,
								},
							},
						);

						await db.employeeLeaveTransactions.update(
							{
								status: "approved",
							},
							{
								where: {
									employeeleaveheaderID:
										autoGeneratedLeave.dataValues.employeeleaveheaderID,
								},
							},
						);
					}
				}

				const obj = {
					email: regularizeData["attendancemaster.employee.email"],
					status: result.status ? "Approved" : "Rejected",
					fromDate: regularizeData.regularizePunchInDate,
					toDate: regularizeData.regularizePunchOutDate,
					managerName:
						regularizeData["attendancemaster.employee.managerData.name"],
					requesterName: regularizeData["attendancemaster.employee.name"],
					senderEmail:
						regularizeData[
							"attendancemaster.employee.companymaster.senderEmail"
						],
					companyLogo:
						regularizeData[
							"attendancemaster.employee.companymaster.companyLogo"
						],
				};
				eventEmitter.emit("regularizeAckMail", JSON.stringify(obj));

				 pushNotificationEmitter.emit("sendNotification", {
                    title: message.ATTENDANCE_REQ_ACK,
                    body: message.ATTENDANCE_REQ_STATUS.replace(
                        "<status>",
                        result.status ? "approved" : "rejected"),
                    employeeId: regularizeData["attendancemaster.employee.id"],
                });
			}

			return respHelper(res, {
				status: 200,
				msg: message.REGULARIZATION_ACTION.replace(
					"<status>",
					result.status ? "Approved." : "Rejected.",
				),
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

	async regularizeRequestList(req, res) {
		try {
			const query = req.query.listFor;

			// search and pagination functionality added

			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const search = req.query.search;
			let searchQuery = search
				? {
						[Op.or]: [
							{ empCode: { [Op.like]: `%${search}%` } },
							{ name: { [Op.like]: `%${search}%` } },
						],
					}
				: undefined;

			const regularizeList = await db.regularizationMaster.findAndCountAll({
				where: Object.assign(
					query === "raisedByMe"
						? {
								// createdBy: req.userId,
								regularizeStatus: "Pending",
							}
						: {
								regularizeManagerId: req.userId,
								regularizeStatus: "Pending",
							},
				),
				attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
				include: [
					{
						model: db.attendanceMaster,
						attributes: {
							exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
						},
						where: {
							...(query === "raisedByMe" && { employeeId: req.userId }),
							...(query === "assignedToMe" && {
								employeeId: { [Op.not]: req.userId },
							}),
						},
						required: true,
						include: [
							{
								model: db.employeeMaster,
								attributes: ["empCode", "name"],
								required: !!searchQuery,
								where: searchQuery || undefined,
							},
						],
					},
				],
				limit,
				offset,
				distinct: true,
			});

			return respHelper(res, {
				status: 200,
				data: regularizeList,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async revokeRegularizeRequest(req, res) {
		try {
			const regularizeId = req.query.reqularizeId;
			const arrayOfIds = regularizeId.split(",").map(Number);
			for (const regularizeId of arrayOfIds) {
				const regularizeData = await db.regularizationMaster.findOne({
					where: {
						regularizeId,
					},
					include: [
						{
							model: db.attendanceMaster,
							attributes: ["attendanceAutoId", "attendanceDate"],
							include: [
								{
									model: db.employeeMaster,
									attributes: ["empCode", "name", "email"],
									include: [
										{
											model: db.companyMaster,
											attributes: ["senderEmail", "companyLogo"],
										},
										{
											model: db.employeeMaster,
											as: "managerData",
											attributes: ["empCode", "name", "email"],
										},
									],
								},
							],
						},
					],
				});

				if (!regularizeData) {
					return respHelper(res, {
						status: 404,
						msg: message.REGULARIZE_REQUEST_NOT_FOUND,
					});
				}

				await db.regularizationMaster.update(
					{
						regularizeStatus: "Revoked",
					},
					{
						where: {
							regularizeId,
						},
					},
				);

				await db.attendanceMaster.update(
					{
						attendanceRegularizeStatus: "Revoked",
					},
					{
						where: {
							attendanceAutoId:
								regularizeData.dataValues.attendancemaster.attendanceAutoId,
						},
					},
				);
				_this.attedanceCronManual(
					regularizeData.dataValues.attendancemaster.attendanceAutoId,
					regularizeData.dataValues.attendancemaster.attendanceDate,
				);

				eventEmitter.emit(
					"revokeRegularizationMail",
					JSON.stringify({
						name: regularizeData.dataValues.attendancemaster.employee.name,
						attendanceDate:
							regularizeData.dataValues.attendancemaster.attendanceDate,
						managerName:
							regularizeData.dataValues.attendancemaster.employee.managerData
								.name,
						email:
							regularizeData.dataValues.attendancemaster.employee.managerData
								.email,
						senderEmail:
							regularizeData.dataValues.attendancemaster.employee.companymaster
								.senderEmail,
						companyLogo:
							regularizeData.dataValues.attendancemaster.employee.companymaster
								.companyLogo,
					}),
				);
			}

			return respHelper(res, {
				status: 200,
				msg: message.REGULARIZE_REQUEST_REVOKED,
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
	async manageDayNightShiftForEmp(empId) {
		let lastDayDate = moment().subtract(1, "day").format("YYYY-MM-DD");
		let lastDayDateAnotherFormat = moment()
			.subtract(1, "day")
			.format("DD-MM-YYYY");
		let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
		let dayCode = parseInt(moment().subtract(1, "day").format("d")) + 1;

		let dayOfMonth = parsedDate.date();
		let occurrence = Math.ceil(dayOfMonth / 7);
		// Output the result
		let occurrenceDayCondition = {};
		switch (occurrence) {
			case 1:
				occurrenceDayCondition = {
					dayId: dayCode,
					isfirstDayOff: 1,
				};
				break;
			case 2:
				occurrenceDayCondition = {
					dayId: dayCode,
					isSecondDayOff: 1,
				};
				break;
			case 3:
				occurrenceDayCondition = {
					dayId: dayCode,
					isThirdyDayOff: 1,
				};
				break;
			case 4:
				occurrenceDayCondition = {
					dayId: dayCode,
					isFourthDayOff: 1,
				};
				break;
			case 5:
				occurrenceDayCondition = {
					dayId: dayCode,
					isFivethDayOff: 1,
				};
				break;
			default:
		}

		const singleEmp = await db.employeeMaster.findOne({
			include: [
				{
					model: db.shiftMaster,
					required: false,
					attributes: [
						"shiftId",
						"shiftName",
						"shiftStartTime",
						"shiftEndTime",
						"isOverNight",
					],
					where: {
						isActive: 1,
					},
				},
				{
					model: db.AttendanceRoster,
					required: false,
					where: {
						isActive: 1,
						attendanceDate: lastDayDate,
					},
					include: [
						{
							model: db.shiftMaster,
							required: false,
							attributes: [
								"shiftId",
								"shiftName",
								"shiftStartTime",
								"shiftEndTime",
								"isOverNight",
							],
						},
						{
							model: db.weekOffMaster,
							where: {
								isActive: 1,
							},
							include: [
								{
									model: db.weekOffDayMappingMaster,
									attributes: ["weekOffId"],
									required: false,
									where: occurrenceDayCondition,
								},
							],
						},
					],
				},
				{
					model: db.attendancePolicymaster,
					required: false,
					where: {
						isActive: 1,
					},
				},
				{
					model: db.attendanceMaster,
					required: false,
					where: {
						attendanceDate: lastDayDate,
						needAttendanceCron: [0, 1],
					},
					include: {
						model: db.weekOffMaster,
						required: false,
						where: {
							isActive: 1,
						},
						include: [
							{
								model: db.weekOffDayMappingMaster,
								required: false,
								where: occurrenceDayCondition,
							},
						],
					},
				},
				{
					model: db.employeeLeaveTransactions,
					required: false,
					where: {
						appliedFor: lastDayDate,
						status: "approved",
					},
				},
				{
					model: db.weekOffMaster,
					required: true,
					where: {
						isActive: 1,
					},
					include: [
						{
							model: db.weekOffDayMappingMaster,
							required: false,
							where: occurrenceDayCondition,
						},
					],
				},
				{
					model: db.holidayCompanyLocationConfiguration,
					required: false,
					include: {
						model: db.holidayMaster,
						required: true,
						as: "holidayDetails",
						attributes: ["holidayName", "holidayDate"],
						where: {
							isActive: 1,
							holidayDate: lastDayDate,
						},
					},
				},
			],
			where: {
				isActive: 1,
				id: empId,
			},
		});
		const currentDate = moment();

		const combinedDateTimeCurrentDay = moment(
			`${currentDate.format("YYYY-MM-DD")} ${singleEmp.shiftsmaster.shiftEndTime}`,
			"YYYY-MM-DD HH:mm:ss",
		);
		combinedDateTimeCurrentDay.add(
			singleEmp.attendancePolicymaster.allowBufferTime == 1
				? singleEmp.attendancePolicymaster.bufferTimePost
				: 0,
			"minutes",
		); // subtract grace time  to the selected time if buffer allow
		if (currentDate > combinedDateTimeCurrentDay) {
		} else {
			return;
		}

		let presentStatus = null;

		if (
			(singleEmp?.weekOffMaster &&
				singleEmp?.weekOffMaster?.weekOffDayMappingMasters.length > 0) ||
			(singleEmp.attendanceroster &&
				singleEmp.attendanceroster.weekOffMaster &&
				singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
					.length > 0)
		) {
			presentStatus = "weeklyOff";
		} else if (
			singleEmp.holidaycompanylocationconfigurations &&
			singleEmp.holidaycompanylocationconfigurations.length > 0
		) {
			presentStatus = "holiday";
		} else if (singleEmp.employeeleavetransaction) {
			presentStatus = "leave";
		} else {
			presentStatus = "absent";
		}

		if (singleEmp.attendancemaster) {
			if (singleEmp.attendancemaster.needAttendanceCron == 1) {
				if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					singleEmp.attendancemaster.attendancePunchOutTime
				) {
					presentStatus = "present";
					let isHalfDay_late_by = null;
					let halfDayFor_late_by = null;
					let isHalfDay_total_work = null;
					let halfDayFor_total_work = null;

					//check late duration
					if (
						singleEmp.attendancePolicymaster.isleaveDeductPolicyLateDuration ==
						1
					) {
						const time = moment.duration(
							singleEmp.attendancemaster.attendanceLateBy,
						);

						// Calculate the total minutes
						let totalMinutesLateMinutes =
							time.hours() * 60 + time.minutes() + time.seconds() / 60;
						if (totalMinutesLateMinutes > 0) {
							totalMinutesLateMinutes =
								totalMinutesLateMinutes +
								singleEmp.attendancePolicymaster.graceTimeClockIn; // Adjust Grace time with late by for leave calculation
						}

						if (
							totalMinutesLateMinutes >=
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationHalfDayTime &&
							totalMinutesLateMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationFullDayTime
						) {
							isHalfDay_late_by = 1;
							halfDayFor_late_by = 1;
						} else if (
							totalMinutesLateMinutes >
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationHalfDayTime &&
							totalMinutesLateMinutes >=
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationFullDayTime
						) {
							isHalfDay_late_by = 0;
							halfDayFor_late_by = 0;
						}
					}

					//check work duration
					if (
						singleEmp.attendancePolicymaster.isleaveDeductPolicyWorkDuration ==
						1
					) {
						const timeWorkDuration = moment.duration(
							singleEmp.attendancemaster.attendanceWorkingTime,
						);

						// Calculate the total minutes
						const totalMinutesTotalHoursMinutes =
							timeWorkDuration.hours() * 60 +
							timeWorkDuration.minutes() +
							timeWorkDuration.seconds() / 60;

						if (
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationHalfDayTime &&
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationFullDayTime
						) {
							isHalfDay_total_work = 0;
							halfDayFor_total_work = 0;
						} else if (
							totalMinutesTotalHoursMinutes >
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationHalfDayTime &&
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationFullDayTime
						) {
							isHalfDay_total_work = 1;
							halfDayFor_total_work = 1;
						}
					}

					let markHalfDay = null;
					let markHalfDayType = null;
					if (isHalfDay_late_by == 0 || isHalfDay_total_work == 0) {
						markHalfDay = 0;
						markHalfDayType = 0;
					} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == 1) {
						markHalfDay = 0;
						markHalfDayType = 0;
					} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == null) {
						markHalfDay = 1;
						markHalfDayType = 1;
					} else if (isHalfDay_late_by == null && isHalfDay_total_work == 1) {
						markHalfDay = 1;
						markHalfDayType = 2;
					}
					if (
						markHalfDay != null &&
						singleEmp.weekOffMaster &&
						singleEmp.weekOffMaster.weekOffDayMappingMasters.length == 0 &&
						!singleEmp.attendanceroster &&
						singleEmp.holidaycompanylocationconfigurations &&
						singleEmp.holidaycompanylocationconfigurations.length == 0
					) {
						let EMP_DATA = await helper.getEmpProfile(singleEmp.id);
						if (EMP_DATA) {
							await helper.empMarkLeaveOfGivenDate(
								singleEmp.id,
								{
									employeeId: singleEmp.id, // Replace with actual employee ID
									attendanceShiftId: singleEmp.attendanceroster
										? singleEmp.attendanceroster.shiftsmaster.shiftId
										: singleEmp.shiftsmaster.shiftId, // Replace with actual attendance shift ID
									attendancePolicyId:
										singleEmp.attendancePolicymaster.attendancePolicyId, // Replace with actual attendance policy ID
									leaveAutoId:
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationLeaveType, // Replace with actual leave auto ID
									appliedOn: moment(lastDayDate).format("YYYY-MM-DD"), // Replace with actual applied on date
									appliedFor: lastDayDate, // Replace with actual applied for date
									fromDate: lastDayDate,
									toDate: lastDayDate,
									isHalfDay: markHalfDay, // Replace with actual is half day value (0 or 1)
									halfDayFor: markHalfDayType, // Replace with actual half day for value
									leaveCount: markHalfDay == 1 ? 0.5 : 1,
									status: isHalfDay_total_work == null ? "approved" : "pending", // Replace with actual status
									reason: "Late By/ Work Duration", // Replace with actual reason
									message: "Late By/ Work Duration",
									pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
									createdBy: singleEmp.id, // Replace with actual creator user ID
									createdAt: moment(), // Replace with actual creation date
									punchInTime: singleEmp.attendancemaster.attendancePunchInTime,
									punchOutTime:
										singleEmp.attendancemaster.attendancePunchOutTime,
									weekOffId: singleEmp.attendanceroster
										? singleEmp.attendanceroster.weekOffId
										: singleEmp?.weekOffMaster
											? singleEmp?.weekOffMaster?.weekOffId
											: 0,
								},
								"id_" + moment().format("YYYYMMDDHHmmss") + singleEmp.id,
								isHalfDay_late_by,
								isHalfDay_total_work,
								EMP_DATA,
								singleEmp,
							);
						}
					}
					if (
						singleEmp.attendancemaster &&
						singleEmp.attendancemaster.attendanceWorkingTime
					) {
						let compofftype = "Week Day";
						let attendance_auto_id =
							singleEmp.attendancemaster.attendanceAutoId;
						let attendanceStartDate =
							singleEmp.attendancemaster.attandanceShiftStartDate;
						let attendanceEndDate =
							singleEmp.attendancemaster.attendanceShiftEndDate;
						let shiftStartTime = singleEmp.shiftsmaster.shiftStartTime;
						let shiftEndTime = singleEmp.shiftsmaster.shiftEndTime;

						let allowedTime = await helper.timeDifference(
							`${attendanceStartDate} ${shiftStartTime}`,
							`${attendanceEndDate} ${shiftEndTime}`,
						);
						let working_hours =
							singleEmp.attendancemaster.attendanceWorkingTime;

						const employeeData = {
							compofftype: compofftype,
							attendance_auto_id: attendance_auto_id,
							attendanceStartDate: attendanceStartDate,
							attendanceEndDate: attendanceEndDate,
							attendanceDate: singleEmp.attendancemaster.attendanceDate,
							shiftStartTime: shiftStartTime,
							shiftEndTime: shiftEndTime,
							allowedTime: allowedTime,
							empId: empId,
							working_hours: working_hours,
							holiday: singleEmp.holidaycompanylocationconfigurations,
							weekoff:
								singleEmp.attendanceroster &&
								singleEmp.attendanceroster.weekOffMaster &&
								singleEmp.attendanceroster.weekOffMaster
									.weekOffDayMappingMasters.length != 0
									? singleEmp.attendanceroster.weekOffMaster
											.weekOffDayMappingMasters
									: singleEmp?.weekOffMaster?.weekOffDayMappingMasters,
						};
						await helper.creditCompoff(employeeData);
					}
				} else if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					!singleEmp.attendancemaster.attendancePunchOutTime
				) {
					presentStatus = "singlePunchAbsent";
				}
				await db.attendanceMaster.update(
					{
						attendanceShiftEndDate: moment()
							.subtract(0, "day")
							.format("YYYY-MM-DD"),
						attendancePresentStatus: presentStatus,
						needAttendanceCron: 0,
						// weekOffId: singleEmp.weekOffMaster
						// 	? singleEmp.weekOffMaster.weekOffId
						// 	: 0,
					},
					{
						where: {
							attendanceAutoId: singleEmp.attendancemaster.attendanceAutoId,
						},
					},
				);
			}
		} else {
			await db.attendanceMaster.create({
				attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
				attandanceShiftStartDate: moment()
					.subtract(1, "day")
					.format("YYYY-MM-DD"),
				attendanceShiftEndDate: moment()
					.subtract(0, "day")
					.format("YYYY-MM-DD"),
				employeeId: singleEmp.id,
				attendancePolicyId: singleEmp.attendancePolicyId,
				attendanceShiftId: singleEmp.attendanceroster
					? singleEmp.attendanceroster.shiftsmaster.shiftId
					: singleEmp.shiftsmaster.shiftId,
				attendancePresentStatus: presentStatus,
				needAttendanceCron: 0,
				weekOffId: singleEmp.weekOffMaster
					? singleEmp.weekOffMaster.weekOffId
					: 0,
				holidayCompanyLocationConfigurationID: singleEmp.companyLocationId,
			});
		}
	}

	async manageDayShiftForEmp(empId) {
		let lastDayDate = moment().subtract(1, "day").format("YYYY-MM-DD");
		let lastDayDateAnotherFormat = moment()
			.subtract(1, "day")
			.format("DD-MM-YYYY");
		let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
		let dayCode = parseInt(moment().subtract(1, "day").format("d")) + 1;

		let dayOfMonth = parsedDate.date();
		let occurrence = Math.ceil(dayOfMonth / 7);

		// Output the result
		let occurrenceDayCondition = {};
		switch (occurrence) {
			case 1:
				occurrenceDayCondition = {
					dayId: dayCode,
					isfirstDayOff: 1,
				};
				break;
			case 2:
				occurrenceDayCondition = {
					dayId: dayCode,
					isSecondDayOff: 1,
				};
				break;
			case 3:
				occurrenceDayCondition = {
					dayId: dayCode,
					isThirdyDayOff: 1,
				};
				break;
			case 4:
				occurrenceDayCondition = {
					dayId: dayCode,
					isFourthDayOff: 1,
				};
				break;
			case 5:
				occurrenceDayCondition = {
					dayId: dayCode,
					isFivethDayOff: 1,
				};
				break;
			default:
		}
		const singleEmp = await db.employeeMaster.findOne({
			include: [
				{
					model: db.shiftMaster,
					required: false,
					attributes: [
						"shiftId",
						"shiftName",
						"shiftStartTime",
						"shiftEndTime",
						"isOverNight",
					],
					where: {
						isActive: 1,
					},
				},
				{
					model: db.AttendanceRoster,
					required: false,
					where: {
						isActive: 1,
						attendanceDate: lastDayDate,
					},
					include: [
						{
							model: db.shiftMaster,
							required: false,
							attributes: [
								"shiftId",
								"shiftName",
								"shiftStartTime",
								"shiftEndTime",
								"isOverNight",
							],
						},
						{
							model: db.weekOffMaster,
							where: {
								isActive: 1,
							},
							include: [
								{
									model: db.weekOffDayMappingMaster,
									attributes: ["weekOffId"],
									required: false,
									where: occurrenceDayCondition,
								},
							],
						},
					],
				},
				{
					model: db.attendancePolicymaster,
					required: false,
					where: {
						isActive: 1,
					},
				},
				{
					model: db.attendanceMaster,
					required: false,
					where: {
						attendanceDate: lastDayDate,
						needAttendanceCron: [0, 1],
					},
					include: {
						model: db.weekOffMaster,
						required: false,
						where: {
							isActive: 1,
						},
						include: [
							{
								model: db.weekOffDayMappingMaster,
								required: false,
								where: occurrenceDayCondition,
							},
						],
					},
				},
				{
					model: db.employeeLeaveTransactions,
					required: false,
					where: {
						appliedFor: lastDayDate,
						status: "approved",
					},
				},
				{
					model: db.weekOffMaster,
					required: true,
					where: {
						isActive: 1,
					},
					include: [
						{
							model: db.weekOffDayMappingMaster,
							required: false,
							where: occurrenceDayCondition,
						},
					],
				},
				{
					model: db.holidayCompanyLocationConfiguration,
					required: false,
					include: {
						model: db.holidayMaster,
						required: true,
						as: "holidayDetails",
						attributes: ["holidayName", "holidayDate"],
						where: {
							isActive: 1,
							holidayDate: lastDayDate,
						},
					},
				},
			],
			where: {
				isActive: 1,
				id: empId,
			},
		});

		let presentStatus = null;

		if (
			(singleEmp?.weekOffMaster &&
				singleEmp?.weekOffMaster?.weekOffDayMappingMasters.length > 0) ||
			(singleEmp.attendanceroster &&
				singleEmp.attendanceroster.weekOffMaster &&
				singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
					.length > 0)
		) {
			presentStatus = "weeklyOff";
		} else if (
			singleEmp.holidaycompanylocationconfigurations &&
			singleEmp.holidaycompanylocationconfigurations.length > 0
		) {
			presentStatus = "holiday";
		} else if (singleEmp.employeeleavetransaction) {
			presentStatus = "leave";
		} else {
			presentStatus = "absent";
		}

		if (singleEmp.attendancemaster) {
			//console.log("attendancce ka data hai");
			if (singleEmp.attendancemaster.needAttendanceCron == 1) {
				if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					singleEmp.attendancemaster.attendancePunchOutTime
				) {
					presentStatus = "present";
					let isHalfDay_late_by = null;
					let halfDayFor_late_by = null;
					let isHalfDay_total_work = null;
					let halfDayFor_total_work = null;

					if (
						singleEmp.attendancePolicymaster.isleaveDeductPolicyLateDuration ==
						1
					) {
						const time = moment.duration(
							singleEmp.attendancemaster.attendanceLateBy,
						);

						// Calculate the total minutes
						let totalMinutesLateMinutes =
							time.hours() * 60 + time.minutes() + time.seconds() / 60;
						if (totalMinutesLateMinutes > 0) {
							totalMinutesLateMinutes =
								totalMinutesLateMinutes +
								singleEmp.attendancePolicymaster.graceTimeClockIn; // Adjust Grace time with late by for leave calculation
						}

						if (
							totalMinutesLateMinutes >=
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationHalfDayTime &&
							totalMinutesLateMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationFullDayTime
						) {
							isHalfDay_late_by = 1;
							halfDayFor_late_by = 1;
						} else if (
							totalMinutesLateMinutes >
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationHalfDayTime &&
							totalMinutesLateMinutes >=
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyLateDurationFullDayTime
						) {
							isHalfDay_late_by = 0;
							halfDayFor_late_by = 0;
						}
					}

					if (
						singleEmp.attendancePolicymaster.isleaveDeductPolicyWorkDuration ==
						1
					) {
						const timeWorkDuration = moment.duration(
							singleEmp.attendancemaster.attendanceWorkingTime,
						);

						// Calculate the total minutes
						const totalMinutesTotalHoursMinutes =
							timeWorkDuration.hours() * 60 +
							timeWorkDuration.minutes() +
							timeWorkDuration.seconds() / 60;

						if (
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationHalfDayTime &&
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationFullDayTime
						) {
							isHalfDay_total_work = 0;
							halfDayFor_total_work = 0;
						} else if (
							totalMinutesTotalHoursMinutes >
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationHalfDayTime &&
							totalMinutesTotalHoursMinutes <
								singleEmp.attendancePolicymaster
									.leaveDeductPolicyWorkDurationFullDayTime
						) {
							isHalfDay_total_work = 1;
							halfDayFor_total_work = 1;
						}
					}

					let markHalfDay = null;
					let markHalfDayType = null;
					if (isHalfDay_late_by == 0 || isHalfDay_total_work == 0) {
						markHalfDay = 0;
						markHalfDayType = 0;
					} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == 1) {
						markHalfDay = 0;
						markHalfDayType = 0;
					} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == null) {
						markHalfDay = 1;
						markHalfDayType = 1;
					} else if (isHalfDay_late_by == null && isHalfDay_total_work == 1) {
						markHalfDay = 1;
						markHalfDayType = 2;
					}

					if (
						markHalfDay != null &&
						singleEmp.weekOffMaster &&
						singleEmp.weekOffMaster.weekOffDayMappingMasters.length == 0 &&
						!singleEmp.attendanceroster &&
						singleEmp.holidaycompanylocationconfigurations &&
						singleEmp.holidaycompanylocationconfigurations.length == 0
					) {
						let EMP_DATA = await helper.getEmpProfile(singleEmp.id);
						if (EMP_DATA) {
							await helper.empMarkLeaveOfGivenDate(
								singleEmp.id,
								{
									employeeId: singleEmp.id, // Replace with actual employee ID
									attendanceShiftId: singleEmp.shiftsmaster.shiftId, // Replace with actual attendance shift ID
									attendancePolicyId:
										singleEmp.attendancePolicymaster.attendancePolicyId, // Replace with actual attendance policy ID
									leaveAutoId:
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationLeaveType, // Replace with actual leave auto ID
									appliedOn: moment(lastDayDate).format("YYYY-MM-DD"), // Replace with actual applied on date
									appliedFor: lastDayDate, // Replace with actual applied for date
									fromDate: lastDayDate,
									toDate: lastDayDate,
									isHalfDay: markHalfDay, // Replace with actual is half day value (0 or 1)
									halfDayFor: markHalfDayType, // Replace with actual half day for value
									leaveCount: markHalfDay == 1 ? 0.5 : 1,
									status: isHalfDay_total_work == null ? "approved" : "pending", // Replace with actual status
									reason: "Late By/ Work Duration", // Replace with actual reason
									message: "Late By/ Work Duration",
									pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
									createdBy: singleEmp.id, // Replace with actual creator user ID
									createdAt: moment(), // Replace with actual creation date
									punchInTime: singleEmp.attendancemaster.attendancePunchInTime,
									punchOutTime:
										singleEmp.attendancemaster.attendancePunchOutTime,
									weekOffId: singleEmp.attendanceroster
										? singleEmp.attendanceroster.weekOffId
										: singleEmp.weekOffMaster
											? singleEmp.weekOffMaster.weekOffId
											: 0,
								},
								"id_" + moment().format("YYYYMMDDHHmmss") + singleEmp.id,
								isHalfDay_late_by,
								isHalfDay_total_work,
								EMP_DATA,
								singleEmp,
							);
						}
					}
				} else if (
					singleEmp.attendancemaster.attendancePunchInTime &&
					!singleEmp.attendancemaster.attendancePunchOutTime
				) {
					presentStatus = "singlePunchAbsent";
				}

				if (
					singleEmp.attendancemaster &&
					singleEmp.attendancemaster.attendanceWorkingTime
				) {
					let compofftype = "Week Day";
					let attendance_auto_id = singleEmp.attendancemaster.attendanceAutoId;
					let attendanceStartDate =
						singleEmp.attendancemaster.attandanceShiftStartDate;
					let attendanceEndDate =
						singleEmp.attendancemaster.attendanceShiftEndDate;
					let shiftStartTime = singleEmp.shiftsmaster.shiftStartTime;
					let shiftEndTime = singleEmp.shiftsmaster.shiftEndTime;

					let allowedTime = await helper.timeDifference(
						`${attendanceStartDate} ${shiftStartTime}`,
						`${attendanceEndDate} ${shiftEndTime}`,
					);
					let working_hours = singleEmp.attendancemaster.attendanceWorkingTime;

					const employeeData = {
						compofftype: compofftype,
						attendance_auto_id: attendance_auto_id,
						attendanceStartDate: attendanceStartDate,
						attendanceEndDate: attendanceEndDate,
						attendanceDate: singleEmp.attendancemaster.attendanceDate,
						shiftStartTime: shiftStartTime,
						shiftEndTime: shiftEndTime,
						allowedTime: allowedTime,
						empId: empId,
						working_hours: working_hours,
						holiday: singleEmp.holidaycompanylocationconfigurations,
						weekoff:
							singleEmp.attendanceroster &&
							singleEmp.attendanceroster.weekOffMaster &&
							singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
								.length != 0
								? singleEmp.attendanceroster.weekOffMaster
										.weekOffDayMappingMasters
								: singleEmp?.weekOffMaster?.weekOffDayMappingMasters,
					};
					await helper.creditCompoff(employeeData);
				}
				await db.attendanceMaster.update(
					{
						attendanceShiftEndDate: moment()
							.subtract(1, "day")
							.format("YYYY-MM-DD"),
						attendancePresentStatus: presentStatus,
						needAttendanceCron: 0,
					},
					{
						where: {
							attendanceAutoId: singleEmp.attendancemaster.attendanceAutoId,
						},
					},
				);
			}
		} else {
			// console.log("attendance create");
			await db.attendanceMaster.create({
				attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
				attandanceShiftStartDate: moment()
					.subtract(1, "day")
					.format("YYYY-MM-DD"),
				attendanceShiftEndDate: moment()
					.subtract(1, "day")
					.format("YYYY-MM-DD"),
				employeeId: singleEmp.id,
				attendancePolicyId: singleEmp.attendancePolicyId,
				attendanceShiftId: singleEmp.shiftId,
				attendancePresentStatus: presentStatus,
				needAttendanceCron: 0,
				weekOffId: singleEmp.weekOffMaster
					? singleEmp.weekOffMaster.weekOffId
					: 0,
				holidayCompanyLocationConfigurationID: singleEmp.companyLocationId,
			});
		}
	}
	async attedanceCron() {
		try {
			const start = performance.now();
			console.log(
				"start",
				start,
				moment().subtract(1, "day").format("YYYY-MM-DD"),
			);
			const activeEmployees = await db.employeeMaster.findAll({
				include: [
					{
						model: db.shiftMaster,
						required: true,
						attributes: [
							"shiftId",
							"shiftName",
							"shiftStartTime",
							"shiftEndTime",
							"isOverNight",
						],
						where: {
							isActive: 1,
						},
					},
					{
						model: db.AttendanceRoster,
						required: false,
						where: {
							isActive: 1,
							attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
						},
						include: [
							{
								model: db.shiftMaster,
								required: false,
								attributes: [
									"shiftId",
									"shiftName",
									"shiftStartTime",
									"shiftEndTime",
									"isOverNight",
								],
								where: {
									isActive: 1,
								},
							},
						],
					},
					{
						model: db.attendancePolicymaster,
						required: true,
						where: {
							isActive: 1,
						},
					},
					{
						model: db.weekOffMaster,
						required: true,
						where: {
							isActive: 1,
						},
					},
					{
						model: db.holidayCompanyLocationConfiguration,
						required: false,
					},
				],
				where: {
					isActive: 1,
				},
			});
			let nightwala = 0;
			let daywala = 0;

			for (const activeEmployeeSingleItem of activeEmployees) {
				if (
					activeEmployeeSingleItem.attendanceroster
						? activeEmployeeSingleItem.attendanceroster.shiftsmaster.isOverNight
						: activeEmployeeSingleItem.shiftsmaster.isOverNight
				) {
					nightwala++;
					//await _this.manageDayNightShiftForEmp(activeEmployeeSingleItem.id);
				} else {
					daywala++;
					await _this.manageDayShiftForEmp(activeEmployeeSingleItem.id);
				}
			}
			const end = performance.now();
			const timeTaken = end - start;

			console.log(`Execution time: ${timeTaken} milliseconds`);
			return;
		} catch (error) {
			console.log(error);
		}

		// return respHelper(res, {
		//   status: 200,
		//   data: existEmployees,
		// });
	}
	async attedanceCronEveryNightShift() {
		try {
			const start = performance.now();
			console.log(
				"start",
				start,
				moment().subtract(1, "day").format("YYYY-MM-DD"),
			);
			const activeEmployees = await db.employeeMaster.findAll({
				include: [
					{
						model: db.shiftMaster,
						required: true,
						attributes: [
							"shiftId",
							"shiftName",
							"shiftStartTime",
							"shiftEndTime",
							"isOverNight",
						],
						where: {
							isActive: 1,
							isOverNight: 1,
						},
					},
					{
						model: db.AttendanceRoster,
						required: false,
						where: {
							isActive: 1,
							attendanceDate: moment().subtract(1, "day").format("YYYY-MM-DD"),
						},
						include: [
							{
								model: db.shiftMaster,
								required: false,
								attributes: [
									"shiftId",
									"shiftName",
									"shiftStartTime",
									"shiftEndTime",
									"isOverNight",
								],
								where: {
									isActive: 1,
									isOverNight: 1,
								},
							},
						],
					},
					{
						model: db.attendancePolicymaster,
						required: true,
						where: {
							isActive: 1,
						},
					},
					{
						model: db.weekOffMaster,
						required: true,
						where: {
							isActive: 1,
						},
					},
					{
						model: db.holidayCompanyLocationConfiguration,
						required: false,
					},
				],
				where: {
					isActive: 1,
				},
			});
			let nightwala = 0;
			let daywala = 0;

			for (const activeEmployeeSingleItem of activeEmployees) {
				if (
					activeEmployeeSingleItem.attendanceroster
						? activeEmployeeSingleItem.attendanceroster.shiftsmaster.isOverNight
						: activeEmployeeSingleItem.shiftsmaster.isOverNight
				) {
					nightwala++;
					await _this.manageDayNightShiftForEmp(activeEmployeeSingleItem.id);
				} else {
					daywala++;
					//await _this.manageDayShiftForEmp(activeEmployeeSingleItem.id);
				}
			}
			const end = performance.now();
			const timeTaken = end - start;

			console.log(`Execution time: ${timeTaken} milliseconds`);
			return;
		} catch (error) {
			console.log(error);
		}

		// return respHelper(res, {
		//   status: 200,
		//   data: existEmployees,
		// });
	}

	async attendenceDetails(req, res) {
		try {
			const existUser = await db.employeeMaster.findOne({
				where: {
					id: req.userId,
				},
				attributes: ["id", "name", "empCode"],
				include: [
					{
						model: db.shiftMaster,
						attributes: ["shiftStartTime", "shiftEndTime", "isOverNight"],
					},
					{
						model: db.attendancePolicymaster,
						attributes: [
							"graceTimeClockIn",
							"graceTimeClockOut",
							"allowBufferTime",
							"bufferTimePre",
							"bufferTimePost",
						],
					},
				],
			});

			let shiftEndDate = moment(
				`${moment().format("YYYY-MM-DD")} ${existUser.shiftsmaster.dataValues.shiftEndTime}`,
			);

			shiftEndDate.add(
				existUser.attendancePolicymaster.allowBufferTime == 1
					? existUser.attendancePolicymaster.bufferTimePost
					: 0,
				"minutes",
			);

			let shiftStartDate;

			shiftStartDate = moment(
				`${moment().format("YYYY-MM-DD")} ${existUser.shiftsmaster.dataValues.shiftStartTime}`,
			);

			shiftStartDate.subtract(
				existUser.attendancePolicymaster.allowBufferTime == 1
					? existUser.attendancePolicymaster.bufferTimePre
					: 0,
				"minutes",
			);

			shiftStartDate =
				existUser.shiftsmaster.dataValues.isOverNight &&
				moment().isBefore(shiftStartDate)
					? shiftStartDate.subtract(1, "day")
					: shiftStartDate;
			shiftEndDate =
				existUser.shiftsmaster.dataValues.isOverNight &&
				moment().isAfter(shiftStartDate)
					? shiftEndDate.add(1, "day")
					: shiftEndDate;

			let attendanceData = await db.attendanceHistory.findOne({
				where: {
					employeeId: req.userId,
					[Op.and]: [
						db.Sequelize.where(
							db.Sequelize.fn(
								"concat",
								db.Sequelize.col("date"),
								" ",
								db.Sequelize.col("time"),
							),
							{
								[Op.between]: [
									new Date(shiftStartDate),
									new Date(shiftEndDate),
								],
							},
						),
					],
				},
			});

			return respHelper(res, {
				status: 200,
				msg: message.ATTENDANCE_NOT_AVAILABLE,
				data: attendanceData,
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
	async attedanceCronManual(attendanceAutoId, date) {
		try {
			let lastDayDate = moment(date).format("YYYY-MM-DD");
			//console.log("date", date);
			//console.log("attendanceAutoId", attendanceAutoId);
			let lastDayDateAnotherFormat = moment(date).format("DD-MM-YYYY");
			let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
			let dayCode = parseInt(moment(date).format("d")) + 1;

			let dayOfMonth = parsedDate.date();
			let occurrence = Math.ceil(dayOfMonth / 7);

			// Output the result
			let occurrenceDayCondition = {};
			switch (occurrence) {
				case 1:
					occurrenceDayCondition = {
						dayId: dayCode,
						isfirstDayOff: 1,
					};
					break;
				case 2:
					occurrenceDayCondition = {
						dayId: dayCode,
						isSecondDayOff: 1,
					};
					break;
				case 3:
					occurrenceDayCondition = {
						dayId: dayCode,
						isThirdyDayOff: 1,
					};
					break;
				case 4:
					occurrenceDayCondition = {
						dayId: dayCode,
						isFourthDayOff: 1,
					};
					break;
				case 5:
					occurrenceDayCondition = {
						dayId: dayCode,
						isFivethDayOff: 1,
					};
					break;
				default:
			}
			const existEmployees = await db.employeeMaster.findAll({
				include: [
					{
						model: db.AttendanceRoster,
						required: false,
						where: {
							attendanceDate: lastDayDate,
						},
						include: [
							{
								model: db.shiftMaster,
								required: false,
								attributes: [
									"shiftId",
									"shiftName",
									"shiftStartTime",
									"shiftEndTime",
									"isOverNight",
								],
								where: {
									isActive: 1,
								},
							},
							{
								model: db.weekOffMaster,
								where: {
									isActive: 1,
								},
								include: [
									{
										model: db.weekOffDayMappingMaster,
										attributes: ["weekOffId"],
										required: false,
										where: occurrenceDayCondition,
									},
								],
							},
						],
					},
					{
						model: db.shiftMaster,
						required: false,
						attributes: [
							"shiftId",
							"shiftName",
							"shiftStartTime",
							"shiftEndTime",
							"isOverNight",
						],
						where: {
							isActive: 1,
						},
					},
					{
						model: db.attendancePolicymaster,
						required: false,
						where: {
							isActive: 1,
						},
					},
					{
						model: db.attendanceMaster,
						required: true,
						where: {
							attendanceDate: lastDayDate,
							attendanceAutoId: attendanceAutoId,
						},
						include: {
							model: db.weekOffMaster,
							required: false,
							where: {
								isActive: 1,
							},
							include: [
								{
									model: db.weekOffDayMappingMaster,
									required: false,
									where: occurrenceDayCondition,
								},
							],
						},
					},
					{
						model: db.employeeLeaveTransactions,
						required: false,
						where: {
							appliedFor: lastDayDate,
							status: "approved",
						},
					},
					{
						model: db.weekOffMaster,
						required: true,
						include: [
							{
								model: db.weekOffDayMappingMaster,
								required: false,
								where: occurrenceDayCondition,
							},
						],
					},
					{
						model: db.holidayCompanyLocationConfiguration,
						required: false,
						include: {
							model: db.holidayMaster,
							required: true,
							as: "holidayDetails",
							attributes: ["holidayName", "holidayDate"],
							where: {
								isActive: 1,
								holidayDate: lastDayDate,
							},
						},
					},
				],
				where: {
					isActive: 1,
				},
			});

			await Promise.all(
				existEmployees.map(async (singleEmp) => {
					let presentStatus = null;

					if (
						singleEmp?.weekOffMaster.weekOffDayMappingMasters.length > 0 ||
						(singleEmp.attendanceroster &&
							singleEmp.attendanceroster.weekOffMaster &&
							singleEmp.attendanceroster.weekOffMaster.weekOffDayMappingMasters
								.length > 0)
					) {
						presentStatus = "weeklyOff";
					} else if (
						singleEmp.holidaycompanylocationconfigurations.length > 0
					) {
						presentStatus = "holiday";
					} else if (singleEmp.employeeleavetransaction) {
						presentStatus = "leave";
					} else {
						presentStatus = "absent";
					}
					console.log("singleEmp.attendancemaster", singleEmp.attendancemaster);
					console.log(
						"singleEmp.attendancemaster.attendancePunchInTime",
						singleEmp.attendancemaster.attendancePunchInTime,
					);
					console.log(
						"singleEmp.attendancemaster.attendancePunchInTime",
						singleEmp.attendancemaster.attendancePunchOutTime,
					);
					if (singleEmp.attendancemaster) {
						if (
							singleEmp.attendancemaster.attendancePunchInTime &&
							singleEmp.attendancemaster.attendancePunchOutTime
						) {
							presentStatus = "present";
							let isHalfDay_late_by = null;
							let halfDayFor_late_by = null;
							let isHalfDay_total_work = null;
							let halfDayFor_total_work = null;

							if (
								singleEmp.attendancePolicymaster
									.isleaveDeductPolicyLateDuration == 1
							) {
								const time = moment.duration(
									singleEmp.attendancemaster.attendanceLateBy,
								);

								// Calculate the total minutes
								let totalMinutesLateMinutes =
									time.hours() * 60 + time.minutes() + time.seconds() / 60;
								//console.log("totalMinutesLateMinutes", totalMinutesLateMinutes);
								if (totalMinutesLateMinutes > 0) {
									totalMinutesLateMinutes =
										totalMinutesLateMinutes +
										singleEmp.attendancePolicymaster.graceTimeClockIn; // Adjust Grace time with late by for leave calculation
								}

								if (
									totalMinutesLateMinutes >=
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationHalfDayTime &&
									totalMinutesLateMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationFullDayTime
								) {
									isHalfDay_late_by = 1;
									halfDayFor_late_by = 1;
								} else if (
									totalMinutesLateMinutes >
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationHalfDayTime &&
									totalMinutesLateMinutes >=
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationFullDayTime
								) {
									isHalfDay_late_by = 0;
									halfDayFor_late_by = 0;
								}
							}

							if (
								singleEmp.attendancePolicymaster
									.isleaveDeductPolicyWorkDuration == 1
							) {
								const timeWorkDuration = moment.duration(
									singleEmp.attendancemaster.attendanceWorkingTime,
								);

								// Calculate the total minutes
								const totalMinutesTotalHoursMinutes =
									timeWorkDuration.hours() * 60 +
									timeWorkDuration.minutes() +
									timeWorkDuration.seconds() / 60;

								if (
									totalMinutesTotalHoursMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationHalfDayTime &&
									totalMinutesTotalHoursMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationFullDayTime
								) {
									isHalfDay_total_work = 0;
									halfDayFor_total_work = 0;
								} else if (
									totalMinutesTotalHoursMinutes >=
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationHalfDayTime &&
									totalMinutesTotalHoursMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationFullDayTime
								) {
									isHalfDay_total_work = 1;
									halfDayFor_total_work = 1;
								}
							}

							let markHalfDay = null;
							let markHalfDayType = null;
							if (isHalfDay_late_by == 0 || isHalfDay_total_work == 0) {
								markHalfDay = 0;
								markHalfDayType = 0;
							} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == 1) {
								markHalfDay = 0;
								markHalfDayType = 0;
							} else if (
								isHalfDay_late_by == 1 &&
								isHalfDay_total_work == null
							) {
								markHalfDay = 1;
								markHalfDayType = 1;
							} else if (
								isHalfDay_late_by == null &&
								isHalfDay_total_work == 1
							) {
								markHalfDay = 1;
								markHalfDayType = 2;
							}
							await helper.revokeAppliedLeave(date, singleEmp.id);

							if (
								markHalfDay != null &&
								singleEmp?.weekOffMaster &&
								singleEmp?.weekOffMaster.weekOffDayMappingMasters.length == 0 &&
								!singleEmp.attendanceroster &&
								singleEmp.holidaycompanylocationconfigurations &&
								singleEmp.holidaycompanylocationconfigurations.length == 0
							) {
								let EMP_DATA = await helper.getEmpProfile(singleEmp.id);
								if (EMP_DATA) {
									await helper.empMarkLeaveOfGivenDate(
										singleEmp.id,
										{
											employeeId: singleEmp.id, // Replace with actual employee ID
											attendanceShiftId: singleEmp.attendanceroster
												? singleEmp.attendanceroster.shiftsmaster.shiftId
												: singleEmp.shiftsmaster.shiftId, // Replace with actual attendance shift ID
											attendancePolicyId:
												singleEmp.attendancePolicymaster.attendancePolicyId, // Replace with actual attendance policy ID
											leaveAutoId:
												singleEmp.attendancePolicymaster
													.leaveDeductPolicyLateDurationLeaveType, // Replace with actual leave auto ID
											appliedOn: moment().format("YYYY-MM-DD"), // Replace with actual applied on date
											appliedFor: lastDayDate, // Replace with actual applied for date
											fromDate: lastDayDate,
											toDate: lastDayDate,
											isHalfDay: markHalfDay, // Replace with actual is half day value (0 or 1)
											halfDayFor: markHalfDayType, // Replace with actual half day for value
											leaveCount: markHalfDay == 1 ? 0.5 : 1,
											status:
												isHalfDay_total_work == null ? "approved" : "pending", // Replace with actual status
											reason: "Late By/ Work Duration", // Replace with actual reason
											message: "Late By/ Work Duration",
											pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
											createdBy: singleEmp.id, // Replace with actual creator user ID
											createdAt: moment(), // Replace with actual creation date
											weekOffId: singleEmp.attendanceroster
												? singleEmp.attendanceroster.weekOffId
												: singleEmp?.weekOffMaster
													? singleEmp?.weekOffMaster?.weekOffId
													: 0,
											punchInTime:
												singleEmp.attendancemaster.attendancePunchInTime,
											punchOutTime:
												singleEmp.attendancemaster.attendancePunchOutTime,
										},
										"id_" + moment().format("YYYYMMDDHHmmss") + singleEmp.id,
										isHalfDay_late_by,
										isHalfDay_total_work,
										EMP_DATA,
										singleEmp,
									);
								}
							}

							if (
								singleEmp.attendancemaster.attendancePunchInTime &&
								singleEmp.attendancemaster.attendancePunchOutTime
							) {
								let compofftype = "Week Day";
								let attendance_auto_id =
									singleEmp.attendancemaster.attendanceAutoId;
								let attendanceStartDate =
									singleEmp.attendancemaster.attandanceShiftStartDate;
								let attendanceEndDate =
									singleEmp.attendancemaster.attendanceShiftEndDate;
								let shiftStartTime = singleEmp.shiftsmaster.shiftStartTime;
								let shiftEndTime = singleEmp.shiftsmaster.shiftEndTime;

								let allowedTime = await helper.timeDifference(
									`${attendanceStartDate} ${shiftStartTime}`,
									`${attendanceEndDate} ${shiftEndTime}`,
								);

								let working_hours =
									singleEmp.attendancemaster.attendanceWorkingTime;

								const employeeData = {
									compofftype: compofftype,
									attendance_auto_id: attendance_auto_id,
									attendanceStartDate: attendanceStartDate,
									attendanceEndDate: attendanceEndDate,
									attendanceDate: singleEmp.attendancemaster.attendanceDate,
									shiftStartTime: shiftStartTime,
									shiftEndTime: shiftEndTime,
									allowedTime: allowedTime,
									empId: singleEmp.id,
									working_hours: working_hours,
									holiday: singleEmp.holidaycompanylocationconfigurations,
									weekoff:
										singleEmp.attendanceroster &&
										singleEmp.attendanceroster.weekOffMaster &&
										singleEmp.attendanceroster.weekOffMaster
											.weekOffDayMappingMasters.length == 0
											? singleEmp.attendanceroster.weekOffMaster
													.weekOffDayMappingMasters
											: singleEmp?.weekOffMaster?.weekOffDayMappingMasters,
								};

								await helper.creditCompoff(employeeData);
							}
						} else {
							if (
								!singleEmp.attendancemaster.attendancePunchInTime &&
								!singleEmp.attendancemaster.attendancePunchOutTime
							) {
								presentStatus = "absent";
							} else {
								presentStatus =
									lastDayDate === moment().format("YYYY-MM-DD")
										? singleEmp.attendancemaster.attendancePresentStatus
										: "singlePunchAbsent";
							}
						}
						await db.attendanceMaster.update(
							{
								//attendanceShiftEndDate: moment().format("YYYY-MM-DD"),
								attendancePresentStatus: presentStatus,
								needAttendanceCron: 0,
							},
							{
								where: {
									attendanceAutoId: singleEmp.attendancemaster.attendanceAutoId,
								},
							},
						);
					}
				}),
			);
		} catch (error) {}

		// return respHelper(res, {
		//   status: 200,
		//   data: existEmployees,
		// });
	}

	async attedanceCronForEMP(req, res) {
		try {
			let empId = req.body.EMP_ID;
			let date = req.body.DATE;

			let lastDayDate = moment(date).format("YYYY-MM-DD");
			let lastDayDateAnotherFormat = moment(date).format("DD-MM-YYYY");
			let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
			let dayCode = parseInt(moment(date).format("d")) + 1;

			let dayOfMonth = parsedDate.date();
			let occurrence = Math.ceil(dayOfMonth / 7);

			// Output the result
			let occurrenceDayCondition = {};
			switch (occurrence) {
				case 1:
					occurrenceDayCondition = {
						dayId: dayCode,
						isfirstDayOff: 1,
					};
					break;
				case 2:
					occurrenceDayCondition = {
						dayId: dayCode,
						isSecondDayOff: 1,
					};
					break;
				case 3:
					occurrenceDayCondition = {
						dayId: dayCode,
						isThirdyDayOff: 1,
					};
					break;
				case 4:
					occurrenceDayCondition = {
						dayId: dayCode,
						isFourthDayOff: 1,
					};
					break;
				case 5:
					occurrenceDayCondition = {
						dayId: dayCode,
						isFivethDayOff: 1,
					};
					break;
				default:
			}

			const existEmployees = await db.employeeMaster.findAll({
				include: [
					{
						model: db.shiftMaster,
						required: false,
						attributes: [
							"shiftId",
							"shiftName",
							"shiftStartTime",
							"shiftEndTime",
							"isOverNight",
						],
						where: {
							isActive: 1,
						},
					},
					{
						model: db.attendancePolicymaster,
						required: false,
						where: {
							isActive: 1,
						},
					},
					{
						model: db.attendanceMaster,
						required: false,
						where: {
							attendanceDate: lastDayDate,
							needAttendanceCron: [0, 1],
						},
					},
					{
						model: db.employeeLeaveTransactions,
						required: false,
						where: {
							appliedFor: lastDayDate,
							status: "approved",
						},
					},
					{
						model: db.weekOffMaster,
						required: true,
						where: {
							isActive: 1,
						},
						include: [
							{
								model: db.weekOffDayMappingMaster,
								required: false,
								where: occurrenceDayCondition,
							},
						],
					},
					{
						model: db.holidayCompanyLocationConfiguration,
						required: false,
						include: {
							model: db.holidayMaster,
							required: true,
							as: "holidayDetails",
							attributes: ["holidayName", "holidayDate"],
							where: {
								isActive: 1,
								holidayDate: lastDayDate,
							},
						},
					},
				],
				where: {
					isActive: 1,
				},
			});

			for (const singleEmp of existEmployees) {
				let presentStatus = null;

				if (singleEmp.weekOffMaster.weekOffDayMappingMasters.length > 0) {
					presentStatus = "weeklyOff";
				} else if (singleEmp.holidaycompanylocationconfigurations.length > 0) {
					presentStatus = "holiday";
				} else if (singleEmp.employeeleavetransaction) {
					presentStatus = "leave";
				} else {
					presentStatus = "absent";
				}

				if (singleEmp.attendancemaster) {
					if (singleEmp.attendancemaster.needAttendanceCron == 1) {
						if (
							singleEmp.attendancemaster.attendancePunchInTime &&
							singleEmp.attendancemaster.attendancePunchOutTime
						) {
							presentStatus = "present";
							let isHalfDay_late_by = null;
							let halfDayFor_late_by = null;
							let isHalfDay_total_work = null;
							let halfDayFor_total_work = null;

							if (
								singleEmp.attendancePolicymaster
									.isleaveDeductPolicyLateDuration == 1
							) {
								const time = moment.duration(
									singleEmp.attendancemaster.attendanceLateBy,
								);

								// Calculate the total minutes
								let totalMinutesLateMinutes =
									time.hours() * 60 + time.minutes() + time.seconds() / 60;
								if (totalMinutesLateMinutes > 0) {
									totalMinutesLateMinutes =
										totalMinutesLateMinutes +
										singleEmp.attendancePolicymaster.graceTimeClockIn; // Adjust Grace time with late by for leave calculation
								}

								if (
									totalMinutesLateMinutes >=
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationHalfDayTime &&
									totalMinutesLateMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationFullDayTime
								) {
									isHalfDay_late_by = 1;
									halfDayFor_late_by = 1;
								} else if (
									totalMinutesLateMinutes >
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationHalfDayTime &&
									totalMinutesLateMinutes >=
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyLateDurationFullDayTime
								) {
									isHalfDay_late_by = 0;
									halfDayFor_late_by = 0;
								}
							}

							if (
								singleEmp.attendancePolicymaster
									.isleaveDeductPolicyWorkDuration == 1
							) {
								const timeWorkDuration = moment.duration(
									singleEmp.attendancemaster.attendanceWorkingTime,
								);

								// Calculate the total minutes
								const totalMinutesTotalHoursMinutes =
									timeWorkDuration.hours() * 60 +
									timeWorkDuration.minutes() +
									timeWorkDuration.seconds() / 60;

								if (
									totalMinutesTotalHoursMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationHalfDayTime &&
									totalMinutesTotalHoursMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationFullDayTime
								) {
									isHalfDay_total_work = 0;
									halfDayFor_total_work = 0;
								} else if (
									totalMinutesTotalHoursMinutes >=
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationHalfDayTime &&
									totalMinutesTotalHoursMinutes <
										singleEmp.attendancePolicymaster
											.leaveDeductPolicyWorkDurationFullDayTime
								) {
									isHalfDay_total_work = 1;
									halfDayFor_total_work = 1;
								}
							}

							let markHalfDay = null;
							let markHalfDayType = null;
							if (isHalfDay_late_by == 0 || isHalfDay_total_work == 0) {
								markHalfDay = 0;
								markHalfDayType = 0;
							} else if (isHalfDay_late_by == 1 && isHalfDay_total_work == 1) {
								markHalfDay = 0;
								markHalfDayType = 0;
							} else if (
								isHalfDay_late_by == 1 &&
								isHalfDay_total_work == null
							) {
								markHalfDay = 1;
								markHalfDayType = 1;
							} else if (
								isHalfDay_late_by == null &&
								isHalfDay_total_work == 1
							) {
								markHalfDay = 1;
								markHalfDayType = 2;
							}

							if (markHalfDay != null) {
								let EMP_DATA = await helper.getEmpProfile(singleEmp.id);

								if (EMP_DATA) {
									await helper.empMarkLeaveOfGivenDate(
										singleEmp.id,
										{
											employeeId: singleEmp.id, // Replace with actual employee ID
											attendanceShiftId: singleEmp.shiftsmaster.shiftId, // Replace with actual attendance shift ID
											attendancePolicyId:
												singleEmp.attendancePolicymaster.attendancePolicyId, // Replace with actual attendance policy ID
											leaveAutoId:
												singleEmp.attendancePolicymaster
													.leaveDeductPolicyLateDurationLeaveType, // Replace with actual leave auto ID
											appliedOn: moment().format("YYYY-MM-DD"), // Replace with actual applied on date
											appliedFor: lastDayDate, // Replace with actual applied for date
											fromDate: lastDayDate,
											toDate: lastDayDate,
											isHalfDay: markHalfDay, // Replace with actual is half day value (0 or 1)
											halfDayFor: markHalfDayType, // Replace with actual half day for value
											leaveCount: markHalfDay == 1 ? 0.5 : 1,
											status:
												isHalfDay_total_work == null ? "approved" : "pending", // Replace with actual status
											reason: "Late By/ Work Duration", // Replace with actual reason
											message: "Late By/ Work Duration",
											pendingAt: EMP_DATA.managerData.id, // Replace with actual pending at value
											createdBy: singleEmp.id, // Replace with actual creator user ID
											createdAt: moment(), // Replace with actual creation date
											punchInTime:
												singleEmp.attendancemaster.attendancePunchInTime,
											punchOutTime:
												singleEmp.attendancemaster.attendancePunchOutTime,
											weekOffId: singleEmp.weekOffMaster
												? singleEmp.weekOffMaster.weekOffId
												: 0,
										},
										"id_" + moment().format("YYYYMMDDHHmmss") + singleEmp.id,
										isHalfDay_late_by,
										isHalfDay_total_work,
										EMP_DATA,
										singleEmp,
									);
								}
							}
						} else {
							presentStatus = "singlePunchAbsent";
						}
						await db.attendanceMaster.update(
							{
								attendanceShiftEndDate:
									moment(lastDayDate).format("YYYY-MM-DD"),
								attendancePresentStatus: presentStatus,
								needAttendanceCron: 0,
								weekOffId: singleEmp.weekOffMaster
									? singleEmp.weekOffMaster.weekOffId
									: 0,
							},
							{
								where: {
									attendanceAutoId: singleEmp.attendancemaster.attendanceAutoId,
								},
							},
						);
					}
				} else {
					await db.attendanceMaster.create({
						attendanceDate: moment(lastDayDate).format("YYYY-MM-DD"),
						employeeId: singleEmp.id,
						attendancePolicyId: singleEmp.attendancePolicyId,
						attendanceShiftId: singleEmp.shiftId,
						attendancePresentStatus: presentStatus,
						needAttendanceCron: 0,
						// weekOffId: singleEmp.weekOffMaster
						// 	? singleEmp.weekOffMaster.weekOffId
						// 	: 0,
						holidayCompanyLocationConfigurationID: singleEmp.companyLocationId,
					});
				}
			}
		} catch (error) {
			console.log(error);
		}

		// return respHelper(res, {
		//   status: 200,
		//   data: existEmployees,
		// });
	}

	// Attendance Approval Functionality
	async pendingAttendanceList(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const user = req.query.user;

			const attendanceList = await db.attendanceHistory.findAndCountAll({
				where: Object.assign(
					{
						attendanceStatus: "pending",
					},
					user ? { employeeId: user } : {},
				),
				order: [["date", "DESC"]],
				include: [
					{
						model: db.employeeMaster,
						required: true,
						where: Object.assign(
							!["ADMIN", "HR_OPS"].includes(req.userRole)
								? {
										manager: req.userId,
									}
								: {},
							{
								isActive: 1,
							},
						),
						attributes: ["id", "empCode", "name", "profileImage"],
					},
				],
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: attendanceList,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async attendanceApproval(req, res) {
		try {
			const result = await validator.attendanceApprovalSchema.validateAsync(
				req.body,
			);
			let successRecords = [],
				failedRecords = [];

			const attendanceHistoryData = await db.attendanceHistory.findAll({
				where: {
					attendanceHistoryId: {
						[Op.in]: result.attendanceAutoId,
					},
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "firstName"],
					},
					{
						model: db.shiftMaster,
					},
					{
						model: db.attendancePolicymaster,
					},
					{
						model: db.companyLocationMaster,
					},
					{
						model: db.weekOffMaster,
					},
				],
				order: [["attendanceHistoryId", "ASC"]],
			});

			for (const element of attendanceHistoryData) {
				if (result.status) {
					const attendanceData = await db.attendanceMaster.findOne({
						where: {
							attendanceDate:
								element.dataValues.status == "Punch Out" &&
								element.shiftsmaster.isOverNight
									? moment(element.dataValues.date).subtract(1, "days")
									: element.dataValues.date,
							employeeId: element.dataValues.employeeId,
						},
					});

					const dateTime = `${element.dataValues.date} ${element.dataValues.time}`;
					let currentDate = moment(dateTime, "YYYY-MM-DD HH:mm:ss");

					if (element.dataValues.status == "Punch In") {
						let graceTime = moment(
							element.shiftsmaster.shiftStartTime,
							"HH:mm",
						);

						graceTime.add(
							element.attendancePolicymaster.allowBufferTime == 1
								? element.attendancePolicymaster.graceTimeClockIn
								: 0,
							"minutes",
						);
						const withGraceTime = graceTime.format("HH:mm:ss");

						let creationObject = {
							attendanceDate: currentDate.format("YYYY-MM-DD"),
							employeeId: element.dataValues.employeeId,
							attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
							attendanceShiftId: element.shiftId,
							attendancePunchInTime: currentDate.format("HH:mm:ss"),
							attendanceStatus: "Punch In",
							attendanceLateBy: await helper.calculateLateBy(
								currentDate.format("HH:mm:ss"),
								withGraceTime,
							),
							attendancePresentStatus: "present",
							attendancePunchInRemark: element.userRemark,
							attendancePunchInLocationType: element.locationType,
							attendancePunchInLocation: element.location,
							attendancePunchInLatitude: element.lat,
							attendancePunchInLongitude: element.long,
							needAttendanceCron: 1,
							createdBy: element.dataValues.employeeId,
							attendancePolicyId: element.attendancePolicyId,
							createdAt: moment(),
							weekOffId: element.weekOffId,
							punchInSource: element.device,
							holidayCompanyLocationConfigurationID: element.companyLocationId,
						};

						let createdAttendanceData = attendanceData;

						if (!attendanceData) {
							createdAttendanceData =
								await db.attendanceMaster.create(creationObject);
						} else {
							await db.attendanceMaster.update(
								{
									attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
									attendanceShiftId: element.shiftId,
									attendancePunchInTime: currentDate.format("HH:mm:ss"),
									attendanceStatus: "Punch In",
									attendanceLateBy: await helper.calculateLateBy(
										currentDate.format("HH:mm:ss"),
										withGraceTime,
									),
									attendancePresentStatus: "present",
									attendancePunchInRemark: element.userRemark,
									attendancePunchInLocationType: element.locationType,
									attendancePunchInLocation: element.location,
									attendancePunchInLatitude: element.lat,
									attendancePunchInLongitude: element.long,
									needAttendanceCron: 1,
									weekOffId: element.weekOffId,
									punchInSource: element.device,
									holidayCompanyLocationConfigurationID:
										element.companyLocationId,
									attendancePolicyId: element.attendancePolicyId,
								},
								{
									where: {
										attendanceDate: currentDate.format("YYYY-MM-DD"),
										employeeId: element.dataValues.employeeId,
									},
								},
							);
						}
						// console.log("createdAttendanceData", )

						if (
							currentDate.format("YYYY-MM-DD") !== moment().format("YYYY-MM-DD")
						) {
							_this.attedanceCronManual(
								createdAttendanceData.dataValues.attendanceAutoId,
								createdAttendanceData.dataValues.attendanceDate,
							);
						}

						await db.attendanceHistory.update(
							{
								approverRemark: result.remark != "" ? result.remark : null,
								attendanceStatus: "approved",
								updatedBy: req.userId,
								updatedAt: moment(),
							},
							{
								where: {
									attendanceHistoryId: element.dataValues.attendanceHistoryId,
								},
							},
						);

						successRecords.push(
							`Punch In Data Updated for ${element.dataValues.employee.firstName} (${element.dataValues.employee.empCode}) on ${element.dataValues.date}`,
						);
					} else if (element.dataValues.status == "Punch Out") {
						currentDate = element.shiftsmaster.isOverNight
							? currentDate.subtract(1, "days")
							: currentDate;
						if (!attendanceData) {
							failedRecords.push(
								`Punch In Data Not Available for ${element.dataValues.employee.firstName} (${element.dataValues.employee.empCode}) on ${element.dataValues.date}`,
							);
							continue;
						}

						if (
							attendanceData &&
							!attendanceData.dataValues.attendanceShiftEndDate
						) {
							const updateObject = {
								attendancePunchOutTime: currentDate.format("HH:mm:ss"),
								attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
								attendancePunchOutLocationType: element.locationType,
								attendanceStatus: "Punch Out",
								attendancePunchOutRemark: element.userRemark,
								attendanceWorkingTime: await helper.timeDifference(
									`${attendanceData.attandanceShiftStartDate} ${attendanceData.attendancePunchInTime}`,
									`${currentDate.format("YYYY-MM-DD")} ${currentDate.format(
										"HH:mm:ss",
									)}`,
								),
								attendancePunchOutLocation: element.location,
								attendancePunchOutLatitude: element.lat,
								needAttendanceCron: 1,
								attendancePunchOutLongitude: element.long,
								punchOutSource: element.device,
								updatedBy: element.dataValues.employeeId,
							};

							await db.attendanceMaster.update(updateObject, {
								where: {
									attendanceDate: currentDate.format("YYYY-MM-DD"),
									employeeId: element.dataValues.employeeId,
								},
							});

							successRecords.push(
								`Punch Out Data Updated for ${element.dataValues.employee.firstName} (${element.dataValues.employee.empCode}) on ${element.dataValues.date}`,
							);
						} else if (
							attendanceData &&
							currentDate.isAfter(
								moment(
									`${attendanceData.dataValues.attendanceShiftEndDate} ${attendanceData.dataValues.attendancePunchOutTime}`,
									"YYYY-MM-DD HH:mm:ss",
								).format("YYYY-MM-DD HH:mm:ss"),
							)
						) {
							const updateObject = {
								attendancePunchOutTime: currentDate.format("HH:mm:ss"),
								attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
								attendancePunchOutLocationType: element.locationType,
								attendanceStatus: "Punch Out",
								attendancePunchOutRemark: element.userRemark,
								attendanceWorkingTime: await helper.timeDifference(
									`${attendanceData.attandanceShiftStartDate} ${attendanceData.attendancePunchInTime}`,
									`${currentDate.format("YYYY-MM-DD")} ${currentDate.format(
										"HH:mm:ss",
									)}`,
								),
								needAttendanceCron: 1,
								attendancePunchOutLocation: element.location,
								attendancePunchOutLatitude: element.lat,
								attendancePunchOutLongitude: element.long,
								punchOutSource: element.device,
								updatedBy: element.dataValues.employeeId,
							};

							await db.attendanceMaster.update(updateObject, {
								where: {
									attendanceDate: currentDate.format("YYYY-MM-DD"),
									employeeId: element.dataValues.employeeId,
								},
							});

							successRecords.push(
								`Punch Out Data Updated for ${element.dataValues.employee.firstName} (${element.dataValues.employee.empCode}) on ${element.dataValues.date}`,
							);
						}

						await db.attendanceHistory.update(
							{
								approverRemark: result.remark != "" ? result.remark : null,
								attendanceStatus: "approved",
								updatedBy: req.userId,
								updatedAt: moment(),
							},
							{
								where: {
									attendanceHistoryId: element.dataValues.attendanceHistoryId,
								},
							},
						);

						const createdAttendanceData = await db.attendanceMaster.findOne({
							where: {
								attendanceDate: currentDate.format("YYYY-MM-DD"),
								employeeId: element.dataValues.employeeId,
							},
						});

						if (
							currentDate.format("YYYY-MM-DD") != moment().format("YYYY-MM-DD")
						) {
							_this.attedanceCronManual(
								createdAttendanceData.dataValues.attendanceAutoId,
								createdAttendanceData.dataValues.attendanceDate,
							);
						}
					}
				} else {
					await db.attendanceHistory.update(
						{
							updatedAt: moment(),
							updatedBy: req.userId,
							attendanceStatus: "rejected",
							approverRemark: result.remark != "" ? result.remark : null,
						},
						{
							where: {
								attendanceHistoryId: element.dataValues.attendanceHistoryId,
							},
						},
					);

					successRecords.push(
						`Attendance Data Rejected for ${element.dataValues.employee.firstName} (${element.dataValues.employee.empCode}) on ${element.dataValues.date}`,
					);
				}
			}

			successRecords = [...new Set(successRecords)];
			failedRecords = [...new Set(failedRecords)];

			return respHelper(res, {
				status: 200,
				msg: message.ATTENDANCE_APPROVAL.replace(
					"<status>",
					result.status ? "Approved" : "Rejected",
				),
				data: Object.assign(
					successRecords.length > 0
						? {
								successRecords,
							}
						: {},
					failedRecords.length > 0
						? {
								failedRecords,
							}
						: {},
				),
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
	// Attendance Approval Functionality

	//Attednance Roster//
	async attendanceRoster(req, res) {
		try {
			const result = await validator.attendanceRosterSchema.validateAsync(
				req.body,
			);

			for (const element of result) {
				const existUser = await db.employeeMaster.findOne({
					where: {
						id: element.employeeId,
						isActive: 1,
					},
					include: [
						{
							model: db.shiftMaster,
							attributes: ["shiftId"],
						},
						{
							model: db.attendancePolicymaster,
							attributes: [
								"attendancePolicyId",
								"attendaceRosterLimitForPreviousDays",
							],
						},
					],
				});

				if (existUser) {
					const existRoster = await db.AttendanceRoster.findOne({
						where: {
							employeeId: element.employeeId,
							attendanceDate: element.attendanceDate,
						},
					});

					if (!existRoster) {
						const creationObject = Object.assign(element, {
							isActive: 1,
							createdDt: moment(),
							createdAt: req.userId,
						});

						await db.AttendanceRoster.create(creationObject);
					} else {
						await db.AttendanceRoster.update(
							{
								shiftId: element.shiftId,
								weekOffId: element.weekOffId,
							},
							{
								where: {
									rosterAutoId: existRoster.dataValues.rosterAutoId,
								},
							},
						);
					}

					if (moment(element.attendanceDate).isBefore(moment())) {
						await attedanceRosterCron(
							element.employeeId,
							moment(element.attendanceDate).format("YYYY-MM-DD"),
						);
					}
				}
			}

			return respHelper(res, {
				status: 200,
				msg: message.ATTENDANCE_ROSTER_ADDED,
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

	async uploadAttendanceRoster(req, res) {
		try {
			if (!req.file) {
				return respHelper(res, {
					status: 400,
					msg: message.SELECT_FILE,
				});
			}

			const fileExt = [
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.template",
			];
			if (!fileExt.includes(req.file.mimetype)) {
				return respHelper(res, {
					status: 400,
					msg: message.ONLY_EXCEL_ALLOWED,
				});
			}
			if (!req.file.path) {
				return respHelper(res, {
					status: 400,
					msg: message.ATTENDANCE_ROSTER_FILE_REQUIRED,
				});
			}

			const originalPath = req.file.path;
			const newPath = path.join(
				path.dirname(originalPath),
				`${path.basename(originalPath)}_attendanceRoster_${moment().format("YYYY-MM-DD")}.xlsx`,
			);

			fs.renameSync(originalPath, newPath);

			const rosterWorkbook = pkg.readFile(newPath);

			const sheetNameEmployee = rosterWorkbook.SheetNames[0];
			const rosterData = pkg.utils.sheet_to_json(
				rosterWorkbook.Sheets[sheetNameEmployee],
			);

			const result =
				await validator.rosterUploadSchema.validateAsync(rosterData);

			let failedRecords = [],
				successRecords = [];
			for (const element of result) {
				const existUser = await db.employeeMaster.findOne({
					where: {
						[Op.or]: [
							{
								empCode: element.Email_Or_TMC,
							},
							{
								email: element.Email_Or_TMC,
							},
						],
						isActive: 1,
					},
					attributes: ["id"],
				});

				if (!existUser) {
					failedRecords.push(`${element.Email_Or_TMC} User Not Found`);
					continue;
				}

				const shift = await db.shiftMaster.findOne({
					where: {
						shiftName: element.Shift_Name,
					},
					attributes: ["shiftId"],
				});

				if (!shift) {
					failedRecords.push(`${element.Shift_Name} Shift Not Found`);
					continue;
				}

				const weekOff = await db.weekOffMaster.findOne({
					where: {
						weekOffName: element.Weekly_Off_Name,
					},
					attributes: ["weekOffId"],
				});

				if (!weekOff) {
					failedRecords.push(`${element.Weekly_Off_Name} Week Off Not Found`);
					continue;
				}

				const toDate = helper.convertExcelDate(element.To_Date);
				const fromDate = helper.convertExcelDate(element.From_Date);
				const differenceInDays = moment(toDate).diff(moment(fromDate), "day");

				for (let i = 0; i <= differenceInDays; i++) {
					const existRoster = await db.AttendanceRoster.findOne({
						where: {
							employeeId: existUser.id,
							attendanceDate: moment(fromDate)
								.add(i, "days")
								.format("YYYY-MM-DD"),
						},
					});

					if (!existRoster) {
						await db.AttendanceRoster.create({
							employeeId: existUser.id,
							attendanceDate: moment(fromDate)
								.add(i, "days")
								.format("YYYY-MM-DD"),
							shiftId: shift.dataValues.shiftId,
							weekOffId: weekOff.dataValues.weekOffId,
							isActive: 1,
							createdDt: moment(),
							createdAt: req.userId,
						});
					} else {
						await db.AttendanceRoster.update(
							{
								shiftId: shift.dataValues.shiftId,
								weekOffId: weekOff.dataValues.weekOffId,
							},
							{
								where: {
									rosterAutoId: existRoster.dataValues.rosterAutoId,
								},
							},
						);
					}

					if (moment(fromDate).add(i, "days").isBefore(moment())) {
						await attedanceRosterCron(
							existUser.id,
							moment(fromDate).add(i, "days").format("YYYY-MM-DD"),
						);
					}
				}
				successRecords.push(`${element.Email_Or_TMC} added successfully.`);
			}

			return respHelper(res, {
				status: 200,
				msg: message.ATTENDANCE_ROSTER_ADDED,
				data: {
					failedRecords,
					successRecords,
				},
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
	//Attedance Roster//

	//BULK ACTION
	async regularizeRequestListBulk(req, res) {
		try {
			const limit = req.query.limit * 1 || 100;
			const search = req.query.search || null;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const query = req.query.listFor;
			const usersData = req.userData;
			const permissoinArray = await helper.fetchpermissoinAndAcessForEMP(
				usersData.permissionAndAccess,
				usersData.role_id,
			);

			const regularizeList = await db.regularizationMaster.findAndCountAll({
				where: Object.assign(
					query === "raisedByMe"
						? {
								createdBy: { [Op.not]: req.userId },

								//createdBy: req.userId,
								regularizeStatus: "Pending",
							}
						: {
								createdBy: { [Op.not]: req.userId },
								//regularizeManagerId: req.userId,
								regularizeStatus: "Pending",
							},
				),
				attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
				include: [
					{
						model: db.attendanceMaster,
						required: true,
						attributes: {
							exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
						},
						include: [
							{
								model: db.employeeMaster,
								attributes: ["empCode", "name"],
								required: true,
								where: {
									...(search && {
										[Op.or]: [
											{ name: { [Op.like]: `%${search}%` } }, // Search in 'name'
											{ empCode: { [Op.like]: `%${search}%` } }, // Search in 'tmc'
										],
									}),
									...(usersData.role_id === 4 || usersData.role_id === 5
										? {
												...(permissoinArray.COMPANY.length > 0 && {
													companyId: { [Op.in]: permissoinArray.COMPANY },
												}),
												...(permissoinArray.BU.length > 0 && {
													buId: { [Op.in]: permissoinArray.BU },
												}),
												...(permissoinArray.SBU.length > 0 && {
													sbuId: { [Op.in]: permissoinArray.SBU },
												}),
											}
										: null),
								},
							},
						],
					},
				],
				order: [["regularizeId", "desc"]],
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: regularizeList,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async approveRegularizationRequestBulk(req, res) {
		try {
			const result =
				await validator.approveRegularizationRequestSchema.validateAsync(
					req.body,
				);
			let actionTaker = await db.employeeMaster.findOne({
				where: {
					id: req.userId,
				},
				attributes: ["name"],
			});
			let regularizeids = result.regularizeId.split(",");
			for (const regularizeid of regularizeids) {
				const regularizeData = await db.regularizationMaster.findOne({
					raw: true,
					where: {
						regularizeId: regularizeid,
						//regularizeManagerId: req.userId,
					},
					include: [
						{
							model: db.attendanceMaster,
							attributes: ["attendanceAutoId", "employeeId"],
							include: [
								{
									model: db.employeeMaster,
									attributes: ["attendancePolicyId", "name", "email"],
									include: [
										{
											model: db.companyMaster,
											attributes: ["senderEmail", "companyLogo"],
										},
										{
											model: db.employeeMaster,
											as: "managerData",
											attributes: ["name"],
										},
										{
											model: db.shiftMaster,
											required: false,
											attributes: [
												"shiftId",
												"shiftName",
												"shiftStartTime",
												"shiftEndTime",
												"isOverNight",
											],
											where: {
												isActive: true,
											},
										},
										{
											model: db.attendancePolicymaster,
											attributes: ["graceTimeClockIn"],
											where: {
												isActive: true,
											},
										},
									],
								},
							],
						},
					],
				});
				if (!regularizeData) {
					return respHelper(res, {
						status: 400,
						msg: message.LEAVE.NO_UPDATE,
					});
				}

				let graceTime = moment(
					regularizeData[
						"attendancemaster.employee.shiftsmaster.shiftStartTime"
					],
					"HH:mm",
				); // set shift start time

				graceTime.add(
					regularizeData[
						"attendancemaster.employee.attendancePolicymaster.graceTimeClockIn"
					],
					"minutes",
				); // Add buffer time  to the selected time if buffer allow

				const withGraceTime = graceTime.format("HH:mm");
				await db.regularizationMaster.update(
					{
						regularizeManagerRemark: result.remark != "" ? result.remark : null,
						regularizeStatus: result.status ? "Approved" : "Rejected",
						updatedBy: req.userId,
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					},
					{
						where: {
							regularizeId: regularizeid,
						},
					},
				);

				if (result.status) {
					await db.attendanceMaster.update(
						{
							attendanceDate: regularizeData.regularizePunchInDate,
							attendanceWorkingTime: await helper.timeDifference(
								`${regularizeData.regularizePunchInDate} ${regularizeData.regularizePunchInTime}`,
								`${regularizeData.regularizePunchOutDate} ${regularizeData.regularizePunchOutTime}`,
							),
							attendancePresentStatus: "present",
							//attandanceShiftStartDate: regularizeData.regularizePunchInDate,
							// attendanceShiftEndDate: regularizeData.regularizePunchOutDate,
							attendancePunchInTime: regularizeData.regularizePunchInTime,
							attendancePunchOutTime: regularizeData.regularizePunchOutTime,
							attendanceRegularizeUserRemark:
								regularizeData.regularizeUserRemark,
							attendanceRegularizeManagerRemark:
								regularizeData.regularizeManagerRemark,
							attendanceRegularizeReason: regularizeData.regularizeReason,
							attendanceRegularizeStatus: "Approved",
							attendanceLateBy: await helper.calculateLateBy(
								regularizeData.regularizePunchInTime,
								withGraceTime,
								regularizeData.regularizePunchInDate,
								regularizeData.regularizePunchOutDate,
							),
							createdBy: req.userId,
							//createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							updatedBy: req.userId,
							updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							where: {
								attendanceAutoId: regularizeData.attendanceAutoId,
							},
						},
					);
					await _this.attedanceCronManual(
						regularizeData.attendanceAutoId,
						regularizeData.regularizePunchInDate,
					);
				} else {
					await db.attendanceMaster.update(
						{
							attendanceRegularizeStatus: "Rejected",
						},
						{
							where: {
								attendanceAutoId: regularizeData.attendanceAutoId,
							},
						},
					);

					await _this.attedanceCronManual(
						regularizeData.attendanceAutoId,
						regularizeData.regularizePunchInDate,
					);

					const attendanceData = await db.attendanceMaster.findOne({
						where: {
							attendanceAutoId: regularizeData.attendanceAutoId,
						},
					});

					const autoGeneratedLeave = await db.EmployeeLeaveHeader.findOne({
						where: {
							employeeId: attendanceData.dataValues.employeeId,
							toDate: attendanceData.dataValues.attendanceDate,
							fromDate: attendanceData.dataValues.attendanceDate,
							source: "system_generated",
						},
					});

					if (autoGeneratedLeave) {
						await db.EmployeeLeaveHeader.update(
							{
								status: "approved",
							},
							{
								where: {
									employeeleaveheaderID:
										autoGeneratedLeave.dataValues.employeeleaveheaderID,
								},
							},
						);

						await db.employeeLeaveTransactions.update(
							{
								status: "approved",
							},
							{
								where: {
									employeeleaveheaderID:
										autoGeneratedLeave.dataValues.employeeleaveheaderID,
								},
							},
						);
					}
				}

				const obj = {
					email: regularizeData["attendancemaster.employee.email"],
					status: result.status ? "Approved" : "Rejected",
					fromDate: regularizeData.regularizePunchInDate,
					toDate: regularizeData.regularizePunchOutDate,
					managerName: actionTaker ? actionTaker.name : "",
					requesterName: regularizeData["attendancemaster.employee.name"],
					senderEmail:
						regularizeData[
							"attendancemaster.employee.companymaster.senderEmail"
						],
					companyLogo:
						regularizeData[
							"attendancemaster.employee.companymaster.companyLogo"
						],
				};
				eventEmitter.emit("regularizeAckMail", JSON.stringify(obj));

				 pushNotificationEmitter.emit("sendNotification", {
                    title: message.ATTENDANCE_REQ_ACK,
                    body: message.ATTENDANCE_REQ_STATUS.replace(
                        "<status>",
                        result.status ? "approved" : "rejected"),
                    employeeId: regularizeData["attendancemaster.employee.id"],
                });
			}

			return respHelper(res, {
				status: 200,
				msg: message.REGULARIZATION_ACTION.replace(
					"<status>",
					result.status ? "Approved." : "Rejected.",
				),
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
	//BULK ACTION

	async markBioMetricAttendance(incomingAttendanceData) {
		const currentDate = moment(incomingAttendanceData.punchDateTime);
		const user = incomingAttendanceData.tmc;
		const attendanceDevice = `${incomingAttendanceData.deviceName} (${incomingAttendanceData.deviceCode})`;

		let attedanceCronObject = {
			status: true,
		};

		const existEmployee = await db.employeeMaster.findOne({
			where: {
				empCode: incomingAttendanceData.tmc,
				isActive: 1,
			},
			include: [
				{
					model: db.AttendanceRoster,
					required: false,
					where: {
						attendanceDate: currentDate.format("YYYY-MM-DD"),
						isActive: true,
					},
					attributes: ["shiftId", "weekOffId"],
					include: [
						{
							model: db.shiftMaster,
							attributes: [
								"shiftId",
								"shiftName",
								"shiftStartTime",
								"shiftEndTime",
								"isOverNight",
							],
						},
					],
				},
				{
					model: db.shiftMaster,
					required: false,
					attributes: [
						"shiftId",
						"shiftName",
						"shiftStartTime",
						"shiftEndTime",
						"isOverNight",
					],
					where: {
						isActive: true,
					},
				},
				{
					model: db.attendancePolicymaster,
					required: false,
					where: {
						isActive: true,
					},
				},
			],
		});

		if (!existEmployee) {
			logger.error(`Employee not found with empCode ${user}`);
			return {
				status: false,
			};
		}
		if (!existEmployee.shiftsmaster) {
			logger.error(`Shift not found for employee with empCode ${user}`);
			return {
				status: false,
			};
		}

		if (!existEmployee.attendancePolicymaster) {
			logger.error(
				`Attendance policy not found for employee with empCode ${user}`,
			);
			return {
				status: false,
			};
		}

		if (!existEmployee.enableBiometricAttendance) {
			logger.error(
				`Biometric Attendance is not enabled for employee ${existEmployee.dataValues.name} (${existEmployee.dataValues.empCode},${existEmployee.dataValues.id}) on ${currentDate.format("YYYY-MM-DD HH:mm:ss")}`,
			);
			return {
				status: false,
			};
		}

		console.log(
			`Marking Biometric Attendance of --->> ${existEmployee.dataValues.empCode} (${existEmployee.dataValues.id}) on ${currentDate.format("YYYY-MM-DD HH:mm:ss")}`,
		);
		let withGraceTime;

		if (
			(existEmployee.attendanceroster
				? existEmployee.attendanceroster.shiftsmaster.isOverNight
				: existEmployee.shiftsmaster.isOverNight) == 0
		) {
			const checkAttendance = await db.attendanceMaster.findOne({
				raw: true,
				where: {
					employeeId: existEmployee.id,
					attendanceDate: currentDate.format("YYYY-MM-DD"),
				},
			});

			if (!checkAttendance) {
				const shiftStartTime = existEmployee.attendanceroster
					? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
					: existEmployee.shiftsmaster.shiftStartTime;
				const givenShiftTime = moment(
					`${currentDate.format("YYYY-MM-DD")} ${shiftStartTime}`,
					"YYYY-MM-DD HH:mm:ss",
				);
				const acutalShiftTime = moment(
					`${currentDate.format("YYYY-MM-DD")} ${shiftStartTime}`,
					"YYYY-MM-DD HH:mm:ss",
				);
				acutalShiftTime.subtract(
					existEmployee.attendancePolicymaster.allowBufferTime == 1
						? existEmployee.attendancePolicymaster.bufferTimePre
						: 0,
					"minutes",
				); // Add buffer time  to the selected time if buffer allow

				if (
					acutalShiftTime.format("YYYY-MM-DD") <
					givenShiftTime.format("YYYY-MM-DD")
				) {
				} else {
					const assignedShiftStartTime = existEmployee.attendanceroster
						? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
						: existEmployee.shiftsmaster.shiftStartTime;
					let shiftStartTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time
					shiftStartTime.subtract(
						existEmployee.attendancePolicymaster.allowBufferTime == 1
							? existEmployee.attendancePolicymaster.bufferTimePre
							: 0,
						"minutes",
					); // Add buffer time  to the selected time if buffer allow

					const finalShiftStartTime = shiftStartTime.format("HH:mm");
					const finalShiftStartTimeFormat = shiftStartTime.format("hh:mm A");
					if (currentDate.format("HH:mm") < finalShiftStartTime) {
						const assignedShiftEndTime = existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftEndTime
							: existEmployee.shiftsmaster.shiftEndTime;
						let shiftEndTime = moment(assignedShiftEndTime, "HH:mm"); // set shift start time

						shiftEndTime.subtract(
							existEmployee.attendancePolicymaster.allowBufferTime == 1
								? existEmployee.attendancePolicymaster.bufferTimePost
								: 0,
							"minutes",
						); // Add buffer time  to the selected time if buffer allow

						const finalShiftEndTime = shiftEndTime.format("HH:mm");
						const finalShiftEndimeFormat = shiftEndTime.format("hh:mm A");

						logger.error(
							`Your shift time starts for ${user} from ${currentDate.format(
								"DD-MM-YYYY",
							)} at ${finalShiftStartTimeFormat} and end on ${currentDate.format(
								"DD-MM-YYYY",
							)} at ${finalShiftEndimeFormat}`,
						);
						return {
							status: false,
						};
					}
				}

				let graceTime = moment(shiftStartTime, "HH:mm"); // set shift start time

				graceTime.add(
					existEmployee.attendancePolicymaster.allowBufferTime == 1
						? existEmployee.attendancePolicymaster.graceTimeClockIn
						: 0,
					"minutes",
				); // Add buffer time  to the selected time if buffer allow

				withGraceTime = graceTime.format("HH:mm");

				let creationObject = {
					attendanceDate: currentDate.format("YYYY-MM-DD"),
					employeeId: existEmployee.id,
					attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
					attendanceShiftId: existEmployee.attendanceroster
						? existEmployee.attendanceroster.shiftsmaster.shiftId
						: existEmployee.shiftsmaster.shiftId,
					weekOffId: existEmployee.attendanceroster
						? existEmployee.attendanceroster.weekOffId
						: existEmployee.weekOffId,
					attendancePunchInTime: currentDate.format("HH:mm:ss"),
					attendanceStatus: "Punch In",
					attendanceLateBy: await helper.calculateLateBy(
						currentDate.format("HH:mm:ss"),
						withGraceTime,
					),
					attendancePresentStatus: "present",
					createdBy: existEmployee.id,
					attendancePunchInLocation: incomingAttendanceData.deviceName,
					attendancePolicyId: existEmployee.attendancePolicyId,
					createdAt: currentDate,
					punchInSource: attendanceDevice,
					holidayCompanyLocationConfigurationID:
						existEmployee.companyLocationId,
				};

				if (!existEmployee.dataValues.requiredAttendanceApproval) {
					const attendanceId = await db.attendanceMaster.create(creationObject);
					Object.assign(attedanceCronObject, {
						attendanceAutoId: attendanceId.dataValues.attendanceAutoId,
						date: currentDate.format("YYYY-MM-DD"),
					});
				}

				const attendanceHistory = await db.attendanceHistory.findOne({
					where: {
						date: currentDate.format("YYYY-MM-DD"),
						employeeId: existEmployee.id,
					},
				});

				await db.attendanceHistory.create({
					date: currentDate.format("YYYY-MM-DD"),
					time: currentDate.format("HH:mm:ss"),
					status: attendanceHistory ? "Punch Out" : "Punch In",
					employeeId: existEmployee.id,
					location: incomingAttendanceData.deviceName,
					locationType: "Office",
					attendanceStatus: !existEmployee.dataValues.requiredAttendanceApproval
						? "approved"
						: "pending",
					createdBy: existEmployee.id,
					createdAt: currentDate,
					device: attendanceDevice,
					shiftId: existEmployee.attendanceroster
						? existEmployee.attendanceroster.shiftId
						: existEmployee.shiftsmaster.shiftId,
					weekOffId: existEmployee.attendanceroster
						? existEmployee.attendanceroster.weekOffId
						: existEmployee.weekOffId,
					attendancePolicyId: existEmployee.attendancePolicyId,
					companyLocationId: existEmployee.companyLocationId,
				});

				return attedanceCronObject;
			} else {
				if (
					currentDate <
						moment(
							`${checkAttendance.attendanceDate} ${checkAttendance.attendancePunchInTime}`,
						) ||
					checkAttendance.attendancePresentStatus === "absent" ||
					checkAttendance.attendancePresentStatus === "weeklyOff"
				) {
					if (!existEmployee.dataValues.requiredAttendanceApproval) {
						await db.attendanceMaster.update(
							{
								attendancePunchInTime: currentDate.format("HH:mm:ss"),
								attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
								attendanceStatus: "Punch In",
								attendancePresentStatus: "present",
								attendanceLateBy: await helper.calculateLateBy(
									currentDate.format("HH:mm:ss"),
									withGraceTime,
								),
								attendancePunchInLocation: incomingAttendanceData.deviceName,
								punchInSource: attendanceDevice,
								updatedBy: existEmployee.id,
							},
							{
								where: {
									attendanceDate: currentDate.format("YYYY-MM-DD"),
									employeeId: existEmployee.id,
								},
							},
						);
					}
				} else {
					if (!existEmployee.dataValues.requiredAttendanceApproval) {
						await db.attendanceMaster.update(
							{
								attendancePunchOutTime: currentDate.format("HH:mm:ss"),
								attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
								attendancePunchOutLocationType: "Office",
								attendanceStatus: "Punch Out",
								attendanceWorkingTime: await helper.timeDifference(
									`${checkAttendance.attandanceShiftStartDate} ${checkAttendance.attendancePunchInTime}`,
									`${currentDate.format("YYYY-MM-DD")} ${currentDate.format("HH:mm:ss")}`,
								),
								attendancePunchOutLocation: incomingAttendanceData.deviceName,
								punchOutSource: attendanceDevice,
								updatedBy: existEmployee.id,
							},
							{
								where: {
									attendanceDate: currentDate.format("YYYY-MM-DD"),
									employeeId: existEmployee.id,
								},
							},
						);
					}

					const attendanceHistory = await db.attendanceHistory.findOne({
						where: {
							date: currentDate.format("YYYY-MM-DD"),
							employeeId: existEmployee.id,
						},
					});

					await db.attendanceHistory.create({
						date: currentDate.format("YYYY-MM-DD"),
						time: currentDate.format("HH:mm:ss"),
						status: attendanceHistory ? "Punch Out" : "Punch In",
						employeeId: existEmployee.id,
						location: incomingAttendanceData.deviceName,
						locationType: "Office",
						attendanceStatus: !existEmployee.dataValues
							.requiredAttendanceApproval
							? "approved"
							: "pending",
						createdBy: existEmployee.id,
						createdAt: currentDate,
						device: attendanceDevice,
						shiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePolicyId: existEmployee.attendancePolicyId,
						companyLocationId: existEmployee.companyLocationId,
					});
				}

				return Object.assign(attedanceCronObject, {
					attendanceAutoId: checkAttendance.attendanceAutoId,
					date: checkAttendance.attendanceDate,
				});
			}
		} else {
			// Over night code
			const assignedShiftStartTime = existEmployee.attendanceroster
				? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
				: existEmployee.shiftsmaster.shiftStartTime;
			let ShiftStartTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time

			ShiftStartTime.subtract(
				existEmployee.attendancePolicymaster.allowBufferTime == 1
					? existEmployee.attendancePolicymaster.bufferTimePre
					: 0,
				"minutes",
			); // Add buffer time  to the selected time if buffer allow

			const finalShiftStartTime = ShiftStartTime.format("HH:mm");

			const assignedShiftEndTime = existEmployee.attendanceroster
				? existEmployee.attendanceroster.shiftsmaster.shiftEndTime
				: existEmployee.shiftsmaster.shiftEndTime;
			let shiftEndtime = moment(assignedShiftEndTime, "HH:mm"); // set shift start time

			shiftEndtime.add(
				existEmployee.attendancePolicymaster.allowBufferTime == 1
					? existEmployee.attendancePolicymaster.bufferTimePost
					: 0,
				"minutes",
			); // subtract grace time  to the selected time if buffer allow

			const finalShiftEndTime = shiftEndtime.format("HH:mm");
			const tommorow = currentDate.clone().add(1, "days");

			const combinedDateTimeCurrentDay = moment(
				`${currentDate.format("YYYY-MM-DD")} ${finalShiftStartTime}`,
				"YYYY-MM-DD HH:mm:ss",
			);
			const combinedDateTimeNextDay = moment(
				`${tommorow.format("YYYY-MM-DD")} ${finalShiftEndTime}`,
				"YYYY-MM-DD HH:mm:ss",
			);

			if (
				currentDate > combinedDateTimeCurrentDay &&
				currentDate < combinedDateTimeNextDay
			) {
				const checkAttendance = await db.attendanceMaster.findOne({
					raw: true,
					where: {
						employeeId: existEmployee.id,
						attendanceDate: currentDate.format("YYYY-MM-DD"),
					},
				});

				if (checkAttendance) {
					if (
						checkAttendance.attendancePresentStatus === "absent" ||
						currentDate <
							moment(
								`${checkAttendance.attendanceDate} ${checkAttendance.attendancePunchInTime}`,
							) ||
						checkAttendance.attendancePresentStatus === "weeklyOff"
					) {
						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.update(
								{
									attendancePunchInTime: currentDate.format("HH:mm:ss"),
									attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
									attendanceStatus: "Punch In",
									attendancePresentStatus: "present",
									attendanceLateBy: await helper.calculateLateBy(
										currentDate.format("HH:mm:ss"),
										withGraceTime,
									),
									attendancePunchInLocation: incomingAttendanceData.deviceName,
									punchInSource: attendanceDevice,
									updatedBy: existEmployee.id,
								},
								{
									where: {
										attendanceDate: currentDate.format("YYYY-MM-DD"),
										employeeId: existEmployee.id,
									},
								},
							);
						}
					} else {
						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.update(
								{
									attendancePunchOutTime: currentDate.format("HH:mm:ss"),
									attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
									attendancePunchOutLocationType: "Office",
									attendanceStatus: "Punch Out",
									attendanceWorkingTime: await helper.timeDifference(
										`${checkAttendance.attandanceShiftStartDate} ${checkAttendance.attendancePunchInTime}`,
										`${currentDate.format("YYYY-MM-DD")} ${currentDate.format("HH:mm:ss")}`,
									),
									attendancePunchOutLocation: incomingAttendanceData.deviceName,
									punchOutSource: attendanceDevice,
									updatedBy: existEmployee.id,
								},
								{
									where: {
										attendanceDate: currentDate.format("YYYY-MM-DD"),
										employeeId: existEmployee.id,
									},
								},
							);
						}

						const attendanceHistory = await db.attendanceHistory.findOne({
							where: {
								date: currentDate.format("YYYY-MM-DD"),
								employeeId: existEmployee.id,
							},
						});

						await db.attendanceHistory.create({
							date: currentDate.format("YYYY-MM-DD"),
							time: currentDate.format("HH:mm:ss"),
							status: attendanceHistory ? "Punch Out" : "Punch In",
							employeeId: existEmployee.id,
							location: incomingAttendanceData.deviceName,
							locationType: "Office",
							attendanceStatus: !existEmployee.dataValues
								.requiredAttendanceApproval
								? "approved"
								: "pending",
							createdBy: existEmployee.id,
							createdAt: currentDate,
							device: attendanceDevice,
							shiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePolicyId: existEmployee.attendancePolicyId,
							companyLocationId: existEmployee.companyLocationId,
						});
					}

					// if (!existEmployee.dataValues.requiredAttendanceApproval) {
					// 	await db.attendanceMaster.update(
					// 		{
					// 			attendancePunchOutTime: currentDate.format("HH:mm:ss"),
					// 			attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
					// 			attendancePunchOutLocationType: "Office",
					// 			attendanceStatus: "Punch Out",
					// 			attendanceWorkingTime: await helper.timeDifference(
					// 				`${checkAttendance.attandanceShiftStartDate} ${checkAttendance.attendancePunchInTime}`,
					// 				`${currentDate.format("YYYY-MM-DD")} ${currentDate.format(
					// 					"HH:mm:ss",
					// 				)}`,
					// 			),
					// 			attendancePunchOutLocation: incomingAttendanceData.deviceName,
					// 			punchOutSource: attendanceDevice,
					// 			updatedBy: existEmployee.id,
					// 		},
					// 		{
					// 			where: {
					// 				attendanceDate: currentDate.format("YYYY-MM-DD"),
					// 				employeeId: existEmployee.id,
					// 			},
					// 		},
					// 	);
					// }

					// const attendanceHistory = await db.attendanceHistory.findOne({
					// 	where: {
					// 		date: currentDate.format("YYYY-MM-DD"),
					// 		employeeId: existEmployee.id,
					// 	},
					// });

					// await db.attendanceHistory.create({
					// 	date: currentDate.format("YYYY-MM-DD"),
					// 	time: currentDate.format("HH:mm:ss"),
					// 	status: attendanceHistory ? "Punch Out" : "Punch In",
					// 	employeeId: existEmployee.id,
					// 	location: incomingAttendanceData.deviceName,
					// 	createdBy: existEmployee.id,
					// 	createdAt: currentDate,
					// 	locationType: "Office",
					// 	attendanceStatus: !existEmployee.dataValues
					// 		.requiredAttendanceApproval
					// 		? "approved"
					// 		: "pending",
					// 	device: attendanceDevice,
					// 	shiftId: existEmployee.attendanceroster
					// 		? existEmployee.attendanceroster.shiftId
					// 		: existEmployee.shiftsmaster.shiftId,
					// 	weekOffId: existEmployee.attendanceroster
					// 		? existEmployee.attendanceroster.weekOffId
					// 		: existEmployee.weekOffId,
					// 	attendancePolicyId: existEmployee.attendancePolicyId,
					// 	companyLocationId: existEmployee.companyLocationId,
					// });

					return Object.assign(attedanceCronObject, {
						attendanceAutoId: checkAttendance.attendanceAutoId,
						date: checkAttendance.attendanceDate,
					});
				} else {
					const assignedShiftStartTime = existEmployee.attendanceroster
						? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
						: existEmployee.shiftsmaster.shiftStartTime;
					let graceTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time

					graceTime.add(
						existEmployee.attendancePolicymaster.allowBufferTime == 1
							? existEmployee.attendancePolicymaster.graceTimeClockIn
							: 0,
						"minutes",
					); // Add buffer time  to the selected time if buffer allow

					const withGraceTime = graceTime.format("HH:mm");
					let creationObject = {
						attendanceDate: currentDate.format("YYYY-MM-DD"),
						employeeId: existEmployee.id,
						attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
						attendanceShiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePunchInTime: currentDate.format("HH:mm:ss"),
						attendanceStatus: "Punch In",
						attendanceLateBy: await helper.calculateLateBy(
							currentDate.format("HH:mm:ss"),
							withGraceTime,
						),
						attendancePresentStatus: "present",
						attendancePunchInLocationType: "Office",
						attendancePunchInLocation: incomingAttendanceData.deviceName,
						createdBy: existEmployee.id,
						attendancePolicyId: existEmployee.attendancePolicyId,
						createdAt: currentDate,
						punchInSource: attendanceDevice,
						holidayCompanyLocationConfigurationID:
							existEmployee.companyLocationId,
					};

					if (!existEmployee.dataValues.requiredAttendanceApproval) {
						const attendanceData =
							await db.attendanceMaster.create(creationObject);
						Object.assign(attedanceCronObject, {
							attendanceAutoId: attendanceData.dataValues.attendanceAutoId,
							date: currentDate.format("YYYY-MM-DD"),
						});
					}

					const attendanceHistory = await db.attendanceHistory.findOne({
						where: {
							date: currentDate.format("YYYY-MM-DD"),
							employeeId: existEmployee.id,
						},
					});

					await db.attendanceHistory.create({
						date: currentDate.format("YYYY-MM-DD"),
						time: currentDate.format("HH:mm:ss"),
						status: attendanceHistory ? "Punch Out" : "Punch In",
						employeeId: existEmployee.id,
						location: incomingAttendanceData.deviceName,
						locationType: "Office",
						attendanceStatus: !existEmployee.dataValues
							.requiredAttendanceApproval
							? "approved"
							: "pending",
						createdBy: existEmployee.id,
						createdAt: currentDate,
						device: attendanceDevice,
						shiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePolicyId: existEmployee.attendancePolicyId,
						companyLocationId: existEmployee.companyLocationId,
					});

					return attedanceCronObject;
				}
			} else {
				const combinedDateTimeCurrentDay = moment(
					`${currentDate.format("YYYY-MM-DD")} ${finalShiftStartTime}`,
					"YYYY-MM-DD HH:mm:ss",
				);

				const yerterdayDate = combinedDateTimeCurrentDay
					.clone()
					.subtract(1, "days");

				const combinedDateTimeCurrentDayClone = combinedDateTimeCurrentDay
					.clone()
					.subtract(1, "days");
				const combinedDateTimeNextDayClone = combinedDateTimeNextDay
					.clone()
					.subtract(1, "days");

				if (
					currentDate > combinedDateTimeCurrentDayClone &&
					currentDate < combinedDateTimeNextDayClone
				) {
				} else {
					return {
						status: false,
					};
				}

				const lastDayAttendace = await db.attendanceMaster.findOne({
					raw: true,
					where: {
						employeeId: existEmployee.id,
						attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
					},
				});
				if (lastDayAttendace) {
					if (
						lastDayAttendace.attendancePresentStatus === "absent" ||
						currentDate <
							moment(
								`${lastDayAttendace.attendanceDate} ${lastDayAttendace.attendancePunchInTime}`,
							) ||
						lastDayAttendace.attendancePresentStatus === "weeklyOff"
					) {
						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.update(
								{
									attendancePunchInTime: currentDate.format("HH:mm:ss"),
									attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
									attendanceStatus: "Punch In",
									attendancePresentStatus: "present",
									attendanceLateBy: await helper.calculateLateBy(
										currentDate.format("HH:mm:ss"),
										withGraceTime,
									),
									attendancePunchInLocation: incomingAttendanceData.deviceName,
									punchInSource: attendanceDevice,
									updatedBy: existEmployee.id,
								},
								{
									where: {
										attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
										employeeId: existEmployee.id,
									},
								},
							);
						}
					} else {
						if (!existEmployee.dataValues.requiredAttendanceApproval) {
							await db.attendanceMaster.update(
								{
									attendancePunchOutTime: currentDate.format("HH:mm:ss"),
									attendanceShiftEndDate: currentDate.format("YYYY-MM-DD"),
									attendancePunchOutLocationType: "Office",
									attendanceStatus: "Punch Out",
									attendanceWorkingTime: await helper.timeDifference(
										`${lastDayAttendace.attandanceShiftStartDate} ${lastDayAttendace.attendancePunchInTime}`,
										`${currentDate.format("YYYY-MM-DD")} ${currentDate.format("HH:mm:ss")}`,
									),
									attendancePunchOutLocation: incomingAttendanceData.deviceName,
									punchOutSource: attendanceDevice,
									updatedBy: existEmployee.id,
								},
								{
									where: {
										attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
										employeeId: existEmployee.id,
									},
								},
							);
						}

						const attendanceHistory = await db.attendanceHistory.findOne({
							where: {
								date: yerterdayDate.format("YYYY-MM-DD"),
								employeeId: existEmployee.id,
							},
						});

						await db.attendanceHistory.create({
							date: currentDate.format("YYYY-MM-DD"),
							time: currentDate.format("HH:mm:ss"),
							status: attendanceHistory ? "Punch Out" : "Punch In",
							employeeId: existEmployee.id,
							location: incomingAttendanceData.deviceName,
							locationType: "Office",
							attendanceStatus: !existEmployee.dataValues
								.requiredAttendanceApproval
								? "approved"
								: "pending",
							createdBy: existEmployee.id,
							createdAt: currentDate,
							device: attendanceDevice,
							shiftId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.shiftId
								: existEmployee.shiftsmaster.shiftId,
							weekOffId: existEmployee.attendanceroster
								? existEmployee.attendanceroster.weekOffId
								: existEmployee.weekOffId,
							attendancePolicyId: existEmployee.attendancePolicyId,
							companyLocationId: existEmployee.companyLocationId,
						});
					}

					return Object.assign(attedanceCronObject, {
						attendanceAutoId: lastDayAttendace.attendanceAutoId,
						date: lastDayAttendace.attendanceDate,
					});
				} else {
					const assignedShiftStartTime = existEmployee.attendanceroster
						? existEmployee.attendanceroster.shiftsmaster.shiftStartTime
						: existEmployee.shiftsmaster.shiftStartTime;
					let graceTime = moment(assignedShiftStartTime, "HH:mm"); // set shift start time

					graceTime.add(
						existEmployee.attendancePolicymaster.allowBufferTime == 1
							? existEmployee.attendancePolicymaster.graceTimeClockIn
							: 0,
						"minutes",
					); // Add buffer time  to the selected time if buffer allow
					const withGraceTime = graceTime.format("HH:mm:ss");
					let creationObject = {
						attendanceDate: yerterdayDate.format("YYYY-MM-DD"),
						employeeId: existEmployee.id,
						attandanceShiftStartDate: currentDate.format("YYYY-MM-DD"),
						attendanceShiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftsmaster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePunchInTime: currentDate.format("HH:mm:ss"),
						attendanceStatus: "Punch In",
						attendanceLateBy: await helper.calculateLateBy(
							currentDate.format("HH:mm:ss"),
							withGraceTime,
							yerterdayDate.format("YYYY-MM-DD"),
							currentDate.format("YYYY-MM-DD"),
						),
						attendancePresentStatus: "present",
						attendancePunchInLocationType: "Office",
						attendancePunchInLocation: incomingAttendanceData.deviceName,
						createdBy: existEmployee.id,
						attendancePolicyId: existEmployee.attendancePolicyId,
						createdAt: currentDate,
						holidayCompanyLocationConfigurationID:
							existEmployee.companyLocationId,
						punchInSource: attendanceDevice,
					};

					const attendanceHistory = await db.attendanceHistory.findOne({
						where: {
							date: yerterdayDate.format("YYYY-MM-DD"),
							employeeId: existEmployee.id,
						},
					});

					await db.attendanceHistory.create({
						date: yerterdayDate.format("YYYY-MM-DD"),
						time: yerterdayDate.format("HH:mm:ss"),
						status: attendanceHistory ? "Punch Out" : "Punch In",
						employeeId: existEmployee.id,
						location: incomingAttendanceData.deviceName,
						createdBy: existEmployee.id,
						createdAt: currentDate,
						locationType: "Office",
						attendanceStatus: !existEmployee.dataValues
							.requiredAttendanceApproval
							? "approved"
							: "pending",
						device: attendanceDevice,
						shiftId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.shiftId
							: existEmployee.shiftsmaster.shiftId,
						weekOffId: existEmployee.attendanceroster
							? existEmployee.attendanceroster.weekOffId
							: existEmployee.weekOffId,
						attendancePolicyId: existEmployee.attendancePolicyId,
						companyLocationId: existEmployee.companyLocationId,
					});

					if (!existEmployee.dataValues.requiredAttendanceApproval) {
						const createdAttednace =
							await db.attendanceMaster.create(creationObject);

						Object.assign(attedanceCronObject, {
							attendanceAutoId: createdAttednace.dataValues.attendanceAutoId,
							date: yerterdayDate.format("YYYY-MM-DD"),
						});
					}
					return attedanceCronObject;
				}
			}
		}
	}
}

const Calender = (month, year) => {
	let dateArray = [];

	const startDateLeaves = moment(`${year}-${month}-01`);
	const endDateLeaves = moment()
		.year(year)
		.month(month - 1)
		.endOf("month")
		.format("YYYY-MM-DD");

	for (
		let currentDate = startDateLeaves.clone();
		currentDate.isSameOrBefore(endDateLeaves);
		currentDate.add(1, "days")
	) {
		dateArray.push({
			date: currentDate.format("DD"),
			year: currentDate.format("YYYY"),
			month: currentDate.format("MM"),
			fullDate: currentDate.format("YYYY-MM-DD"),
		});
	}

	return dateArray;
};

const attedanceRosterCron = async (user, date) => {
	const attendanceData = await db.attendanceMaster.findOne({
		where: {
			employeeId: user,
			attendanceDate: date,
		},
		attributes: ["attendanceAutoId"],
		include: [
			{
				model: db.employeeMaster,
				attributes: ["id", "name", "email"],
				include: [
					{
						model: db.AttendanceRoster,
						where: {
							attendanceDate: date,
						},
						include: [
							{
								model: db.shiftMaster,
								attributes: [
									"shiftId",
									"shiftName",
									"shiftStartTime",
									"shiftEndTime",
									"isOverNight",
								],
							},
						],
					},
					{
						model: db.attendancePolicymaster,
						where: {
							isActive: true,
						},
					},
				],
			},
		],
	});

	if (attendanceData) {
		let shiftStartTimePreBuffer = moment(
			`${date} ${attendanceData.dataValues.employee.attendanceroster.shiftsmaster.dataValues.shiftStartTime}`,
		);
		let shiftStartTimeGraceTimeClockIn = moment(
			`${date} ${attendanceData.dataValues.employee.attendanceroster.shiftsmaster.dataValues.shiftStartTime}`,
		);

		shiftStartTimePreBuffer.subtract(
			attendanceData.dataValues.employee.attendancePolicymaster
				.allowBufferTime === 1
				? attendanceData.dataValues.employee.attendancePolicymaster
						.bufferTimePre
				: 0,
			"minutes",
		);

		shiftStartTimeGraceTimeClockIn.add(
			attendanceData.dataValues.employee.attendancePolicymaster
				.allowBufferTime === 1
				? attendanceData.dataValues.employee.attendancePolicymaster
						.graceTimeClockIn
				: 0,
			"minutes",
		);

		const punchInAttendanceHistory = await db.attendanceHistory.findOne({
			where: {
				employeeId: user,
				[Op.and]: [
					db.Sequelize.where(
						db.Sequelize.fn(
							"concat",
							db.Sequelize.col("date"),
							" ",
							db.Sequelize.col("time"),
						),
						{
							[Op.between]: [
								new Date(shiftStartTimePreBuffer),
								new Date(shiftStartTimeGraceTimeClockIn),
							],
						},
					),
				],
			},
			order: [["attendanceHistoryId", "asc"]],
			limit: 1,
		});

		let punchInObject = punchInAttendanceHistory
			? {
					attandanceShiftStartDate: punchInAttendanceHistory.dataValues.date,
					attendanceShiftId:
						attendanceData.dataValues.employee.attendanceroster.shiftId,
					weekOffId:
						attendanceData.dataValues.employee.attendanceroster.weekOffId,
					attendancePunchInTime: punchInAttendanceHistory.dataValues.time,
					attendanceStatus: "Punch In",
					attendanceLateBy: await helper.calculateLateBy(
						punchInAttendanceHistory.dataValues.time,
						shiftStartTimeGraceTimeClockIn.format("HH:mm:ss"),
					),
					attendancePresentStatus: "present",
					attendancePunchInRemark:
						punchInAttendanceHistory.dataValues.userRemark,
					attendancePunchInLocationType:
						punchInAttendanceHistory.dataValues.locationType,
					attendancePunchInLocation:
						punchInAttendanceHistory.dataValues.location,
					attendancePunchInLatitude: punchInAttendanceHistory.dataValues.lat,
					attendancePunchInLongitude: punchInAttendanceHistory.dataValues.long,
					punchInSource: punchInAttendanceHistory.dataValues.device,
				}
			: {
					attendanceShiftId:
						attendanceData.dataValues.employee.attendanceroster.shiftId,
					weekOffId:
						attendanceData.dataValues.employee.attendanceroster.weekOffId,
				};

		await db.attendanceMaster.update(punchInObject, {
			where: {
				attendanceAutoId: attendanceData.dataValues.attendanceAutoId,
			},
		});

		// ---------------------------------------------- Punch Out ---------------------------------------------- //
		const shiftDate =
			attendanceData.dataValues.employee.attendanceroster.shiftsmaster
				.dataValues.isOverNight === 1
				? moment(date).add(1, "days").format("YYYY-MM-DD")
				: date;

		let shiftEndTimePostBuffer = moment(
			`${shiftDate} ${attendanceData.dataValues.employee.attendanceroster.shiftsmaster.dataValues.shiftEndTime}`,
		);
		let shiftEndTimeGraceTimeClockOut = moment(
			`${shiftDate} ${attendanceData.dataValues.employee.attendanceroster.shiftsmaster.dataValues.shiftEndTime}`,
		);

		shiftEndTimePostBuffer.add(
			attendanceData.dataValues.employee.attendancePolicymaster
				.allowBufferTime === 1
				? attendanceData.dataValues.employee.attendancePolicymaster
						.bufferTimePost
				: 0,
			"minutes",
		);

		const punchOutAttendanceHistory = await db.attendanceHistory.findOne({
			where: {
				employeeId: user,
				[Op.and]: [
					db.Sequelize.where(
						db.Sequelize.fn(
							"concat",
							db.Sequelize.col("date"),
							" ",
							db.Sequelize.col("time"),
						),
						{
							[Op.between]: [
								new Date(shiftEndTimeGraceTimeClockOut),
								new Date(shiftEndTimePostBuffer),
							],
						},
					),
				],
			},
			order: [["attendanceHistoryId", "desc"]],
			limit: 1,
		});

		if (punchOutAttendanceHistory && punchInAttendanceHistory) {
			const punchOutObject = {
				attendancePunchOutTime: punchOutAttendanceHistory.dataValues.time,
				attendanceShiftEndDate: punchOutAttendanceHistory.dataValues.date,
				attendancePunchOutLocationType:
					punchOutAttendanceHistory.dataValues.locationType,
				attendanceStatus: "Punch Out",
				attendancePunchOutRemark:
					punchOutAttendanceHistory.dataValues.userRemark,
				attendanceWorkingTime: await helper.timeDifference(
					`${punchInAttendanceHistory.dataValues.date} ${punchInAttendanceHistory.dataValues.time}`,
					`${punchOutAttendanceHistory.dataValues.date} ${punchOutAttendanceHistory.dataValues.time}`,
				),
				attendancePunchOutLocation:
					punchOutAttendanceHistory.dataValues.location,
				attendancePunchOutLatitude: punchOutAttendanceHistory.dataValues.lat,
				attendancePunchOutLongitude: punchOutAttendanceHistory.dataValues.long,
				punchOutSource: punchOutAttendanceHistory.dataValues.device,
			};

			await db.attendanceMaster.update(punchOutObject, {
				where: {
					attendanceAutoId: attendanceData.dataValues.attendanceAutoId,
				},
			});
		}

		if (punchOutAttendanceHistory && !punchInAttendanceHistory) {
			let punchInObject = {
				attandanceShiftStartDate: punchOutAttendanceHistory.dataValues.date,
				attendanceShiftId:
					attendanceData.dataValues.employee.attendanceroster.shiftId,
				weekOffId:
					attendanceData.dataValues.employee.attendanceroster.weekOffId,
				attendancePunchInTime: punchOutAttendanceHistory.dataValues.time,
				attendanceStatus: "Punch In",
				attendanceLateBy: await helper.calculateLateBy(
					punchOutAttendanceHistory.dataValues.time,
					shiftStartTimeGraceTimeClockIn.format("HH:mm:ss"),
				),
				attendancePresentStatus: "present",
				attendancePunchInRemark:
					punchOutAttendanceHistory.dataValues.userRemark,
				attendancePunchInLocationType:
					punchOutAttendanceHistory.dataValues.locationType,
				attendancePunchInLocation:
					punchOutAttendanceHistory.dataValues.location,
				attendancePunchInLatitude: punchOutAttendanceHistory.dataValues.lat,
				attendancePunchInLongitude: punchOutAttendanceHistory.dataValues.long,
				punchInSource: punchOutAttendanceHistory.dataValues.device,
				attendanceShiftEndDate: null,
				attendancePunchOutTime: null,
				attendancePunchOutRemark: null,
				attendancePunchOutLocationType: null,
				attendancePunchOutLocation: null,
				attendancePunchOutLatitude: null,
				attendancePunchOutLongitude: null,
				attendanceWorkingTime: null,
				punchOutSource: null,
			};

			await db.attendanceMaster.update(punchInObject, {
				where: {
					attendanceAutoId: attendanceData.dataValues.attendanceAutoId,
				},
			});
		}
		_this.attedanceCronManual(attendanceData.dataValues.attendanceAutoId, date);
	}
};

export default new AttendanceController();
