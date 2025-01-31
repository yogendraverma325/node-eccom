import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import moment from "moment";
import db from "../config/db.config.js";
import bcrypt from "bcryptjs";
import pepipost from "pepipost";
import { Op } from "sequelize";
import eventEmitter from "../services/eventService.js";
import crypto from "crypto";
// import { createCanvas, loadImage } from "canvas";

const generateJwtToken = async (data) => {
	let pattern = /desktop/i;
	const token = jwt.sign(data, process.env.JWT_KEY, {
		expiresIn: pattern.test(data.user.device)
			? process.env.JWT_EXPIRY
			: process.env.JWT_EXPIRY_MOBILE,
	});
	return token;
};

const generateJwtOTPEncrypt = async (data) => {
	const token = jwt.sign(data, process.env.JWT_KEY, { expiresIn: "5m" });
	return token;
};

const generateJwtOTPDecrypt = async (token) => {
	const decoded = jwt.verify(token, process.env.JWT_KEY);
	return decoded;
};

const fileUpload = async (base64String, fileName, filepath) => {
	checkFolder();
	let dir = filepath;
	if (!dir) dir = path.resolve(dir);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	const fileExt = base64String.slice(
		base64String.indexOf("/") + 1,
		base64String.indexOf(";"),
	);

	const base64Data = base64String.replace(/^data:(.+);base64,/, "");
	const buffer = Buffer.from(base64Data, "base64");
	const finalFilePath = `${dir}/${fileName}.${fileExt}`;

	// if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
	//   sharp(buffer).resize(300, 300)
	//     .toFormat('jpeg')
	//     .jpeg({ quality: 80 })
	//     .toFile(finalFilePath);
	// } else {
	fs.writeFileSync(finalFilePath, buffer);
	// }
	return finalFilePath;
};

const checkFolder = async () => {
	const folder = ["uploads", "uploads/temp"];
	for (const iterator of folder) {
		let dir = iterator;
		if (!dir) dir = path.resolve(iterator);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	}
};

const checkActiveUser = async (data) => {
	const existUser = await db.employeeMaster.findOne({
		raw: true,
		where: {
			id: data,
			isActive: 1,
			isLoginActive: 1,
		},
		include: {
			model: db.jobDetails,
			required: true,
			attributes: [
				"dateOfProbationEnd",
				"confirmationDate",
				"confirmationGenerated",
				"dateOfJoining",
				"noticePeriodStatus",
			],
		},
	});
	return existUser;
};

const mailService = async (data) => {
	try {
		const testMail = parseInt(process.env.TEST_MAIL);
		const testMailIDs = process.env.TEST_MAIL_ID.split(",");
		const configuration = pepipost.Configuration;
		const controller = pepipost.MailSendController;
		configuration.apiKey = process.env.NETCORE_API_KEY;

		let body = new pepipost.Send();
		body.from = new pepipost.From();

		body.from.email = process.env.SENDER_MAIL;
		body.from.name = process.env.SENDER_NAME;
		body.subject = data.subject;

		body.content = [];
		body.content[0] = new pepipost.Content();
		body.content[0].type = pepipost.TypeEnum.HTML;
		body.content[0].value = data.html;
		body.personalizations = [];
		body.personalizations[0] = new pepipost.Personalizations();

		console.log("Mail is Sending On --->>", data.to);
		if (data.attachments && data.attachments.length >= 1) {
			body.personalizations[0].attachments = data.attachments.map((attc) => ({
				content: Buffer.from(attc.content, "binary").toString("base64"),
				name: attc.filename,
			}));
		}
		body.personalizations[0].To = [];
		body.personalizations[0].To = new pepipost.EmailStruct();
		body.personalizations[0].To = mergeEmail(
			testMail ? testMailIDs : data.to.split(","),
		);

		body.personalizations[0].cc = [];
		body.personalizations[0].cc = new pepipost.EmailStruct();
		body.personalizations[0].cc = mergeEmail(
			data.cc ? (testMail ? testMailIDs : data.cc.split(",")) : [],
		);

		body.personalizations[0].bcc = [];
		body.personalizations[0].bcc = new pepipost.EmailStruct();
		body.personalizations[0].bcc = mergeEmail(
			data.bcc ? data.bcc.split(",") : [],
		);
		body.settings = {};
		body.settings.open_track = true;
		body.settings.click_track = true;
		body.settings.unsubscribe_track = false;

		const promise = await controller.createGeneratethemailsendrequest(body);

		console.log(promise);
		return promise;
	} catch (error) {
		console.log(error);
	}
};

const mergeEmail = (email) => {
	let emails =
		typeof email === "string"
			? [{ email }]
			: email.map((email) => {
					return { email };
				});
	return emails;
};

const timeDifference = async (start, end) => {
	let startTime = moment(start, "YYYY-MM-DD HH:mm:ss");
	let endTime = moment(end, "YYYY-MM-DD HH:mm:ss");

	let hours = moment.utc(endTime.diff(startTime)).format("HH");
	let minutes = moment.utc(endTime.diff(startTime)).format("mm");
	let sec = moment.utc(endTime.diff(startTime)).format("ss");
	const time = [hours, minutes, sec].join(":");
	return time;
};

const timeDifferenceNew = async (start, end) => {
	console.log("start", start);
	console.log("end", end);
	// let startTime = moment(start, "YYYY-MM-DD HH:mm:ss");
	// let endTime = moment(end, "YYYY-MM-DD HH:mm:ss");
	let startTime = moment(start, "HH:mm:ss");
	let endTime = moment(end, "HH:mm:ss");

	let hours = moment.utc(endTime.diff(startTime)).format("HH");
	let minutes = moment.utc(endTime.diff(startTime)).format("mm");
	let sec = moment.utc(endTime.diff(startTime)).format("ss");
	const time = [hours, minutes, sec].join(":");
	return time;
};

const calculateLateBy = async (
	actualTime,
	scheduleTime,
	withFromDate = null,
	withToDate = null,
) => {
	if (withFromDate != null && withToDate != null) {
		const combinedLastDayTime = moment(
			`${withFromDate} ${scheduleTime}`,
			"YYYY-MM-DD HH:mm:ss",
		);
		const combinedCurrentTime = moment(
			`${withToDate} ${actualTime}`,
			"YYYY-MM-DD HH:mm:ss",
		);
		console.log("combinedLastDayTime", combinedLastDayTime);
		console.log("combinedCurrentTime", combinedCurrentTime);

		if (combinedCurrentTime.isAfter(combinedLastDayTime)) {
			let duration = moment.duration(
				combinedCurrentTime.diff(combinedLastDayTime),
			);
			let hours = Math.floor(duration.asHours());
			let minutes = Math.floor(duration.minutes());
			let seconds = Math.floor(duration.seconds());
			return moment
				.utc()
				.startOf("day")
				.add({ hours: hours, minutes: minutes, seconds: seconds })
				.format("HH:mm:ss");
		} else {
			return "00:00:00";
		}
	} else {
		let actualMoment = moment(actualTime, "HH:mm:ss");
		let scheduledTime = moment(scheduleTime, "HH:mm:ss");

		if (actualMoment.isAfter(scheduledTime)) {
			let duration = moment.duration(actualMoment.diff(scheduledTime));
			let hours = Math.floor(duration.asHours());
			let minutes = Math.floor(duration.minutes());
			let seconds = Math.floor(duration.seconds());
			return moment
				.utc()
				.startOf("day")
				.add({ hours: hours, minutes: minutes, seconds: seconds })
				.format("HH:mm:ss");
		} else {
			return "00:00:00";
		}
	}
};

