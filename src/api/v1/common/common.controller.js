import db from "../../../config/db.config.js";
import validator from "../../../helper/validator.js";
import logger from "../../../helper/logger.js";
import helper from "../../../helper/helper.js";
import respHelper from "../../../helper/respHelper.js";
import constant from "../../../constant/messages.js";
import client from "../../../config/redisDb.config.js";
import eventEmitter from "../../../services/eventService.js";
import moment from "moment";
import { Op } from "sequelize";
import xlsx from "json-as-xlsx";
import fs from "fs";
import pkg from "xlsx";
import { writeFileSync } from "fs";
import pushNotificationEmitter from "../../../services/pushNotificationEventService.js"; // New
const message = constant;
import service from "./../admin/master/master.service.js";
import adminValidator from "../../../helper/adminValidator.js";
class commonController {
	async addBiographicalDetails(req, res) {
		try {
			const result =
				await validator.updateBiographicalDetailsSchema.validateAsync(req.body);
			let detailsExists = await db.biographicalDetails.findOne({
				where: { userId: result.userId == 0 ? req.userId : result.userId },
			});
			if (detailsExists) {
				return respHelper(res, {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Details"),
					data: {},
				});
			} else {
				const userId = result.userId == 0 ? req.userId : result.userId;

				let obj = {
					...result,
					userId: userId,
					createdBy: req.userData.role_id != 3 ? req.userId : result.userId,
					updatedBy: req.userData.role_id != 3 ? req.userId : result.userId,
				};
				await db.biographicalDetails.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.INSERT_SUCCESS.replace(
						"<module>",
						"Biographical Details",
					),
					data: {},
				});
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

	async updateBiographicalDetails(req, res) {
		try {
			const result =
				await validator.updateBiographicalDetailsSchema.validateAsync(req.body);

			const userId = result.userId == 0 ? req.userId : result.userId;

			const getUserDetails = await db.employeeMaster.findOne({
				attributes: ["id", "firstName"],
				where: { id: userId },
			});

			const updateObj = Object.assign(result, {
				userId: userId,
				updatedAt: moment(),
				updatedBy: req.userId,
			});
			await db.biographicalDetails.update(updateObj, {
				where: { userId: userId },
				silent: false, // 🔹 Ensure silent mode is off,
				individualHooks: true, // ✅ Ensure hooks trigger properly
			});

			if (result.salutationId) {
				await db.employeeMaster.update(
					{
						name: result.lastName
							? `${getUserDetails.firstName} ${result.lastName}`
							: getUserDetails.firstName,
						salutationId: result.salutationId,
						middleName: result.middleName,
						lastName: result.lastName,
						firstName: result.firstName,
						dataCardAdmin: result.dataCardAdmin,
						visitingCardAdmin: result.visitingCardAdmin,
						workstationAdmin: result.workstationAdmin,
						lastIncrementDate: result.lastIncrementDate,
						iqTestApplicable: result.iqTestApplicable,
						mobileAdmin: result.mobileAdmin,
						recruiterName: result.recruiterName,
						offRoleCTC: result.offRoleCTC,
						highestQualification: result.highestQualification,
						ESICPFDeduction: result.ESICPFDeduction,
						fatherName: result.fatherName,
						updatedAt: moment(),
						updatedBy: req.userId,
					},
					{
						where: { id: userId },
					},
				);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				data: updateObj,
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

	async getBiographicalDetails(req, res) {
		try {
			const userId = req.params.userId == 0 ? req.userId : req.params.userId;
			let detailsExists = await db.biographicalDetails.findOne({
				attributes: { exclude: ["createdAt", "updatedAt", "isActive"] },
				where: { userId: userId },
			});
			if (detailsExists) {
				return respHelper(res, {
					status: 200,
					msg: constant.DATA_FETCHED.replace(
						"<module>",
						"Biographical Details",
					),
					data: detailsExists,
				});
			} else {
				return respHelper(res, {
					status: 400,
					msg: constant.NOT_FOUND.replace("<module>", "Biographical Details"),
					data: {},
				});
			}
		} catch (error) {}
	}

	async updatePaymentDetails(req, res) {
		try {
			const result = await validator.updatePaymentDetailsSchema.validateAsync(
				req.body,
			);

			await db.paymentDetails.update(
				Object.assign(result, {
					updatedBy: req.userId,
					updatedAt: moment(),
				}),
				{
					where: { userId: result.userId ? result.userId : req.userId },
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
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

	async addFamilyMembers(req, res) {
		try {
			const result = await validator.addFamilyDetailsSchema.validateAsync(
				req.body,
			);
			let detailsExists = await db.familyDetails.findOne({
				where: {
					EmployeeId: result.userId == 0 ? req.userId : result.userId,
					name: result.name,
				},
			});
			if (detailsExists) {
				return respHelper(res, {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace(
						"<module>",
						"Family Member Details",
					),
					data: {},
				});
			} else {
				const userId = result.userId == 0 ? req.userId : result.userId;

				let obj = {
					...result,
					EmployeeId: userId,
					createdBy: req.userData.role_id != 3 ? req.userId : result.userId,
					// updatedBy: req.userData.role_id != 3 ? req.userId : result.userId,
				};

				await db.familyDetails.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.INSERT_SUCCESS.replace(
						"<module>",
						"Family Member Details",
					),
					data: {},
				});
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

	async updateFamilyMembers(req, res) {
		try {
			const result = await validator.updateFamilyDetailsSchema.validateAsync(
				req.body,
			);
			const user = req.query.user || req.userId;

			const existFamilyMember = await db.familyDetails.findOne({
				raw: true,
				where: {
					EmployeeId: user,
					empFamilyDetailsId: {
						[Op.ne]: result.empFamilyDetailsId,
					},
					name: result.name,
				},
			});

			if (existFamilyMember) {
				return respHelper(res, {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Family Member"),
				});
			}

			let getFamilyDetails = await db.familyDetails.findOne({
				where: { empFamilyDetailsId: result.empFamilyDetailsId },
			});
			if (getFamilyDetails) {
				await db.familyMemberHistory.create({
					EmployeeId: getFamilyDetails.EmployeeId,
					name: getFamilyDetails.name,
					dob: getFamilyDetails.dob,
					gender: getFamilyDetails.gender,
					mobileNo: getFamilyDetails.mobileNo,
					memberAddress: getFamilyDetails.memberAddress,
					relationWithEmp: getFamilyDetails.relationWithEmp,
					createdBy: getFamilyDetails.createdBy,
					updatedBy: getFamilyDetails.updatedBy,
				});
				await db.familyDetails.update(
					Object.assign(result, {
						updatedBy: req.userId,
						updatedAt: moment(),
					}),
					{
						where: { empFamilyDetailsId: result.empFamilyDetailsId },
					},
				);
			}
			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
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

	async getFamilyList(req, res) {
		try {
			const userId = req.params.userId == 0 ? req.userId : req.params.userId;
			let detailsExists = await db.familyDetails.findAll({
				attributes: { exclude: ["createdAt", "updatedAt", "isActive"] },
				where: { EmployeeId: userId, isActive: 1 },
			});
			if (detailsExists) {
				return respHelper(res, {
					status: 200,
					msg: constant.DATA_FETCHED.replace(
						"<module>",
						"Family Member Details",
					),
					data: detailsExists,
				});
			} else {
				return respHelper(res, {
					status: 400,
					msg: constant.NOT_FOUND.replace("<module>", "Family Member Details"),
					data: {},
				});
			}
		} catch (error) {}
	}

	async getFamilyMember(req, res) {
		try {
			const userId = req.params.userId == 0 ? req.userId : req.params.userId;
			let detailsExists = await db.familyDetails.findOne({
				attributes: { exclude: ["createdAt", "updatedAt", "isActive"] },
				where: { empFamilyDetailsId: userId },
			});
			if (detailsExists) {
				return respHelper(res, {
					status: 200,
					msg: constant.DATA_FETCHED.replace(
						"<module>",
						"Family Member Details",
					),
					data: detailsExists,
				});
			} else {
				return respHelper(res, {
					status: 400,
					msg: constant.NOT_FOUND.replace("<module>", "Family Member Details"),
					data: {},
				});
			}
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async addJobDetails(req, res) {
		try {
			const result = await validator.addJobDetailsSchema.validateAsync(
				req.body,
			);
			const userId = req.body.userId == 0 ? req.userId : req.body.userId;
			result["probationId"] = result.probationPeriod;

			// fetch bandId and gradeId based on job level
			if (result.jobLevelId) {
				const getJobLevelMappingDetails = await db.jobLevelMapping.findOne({
					where: { jobLevelId: result.jobLevelId },
					attributes: ["bandId", "gradeId"],
				});
				if (getJobLevelMappingDetails) {
					result["bandId"] = getJobLevelMappingDetails.bandId;
					result["gradeId"] = getJobLevelMappingDetails.gradeId;
				}
			}

			// update date of joining and company location in employee master table
			if (result.companyLocationId) {
				await db.employeeMaster.update(
					{ companyLocationId: result.companyLocationId },
					{ where: { id: userId } },
				);
			}

			const existPaymentDetails = await db.jobDetails.findOne({
				raw: true,
				where: {
					userId: userId,
				},
			});

			// verify probation id and calculate probation days
			if (
				result.probationId &&
				result.probationId != existPaymentDetails.probationId
			) {
				let getProbationDetails = await db.probationMaster.findOne({
					where: { probationId: result.probationId },
				});
				if (getProbationDetails) {
					let durationOfProbation = getProbationDetails.durationOfProbation;
					result["probationDays"] = durationOfProbation;
				}
			}

			if (existPaymentDetails) {
				let obj = {
					...result,
					...{ createdBy: existPaymentDetails.createdBy },
					...{ createdAt: existPaymentDetails.createdAt },
					...{ updatedBy: req.userId },
					...{ updatedAt: moment().format("YYYY-MM-DD HH:mm:ss") },
					...{ userId: userId },
					...{ isActive: 1 },
				};
				await db.employeeJobDetailsHistory.create(existPaymentDetails);
				await db.jobDetails.update(obj, {
					where: { userId: userId },
				});

				return respHelper(res, {
					status: 200,
					msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				});
			} else {
				let obj = {
					...result,
					...{ createdBy: req.userId },
					...{ createdAt: moment().format("YYYY-MM-DD HH:mm:ss") },
					...{ updatedBy: req.userId },
					...{ updatedAt: moment() },
					...{ userId: userId },
					...{ isActive: 1 },
				};
				await db.jobDetails.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.DETAILS_ADDED.replace("<module>", "Details"),
				});
			}
		} catch (error) {
			console.log(error);
			logger.error(error);
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
	async addPaymentDetails(req, res) {
		try {
			const result = await validator.addPaymentDetailsSchema.validateAsync(
				req.body,
			);
			const userId = req.body.userId == 0 ? req.userId : result.userId;
			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});

			const existPaymentDetails = await db.paymentDetails.findOne({
				raw: true,
				where: {
					userId: userId,
				},
			});

			if (result.paymentAttachment) {
				const d = Math.floor(Date.now() / 1000);
				var paymentAttachment = await helper.fileUpload(
					result.paymentAttachment,
					`cheque${d}`,
					`uploads/${existUser.empCode}`,
				);
			}
			if (existPaymentDetails) {
				let obj = {
					...result,
					...{ status: "approved" },
					...(paymentAttachment !== "" && { paymentAttachment }),
					...{ createdBy: existPaymentDetails.createdBy },
					...{ createdAt: existPaymentDetails.createdAt },
					...{ updatedBy: userId },
					...{ updatedAt: moment().format("YYYY-MM-DD HH:mm:ss") },
					...{ userId: userId },
					...{ isActive: 1 },
				};
				await db.paymentDetails.update(obj, {
					where: { userId: userId },
				});

				return respHelper(res, {
					status: 200,
					msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				});
			} else {
				let obj = {
					...result,
					...(paymentAttachment !== "" && { paymentAttachment }),
					...{ createdBy: userId },
					...{ createdAt: moment().format("YYYY-MM-DD HH:mm:ss") },
					...{ userId: userId },
					...{ isActive: 1 },
				};
				await db.paymentDetails.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.DETAILS_ADDED.replace("<module>", "Payment Details"),
				});
			}
		} catch (error) {
			console.log(error);
			logger.error(error);
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

	async deleteFamilyMember(req, res) {
		try {
			const result =
				await validator.deleteFamilyMemberDetailsSchema.validateAsync(req.body);

			const existData = await db.familyDetails.findOne({
				raw: true,
				where: {
					empFamilyDetailsId: result.empFamilyDetailsId,
					isActive: 1,
				},
			});

			if (!existData) {
				return respHelper(res, {
					status: 400,
					msg: constant.DETAILS_NOT_FOUND.replace("<module>", "Family Member"),
				});
			}

			await db.familyDetails.update(
				{
					isActive: 0,
					updatedBy: req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						empFamilyDetailsId: result.empFamilyDetailsId,
						isActive: 1,
					},
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.DETAILS_DELETED.replace("<module>", "Family Member"),
			});
		} catch (error) {
			console.log(error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async dashboardCard(req, res) {
		try {
			//for key 0 using for web and 1 for app
			var dashboardData = [];
			let cacheKey =
				req.params.for == 0
					? `dashboardCardWeb_${process.env.TEST}`
					: `dashboardCardApp_${process.env.TEST}`;
			await client.get(cacheKey).then(async (data) => {
				if (data) {
					dashboardData = JSON.parse(data);

					return respHelper(res, {
						status: 200,
						data: dashboardData,
					});
				} else {
					const whereConditon = {
						...(req.params.for == 0 && { isActiveWeb: 1 }),
						...(req.params.for == 1 && { isActiveApp: 1 }),
					};
					let orderFor =
						req.params.for == 0
							? [["positionWeb", "asc"]]
							: [["positionApp", "desc"]];
					dashboardData = await db.DashboardCard.findAndCountAll({
						where: whereConditon,
						order: orderFor,
					});

					const dashboardJson = JSON.stringify(dashboardData);
					client
						.setEx(cacheKey, parseInt(process.env.TTL), dashboardJson)
						.then(() => {
							console.log("Array of objects stored in Redis successfully.");
						})
						.catch((err) => {
							console.error("Error storing array of objects in Redis:", err);
						});
					return respHelper(res, {
						status: 200,
						data: dashboardData,
					});
				}
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async getCalendar(req, res) {
		try {
			let userData = req.userData;

			let employeeData;
			if (req.query.user) {
				employeeData = await db.employeeMaster.findOne({
					raw: true,
					where: {
						id: req.query.user,
					},
					attributes: ["companyLocationId"],
				});
			}

			const holidayData = await db.holidayCompanyLocationConfiguration.findAll({
				where: {
					companyLocationId: req.query.user
						? employeeData.companyLocationId
						: userData.companyLocationId,
					isActive: 1,
				},
				include: [
					{
						model: db.holidayMaster,
						attributes: ["holidayId", "holidayName", "holidayDate"],
						as: "holidayDetails",
						where: {
							isActive: 1,
							[db.Sequelize.Op.and]: [
								db.Sequelize.where(
									db.Sequelize.fn("YEAR", db.Sequelize.col("holidayDate")),
									new Date().getFullYear(),
								),
							],
						},
					},
				],
				order: [
					[
						{ model: db.holidayMaster, as: "holidayDetails" },
						"holidayDate",
						"ASC",
					],
				],
			});

			return respHelper(res, {
				status: 200,
				data: holidayData,
				msg: message.DATA_FETCHED,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				data: error,
			});
		}
	}

	async mobileNoUpdateInFamilyTable(req, res) {
		await db.familyDetails.update(
			{
				mobileNo: "N/A",
			},
			{
				where: {},
			},
		);
		return respHelper(res, {
			status: 200,
			data: {},
		});
	}
	async updateEducationDetails(req, res) {
		try {
			const result = await validator.updateEducationDetailsSchema.validateAsync(
				req.body,
			);
			const userId = result.userId > 0 ? result.userId : req.userId;
			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});
			if (result.educationAttachments) {
				const d = Math.floor(Date.now() / 1000);
				var educationAttachments = await helper.fileUpload(
					result.educationAttachments,
					`educationDocument${d}`,
					`uploads/${existUser.empCode}`,
				);
			}
			let getInfo = await db.educationDetails.findOne({
				attributes: [
					"userId",
					"educationDegree",
					"educationSpecialisation",
					"educationStartDate",
					"educationCompletionDate",
					"educationInstitute",
					"educationAttachments",
					"educationRemark",
					"isHighestEducation",
					"createdBy",
					"updatedBy",
				],
				where: { educationId: result.educationId },
				raw: true,
			});
			if (getInfo) {
				await db.employeeEducationDetailsHistory.create({
					userId: getInfo.userId,
					educationDegree: getInfo.educationDegree,
					educationSpecialisation: getInfo.educationSpecialisation,
					educationStartDate: getInfo.educationStartDate,
					educationCompletionDate: getInfo.educationCompletionDate,
					educationInstitute: getInfo.educationInstitute,
					educationAttachments: getInfo.educationAttachments,
					educationRemark: getInfo.educationRemark,
					educationActivities: getInfo.educationActivities,
					isHighestEducation: getInfo.isHighestEducation,
				});
				await db.educationDetails.update(
					Object.assign(result, {
						userId: userId,
						...(educationAttachments !== "" && { educationAttachments }),
						updatedBy: req.userId,
						updatedAt: moment(),
					}),
					{
						where: { educationId: result.educationId },
					},
				);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
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
	async addEducationDetails(req, res) {
		try {
			const result = await validator.addEducationDetailsSchema.validateAsync(
				req.body,
			);
			const userId = result.userId > 0 ? result.userId : req.userId;
			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});
			let educationAttachments = null;
			if (result.educationAttachments) {
				const d = Math.floor(Date.now() / 1000);
				educationAttachments = await helper.fileUpload(
					result.educationAttachments,
					`educationDocument${d}`,
					`uploads/${existUser.empCode}`,
				);
			}
			await db.educationDetails.create(
				Object.assign(
					result,
					{
						userId: userId,
						isActive: 1,
					},
					{
						...(educationAttachments != "" && {
							educationAttachments: educationAttachments,
						}),
						createdBy: req.userId,
						createdAt: moment(),
					},
				),
			);

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
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

	async searchEmployee(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
				all,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let empFilters = {};
			const usersData = req.userData;

			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const isAll = all === "true"; // Ensure it's treated as a boolean

			const cacheKey = `employeeList:${process.env.TEST}:${
				req.userId
			}:${isAll ? "all" : pageNo}:${isAll ? "all" : limit}:${
				search || ""
			}:${department || ""}:${designation || ""}:${buSearch || ""}:${
				sbuSearch || ""
			}:${areaSearch || ""}`;

			let employeeData = [];
			await client.get(cacheKey).then(async (data) => {
				if (data) {
					employeeData = JSON.parse(data);
					return respHelper(res, {
						status: 200,
						data: employeeData,
					});
				} else {
					console.log("usersData.role_id", usersData.role_id);
					let myReportyList = await db.employeeMaster.findAll({
						where: {
							manager: req.userId,
						},
						attributes: ["id"],
					});

					let final = myReportyList.map((singleEmp) => singleEmp.id);
					empFilters.id = {
						///appedning SBU to filter
						[Op.in]: final,
					};
					console.log("empFilters", empFilters);

					employeeData = await db.employeeMaster.findAndCountAll({
						order: [["id", "desc"]],
						...(isAll ? {} : { limit, offset }),
						where: Object.assign(
							search
								? {
										[Op.or]: [
											{
												empCode: {
													[Op.like]: `%${search}%`,
												},
											},
											{
												name: {
													[Op.like]: `%${search}%`,
												},
											},
											{
												email: {
													[Op.like]: `%${search}%`,
												},
											},
										],
										[Op.and]: [
											{
												isActive: 1,
												...empFilters,
											},
										],
									}
								: {
										[Op.and]: [
											{
												isActive: 1,
												...empFilters,
											},
										],
									},
						),
						attributes: [
							"id",
							"empCode",
							"name",
							"email",
							"firstName",
							"lastName",
							"officeMobileNumber",
							"buId",
							"sbuId",
							"isActive",
						],
						include: [
							{
								model: db.designationMaster,
								seperate: true,
								attributes: ["name"],
								where: {
									...(designation && {
										name: { [Op.like]: `%${designation}%` },
									}),
									...designationFIlter,
								},
							},
							{
								model: db.departmentMaster,
								seperate: true,
								attributes: ["departmentName"],
								where: {
									...(department && {
										departmentName: { [Op.like]: `%${department}%` },
									}),
									...departmentFIlter,
								},
							},
							{
								model: db.buMaster,
								seperate: true,
								attributes: ["buName", "buCode"],
								where: {
									...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
									...buFIlter,
								},
							},
							{
								model: db.companyMaster,
								seperate: true,
								attributes: ["companyId", "companyName", "companyCode"],
							},
							{
								model: db.sbuMaster,
								seperate: true,
								attributes: ["sbuname", "code"],
								where: {
									...(sbuSearch && {
										sbuname: { [Op.like]: `%${sbuSearch}%` },
									}),
									...sbbuFIlter,
								},
							},
							{
								model: db.functionalAreaMaster,
								seperate: true,
								attributes: ["functionalAreaName"],
								where: {
									...(areaSearch && {
										functionalAreaName: { [Op.like]: `%${areaSearch}%` },
									}),
									...functionAreaFIlter,
								},
							},
							{
								model: db.employeeMaster,
								required: false,
								as: "managerData",
								attributes: ["id", "name", "email", "empCode"],
							},
							{
								model: db.companyLocationMaster,
								attributes: ["address1", "address2"],
							},
						],
					});

					const employeeJson = JSON.stringify(employeeData);
					await client.setEx(cacheKey, parseInt(process.env.TTL), employeeJson); // Cache for 2.3 minutes

					return respHelper(res, {
						status: 200,
						data: employeeData,
					});
				}
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateEmergencyContact(req, res) {
		try {
			const result = await validator.emergencyContactDetails.validateAsync(
				req.body,
			);
			const userId = result.userId > 0 ? result.userId : req.userId;
			const getEmergencyContact = await db.emergencyDetails.findOne({
				raw: true,
				where: {
					userId: userId,
				},
			});

			if (getEmergencyContact) {
				let obj = {
					...result,
					...{ userId: userId },
					...{ updatedBy: req.userId },
					...{ updatedAt: moment() },
					...{ isActive: 1 },
				};
				await db.emergencyDetails.update(obj, {
					where: { userId: userId },
				});

				return respHelper(res, {
					status: 200,
					msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				});
			} else {
				let obj = {
					...result,
					...{ createdBy: req.userId },
					...{ createdAt: moment() },
					...{ userId: userId },
					...{ isActive: 1 },
				};
				await db.emergencyDetails.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.DETAILS_ADDED.replace("<module>", "Details"),
				});
			}
		} catch (error) {
			console.log(error);
			logger.error(error);
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

	async updateAddress(req, res) {
		try {
			const result = await validator.updateAddress.validateAsync(req.body);
			const userId = result.employeeId > 0 ? result.employeeId : req.userId;
			const getAddress = await db.employeeAddress.findOne({
				raw: true,
				where: {
					employeeId: userId,
				},
			});

			if (getAddress) {
				let obj = {
					...result,
					...{ employeeId: userId },
					...{ updatedBy: req.userId },
					...{ updatedAt: moment() },
					...{ isActive: 1 },
				};
				await db.employeeAddress.update(obj, {
					where: { employeeId: userId },
				});

				return respHelper(res, {
					status: 200,
					msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				});
			} else {
				let obj = {
					...result,
					...{ createdBy: req.userId },
					...{ createdAt: moment() },
					...{ employeeId: userId },
					...{ isActive: 1 },
				};

				await db.employeeAddress.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.INSERT_SUCCESS,
				});
			}
		} catch (error) {
			console.log(error);
			logger.error(error);
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
	async getSalutation(req, res) {
		try {
			const getList = await db.salutationMaster.findAll({
				raw: true,
				where: {
					// isActive: 1,
				},
				attributes: ["salutationId", "salutation"],
			});

			return respHelper(res, {
				status: 200,
				data: getList,
				msg: message.DATA_FETCHED,
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
				data: error,
			});
		}
	}

	async uploadDocument(req, res) {
		try {
			const userId = req.body.userId > 0 ? req.body.userId : req.userId;
			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});
			const d = Math.floor(Date.now() / 1000);

			// Initialize an empty object to hold the fields to update
			let updateFields = {};

			// Check each field in the request and upload the file if it exists
			if (req.body.adhrFront) {
				const adhrFront = await helper.fileUpload(
					req.body.adhrFront,
					`aadharFront${d}`,
					`uploads/${existUser.empCode}`,
				);
				updateFields.adhrFront = adhrFront;
			}
			if (req.body.adhrBack) {
				const adhrBack = await helper.fileUpload(
					req.body.adhrBack,
					`aadharBack${d}`,
					`uploads/${existUser.empCode}`,
				);
				updateFields.adhrBack = adhrBack;
			}
			if (req.body.dlImg) {
				const dlImg = await helper.fileUpload(
					req.body.dlImg,
					`drivingLicence${d}`,
					`uploads/${existUser.empCode}`,
				);
				updateFields.dlImg = dlImg;
			}
			if (req.body.panImg) {
				const panImg = await helper.fileUpload(
					req.body.panImg,
					`pan${d}`,
					`uploads/${existUser.empCode}`,
				);
				updateFields.panImg = panImg;
			}
			if (req.body.passportImg) {
				const passportImg = await helper.fileUpload(
					req.body.passportImg,
					`passport${d}`,
					`uploads/${existUser.empCode}`,
				);
				updateFields.passportImg = passportImg;
			}

			// Update the employeeMaster table only with the fields that were uploaded
			await db.employeeMaster.update(updateFields, { where: { id: userId } });

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
				data: error,
			});
		}
	}

	async updateEmployeeInfo(req, res) {
		try {
			const result = await validator.employeeUpdateInfo.validateAsync(req.body);

			const userId = req.body.userId > 0 ? req.body.userId : req.userId;
			await db.employeeMaster.update(req.body, { where: { id: userId } });

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
			});
		} catch (error) {
			logger.error(error);
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
	async addWorkExperience(req, res) {
		try {
			const result = await validator.addemployeeWorkInfo.validateAsync(
				req.body,
			);
			const userId = result.userId == 0 ? req.userId : result.userId;

			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});

			let experienceletter = null;
			if (result.experienceletter && result.experienceletter.trim() !== "") {
				const d = Math.floor(Date.now() / 1000);
				experienceletter = await helper.fileUpload(
					result.experienceletter,
					`workExperience${d}`,
					`uploads/${existUser.empCode}`,
				);
			}

			let obj = {
				...result,
				userId: userId,
				createdBy: req.userId,
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
				isActive: 1,
				...(experienceletter !== "" && { experienceletter: experienceletter }),
			};
			await db.employeeWorkExperience.create(obj);

			return respHelper(res, {
				status: 200,
				msg: constant.DETAILS_ADDED.replace("<module>", "Work Experience"),
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

	async updateWorkExperience(req, res) {
		try {
			const result = await validator.updateemployeeWorkInfo.validateAsync(
				req.body,
			);
			const userId = result.userId == 0 ? req.userId : result.userId;
			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});

			if (result.experienceletter) {
				const d = Math.floor(Date.now() / 1000);
				var experienceletter = await helper.fileUpload(
					result.experienceletter,
					`workExperience${d}`,
					`uploads/${existUser.empCode}`,
				);
			}
			await db.employeeWorkExperience.update(
				{
					...result,
					updatedBy: req.userId,
					updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					...{ userId: userId },
					...(experienceletter !== "" && {
						experienceletter: experienceletter,
					}),
				},
				{
					where: { workExperienceId: result.workExperienceId },
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
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

	async uploadHrDocuments(req, res) {
		try {
			// const userId = req.body.userId > 0 ? req.body.userId : req.userId;
			// const existUser = await db.employeeMaster.findOne({ where: { id: userId } });
			// const d = Math.floor(Date.now() / 1000);
			// // Initialize an empty object to hold the fields to update
			// let updateFields = {};
			// // Check each field in the request and upload the file if it exists
			// if (req.body.meritPlanningLetters) {
			//   const meritPlanningLetters = await helper.fileUpload(req.body.meritPlanningLetters, `meritPlanningLetters${d}`, `uploads/${existUser.empCode}`);
			//   updateFields.meritPlanningLetters = meritPlanningLetters;
			// }
			// if (req.body.confirmationLetters) {
			//   const confirmationLetters = await helper.fileUpload(req.body.confirmationLetters, `confirmationLetters${d}`, `uploads/${existUser.empCode}`);
			//   updateFields.confirmationLetters = confirmationLetters;
			// }
			// if (req.body.pipLetters) {
			//   const pipLetters = await helper.fileUpload(req.body.pipLetters, `pipLetters${d}`, `uploads/${existUser.empCode}`);
			//   updateFields.pipLetters = pipLetters;
			// }
			// if (req.body.bgvReport) {
			//   const bgvReport = await helper.fileUpload(req.body.bgvReport, `bgvReport${d}`, `uploads/${existUser.empCode}`);
			//   updateFields.bgvReport = bgvReport;
			// }
			// if (req.body.employmentRelated) {
			//   const employmentRelated = await helper.fileUpload(req.body.employmentRelated, `employmentRelated${d}`, `uploads/${existUser.empCode}`);
			//   updateFields.employmentRelated = employmentRelated;
			// }
			// if (req.body.insuranceCards) {
			//   const insuranceCards = await helper.fileUpload(req.body.insuranceCards, `insuranceCards${d}`, `uploads/${existUser.empCode}`);
			//   updateFields.insuranceCards = insuranceCards;
			// }
			// // Update the employeeMaster table only with the fields that were uploaded
			// const isDocExists = await db.hrLetters.findOne({where:{userId:userId}});
			// if(isDocExists){
			//   let obj = {
			//     updatedBy:userId,
			//     ...updateFields
			//   }
			//   await db.hrLetters.update(obj, { where: { userId: userId } });
			//   return respHelper(res, {
			//     status: 200,
			//   });
			// }
			// else{
			//   let obj = {
			//     ...{createdBy:userId},
			//     ...updateFields,
			//     ...{userId:userId}
			//   }
			//   await db.hrLetters.create(obj);
			//   return respHelper(res, {
			//     status: 200,
			//   });
			// }
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
				data: error,
			});
		}
	}

	async addCertificates(req, res) {
		try {
			const result = await validator.addEmployeeCertificates.validateAsync(
				req.body,
			);
			const userId = result.userId == 0 ? req.userId : result.userId;

			let obj = {
				...result,
				userId: userId,
				createdBy: req.userId,
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
				isActive: 1,
			};
			await db.employeeCertificates.create(obj);

			return respHelper(res, {
				status: 200,
				msg: constant.DETAILS_ADDED.replace("<module>", "Certificates"),
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

	async updateCertificates(req, res) {
		try {
			const result = await validator.updateEmployeeCertificates.validateAsync(
				req.body,
			);
			const userId = result.userId == 0 ? req.userId : result.userId;

			await db.employeeCertificates.update(
				{
					...result,
					updatedBy: req.userId,
					updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					...{ userId: userId },
				},
				{
					where: { certificateId: result.certificateId },
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
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

	async updateContactInfo(req, res) {
		try {
			const result = await validator.updateContactInfo.validateAsync(req.body);
			const userId = result.userId == 0 ? req.userId : result.userId;

			let query = {
				[Op.or]: [
					{ personalMobileNumber: result.personalMobileNumber },
					...(result.email ? [{ email: result.email }] : []),
					...(result.officeMobileNumber
						? [{ officeMobileNumber: result.officeMobileNumber }]
						: []),
					{ personalEmail: result.personalEmail },
				],
				[Op.and]: [{ id: { [Op.not]: userId } }],
			};

			let existUser = await db.employeeMaster.findOne({ where: query });

			if (existUser) {
				if (
					existUser.email === result.email ||
					existUser.officeMobileNumber === result.officeMobileNumber
				) {
					return respHelper(res, {
						status: 400,
						msg: "Employee company email/mobile no. already exists.",
					});
				} else {
					return respHelper(res, {
						status: 400,
						msg: "Employee personal email/mobile no. already exists.",
					});
				}
			}

			await db.employeeMaster.update(
				{
					...result,
					updatedBy: userId,
					updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
				},
				{
					where: { id: userId },
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
			});
		} catch (error) {
			console.log(error);
			logger.error(error);
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

	async getCategory(req, res) {
		try {
			const categoryData = await db.categoryMaster.findAll({
				where: {
					isActive: 1,
				},
				attributes: ["categoryAutoId", "categoryName", "categoryDesc"],
			});

			return respHelper(res, {
				status: 200,
				data: categoryData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getSubcategory(req, res) {
		try {
			const subCategory = await db.categoryMaster.findOne({
				where: {
					categoryAutoId: req.params.id,
					isActive: 1,
				},
				attributes: ["categoryAutoId", "categoryName", "categoryDesc"],
				include: [
					{
						model: db.subCategoryMaster,
						where: {
							isActive: 1,
						},
						required: true,
						attributes: [
							"subCategoryId",
							"subCategoryDesc",
							"subCategoryName",
							"subCategoryValue",
						],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: subCategory,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async updateIQDetails(req, res) {
		try {
			const result = await validator.updateIQDetailsSchema.validateAsync(
				req.body,
			);
			const userId = result.userId;

			const updateObj = Object.assign(result, {
				updatedAt: moment(),
				updatedBy: req.userId,
			});

			await db.employeeMaster.update(updateObj, {
				where: { id: userId },
			});

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				data: updateObj,
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

	async deleteHRDocument(req, res) {
		try {
			const { letterId } = req.params;
			let response = await db.hrLetters.update(
				{ isActive: 0 },
				{ where: { letterId: letterId } },
			);

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
				data: response,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async uploadHRDocuments(req, res) {
		try {
			const userId = req.body.userId;
			const createdBy = req.userId;
			const updatedBy = req.userId;

			const existUser = await db.employeeMaster.findOne({
				where: { id: userId },
			});
			const d = Math.floor(Date.now() / 1000);

			// Check each field in the request and upload the file if it exists
			if (req.body.meritPlanningLetter) {
				const meritPlanningLetter = await helper.fileUpload(
					req.body.meritPlanningLetter,
					`meritPlanningLetter${d}`,
					`uploads/${existUser.empCode}`,
				);
				let newDocument = {
					userId: userId,
					documentType: 1,
					documentImage: meritPlanningLetter,
					createdBy: createdBy,
				};
				await db.hrLetters.create(newDocument);
			}

			if (req.body.confirmationLetter) {
				const confirmationLetter = await helper.fileUpload(
					req.body.confirmationLetter,
					`confirmationLetter${d}`,
					`uploads/${existUser.empCode}`,
				);
				let newDocument = {
					userId: userId,
					documentType: 2,
					documentImage: confirmationLetter,
					createdBy: createdBy,
				};
				await db.hrLetters.create(newDocument);
			}

			if (req.body.PIPLetters) {
				const PIPLetters = await helper.fileUpload(
					req.body.PIPLetters,
					`PIPLetters${d}`,
					`uploads/${existUser.empCode}`,
				);
				let newDocument = {
					userId: userId,
					documentType: 3,
					documentImage: PIPLetters,
					createdBy: createdBy,
				};
				await db.hrLetters.create(newDocument);
			}

			if (req.body.BGVReport) {
				const BGVReport = await helper.fileUpload(
					req.body.BGVReport,
					`BGVReport${d}`,
					`uploads/${existUser.empCode}`,
				);
				let newDocument = {
					userId: userId,
					documentType: 4,
					documentImage: BGVReport,
					createdBy: createdBy,
				};
				await db.hrLetters.create(newDocument);
			}

			if (req.body.employmentRelated) {
				const employmentRelated = await helper.fileUpload(
					req.body.employmentRelated,
					`employmentRelated${d}`,
					`uploads/${existUser.empCode}`,
				);
				let newDocument = {
					userId: userId,
					documentType: 5,
					documentImage: employmentRelated,
					createdBy: createdBy,
				};
				await db.hrLetters.create(newDocument);
			}

			if (req.body.insuranceCard) {
				const insuranceCard = await helper.fileUpload(
					req.body.insuranceCard,
					`insuranceCard${d}`,
					`uploads/${existUser.empCode}`,
				);

				let insuranceQuery = {
					where: {
						userId: userId,
						documentType: 6,
					},
				};

				let isVerify = await db.hrLetters.findOne(insuranceQuery);
				if (isVerify) {
					let updateDocument = {
						userId: userId,
						documentType: 6,
						documentImage: insuranceCard,
						createdBy: createdBy,
					};
					await db.hrLetters.update(updateDocument, insuranceQuery);
				} else {
					let addDocument = {
						userId: userId,
						documentType: 6,
						documentImage: insuranceCard,
						createdBy: createdBy,
					};
					await db.hrLetters.create(addDocument);
				}
			}

			if (req.body.contractLetter) {
				const contractLetter = await helper.fileUpload(
					req.body.contractLetter,
					`contractLetter${d}`,
					`uploads/${existUser.empCode}`,
				);
				let newDocument = {
					userId: userId,
					documentType: 7,
					documentImage: contractLetter,
					createdBy: createdBy,
				};
				await db.hrLetters.create(newDocument);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Details"),
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
				data: error,
			});
		}
	}

	async actionOnPaymentDetails(req, res) {
		try {
			const result = await validator.actionPaymentSchema.validateAsync(
				req.body,
			);
			const existUser = await db.employeeMaster.findOne({
				raw: true,
				where: {
					id: result.userId,
					isActive: 1,
				},
				attributes: ["name", "empCode", "profileImage"],
				include: [
					{
						model: db.companyMaster,
						attributes: ["senderEmail", "companyLogo"],
					},
				],
			});
			if (result.status == 0) {
				const objForRejction = {
					status: "rejected",
					newBankId: null,
					pendingAt: null,
					newBankNameReq: null,
					newAccountNumberReq: null,
					newAccountHolderNameReq: null,
					newIfscCodeReq: null,
					// comment: null,
					newPaymentAttachment: null,
					newSupportingDocument: null,
				};
				await db.paymentDetails.update(objForRejction, {
					where: { userId: result.userId },
				});

				eventEmitter.emit(
					"paymentDetailsAdminApprovedMail",
					JSON.stringify({
						email: result.email,
						name: existUser.name,
						fields: "Account NumberReq,Swift/IFSC code",
						status: "Rejected",
						comment: result.comment == undefined || "" ? "" : result.comment,
						senderEmail: existUser["companymaster.senderEmail"],
						companyLogo: existUser["companymaster.companyLogo"],
					}),
				);

				pushNotificationEmitter.emit("sendNotification", {
					title: "Profile Request Acknowledgement",
					body: "Your profile update request has been acted upon.",
					employeeId: result.userId,
				});
				return respHelper(res, {
					status: 200,
					msg: constant.PAYMENT_REQUEST_REJECTED,
				});
			} else {
				const getNewChanges = await db.paymentDetails.findOne({
					attributes: { exclude: ["paymentId"] },
					where: { userId: result.userId, status: "pending" },
					raw: true,
				});

				if (getNewChanges) {
					const objForApproval = {
						...result,
						...{
							status: "approved",
							pendingAt: null,
							newBankId: null,
							newBankNameReq: null,
							newAccountNumberReq: null,
							newAccountHolderNameReq: null,
							newIfscCodeReq: null,
							// comment: null,
							newPaymentAttachment: null,
							newSupportingDocument: null,
							paymentAttachment: getNewChanges.newPaymentAttachment,
							updatedBy: req.userId,
							updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						},
					};
					await db.paymentDetailsHistory.create(getNewChanges);
					await db.paymentDetails.update(objForApproval, {
						where: { userId: result.userId },
					});
					eventEmitter.emit(
						"paymentDetailsAdminApprovedMail",
						JSON.stringify({
							email: result.email,
							name: existUser.name,
							fields: "",
							status: "Approved",
							comment: result.comment == undefined || "" ? "" : result.comment,
							senderEmail: existUser["companymaster.senderEmail"],
							companyLogo: existUser["companymaster.companyLogo"],
						}),
					);
					pushNotificationEmitter.emit("sendNotification", {
						title: "Profile Request Acknowledgement",
						body: "Your profile update request has been acted upon.",
						employeeId: result.userId,
					});
					return respHelper(res, {
						status: 200,
						msg: constant.PAYMENT_REQUEST_APPROVED,
						data: {},
					});
				} else {
					return respHelper(res, {
						status: 404,
						msg: constant.DETAILS_NOT_FOUND,
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
	// ritak address approval update paymentaction pending to profileUpdateActionPending
	async profileUpdateActionPending(req, res) {
		try {
			// Add functionality for search and pagination
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const search = req.query.search;

			const usersData = req.userData;
			const filters = await helper.getFiltersByPermission(
				usersData.role_id,
				usersData.permissionAndAccess,
			);

			const hasFilters = Object.values(filters).some(
				(filter) => filter && Object.keys(filter).length > 0,
			);

			if (!hasFilters && usersData.role_id != 2) {
				return respHelper(res, {
					status: 200,
					msg: constant.DATA_FETCHED,
					data: {
						count: 0,
						rows: [],
					},
				});
			}

			let searchQuery = search
				? {
						[Op.or]: [
							{ empCode: { [Op.like]: `%${search}%` } },
							{ name: { [Op.like]: `%${search}%` } },
						],
					}
				: undefined;

			// Fetch pending payment details
			const paymentDetails = await db.paymentDetails.findAll({
				where: {
					status: "pending",
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						required: true,
						where: searchQuery || undefined,
						order: [["requrestTriggred", "DESC"]],
						include: [
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								where: {
									...filters.buFIlter,
								},
							},
							{
								model: db.companyMaster,
								attributes: ["companyName"],
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
								where: {
									...filters.designationFIlter,
								},
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
								where: {
									...filters.departmentFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								where: {
									...filters.sbbuFIlter,
								},
							},
						],
					},
					{
						model: db.bankMaster,
						attributes: ["bankId", "bankName", "bankIfsc"],
					},
					{
						model: db.bankMaster,
						attributes: ["bankId", "bankName", "bankIfsc"],
						as: "newBankName",
					},
				],
			});

			// Fetch pending address details
			const addressDetails = await db.employeeAddress.findAll({
				where: {
					status: "pending",
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						required: true,
						where: searchQuery || undefined,
						order: [["requestTriggered", "DESC"]],
						include: [
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								where: {
									...filters.buFIlter,
								},
							},
							{
								model: db.companyMaster,
								attributes: ["companyName"],
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
								where: {
									...filters.designationFIlter,
								},
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
								where: {
									...filters.departmentFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								where: {
									...filters.sbbuFIlter,
								},
							},
						],
					},
					{
						model: db.cityMaster,
						attributes: ["cityId", "cityName"],
						as: "newCurrentCityDetails",
					},
					{
						model: db.stateMaster,
						attributes: ["stateId", "stateName"],
						as: "newCurrentStateDetails",
					},
					{
						model: db.countryMaster,
						attributes: ["countryId", "countryName"],
						as: "newCurrentCountryDetails",
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincodeId", "pincode"],
						as: "newCurrentPincodeDetails",
					},
					{
						model: db.cityMaster,
						attributes: ["cityId", "cityName"],
						as: "newPermanentCityDetails",
					},
					{
						model: db.stateMaster,
						attributes: ["stateId", "stateName"],
						as: "newPermanentStateDetails",
					},
					{
						model: db.countryMaster,
						attributes: ["countryId", "countryName"],
						as: "newPermanentCountryDetails",
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincodeId", "pincode"],
						as: "newPermanentPincodeDetails",
					},
					{
						model: db.cityMaster,
						attributes: ["cityId", "cityName"],
						as: "newEmergencyCityDetails",
					},
					{
						model: db.stateMaster,
						attributes: ["stateId", "stateName"],
						as: "newEmergencyStateDetails",
					},
					{
						model: db.countryMaster,
						attributes: ["countryId", "countryName"],
						as: "newEmergencyCountryDetails",
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincodeId", "pincode"],
						as: "newEmergencyPincodeDetails",
					},
					{
						model: db.countryMaster,
						attributes: ["countryId", "countryName"],
						as: "currentcountry",
					},
					{
						model: db.countryMaster,
						attributes: ["countryId", "countryName"],
						as: "permanentcountry",
					},
					{
						model: db.countryMaster,
						attributes: ["countryId", "countryName"],
						as: "emergencycountry",
					},
					{
						model: db.stateMaster,
						attributes: ["stateId", "stateName"],
						as: "currentstate",
					},
					{
						model: db.stateMaster,
						attributes: ["stateId", "stateName"],
						as: "permanentstate",
					},
					{
						model: db.stateMaster,
						attributes: ["stateId", "stateName"],
						as: "emergencystate",
					},
					{
						model: db.cityMaster,
						attributes: ["cityId", "cityName"],
						as: "currentcity",
					},
					{
						model: db.cityMaster,
						attributes: ["cityId", "cityName"],
						as: "permanentcity",
					},
					{
						model: db.cityMaster,
						attributes: ["cityId", "cityName"],
						as: "emergencycity",
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincodeId", "pincode"],
						as: "currentpincode",
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincodeId", "pincode"],
						as: "permanentpincode",
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincodeId", "pincode"],
						as: "emergencypincode",
					},
				],
			});
			const paymentDataWithType = paymentDetails.map((item) => ({
				...item.dataValues,
				type: "payment",
				requestTriggered: item.requrestTriggred,
			}));

			const addressDataWithType = addressDetails.map((item) => ({
				...item.dataValues,
				type: "address",
			}));

			// Combine
			const combinedData = [...addressDataWithType, ...paymentDataWithType];
			combinedData.sort((a, b) => b.requestTriggered - a.requestTriggered);
			// Paginate combined data
			const paginatedData = combinedData.slice(offset, offset + limit);

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: {
					count: combinedData.length,
					rows: paginatedData,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	// ritak address approval start
	async actionOnAddressDetails(req, res) {
		// try {
		const result = await validator.actionAddressSchema.validateAsync(req.body);

		const existUser = await db.employeeMaster.findOne({
			raw: true,
			where: {
				id: result.userId,
				isActive: 1,
			},
			attributes: ["name", "empCode", "profileImage"],
			include: [
				{
					model: db.companyMaster,
					attributes: ["senderEmail", "companyLogo"],
				},
			],
		});

		if (result.status === 0) {
			const getNewChanges = await db.employeeAddress.findOne({
				where: { employeeId: result.userId, status: "pending" },
				raw: true,
			});

			if (getNewChanges) {
				// Rejection logic
				const objForRejection = {
					status: "rejected",
					pendingAt: null,
					newCurrentHouse: null,
					newCurrentStreet: null,
					newCurrentStateId: null,
					newCurrentCityId: null,
					newCurrentCountryId: null,
					newCurrentPincodeId: null,
					newCurrentLandmark: null,
					newPermanentCityId: null,
					newPermanentStateId: null,
					newPermanentCountryId: null,
					newPermanentPincodeId: null,
					newPermanentStreet: null,
					newPermanentHouse: null,
					newPermanentLandmark: null,
					newEmergencyStreet: null,
					newEmergencyHouse: null,
					newEmergencyCityId: null,
					newEmergencyStateId: null,
					newEmergencyCountryId: null,
					newEmergencyPincodeId: null,
					newEmergencyLandmark: null,
					comment: result.comment,
					updatedByRole: req.userData["role.name"],
				};

				// Add the comment field to the history data
				const historyData = {
					...getNewChanges,
					status: "rejected",
					updatedByRole: req.userData["role.name"],
					comment: result.comment, // Explicitly add the comment
				};

				await db.employeeAddressHistory.create(historyData);

				await db.employeeAddress.update(objForRejection, {
					where: { employeeId: result.userId },
				});

				eventEmitter.emit(
					"addressDetailsAdminActionMail",
					JSON.stringify({
						email: existUser.email,
						name: existUser.name,
						fields: "Address Details",
						status: "Rejected",
						comment: result.comment || "",
						senderEmail: existUser["companymaster.senderEmail"],
						companyLogo: existUser["companymaster.companyLogo"],
					}),
				);

				return respHelper(res, {
					status: 200,
					msg: constant.ADDRESS_REQUEST_REJECTED,
				});
			} else {
				return respHelper(res, {
					status: 404,
					msg: constant.DETAILS_NOT_FOUND,
				});
			}
		} else {
			// Approval logic
			const getNewChanges = await db.employeeAddress.findOne({
				where: { employeeId: result.userId, status: "pending" },
				raw: true,
			});

			if (getNewChanges) {
				const objForApproval = {
					...result,
					...{
						status: "approved",
						pendingAt: null,
						newCurrentHouse: null,
						newCurrentStreet: null,
						newCurrentStateId: null,
						newCurrentCityId: null,
						newCurrentCountryId: null,
						newCurrentPincodeId: null,
						newCurrentLandmark: null,
						newPermanentCityId: null,
						newPermanentStateId: null,
						newPermanentCountryId: null,
						newPermanentPincodeId: null,
						newPermanentStreet: null,
						newPermanentHouse: null,
						newPermanentLandmark: null,
						newEmergencyStreet: null,
						newEmergencyHouse: null,
						newEmergencyCityId: null,
						newEmergencyStateId: null,
						newEmergencyCountryId: null,
						newEmergencyPincodeId: null,
						newEmergencyLandmark: null,
						comment: result.comment,
						updatedBy: req.userId,
						updatedByRole: req.userData["role.name"],
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					},
				};

				// Add the comment field to the history data
				const historyData = {
					...getNewChanges,
					status: "approved",
					updatedByRole: req.userData["role.name"],
					comment: result.comment, // Explicitly add the comment
				};

				await db.employeeAddressHistory.create(historyData);
				await db.employeeAddress.update(objForApproval, {
					where: { employeeId: result.userId },
				});

				eventEmitter.emit(
					"addressDetailsAdminActionMail",
					JSON.stringify({
						email: existUser.email,
						name: existUser.name,
						fields: "Address Details",
						status: "Approved",
						comment: result.comment || "",
						senderEmail: existUser["companymaster.senderEmail"],
						companyLogo: existUser["companymaster.companyLogo"],
					}),
				);

				return respHelper(res, {
					status: 200,
					msg: constant.ADDRESS_REQUEST_APPROVED,
				});
			} else {
				return respHelper(res, {
					status: 404,
					msg: constant.DETAILS_NOT_FOUND,
				});
			}
		}
		// } catch (error) {
		// 	console.log(error);
		// 	return respHelper(res, {
		// 		status: 500,
		// 	});
		// }
	}

	// ritak address approval end

	//ritak Hr Policy start
	async getHrPolciyCategoryList(req, res) {
		try {
			const { page = 1, limit = 10, search = "" } = req.query;
			const pageNumber = parseInt(page, 10);
			const pageLimit = parseInt(limit, 10);
			const offset = (pageNumber - 1) * pageLimit;

			const whereClause = search ? { name: { [Op.like]: `%${search}%` } } : {};

			const [rows, count] = await Promise.all([
				db.hrPolicyCategories.findAll({
					where: whereClause,
					limit: pageLimit,
					offset,
					order: [["createdAt", "DESC"]],
					include: [
						{
							model: db.hrPolicies,
							as: "policies",
							required: false, // Optional: false = include even if no policies
						},
					],
				}),
				db.hrPolicyCategories.count({ where: whereClause }),
			]);

			return res.status(200).json({
				status: true,
				msg: "Data Fetched successfully",
				data: {
					rows,
					count,
				},
			});
		} catch (error) {
			console.error("Error fetching HR policy categories:", error);
			return res.status(500).json({
				status: false,
				msg: "Internal server error",
			});
		}
	}
	async createHrPolicyCategory(req, res) {
		try {
			let result = await adminValidator.hrPolicyCategorySchema.validateAsync(
				req.body,
			);
			result = { ...result, createdBy: req.userId, isActive: 1 };
			let model = db.hrPolicyCategories;
			let query = { name: result.name };
			let moduleName = "Hr Policy Category";
			let response = await service.create(model, result, query, moduleName);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
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

	async updateHrPolicyCategory(req, res) {
		try {
			let result = await adminValidator.hrPolicyCategorySchema.validateAsync(
				req.body,
			);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.hrPolicyCategories;
			let query = { id: req.params.id };

			let verifyQuery = {
				[Op.not]: { id: req.params.id },
				name: result.name,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace(
						"<module>",
						"Hr Policy Category",
					),
				};
				return respHelper(res, response);
			} else {
				let response = await service.update(model, result, query);
				return respHelper(res, response);
			}
		} catch (error) {
			logger.error(error);
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

	async changeStatusOfHrPolicyCategory(req, res) {
		try {
			let model = db.hrPolicyCategories;
			let query = { id: req.params.id };
			let response = await service.changeStatus(model, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
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

	async deleteOfHrPolicyCategory(req, res) {
		try {
			let model = db.hrPolicyCategories;
			let query = { id: req.params.id };
			let updateMetaData = { isDeleted: 1 };
			let moduleName = "Hr Policy Category";
			let response = await service.delete(
				model,
				updateMetaData,
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getHrPolciyList(req, res) {
		try {
			const {
				page = 1,
				limit = 10,
				search = "",
				categoryId = "",
				is_archived = "",
			} = req.query;
			const pageNumber = parseInt(page, 10);
			const pageLimit = parseInt(limit, 10);
			const offset = (pageNumber - 1) * pageLimit;

			const whereClause = {
				isDeleted: 0,
				category_id: categoryId, // always include category filter
				...(is_archived !== "" && { is_archived }),
				...(search && {
					name: {
						[Op.like]: `%${search}%`,
					},
				}),
			};

			const [rows, count] = await Promise.all([
				db.hrPolicies.findAll({
					where: whereClause,
					limit: pageLimit,
					offset,
					order: [["createdAt", "DESC"]], // Ordering policies by createdAt
					include: [
						{
							model: db.hrPolicyCategories,
							as: "category",
							required: false, // Optional: false = include even if no policies
						},
						{
							model: db.hrPolicySignoffs,
							required: false, // Optional: false = include even if no sign-offs
							include: [
								{
									model: db.employeeMaster,
									attributes: ["empCode", "name"],
									required: false, // Optional: false = include even if no employees
								},
							],
							order: [["updated_at", "DESC"]], // Ensure signoffs are sorted by updated_at
						},
					],
				}),
				db.hrPolicies.count({ where: whereClause }),
			]);

			rows.forEach((policy) => {
				if (policy.hr_policy_signoffs) {
					policy.hr_policy_signoffs.sort((a, b) => {
						if (a.status === "pending" && b.status !== "pending") return 1;
						if (a.status !== "pending" && b.status === "pending") return -1;

						return (
							new Date(b.updated_at).getTime() -
							new Date(a.updated_at).getTime()
						);
					});
				}
			});

			return res.status(200).json({
				status: true,
				msg: "Data Fetched successfully",
				data: {
					rows,
					count,
				},
			});
		} catch (error) {
			console.error("Error fetching HR policy categories:", error);
			return res.status(500).json({
				status: false,
				msg: "Internal server error",
			});
		}
	}

	async createHrPolicy(req, res) {
		try {
			//console.log("req.body",req.body);
			let result = await adminValidator.hrPolicySchema.validateAsync(req.body);
			["effective_date_from", "effective_date_to"].forEach((field) => {
				const dateValue = result[field];
				if (!dateValue || isNaN(new Date(dateValue).getTime())) {
					result[field] = null;
				}
			});

			result = { ...result, createdBy: req.userId, isActive: 1, isEdited: 1 };

			console.log("result", result);
			// Handle file upload for policy document
			if (result.policyDocument) {
				if (!result.policyDocument.startsWith("uploads")) {
					try {
						const timestamp = Date.now();
						const uploadedFilePath = await helper.fileUpload(
							result.policyDocument,
							`policyDocument_${timestamp}`,
							`uploads/hr-documents`,
						);
						result.policyDocument = uploadedFilePath;
					} catch (uploadError) {
						logger.error("Error uploading policy document:", uploadError);
						return respHelper(res, {
							status: 500,
							msg: "Error uploading policy document.",
						});
					}
				} else {
					result.policyDocument = result.policyDocument;
				}
			}

			let model = db.hrPolicies;
			let query = { name: result.name };
			let moduleName = "Hr Policy";

			let response = await service.create(model, result, query, moduleName);
			return respHelper(res, response);
		} catch (error) {
			console.log(error, "error");
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong.",
			});
		}
	}

	async updateHrPolicy(req, res) {
		try {
			let result = await adminValidator.hrPolicySchema.validateAsync(req.body);
			result = {
				...result,
				updatedBy: req.userId,
				updatedAt: moment(),
				isEdited: 1,
			};

			// Handle file upload for policy document
			if (
				result.policyDocument &&
				!result.policyDocument.startsWith("uploads")
			) {
				try {
					const timestamp = Date.now();
					const uploadedFilePath = await helper.fileUpload(
						result.policyDocument,
						`policyDocument_${timestamp}`,
						`uploads/hr-documents`,
					);
					result.policyDocument = uploadedFilePath;
				} catch (uploadError) {
					logger.error("Error uploading policy document:", uploadError);
					return respHelper(res, {
						status: 500,
						msg: "Error uploading policy document.",
					});
				}
			}

			const model = db.hrPolicies;
			const policyId = req.params.id;

			// Revise version logic
			if (result.reviseVersion == 1) {
				const existingPolicy = await model.findOne({ where: { id: policyId } });

				if (!existingPolicy) {
					return respHelper(res, {
						status: 404,
						msg: "HR Policy not found.",
					});
				}

				// Archive the current policy
				await model.update(
					{ is_archived: 1 },
					{ where: { id: parseInt(policyId, 10) } },
				);
				console.log(policyId, "policyId");
				// Calculate the new version
				const currentVersion = parseFloat(existingPolicy.version || 1.0);
				const newVersion = parseFloat((currentVersion + 1.0).toFixed(2));

				// Prepare new policy data
				const newPolicyData = {
					...existingPolicy.toJSON(),
					id: undefined, // So Sequelize generates a new ID
					version: newVersion,
					createdAt: moment(),
					updatedAt: moment(),
					createdBy: req.userId,
					updatedBy: req.userId,
					is_archive: 0,
					isEdited: 1,
				};

				// Apply any updates from request
				Object.assign(newPolicyData, result);

				// Create new revised policy
				const newPolicy = await model.create(newPolicyData);

				return respHelper(res, {
					status: 200,
					msg: "Policy revised successfully.",
					data: newPolicy,
				});
			}
			// Normal update (not a revision)
			const response = await service.update(model, result, { id: policyId });
			return respHelper(res, response);
		} catch (error) {
			console.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong.",
			});
		}
	}

	async changeStatusOfHrPolicy(req, res) {
		try {
			let model = db.hrPolicies;
			let query = { id: req.params.id };
			let response = await service.changeStatus(model, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
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
	async archiveActionOfHrPolicy(req, res) {
		try {
			const model = db.hrPolicies;
			const policyId = req.params.id;

			// Step 1: Find the policy
			const policy = await model.findOne({ where: { id: policyId } });

			if (!policy) {
				return respHelper(res, {
					status: 404,
					msg: "Policy not found",
				});
			}

			// Step 2: Toggle the is_archived value
			const newIsArchived = policy.is_archived ? 0 : 1;

			// Step 3: Update using service
			const updateMetaData = { is_archived: newIsArchived, isActive: 0 };
			const query = { id: policyId };
			const response = await service.update(model, updateMetaData, query);

			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, { status: 500 });
		}
	}

	async deleteOfHrPolicy(req, res) {
		try {
			let model = db.hrPolicies;
			let query = { id: req.params.id };
			console.log("Received id:", req.params.id);

			let updateMetaData = { isDeleted: 1, isActive: 0, updatedAt: moment() };
			let moduleName = "Hr Policy";
			let response = await service.delete(
				model,
				updateMetaData,
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async createUserAssignment(req, res) {
		try {
			const result = await adminValidator.userAssignmentSchema.validateAsync(
				req.body,
			);
			const { name, process_id, conditions } = result;

			const newAssignment = {
				name,
				process_id,
				created_at: new Date(),
				updated_at: new Date(),
			};

			// Create main user_assignment record
			const assignment = await db.user_assignment.create(newAssignment);

			const generatedCode = `UA${String(assignment.id).padStart(3, "0")}`;
			await assignment.update({ code: generatedCode });

			// If conditions are passed, insert them
			if (conditions && conditions.length > 0) {
				const conditionRecords = await Promise.all(
					conditions.map(async (cond) => {
						const attribute = await db.user_assignment_attribute_master.findOne(
							{
								where: { code: cond.attribute },
							},
						);

						if (!attribute) {
							throw new Error(
								`Attribute not found for code: ${cond.attribute}`,
							);
						}

						return {
							user_assignment_id: assignment.id,
							attribute_id: attribute.id,
							condition_type: cond.condition_type,
							attribute_values: cond.attribute_values.join(","),
							created_at: new Date(),
							updated_at: new Date(),
						};
					}),
				);

				await db.user_assignment_condition.bulkCreate(conditionRecords);
			}

			return respHelper(res, {
				status: 200,
				msg: "User Assignment created successfully.",
				data: assignment,
			});
		} catch (error) {
			console.error("Error in createUserAssignment:", error);

			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}

			return respHelper(res, {
				status: 500,
				msg: "Something went wrong.",
			});
		}
	}

	async editUserAssignment(req, res) {
		try {
			const assignmentId = req.params.id;

			// Validate request body
			const result = await adminValidator.userAssignmentSchema.validateAsync(
				req.body,
			);
			const { name, process_id, conditions } = result;

			// Check if assignment exists
			const existingAssignment =
				await db.user_assignment.findByPk(assignmentId);
			if (!existingAssignment) {
				return respHelper(res, {
					status: 404,
					msg: "User Assignment not found.",
				});
			}

			// Update the main assignment record
			await db.user_assignment.update(
				{
					name,
					process_id,
					updated_at: new Date(),
				},
				{
					where: { id: assignmentId },
				},
			);

			// Step 1: Fetch existing conditions for this assignment
			const existingConditions = await db.user_assignment_condition.findAll({
				where: { user_assignment_id: assignmentId },
			});

			// Step 2: Create a map of existing conditions for quick lookup
			const existingMap = new Map();
			existingConditions.forEach((cond) => {
				existingMap.set(cond.attribute_id, cond); // key: attribute_id
			});

			// Step 3: Process incoming conditions
			for (const cond of conditions) {
				const attribute = await db.user_assignment_attribute_master.findOne({
					where: { code: cond.attribute },
				});

				if (!attribute) {
					throw new Error(`Attribute not found for code: ${cond.attribute}`);
				}

				const existing = existingMap.get(attribute.id);

				if (existing) {
					// Update existing condition
					await db.user_assignment_condition.update(
						{
							condition_type: cond.condition_type,
							attribute_values: cond.attribute_values.join(","),
							updated_at: new Date(),
						},
						{
							where: { id: existing.id },
						},
					);
					existingMap.delete(attribute.id); // Mark as handled
				} else {
					// Insert new condition
					await db.user_assignment_condition.create({
						user_assignment_id: assignmentId,
						attribute_id: attribute.id,
						condition_type: cond.condition_type,
						attribute_values: cond.attribute_values.join(","),
						created_at: new Date(),
						updated_at: new Date(),
					});
				}
			}

			// Step 4 (Optional): Delete conditions not present in the new input
			for (const [unusedAttrId, unusedCond] of existingMap.entries()) {
				await db.user_assignment_condition.destroy({
					where: { id: unusedCond.id },
				});
			}

			// Fetch updated assignment (if needed)
			const updatedAssignment = await db.user_assignment.findByPk(assignmentId);

			//===================below code is for appraisal ==============================

			// ================= Appraisal Section =================================
			await helper.handleAppraisalGoalPlanUpdate(assignmentId);
			await helper.handleReviewFrameworkAssignmentNew(assignmentId);

			return respHelper(res, {
				status: 200,
				msg: "User Assignment updated successfully.",
				data: updatedAssignment,
			});
		} catch (error) {
			console.error("Error in editUserAssignment:", error);

			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}

			return respHelper(res, {
				status: 500,
				msg: "Something went wrong.",
			});
		}
	}

	async getUserAssignmentList(req, res) {
		try {
			const { process_id } = req.query;

			const whereClause = process_id
				? {
						[Op.or]: [{ process_id: process_id }, { process_id: 1 }],
					}
				: {};

			const data = await db.user_assignment.findAll({
				where: whereClause,
				include: [
					{
						model: db.user_assignment_process_master,
						as: "process",
						attributes: ["name"],
						required: true,
					},
					{
						model: db.user_assignment_condition,
						as: "conditions", //  alias for conditions
						include: [
							{
								model: db.user_assignment_attribute_master,
								as: "attribute", // optional: alias for attribute master
								attributes: ["name", "code"],
							},
						],
					},
				],
				order: [["name", "ASC"]],
			});

			return respHelper(res, {
				status: 200,
				msg: "Process Masters fetched successfully.",
				data,
			});
		} catch (error) {
			console.error("Error in listProcessMasters:", error);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong while fetching process masters.",
			});
		}
	}

	async exportEmployeesByUserAssignmentId(req, res) {
		const { id } = req.params;

		try {
			const assignment = await db.user_assignment.findOne({
				where: { id },
				include: [
					{
						model: db.user_assignment_condition,
						as: "conditions",
						include: [
							{
								model: db.user_assignment_attribute_master,
								as: "attribute",
								attributes: ["code", "name", "column_mapping"],
							},
						],
					},
				],
			});

			if (!assignment) {
				return respHelper(res, {
					status: 404,
					msg: "User assignment not found.",
				});
			}

			const whereEmployee = {};
			const whereJobDetails = {};
			const validJobColumns = ["jobLevelId", "bandId", "gradeId"];

			for (const condition of assignment.conditions || []) {
				const columnName = condition?.attribute?.column_mapping;
				if (!columnName) continue;

				const valueList = (condition.attribute_values || "")
					.split(",")
					.map((v) => v.trim())
					.filter((v) => v !== "");

				if (!valueList.length) continue;

				const isNumeric = !isNaN(Number(valueList[0]));
				const parsedValues = isNumeric ? valueList.map(Number) : valueList;

				const conditionObject =
					condition.condition_type === "INCLUDE"
						? { [Op.in]: parsedValues }
						: { [Op.notIn]: parsedValues };

				if (validJobColumns.includes(columnName)) {
					whereJobDetails[columnName] = conditionObject;
				} else {
					whereEmployee[columnName] = conditionObject;
				}
			}

			const { rows: employees } = await db.employeeMaster.findAndCountAll({
				where: {
					...whereEmployee,
					isActive: 1,
				},
				include: [
					{
						model: db.jobDetails,
						where: whereJobDetails,
						required: Object.keys(whereJobDetails).length > 0,
						attributes: [],
					},
				],
				attributes: ["id", "empCode", "name", "email"],
			});

			if (!employees.length) {
				return respHelper(res, {
					status: 200,
					msg: "No employees found matching assignment conditions.",
					data: [],
				});
			}

			// Prepare data for Excel
			const data = [
				{
					sheet: "Employees",
					columns: [
						{ label: "Employee ID", value: "id" },
						{ label: "Employee Code", value: "empCode" },
						{ label: "Name", value: "name" },
						{ label: "Email", value: "email" },
					],
					content: employees.map((emp) => emp.dataValues),
				},
			];

			const settings = {
				fileName: `Assignment_${id}_Employee_List`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const file = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Assignment_${id}_Employee_List.xlsx`);
			res.end(file);
		} catch (error) {
			console.error("Error in exportEmployeesByUserAssignmentId:", error);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong while exporting employees.",
			});
		}
	}

	async getUserAssignmentProcessList(req, res) {
		try {
			const data = await db.user_assignment_process_master.findAll({
				where: {},
				order: [["name", "ASC"]],
			});

			return respHelper(res, {
				status: 200,
				msg: "Process Masters fetched successfully.",
				data,
			});
		} catch (error) {
			console.error("Error in listProcessMasters:", error);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong while fetching process masters.",
			});
		}
	}
	async getUserAssignmentAttributeList(req, res) {
		try {
			const data = await db.user_assignment_attribute_master.findAll({
				where: {},
			});

			return respHelper(res, {
				status: 200,
				msg: "Attribute Masters fetched successfully.",
				data,
			});
		} catch (error) {
			console.error("Error in listAttributeMasters:", error);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong while fetching attribute masters.",
			});
		}
	}

	async getUserAssignmentAttributeData(req, res) {
		try {
			const attribute = req.params.attribute?.toUpperCase();
			//console.log("attribute", attribute);

			const attributeModelMap = {
				BU: { model: db.buMaster, idField: "buId", nameField: "buName" },
				SBU: { model: db.sbuMaster, idField: "sbuId", nameField: "sbuName" },
				DEPARTMENT: {
					model: db.departmentMaster,
					idField: "departmentId",
					nameField: "departmentName",
				},
				LOCATION: {
					model: db.cityMaster,
					idField: "cityId",
					nameField: "cityName",
				},
				EMP_TYPE: {
					model: db.employeeTypeMaster,
					idField: "empTypeId",
					nameField: "emptypename",
				},
				EMPID: { model: db.employeeMaster, idField: "id", nameField: "name" },
				COMPANY: {
					model: db.companyMaster,
					idField: "companyId",
					nameField: "companyName",
				},
				BAND: {
					model: db.bandMaster,
					idField: "bandId",
					nameField: "bandDesc",
				},
				FUNCTIONALAREA: {
					model: db.functionalAreaMaster,
					idField: "functionalAreaId",
					nameField: "functionalAreaName",
				},
				GRADE: {
					model: db.gradeMaster,
					idField: "gradeId",
					nameField: "gradeName",
				},
				JOBLEVEL: {
					model: db.jobLevelMaster,
					idField: "jobLevelId",
					nameField: "jobLevelName",
				},
			};

			const modelDetails = attributeModelMap[attribute];
			//	console.log("modelDetails", modelDetails);

			if (!modelDetails) {
				return respHelper(res, { status: 400, msg: "Invalid attribute type" });
			}

			const model = modelDetails.model;
			const idField = modelDetails.idField;
			const nameField = modelDetails.nameField;

			// Determine fields to fetch
			const attributesToFetch = [idField, nameField];
			if (attribute === "EMPID") {
				attributesToFetch.push("empCode");
			}

			// Fetch data
			const data = await model.findAll({
				where: { isActive: true },
				attributes: attributesToFetch,
			});

			// Map data
			const mappedData = data.map((item) => {
				const id = item[idField];
				const name = item[nameField];

				if (attribute === "EMPID") {
					return {
						id,
						name: `${item.empCode} - ${name}`,
					};
				}

				return { id, name };
			});

			return respHelper(res, {
				status: 200,
				msg: "Attribute data fetched",
				data: mappedData,
			});
		} catch (error) {
			console.error("Error in getUserAssignmentAttributeData:", error);
			return respHelper(res, {
				status: 500,
				msg: "Failed to fetch attribute values",
			});
		}
	}

	//ritak Hr Policy end
}

export async function getEmployeesByUserAssignmentId(id) {
	try {
		const assignment = await db.user_assignment.findOne({
			where: { id },
			include: [
				{
					model: db.user_assignment_condition,
					as: "conditions",
					include: [
						{
							model: db.user_assignment_attribute_master,
							as: "attribute",
							attributes: ["code", "name", "column_mapping"],
						},
					],
				},
			],
		});

		//console.log("assignment", assignment);

		if (!assignment) {
			return null; // or throw an error if you prefer
		}

		const whereEmployee = {};
		const whereJobDetails = {};

		const validJobColumns = ["jobLevelId", "bandId", "gradeId"];

		for (const condition of assignment.conditions || []) {
			const columnName = condition?.attribute?.column_mapping;
			if (!columnName) continue;

			const valueList = (condition.attribute_values || "")
				.split(",")
				.map((v) => v.trim())
				.filter((v) => v !== "");

			if (!valueList.length) continue;

			const isNumeric = !isNaN(Number(valueList[0]));
			const parsedValues = isNumeric ? valueList.map(Number) : valueList;

			const conditionObject =
				condition.condition_type === "INCLUDE"
					? { [Op.in]: parsedValues }
					: { [Op.notIn]: parsedValues };

			if (validJobColumns.includes(columnName)) {
				whereJobDetails[columnName] = conditionObject;
			} else {
				whereEmployee[columnName] = conditionObject;
			}
		}

		const { rows: employees } = await db.employeeMaster.findAndCountAll({
			where: {
				...whereEmployee,
				isActive: 1, // Only fetch active employees
			},
			include: [
				{
					model: db.employeeMaster,
					attributes: ["id"],
					as: "managerData",
				},
				{
					model: db.jobDetails,
					where: whereJobDetails,
					required: Object.keys(whereJobDetails).length > 0,
					attributes: ["confirmationDate"],
				},
			],
			attributes: [
				"id",
				"empCode",
				"name",
				"email",
				"dateOfJoining",
				"departmentId",
			],
		});
		//  console.log("employees", employees);
		return employees;
	} catch (error) {
		console.error("Error in getEmployeesByUserAssignmentId:", error);
		throw error;
	}
}

export async function getEmployeesAssignment(process_id) {
	try {
		const assignments = await db.user_assignment.findAll({
			attribute: ["id"],
			where: { process_id },
			include: [
				{
					model: db.user_assignment_condition,
					as: "conditions",
					include: [
						{
							model: db.user_assignment_attribute_master,
							as: "attribute",
							attributes: ["code", "name", "column_mapping"],
						},
					],
				},
			],
		});

		if (!assignments || assignments.length === 0) {
			return null; // or throw an error if preferred
		}
		// Return just assignment ids
		return assignments.map((a) => a.id);
	} catch (error) {
		console.error("Error in getEmployeesAssignment:", error);
		throw error;
	}
}

export async function getEmployeesPragatGoalList(getUserAssigmentIds, userId) {
	try {
		const assignments = await db.user_assignment.findAll({
			where: { id: { [Op.in]: getUserAssigmentIds } },
			include: [
				{
					model: db.user_assignment_condition,
					as: "conditions",
					include: [
						{
							model: db.user_assignment_attribute_master,
							as: "attribute",
							attributes: ["code", "name", "column_mapping"],
						},
					],
				},
			],
		});

		if (!assignments || assignments.length === 0) {
			return null;
		}

		const whereEmployee = {
			[Op.and]: [{ id: userId }],
		};
		const whereJobDetails = {};
		const validJobColumns = ["jobLevelId", "bandId", "gradeId"];

		for (const assignment of assignments) {
			for (const condition of assignment.conditions || []) {
				const columnName = condition?.attribute?.column_mapping;
				if (!columnName) continue;

				const valueList = (condition.attribute_values || "")
					.split(",")
					.map((v) => v.trim())
					.filter((v) => v !== "");

				if (!valueList.length) continue;

				const isNumeric = !isNaN(Number(valueList[0]));
				const parsedValues = isNumeric ? valueList.map(Number) : valueList;

				const conditionObject =
					condition.condition_type === "INCLUDE"
						? { [Op.in]: parsedValues }
						: { [Op.notIn]: parsedValues };
				console.log("conditionObject", conditionObject);
				//if (columnName === "id") continue; // skip if trying to apply conditions on id

				if (validJobColumns.includes(columnName)) {
					whereJobDetails[columnName] = conditionObject;
				} else {
					whereEmployee[Op.and].push({ [columnName]: conditionObject });
				}
			}
		}
		console.log(">>>>>>>>>>>>", whereEmployee);
		const { rows: employees } = await db.employeeMaster.findAndCountAll({
			where: {
				...whereEmployee,
				isActive: 1,
			},
			include: [
				{
					model: db.jobDetails,
					where: whereJobDetails,
					required: Object.keys(whereJobDetails).length > 0,
					attributes: [],
				},
			],
			attributes: ["id", "empCode", "name"],
		});

		return employees;
	} catch (error) {
		console.error("Error in getEmployeesPragatGoalList:", error);
		throw error;
	}
}

export async function getEmployeesToAssignGoalPlan(getUserAssigmentIds) {
	try {
		const idsArray =
			typeof getUserAssigmentIds === "string"
				? getUserAssigmentIds.split(",").map((id) => Number(id.trim()))
				: Array.isArray(getUserAssigmentIds)
					? getUserAssigmentIds
					: [getUserAssigmentIds];

		const assignments = await db.user_assignment.findAll({
			where: {
				id: {
					[Op.in]: idsArray,
				},
			},
			include: [
				{
					model: db.user_assignment_condition,
					as: "conditions",
					include: [
						{
							model: db.user_assignment_attribute_master,
							as: "attribute",
							attributes: ["code", "name", "column_mapping"],
						},
					],
				},
			],
		});

		if (!assignments || assignments.length === 0) {
			return null;
		}

		const whereEmployee = { [Op.and]: [] };
		const whereJobDetails = {};
		const validJobColumns = ["jobLevelId", "bandId", "gradeId"];

		for (const assignment of assignments) {
			for (const condition of assignment.conditions || []) {
				const columnName = condition?.attribute?.column_mapping;
				if (!columnName) continue;

				const valueList = (condition.attribute_values || "")
					.split(",")
					.map((v) => v.trim())
					.filter((v) => v !== "");

				if (!valueList.length) continue;

				const isNumeric = !isNaN(Number(valueList[0]));
				const parsedValues = isNumeric ? valueList.map(Number) : valueList;

				const conditionObject =
					condition.condition_type === "INCLUDE"
						? { [Op.in]: parsedValues }
						: { [Op.notIn]: parsedValues };

				if (validJobColumns.includes(columnName)) {
					whereJobDetails[columnName] = conditionObject;
				} else {
					whereEmployee[Op.and].push({ [columnName]: conditionObject });
				}
			}
		}
		const { rows: employees } = await db.employeeMaster.findAndCountAll({
			where: {
				...whereEmployee,
				isActive: 1,
			},
			include: [
				{
					model: db.jobDetails,
					where: whereJobDetails,
					required: Object.keys(whereJobDetails).length > 0,
					attributes: [],
				},
				{
					model: db.companyMaster,
					attributes: ["companyName", "senderEmail", "companyLogo"],
				},
			],
			attributes: ["id", "empCode", "name", "email"],
		});

		return employees;
	} catch (error) {
		console.error("Error in getEmployeesPragatGoalList:", error);
		throw error;
	}
}

export default new commonController();
