/* eslint-disable no-undef */
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import moment from "moment";
import db from "../config/db.config.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import eventEmitter from "../services/eventService.js";
import crypto from "crypto";
import axios from "axios";
import https from "https";
import pushNotificationEmitter from "../services/pushNotificationEventService.js"; // New
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
const savePdfFile = (buffer, fileName, folderPath) => {
	// Ensure directory exists
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	const filePath = path.join(folderPath, fileName);

	// Write the PDF buffer to file
	fs.writeFileSync(filePath, buffer);

	return filePath;
};

const checkFolder = async () => {
	const folder = ["uploads", "uploads/temp", "config"];
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
		include: [
			{
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
			{
				model: db.roleMaster,
				attributes: ["name"],
			},
			{
				model: db.companyMaster,
				attributes: ["companyName", "senderEmail", "companyLogo"],
			},
		],
	});
	return existUser;
};

const mailService = async (data) => {
	try {
		const testMail = parseInt(process.env.TEST_MAIL);
		const testMailIDs = process.env.TEST_MAIL_ID.split(",");
		// console.log("data.to", data.to,data.attachments.length);
		const payload = Object.assign({
			appName: process.env.SENDER_NAME,
			to: testMail ? testMailIDs : data.to.split(","),
			from: data.senderEmail,
			subject: data.subject,
			text: data.text,
			bcc: testMail ? [] : data.bcc ? data.bcc : [],
			time: data.time ? data.time : "",
			html: data.html,
			cc: testMail ? [] : data.cc ? data.cc.split(",") : [],
			attachments:
				data.attachments && data.attachments.length > 0 ? data.attachments : [],
		});

		const response = await axios.post(
			`${process.env.CENTRAL_MAIL_API}/sendMail`,
			payload,
			{
				headers: {
					"x-access-token": process.env.CENTRAL_MAIL_SECRET_KEY,
					"Content-Type": "application/json",
				},
			},
		);

		console.log(`${response.data.message} -->> ${data.to}`);
	} catch (error) {
		console.log(error);
	}
};