const calculateTime = async (time) => {
	if (time.length === 0) {
		return "00:00:00";
	}

	let sumDuration = moment.duration(0);
	time.forEach((duration) => {
		const [hours, minutes, seconds] = duration.split(":");
		sumDuration.add(
			moment.duration({
				hours: parseInt(hours),
				minutes: parseInt(minutes),
				seconds: parseInt(seconds),
			}),
		);
	});

	return moment.utc(sumDuration.asMilliseconds()).format("HH:mm:ss");
};

const calculateAverageHours = async (workingHours) => {
	function parseDuration(timeStr) {
		let [hours, minutes, seconds] = timeStr.split(":");
		return moment.duration({
			hours: parseInt(hours),
			minutes: parseInt(minutes),
			seconds: parseInt(seconds),
		});
	}

	let totalDuration = moment.duration();
	workingHours.forEach((timeStr) => {
		let duration = parseDuration(timeStr);
		totalDuration.add(duration);
	});

	let averageDurationMs = totalDuration.asMilliseconds() / workingHours.length;
	let averageDuration = moment.duration(averageDurationMs);

	let averageHours = Math.floor(averageDuration.asHours());
	let averageMinutes = averageDuration.minutes();
	let averageSeconds = averageDuration.seconds();

	return moment
		.utc()
		.startOf("day")
		.add({
			hours: averageHours,
			minutes: averageMinutes,
			seconds: averageSeconds,
		})
		.format("HH:mm:ss");
};

const ip = async (data) => {
	const lastIndex = data.lastIndexOf(":");
	const result = data.substring(lastIndex + 1);
	return result;
};

const generateRandomPassword = async () => {
	let length = 8,
		charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		retVal = "";
	for (let i = 0, n = charset.length; i < length; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return retVal;
};

const encryptPassword = async (data) => {
	const salt = await bcrypt.genSalt(10);
	const hashPassword = await bcrypt.hash(data, salt);
	return hashPassword;
};

const getEmpProfile = async (EMP_ID) => {
	const EMP_DATA = await db.employeeMaster.findOne({
		where: {
			id: EMP_ID,
			isActive: 1,
		},
		attributes: {
			exclude: ["password", "role_id", "designation_id"],
		},
		include: [
			{
				model: db.salutationMaster,
				attributes: ["salutationId", "salutation"],
			},
			{
				model: db.jobDetails,
				attributes: [
					"dateOfProbationEnd",
					"confirmationDate",
					"confirmationGenerated",
				],
			},
			{
				model: db.functionalAreaMaster,
				required: true,
				attributes: [
					"functionalAreaId",
					"functionalAreaName",
					"functionalAreaCode",
				],
			},
			{
				model: db.noticePeriodMaster,
				attributes: ["nPDaysAfterConfirmation"],
			},
			{
				model: db.buMaster,
				required: true,
				attributes: ["buId", "buName", "buCode"],
			},
			{
				model: db.sbuMaster,
				seperate: true,
				attributes: ["sbuname", "code"],
			},
			{
				model: db.departmentMaster,
				required: true,
				attributes: ["departmentId", "departmentCode", "departmentName"],
			},
			{
				model: db.companyMaster,
				required: true,
				attributes: ["companyId", "companyName", "companyCode"],
				include: [
					{
						model: db.groupCompanyMaster,
						required: true,
						attributes: ["groupId", "groupCode", "groupName", "groupShortName"],
					},
				],
			},
			{
				model: db.employeeMaster,
				required: false,
				attributes: ["id", "name", "profileImage", "email"],
				as: "managerData",
				include: [
					{
						model: db.roleMaster,
						required: false,
					},
					{
						model: db.designationMaster,
						required: false,
						attributes: ["designationId", "name"],
					},
				],
			},
			{
				model: db.roleMaster,
				required: true,
				attributes: ["name"],
			},
			{
				model: db.designationMaster,
				required: true,
				attributes: ["designationId", "name"],
			},
			{
				model: db.employeeMaster,
				as: "reportie",
				required: false,
				attributes: {
					exclude: ["password", "role_id", "designation_id"],
				},
				include: [
					{
						model: db.roleMaster,
						required: true,
					},
					{
						model: db.designationMaster,
						required: true,
						attributes: ["designationId", "name"],
					},
				],
			},
			{
				model: db.weekOffMaster,
				required: false,
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
			// {
			//   model: db.employeeMaster,
			//   required: false,
			//   attributes: ["id", "name"],
			//   as: "buHeadData",
			// },
			// {
			//   model: db.employeeMaster,
			//   required: false,
			//   attributes: ["id", "name"],
			//   as: "buhrData",
			// },
			{
				model: db.companyLocationMaster,
				required: false,
				attributes: ["address1", "address2"],
			},
		],
	});
	if (EMP_DATA) {
		const headAndHrData = await db.buMapping.findOne({
			where: { buId: EMP_DATA.buId, companyId: EMP_DATA.companyId },
			include: [
				{
					model: db.employeeMaster,
					attributes: ["id", "name", "email"],
					as: "buHeadData",
				},
				{
					model: db.employeeMaster,
					attributes: ["id", "name", "email"],
					as: "buhrData",
				},
			],
		});

		if (headAndHrData) {
			EMP_DATA.dataValues.buHeadData = headAndHrData.buHeadData;
			EMP_DATA.dataValues.buhrData = headAndHrData.buhrData;
		}
	}

	return EMP_DATA;
};
const empLeaveDetails = async function (userId, type) {
	let leaveData = 0;
	if (type == 0) {
		let countApproved = await db.employeeLeaveTransactions.findAll({
			attributes: [
				[
					db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
					"totalLeaveCount",
				],
			],
			where: {
				EmployeeId: userId,
				status: "approved",
				leaveAutoId: 6,
				source: {
					[Op.ne]: "system_generated",
				},
			},
			raw: true,
		});

		let countPending = await db.employeeLeaveTransactions.findAll({
			attributes: [
				[
					db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
					"totalLeaveCount",
				],
			],
			where: { EmployeeId: userId, status: "pending", leaveAutoId: 6 },
			raw: true,
		});

		let countSystemDeducting = await db.employeeLeaveTransactions.findAll({
			attributes: [
				[
					db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
					"totalLeaveCount",
				],
			],
			where: {
				EmployeeId: userId,
				leaveAutoId: 6,
				status: "approved",
				[Op.or]: [{ source: null }, { source: "system_generated" }],
			},
			raw: true,
		});

		let countPendingLeave = await db.EmployeeLeaveHeader.count({
			where: {
				status: "pending",
				employeeId: userId,
			},
			raw: true,
		});

		let totalLeaveCountApproved = countApproved
			? countApproved[0].totalLeaveCount || "0"
			: 0;
		let totalLeaveCountPending = countPending
			? countPending[0].totalLeaveCount || "0"
			: 0;
		let totalLeaveCountSystemDeducting = countSystemDeducting
			? countSystemDeducting[0].totalLeaveCount || "0"
			: 0;

		leaveData = await db.leaveMapping.findAll({
			where: {
				EmployeeId: userId,
				isActive: 1,
			},
			include: [
				{
					model: db.leaveMaster,
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
		let count = await this.compOffbalabceForUser(userId);
		// Check if leaveData is an array and process each item
		leaveData.forEach((item) => {
			if (item.leaveAutoId === 6 && item.leavemaster) {
				item.leavemaster.dataValues.countApproved = totalLeaveCountApproved;
				item.leavemaster.dataValues.countPending = totalLeaveCountPending;
				item.leavemaster.dataValues.countSystemDeducting =
					totalLeaveCountSystemDeducting;
				item.dataValues.totalPendingLeaveCount = countPendingLeave;
			}
			if (item.leaveAutoId === 9 && item.leavemaster) {
				item.dataValues.availableLeave = count;
			} else {
				item.dataValues.totalPendingLeaveCount = countPendingLeave;
			}
		});
	} else {
		let countPendingLeave = await db.EmployeeLeaveHeader.count({
			where: {
				status: "pending",
				employeeId: userId,
			},
			raw: true,
		});

		leaveData = await db.leaveMapping.findOne({
			where: {
				EmployeeId: userId,
				leaveAutoId: type,
				isActive: 1,
			},
		});
		console.log("leaveData from this");
		// If leaveData is an object, handle it directly
		if (leaveData && leaveData.leaveAutoId == 9 && leaveData) {
			console.log("leaveData from inside");
			leaveData.dataValues.availableLeave =
				await this.compOffbalabceForUser(userId);
		}
		if (leaveData && leaveData.leaveAutoId === 6 && leaveData.leavemaster) {
			let countApproved = await db.employeeLeaveTransactions.findAll({
				attributes: [
					[
						db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
						"totalLeaveCount",
					],
				],
				where: {
					EmployeeId: userId,
					status: "approved",
					leaveAutoId: 6,
					source: {
						[Op.ne]: "system_generated",
					},
				},
				raw: true,
			});

			let countPending = await db.employeeLeaveTransactions.findAll({
				attributes: [
					[
						db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
						"totalLeaveCount",
					],
				],
				where: { EmployeeId: userId, status: "pending", leaveAutoId: 6 },
				raw: true,
			});

			let countSystemDeducting = await db.employeeLeaveTransactions.findAll({
				attributes: [
					[
						db.Sequelize.fn("sum", db.Sequelize.col("leaveCount")),
						"totalLeaveCount",
					],
				],
				where: {
					EmployeeId: userId,
					leaveAutoId: 6,
					[Op.or]: [{ source: null }, { source: "system_generated" }],
				},
				raw: true,
			});
			let totalLeaveCountApproved = countApproved
				? countApproved[0].totalLeaveCount || "0"
				: 0;
			let totalLeaveCountPending = countPending
				? countPending[0].totalLeaveCount || "0"
				: 0;
			let totalLeaveCountSystemDeducting = countSystemDeducting
				? countSystemDeducting[0].totalLeaveCount || "0"
				: 0;

			leaveData.leavemaster.dataValues.countApproved = totalLeaveCountApproved;
			leaveData.leavemaster.dataValues.countPending = totalLeaveCountPending;
			leaveData.leavemaster.dataValues.countSystemDeducting =
				totalLeaveCountSystemDeducting;
			leaveData.leavemaster.dataValues.totalPendingLeaveCount =
				countPendingLeave; // Add totalPendingLeaveCount here
		}
	}

	return leaveData;
};

const minutesNunmberToHoursFormat = (input) => {
	const inputMinuteNumber = moment.duration(input, "minutes");

	// Format the duration to HH:mm:ss
	const formatTime = moment
		.utc(inputMinuteNumber.asMilliseconds())
		.format("HH:mm:ss");
	return formatTime;
};
const empMarkLeaveOfGivenDate = async function (
	userId,
	inputData,
	batch,
	lateCase,
	workCase,
	empData,
	attendanceandOtherData,
) {
	const leaveCountForDates = await db.employeeLeaveTransactions.findAll({
		where: {
			appliedFor: {
				[Op.between]: [inputData.fromDate, inputData.toDate],
			},
			status: "approved",
			employeeId: userId,
		},
	});
	let inputs = [];
	inputs = leaveCountForDates.filter((el) => {
		if (el.appliedFor == inputData.appliedFor) {
			if (el.halfDayFor == 0) {
				return true;
			} else {
				if (leaveCountForDates.length == 2) {
					return true;
				} else if (leaveCountForDates.length == 1) {
					if (el.halfDayFor == inputData.halfDayFor) {
						return true;
					} else {
						if (el.halfDayFor == 2) {
							inputData.isHalfDay = 1;
							inputData.halfDayFor = 1;
							inputData.leaveCount = 0.5;
							return false;
						} else {
							inputData.isHalfDay = 1;
							inputData.halfDayFor = 2;
							inputData.leaveCount = 0.5;
							return false;
						}
					}
				} else {
					return false;
				}
			}
		} else {
			return false;
		}
	});
	if (inputs.length == 0) {
		let leaveText = "";
		let leaveType = "Half Day";
		if (inputData.leaveCount == 1) {
			leaveType = "Full Day";
		}
		if (lateCase != null && workCase == null) {
			leaveText = `Auto-requested for Leave deduction based on late duration policy.${
				empData.name
			} (${empData.empCode}) has clocked in late in ${
				attendanceandOtherData.attendancemaster.attendanceLateBy
			}
Late by duration to deduct half day is : ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyLateDurationHalfDayTime,
			)}
Late by duration to deduct full day is : ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyLateDurationFullDayTime,
			)}
${moment(inputData.fromDate).format("DD-MM-YYYY")} to ${moment(
				inputData.toDate,
			).format("DD-MM-YYYY")} (${leaveType}, System Half)`;
		} else if (lateCase == null && workCase != null) {
			leaveText = `Auto-requested for Leave because of Work duration policy.${
				empData.name
			} (${empData.empCode}) has worked for ${
				attendanceandOtherData.attendancemaster.attendanceWorkingTime
			}
Working hours required in order to complete Half Day: ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyWorkDurationHalfDayTime,
			)}
Working hours required in order to complete Full Day: ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyWorkDurationFullDayTime,
			)}`;
		} else {
			leaveText = `Auto-requested for Leave because of Work and Late duration policy. 
${empData.name} (${empData.empCode}) has worked for ${
				attendanceandOtherData.attendancemaster.attendanceWorkingTime
			} and Late By ${attendanceandOtherData.attendancemaster.attendanceLateBy}
Working hours required in order to complete Half Day: ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyWorkDurationHalfDayTime,
			)}
Working hours required in order to complete Full Day: ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyWorkDurationFullDayTime,
			)}
Late by duration to deduct half day is : ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyLateDurationHalfDayTime,
			)}
Late by duration to deduct full day is : ${minutesNunmberToHoursFormat(
				attendanceandOtherData.attendancePolicymaster
					.leaveDeductPolicyLateDurationFullDayTime,
			)}
${moment(inputData.fromDate).format("DD-MM-YYYY")} to ${moment(
				inputData.toDate,
			).format("DD-MM-YYYY")} (${leaveType}, System Half)`;
		}
		inputData.source = "system_generated";

		// console.log("workCase", workCase);
		// console.log("empData", empData);
		// console.log("attendanceData", attendanceData);
		if (inputData.leaveAutoId != 6) {
			let empLeave = await empLeaveDetails(userId, inputData.leaveAutoId);
			if (empLeave) {
				let pendingLeaveCountList = await db.employeeLeaveTransactions.findAll({
					where: {
						status: "pending",
						employeeId: userId,
						leaveAutoId: inputData.leaveAutoId,
					},
				});
				let pendingLeaveCount = 0;

				pendingLeaveCountList.map((el) => {
					pendingLeaveCount += parseFloat(el.leaveCount);
				});

				if (
					pendingLeaveCount + inputData.leaveCount >=
					parseFloat(empLeave.availableLeave)
				) {
					inputData.leaveAutoId = 6;
				}
			} else {
				inputData.leaveAutoId = 6;
			}
		} else {
			inputData.leaveAutoId = 6;
		}
		inputData.batch_id = batch;
		inputData.message = leaveText;

		let headerInsert = await db.EmployeeLeaveHeader.create(inputData);

		inputData.employeeleaveheaderID = headerInsert.employeeleaveheaderID;
		await db.employeeLeaveTransactions.create(inputData); // Push data to leave transaction table for that employee

		//start code :leave deducation code if auto approve only
		if (inputData.status == "approved") {
			if (inputData.leaveAutoId == 6) {
				//IF leave type if LWP
				const lwpLeave = await db.leaveMapping.findOne({
					where: {
						EmployeeId: userId,
						leaveAutoId: inputData.leaveAutoId,
					},
				});

				if (lwpLeave) {
					await db.leaveMapping.increment(
						{ utilizedThisYear: parseFloat(inputData.leaveCount) },
						{
							where: {
								EmployeeId: userId,
								leaveAutoId: inputData.leaveAutoId,
							},
						},
					);
				} else {
					await db.leaveMapping.create({
						EmployeeId: userId,
						leaveAutoId: inputData.leaveAutoId,
						availableLeave: 0,
						utilizedThisYear: parseFloat(inputData.leaveCount),
						creditedFromLastYear: 0,
						annualAllotment: 0,
						accruedThisYear: 0,
					});
				}
			} else {
				// Else leave is other than LWP
				await db.leaveMapping.increment(
					{ utilizedThisYear: parseFloat(inputData.leaveCount) },
					{
						where: {
							EmployeeId: userId,
							leaveAutoId: inputData.leaveAutoId,
						},
					},
				);
				await db.leaveMapping.increment(
					{ availableLeave: -parseFloat(inputData.leaveCount) },
					{
						where: {
							EmployeeId: userId,
							leaveAutoId: inputData.leaveAutoId,
						},
					},
				);
			}
		}
		//end code :leave deducation code if auto approve only

		const leaveDeductionData = await db.employeeMaster.findOne({
			raw: true,
			where: {
				id: inputData.employeeId,
			},
			attributes: ["name", "email"],
			include: [
				{
					model: db.shiftMaster,
					attributes: ["shiftStartTime", "shiftEndTime"],
				},
			],
		});

		const leaveData = await db.leaveMaster.findOne({
			raw: true,
			where: {
				leaveId: inputData.leaveAutoId,
			},
			attributes: ["leaveName"],
		});
		let leaveReason;
		if (inputData.status == "approved") {
			leaveReason = "auto-approved";
		}
		if (inputData.status == "pending") {
			leaveReason = "pending at manager";
		}

		eventEmitter.emit(
			"autoLeaveDeductionMail",
			JSON.stringify({
				email: leaveDeductionData.email,
				name: leaveDeductionData.name,
				date: inputData.appliedFor,
				leaveReason,
				shiftStartTime: leaveDeductionData["shiftsmaster.shiftStartTime"],
				shiftEndTime: leaveDeductionData["shiftsmaster.shiftEndTime"],
				leaveType: leaveData.leaveName,
				leaveDuration: inputData.leaveCount === 0.5 ? "Half Day" : "Full Day",
				punchInTime: inputData.punchInTime,
				punchOutTime: inputData.punchOutTime,
			}),
		);
	}

	return 1;
};

const remainingLeaveCount = async function (
	startDate,
	endDate,
	weekOffId,
	companyLocationId,
) {
	const daysDifferenceReq = moment(endDate).diff(moment(startDate), "days");
	var workingCount = 0;

	for (let i = 0; i <= daysDifferenceReq; i++) {
		let appliedFor = moment(startDate).add(i, "days").format("YYYY-MM-DD");

		let lastDayDateAnotherFormat = moment(appliedFor).format("DD-MM-YYYY");
		let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
		let dayCode = parseInt(moment(appliedFor).format("d")) + 1;

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
				occurrenceDayCondition = {};
		}
		const existEmployees = await db.weekOffMaster.findOne({
			where: {
				weekOffId: weekOffId,
			},
			include: [
				{
					model: db.weekOffDayMappingMaster,
					required: false,
					where: occurrenceDayCondition,
				},
			],
		});

		if (existEmployees.weekOffDayMappingMasters.length == 0) {
			let employeeHolidays =
				await db.holidayCompanyLocationConfiguration.findOne({
					where: { companyLocationId: companyLocationId },
					include: {
						model: db.holidayMaster,
						where: { holidayDate: appliedFor },
						as: "holidayDetails",
						required: true,
					},
				});
			if (!employeeHolidays) {
				workingCount += 1;
			}
		}
	}
	return workingCount;
};

const isDayWorking = async function (startDate, weekOffId, companyLocationId) {
	let appliedFor = moment(startDate).add(0, "days").format("YYYY-MM-DD");
	console.log("appliedFor", appliedFor);
	let lastDayDateAnotherFormat = moment(appliedFor).format("DD-MM-YYYY");
	let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
	let dayCode = parseInt(moment(appliedFor).format("d")) + 1;

	let dayOfMonth = parsedDate.date();
	let occurrence = Math.ceil(dayOfMonth / 7);
	var workingCount = 0;
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
			occurrenceDayCondition = {};
	}
	const existEmployees = await db.weekOffMaster.findOne({
		where: {
			weekOffId: weekOffId,
		},
		include: [
			{
				model: db.weekOffDayMappingMaster,
				required: false,
				where: occurrenceDayCondition,
			},
		],
	});

	if (existEmployees.weekOffDayMappingMasters.length == 0) {
		let employeeHolidays = await db.holidayCompanyLocationConfiguration.findOne(
			{
				where: { companyLocationId: companyLocationId },
				include: {
					model: db.holidayMaster,
					where: { holidayDate: appliedFor },
					as: "holidayDetails",
					required: true,
				},
			},
		);
		if (!employeeHolidays) {
			workingCount += 1;
		}
	}
	console.log("workingCountworkingCount", workingCount);
	return workingCount;
};

const isDayWorkingForReport = async function (
	startDate,
	weekOffId,
	companyLocationId,
) {
	let appliedFor = moment(startDate).add(0, "days").format("YYYY-MM-DD");
	console.log("appliedFor", appliedFor);

	let lastDayDateAnotherFormat = moment(appliedFor).format("DD-MM-YYYY");
	let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
	let dayCode = parseInt(moment(appliedFor).format("d")) + 1; // Day of the week (1-7)

	let dayOfMonth = parsedDate.date();
	let occurrence = Math.ceil(dayOfMonth / 7); // Calculate occurrence of the day in the month

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
			occurrenceDayCondition = {};
	}

	// Check if the day is a week off
	const weekOffDay = await db.weekOffMaster.findOne({
		where: { weekOffId: weekOffId },
		include: [
			{
				model: db.weekOffDayMappingMaster,
				required: false,
				where: occurrenceDayCondition,
			},
		],
	});

	// If the day is a week off, return "W"
	if (weekOffDay && weekOffDay.weekOffDayMappingMasters.length > 0) {
		return "W"; // Week off
	}

	// Check if the day is a holiday
	const employeeHoliday = await db.holidayCompanyLocationConfiguration.findOne({
		where: { companyLocationId: companyLocationId },
		include: {
			model: db.holidayMaster,
			where: { holidayDate: appliedFor },
			as: "holidayDetails",
			required: true,
		},
	});

	// If the day is a holiday, return "H"
	if (employeeHoliday) {
		return "H"; // Holiday
	}

	// If it's neither a week off nor a holiday, return 1 to indicate a working day
	return 1; // Working day
};

// const getCombineValue = async function (leaveFirstHalf, leaveSecondHalf) {
//   let combineValue = "0.00";

//   if ((leaveFirstHalf === 1 || leaveFirstHalf === 2) && leaveSecondHalf === 0) {
//     combineValue = "0.50";
//   } else if (leaveFirstHalf === 0 && (leaveSecondHalf === 1 || leaveSecondHalf === 2)) {
//     combineValue = "0.50";
//   } else if ((leaveFirstHalf === 1 || leaveFirstHalf === 2) && (leaveSecondHalf === 1 || leaveSecondHalf === 2)) {
//     combineValue = "1.00";
//   } else if (leaveFirstHalf === 0 && leaveSecondHalf === 0) {
//     combineValue = "0.00";
//   }

//   return combineValue;
// };

const getCombineValue = async function (
	leaveFirstHalf,
	leaveSecondHalf,
	startDate,
	endDate,
	companyLocationId,
	weekOffId,
) {
	let combineValue = "0.00";
	let isDayWorkingStartDate = await isDayWorking(
		startDate,
		weekOffId,
		companyLocationId,
	);
	let isDayWorkingToDate = await isDayWorking(
		endDate,
		weekOffId,
		companyLocationId,
	);
	if (
		isDayWorkingStartDate == 1 &&
		isDayWorkingToDate == 1 &&
		(leaveFirstHalf == 1 || leaveFirstHalf == 2) &&
		(leaveSecondHalf == 1 || leaveSecondHalf == 2)
	) {
		combineValue = "1.00";
	}
	if (
		isDayWorkingStartDate == 1 &&
		isDayWorkingToDate == 0 &&
		(leaveFirstHalf == 1 || leaveFirstHalf == 2) &&
		leaveSecondHalf == 0
	) {
		combineValue = "0.50";
	}
	if (
		isDayWorkingStartDate == 0 &&
		isDayWorkingToDate == 1 &&
		leaveFirstHalf == 0 &&
		(leaveSecondHalf == 1 || leaveSecondHalf == 2)
	) {
		combineValue = "0.50";
	}
	if (
		isDayWorkingStartDate == 1 &&
		isDayWorkingToDate == 0 &&
		(leaveFirstHalf == 1 || leaveFirstHalf == 2) &&
		(leaveSecondHalf == 1 || leaveSecondHalf == 2)
	) {
		combineValue = "0.50";
	}
	if (
		isDayWorkingStartDate == 0 &&
		isDayWorkingToDate == 1 &&
		(leaveFirstHalf == 1 || leaveFirstHalf == 2) &&
		(leaveSecondHalf == 1 || leaveSecondHalf == 2)
	) {
		combineValue = "0.50";
	}
	if (
		isDayWorkingStartDate == 1 &&
		isDayWorkingToDate == 1 &&
		(leaveFirstHalf == 1 || leaveFirstHalf == 2) &&
		leaveSecondHalf == 0
	) {
		combineValue = "0.50";
	}
	if (
		isDayWorkingStartDate == 1 &&
		isDayWorkingToDate == 1 &&
		leaveFirstHalf == 0 &&
		(leaveSecondHalf == 1 || leaveSecondHalf == 2)
	) {
		combineValue = "0.50";
	}

	return combineValue;
};

const generateOTP = async function (length) {
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - 1;

	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateSHA512Hash = async function (input) {
	const hash = crypto.createHash("sha512");
	hash.update(input);
	return hash.digest("hex"); // Output the hash in hexadecimal format
};

const compareImages = async function (base64Image, folderImagePath) {
	try {
		// Decode the base64 image into a buffer
		if (base64Image == null || folderImagePath == null) {
			return false;
		} else {
			const base64Buffer = Buffer.from(base64Image, "base64");

			// Load the base64 image and the folder image into canvases
			const img1 = await loadImage(base64Buffer);
			const img2 = await loadImage(folderImagePath);

			const canvas1 = createCanvas(img1.width, img1.height);
			const canvas2 = createCanvas(img2.width, img2.height);

			const ctx1 = canvas1.getContext("2d");
			const ctx2 = canvas2.getContext("2d");

			ctx1.drawImage(img1, 0, 0);
			ctx2.drawImage(img2, 0, 0);

			// Get image data for comparison
			const data1 = ctx1.getImageData(0, 0, img1.width, img1.height).data;
			const data2 = ctx2.getImageData(0, 0, img2.width, img2.height).data;

			// Compare pixel by pixel
			let isIdentical = true;
			for (let i = 0; i < data1.length; i++) {
				if (data1[i] !== data2[i]) {
					isIdentical = false;
					break;
				}
			}

			if (isIdentical) {
				console.log("Images are identical");
				return true;
			} else {
				console.log("Images are different");
				return false;
			}
		}
	} catch (error) {
		console.error("Error comparing images:", error);
		return false;
	}
};
///CONFIRMATION
const generateFieldsForgivenLevel = async function (policyId, inputLevel) {
	console.log("inputLevel", inputLevel);
	let levelData = null;
	let level = inputLevel;
	let levelFound = false;
	levelData = await db.Confirmationpolicyworkflow.findOne({
		where: {
			confimationPolicyAutoId: policyId,
			isEnable: 1,
			level: level,
		},
	});
	if (!levelData) {
		level++;
		levelData = await db.Confirmationpolicyworkflow.findOne({
			where: {
				confimationPolicyAutoId: policyId,
				isEnable: 1,
				level: level,
			},
		});
	}
	if (!levelData) {
		level++;
		levelData = await db.Confirmationpolicyworkflow.findOne({
			where: {
				confimationPolicyAutoId: policyId,
				isEnable: 1,
				level: level,
			},
		});
	}
	if (!levelData) {
		level++;
		levelData = await db.Confirmationpolicyworkflow.findOne({
			where: {
				confimationPolicyAutoId: policyId,
				isEnable: 1,
				level: level,
			},
		});
	}
	if (levelData) {
		levelFound = true;
	}
	return { levelData: levelData, level: level, levelFound: levelFound };
};

const getSigningAuthorityDate = async (SIGN_FOR, dataForWhereCondition) => {
	const SigningauthorityData = await db.Signingauthority.findOne({
		where: {
			authorityFor: SIGN_FOR,
			companyIds: {
				[Op.or]: [
					{ [Op.like]: `${dataForWhereCondition.companyId},%` },
					{ [Op.like]: `%,${dataForWhereCondition.companyId},%` },
					{ [Op.like]: `%,${dataForWhereCondition.companyId}` },
					{ [Op.eq]: `${dataForWhereCondition.companyId}` },
				],
			},
		},
		include: [
			{
				model: db.employeeMaster,
				attributes: ["id", "name"],
				where: {
					isActive: 1,
				},
				include: {
					model: db.designationMaster,
					required: false,
					attributes: ["designationId", "name"],
				},
			},
		],
	});

	return SigningauthorityData;
};
///CONFIRMATION

const convertExcelDate = (serial) => {
	const date = new Date((serial - 25569) * 86400 * 1000);
	return moment(date).format("YYYY-MM-DD");
};

///COMPOFF
const checkCompOffPolicyForUser = async (UserId) => {
	//console.log("UserId", UserId);
	const mappingObject = {
		COMPANY: "companyId",
		BU: "buId",
		DEPARTMENT: "departmentId",
		SBU: "sbuId",
		FUNCTIONALAREA: "functionalAreaId",
		JOBLEVEL: "jobLevelId",
		BAND: "bandId",
		GRADE: "gradeId",
		EMPID: "id",
	};

	const compOffAissgments = await db.comp_off_assignment.findAll({
		include: {
			model: db.comp_off_assignment_filters,
		},
	});
	let whereCondition = {
		isActive: 1,
	};
	let compOffPolicyAssignment = {};
	let whereConditionJobdetails = {};
	for (const single of compOffAissgments) {
		for (const singlefilter of single.comp_off_assignment_filters) {
			const columnName = mappingObject[singlefilter.filter_colum];
			const validColumns = ["jobLevelId", "bandId", "gradeId"];
			if (validColumns.includes(columnName)) {
				if (singlefilter.filter_type == "INCLUDE") {
					whereConditionJobdetails[columnName] = {
						[Op.in]: singlefilter.filter_data.split(","),
					};
				} else {
					whereConditionJobdetails[columnName] = {
						[Op.notIn]: singlefilter.filter_data.split(","),
					};
				}
			} else {
				if (singlefilter.filter_type == "INCLUDE") {
					whereCondition[columnName] = {
						[Op.in]: singlefilter.filter_data.split(","),
					};
				} else {
					whereCondition[columnName] = {
						[Op.notIn]: singlefilter.filter_data.split(","),
					};
				}
			}
		}
		whereConditionJobdetails = {
			...whereConditionJobdetails,
			...{ userId: UserId },
		};
		const employee = await db.employeeMaster.findOne({
			where: whereCondition,
			attributes: [
				"id",
				"empCode",
				"name",
				"buId",
				"departmentId",
				"companyId",
				"functionalAreaId",
			],
			include: {
				require: true,
				model: db.jobDetails,
				attributes: ["bandId", "gradeId", "jobLevelId"],
				where: whereConditionJobdetails,
			},
		});
		if (employee) {
			if (employee?.id in compOffPolicyAssignment) {
				compOffPolicyAssignment[employee?.id] =
					single?.comp_off_assignment_auto_id;
			} else {
				compOffPolicyAssignment[employee?.id] =
					single?.comp_off_assignment_auto_id;
			}
		}
	}
	let compOffPolicyData = null;
	if (Object.keys(compOffPolicyAssignment).length > 0) {
		compOffPolicyData = await db.comp_off_polices.findOne({
			where: {
				comp_off_assignment_auto_id_for_policies: {
					[Op.or]: [
						{ [Op.like]: `${compOffPolicyAssignment[UserId]},%` },
						{ [Op.like]: `%,${compOffPolicyAssignment[UserId]},%` },
						{ [Op.like]: `%,${compOffPolicyAssignment[UserId]}` },
						{ [Op.eq]: `${compOffPolicyAssignment[UserId]}` },
					],
				},
			},
		});
	}
	return compOffPolicyData;
};
const compOffbalabceForUser = async (UserId, status = "Approved") => {
	let count = 0;
	var result = null;
	if (status == "Approved") {
		result = await db.comp_off_credit_history.findOne({
			attributes: [
				[db.Sequelize.fn("SUM", db.Sequelize.col("balance")), "total_balance"], // Sum of balance column
			],
			where: {
				employee_Id: UserId,
				expiry_date: {
					[Op.or]: [
						{ [Op.eq]: null }, // Check if expiry_date is null
						{ [Op.gt]: moment().format("YYYY-MM-DD") }, // Check if expiry_date is greater than today
					],
				},
				taken_on: {
					[Op.eq]: null, // Check if expiry_date is null
				},
				status: 1,
			},
		});
	} else {
		result = await db.comp_off_credit_history.count({
			where: {
				expiry_date: {
					[Op.or]: [
						{ [Op.eq]: null }, // Check if expiry_date is null
						{ [Op.gt]: moment().format("YYYY-MM-DD") }, // Check if expiry_date is greater than today
					],
				},
				taken_on: {
					[Op.eq]: null, // Check if expiry_date is null
				},
				[Op.or]: [
					{ pending_at: { [Op.like]: `${UserId},%` } }, // Check if userId is at the start
					{ pending_at: { [Op.like]: `%,${UserId},%` } }, // Check if userId is in the middle
					{ pending_at: { [Op.like]: `%,${UserId}` } }, // Check if userId is at the end
					{ pending_at: { [Op.eq]: `${UserId}` } }, // Check if userId is the only value
				],
				//employee_Id: req.userId,
				status: 3,
			},
		});
	}

	if (status == "Approved") {
		if (result && result.dataValues.total_balance != null) {
			count = parseFloat(result.dataValues.total_balance);
		}
	} else {
		count = result;
	}

	return count;
};
const leaveDetailsMaster = async (leaveId, EMP_DATA) => {
	//console.log("EMP_DATA", EMP_DATA);
	const leaveData = await db.leaveCompanyMapping.findOne({
		where: {
			leaveAutoId: leaveId,
			companyId: EMP_DATA?.companyId,
			empType: {
				[Op.or]: [
					{ [Op.like]: `${EMP_DATA?.employeeType},%` },
					{ [Op.like]: `%,${EMP_DATA?.employeeType},%` },
					{ [Op.like]: `%,${EMP_DATA?.employeeType}` },
					{ [Op.eq]: `${EMP_DATA?.employeeType}` },
				],
			},
			isActive: 1,
		},
	});
	return leaveData;
};
const checkWeekOffOfEMPforData = async (weekoffId, Date) => {
	let lastDayDateAnotherFormat = moment(Date).format("DD-MM-YYYY");
	let parsedDate = moment(lastDayDateAnotherFormat, "DD-MM-YYYY");
	let dayCode = parseInt(moment(Date).format("d")) + 1;

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
	const weekoff = await db.weekOffMaster.findOne({
		where: {
			weekOffId: weekoffId,
		},
		include: [
			{
				model: db.weekOffDayMappingMaster,
				attributes: ["weekOffId"],
				required: false,
				where: occurrenceDayCondition,
			},
		],
	});
	return weekoff?.weekOffDayMappingMasters?.length;
};
const checkHolidayEMPforData = async (companyLocationId, Date) => {
	let lastDayDateAnotherFormat = moment(Date).format("YYYY-MM-DD");
	const holidayData = await db.holidayCompanyLocationConfiguration.findOne({
		attributes: ["holidayCompanyLocationConfigurationID"],
		where: {
			companyLocationId: companyLocationId,
			isActive: 1,
		},
		include: {
			model: db.holidayMaster,
			required: true,
			as: "holidayDetails",
			attributes: ["holidayName", "holidayDate"],
			where: {
				isActive: 1,
				holidayDate: lastDayDateAnotherFormat,
			},
		},
	});
	return holidayData;
};

const leaveCountForUserForMonth = async (
	UserId,
	date,
	leaveId,
	overAll = "OTHER",
	lastDate = null,
) => {
	let result = 0;
	console.log("overAll", overAll);
	if (overAll == "YES") {
		const fromMoment = moment(date).format("YYYY-MM-DD");
		const todayDate = moment(lastDate).format("YYYY-MM-DD"); // Today's date
		console.log("fromMoment", fromMoment, "todayDate", todayDate);

		result = await db.employeeLeaveTransactions.count({
			where: {
				employeeId: UserId,
				fromDate: {
					[Op.between]: [fromMoment, todayDate],
				},
				status: ["approved", "pending"],
			},
		});
	} else {
		const fromMoment = moment(date);
		const monthStart = fromMoment.clone().startOf("month").format("YYYY-MM-DD"); // Start of the month
		const monthEnd = fromMoment.clone().endOf("month").format("YYYY-MM-DD"); // End of the month
		result = await db.employeeLeaveTransactions.count({
			where: {
				employeeId: UserId,
				leaveAutoId: leaveId,
				fromDate: {
					[Op.between]: [monthStart, monthEnd],
				},
				status: ["approved", "pending"],
			},
		});
	}

	return result;
};

const creditCompoff = async (inputObject) => {
	try {
		let goAhead = true;
		let comp_off_hours = 0;
		let compofftype = inputObject.compofftype;
		let attendance_auto_id = inputObject.attendance_auto_id;
		let attendanceStartDate = inputObject.attendanceStartDate;
		let attendanceEndDate = inputObject.attendanceEndDate;
		let shiftStartTime = inputObject.shiftStartTime;
		let shiftEndTime = inputObject.shiftEndTime;
		let attendanceDate = inputObject.attendanceDate;

		let allowedTime = await timeDifference(
			`${attendanceStartDate} ${shiftStartTime}`,
			`${attendanceEndDate} ${shiftEndTime}`,
		);
		let empId = inputObject.empId;
		let holiday = inputObject.holiday;

		let weekoff = inputObject.weekoff;
		let working_hours = inputObject.working_hours;

		if (holiday.length > 0 && weekoff.length > 0) {
			compofftype = "Weekly Off/Holiday";
		} else if (holiday.length > 0 && weekoff.length == 0) {
			compofftype = "Holiday";
		} else if (holiday.length == 0 && weekoff.length > 0) {
			compofftype = "Weekly Off";
		}
		if (compofftype == "Week Day") {
			const timeWorkDuration = moment.duration(working_hours);

			// Calculate the total minutes
			const totaltimeWorkDuration =
				timeWorkDuration.hours() * 60 +
				timeWorkDuration.minutes() +
				timeWorkDuration.seconds() / 60;

			const alloweWorkingHours = moment.duration(allowedTime);

			// Calculate the total minutes
			const totalalloweWorkingHours =
				alloweWorkingHours.hours() * 60 +
				alloweWorkingHours.minutes() +
				alloweWorkingHours.seconds() / 60;

			if (totaltimeWorkDuration > totalalloweWorkingHours) {
				comp_off_hours = totaltimeWorkDuration - totalalloweWorkingHours;
			} else {
				goAhead = false;
			}
		} else {
			const timeWorkDuration = moment.duration(working_hours);

			// Calculate the total minutes
			const totaltimeWorkDuration =
				timeWorkDuration.hours() * 60 +
				timeWorkDuration.minutes() +
				timeWorkDuration.seconds() / 60;
			comp_off_hours = totaltimeWorkDuration;
		}

		if (goAhead) {
			let compOffPolicyData = await checkCompOffPolicyForUser(empId);
			const startOfMonth = moment(attendanceDate)
				.startOf("year")
				.format("YYYY-MM-DD HH:mm:ss");
			const endOfMonth = moment(attendanceDate)
				.month(0)
				.endOf("month")
				.format("YYYY-MM-DD HH:mm:ss");
			let totalCount = 0;

			const result = await db.comp_off_credit_history.findOne({
				attributes: [
					[
						db.Sequelize.fn("SUM", db.Sequelize.col("balance")),
						"total_balance",
					], // Sum of balance column
				],
				where: {
					employee_Id: empId,
					createdAt: {
						[Op.between]: [startOfMonth, endOfMonth],
					},
				},
			});
			if (result.dataValues.total_balance != null) {
				totalCount += parseFloat(result.dataValues.total_balance);
			}

			if (
				compOffPolicyData &&
				compOffPolicyData.per_month_comp_off_limit > totalCount
			) {
				const leaveData = await db.leaveMaster.findOne({
					where: {
						leaveId: 9,
						isActive: 1,
					},
				});
				console.log("leaveData", leaveData);
				let compoffCredit = null;
				let approvalRequired = null;
				let approvalIds = [];
				if (leaveData) {
					// Helper function to calculate compoffCredit
					const calculateCompOffCredit = (
						policyData,
						fullDayKey,
						halfDayKey,
						compOffHours,
						approvalRequiredKey,
						approvalRequiredIdsKey,
					) => {
						if (policyData[fullDayKey] <= compOffHours) {
							approvalRequired = policyData[approvalRequiredKey];
							if (approvalRequired) {
								approvalIds = policyData[approvalRequiredIdsKey].split(",");
							}
							return 1;
						} else if (policyData[halfDayKey] <= compOffHours) {
							approvalRequired = policyData[approvalRequiredKey];
							if (approvalRequired) {
								approvalIds = policyData[approvalRequiredIdsKey].split(",");
							}
							return 0.5;
						}
						return 0;
					};

					// Main logic

					switch (compofftype) {
						case "Week Day":
							if (compOffPolicyData.is_weekday_on) {
								compoffCredit = calculateCompOffCredit(
									compOffPolicyData,
									"minimum_duration_for_fullday_on_weekday",
									"minimum_duration_for_halfday_on_weekday",
									comp_off_hours,
									"require_approval_weekday",
									"approval_users_weekday",
								);
							}
							break;

						case "Weekly Off":
							if (compOffPolicyData.is_weekoff_on) {
								compoffCredit = calculateCompOffCredit(
									compOffPolicyData,
									"minimum_duration_for_fullday_on_weekoff",
									"minimum_duration_for_halfday_on_weekoff",
									comp_off_hours,
									"require_approval_weekoff",
									"approval_users_weekoff",
								);
							}
							break;

						case "Holiday":
							if (compOffPolicyData.is_holiday_on) {
								compoffCredit = calculateCompOffCredit(
									compOffPolicyData,
									"minimum_duration_for_fullday_on_holiday",
									"minimum_duration_for_halfday_on_holiday",
									comp_off_hours,
									"require_approval_holiday",
									"approval_users_holiday",
								);
							}
							break;

						case "Weekly Off/Holiday":
							if (compOffPolicyData.is_holiday_on) {
								// Only check Holiday if Weekly Off didn't give credit
								compoffCredit = calculateCompOffCredit(
									compOffPolicyData,
									"minimum_duration_for_fullday_on_holiday",
									"minimum_duration_for_halfday_on_holiday",
									comp_off_hours,
									"require_approval_holiday",
									"approval_users_holiday",
								);
								compofftype = "Holiday";
							}

							if (!compoffCredit && compOffPolicyData.is_weekoff_on) {
								compoffCredit = calculateCompOffCredit(
									compOffPolicyData,
									"minimum_duration_for_fullday_on_weekoff",
									"minimum_duration_for_halfday_on_weekoff",
									comp_off_hours,
									"require_approval_weekoff",
									"approval_users_weekoff",
								);
								compofftype = "Weekly Off";
							}

							break;
					}

					if (compoffCredit == 1 || compoffCredit == 0.5) {
						let comp_off_data = {
							employee_Id: empId,
							balance: compoffCredit,
							status: approvalRequired == 1 ? 3 : 1,
							credit_for: compofftype,
							expiry_date:
								leaveData?.lapse_in_days > 0
									? moment()
											.add(leaveData?.lapse_in_days, "days")
											.format("YYYY-MM-DD")
									: null,
							taken_on: null,
							createdBy: 1,
							planned_message: "",
							message: "",
							attendanceAutoIdHistory: attendance_auto_id,
							comp_off_polices_auto_id_history:
								compOffPolicyData?.comp_off_polices_auto_id,
							pending_at: "",
						};
						comp_off_data.message = "Auto Approved Comp Off Request";
						if (approvalRequired) {
							comp_off_data.message = "Auto Generated Request for Approval";
							let finalApprovalIds = [];
							for (const singleapprovalId of approvalIds) {
								if (singleapprovalId == "MANAGER") {
									let EMP_DATA = await getEmpProfile(empId); // L2 Manager
									finalApprovalIds.push(EMP_DATA?.managerData?.id);
								} else if (singleapprovalId == "ADMIN") {
									let admins = await db.employeeMaster.findAll({
										where: {
											role_id: 2,
											isActive: 1,
										},
										attributes: ["id"],
									});
									for (const singleAdmin of admins) {
										finalApprovalIds.push(singleAdmin?.id);
									}
								}
							}
							comp_off_data.pending_at = finalApprovalIds.join(",");
						}
						comp_off_hours = Math.round(comp_off_hours);
						const hrs = Math.floor(comp_off_hours / 60)
							.toString()
							.padStart(2, "0");
						const mins = (comp_off_hours % 60).toString().padStart(2, "0");
						const secs = "00"; // No additional seconds
						let time = `${hrs}:${mins}:${secs}`;

						comp_off_data.adjust_hours = time;
						comp_off_data.total_hours = time;

						// const records = Array(50).fill(null); // Create an array with 50 null placeholders
						// for (const [index] of records.entries()) {
						if (comp_off_data.balance === 1) {
							let comp_off_data_1 = { ...comp_off_data, balance: 0.5 };
							let comp_off_data_2 = { ...comp_off_data, balance: 0.5 };

							// Insert both objects into the database
							await db.comp_off_credit_history.create(comp_off_data_1);
							await db.comp_off_credit_history.create(comp_off_data_2);
						} else {
							await db.comp_off_credit_history.create(comp_off_data);
						}

						// }
					}
				}
			}
		}
	} catch (error) {}
};
const checkLeaveClupEMPforDate = async (Date, leaveID, EMP_DATA) => {
	const leaveClup = await db.leaveCompanyMapping.findOne({
		attributes: ["club_with"],
		where: {
			leaveAutoId: leaveID,
			companyId: EMP_DATA?.companyId,
			empType: {
				[Op.or]: [
					{ [Op.like]: `${EMP_DATA?.employeeType},%` },
					{ [Op.like]: `%,${EMP_DATA?.employeeType},%` },
					{ [Op.like]: `%,${EMP_DATA?.employeeType}` },
					{ [Op.eq]: `${EMP_DATA?.employeeType}` },
				],
			},
		},
	});

	let leaveids = leaveClup ? leaveClup.club_with.split(",") : [];
	leaveids.push(leaveID);

	const leaveData = await db.employeeLeaveTransactions.count({
		where: {
			appliedFor: Date,
			employeeId: EMP_DATA?.id,
			status: ["approved", "pending"],
			leaveAutoId: {
				[Op.notIn]: leaveids,
			},
		},
	});
	return leaveData;
};
const reportieesofEmp = async (empId) => {
	let empids = [];
	const existUsers = await db.employeeMaster.findAll({
		attributes: ["id"],
		where: {
			manager: empId,
			isActive: 1,
		},
	});
	for (const singleUser of existUsers) {
		empids.push(singleUser.id);
	}
	return empids;
};

const actionOnLeaveCompOff = async (
	employeeId,
	employeeLeaveTransactionsIds,
	status,
	remarks,
	userId,
) => {
	try {
		console.log({
			employeeId,
			employeeLeaveTransactionsIds,
			status,
			remarks,
			userId,
		});
		const getLeaveRequest = await db.EmployeeLeaveHeader.findOne({
			attributes: ["employeeId", "leaveAutoId", "leaveCount"],
			where: {
				employeeId: employeeId,
				leaveAutoId: 9,
				status: "approved",
			},
			raw: false,
		});
		console.log("getLeaveRequest");

		if (!getLeaveRequest) {
			return {
				data: 0,
			};
		}
		console.log("getLeaveRequest checked");

		const compOffHistory = await db.comp_off_credit_history.findAll({
			attributes: [
				"comp_off_credit_history_auto_id",
				"employee_Id",
				"balance",
				"expiry_date",
			],
			where: {
				employee_Id: employeeId,
				status: 1,
				expiry_date: {
					[Op.or]: [
						{ [Op.eq]: null },
						{ [Op.gt]: moment().format("YYYY-MM-DD") },
					],
				},
			},
			order: [["expiry_date", "ASC"]],
			raw: true,
		});
		console.log("compOffHistory list");

		if (compOffHistory.length === 0) {
			return {
				data: 0,
			};
		}
		console.log("compOffHistory checked");

		const totalBalance = compOffHistory.reduce(
			(sum, record) => sum + parseFloat(record.balance),
			0,
		);
		console.log("totalBalance");

		if (totalBalance < parseFloat(getLeaveRequest.leaveCount)) {
			return {
				data: 0,
			};
		}
		console.log("totalBalance checked");

		const appliedForData = await db.EmployeeLeaveHeader.findOne({
			where: { employeeleaveheaderID: employeeLeaveTransactionsIds },
			include: [
				{
					model: db.employeeLeaveTransactions,
					attributes: ["appliedFor", "leaveCount"],
					where: { leaveAutoId: 9 },
				},
			],
		});
		console.log("appliedForData");

		if (!appliedForData || !appliedForData.employeeleavetransactions) {
			return {
				data: 0,
			};
		}
		console.log("appliedForData checked");

		const appliedDates = appliedForData.employeeleavetransactions.map((e) => ({
			appliedFor: e.appliedFor,
			leaveCount: parseFloat(e.leaveCount),
		}));

		console.log("appliedDates");

		let leaveToDeduct = parseFloat(getLeaveRequest.leaveCount);
		console.log("appliedDates checked", appliedDates.length);

		for (const date of appliedDates) {
			let remainingForDate = date.leaveCount;

			while (remainingForDate > 0 && leaveToDeduct > 0) {
				const eligibleRecord = compOffHistory.find(
					(record) => parseFloat(record.balance) > 0,
				);
				if (!eligibleRecord) {
					console.log("No more eligible comp-off records to process.");
					break;
				}

				const availableBalance = parseFloat(eligibleRecord.balance);
				const deductionAmount = Math.min(
					availableBalance,
					remainingForDate,
					leaveToDeduct,
				);

				await db.comp_off_credit_history.update(
					{
						updatedBy: userId,
						approver_remark: remarks,
						taken_on: date.appliedFor,
						...(status === 1 && { status: 2 }),
					},
					{
						where: {
							comp_off_credit_history_auto_id:
								eligibleRecord.comp_off_credit_history_auto_id,
						},
					},
				);

				remainingForDate -= deductionAmount;
				leaveToDeduct -= deductionAmount;
				eligibleRecord.balance = availableBalance - deductionAmount;
			}
		}

		return {
			data: 1,
		};
	} catch (error) {
		return {
			data: 0,
		};
	}
};

const leaveCreditMonthCron = async () => {
	const transaction = await db.sequelize.transaction();
	try {
		const getMappedLeave = await db.leaveMapping.findAll({
			attributes: ["EmployeeId", "leaveAutoId"],
			where: { isActive: 1 },
			include: [
				{
					model: db.employeeMaster,
					attributes: ["companyId"],
					where: {
						isActive: 1,
						companyId: { [Op.ne]: null },
					},
				},
			],
			raw: false,
		});
		for (const employee of getMappedLeave) {
			const getIncrementValue = await db.leaveCompanyMapping.findOne({
				where: {
					companyId: employee["employee.companyId"],
					leaveAutoId: employee.leaveAutoId,
					iterationDistribution: { [Op.ne]: parseFloat(0) },
					creditDayOfMonth: moment().format("D"),
				},
				transaction,
			});

			if (getIncrementValue) {
				await db.leaveMapping.increment(
					{
						availableLeave: getIncrementValue.iterationDistribution,
						accruedThisYear: getIncrementValue.iterationDistribution,
					},
					{
						where: {
							leaveAutoId: employee.leaveAutoId,
							EmployeeId: employee.EmployeeId,
						},
						transaction,
					},
				);
			} else {
				console.log("No iteration distribution found for", employee.EmployeeId);
			}
		}

		await transaction.commit();

		return {
			data: 1,
		};
	} catch (error) {
		// Rollback the transaction in case of an error
		await transaction.rollback();
		console.error("Error during leave credit update:", error);
		return {
			data: 0,
		};
	}
};
///COMPOFF

export default {
	generateJwtToken,
	checkFolder,
	checkActiveUser,
	fileUpload,
	mailService,
	timeDifference,
	calculateLateBy,
	calculateTime,
	calculateAverageHours,
	generateRandomPassword,
	encryptPassword,
	getEmpProfile,
	empLeaveDetails,
	empMarkLeaveOfGivenDate,
	remainingLeaveCount,
	getCombineValue,
	timeDifferenceNew,
	isDayWorking,
	ip,
	generateOTP,
	generateJwtOTPEncrypt,
	generateJwtOTPDecrypt,
	isDayWorkingForReport,
	generateSHA512Hash,
	compareImages,
	//CONFIRMAITON
	generateFieldsForgivenLevel,
	getSigningAuthorityDate,
	//CONFIRMAITON
	convertExcelDate,
	//CONFIRMAITON,
	//COMPOFF
	checkCompOffPolicyForUser,
	compOffbalabceForUser,
	leaveDetailsMaster,
	checkWeekOffOfEMPforData,
	checkHolidayEMPforData,
	leaveCountForUserForMonth,
	creditCompoff,
	checkLeaveClupEMPforDate,
	reportieesofEmp,
	actionOnLeaveCompOff,
	leaveCreditMonthCron,
	//COMPOFF
};