const smsService = async (data) => {
	const testMobile = parseInt(process.env.TEST_MAIL);
	const testMobileNumbers = testMobile
		? process.env.TEST_MOBILE_NUMBER.split(",")
		: data.mobile;

	const axiosInstance = axios.create({
		httpsAgent: new https.Agent({
			rejectUnauthorized: false,
		}),
	});

	axiosInstance
		.post(
			`${process.env.CENTRAL_MAIL_API}/process`,
			{
				template_code: data.template,
				template_customer_number: testMobileNumbers,
				template_id: data.templateId,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"x-access-token": process.env.CENTRAL_MAIL_SECRET_KEY,
					source: "TARA",
				},
			},
		)
		.then((response) => {
			console.log(`SMS Sent -->> ${data.mobile}`);
			return true;
		})
		.catch((error) => {
			console.log("Error ->", error);
			return false;
		});
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
	// console.log("start", start);
	// console.log("end", end);
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
		// console.log(
		// 	"combinedLastDayTime",
		// 	combinedLastDayTime.format("YYYY-MM-DD HH:mm:ss"),
		// );
		// console.log(
		// 	"combinedCurrentTime",
		// 	combinedCurrentTime.format("YYYY-MM-DD HH:mm:ss"),
		// );

		if (combinedCurrentTime.isAfter(combinedLastDayTime)) {
			let diffMs = combinedCurrentTime.diff(combinedLastDayTime);
			let totalSeconds = Math.floor(diffMs / 1000);

			let hours = Math.floor(totalSeconds / 3600);
			let minutes = Math.floor((totalSeconds % 3600) / 60);
			let seconds = totalSeconds % 60;

			// Manually string bana rahe
			const pad = (n) => n.toString().padStart(2, "0");
			return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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
				attributes: [
					"companyId",
					"companyName",
					"companyCode",
					"senderEmail",
					"companyLogo",
					"letterFooter",
					"letterHeader",
					"addCCEmailForWishesAndConfirmation",
				],
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
				attributes: ["id", "name", "profileImage", "email", "manager"],
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
		let EMP_DATA = await getEmpProfile(userId);
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
			where: {
				EmployeeId: userId,
				status: "pending",
				leaveAutoId: 6,
				source: {
					[Op.ne]: "system_generated",
				},
			},
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
				source: {
					[Op.ne]: "system_generated",
				},
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
				{
					model: db.leaveCompanyMapping,
					as: "leaveCompanyDetails",
					where: {
						companyId: 1,
					},
				},
			],
		});

		// Check if leaveData is an array and process each item
		for (const item of leaveData) {
			let adddon = [];
			let policy = [];

			const leaveMasterData = await leaveDetailsMaster(
				item.leaveAutoId,
				EMP_DATA,
			);
			if (leaveMasterData) {
				if (leaveMasterData?.countInterveningWeekOff == 1) {
					policy.push({ KEY: "Week offs", DATA: `within leave are counted` });
				}
				if (leaveMasterData?.countInterveningHoliday == 1) {
					policy.push({ KEY: "Holiday", DATA: `within leave are counted` });
				}
				if (leaveMasterData?.countInterveningNationalHoliday == 1) {
					policy.push({
						KEY: "National Holiday",
						DATA: `within leave are counted`,
					});
				}
			}
			//console.log("item ", item);

			if (item.leaveCompanyDetails.display_all == 0) {
				//	console.log("displa ");
				item.dataValues.is_active_for_display =
					item.leaveCompanyDetails.display_all;
			}

			if (item.leaveAutoId === 6 && item.leavemaster) {
				item.leavemaster.dataValues.countApproved = totalLeaveCountApproved;
				item.leavemaster.dataValues.countPending = totalLeaveCountPending;
				item.leavemaster.dataValues.countSystemDeducting =
					totalLeaveCountSystemDeducting;
				item.dataValues.totalPendingLeaveCount = countPendingLeave;
			}
			if (item.leaveAutoId === 9 && item.leavemaster) {
				let count = await this.compOffbalabceForUser(userId);
				item.dataValues.availableLeave = count;
			} else if (item.leaveAutoId === 3 && item.leavemaster) {
				let leaveCount = await db.EmployeeLeaveHeader.count({
					where: {
						status: { [Op.in]: ["pending", "approved"] },
						employeeId: userId,
						leaveAutoId: 3,
					},
				});

				adddon = [
					{ KEY: "Subcategory", DATA: `Child ${leaveCount + 1}` },
					{
						KEY: "Total Application Allowed",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount}`,
					},
					{
						KEY: "Remaining  Application",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount - leaveCount}`,
					},
				];
			} else if (item.leaveAutoId === 4 && item.leavemaster) {
				let leaveCount = await db.EmployeeLeaveHeader.count({
					where: {
						status: { [Op.in]: ["pending", "approved"] },
						employeeId: userId,
						leaveAutoId: 4,
					},
				});

				adddon = [
					{
						KEY: "Total Application Allowed",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount}`,
					},
					{
						KEY: "Remaining  Application",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount - leaveCount}`,
					},
				];
			} else if (item.leaveAutoId === 5 && item.leavemaster) {
				let leaveCount = await db.EmployeeLeaveHeader.count({
					where: {
						status: { [Op.in]: ["pending", "approved"] },
						employeeId: userId,
						leaveAutoId: 5,
					},
				});

				adddon = [
					{
						KEY: "Total Application Allowed",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount}`,
					},
					{
						KEY: "Remaining  Application",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount - leaveCount}`,
					},
				];
			} else if (item.leaveAutoId === 7 && item.leavemaster) {
				let leaveCount = await db.EmployeeLeaveHeader.count({
					where: {
						status: { [Op.in]: ["pending", "approved"] },
						employeeId: userId,
						leaveAutoId: 7,
					},
				});

				adddon = [
					{
						KEY: "Total Application Allowed",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount}`,
					},
					{
						KEY: "Remaining  Application",
						DATA: `${item?.dataValues?.leaveCompanyDetails?.tenureCount - leaveCount}`,
					},
				];
			} else {
				item.dataValues.totalPendingLeaveCount = countPendingLeave;
			}

			if (item.leaveAutoId && item.leavemaster) {
				item.dataValues.addOn = [...policy, ...adddon];
			}
		}
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
		// console.log("leaveData from this");
		// If leaveData is an object, handle it directly
		if (leaveData && leaveData.leaveAutoId == 9 && leaveData) {
			// console.log("leaveData from inside");
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
			status: ["approved", "pending"],
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
		let leaveTrails = {
			employeeId: inputData.employeeId,
			leaveHeaderAutoId: inputData.employeeleaveheaderID,
			level: 1,
			approvalFlowAutoId: 1,
			isVisible: inputData.status == "approved" ? 0 : 1,
			pendingOn: inputData.pendingAt,
			isApproved: inputData.status == "approved" ? 1 : 0,
			isPending: inputData.status == "approved" ? 0 : 1,
			isActive: 1,
			createdAt: moment(),
			createdBy: inputData.createdBy,
		};

		await db.leaveApprovalTrails.create(leaveTrails);
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
					model: db.companyMaster,
					attributes: ["senderEmail", "companyLogo"],
				},
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
				senderEmail: leaveDeductionData["companymaster.senderEmail"],
				companyLogo: leaveDeductionData["companymaster.companyLogo"],
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
	companyId,
	leaveAutoId,
	EMP_DATA,
	isForce=0
) {
	console.log("isForce remainingLeaveCount",isForce)
	const daysDifferenceReq = moment(endDate).diff(moment(startDate), "days");
	var workingCount = 0;
	let total_working_dates = [];
	let countInterveningWeekOff = await db.leaveCompanyMapping.findOne({
		attributes: [
			"countInterveningWeekOff",
			"countInterveningHoliday",
			"countInterveningNationalHoliday",
		],
		where: { companyId: companyId || 0, leaveAutoId: leaveAutoId || 0 },
	});
	const shouldCountWeekOffs =
		countInterveningWeekOff?.countInterveningWeekOff === 1;
	const shouldCountHolidays =
		countInterveningWeekOff?.countInterveningHoliday === 1;
	const shouldCountNationalHolidays =
		countInterveningWeekOff?.countInterveningNationalHoliday === 1;

	const leaveMasterData = await leaveDetailsMaster(leaveAutoId, EMP_DATA);

	if (leaveMasterData.is_application_on_holiday_weekly_off == 1) {
		if (leaveMasterData.weekly_prefix_policy == 0) {
			let prefixDate = moment(startDate)
				.subtract(1, "day")
				.format("YYYY-MM-DD");

			let checkWeekOff = await checkWeekOffOfEMPforData(
				EMP_DATA?.weekOffId,
				prefixDate,
			);
			if (checkWeekOff > 0) {
				if (!total_working_dates.includes(prefixDate)) {
					total_working_dates.push(prefixDate);
					workingCount += 1;
				}
			}
		}
		if (leaveMasterData.holiday_prefix_policy == 0) {
			let prefixDate = moment(startDate)
				.subtract(1, "day")
				.format("YYYY-MM-DD");

			let leaveCheck = await checkHolidayEMPforData(
				EMP_DATA?.companyLocationId,
				prefixDate,
			);
			if (leaveCheck) {
				if (!total_working_dates.includes(prefixDate)) {
					total_working_dates.push(prefixDate);
					workingCount += 1;
				}
			}
		}
	}

	//console.log("total_working_dates",total_working_dates)

	//console.log("========= daysDifferenceReq", daysDifferenceReq);
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
		let isNationalHoliday =
			employeeHolidays?.holidayDetails?.isNationalHoliday ?? null;
		//console.log("employeeHolidays", employeeHolidays ? "yes" : "no");
		console.log("appliedFor", appliedFor, "day", i,"week offf",existEmployees.weekOffDayMappingMasters.length,"daysDifferenceReq",daysDifferenceReq);
		if (daysDifferenceReq == 0) {
			if(isForce==0){ // adding force leave application
if (
				existEmployees.weekOffDayMappingMasters.length == 0 &&
				!employeeHolidays
			) {
				if (!total_working_dates.includes(appliedFor)) {
					total_working_dates.push(appliedFor);
					workingCount += 1;
				}
			}
			}else{ 
				if (!total_working_dates.includes(appliedFor)) {
					total_working_dates.push(appliedFor);
					workingCount += 1;
				}
			}
			
			// console.log("single daya");
		} else {
			if (i == 0 || i == daysDifferenceReq) {
				// console.log("first and last");
			if(isForce==0){ // adding force leave application
				if (
					existEmployees.weekOffDayMappingMasters.length == 0 &&
					!employeeHolidays
				) {
					if (!total_working_dates.includes(appliedFor)) {
						total_working_dates.push(appliedFor);
						workingCount += 1;
					}
				}
			}else{
				if (!total_working_dates.includes(appliedFor)) {
				total_working_dates.push(appliedFor);
				workingCount += 1;
				}
			}
			} else {
				if(isForce==0){  // adding force leave application

				
				if (
					shouldCountWeekOffs &&
					existEmployees.weekOffDayMappingMasters.length > 0
				) {
					if (!total_working_dates.includes(appliedFor)) {
						total_working_dates.push(appliedFor);
						workingCount += 1;
					}
				} else if (
					isNationalHoliday == 1 &&
					shouldCountNationalHolidays == true &&
					employeeHolidays
				) {
					if (!total_working_dates.includes(appliedFor)) {
						total_working_dates.push(appliedFor);
						workingCount += 1;
					}
				} else if (
					isNationalHoliday == 0 &&
					shouldCountHolidays == true &&
					employeeHolidays
				) {
					if (!total_working_dates.includes(appliedFor)) {
						total_working_dates.push(appliedFor);
						workingCount += 1;
					}
				} else if (
					!employeeHolidays &&
					existEmployees.weekOffDayMappingMasters.length == 0
				) {
					if (!total_working_dates.includes(appliedFor)) {
						total_working_dates.push(appliedFor);
						workingCount += 1;
					}
				}

			}else{
			if (!total_working_dates.includes(appliedFor)) {
			total_working_dates.push(appliedFor);
			workingCount += 1;
			}
			}
			}
		}
		// console.log("============");
	}

	if (leaveMasterData.is_application_on_holiday_weekly_off == 1) {
		if (leaveMasterData.holiday_suffix_policy == 0) {
			let subfixDate = moment(endDate).add(1, "day").format("YYYY-MM-DD");

			let leaveCheck = await checkHolidayEMPforData(
				EMP_DATA?.companyLocationId,
				subfixDate,
			);
			if (leaveCheck) {
				if (!total_working_dates.includes(subfixDate)) {
					total_working_dates.push(subfixDate);
					workingCount += 1;
				}
			}
		}
		if (leaveMasterData.weekly_suffix_policy == 0) {
			let subfixDate = moment(endDate).add(1, "day").format("YYYY-MM-DD");
			let checkWeekOff = await checkWeekOffOfEMPforData(
				EMP_DATA?.weekOffId,
				subfixDate,
			);
			if (checkWeekOff > 0) {
				if (!total_working_dates.includes(subfixDate)) {
					total_working_dates.push(subfixDate);
					workingCount += 1;
				}
			}
		}
	}
	console.log("total_working_dates",total_working_dates)
	return total_working_dates;
};

const isDayWorking = async function (startDate, weekOffId, companyLocationId) {
	let appliedFor = moment(startDate).add(0, "days").format("YYYY-MM-DD");
	//console.log("appliedFor", appliedFor);
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
	//console.log("workingCountworkingCount", workingCount);
	return workingCount;
};

const isDayWorkingForReport = async function (
	startDate,
	weekOffId,
	companyLocationId,
) {
	let appliedFor = moment(startDate).add(0, "days").format("YYYY-MM-DD");
	//console.log("appliedFor", appliedFor);

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
				//console.log("Images are identical");
				return true;
			} else {
				//console.log("Images are different");
				return false;
			}
		}
	} catch (error) {
		console.error("Error comparing images:", error);
		return false;
	}
};
///CONFIRMATION

const generateFieldsForgivenLevel = async function (
	policyId,
	inputLevel,
	companyId,
) {
	//console.log("inputLevel", inputLevel);
	let levelData = null;
	let level = inputLevel;
	let levelFound = false;
	levelData = await db.Confirmationpolicyworkflow.findOne({
		where: {
			confimationPolicyAutoId: policyId,
			isEnable: 1,
			level: level,
			companyId: {
				[Op.or]: [
					{ [Op.like]: `${companyId},%` },
					{ [Op.like]: `%,${companyId},%` },
					{ [Op.like]: `%,${companyId}` },
					{ [Op.eq]: `${companyId}` },
				],
			},
		},
	});
	if (!levelData) {
		level++;
		levelData = await db.Confirmationpolicyworkflow.findOne({
			where: {
				confimationPolicyAutoId: policyId,
				isEnable: 1,
				level: level,
				companyId: {
					[Op.or]: [
						{ [Op.like]: `${companyId},%` },
						{ [Op.like]: `%,${companyId},%` },
						{ [Op.like]: `%,${companyId}` },
						{ [Op.eq]: `${companyId}` },
					],
				},
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
				companyId: {
					[Op.or]: [
						{ [Op.like]: `${companyId},%` },
						{ [Op.like]: `%,${companyId},%` },
						{ [Op.like]: `%,${companyId}` },
						{ [Op.eq]: `${companyId}` },
					],
				},
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
				companyId: {
					[Op.or]: [
						{ [Op.like]: `${companyId},%` },
						{ [Op.like]: `%,${companyId},%` },
						{ [Op.like]: `%,${companyId}` },
						{ [Op.eq]: `${companyId}` },
					],
				},
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
		EMP_TYPE: "employeeType",
	};

	const compOffAissgments = await db.comp_off_assignment.findAll({
		include: {
			model: db.comp_off_assignment_filters,
		},
	});
	var compOffPolicyAssignment = {};
	for (const single of compOffAissgments) {
		var whereCondition = {
			isActive: 1,
		};

		var whereConditionJobdetails = {};
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
		// console.log("================= start", single?.comp_off_assignment_auto_id);
		// console.log("whereCondition", whereCondition);
		// console.log("whereConditionJobdetails", whereConditionJobdetails);

		// console.log("================= end", single?.comp_off_assignment_auto_id);
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
		// console.log(
		// 	"employee",
		// 	employee ? "yes" : "NO",
		// 	" ==== single?.comp_off_assignment_auto_id",
		// 	single?.comp_off_assignment_auto_id,
		// );
		if (employee) {
			if (employee.id in compOffPolicyAssignment) {
				compOffPolicyAssignment[employee.id] =
					single.comp_off_assignment_auto_id;
			} else {
				// console.log(
				// 	"employee?.id 1",
				// 	employee?.id,
				// 	"compOffPolicyAssignment",
				// 	compOffPolicyAssignment,
				// );
				compOffPolicyAssignment[employee.id] =
					single.comp_off_assignment_auto_id;
				// console.log(
				// 	"employee?.id 2",
				// 	employee?.id,
				// 	"compOffPolicyAssignment",
				// 	compOffPolicyAssignment,
				// );
			}
		}
	}
	// console.log("compOffPolicyAssignment", compOffPolicyAssignment);
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
			group: ["credit_for_date", "employee_Id"],
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
		include: {
			model: db.leaveMaster,
			attributes: ["leaveId", "leaveName"],
			as: "companyleaveMasterDetails",
			where: {
				isActive: 1,
			},
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
	if (overAll == "YES") {
		const fromMoment = moment(date).format("YYYY-MM-DD");
		const todayDate = moment(lastDate).format("YYYY-MM-DD"); // Today's date
		//console.log("fromMoment", fromMoment, "todayDate", todayDate);

		result = await db.employeeLeaveTransactions.sum("leaveCount", {
			where: {
				employeeId: UserId,
				// fromDate: {
				// [Op.between]: [monthStart, monthEnd],
				// },
				status: {
					[Op.in]: ["approved", "pending"], // ✅ Fix status condition
				},
			},
		});
	} else {
		// console.log("date", date);
		// console.log("lastDate", lastDate);
		// console.log("UserId", UserId);
		// console.log("leaveId", leaveId);

		const monthStart = moment(date).format("YYYY-MM-DD");
		const monthEnd = moment(lastDate).format("YYYY-MM-DD"); // Today's date

		let leaves = await db.employeeLeaveTransactions.sum("leaveCount", {
			where: {
				employeeId: UserId,
				leaveAutoId: leaveId,
				appliedFor: {
					[Op.between]: [monthStart, monthEnd],
				},
				status: {
					[Op.in]: ["approved", "pending"], // ✅ Fix status condition
				},
			},
		});
		// console.log("leaves", leaves);
		result = leaves || 0;
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
		// console.log("goAhead", goAhead);

		if (goAhead) {
			let compOffPolicyData = await checkCompOffPolicyForUser(empId);
			// console.log("compOffPolicyData", compOffPolicyData);
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

			let creditCompGo = false;

			if (compOffPolicyData) {
				if (compOffPolicyData.per_month_comp_off_limit == 0) {
					creditCompGo = true;
				} else {
					if (compOffPolicyData.per_month_comp_off_limit > totalCount) {
						creditCompGo = true;
					}
				}
				if (creditCompGo) {
					const leaveData = await db.leaveMaster.findOne({
						where: {
							leaveId: 9,
							isActive: 1,
						},
					});
					//console.log("leaveData", leaveData);
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
							if (
								policyData[fullDayKey] != 0 &&
								policyData[fullDayKey] <= compOffHours
							) {
								approvalRequired = policyData[approvalRequiredKey];
								if (approvalRequired) {
									approvalIds = policyData[approvalRequiredIdsKey].split(",");
								}
								return 1;
							} else if (
								policyData[halfDayKey] != 0 &&
								policyData[halfDayKey] <= compOffHours
							) {
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
								credit_for_date: attendanceDate,
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
							const compOffCount = await db.comp_off_credit_history.findAll({
								where: {
									employee_Id: comp_off_data.employee_Id,
									credit_for_date: comp_off_data.credit_for_date,
								},
							});

							if (comp_off_data.balance === 1) {
								let comp_off_data_1 = { ...comp_off_data, balance: 0.5 };
								let comp_off_data_2 = { ...comp_off_data, balance: 0.5 };

								if (compOffCount.length == 0) {
									// Insert both objects into the database
									await db.comp_off_credit_history.create(comp_off_data_1);
									await db.comp_off_credit_history.create(comp_off_data_2);
								} else if (compOffCount.length == 1) {
									await db.comp_off_credit_history.create(comp_off_data_2);
								}
							} else {
								if (compOffCount.length == 0) {
									await db.comp_off_credit_history.create(comp_off_data);
								}
							}
							if (comp_off_data.pending_at != null) {
								let EMP_DATA_SELF = await getEmpProfile(
									comp_off_data.employee_Id,
								); // SELF Manager

								const obj = {
									email: EMP_DATA_SELF.email,
									companyLogo: EMP_DATA_SELF.companymaster.companyLogo,
									senderEmail: EMP_DATA_SELF.companymaster.senderEmail,
									requesterName: EMP_DATA_SELF.name,
									managerName: EMP_DATA_SELF.managerData.name,
									compOffDate: comp_off_data.credit_for_date,
								};
								//Added push notification on comp off approval , earlier only mail was working as notification
								pushNotificationEmitter.emit("sendNotification", {
									title: "Comp Off Request",
									body: `Comp Off request raised for ${EMP_DATA_SELF.name}`,
									employeeId: EMP_DATA_SELF.managerData.id,
								});
								eventEmitter.emit("compOffMail", JSON.stringify(obj));
							}

							// }
						}
					}
				}
			}
		}
	} catch (error) {
		console.log(error);
	}
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
		// console.log({
		// 	employeeId,
		// 	employeeLeaveTransactionsIds,
		// 	status,
		// 	remarks,
		// 	userId,
		// });
		const getLeaveRequest = await db.EmployeeLeaveHeader.findOne({
			attributes: ["employeeId", "leaveAutoId", "leaveCount"],
			where: {
				employeeId: employeeId,
				leaveAutoId: 9,
				status: "approved",
				employeeleaveheaderID: employeeLeaveTransactionsIds,
			},
			raw: false,
		});
		//console.log("getLeaveRequest");

		if (!getLeaveRequest) {
			return {
				data: 0,
			};
		}
		//console.log("getLeaveRequest checked");

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
		//console.log("compOffHistory list");

		if (compOffHistory.length === 0) {
			return {
				data: 0,
			};
		}
		//console.log("compOffHistory checked");

		const totalBalance = compOffHistory.reduce(
			(sum, record) => sum + parseFloat(record.balance),
			0,
		);
		//console.log("totalBalance");

		if (totalBalance < parseFloat(getLeaveRequest.leaveCount)) {
			return {
				data: 0,
			};
		}
		//console.log("totalBalance checked");

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
		//console.log("appliedForData");

		if (!appliedForData || !appliedForData.employeeleavetransactions) {
			return {
				data: 0,
			};
		}
		//console.log("appliedForData checked");

		const appliedDates = appliedForData.employeeleavetransactions.map((e) => ({
			appliedFor: e.appliedFor,
			leaveCount: parseFloat(e.leaveCount),
		}));

		//console.log("appliedDates");

		let leaveToDeduct = parseFloat(getLeaveRequest.leaveCount);
		//console.log("appliedDates checked", appliedDates.length);

		for (const date of appliedDates) {
			let remainingForDate = date.leaveCount;

			while (remainingForDate > 0 && leaveToDeduct > 0) {
				const eligibleRecord = compOffHistory.find(
					(record) => parseFloat(record.balance) > 0,
				);
				if (!eligibleRecord) {
					//console.log("No more eligible comp-off records to process.");
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
		console.log(error);
		return {
			data: 0,
		};
	}
};

const leaveCreditMonthCron = async () => {
	try {
		// console.log("run leave credit");
		const today = moment();
		const firstDayOfMonth = today.clone().startOf("month").format("D");
		const currentDay = today.clone().format("D");

		const startOfLastMonth = today
			.subtract(1, "months")
			.startOf("month")
			.format("YYYY-MM-DD");

		// Get the last day of the last month
		const endOfLastMonth = moment(startOfLastMonth)
			.endOf("month")
			.format("YYYY-MM-DD");

		let leaves = [];
		let effectedEmpS = [];
		// console.log("currentDay", currentDay);
		// console.log("firstDayOfMonth", firstDayOfMonth);
		if (currentDay == firstDayOfMonth) {
			leaves = await db.leaveCompanyMapping.findAll({
				where: {
					iterationDistribution: { [Op.ne]: parseFloat(0) },
					creditOnAccuralBasis: 1,
					isActive: 1,
				},
			});
			// console.log("leaves", leaves.length);
			for (const singleLeaves of leaves) {
				effectedEmpS = await db.employeeMaster.findAll({
					attributes: ["id", "empCode"],
					include: [
						{
							model: db.jobDetails,
							required: true,
							attributes: [
								"dateOfJoining",
								"dateOfProbationEnd",
								"confirmationDate",
								"confirmationGenerated",
								"noticePeriodStatus",
							],
						},
					],
					where: {
						isActive: 1,
						companyId: singleLeaves.companyId,
						employeeType: singleLeaves.empType.split(","),
					},
				});

				for (const singleeffectedEmp of effectedEmpS) {
					// console.log("singleLeaves.leaveAutoId", singleLeaves.leaveAutoId);
					let leaveCount = 0;
					let dateOfJoining = singleeffectedEmp.employeejobdetail.dateOfJoining;
					if (singleLeaves.creditOn == 0) {
						leaveCount = singleLeaves.iterationDistribution;
					} else {
						const isWithinLastMonth = moment(dateOfJoining).isBetween(
							startOfLastMonth,
							endOfLastMonth,
							null,
							"[]",
						);
						if (isWithinLastMonth) {
							const firstDate = moment(dateOfJoining)
								.startOf("month")
								.format("YYYY-MM-DD"); // "01"
							const midDate = moment(dateOfJoining)
								.date(15)
								.format("YYYY-MM-DD");
							const joiningDate = moment(dateOfJoining, "YYYY-MM-DD");
							const isJoinedEarly = joiningDate.isBetween(
								firstDate,
								midDate,
								null,
								"[]",
							);

							if (!isJoinedEarly && singleLeaves?.creditHalfAfter15Day == 1) {
								leaveCount = singleLeaves.iterationDistribution / 2;
							} else {
								leaveCount = singleLeaves.iterationDistribution;
							}
						} else {
							leaveCount = singleLeaves.iterationDistribution;
						}
					}
					await db.leavemanager.create({
						EmployeeId: singleeffectedEmp.id,
						leaveAutoId: singleLeaves.leaveAutoId,
						leaveCount: leaveCount,
						transaction_for: "CREDIT",
						createdBy: 1,
					});
					await db.leaveMapping.increment(
						{
							availableLeave: leaveCount,
							accruedThisYear: leaveCount,
						},
						{
							where: {
								EmployeeId: singleeffectedEmp.id,
								leaveAutoId: singleLeaves.leaveAutoId,
							},
						},
					);
				}
			}
		}
	} catch (error) {
		console.log("error", error);
	}
};
const leaveLapse = async () => {
	try {
		const today = moment("2025-01-01"); // Replace with any date
		const isFirstDayOfYear = today.isSame(today.clone().startOf("year"), "day");
		if (isFirstDayOfYear) {
			let leaves = [];
			let effectedEmpS = [];

			leaves = await db.leaveCompanyMapping.findAll({
				where: {
					isActive: 1,
				},
			});

			for (const singleLeaves of leaves) {
				effectedEmpS = await db.employeeMaster.findAll({
					attributes: ["id", "empCode"],
					where: {
						isActive: 1,
						companyId: singleLeaves.companyId,
						empCode: ["15543"],
						employeeType: singleLeaves.empType.split(","),
					},
				});

				for (const singleeffectedEmp of effectedEmpS) {
					const leaveRecordOfuserForLeave = await db.leaveMapping.findOne({
						where: {
							EmployeeId: singleeffectedEmp.id,
							leaveAutoId: singleLeaves.leaveAutoId,
						},
					});

					if (leaveRecordOfuserForLeave) {
						if (
							singleLeaves?.canCarryForwardAhead == 1 &&
							singleLeaves?.tenureCount == 0
						) {
							await leaveRecordOfuserForLeave.update({
								availableLeave: leaveRecordOfuserForLeave?.availableLeave,
								accruedThisYear: 0,
								creditedFromLastYear: leaveRecordOfuserForLeave?.availableLeave,
								utilizedThisYear: 0,
							});
						} else if (
							singleLeaves?.canCarryForwardAhead == 0 &&
							singleLeaves?.tenureCount == 0
						) {
							if (leaveRecordOfuserForLeave?.availableLeave > 0) {
								await db.leavemanager.create({
									EmployeeId: singleeffectedEmp.id,
									leaveAutoId: singleLeaves.leaveAutoId,
									leaveCount: leaveRecordOfuserForLeave?.availableLeave,
									transaction_for: "LAPES",
									createdBy: 1,
								});
							}

							await leaveRecordOfuserForLeave.update({
								availableLeave: 0,
								accruedThisYear: 0,
								creditedFromLastYear: 0,
								utilizedThisYear: 0,
							});
						} else {
							await leaveRecordOfuserForLeave.update({
								accruedThisYear: 0,
								creditedFromLastYear: 0,
								utilizedThisYear: 0,
							});
						}
					}
				}
			}
		}
	} catch (error) {
		console.log("error", error);
	}
};
///COMPOFF

//LEAVE ASSIGNMENT
const leaveAssignEmployeeToAll = async (empIdsInput) => {
	try {
		let empIds = empIdsInput.split(",");
		// console.log("empIds", empIds);
		const employees = await db.employeeMaster.findAll({
			attributes: ["id", "empCode", "employeeType", "companyId"],
			where: {
				isActive: 1,
				id: empIds,
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
				{
					model: db.jobDetails,
					attributes: ["jobId", "dateOfJoining", "confirmationDate"],
					where: { dateOfJoining: { [Op.ne]: null } },
					required: true,
				},
			],
		});

		// console.log("employees", employees.length);
		for (const employee of employees) {
			const { gender, maritalStatus } =
				employee.dataValues.employeebiographicaldetail;
			const leaveCompanyMappings =
				employee.dataValues.companymaster?.leavecompanymappings || [];
			const leaveAutoIds = leaveCompanyMappings.map(
				(mapping) => mapping.leaveAutoId,
			);
			const genderNumber = gender === "Male" ? 1 : gender === "Female" ? 2 : 3;
			const companyId = employee.dataValues.companyId;
			const employeeId = employee.dataValues.id;
			const dateOfJoining =
				employee.dataValues.employeejobdetail?.dateOfJoining;
			const confirmationDate =
				employee.dataValues.employeejobdetail?.confirmationDate;

			const leaveMaster = await db.leaveCompanyMapping.findAll({
				attributes: [
					"leaveAutoId",
					"companyId",
					"defaultLeaveCount",
					"startCalculatingLeaveFromJoiningDate",
					"creditOnProRataBasis",
					"creditHalfAfter15Day",
					"creditFullAfter15dDay",
					"startCalculateLeaveAfterProbation",
					"roundingInProRataBalance",
					"creditOnAccuralBasis",
					"leave_allowed_in_year",
					"probation_period_leave_validity",
					"probation_period_leave_validity_duration",
					"probation_period_leave_validity_duration_type",
				],
				where: {
					[Op.and]: [
						{
							genderApplicable: {
								[Op.or]: [
									{
										[Op.like]: `${genderNumber},%`,
									},
									{
										[Op.like]: `%,${genderNumber},%`,
									},
									{
										[Op.like]: `%,${genderNumber}`,
									},
									{
										[Op.eq]: `${genderNumber}`,
									},
								],
							},
						},
						{
							maritalApplicable: {
								[Op.or]: [
									{
										[Op.like]: `${maritalStatus},%`,
									},
									{
										[Op.like]: `%,${maritalStatus},%`,
									},
									{
										[Op.like]: `%,${maritalStatus}`,
									},
									{
										[Op.eq]: `${maritalStatus}`,
									},
								],
							},
						},
						{
							empType: {
								[Op.or]: [
									{
										[Op.like]: `${employee.dataValues.employeeType},%`,
									},
									{
										[Op.like]: `%,${employee.dataValues.employeeType},%`,
									},
									{
										[Op.like]: `%,${employee.dataValues.employeeType}`,
									},
									{
										[Op.eq]: `${employee.dataValues.employeeType}`,
									},
								],
							},
						},
						{
							isActive: 1,
							companyId: companyId,
						},
					],
				},
			});
			// console.log("leaveMaster", leaveMaster.length);

			const firstDate = moment(dateOfJoining)
				.startOf("month")
				.format("YYYY-MM-DD"); // "01"
			const midDate = moment(dateOfJoining).date(15).format("YYYY-MM-DD");

			const joiningDate = moment(dateOfJoining, "YYYY-MM-DD"); // Parse it
			const currentMonth = new Date(joiningDate).getMonth() + 1; // Get current month (1-based)
			const monthsLeft = 12 - currentMonth + 1; // Including the current month

			const isJoinedEarly = joiningDate.isBetween(
				firstDate,
				midDate,
				null,
				"[]",
			);
			await db.leaveMapping.update(
				{ isActive: 0 },
				{
					where: { EmployeeId: employee.id },
				},
			);

			for (const singleLeave of leaveMaster) {
				var leaveObj = {};
				let leave_activation_date = null;
				let is_active_for_application = 0;
				if (
					singleLeave?.probation_period_leave_validity == 0 &&
					singleLeave?.probation_period_leave_validity_duration == 0
				) {
					is_active_for_application = 1;
				}
				if (
					singleLeave?.probation_period_leave_validity == 0 &&
					singleLeave?.probation_period_leave_validity_duration != 0
				) {
					const clonedDate = joiningDate.clone(); // Clone before modification

					switch (singleLeave?.probation_period_leave_validity_duration_type) {
						case "YEAR":
							leave_activation_date = clonedDate
								.clone()
								.add(
									singleLeave?.probation_period_leave_validity_duration,
									"year",
								)
								.format("YYYY-MM-DD"); // Add  YEAR
							break;

						case "MONTH":
							leave_activation_date = clonedDate
								.clone()
								.add(
									singleLeave?.probation_period_leave_validity_duration,
									"months",
								)
								.format("YYYY-MM-DD"); // Add  months

							break;
						case "DAY":
							leave_activation_date = clonedDate
								.clone()
								.add(
									singleLeave?.probation_period_leave_validity_duration,
									"days",
								)
								.format("YYYY-MM-DD");
							break;
					}
				}

				const creditOnAccuralBasis = singleLeave?.creditOnAccuralBasis;
				const creditOnProRataBasis = singleLeave?.creditOnProRataBasis;

				if (creditOnAccuralBasis == 0 && creditOnProRataBasis == 0) {
					leaveObj = {
						EmployeeId: employee.id,
						leaveAutoId: singleLeave?.leaveAutoId,
						availableLeave: singleLeave?.leave_allowed_in_year,
						accruedThisYear: singleLeave?.leave_allowed_in_year,
						isActive: 1,
						annualAllotment: singleLeave?.leave_allowed_in_year,
						is_active_for_application: is_active_for_application,
						leave_activation_date: leave_activation_date,
					};
				} else if (creditOnAccuralBasis == 1 && creditOnProRataBasis == 1) {
					leaveObj = {
						EmployeeId: employee.id,
						leaveAutoId: singleLeave?.leaveAutoId,
						availableLeave:
							!isJoinedEarly && singleLeave?.creditHalfAfter15Day == 1
								? singleLeave?.defaultLeaveCount / 2
								: singleLeave?.defaultLeaveCount,
						accruedThisYear:
							!isJoinedEarly && singleLeave?.creditHalfAfter15Day == 1
								? singleLeave?.defaultLeaveCount / 2
								: singleLeave?.defaultLeaveCount,
						isActive: 1,
						annualAllotment: singleLeave?.leave_allowed_in_year,
						is_active_for_application: is_active_for_application,
						leave_activation_date: leave_activation_date,
					};
				} else if (creditOnAccuralBasis == 0 && creditOnProRataBasis == 1) {
					leaveObj = {
						EmployeeId: employee.id,
						leaveAutoId: singleLeave?.leaveAutoId,
						availableLeave: singleLeave?.defaultLeaveCount * monthsLeft,
						accruedThisYear: singleLeave?.defaultLeaveCount * monthsLeft,
						isActive: 1,
						annualAllotment: singleLeave?.leave_allowed_in_year,
						is_active_for_application: is_active_for_application,
						leave_activation_date: leave_activation_date,
					};
				} else {
					leaveObj = {
						EmployeeId: employee.id,
						leaveAutoId: singleLeave?.leaveAutoId,
						availableLeave: singleLeave?.defaultLeaveCount,
						accruedThisYear: singleLeave?.defaultLeaveCount,
						isActive: 1,
						annualAllotment: singleLeave?.leave_allowed_in_year,
						is_active_for_application: is_active_for_application,
						leave_activation_date: leave_activation_date,
					};
				}

				await db.leaveMapping.findOrCreate({
					where: {
						EmployeeId: leaveObj.EmployeeId,
						leaveAutoId: leaveObj?.leaveAutoId,
					},
					defaults: {
						availableLeave: leaveObj?.availableLeave,
						accruedThisYear: leaveObj?.accruedThisYear,
						isActive: 1,
						annualAllotment: leaveObj?.annualAllotment,
						is_active_for_application: leaveObj?.is_active_for_application,
						leave_activation_date: leaveObj?.leave_activation_date,
					},
				});

				if (leaveObj?.availableLeave != 0) {
					await db.leavemanager.create({
						EmployeeId: leaveObj.EmployeeId,
						leaveAutoId: leaveObj?.leaveAutoId,
						leaveCount: leaveObj?.availableLeave,
						transaction_for: "CREDIT",
						createdBy: 1,
					});
				}

				await db.leaveMapping.update(
					{ isActive: 1 },
					{
						where: {
							EmployeeId: leaveObj.EmployeeId,
							leaveAutoId: leaveObj?.leaveAutoId,
						},
					},
				);
			}
		}
	} catch (error) {
		console.log(error);
	}
};
//LEAVE ASSIGNMENT

const leaveRefil = async () => {
	try {
		const leaveWhichNeedToRefillForAll = await db.leaveCompanyMapping.findAll({
			attributes: [
				"leaveCompanyId",
				"leaveAutoId",
				"leave_allowed_in_year",
				"tenureCount",
				"empType",
				"maritalApplicable",
				"companyId",
			],
			where: { tenureCount: { [Op.ne]: 0 }, isActive: 1 },
		});

		const today = moment().format("YYYY-MM-DD"); // Replace with any date
		for (const singleleaveWhichNeedToRefillForAll of leaveWhichNeedToRefillForAll) {
			let empTyes = singleleaveWhichNeedToRefillForAll?.empType;
			let empTypesArray = empTyes.split(",").map(Number);

			let maritaltypes = singleleaveWhichNeedToRefillForAll?.maritalApplicable;
			let maritaltypesArray = maritaltypes.split(",").map(Number);

			let leavesForRefill = await db.EmployeeLeaveHeader.findAll({
				attributes: ["employeeId", "leaveAutoId", "employeeleaveheaderID"],
				where: {
					toDate: {
						[Op.lte]: today, // Fetch records where to date is less than today
					},
					leaveAutoId: singleleaveWhichNeedToRefillForAll?.leaveAutoId,
					status: "approved",
					tenureChecked: 0,
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name", "employeeType", "companyId"],
						required: true,
						where: {
							employeeType: { [Op.in]: empTypesArray },
							companyId: singleleaveWhichNeedToRefillForAll?.companyId,
						},
						include: {
							model: db.biographicalDetails,
							attributes: ["biographicalId", "maritalStatus", "gender"],
							required: true,
							where: {
								maritalStatus: { [Op.in]: maritaltypesArray },
							},
						},
					},
				],
			});
			for (const singleleaveForRefill of leavesForRefill) {
				const { gender, maritalStatus } =
					singleleaveForRefill?.employee?.employeebiographicaldetail;
				const genderNumber =
					gender === "Male" ? 1 : gender === "Female" ? 2 : 3;
				const empType = singleleaveForRefill?.employee?.employeeType;
				const companyId = singleleaveForRefill?.employee?.companyId;

				const leaveMaster = await db.leaveCompanyMapping.findOne({
					attributes: ["leaveAutoId", "leave_allowed_in_year", "tenureCount"],
					where: {
						[Op.and]: [
							{
								genderApplicable: {
									[Op.or]: [
										{
											[Op.like]: `${genderNumber},%`,
										},
										{
											[Op.like]: `%,${genderNumber},%`,
										},
										{
											[Op.like]: `%,${genderNumber}`,
										},
										{
											[Op.eq]: `${genderNumber}`,
										},
									],
								},
							},
							{
								maritalApplicable: {
									[Op.or]: [
										{
											[Op.like]: `${maritalStatus},%`,
										},
										{
											[Op.like]: `%,${maritalStatus},%`,
										},
										{
											[Op.like]: `%,${maritalStatus}`,
										},
										{
											[Op.eq]: `${maritalStatus}`,
										},
									],
								},
							},
							{
								empType: {
									[Op.or]: [
										{
											[Op.like]: `${empType},%`,
										},
										{
											[Op.like]: `%,${empType},%`,
										},
										{
											[Op.like]: `%,${empType}`,
										},
										{
											[Op.eq]: `${empType}`,
										},
									],
								},
							},
							{
								isActive: 1,
								companyId: companyId,
								leaveAutoId: singleleaveForRefill?.leaveAutoId,
								tenureCount: { [Op.ne]: 0 }, // tenureCount != 0
								leaveCompanyId:
									singleleaveWhichNeedToRefillForAll?.leaveCompanyId,
							},
						],
					},
				});
				if (leaveMaster) {
					let tenureCountAvailable = leaveMaster?.tenureCount;
					let leaveFillable = leaveMaster?.leave_allowed_in_year;
					await db.EmployeeLeaveHeader.update(
						{ tenureChecked: 1 },
						{
							where: {
								employeeleaveheaderID:
									singleleaveForRefill?.employeeleaveheaderID,
							},
						},
					);
					let leaveCount = await db.EmployeeLeaveHeader.count({
						where: {
							leaveAutoId: singleleaveForRefill?.leaveAutoId,
							status: "approved",
							employeeId: singleleaveForRefill.employeeId,
						},
					});
					if (tenureCountAvailable > leaveCount) {
						await db.leavemanager.create({
							EmployeeId: singleleaveForRefill?.employeeId,
							leaveAutoId: singleleaveForRefill?.leaveAutoId,
							leaveCount: leaveFillable,
							transaction_for: "CREDIT",
							createdBy: 1,
						});
						await db.leaveMapping.increment(
							{
								availableLeave: leaveFillable,
								accruedThisYear: leaveFillable,
							},
							{
								where: {
									EmployeeId: singleleaveForRefill?.employeeId,
									leaveAutoId: singleleaveForRefill?.leaveAutoId,
								},
							},
						);
					}
				}
			}
			// console.log("leavesForRefill", leavesForRefill.length);
		}

		return leaveWhichNeedToRefillForAll;
	} catch (error) {
		console.log("error", error);
	}
};
/// CONFIRMATION POLICY ASSIGNEMNT

const confirmationPolicyAssignment = async (empIdsInput) => {
	try {
		let empIds = empIdsInput.split(",");
		const employees = await db.employeeMaster.findAll({
			where: {
				isActive: 1,
				id: empIds,
				confimationPolicyAutoId: { [Op.eq]: null }, // Ensures companyId is not null
			},
			include: [
				{
					model: db.jobDetails,
					attributes: [
						"dateOfProbationEnd",
						"confirmationDate",
						"confirmationGenerated",
						"dateOfJoining",
						"probationDays",
						"jobLevelId",
						"jobId",
					],
					where: {
						confirmationGenerated: 0,
						confirmationDate: { [Op.eq]: null }, // Ensures companyId is not null
					},
				},
			],
		});
		for (const Singleemployee of employees) {
			let checkJobLevelAssignmnet = await db.Confirmationassignment.findOne({
				where: {
					jobLevelId: {
						[Op.or]: [
							{ [Op.like]: `${Singleemployee.employeejobdetail.jobLevelId},%` },
							{
								[Op.like]: `%,${Singleemployee.employeejobdetail.jobLevelId},%`,
							},
							{ [Op.like]: `%,${Singleemployee.employeejobdetail.jobLevelId}` },
							{ [Op.eq]: `${Singleemployee.employeejobdetail.jobLevelId}` },
						],
					},
					companyId: {
						[Op.or]: [
							{ [Op.like]: `${Singleemployee.companyId},%` },
							{ [Op.like]: `%,${Singleemployee.companyId},%` },
							{ [Op.like]: `%,${Singleemployee.companyId}` },
							{ [Op.eq]: `${Singleemployee.companyId}` },
						],
					},
				},
			});
			if (checkJobLevelAssignmnet) {
				let confirmationPolicy = await db.Confimationpolicy.findOne({
					where: {
						confirmationAssignmentAutoId: {
							[Op.or]: [
								{
									[Op.like]: `${checkJobLevelAssignmnet.confirmationAssignmentAutoId},%`,
								},
								{
									[Op.like]: `%,${checkJobLevelAssignmnet.confirmationAssignmentAutoId},%`,
								},
								{
									[Op.like]: `%,${checkJobLevelAssignmnet.confirmationAssignmentAutoId}`,
								},
								{
									[Op.eq]: `${checkJobLevelAssignmnet.confirmationAssignmentAutoId}`,
								},
							],
						},
					},
				});
				if (confirmationPolicy) {
					let dateOfProbationEnd = moment(
						Singleemployee.employeejobdetail.dateOfJoining,
					)
						.add(Singleemployee.employeejobdetail.probationDays, "days")
						.format("YYYY-MM-DD");

					let dateOfProbationTriggerDate = moment(dateOfProbationEnd)
						.subtract(confirmationPolicy.generateOnBeforeDays, "days")
						.format("YYYY-MM-DD");

					await db.jobDetails.update(
						{
							dateOfProbationEnd: dateOfProbationEnd,
							dateOfProbationTriggerDate: dateOfProbationTriggerDate,
						},
						{
							where: {
								userId: Singleemployee.id,
								jobId: Singleemployee.employeejobdetail.jobId,
							},
						},
					);
					await db.employeeMaster.update(
						{
							confimationPolicyAutoId:
								confirmationPolicy.confimationPolicyAutoId,
						},
						{
							where: {
								id: Singleemployee.id,
							},
						},
					);
				}
			}
		}
	} catch (error) {
		console.log(error);
	}
};
/// CONFIRMATION POLICY ASSIGNMENT

const fetchpermissoinAndAcessForEMP = async (PERMISSION, ROLE_ID) => {
	let permissionAssignTousers = [];
	if (PERMISSION) {
		permissionAssignTousers = PERMISSION.split(",").map((el) => parseInt(el));
	}
	let buFIlter = {};
	let sbbuFIlter = {};
	let functionAreaFIlter = {};
	let departmentFIlter = {};
	let designationFIlter = {};
	let companyFIlter = {};

	let buArrayForFilter = [],
		sbuArrayForFilter = [],
		departmentArrayForFilter = [],
		funcareaArrayForFilter = [],
		designationArrayForFilter = [],
		comapnyArrayForFilter = [];

	if (permissionAssignTousers.length > 0 && [4, 5].includes(ROLE_ID)) {
		let permissionAndAccess = await db.permissoinandaccess.findAll({
			where: {
				//role_id:ROLE_ID,
				isActive: 1,
				permissoinandaccessId: {
					[Op.in]: permissionAssignTousers,
				},
			},
		}); /// get all permission of access to fetch list with active status as per role

		buArrayForFilter = permissionAndAccess
			.filter((obj) => obj.permissionType == "BU")
			.map((obj) => obj.permissionValue); // checking BU Access

		if (buArrayForFilter.length > 0) {
			buFIlter.buId = {
				///appedning Bu to filter
				[Op.in]: buArrayForFilter,
			};
		}

		sbuArrayForFilter = permissionAndAccess
			.filter((obj) => obj.permissionType == "SBU")
			.map((obj) => obj.permissionValue); // checking SBU Access
		if (sbuArrayForFilter.length > 0) {
			sbbuFIlter.sbuId = {
				///appedning SBU to filter
				[Op.in]: sbuArrayForFilter,
			};
		}

		departmentArrayForFilter = permissionAndAccess
			.filter((obj) => obj.permissionType == "DEPARTMENT")
			.map((obj) => obj.permissionValue); // checking department Access

		if (departmentArrayForFilter.length > 0) {
			departmentFIlter.departmentId = {
				///appedning department to filter
				[Op.in]: departmentArrayForFilter,
			};
		}
		funcareaArrayForFilter = permissionAndAccess
			.filter((obj) => obj.permissionType == "FUNCAREA")
			.map((obj) => obj.permissionValue); // checking SBU Access

		if (funcareaArrayForFilter.length > 0) {
			functionAreaFIlter.functionalAreaId = {
				///appedning SBU to filter
				[Op.in]: funcareaArrayForFilter,
			};
		}

		designationArrayForFilter = permissionAndAccess
			.filter((obj) => obj.permissionType == "DESIGNATION")
			.map((obj) => obj.permissionValue); // checking SBU Access

		if (designationArrayForFilter.length > 0) {
			designationFIlter.designationId = {
				///appedning SBU to filter
				[Op.in]: designationArrayForFilter,
			};
		}

		comapnyArrayForFilter = permissionAndAccess
			.filter((obj) => obj.permissionType == "COMPANY")
			.map((obj) => obj.permissionValue); // checking SBU Access

		if (comapnyArrayForFilter.length > 0) {
			companyFIlter.companyId = {
				///appedning SBU to filter
				[Op.in]: comapnyArrayForFilter,
			};
		}
	}

	return {
		BU: buArrayForFilter,
		SBU: sbuArrayForFilter,
		DEPARTMENT: departmentArrayForFilter,
		FUNCTION: funcareaArrayForFilter,
		DESIGNATION: designationArrayForFilter,
		COMPANY: comapnyArrayForFilter,
	};
};
const getFiltersByPermission = async (roleId, permissionAndAccess) => {
	let filters = {
		buFIlter: {},
		sbbuFIlter: {},
		functionAreaFIlter: {},
		departmentFIlter: {},
		designationFIlter: {},
	};

	if (roleId === 4 || roleId === 5) {
		let permissionAssignTousers = permissionAndAccess
			? permissionAndAccess.split(",").map(Number)
			: [];

		let permissionRecords = await db.permissoinandaccess.findAll({
			where: {
				isActive: 1,
				permissoinandaccessId: { [Op.in]: permissionAssignTousers },
			},
		});

		const filterMapping = {
			BU: "buFIlter",
			SBU: "sbbuFIlter",
			DEPARTMENT: "departmentFIlter",
			FUNCAREA: "functionAreaFIlter",
			DESIGNATION: "designationFIlter",
		};

		Object.keys(filterMapping).forEach((type) => {
			const filterValues = permissionRecords
				.filter((obj) => obj.permissionType === type)
				.map((obj) => obj.permissionValue);

			if (filterValues.length > 0) {
				filters[filterMapping[type]][`${type.toLowerCase()}Id`] = {
					[Op.in]: filterValues,
				};
			}
		});
	}

	return filters;
};

// START BY JAY GENERATE EMPLOYMENT HISTORY

async function generateEmployementHistory(
	employeeDetails,
	createdBy,
	createdUserJobDetails,
) {
	// create designation history

	let designationMetaData = {
		employeeId: employeeDetails.id,
		companyId: employeeDetails.companyId,
		designation_id: employeeDetails.designation_id,
		fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
		toDate: null,
		isPromotion: 0,
		createdBy: createdBy,
		createdAt: employeeDetails.createdAt,
	};
	await db.DesignationEmploymentHistory.create(designationMetaData);

	// create manager history

	let managerMetaData = {
		employeeId: employeeDetails.id,
		managerId: employeeDetails.manager,
		fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
		createdBy: createdBy,
		createdAt: employeeDetails.createdAt,
	};
	await db.managerHistory.create(managerMetaData);

	// create job level history

	let jobLevelMetaData = {
		employeeId: employeeDetails.id,
		companyId: employeeDetails.companyId,
		bandId: createdUserJobDetails.bandId,
		gradeId: createdUserJobDetails.gradeId,
		jobLevelId: createdUserJobDetails.jobLevelId,
		fromDate: moment(createdUserJobDetails.createdAt).format("YYYY-MM-DD"),
		toDate: null,
		isPromotion: 0,
		createdBy: createdBy,
		createdAt: createdUserJobDetails.createdAt,
	};
	await db.JobLevelEmploymentHistory.create(jobLevelMetaData);

	// create department history

	let departmentMetaData = {
		employeeId: employeeDetails.id,
		companyId: employeeDetails.companyId,
		buId: employeeDetails.buId,
		sbuId: employeeDetails.sbuId,
		buHRId: employeeDetails.buHRId,
		buHeadId: employeeDetails.buHeadId,
		departmentId: employeeDetails.departmentId,
		functionalAreaId: employeeDetails.functionalAreaId,
		fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
		toDate: null,
		createdBy: createdBy,
		createdAt: employeeDetails.createdAt,
	};
	await db.DepartmentEmploymentHistory.create(departmentMetaData);

	// create employee type history

	let employeeTypeMetaData = {
		employeeId: employeeDetails.id,
		companyId: employeeDetails.companyId,
		employeeType: employeeDetails.employeeType,
		fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
		toDate: null,
		createdBy: createdBy,
		createdAt: employeeDetails.createdAt,
	};
	await db.EmployeeTypeEmploymentHistory.create(employeeTypeMetaData);

	// create company location history

	let companyLocationMetaData = {
		employeeId: employeeDetails.id,
		companyId: employeeDetails.companyId,
		companyLocationId: employeeDetails.companyLocationId,
		fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
		toDate: null,
		createdBy: createdBy,
		createdAt: employeeDetails.createdAt,
	};
	await db.OfficeLocationEmploymentHistory.create(companyLocationMetaData);

	// create cost center history

	if (employeeDetails.costId) {
		let costCenterMetaData = {
			employeeId: employeeDetails.id,
			companyId: employeeDetails.companyId,
			costId: employeeDetails.costId,
			fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
			toDate: null,
			createdBy: createdBy,
			createdAt: employeeDetails.createdAt,
		};

		await db.CostCenterEmploymentHistory.create(costCenterMetaData);
	}

	// create notice period history

	let noticePeriodMetaData = {
		employeeId: employeeDetails.id,
		companyId: employeeDetails.companyId,
		noticePeriodAutoId: employeeDetails.noticePeriodAutoId,
		fromDate: moment(employeeDetails.createdAt).format("YYYY-MM-DD"),
		toDate: null,
		createdBy: createdBy,
		createdAt: employeeDetails.createdAt,
	};
	await db.NoticePeriodEmploymentHistory.create(noticePeriodMetaData);
}

const revokeAppliedLeave = async (date, emp) => {
	const leave = await db.EmployeeLeaveHeader.findOne({
		where: {
			employeeId: emp,
			fromDate: date,
			status: {
				[Op.in]: ["approved", "pending"],
			},
			source: "system_generated",
		},
	});
	if (leave) {
		await db.EmployeeLeaveHeader.update(
			{
				status: "revoked",
				managerRemark:
					"System Revoked: Your leave request has been revoked due to the latest attendance data update.",
				updatedAt: moment(),
			},
			{
				where: {
					employeeleaveheaderID: leave.dataValues.employeeleaveheaderID,
				},
			},
		);

		await db.employeeLeaveTransactions.update(
			{
				status: "revoked",
				managerRemark:
					"System Revoked: Your leave request has been revoked due to the latest attendance data update.",
				updatedAt: moment(),
			},
			{
				where: {
					employeeleaveheaderID: leave.dataValues.employeeleaveheaderID,
				},
			},
		);

		if (leave.dataValues.status === "approved") {
			await maintainleaveCountOfEmployee(
				emp,
				leave.dataValues.leaveAutoId,
				leave.dataValues.leaveCount,
				"ADD",
			);
		}
	}
};
//REVOKE
const maintainleaveCountOfEmployee = async (EMP_ID, LEAVE_ID, COUNT, TYPE) => {
	//TYPE WILL BE ADD, SUB
	if (TYPE == "ADD") {
		if (LEAVE_ID == 6 || LEAVE_ID == 9) {
			await db.leaveMapping.update(
				{
					utilizedThisYear: db.sequelize.literal(`utilizedThisYear - ${COUNT}`),
				},
				{
					where: {
						EmployeeId: EMP_ID,
						leaveAutoId: LEAVE_ID,
					},
				},
			);
		} else {
			await db.leaveMapping.update(
				{
					availableLeave: db.sequelize.literal(`availableLeave + ${COUNT}`),
					utilizedThisYear: db.sequelize.literal(`utilizedThisYear - ${COUNT}`),
				},
				{
					where: {
						EmployeeId: EMP_ID,
						leaveAutoId: LEAVE_ID,
					},
				},
			);
		}
	} else {
		if (LEAVE_ID == 6 || LEAVE_ID == 9) {
			await db.leaveMapping.update(
				{
					utilizedThisYear: db.sequelize.literal(`utilizedThisYear + ${COUNT}`),
				},
				{
					where: {
						EmployeeId: EMP_ID,
						leaveAutoId: LEAVE_ID,
					},
				},
			);
		} else {
			await db.leaveMapping.update(
				{
					availableLeave: db.sequelize.literal(`availableLeave - ${COUNT}`),
					utilizedThisYear: db.sequelize.literal(`utilizedThisYear + ${COUNT}`),
				},
				{
					where: {
						EmployeeId: EMP_ID,
						leaveAutoId: LEAVE_ID,
					},
				},
			);
		}
	}
};
const releaseCompOffTheEmployeeForDate = async (
	EMP_ID,
	DATE,
	MODE = "LAPSE",
	status=4
) => {
	//TYPE WILL BE ADD, SUB
	// console.log("EMP_ID", EMP_ID, "DATE", DATE, "MODE", MODE);
	if (MODE == "LAPSE") {
		/// ADDed lapse condition based on regularization approved
		await db.comp_off_credit_history.update(
			{
				status: status, // adding lapse status
			},
			{
				where: {
					employee_Id: EMP_ID,
					credit_for_date: DATE,
					taken_on: { [Op.eq]: null },
				},
			},
		);
	} else {
		await db.comp_off_credit_history.update(
			{
				taken_on: null,
				status: 1,
			},
			{
				where: {
					employee_Id: EMP_ID,
					taken_on: DATE,
					expiry_date: {
						[Op.and]: [
							{ [Op.gte]: moment().format("YYYY-MM-DD") }, // Code correction , earlier leave comp off was not revoke.
						],
					},
				},
			},
		);
	}
};
const revokeApprovedAppliedLeave = async (
	leaveHeaderAutoId,
	t,
	userData,
	result,
) => {
	const leaves = await db.EmployeeLeaveHeader.findOne({
		where: {
			employeeleaveheaderID: leaveHeaderAutoId,
		},
		include: [
			{
				model: db.employeeLeaveTransactions,
				required: true,
			},
			{
				model: db.employeeMaster,
				required: true,
			},
		],
	});
	if (leaves) {
		for (const Singleleaves of leaves.employeeleavetransactions) {
			await db.employeeLeaveTransactions.update(
				{
					status: "revoked",
					updatedBy: userData.id,
					role: userData["role.name"],
					//message: result.remark != "" ? result.remark : null, ///message uncommented , was getting updated with revoke request approval
					updatedAt: moment(),
				},
				{
					where: {
						employeeLeaveTransactionsId:
							Singleleaves.employeeLeaveTransactionsId,
					},
				},
				{ transaction: t },
			);
			// console.log("Singleleaves.employeeId", Singleleaves.employeeId);
			// console.log("Singleleaves.leaveCount", Singleleaves.leaveCount);
			// console.log("Singleleaves.leaveAutoId", Singleleaves.leaveAutoId);
			await maintainleaveCountOfEmployee(
				Singleleaves.employeeId,
				Singleleaves.leaveAutoId,
				Singleleaves.leaveCount,
				"ADD",
			);
			if (Singleleaves.leaveAutoId == "9") {
				// console.log("Singleleaves.employeeId", Singleleaves.employeeId);
				// console.log("Singleleaves.appliedFor", Singleleaves.appliedFor);
				await releaseCompOffTheEmployeeForDate(
					Singleleaves.employeeId,
					Singleleaves.appliedFor,
					"RETURN",
				);
			}

			const checkAttendance = await db.attendanceMaster.findOne({
				where: {
					employeeId: Singleleaves.employeeId,
					attendanceDate: Singleleaves.appliedFor,
				},
			});
			if (checkAttendance) {
				if(Singleleaves.appliedFor!=moment().format("YYYY-MM-DD")){ // added check , not to run cron , if attendance is being revoke on current date
					await attendanceController.attedanceCronManual(
					checkAttendance.attendanceAutoId,
					Singleleaves.appliedFor,
					);
				}
				
			}
		}
		await db.EmployeeLeaveHeader.update(
			{
				status: "revoked",
				updatedBy: userData.id,
				//message: result.remark != "" ? result.remark : null, message uncommented , was getting updated with revoke request approval
				updatedAt: moment(),
			},
			{
				where: {
					employeeleaveheaderID: leaveHeaderAutoId,
				},
			},
			{ transaction: t },
		);
	}
	return leaves;
};
//REVOKE

const activeCompOffMoreThanLeave = async (EMP_ID, leaveID) => {
	const compOffHistory = await db.comp_off_credit_history.findAll({
		attributes: [
			"comp_off_credit_history_auto_id",
			"employee_Id",
			"balance",
			"expiry_date",
		],
		where: {
			employee_Id: EMP_ID,
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
	//console.log("compOffHistory list");

	if (compOffHistory.length === 0) {
		return 0;
	}
	//console.log("compOffHistory checked");

	const totalBalance = compOffHistory.reduce(
		(sum, record) => sum + parseFloat(record.balance),
		0,
	);
	const getLeaveRequest = await db.EmployeeLeaveHeader.findOne({
		attributes: ["employeeId", "leaveAutoId", "leaveCount"],
		where: {
			employeeId: EMP_ID,
			leaveAutoId: 9,
			employeeleaveheaderID: leaveID,
		},
		raw: false,
	});

	if (totalBalance < parseFloat(getLeaveRequest.leaveCount)) {
		return 0;
	} else {
		return 1;
	}
};
// END BY JAY GENERATE EMPLOYMENT HISTORY

// Return employee role based on condition for creator role and updator role

const fetchEmployeeRole = (role, employeeId, actionBy) => {
	if (employeeId === actionBy && role === "USER") {
		return role;
	} else if (employeeId != actionBy && role === "USER") {
		return "MANAGER";
	} else {
		return role;
	}
};

async function convertEmptyStringsToNull(obj) {
	if (Array.isArray(obj)) {
		return Promise.all(
			obj.map(async (item) => await convertEmptyStringsToNull(item)),
		);
	} else if (obj && typeof obj === "object" && obj !== null) {
		const entries = await Promise.all(
			Object.entries(obj).map(async ([key, value]) => {
				const resolvedValue = await Promise.resolve(value); // Resolves the promise
				return [key, await convertEmptyStringsToNull(resolvedValue)];
			}),
		);
		return Object.fromEntries(entries);
	} else if (obj === "") {
		return null;
	}
	return obj;
}
async function chekcMonthCountInArray(dates) {
	const monthCountMap = {};
	dates.forEach((date) => {
		const month = date.substring(0, 7); // "2025-04"

		if (monthCountMap[month]) {
			monthCountMap[month].count++;
		} else {
			const [year, monthPart] = month.split("-");
			const startDate = `${year}-${monthPart}-01`;

			// Now correctly calculate end of month
			const endDateObj = new Date(parseInt(year), parseInt(monthPart), 0);
			const yyyy = endDateObj.getFullYear();
			const mm = String(endDateObj.getMonth() + 1).padStart(2, "0");
			const dd = String(endDateObj.getDate()).padStart(2, "0");
			const endDate = `${yyyy}-${mm}-${dd}`;

			monthCountMap[month] = {
				month: month,
				count: 1,
				startDate: startDate,
				endDate: endDate,
			};
		}
	});

	const monthCountArray = Object.values(monthCountMap);
	return monthCountArray;
}

const getWorkDuration = async (dateOfJoining) => {
	/// Sandeep
	const today = moment();
	const joinDate = moment(dateOfJoining);

	const years = today.diff(joinDate, "years");
	joinDate.add(years, "years");

	const months = today.diff(joinDate, "months");
	joinDate.add(months, "months");

	const days = today.diff(joinDate, "days");

	return `${String(years).padStart(2, "0")}y ${String(months).padStart(2, "0")}m ${String(days).padStart(2, "0")}d`;
};

///CONFIRMATION AND BIRTHDAY WISH CC
const roleEmailIds = async (EMP_DATA_SELF, ROLES) => {
	let mails = [];
	for (const emailids of ROLES) {
		let ownerId = null;
		if (emailids == "MANAGER") {
			ownerId = EMP_DATA_SELF?.managerData?.id;
		} else if (emailids == "L2_MANAGER") {
			let EMP_DATA = await getEmpProfile(EMP_DATA_SELF?.managerData?.id); // L2 Manager
			ownerId = EMP_DATA?.id;
		} else if (emailids == "ADMIN") {
			let admin = await db.employeeMaster.findOne({
				where: {
					role_id: 2,
					isActive: 1,
				},
			});
			ownerId = admin?.id;
		} else if (emailids == "BUHR") {
			ownerId = EMP_DATA_SELF?.buHRId;
		}

		if (ownerId) {
			mails.push(ownerId);
		}
	} //TMC OR ID
	const EMP_DATA_LIST = await db.employeeMaster.findAll({
		where: {
			id: mails,
			isActive: 1,
		},
		attributes: ["email", "id", "empCode"],
	});
	let finalEmails = [];
	for (const EMP_DATA_ROW of EMP_DATA_LIST) {
		finalEmails.push(EMP_DATA_ROW.email);
	}

	const additionalCCMail =
		EMP_DATA_SELF?.companymaster?.addCCEmailForWishesAndConfirmation;

	if (additionalCCMail) {
		finalEmails.push(...additionalCCMail.split(","));
	}

	const ccEmail = finalEmails.filter((email) => !!email);
	return ccEmail;
};
///CONFIRMATION AND BIRTHDAY WISH CC

async function handleAppraisalGoalPlanUpdate(assignmentId) {
	const activePlans = await db.appraisalGoalsMaster.findAll({
		attributes: ["appraisalGoalId", "userAssignment"],
		where: {
			type: 1,
			isDeleted: 0,
			userAssignment: assignmentId,
		},
	});

	const allUserKeys = new Set();
	const insertPayload = [];

	for (const plan of activePlans) {
		const userList = await getEmployeesToAssignGoalPlan(plan.userAssignment);
		for (const user of userList) {
			const key = `${user.email}_${user.id}`;
			if (!allUserKeys.has(key)) {
				allUserKeys.add(key);
				insertPayload.push({
					tmc: user.empCode,
					email: user.email,
					userId: user.id,
					goalPlanId: plan.appraisalGoalId,
					isActive: 1,
				});
			}
		}
	}

	const existing = await db.goalPlanMail.findAll({
		attributes: ["email", "userId"],
		where: { isActive: 1 },
	});
	const existingMapNew = new Set(existing.map((e) => `${e.email}_${e.userId}`));

	const newInserts = insertPayload.filter(
		(entry) => !existingMapNew.has(`${entry.email}_${entry.userId}`),
	);

	if (newInserts.length > 0) {
		await db.goalPlanMail.bulkCreate(newInserts);

		for (const entry of newInserts) {
			const [user, goalPlan] = await Promise.all([
				db.employeeMaster.findOne({
					where: { id: entry.userId },
					include: [
						{
							model: db.companyMaster,
							attributes: ["senderEmail", "companyLogo", "companyName"],
						},
					],
					attributes: ["name", "email"],
					raw: true,
				}),
				db.appraisalGoalsMaster.findOne({
					where: { appraisalGoalId: entry.goalPlanId },
					attributes: [
						"startDate",
						"endDate",
						"goalPlanDescription",
						"goalPlanName",
					],
					raw: true,
				}),
			]);

			if (!goalPlan) {
				console.warn(`Goal plan not found for ID ${entry.goalPlanId}`);
				continue;
			}

			// eventEmitter.emit(
			// 	"goalPlanAssignToEmployee",
			// 	JSON.stringify({
			// 		email: user.email,
			// 		name: user.name,
			// 		startDate: moment(goalPlan.startDate).format("DD-MM-YYYY"),
			// 		endDate: moment(goalPlan.endDate).format("DD-MM-YYYY"),
			// 		goalPlanDescription: goalPlan.goalPlanDescription,
			// 		goalPlanName: goalPlan.goalPlanName,
			// 		senderEmail: user["companymaster.senderEmail"] || "",
			// 		companyLogo: user["companymaster.companyLogo"] || "",
			// 		companyName: user["companymaster.companyName"] || "",
			// 	}),
			// );

			// console.log(`Goal plan email triggered for ${user.email}`);
		}
	}
}

// reviewFrameworkService.js

async function handleReviewFrameworkAssignment(userAssignment) {
	try {
		const currentReviewPlan = await db.reviewFramework.findOne({
			where: { type: 1, userAssignment: userAssignment },
			raw: true,
		});
		const userList = await getEmployeesByUserAssignmentId(userAssignment);

		if (userList.length === 0) return;

		const allUserKeys = new Set();
		const insertPayload = [];
		const insertForReviewTrail = [];

		for (const user of userList) {
			const key = `${user.email}_${user.id}`;
			if (!allUserKeys.has(key)) {
				allUserKeys.add(key);

				insertPayload.push({
					tmc: user.empCode,
					email: user.email,
					userId: user.id,
					reviewFrameworkId: currentReviewPlan.reviewFrameworkId,
					isActive: 1,
				});

				insertForReviewTrail.push({
					userId: user.id,
					reviewFrameworkId: currentReviewPlan.reviewFrameworkId,
					isVisible: 1,
					isActionTaken: 0,
					pendingAt: user.id,
					level: 0,
				});
			}
		}

		// Existing records to prevent duplication
		const [existingMails, existingTrails] = await Promise.all([
			db.reviewFrameworkMail.findAll({
				attributes: ["email", "userId"],
				where: { isActive: 1 },
			}),
			db.reviewRatingTrail.findAll({
				attributes: ["userId", "level"],
				where: { level: 0 },
			}),
		]);

		const existingMailSet = new Set(
			existingMails.map((e) => `${e.email}_${e.userId}`),
		);
		const existingTrailSet = new Set(
			existingTrails.map((e) => `${e.level}_${e.userId}`),
		);

		const newInserts = insertPayload.filter(
			(entry) => !existingMailSet.has(`${entry.email}_${entry.userId}`),
		);
		const newTrailInserts = insertForReviewTrail.filter(
			(entry) => !existingTrailSet.has(`${entry.level}_${entry.userId}`),
		);

		if (newInserts.length > 0) {
			await db.reviewFrameworkMail.bulkCreate(newInserts);
		}

		if (newTrailInserts.length > 0) {
			await db.reviewRatingTrail.bulkCreate(newTrailInserts);
		}
	} catch (error) {
		console.error("Error in handleReviewFrameworkAssignment:", error);
		throw error;
	}
}

async function handleReviewFrameworkAssignmentNew(userAssignment) {
	try {
		const currentReviewPlan = await db.reviewFramework.findOne({
			where: { type: 1, userAssignment: userAssignment },
			raw: true,
		});
		const userList = await getEmployeesByUserAssignmentId(userAssignment);

		if (userList.length === 0) return;
		const allUserKeys = new Set();
		const insertPayload = [];
		const insertForReviewTrail = [];

		let steps = [];

		if (currentReviewPlan.selfReview) steps.push("Employee");
		if (currentReviewPlan.evaluator) steps.push("Manager");
		if (currentReviewPlan.reviewer) steps.push("HOD");
		steps.push("Calibration");
		for (const user of userList) {
			const key = `${user.email}_${user.id}`;
			if (!allUserKeys.has(key)) {
				allUserKeys.add(key);

				insertPayload.push({
					tmc: user.empCode,
					email: user.email,
					userId: user.id,
					reviewFrameworkId: currentReviewPlan.reviewFrameworkId,
					isActive: 1,
				});

				let hodId = null;

				// Only check department head if departmentId is present
				if (user.departmentId) {
					const departmentHead = await db.departmentMapping.findOne({
						where: { departmentId: user.departmentId },
						include: [
							{
								model: db.employeeMaster,
								attributes: ["id", "name"],
								as: "departmentOfHead",
							},
						],
					});

					if (!departmentHead?.departmentOfHead?.id) {
						logger.warn(
							`Department head not found for departmentId: ${user.departmentId}`,
						);
					} else {
						hodId = departmentHead.departmentOfHead.id;
					}
				} else {
					logger.warn(
						`Skipping department head check for user ${user.id} as departmentId is missing.`,
					);
				}

				// Determine first pending stage and pendingAt
				const pendingStage = steps[0];
				const level = 0;

				let pendingValue = null;
				if (pendingStage === "Employee") {
					pendingValue = user.id;
				} else if (pendingStage === "Manager") {
					pendingValue = user.managerData?.id;
				} else if (pendingStage === "HOD") {
					pendingValue = hodId;
				}

				if (!pendingValue) {
					logger.warn(
						`Skipping user ${user.id} due to missing pendingAt value for stage ${pendingStage}`,
					);
					continue;
				}

				insertForReviewTrail.push({
					userId: user.id,
					reviewFrameworkId: currentReviewPlan.reviewFrameworkId,
					isVisible: 1,
					isActionTaken: 0,
					pendingAt: pendingValue,
					level,
					pendingStage,
				});
			}
		}

		// Fetch existing entries
		const existing = await db.reviewFrameworkMail.findAll({
			attributes: ["email", "userId"],
			where: { isActive: 1 },
		});
		const existingTrail = await db.reviewRatingTrail.findAll({
			attributes: ["userId", "level"],
			where: { level: 0 },
		});

		const existingMap = new Set(existing.map((e) => `${e.email}_${e.userId}`));
		const existingTrailMap = new Set(
			existingTrail.map((e) => `${e.level}_${e.userId}`),
		);

		// Filter only new entries
		const newInserts = insertPayload.filter(
			(entry) => !existingMap.has(`${entry.email}_${entry.userId}`),
		);
		const newInsertsInTrail = insertForReviewTrail.filter(
			(entry) => !existingTrailMap.has(`${entry.level}_${entry.userId}`),
		);

		// Insert into DB
		if (newInserts.length > 0) {
			await db.reviewFrameworkMail.bulkCreate(newInserts);
		}
		if (newInsertsInTrail.length > 0) {
			await db.reviewRatingTrail.bulkCreate(newInsertsInTrail);
		}
	} catch (error) {
		console.error("Error in handleReviewFrameworkAssignment:", error);
		throw error;
	}
}

function isEmpty(value) {
	return value === null || value === undefined || value === "";
}

async function validateSelfAppraisalData(data) {
	const isSubmit = data.isSubmit === true;

	if (isSubmit) {
		if (!Array.isArray(data.selfRatings) || data.selfRatings.length === 0) {
			return {
				valid: false,
				error: "At least one selfRating is required when submitting.",
			};
		}

		for (let i = 0; i < data.selfRatings.length; i++) {
			const item = data.selfRatings[i];

			if (isEmpty(item.goalAreaId)) {
				return { valid: false, error: `goalAreaId is required.` };
			}

			if (isEmpty(item.rating)) {
				return { valid: false, error: `Rating is required.` };
			}

			//   if (isEmpty(item.comment)) {
			//     return { valid: false, error: `comment is required in selfRatings[${i}].` };
			//   }
		}

		if (
			!Array.isArray(data.compentancyRating) ||
			data.compentancyRating.length === 0
		) {
			return {
				valid: false,
				error: "At least one compentancyRating is required when submitting.",
			};
		}

		for (let i = 0; i < data.compentancyRating.length; i++) {
			const item = data.compentancyRating[i];

			if (isEmpty(item.rating)) {
				return { valid: false, error: `rating is required.` };
			}

			//   if (isEmpty(item.comment)) {
			//     return { valid: false, error: `comment is required in compentancyRating[${i}].` };
			//   }

			if (isEmpty(item.compentancyAttrId)) {
				return {
					valid: false,
					error: `compentancyAttrId is required in compentancyRating[${i}].`,
				};
			}

			if (isEmpty(item.compentancyTierId)) {
				return {
					valid: false,
					error: `compentancyTierId is required in compentancyRating[${i}].`,
				};
			}
		}
	}

	return { valid: true };
}
//Addition function to get date between date range , this is required to generate attendance
async function getDatesArray(startDate, endDate) {
const dates = [];
  let currentDate = moment(startDate);
  const lastDate = moment(endDate);

  while (currentDate.isBefore(lastDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'days');
  }

  return dates;
}
//Addition function to get date between date range , this is required to generate attendance

//custom portal
const getLoggedinUser = (req) => {
	if (req.session.user) return req.session.user;
	return null;
  };
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};
const ratingAndReview = (rating) => {
	let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars += '<li><i class="lni lni-star-filled"></i></li>';
    } else {
      stars += '<li><i class="lni lni-star"></i></li>';
    }
  }
  //return stars;
  };
  const discountOnProduct = (product) => {
		let discount=0;
		return discount;
  };
  const cartSubtotal = (cartList) => {
	let total=cartList.reduce((acc, item) => {
		return acc + (item.cartProducts.price * item.qty);
	}, 0);
	return total;
};
const cartGrandtotal = (cartList) => {
	let total=0;
	let subtotal = cartSubtotal(cartList);
	return total = subtotal + shippingTotal(cartList) - youSaveTotal(cartList);
};
const shippingTotal = (cartList) => {
	let total=0;
	return total;
};
const youSaveTotal = (cartList) => {
	let total=0;
	return total;
}; 
// custom portal

export default {
	getLoggedinUser,
	checkFolder,
	isAuthenticated,
	ratingAndReview,
	discountOnProduct,
	cartSubtotal,
	cartGrandtotal,
	shippingTotal,
	youSaveTotal
};
