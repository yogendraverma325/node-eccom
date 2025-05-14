import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import commonController from "../common/common.controller.js";
import helper from "../../../helper/helper.js";
import validator from "../../../helper/validator.js";
import { Op } from "sequelize";
import constant from "../../../constant/messages.js";
import eventEmitter from "../../../services/eventService.js";
import fs from "fs";
import moment from "moment";

class UserController {
	async globalSearch(req, res) {
		try {
			const { search, companyId } = req.params;
			const EMP_DATA = await db.employeeMaster.findAll({
				raw: true,
				nest: true,
				attributes: ["id", "empCode", "name", "firstName", "lastName", "email"],
				where: {
					isActive: 1,
					...(companyId && { companyId: companyId }),
					[Op.or]: [
						{ empCode: { [Op.like]: `%${search}%` } },
						{ name: { [Op.like]: `%${search}%` } },
						{ email: { [Op.like]: `%${search}%` } },
						{ "$designationmaster.name$": { [Op.like]: `%${search}%` } },
						{
							"$departmentmaster.departmentName$": { [Op.like]: `%${search}%` },
						},
					],
				},
				include: [
					{
						model: db.designationMaster,
						required: false,
						attributes: ["designationId", "name"],
					},
					{
						model: db.departmentMaster,
						required: false,
						attributes: ["departmentId", "departmentCode", "departmentName"],
					},
				],
			});
			return respHelper(res, {
				status: 200,
				data: EMP_DATA,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async profileDetails(req, res) {
		try {
			const user = req.query.user || req.userId;
			const status = parseInt(req.query.status) || null;

			const EMP_DATA = await db.employeeMaster.findOne({
				where: Object.assign(
					{
						id: user,
					},
					status ? { isActive: status } : {},
				),
				attributes: {
					exclude: ["password", "role_id", "designation_id"],
				},
				include: [
					{
						model: db.salutationMaster,
						required: false,
						attributes: ["salutationId", "salutation"],
					},
					{
						model: db.jobDetails,
						required: false,
						attributes: [
							"dateOfProbationEnd",
							"confirmationDate",
							"confirmationGenerated",
							"noticePeriodStatus",
						],
					},
					{
						model: db.functionalAreaMaster,
						required: false,
						attributes: [
							"functionalAreaId",
							"functionalAreaName",
							"functionalAreaCode",
						],
					},
					{
						model: db.noticePeriodMaster,
						attributes: [
							[
								db.sequelize.literal(`
									CASE 
										WHEN employeejobdetail.confirmationDate IS NULL 
										THEN noticeperiodmaster.nPDaysInProbation
										ELSE noticeperiodmaster.nPDaysAfterConfirmation
									END
								`),
								"nPDaysAfterConfirmation",
							],
						],
						as: "noticeperiodmaster",
					},
					{
						model: db.buMaster,
						required: false,
						attributes: ["buId", "buName", "buCode"],
					},
					{
						model: db.sbuMaster,
						required: false,
						attributes: ["sbuname", "code"],
					},
					{
						model: db.departmentMaster,
						required: false,
						attributes: ["departmentId", "departmentCode", "departmentName"],
					},
					{
						model: db.companyMaster,
						required: false,
						attributes: ["companyId", "companyName", "companyCode"],
						include: [
							{
								model: db.groupCompanyMaster,
								required: false,
								attributes: [
									"groupId",
									"groupCode",
									"groupName",
									"groupShortName",
								],
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
						required: false,
						attributes: ["name"],
					},
					{
						model: db.designationMaster,
						required: false,
						attributes: ["designationId", "name"],
					},
					{
						model: db.employeeMaster,
						as: "reportie",
						where: {
							isActive: 1,
						},
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
								required: false,
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

			return respHelper(res, {
				status: 200,
				data: EMP_DATA,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async personalDetails(req, res) {
		try {
			const user = req.query.user;

			const personalData = await db.employeeMaster.findOne({
				where: {
					id: user ? user : req.userId,
				},
				attributes: { exclude: ["password", "role_id", "designation_id"] },
				include: [
					{
						model: db.salutationMaster,
						attributes: ["salutationId", "salutation"],
					},
					{
						model: db.biographicalDetails,
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
								model: db.employeeMaster,
								attributes: [
									"id",
									"name",
									"firstName",
									"middleName",
									"lastName",
									"dataCardAdmin",
									"visitingCardAdmin",
									"workstationAdmin",
									"lastIncrementDate",
									"iqTestApplicable",
									"mobileAdmin",
									"recruiterName",
									"employeeType",
									"offRoleCTC",
									"highestQualification",
									"ESICPFDeduction",
									"fatherName",
								],
								include: [
									{
										model: db.salutationMaster,
										attributes: ["salutationId", "salutation"],
									},
								],
							},
						],
					},
					{
						model: db.jobDetails,
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
								model: db.employeeMaster,
								attributes: ["id", "companyId"],
								include: [
									{
										model: db.companyLocationMaster,
										attributes: ["address1", "companyLocationId"],
										include: [
											{
												model: db.stateMaster,
												attributes: ["stateId", "stateName"],
											},
											{
												model: db.cityMaster,
												attributes: ["cityId", "cityName"],
											},
										],
									},
								],
							},
							{
								model: db.unionCodIncrementMaster,
								as: "incrementCycle",
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
								model: db.bandMaster,
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
								model: db.gradeMaster,
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
								model: db.jobLevelMaster,
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
								model: db.stateMaster,
								attributes: {
									exclude: [
										"createdAt",
										"createdBy",
										"updatedBy",
										"updatedAt",
										"isActive",
									],
								},
								as: "lwfStateName",
							},
							{
								model: db.lwfDesignationMaster,
								attributes: ["lwfDesignationId", "lwfDesignationName"],
								as: "lwfDesignationName",
							},
							{
								model: db.probationMaster,
								attributes: [
									"probationId",
									"probationName",
									"durationOfProbation",
								],
								required: false,
							},
						],
					},
					{
						model: db.emergencyDetails,
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
						model: db.familyDetails,
						required: false,
						where: {
							isActive: 1,
						},
						attributes: {
							exclude: [
								"isActive",
								"createdAt",
								"createdBy",
								"updatedBy",
								"updatedAt",
							],
						},
					},
					{
						model: db.educationDetails,
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
							isActive: 1,
						},
						required: false,
						include: [
							{
								model: db.degreeMaster,
							},
						],
					},
					{
						model: db.paymentDetails,
						required: false,
						// where: {
						//   status: "approved",
						// },
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
								model: db.bankMaster,
								attributes: ["bankId", "bankName", "bankIfsc"],
							},
							{
								model: db.bankMaster,
								attributes: ["bankId", "bankName", "bankIfsc"],
								as: "newBankName",
							},
							{
								model: db.stateMaster,
								attributes: ["stateId", "stateName"],
								required: false,
							},
							{
								model: db.ptLocationMaster,
								attributes: ["ptLocationId", "ptLocationName"],
								required: false,
							},
						],
					},
					{
						model: db.vaccinationDetails,
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
						model: db.employeeAddress,
						include: [
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
							//ritak adddress approval start
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
							//ritak address approval end
						],
					},
					{
						model: db.employeeWorkExperience,
						where: {
							isActive: 1,
						},
						required: false,
					},
					{
						model: db.hrLetters,
						required: false,
						where: {
							isActive: { [Op.not]: false },
						},
						attributes: ["documentType", "documentImage", "letterId", "userId"],
						include: {
							model: db.hrDocumentMaster,
							attributes: ["documentId", "documentName"],
						},
					},
					{
						model: db.employeeCertificates,
					},
					{
						model: db.degreeMaster,
						attributes: ["degreeId", "degreeName"],
						required: false,
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: personalData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async dashboardCard(req, res) {
		try {
			await commonController.dashboardCard(req, res);
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async changePassword(req, res) {
		try {
			const result = await validator.changePasswordSchema.validateAsync(
				req.body,
			);
			const hashedPassword = await helper.encryptPassword(result.password);

			await db.employeeMaster.update(
				{
					password: hashedPassword,
					isTempPassword: 0,
					passwordExpiryDate: moment().add(
						parseInt(process.env.PASSWORD_EXPIRY_LIMIT),
						"days",
					),
				},
				{
					where: {
						id: req.userId,
					},
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.PASSWORD_CHANGED,
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

	async taskBoxCount(req, res) {
		try {
			let userid = req.userId;
			let role_id = req.userData.role_id;
			let user = req.query.user;

			const mainCondition = {
				employeeId: req.userId,
				source: { [Op.ne]: "system_generated" },
				status: "pending",
				// ...(user && { createdBy: user })
			};

			const leaveApprovalCondition = {
				employeeId: req.userId,
				isApproved: {
					[Op.notIn]: [2],
				},
			};

			const countLeavePending = await db.EmployeeLeaveHeader.count({
				where: mainCondition,
				attributes: [],
				include: [
					{
						model: db.leaveApprovalTrails,
						required: true,
						where: leaveApprovalCondition,
					},
				],
				distinct: true,
			});

			const pendingAttendanceCount = await db.attendanceHistory.count({
				where: {
					attendanceStatus: "pending",
				},
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
				distinct: true,
			});

			const mainCondition1 = {
				status: "pending",
				...(user && { employeeId: user }),
			};

			const leaveApprovalCondition2 = {
				isVisible: true,
				pendingOn: req.userId,
				isApproved: 0,
				isPending: 1,
			};

			const countLeaveAssgined = await db.EmployeeLeaveHeader.count({
				where: mainCondition1,
				attributes: [],
				include: [
					{
						model: db.leaveApprovalTrails,
						required: true,
						where: leaveApprovalCondition2,
					},
				],
				distinct: false,
			});

			let assignedAttCount = await db.regularizationMaster.count({
				where: {
					regularizeManagerId: userid,
					regularizeStatus: "Pending",
				},
				include: {
					model: db.attendanceMaster,
					attributes: {
						exclude: [],
					},
					where: { employeeId: { [Op.not]: req.userId } },
					required: true,
				},
			});
			let pendingAttCount = await db.regularizationMaster.count({
				where: {
					regularizeStatus: "Pending",
					// createdBy: userid,
				},
				include: {
					model: db.attendanceMaster,
					attributes: {
						exclude: [],
					},
					where: { employeeId: req.userId },
					required: true,
				},
			});

			let userId = req.userId;
			let compOffbalabceForUser = await helper.compOffbalabceForUser(
				userId,
				"Pending",
			);

			compOffbalabceForUser = compOffbalabceForUser?.length || 0;

			let pendingSeperationCount = await db.separationMaster.count({
				where: {
					[Op.or]: [
						{
							employeeId: req.userId,
							finalStatus: 1,
						},
						{
							pendingAt: req.userId,
							finalStatus: {
								[Op.in]: [5, 2],
							},
						},
					],
				},
			});

			const pendingSeperationWorkFlowCount =
				await db.separationInitiatedTask.count({
					where: {
						status: 0,
						isActive: 1,
					},
					include: [
						{
							model: db.employeeMaster,
							required: true,
							attributes: [],
							include: [
								{
									model: db.separationMaster,
									attributes: [],
									required: true,
									where: {
										finalStatus: 9,
										resignationAutoId: db.Sequelize.col(
											"separationinitiatedtask.resignationAutoId",
										),
									},
								},
							],
						},
						{
							model: db.separationTaskOwner,
							attributes: [],
							required: true,
							where: {
								taskOwner: req.userId,
							},
						},
					],
					distinct: true,
				});

			const confirmationCount = await db.Confirmationinitiated.count({
				where: {
					status: [0, 2],
				},
				include: [
					{
						model: db.Confirmationowners,
						attributes: [],
						where: {
							employeeId: req.userId,
						},
					},
				],
				distinct: true,
			});

			let profileApprovalCount = 0;

			const usersData = req.userData;
			const filters = await helper.getFiltersByPermission(
				usersData.role_id,
				usersData.permissionAndAccess,
			);

			const hasFilters = Object.values(filters).some(
				(filter) => filter && Object.keys(filter).length > 0,
			);

			if (role_id == 2 || (role_id == 5 && hasFilters === true)) {
				profileApprovalCount = await db.paymentDetails.count({
					where: {
						status: "pending",
						// pendingAt: req.userId,
					},
					include: [
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							required: true,
							include: [
								{
									model: db.buMaster,
									attributes: [],
									where: {
										...filters.buFIlter,
									},
								},
								{
									model: db.designationMaster,
									attributes: [],
									where: {
										...filters.designationFIlter,
									},
								},
								{
									model: db.departmentMaster,
									attributes: [],
									where: {
										...filters.departmentFIlter,
									},
								},
								{
									model: db.sbuMaster,
									attributes: [],
									where: {
										...filters.sbbuFIlter,
									},
								},
							],
						},
					],
				});

				let addressCount = await db.employeeAddress.count({
					where: {
						status: "pending",
					},
				});

				profileApprovalCount = profileApprovalCount + addressCount;
			}

			const pragatiGoalCount = await db.goalAreaPragatiTrail.count({
				where: {
					pendingAt: req.userId,
					isApproved: [0],
				},
			});

			const totalCount =
				countLeavePending +
				countLeaveAssgined +
				pendingAttCount +
				assignedAttCount +
				pendingAttendanceCount +
				pendingSeperationCount +
				pendingSeperationWorkFlowCount +
				confirmationCount +
				compOffbalabceForUser +
				profileApprovalCount +
				pragatiGoalCount;

			return respHelper(res, {
				status: 200,
				data: {
					web: {
						leaveData: {
							raisedByMe: countLeavePending,
							assignedToMe: countLeaveAssgined,
						},
						attedanceData: {
							raisedByMe: pendingAttCount,
							assignedToMe: assignedAttCount,
						},
						pendingAttendance: {
							raisedByMe: 0,
							assignedToMe: pendingAttendanceCount,
						},
						seperationCount: {
							raisedByMe: 0,
							assignedToMe: pendingSeperationCount,
						},
						seperationWorkflowCount: {
							raisedByMe: 0,
							assignedToMe: pendingSeperationWorkFlowCount,
						},
						confirmationCount: {
							raisedByMe: 0,
							assignedToMe: confirmationCount,
						},
						compoffCount: {
							raisedByMe: 0,
							assignedToMe: compOffbalabceForUser,
						},
						profileApprovalCount: {
							raisedByMe: 0,
							assignedToMe: profileApprovalCount,
						},
						totalCount: totalCount,
						pragatiGoalCount: pragatiGoalCount,
					},
					mobile: {
						raisedByMe: {
							leaveData: countLeavePending,
							attedanceData: pendingAttCount,
							seperationCount: 0,
							pendingAttendanceCount: 0,
							compOffCount: 0,
						},
						assignedToMe: {
							leaveData: countLeaveAssgined,
							attedanceData: assignedAttCount,
							seperationCount: pendingSeperationCount,
							pendingAttendanceCount,
							compOffCount: compOffbalabceForUser,
						},
					},
				},
				msg: "Task Box Listed",
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
				data: error,
			});
		}
	}

	async updateProfilePicture(req, res) {
		try {
			const result = await validator.updateProfilePictureSchema.validateAsync(
				req.body,
			);

			const existUser = await db.employeeMaster.findOne({
				raw: true,
				where: {
					id: result.user,
					isActive: 1,
				},
				attributes: ["empCode", "profileImage"],
			});

			if (!existUser) {
				return respHelper(res, {
					status: 400,
					msg: constant.USER_NOT_EXIST,
				});
			}

			const d = Math.floor(Date.now() / 1000);
			const profilePicture = await helper.fileUpload(
				result.image,
				`profileImage_${d}`,
				`uploads/${existUser.empCode}`,
			);

			await db.employeeMaster.update(
				{
					profileImage: profilePicture,
				},
				{
					where: {
						id: result.user,
					},
				},
			);

			if (existUser.profileImage) {
				fs.unlinkSync(existUser.profileImage);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.PROFILE_PICTURE_UPDATED,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async forgotPassword(req, res) {
		try {
			const result = await validator.forgotPasswordSchema.validateAsync(
				req.body,
			);

			const getEmployee = await db.employeeMaster.findOne({
				where: {
					[Op.or]: [
						{
							email: result.email,
						},
						{
							officeMobileNumber: result.email,
						},
					],
					isActive: 1,
				},
				include: [
					{
						model: db.companyMaster,
						attributes: ["senderEmail", "companyLogo"],
					},
				],
			});

			if (getEmployee) {
				const otp = await helper.generateOTP(6);
				eventEmitter.emit(
					"forgotPasswordMail",
					JSON.stringify({
						email: getEmployee.dataValues.email,
						otp: otp,
						senderEmail: getEmployee.companymaster.senderEmail,
						companyLogo: getEmployee.companymaster.companyLogo,
					}),
				);

				if (getEmployee.dataValues.officeMobileNumber) {
					eventEmitter.emit(
						"forgotPasswordSMS",
						JSON.stringify({
							mobile: getEmployee.dataValues.officeMobileNumber.split(","),
							otp: otp,
						}),
					);
				}

				const deocdeOTP = await helper.generateJwtOTPEncrypt({
					id: getEmployee.id,
					email: result.email,
					otp: otp,
				});
				return respHelper(res, {
					status: 200,
					msg: constant.OTP_SENT,
					data: deocdeOTP,
				});
			} else {
				return respHelper(res, {
					status: 400,
					msg: constant.INVALID.replace(
						"<module>",
						"Email ID / Official Mobile Number",
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

	async verifyOTP(req, res) {
		try {
			const { data, otp } = req.body;
			const compareOTP = await helper.generateJwtOTPDecrypt(data);
			if (compareOTP) {
				if (compareOTP.otp == otp) {
					return respHelper(res, {
						status: 200,
						msg: constant.OTP_VERIFIED,
						data: { id: compareOTP.id },
					});
				} else {
					return respHelper(res, {
						status: 400,
						msg: constant.OTP_NOT_MATACHED,
						data: {},
					});
				}
			} else {
				return respHelper(res, {
					status: 400,
					msg: constant.OTP_EXPIRED,
					data: {},
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 400,
				msg: constant.OTP_EXPIRED,
				data: {},
			});
		}
	}

	async resetPassword(req, res) {
		try {
			const { id, newPassword } = req.body;
			await db.employeeMaster.update(
				{
					password: await helper.encryptPassword(newPassword),
					isTempPassword: 0,
					passwordExpiryDate: moment().add(
						parseInt(process.env.PASSWORD_EXPIRY_LIMIT),
						"days",
					),
				},
				{ where: { id: id } },
			);
			return respHelper(res, {
				status: 200,
				msg: constant.PASSWORD_CHANGED,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async initiateSeparation(req, res) {
		try {
			const result = await validator.separationByEmployee.validateAsync(
				req.body,
			);
			const user = req.query.user || req.userId;

			const existSeparationData = await db.separationMaster.findOne({
				where: {
					employeeId: user,
					finalStatus: {
						[Op.notIn]: [3, 6, 7, 10, 11],
					},
				},
			});

			if (existSeparationData) {
				return respHelper(res, {
					status: 400,
					msg: constant.SEPARATION_ALREADY_SUBMITTED,
				});
			}

			const existUser = await db.employeeMaster.findOne({
				where: {
					id: user,
				},
				include: [
					{
						model: db.jobDetails,
						attributes: ["confirmationDate"],
						as: "employeeJobDetails",
					},
					{
						model: db.noticePeriodMaster,
						attributes: [
							[
								db.sequelize.literal(`
									CASE 
										WHEN employeeJobDetails.confirmationDate IS NULL 
										THEN noticeperiodmaster.nPDaysInProbation
										ELSE noticeperiodmaster.nPDaysAfterConfirmation
									END
								`),
								"nPDaysAfterConfirmation",
							],
						],
						as: "noticeperiodmaster",
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName"],
					},
					{
						model: db.designationMaster,
						attributes: ["name"],
					},
					{
						model: db.employeeMaster,
						as: "managerData",
						attributes: ["name", "email"],
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "senderEmail", "companyLogo"],
					},
				],
			});

			const headAndHrData = await db.buMapping.findOne({
				where: {
					buId: existUser.dataValues.buId,
					companyId: existUser.dataValues.companyId,
				},
				attributes: ["buMappingId"],
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

			const lastWorkingDay = moment(result.resignationDate, "YYYY-MM-DD").add(
				parseInt(
					existUser.dataValues.noticeperiodmaster.nPDaysAfterConfirmation,
				) - 1,
				"days",
			);

			const d = Math.floor(Date.now() / 1000);

			const createdData = await db.separationMaster.create({
				employeeId: existUser.dataValues.id,
				initiatedBy: "Self",
				noticePeriodDay:
					existUser.dataValues.noticeperiodmaster.nPDaysAfterConfirmation,
				noticePeriodLastWorkingDay: lastWorkingDay.format("YYYY-MM-DD"),
				resignationDate: result.resignationDate,
				empProposedLastWorkingDay: result.empProposedLastWorkingDay,
				empProposedRecoveryDays:
					result.empProposedRecoveryDays > 0
						? result.empProposedRecoveryDays
						: 0,
				empReasonOfResignation: result.empReasonOfResignation,
				empNewOrganizationName:
					result.empNewOrganizationName != ""
						? result.empNewOrganizationName
						: null,
				empSalaryHike: result.empSalaryHike,
				empPersonalEmailId: result.empPersonalEmailId,
				empPersonalMobileNumber: result.empPersonalMobileNumber,
				empRemark: result.empRemark,
				pendingAt: existUser.dataValues.manager,
				finalStatus: 2,
				empAttachment: result.attachment
					? await helper.fileUpload(
						result.attachment,
						`separation_attachment_${d}`,
						`uploads/${existUser.dataValues.empCode}`,
					)
					: null,
				empSubmissionDate: moment(),
				createdDt: moment(),
				createdAt: req.userId,
			});

			await db.jobDetails.update(
				{
					noticePeriodStatus: 1,
				},
				{
					where: {
						userId: user,
					},
				},
			);

			await db.separationTrail.create({
				separationAutoId: createdData.dataValues.resignationAutoId,
				separationStatus: 2,
				pending: 0,
				pendingAt: user,
				createdBy: req.userId,
				actionDate: moment(),
				createdDt: moment(),
			});

			await db.separationTrail.create({
				separationAutoId: createdData.dataValues.resignationAutoId,
				separationStatus: 5,
				pending: 1,
				pendingAt: existUser.dataValues.manager,
				createdBy: req.userId,
				createdDt: moment(),
			});

			await db.separationTrail.create({
				separationAutoId: createdData.dataValues.resignationAutoId,
				separationStatus: 9,
				pending: 1,
				pendingAt: existUser.dataValues.buHRId,
				createdBy: req.userId,
				createdDt: moment(),
			});

			eventEmitter.emit(
				"initiateSeparation",
				JSON.stringify({
					email: existUser.dataValues.managerData.email,
					recipientName: existUser.dataValues.managerData.name,
					empName: existUser.dataValues.name,
					empDesignation: existUser.dataValues.designationmaster.name,
					empDepartment: existUser.dataValues.departmentmaster.departmentName,
					companyName: existUser.dataValues.companymaster.companyName,
					senderEmail: existUser.dataValues.companymaster.senderEmail,
					companyLogo: existUser.dataValues.companymaster.companyLogo,
				}),
			);

			eventEmitter.emit(
				"initiateSeparation",
				JSON.stringify({
					email: headAndHrData.dataValues.buhrData.email,
					recipientName: headAndHrData.dataValues.buhrData.name,
					empName: existUser.dataValues.name,
					empDesignation: existUser.dataValues.designationmaster.name,
					empDepartment: existUser.dataValues.departmentmaster.departmentName,
					companyName: existUser.dataValues.companymaster.companyName,
					senderEmail: existUser.dataValues.companymaster.senderEmail,
					companyLogo: existUser.dataValues.companymaster.companyLogo,
				}),
			);

			eventEmitter.emit(
				"separationUserAcknowledge",
				JSON.stringify({
					email: existUser.dataValues.email,
					companyName: existUser.dataValues.companymaster.companyName,
					senderEmail: existUser.dataValues.companymaster.senderEmail,
					companyLogo: existUser.dataValues.companymaster.companyLogo,
				}),
			);

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_STATUS.replace("<status>", "Initiated"),
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

	async separationDetails(req, res) {
		try {
			// add search and pagination functionality

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

			const separationData = await db.separationMaster.findAndCountAll({
				where: {
					[Op.or]: [
						{
							employeeId: req.query.user || req.userId,
							finalStatus: req.query.user ? null : 1,
						},
						{
							pendingAt: req.userId,
							finalStatus: {
								[Op.in]: [5, 2],
							},
						},
					],
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name"],
						required: !!searchQuery,
						where: searchQuery || undefined,
					},
					{
						model: db.separationStatus,
						attributes: ["separationStatusCode", "separationStatusDesc"],
					},
					{
						model: db.separationType,
						as: "l2Separationtype",
						attributes: ["separationTypeName"],
					},
					{
						model: db.separationReason,
						as: "empReasonofResignation",
						attributes: ["separationReason"],
					},
					{
						model: db.separationReason,
						as: "l2ReasonofSeparation",
						attributes: ["separationReason"],
					},
					{
						model: db.separationReason,
						as: "l1ReasonofResignation",
						attributes: ["separationReason"],
					},
				],
				limit,
				offset,
				required: !!searchQuery,
				distinct: true,
			});

			return respHelper(res, {
				status: 200,
				data: separationData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async managerInputOnseparation(req, res) {
		try {
			const result = await validator.managerInputOnseparation.validateAsync(
				req.body,
			);

			const separationData = await db.separationMaster.findOne({
				where: {
					resignationAutoId: result.resignationAutoId,
				},
				attributes: ["initiatedBy"],
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name", "email", "buHRId"],
						include: [
							{
								model: db.companyMaster,
								attributes: ["companyName", "senderEmail", "companyLogo"],
							},
							{
								model: db.employeeMaster,
								as: "buhrData",
								attributes: ["name", "email"],
							},
							{
								model: db.buMaster,
								attributes: ["buName"],
							},
							{
								model: db.employeeMaster,
								as: "managerData",
								attributes: ["email", "name"],
							},
						],
					},
				],
			});

			const d = Math.floor(Date.now() / 1000);

			await db.separationMaster.update(
				{
					l1ProposedLastWorkingDay: result.l1ProposedLastWorkingDay,
					l1ProposedRecoveryDays: result.l1ProposedRecoveryDays,
					l1ReasonForProposedRecoveryDays:
						result.l1ReasonForProposedRecoveryDays,
					l1ReasonOfResignation: result.l1ReasonOfResignation,
					l1BillingType: result.l1BillingType,
					l1CustomerName:
						result.l1CustomerName != "" ? result.l1CustomerName : null,
					replacementRequired: result.replacementRequired,
					replacementRequiredBy:
						result.replacementRequiredBy != ""
							? result.replacementRequiredBy
							: null,
					l1Remark: result.l1Remark,
					l1Attachment: result.attachment
						? await helper.fileUpload(
							result.attachment,
							`separation_attachment_${d}`,
							`uploads/${separationData.dataValues.employee.empCode}`,
						)
						: null,
					l1SubmissionDate: moment(),
					pendingAt: separationData.dataValues.employee.buHRId,
					l1RequestStatus: "Approved",
					finalStatus: 5,
				},
				{
					where: {
						resignationAutoId: result.resignationAutoId,
					},
				},
			);

			await db.separationTrail.update(
				{
					actionUserRole: req.userRole,
					pendingAt: req.userId,
					pending: 0,
					actionDate: moment(),
					updatedBy: req.userId,
					updatedDt: moment(),
				},
				{
					where: {
						separationAutoId: result.resignationAutoId,
						separationStatus: 5,
					},
				},
			);

			eventEmitter.emit(
				"separationApprovalAcknowledgementToUser",
				JSON.stringify({
					email: separationData.dataValues.employee.email,
					recipientName: separationData.dataValues.employee.name,
					companyName:
						separationData.dataValues.employee.companymaster.companyName,
					senderEmail:
						separationData.dataValues.employee.companymaster.senderEmail,
					companyLogo:
						separationData.dataValues.employee.companymaster.companyLogo,
				}),
			);

			eventEmitter.emit(
				"managerApprovesSeparation",
				JSON.stringify({
					email: separationData.dataValues.employee.buhrData.email,
					recipientName: separationData.dataValues.employee.buhrData.name,
					empName: separationData.dataValues.employee.name,
					empCode: separationData.dataValues.employee.empCode,
					bu: separationData.dataValues.employee.bumaster.buName,
					managerName: separationData.dataValues.employee.managerData.name,
					senderEmail:
						separationData.dataValues.employee.companymaster.senderEmail,
					companyLogo:
						separationData.dataValues.employee.companymaster.companyLogo,
				}),
			);

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_STATUS.replace("<status>", "Approved"),
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

	async onBehalfManager(req, res) {
		try {
			const result = await validator.onBehalfSeperationByManager.validateAsync(
				req.body,
			);
			const user = result.userId || req.userId;

			const existSeparationData = await db.separationMaster.findOne({
				where: {
					employeeId: user,
					finalStatus: {
						[Op.notIn]: [3, 6, 7, 10, 11],
					},
				},
			});

			if (existSeparationData) {
				return respHelper(res, {
					status: 400,
					msg: constant.SEPARATION_ALREADY_SUBMITTED,
				});
			}

			const existUser = await db.employeeMaster.findOne({
				where: {
					id: user,
				},
				include: [
					{
						model: db.jobDetails,
						attributes: ["confirmationDate"],
						as: "employeeJobDetails",
					},
					{
						model: db.noticePeriodMaster,
						attributes: [
							[
								db.sequelize.literal(`
									CASE 
										WHEN employeeJobDetails.confirmationDate IS NULL 
										THEN noticeperiodmaster.nPDaysInProbation
										ELSE noticeperiodmaster.nPDaysAfterConfirmation
									END
								`),
								"nPDaysAfterConfirmation",
							],
						],
						as: "noticeperiodmaster",
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "senderEmail", "companyLogo"],
					},
					{
						model: db.employeeMaster,
						as: "buhrData",
						attributes: ["name", "email"],
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
					},
					{
						model: db.employeeMaster,
						as: "managerData",
						attributes: ["email", "name"],
					},
				],
			});
			const lastWorkingDay = moment(result.resignationDate, "YYYY-MM-DD").add(
				parseInt(
					existUser.dataValues.noticeperiodmaster.nPDaysAfterConfirmation,
				) - 1,
				"days",
			);

			const d = Math.floor(Date.now() / 1000);
			let separationEmpAttachment = null;
			if (result.l1Attachment != "") {
				separationEmpAttachment = await helper.fileUpload(
					result.l1Attachment,
					`separation_attachment_${d}`,
					`uploads/${existUser.dataValues.empCode}`,
				);
			}
			const empRequestedLastWorkingDay = moment(
				result.empProposedLastWorkingDay,
				"YYYY-MM-DD",
			);
			const empProposedLastWorkingDay = moment(
				result.l1ProposedLastWorkingDay,
				"YYYY-MM-DD",
			);
			const recoveryDays = lastWorkingDay.diff(
				empRequestedLastWorkingDay,
				"days",
			);
			const proposedRecoveryDays = empProposedLastWorkingDay.diff(
				lastWorkingDay,
				"days",
			);
			let onBehalfObject = {
				employeeId: existUser.dataValues.id,
				resignationDate: result.resignationDate,
				//initiatedBy: "Other",
				initiatedBy: "Manager",
				noticePeriodDay:
					existUser.dataValues.noticeperiodmaster.nPDaysAfterConfirmation,
				noticePeriodLastWorkingDay: lastWorkingDay.format("YYYY-MM-DD"),
				empProposedLastWorkingDay: result.empProposedLastWorkingDay,
				empProposedRecoveryDays: recoveryDays > 0 ? recoveryDays - 1 : 0,
				l1ProposedLastWorkingDay: result.l1ProposedLastWorkingDay,
				l1ProposedRecoveryDays:
					result.l1ProposedRecoveryDays != ""
						? result.l1ProposedRecoveryDays
						: 0,
				l1BillingType: result.l1BillingType,
				l1CustomerName:
					result.l1CustomerName != "" ? result.l1CustomerName : null,
				replacementRequired: result.replacementRequired,
				replacementRequiredBy:
					result.replacementRequiredBy != ""
						? result.replacementRequiredBy
						: null,
				l1ReasonForProposedRecoveryDays: result.l1ReasonForProposedRecoveryDays,
				l1ReasonOfResignation: result.l1ReasonOfResignation,
				l1Remark: result.l1Remark != "" ? result.l1Remark : null,
				l1SubmissionDate: moment(),
				l1RequestStatus: "Approved",
				finalStatus: 5,
				submitType: result.submitType,
				createdBy: req.userId,
				createdDt: moment(),
				pendingAt: existUser.dataValues.buHRId,
				l1Attachment: separationEmpAttachment,
			};
			const createdData = await db.separationMaster.create(onBehalfObject);

			await db.jobDetails.update(
				{
					noticePeriodStatus: 1,
				},
				{
					where: {
						userId: user,
					},
				},
			);

			await db.separationTrail.create({
				actionUserRole: req.userRole,
				separationAutoId: createdData.dataValues.resignationAutoId,
				separationStatus: 5,
				actionDate: moment(),
				pending: 0,
				pendingAt: existUser.dataValues.manager,
				createdBy: req.userId,
				createdDt: moment(),
			});

			await db.separationTrail.create({
				separationAutoId: createdData.dataValues.resignationAutoId,
				separationStatus: 9,
				pending: 1,
				pendingAt: existUser.dataValues.buHRId,
				createdBy: req.userId,
				createdDt: moment(),
			});

			eventEmitter.emit(
				"separationUserAcknowledge",
				JSON.stringify({
					email: existUser.dataValues.email,
					companyName: existUser.dataValues.companymaster.companyName,
					senderEmail: existUser.dataValues.companymaster.senderEmail,
					companyLogo: existUser.dataValues.companymaster.companyLogo,
				}),
			);

			eventEmitter.emit(
				"managerApprovesSeparation",
				JSON.stringify({
					email: existUser.dataValues.buhrData.email,
					recipientName: existUser.dataValues.buhrData.name,
					empName: existUser.dataValues.name,
					empCode: existUser.dataValues.empCode,
					bu: existUser.dataValues.bumaster.buName,
					managerName: existUser.dataValues.managerData.name,
					senderEmail: existUser.dataValues.companymaster.senderEmail,
					companyLogo: existUser.dataValues.companymaster.companyLogo,
				}),
			);

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_STATUS.replace("<status>", "Initiated"),
			});
		} catch (error) {
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 500,
					msg: error.details[0].message,
				});
			}
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async onBehalfBUHr(req, res) {
		try {
			const result = await validator.onBehalfSeperationByBUHr.validateAsync(
				req.body,
			);
			let mailArray = [];
			const user = result.userId || req.userId;

			const existSeparationData = await db.separationMaster.findOne({
				where: {
					employeeId: user,
					finalStatus: {
						[Op.notIn]: [3, 6, 7, 10, 11],
					},
				},
			});

			if (existSeparationData) {
				return respHelper(res, {
					status: 400,
					msg: constant.SEPARATION_ALREADY_SUBMITTED,
				});
			}

			const existUser = await db.employeeMaster.findOne({
				where: {
					id: user,
				},
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"officeMobileNumber",
					"personalEmail",
					"personalMobileNumber",
					"dateOfJoining",
					"companyId",
					"buHRId",
					"departmentId",
					"buId",
					"sbuId",
					"functionalAreaId",
				],
				include: [
					{
						model: db.companyLocationMaster,
						attributes: ["address1"],
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
					},
					{
						model: db.employeeMaster,
						as: "managerData",
						attributes: ["id", "name"],
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuName"],
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "senderEmail", "companyLogo"],
					},
					{
						model: db.jobDetails,
						attributes: ["confirmationDate"],
						as: "employeeJobDetails",
					},
					{
						model: db.noticePeriodMaster,
						attributes: [
							[
								db.sequelize.literal(`
									CASE 
										WHEN employeeJobDetails.confirmationDate IS NULL 
										THEN noticeperiodmaster.nPDaysInProbation
										ELSE noticeperiodmaster.nPDaysAfterConfirmation
									END
								`),
								"nPDaysAfterConfirmation",
							],
						],
						as: "noticeperiodmaster",
					},
					{
						model: db.designationMaster,
						attributes: ["name"],
					},
					{
						model: db.jobDetails,
						attributes: ["jobLevelId"],
					},
				],
			});

			const lastWorkingDay = moment(result.resignationDate, "YYYY-MM-DD").add(
				parseInt(
					existUser.dataValues.noticeperiodmaster.nPDaysAfterConfirmation,
				) - 1,
				"days",
			);

			const d = Math.floor(Date.now() / 1000);
			let separationEmpAttachment;
			if (result.l2Attachment != "") {
				separationEmpAttachment = await helper.fileUpload(
					result.l2Attachment,
					`separation_attachment_${d}`,
					`uploads/${existUser.dataValues.empCode}`,
				);
			}
			const empRequestedLastWorkingDay = moment(
				result.empProposedLastWorkingDay,
				"YYYY-MM-DD",
			);
			const empProposedLastWorkingDay = moment(
				result.l2LastWorkingDay,
				"YYYY-MM-DD",
			);
			const recoveryDays = lastWorkingDay.diff(
				empRequestedLastWorkingDay,
				"days",
			);
			const proposedRecoveryDays = empProposedLastWorkingDay.diff(
				lastWorkingDay,
				"days",
			);

			const separationConfig = await db.separationTaskConfig.findOne({
				where: {
					[Op.and]: [
						{
							functionalAreaId: {
								[Op.or]: [
									{ [Op.like]: `${existUser.dataValues.functionalAreaId},%` },
									{ [Op.like]: `%,${existUser.dataValues.functionalAreaId},%` },
									{ [Op.like]: `%,${existUser.dataValues.functionalAreaId}` },
									{ [Op.eq]: `${existUser.dataValues.functionalAreaId}` },
								],
							},
						},
						{
							jobLevelId: {
								[Op.or]: [
									{
										[Op.like]: `${existUser.dataValues.employeejobdetail.jobLevelId},%`,
									},
									{
										[Op.like]: `%,${existUser.dataValues.employeejobdetail.jobLevelId},%`,
									},
									{
										[Op.like]: `%,${existUser.dataValues.employeejobdetail.jobLevelId}`,
									},
									{
										[Op.eq]: `${existUser.dataValues.employeejobdetail.jobLevelId}`,
									},
								],
							},
						},
					],
				},
			});

			const separationOwner = await db.separationTaskMapping.findAll({
				where: {
					taskConfigAutoId: separationConfig.dataValues.taskConfigAutoId,
				},
				include: [
					{
						model: db.separationTaskConfig,
						attributes: ["taskConfigName"],
					},
					{
						model: db.separationTaskMaster,
						where: {
							taskDependent: null,
						},
						attributes: ["taskName", "mappingOn", "mappingData"],
						include: [
							{
								model: db.separationTaskFields,
								attributes: ["taskFieldsAutoId"],
							},
						],
					},
				],
			});

			let onBehalfObject = {
				employeeId: existUser.dataValues.id,
				resignationDate: result.resignationDate,
				initiatedBy: "BuHr",
				noticePeriodDay:
					existUser.dataValues.noticeperiodmaster.nPDaysAfterConfirmation,
				noticePeriodLastWorkingDay: lastWorkingDay.format("YYYY-MM-DD"),
				l2LastWorkingDay: result.l2LastWorkingDay,
				l2RecoveryDays:
					result.l2RecoveryDays != ""
						? result.l2RecoveryDays > 0
							? result.l2RecoveryDays
							: 0
						: 0,
				l2RecoveryDaysReason: result.l2RecoveryDaysReason,
				l2SeparationType: result.l2SeparationType,
				l2ReasonOfSeparation: result.l2ReasonOfSeparation,
				l2NewOrganizationName:
					result.l2NewOrganizationName != ""
						? result.l2NewOrganizationName
						: null,
				l2SalaryHike: result.l2SalaryHike,
				doNotReHire: result.doNotReHire,
				doNotReHireRemark:
					result.doNotReHireRemark != "" ? result.doNotReHireRemark : null,
				l2BillingType: result.l2BillingType,
				l2CustomerName:
					result.l2CustomerName != "" ? result.l2CustomerName : null,
				shortFallPayoutBasis:
					result.shortFallPayoutBasis != ""
						? result.shortFallPayoutBasis
						: null,
				shortFallPayoutDays:
					result.shortFallPayoutDays != "" ? result.shortFallPayoutDays : null,
				shortfallPayoutRequired: result.shortfallPayoutRequired,
				ndaConfirmation: result.ndaConfirmation,
				holdFnf: result.holdFnf,
				holdFnfTillDate:
					result.holdFnfTillDate != "" ? result.holdFnfTillDate : null,
				holdFnfReason: result.holdFnfReason != "" ? result.holdFnfReason : null,
				l2Remark: result.l2Remark != "" ? result.l2Remark : null,
				l2SubmissionDate: moment(),
				createdBy: req.userId,
				createdDt: moment(),
				l1RequestStatus: "Approved",
				l2RequestStatus: "Approved",
				finalStatus: 9,
				submitType: result.submitType,
				l2Attachment: separationEmpAttachment,
				pendingAt: existUser.dataValues.buHRId,
			};
			const createdData = await db.separationMaster.create(onBehalfObject);

			await db.jobDetails.update(
				{
					noticePeriodStatus: 1,
				},
				{
					where: {
						userId: user,
					},
				},
			);

			await db.separationTrail.create({
				separationAutoId: createdData.dataValues.resignationAutoId,
				actionUserRole: req.userRole,
				separationStatus: 9,
				actionDate: moment(),
				pending: 0,
				pendingAt: req.userId,
				createdBy: req.userId,
				createdDt: moment(),
			});

			for (const element of separationOwner) {
				const initiatedTask = await db.separationInitiatedTask.create({
					employeeId: user,
					resignationAutoId: createdData.dataValues.resignationAutoId,
					taskAutoId: element.dataValues.taskAutoId,
					status: 0,
					createdDt: moment(),
					createdBy: 1,
					isActive: 1,
				});

				if (element.dataValues.separationtaskmaster.mappingOn === "FIX") {
					const ownerArray =
						element.dataValues.separationtaskmaster.mappingData.split(",");
					for (const element11 of ownerArray) {
						db.separationTaskOwner.create({
							taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
							taskOwner: element11,
							isActive: 1,
							createdDt: moment(),
						});
						const employeeData = await db.employeeMaster.findOne({
							where: {
								id: element11,
							},
							attributes: ["id", "name", "email"],
						});

						mailArray.push({
							email: employeeData.dataValues.email,
							name: employeeData.dataValues.name,
							taskName: element.dataValues.separationtaskmaster.taskName,
						});
					}
				} else if (
					element.dataValues.separationtaskmaster.mappingOn === "SELF"
				) {
					db.separationTaskOwner.create({
						taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
						taskOwner: existUser.dataValues.id,
						isActive: 1,
						createdDt: moment(),
					});

					const employeeData = await db.employeeMaster.findOne({
						where: {
							id: existUser.dataValues.id,
						},
						attributes: ["id", "name", "email"],
					});

					mailArray.push({
						email: employeeData.dataValues.email,
						name: employeeData.dataValues.name,
						taskName: element.dataValues.separationtaskmaster.taskName,
					});
				} else if (
					element.dataValues.separationtaskmaster.mappingOn === "MANAGER"
				) {
					db.separationTaskOwner.create({
						taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
						taskOwner: existUser.dataValues.managerData.id,
						isActive: 1,
						createdDt: moment(),
					});

					const employeeData = await db.employeeMaster.findOne({
						where: {
							id: existUser.dataValues.managerData.id,
						},
						attributes: ["id", "name", "email"],
					});

					mailArray.push({
						email: employeeData.dataValues.email,
						name: employeeData.dataValues.name,
						taskName: element.dataValues.separationtaskmaster.taskName,
					});
				} else if (
					element.dataValues.separationtaskmaster.mappingOn === "OTHER"
				) {
					const buMappingData = await db.taskBuMapping.findOne({
						where: {
							[Op.and]: [
								{
									bu: {
										[Op.or]: [
											{ [Op.like]: `${existUser.dataValues.buId},%` },
											{ [Op.like]: `%,${existUser.dataValues.buId},%` },
											{ [Op.like]: `%,${existUser.dataValues.buId}` },
											{ [Op.eq]: `${existUser.dataValues.buId}` },
										],
									},
								},
								{
									departmentId: {
										[Op.or]: [
											{ [Op.like]: `${existUser.dataValues.departmentId},%` },
											{ [Op.like]: `%,${existUser.dataValues.departmentId},%` },
											{ [Op.like]: `%,${existUser.dataValues.departmentId}` },
											{ [Op.eq]: `${existUser.dataValues.departmentId}` },
										],
									},
								},
								{
									companyId: {
										[Op.or]: [
											{ [Op.like]: `${existUser.dataValues.companyId},%` },
											{ [Op.like]: `%,${existUser.dataValues.companyId},%` },
											{ [Op.like]: `%,${existUser.dataValues.companyId}` },
											{ [Op.eq]: `${existUser.dataValues.companyId}` },
										],
									},
								},
								{
									taskAutoId: element.dataValues.taskAutoId,
								},
							],
						},
					});

					if (buMappingData) {
						for (const element12 of buMappingData.dataValues.ownerId.split(
							",",
						)) {
							db.separationTaskOwner.create({
								taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
								taskOwner: element12,
								isActive: 1,
								createdDt: moment(),
							});

							const employeeData = await db.employeeMaster.findOne({
								where: {
									id: element12,
								},
								attributes: ["id", "name", "email"],
							});

							mailArray.push({
								email: employeeData.dataValues.email,
								name: employeeData.dataValues.name,
								taskName: element.dataValues.separationtaskmaster.taskName,
							});
						}
					}
				}

				if (
					element.dataValues.separationtaskmaster.separationtaskfields.length >
					0
				) {
					for (const element2 of element.dataValues.separationtaskmaster
						.separationtaskfields) {
						await db.separationFieldValues.create({
							taskAutoId: element.dataValues.taskAutoId,
							initiatedTaskAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
							fields: element2.dataValues.taskFieldsAutoId,
							employeeId: user,
							createdDt: moment(),
							createdBy: 1,
						});
					}
				}
			}

			eventEmitter.emit(
				"separationApproveByBUHR",
				JSON.stringify({
					email: existUser.dataValues.email,
					empName: existUser.dataValues.name,
					empCode: existUser.dataValues.empCode,
					dateOfResignation: result.resignationDate,
					companyName: existUser.dataValues.companymaster.companyName,
					lastWorkingDay: result.l2LastWorkingDay,
					senderEmail: existUser.dataValues.companymaster.senderEmail,
					companyLogo: existUser.dataValues.companymaster.companyLogo,
				}),
			);

			for (const element of mailArray) {
				eventEmitter.emit(
					"clearenceInitiated",
					JSON.stringify({
						email: element.email,
						recipientName: element.name,
						taskName: element.taskName,
						empCode: existUser.dataValues.empCode,
						empName: existUser.dataValues.name,
						officeLocation: existUser.dataValues.companylocationmaster.address1,
						department: `${existUser.dataValues.departmentmaster.departmentName} (${existUser.dataValues.departmentmaster.departmentCode})`,
						officeMobileNumber: existUser.dataValues.officeMobileNumber,
						sbuName: existUser.dataValues.sbumaster.sbuName,
						bu: existUser.dataValues.bumaster.buName,
						reportingName: existUser.dataValues.managerData.name,
						designation: existUser.dataValues.designationmaster.name,
						dateOfJoining: existUser.dataValues.dateOfJoining,
						dateOfResignation: result.resignationDate,
						lastWorkingDay: result.l2LastWorkingDay,
						personalMailID: existUser.dataValues.personalEmail,
						personalMobileNumber: existUser.dataValues.personalMobileNumber,
						senderEmail: existUser.dataValues.companymaster.senderEmail,
						companyLogo: existUser.dataValues.companymaster.companyLogo,
					}),
				);
			}

			if (moment(result.l2LastWorkingDay).isBefore(moment())) {
				await inactiveEmpOnLastWorkingDay(user, result.l2LastWorkingDay);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_STATUS.replace("<status>", "Initiated"),
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

	async rejectSeparation(req, res) {
		try {
			const result = await validator.rejectSeparation.validateAsync(req.body);

			const resignationData = await db.separationMaster.findOne({
				where: {
					resignationAutoId: result.resignationAutoId,
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "empCode", "name", "email", "buHRId", "manager"],
						include: [
							{
								model: db.companyMaster,
								attributes: ["companyName", "senderEmail", "companyLogo"],
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName"],
							},
							{
								model: db.designationMaster,
								attributes: ["name"],
							},
							{
								model: db.employeeMaster,
								as: "managerData",
								attributes: ["name", "email"],
							},
						],
					},
				],
			});

			if (!resignationData) {
				return respHelper(res, {
					status: 400,
					data: constant.SEPARATION_REQUEST_NOT_AVAILABLE,
				});
			}

			let rejectObject = {};

			if (
				parseInt(req.userId) ===
				parseInt(resignationData.dataValues.employee.manager)
			) {
				rejectObject = {
					l1Remark: result.remark != "" ? result.remark : null,
					l1RejectionReason: result.reason,
					l1SubmissionDate: moment(),
					l1RequestStatus: "Rejected",
					finalStatus: 6,
				};

				await db.separationMaster.update(rejectObject, {
					where: {
						resignationAutoId: result.resignationAutoId,
					},
				});

				await db.jobDetails.update(
					{
						noticePeriodStatus: 0,
					},
					{
						where: {
							userId: resignationData.dataValues.employee.id,
						},
					},
				);

				const mailArray = [
					{
						email: resignationData.dataValues.employee.email,
						name: resignationData.dataValues.employee.name,
					},
				];

				//================================update in   separation trail===============================================//
				await db.separationTrail.update(
					{
						pending: 0,
						separationStatus: 6,
						actionDate: moment(),
						updatedBy: req.userId,
						updatedDt: moment(),
					},
					{
						where: {
							separationAutoId: result.resignationAutoId,
							pendingAt: req.userId,
							//separationStatus: 6,
						},
					},
				);
				//============================================================================================================//
				for (const element of mailArray) {
					eventEmitter.emit(
						"managerRejectsSeparation",
						JSON.stringify({
							email: element.email,
							recipientName: element.name,
							empName: resignationData.dataValues.employee.name,
							empCode: resignationData.dataValues.employee.empCode,
							designation:
								resignationData.dataValues.employee.designationmaster.name,
							department:
								resignationData.dataValues.employee.departmentmaster
									.departmentName,
							reportingManager:
								resignationData.dataValues.employee.managerData.name,
							companyName:
								resignationData.dataValues.employee.companymaster.companyName,
							senderEmail:
								resignationData.dataValues.employee.companymaster.senderEmail,
							companyLogo:
								resignationData.dataValues.employee.companymaster.companyLogo,
						}),
					);
				}
			} else if (
				parseInt(req.userId) ===
				parseInt(resignationData.dataValues.employee.buHRId)
			) {
				rejectObject = {
					l2SubmissionDate: moment(),
					l2Remark: result.remark != "" ? result.remark : null,
					l2RejectionReason: result.reason,
					l2RequestStatus: "Rejected",
					finalStatus: 10,
				};

				await db.separationMaster.update(rejectObject, {
					where: {
						resignationAutoId: result.resignationAutoId,
					},
				});

				// ===============================update in separation trail
				await db.separationTrail.update(
					{
						pending: 0,
						separationStatus: 10,
						actionDate: moment(),
						updatedBy: req.userId,
						updatedDt: moment(),
					},
					{
						where: {
							separationAutoId: result.resignationAutoId,
							pendingAt: req.userId,
							//separationStatus: 6,
						},
					},
				);

				//=====================================
				eventEmitter.emit(
					"separationRejectByBUHR",
					JSON.stringify({
						email: resignationData.dataValues.employee.email,
						empName: resignationData.dataValues.employee.name,
						empCode: resignationData.dataValues.employee.empCode,
						senderEmail:
							resignationData.dataValues.employee.companymaster.senderEmail,
						companyLogo:
							resignationData.dataValues.employee.companymaster.companyLogo,
					}),
				);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_STATUS.replace("<status>", "Rejected"),
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

	async buhrInputOnSeparation(req, res) {
		try {
			let result = await validator.buhrInputOnSeparation.validateAsync(
				req.body,
			);
			const mailArray = [];
			const separationData = await db.separationMaster.findOne({
				where: {
					resignationAutoId: result.resignationAutoId,
				},
				attributes: ["initiatedBy", "resignationDate"],
				include: [
					{
						model: db.employeeMaster,
						attributes: [
							"id",
							"empCode",
							"name",
							"email",
							"officeMobileNumber",
							"personalEmail",
							"personalMobileNumber",
							"dateOfJoining",
							"companyId",
							"buId",
							"departmentId",
							"sbuId",
							"functionalAreaId",
						],
						include: [
							{
								model: db.companyLocationMaster,
								attributes: ["address1"],
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
							},
							{
								model: db.employeeMaster,
								as: "managerData",
								attributes: ["id", "name"],
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuName"],
							},
							{
								model: db.buMaster,
								attributes: ["buName"],
							},
							{
								model: db.companyMaster,
								attributes: ["companyName", "senderEmail", "companyLogo"],
							},
							{
								model: db.designationMaster,
								attributes: ["name"],
							},
							{
								model: db.jobDetails,
								attributes: ["jobLevelId"],
							},
						],
					},
				],
			});

			const d = Math.floor(Date.now() / 1000);

			const separationConfig = await db.separationTaskConfig.findOne({
				where: {
					[Op.and]: [
						{
							functionalAreaId: {
								[Op.or]: [
									{
										[Op.like]: `${separationData.dataValues.employee.functionalAreaId},%`,
									},
									{
										[Op.like]: `%,${separationData.dataValues.employee.functionalAreaId},%`,
									},
									{
										[Op.like]: `%,${separationData.dataValues.employee.functionalAreaId}`,
									},
									{
										[Op.eq]: `${separationData.dataValues.employee.functionalAreaId}`,
									},
								],
							},
						},
						{
							jobLevelId: {
								[Op.or]: [
									{
										[Op.like]: `${separationData.dataValues.employee.employeejobdetail.jobLevelId},%`,
									},
									{
										[Op.like]: `%,${separationData.dataValues.employee.employeejobdetail.jobLevelId},%`,
									},
									{
										[Op.like]: `%,${separationData.dataValues.employee.employeejobdetail.jobLevelId}`,
									},
									{
										[Op.eq]: `${separationData.dataValues.employee.employeejobdetail.jobLevelId}`,
									},
								],
							},
						},
					],
				},
			});

			const separationOwner = await db.separationTaskMapping.findAll({
				where: {
					taskConfigAutoId: separationConfig.dataValues.taskConfigAutoId,
				},
				include: [
					{
						model: db.separationTaskConfig,
						attributes: ["taskConfigName"],
					},
					{
						model: db.separationTaskMaster,
						where: {
							taskDependent: null,
						},
						attributes: ["taskName", "mappingOn", "mappingData"],
						include: [
							{
								model: db.separationTaskFields,
								attributes: ["taskFieldsAutoId"],
							},
						],
					},
				],
			});

			await db.separationMaster.update(
				{
					l2LastWorkingDay: result.l2LastWorkingDay,
					l2RecoveryDays: result.l2RecoveryDays,
					l2RecoveryDaysReason: result.l2RecoveryDaysReason,
					l2SeparationType: result.l2SeparationType,
					l2ReasonOfSeparation: result.l2ReasonOfSeparation,
					l2NewOrganizationName: result.l2NewOrganizationName
						? result.l2NewOrganizationName
						: null,
					l2SalaryHike: result.l2SalaryHike ? result.l2SalaryHike : null,
					doNotReHire: result.doNotReHire,
					doNotReHireRemark:
						result.doNotReHireRemark != "" ? result.doNotReHireRemark : null,
					l2BillingType: result.l2BillingType,
					l2CustomerName:
						result.l2CustomerName != "" ? result.l2CustomerName : null,
					shortFallPayoutBasis:
						result.shortFallPayoutBasis != ""
							? result.shortFallPayoutBasis
							: null,
					shortFallPayoutDays:
						result.shortFallPayoutDays != ""
							? result.shortFallPayoutDays
							: null,
					shortfallPayoutRequired: result.shortfallPayoutRequired,
					ndaConfirmation: result.ndaConfirmation,
					holdFnf: result.holdFnf,
					holdFnfReason:
						result.holdFnfReason != "" ? result.holdFnfReason : null,
					holdFnfTillDate:
						result.holdFnfTillDate != "" ? result.holdFnfTillDate : null,
					l2Remark: result.l2Remark,
					l2Attachment: result.attachment
						? await helper.fileUpload(
							result.attachment,
							`separation_attachment_${d}`,
							`uploads/${separationData.dataValues.employee.empCode}`,
						)
						: null,
					l2SubmissionDate: moment(),
					l2RequestStatus: "Approved",
					finalStatus: 9,
				},
				{
					where: {
						resignationAutoId: result.resignationAutoId,
					},
				},
			);

			await db.separationTrail.update(
				{
					pendingAt: req.userId,
					actionUserRole: req.userRole,
					pending: 0,
					actionDate: moment(),
					updatedBy: req.userId,
					updatedDt: moment(),
				},
				{
					where: {
						separationAutoId: result.resignationAutoId,
						separationStatus: 9,
					},
				},
			);

			for (const element of separationOwner) {
				const initiatedTask = await db.separationInitiatedTask.create({
					employeeId: separationData.dataValues.employee.id,
					resignationAutoId: result.resignationAutoId,
					taskAutoId: element.dataValues.taskAutoId,
					status: 0,
					createdDt: moment(),
					createdBy: 1,
					isActive: 1,
				});

				if (element.dataValues.separationtaskmaster.mappingOn === "FIX") {
					const ownerArray =
						element.dataValues.separationtaskmaster.mappingData.split(",");
					for (const element11 of ownerArray) {
						db.separationTaskOwner.create({
							taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
							taskOwner: element11,
							isActive: 1,
							createdDt: moment(),
						});

						const employeeData = await db.employeeMaster.findOne({
							where: {
								id: element11,
							},
							attributes: ["id", "name", "email"],
						});

						mailArray.push({
							email: employeeData.dataValues.email,
							name: employeeData.dataValues.name,
							taskName: element.dataValues.separationtaskmaster.taskName,
						});
					}
				} else if (
					element.dataValues.separationtaskmaster.mappingOn === "SELF"
				) {
					db.separationTaskOwner.create({
						taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
						taskOwner: separationData.dataValues.employee.id,
						isActive: 1,
						createdDt: moment(),
					});

					const employeeData = await db.employeeMaster.findOne({
						where: {
							id: separationData.dataValues.employee.id,
						},
						attributes: ["id", "name", "email"],
					});

					mailArray.push({
						email: employeeData.dataValues.email,
						name: employeeData.dataValues.name,
						taskName: element.dataValues.separationtaskmaster.taskName,
					});
				} else if (
					element.dataValues.separationtaskmaster.mappingOn === "MANAGER"
				) {
					db.separationTaskOwner.create({
						taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
						taskOwner: separationData.dataValues.employee.managerData.id,
						isActive: 1,
						createdDt: moment(),
					});

					const employeeData = await db.employeeMaster.findOne({
						where: {
							id: separationData.dataValues.employee.managerData.id,
						},
						attributes: ["id", "name", "email"],
					});

					mailArray.push({
						email: employeeData.dataValues.email,
						name: employeeData.dataValues.name,
						taskName: element.dataValues.separationtaskmaster.taskName,
					});
				} else if (
					element.dataValues.separationtaskmaster.mappingOn === "OTHER"
				) {
					const buMappingData = await db.taskBuMapping.findOne({
						where: {
							[Op.and]: [
								{
									bu: {
										[Op.or]: [
											{
												[Op.like]: `${separationData.dataValues.employee.buId},%`,
											},
											{
												[Op.like]: `%,${separationData.dataValues.employee.buId},%`,
											},
											{
												[Op.like]: `%,${separationData.dataValues.employee.buId}`,
											},
											{ [Op.eq]: `${separationData.dataValues.employee.buId}` },
										],
									},
								},
								{
									departmentId: {
										[Op.or]: [
											{
												[Op.like]: `${separationData.dataValues.employee.departmentId},%`,
											},
											{
												[Op.like]: `%,${separationData.dataValues.employee.departmentId},%`,
											},
											{
												[Op.like]: `%,${separationData.dataValues.employee.departmentId}`,
											},
											{
												[Op.eq]: `${separationData.dataValues.employee.departmentId}`,
											},
										],
									},
								},
								{
									companyId: {
										[Op.or]: [
											{
												[Op.like]: `${separationData.dataValues.employee.companyId},%`,
											},
											{
												[Op.like]: `%,${separationData.dataValues.employee.companyId},%`,
											},
											{
												[Op.like]: `%,${separationData.dataValues.employee.companyId}`,
											},
											{
												[Op.eq]: `${separationData.dataValues.employee.companyId}`,
											},
										],
									},
								},
								{
									taskAutoId: element.dataValues.taskAutoId,
								},
							],
						},
					});

					if (buMappingData) {
						for (const element12 of buMappingData.dataValues.ownerId.split(
							",",
						)) {
							db.separationTaskOwner.create({
								taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
								taskOwner: element12,
								isActive: 1,
								createdDt: moment(),
							});

							const employeeData = await db.employeeMaster.findOne({
								where: {
									id: element12,
								},
								attributes: ["id", "name", "email"],
							});

							mailArray.push({
								email: employeeData.dataValues.email,
								name: employeeData.dataValues.name,
								taskName: element.dataValues.separationtaskmaster.taskName,
							});
						}
					}
				}

				if (
					element.dataValues.separationtaskmaster.separationtaskfields.length >
					0
				) {
					for (const element2 of element.dataValues.separationtaskmaster
						.separationtaskfields) {
						await db.separationFieldValues.create({
							taskAutoId: element.dataValues.taskAutoId,
							initiatedTaskAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
							fields: element2.dataValues.taskFieldsAutoId,
							employeeId: separationData.dataValues.employee.id,
							createdDt: moment(),
							createdBy: 1,
						});
					}
				}
			}

			eventEmitter.emit(
				"separationApproveByBUHR",
				JSON.stringify({
					email: separationData.dataValues.employee.email,
					empName: separationData.dataValues.employee.name,
					empCode: separationData.dataValues.employee.empCode,
					dateOfResignation: separationData.dataValues.resignationDate,
					companyName:
						separationData.dataValues.employee.companymaster.companyName,
					lastWorkingDay: result.l2LastWorkingDay,
					senderEmail:
						separationData.dataValues.employee.companymaster.senderEmail,
					companyLogo:
						separationData.dataValues.employee.companymaster.companyLogo,
				}),
			);

			for (const element of mailArray) {
				eventEmitter.emit(
					"clearenceInitiated",
					JSON.stringify({
						email: element.email,
						recipientName: element.name,
						taskName: element.taskName,
						empCode: separationData.dataValues.employee.empCode,
						empName: separationData.dataValues.employee.name,
						officeLocation:
							separationData.dataValues.employee.companylocationmaster.address1,
						department: `${separationData.dataValues.employee.departmentmaster.departmentName} (${separationData.dataValues.employee.departmentmaster.departmentCode})`,
						officeMobileNumber:
							separationData.dataValues.employee.officeMobileNumber,
						sbuName: separationData.dataValues.employee.sbumaster.sbuName,
						bu: separationData.dataValues.employee.bumaster.buName,
						reportingName: separationData.dataValues.employee.managerData.name,
						designation:
							separationData.dataValues.employee.designationmaster.name,
						dateOfJoining: separationData.dataValues.employee.dateOfJoining,
						dateOfResignation: separationData.dataValues.resignationDate,
						lastWorkingDay: result.l2LastWorkingDay,
						personalMailID: separationData.dataValues.employee.personalEmail,
						personalMobileNumber:
							separationData.dataValues.employee.personalMobileNumber,
						senderEmail:
							separationData.dataValues.employee.companymaster.senderEmail,
						companyLogo:
							separationData.dataValues.employee.companymaster.companyLogo,
					}),
				);
			}

			if (moment(result.l2LastWorkingDay).isBefore(moment())) {
				await inactiveEmpOnLastWorkingDay(
					separationData.dataValues.employee.id,
					result.l2LastWorkingDay,
				);
			}

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_STATUS.replace("<status>", "Approved"),
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

	async revokeSeparation(req, res) {
		try {
			const result = await validator.revokeSeparation.validateAsync(req.body);

			const separationData = await db.separationMaster.findOne({
				where: {
					employeeId: req.userId,
					finalStatus: 2,
				},
			});

			if (!separationData) {
				return respHelper(res, {
					status: 404,
					msg: constant.DETAILS_NOT_FOUND.replace("<module>", "Separation"),
				});
			}

			await db.separationMaster.update(
				{
					empRevokeReason: result.reason,
					empRemark: result.remark,
					empRevokeDate: moment(),
					finalStatus: 3,
				},
				{
					where: {
						resignationAutoId: separationData.dataValues.resignationAutoId,
					},
				},
			);

			await db.separationTrail.create({
				separationAutoId: separationData.dataValues.resignationAutoId,
				actionUserRole: req.userRole,
				separationStatus: 3,
				actionDate: moment(),
				pending: 0,
				pendingAt: req.userId,
				createdBy: req.userId,
				createdDt: moment(),
			});

			await db.jobDetails.update(
				{
					noticePeriodStatus: 0,
				},
				{
					where: {
						userId: req.userId,
					},
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_REVOKED,
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

	async separationTrails(req, res) {
		try {
			const user = req.query.user || req.userId;

			const separationData = await db.separationMaster.findOne({
				where: {
					employeeId: user,
					finalStatus: {
						[Op.notIn]: [3, 6, 7, 10, 11],
					},
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name"],
					},
					{
						model: db.employeeMaster,
						as: "pending",
						attributes: ["empCode", "name"],
					},
					{
						model: db.separationStatus,
						attributes: ["separationStatusDesc"],
					},
					{
						model: db.separationType,
						as: "l2Separationtype",
						attributes: ["separationTypeName"],
					},
					{
						model: db.separationReason,
						as: "empReasonofResignation",
						attributes: ["separationReason"],
					},
					{
						model: db.separationReason,
						as: "l2ReasonofSeparation",
						attributes: ["separationReason"],
					},
					{
						model: db.separationReason,
						as: "l1ReasonofResignation",
						attributes: ["separationReason"],
					},
				],
			});

			if (separationData) {
				const separationTrails = await db.separationStatus.findAll({
					where: {
						statusTrail: 1,
					},
					attributes: [
						"separationStatusAutoId",
						"separationStatusCode",
						"separationStatusDesc",
						"separationLabel",
					],
					include: [
						{
							model: db.separationTrail,
							required: true,
							where: {
								separationAutoId: separationData.dataValues.resignationAutoId,
							},
							include: [
								{
									model: db.employeeMaster,
									attributes: ["empCode", "name"],
									as: "pendingat",
								},
							],
						},
					],
				});
				separationData.dataValues.separationTrails = separationTrails;
			}

			return respHelper(res, {
				status: 200,
				data: separationData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async taskHistoryAttendance(req, res) {
		try {
			const { search, fromDate, toDate, orderByAppliedFor, orderByOn, type } =
				req.query;
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;
			const extendedToDate = toDate
				? new Date(new Date(toDate).setHours(23, 59, 59, 999)).toISOString()
				: null;

			let order = [];
			if (orderByAppliedFor) {
				const attendanceDateOrder = orderByAppliedFor === "0" ? "desc" : "asc";
				order.push([
					{ model: db.attendanceMaster, as: "attendancemaster" },
					"attendanceDate",
					attendanceDateOrder,
				]);
			}

			if (orderByOn) {
				const createdAtOrder = orderByOn === "0" ? "desc" : "asc";
				order.push(["createdAt", createdAtOrder]);
			}

			const { count, rows: regularizationRequests } =
				await db.regularizationMaster.findAndCountAll({
					where: {
						regularizeStatus: { [Op.ne]: "Pending" },
						...(fromDate &&
							extendedToDate && {
							createdAt: {
								[db.Sequelize.Op.between]: [fromDate, extendedToDate],
							},
						}),
					},
					include: [
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							as: "attendanceUpdatedBy",
							required: false,
						},
						{
							model: db.attendanceMaster,
							required: true,
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name", "manager"],
									where: {
										...(search && { name: { [Op.like]: `%${search}%` } }),
										...(type === "all"
											? {
												[Op.or]: [
													//{ id: req.userId },
													{ manager: req.userId },
												],
											}
											: { id: req.userId }),
									},
									include: [
										{
											model: db.employeeMaster,
											attributes: ["id", "empCode", "name"],
											as: "managerData",
										},
									],
									required: true,
								},
							],
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "empCode", "name"],
							as: "attendanceCreatedBy",
							required: false,
						},
					],
					limit,
					offset,
					order,
				});

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					regularizationRequests,
				},
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: error.message,
			});
		}
	}

	async taskHistoryLeave(req, res) {
		try {
			const {
				search,
				fromDate,
				toDate,
				orderByAppliedFor,
				orderByOn,
				type,
				isSystemGenerated,
			} = req.query;

			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			let order = [];
			if (orderByAppliedFor) {
				const attendanceDateOrder = orderByAppliedFor === "0" ? "desc" : "asc";
				order.push(["appliedFor", attendanceDateOrder]);
			}

			if (orderByOn) {
				const createdAtOrder = orderByOn === "0" ? "desc" : "asc";
				order.push(["appliedOn", createdAtOrder]);
			}
			const leaveApprovalCondition =
				type === "self"
					? {
						//createdBy: req.userId,
						isPending: [0, 1],
						isApproved: [1, 2, 0],
						// isPending: 1,
					}
					: {
						isPending: 0,
						//  isApproved:[1,2]
					};

			const { count, rows: leaveRequests } =
				await db.EmployeeLeaveHeader.findAndCountAll({
					where: {
						status: { [Op.ne]: "pending" },
						...(isSystemGenerated == 1
							? { source: "system_generated" }
							: { source: { [Op.ne]: "system_generated" } }),
						...(fromDate &&
							toDate && {
							appliedFor: {
								[db.Sequelize.Op.between]: [fromDate, toDate],
							},
						}),
						...(type === "all" && isSystemGenerated == 0
							? {
								[Op.or]: [
									{
										//pendingAt: req.userId,
										source: { [Op.ne]: "system_generated" },
									},
								],
							}
							: type === "all" && isSystemGenerated == 1
								? {
									[Op.or]: [
										{ employeeId: req.userId },
										{ pendingAt: req.userId, source: "system_generated" },
									],
								}
								: { employeeId: req.userId }), // Default case for non-"all" types
					},
					include: [
						{
							model: db.employeeLeaveTransactions,
							where:
								type === "all" && isSystemGenerated == 0
									? { pendingAt: req.userId }
									: {},
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							where: { ...(search && { name: { [Op.like]: `%${search}%` } }) },
						},
						{
							model: db.leaveMaster,
							attributes: ["leaveId", "leaveName", "leaveCode"],
							as: "leaveMasterDetails",
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							as: "leaveUpdatedBy",
							required: false,
						},
						{
							model: db.leaveApprovalTrails,
							required: false,
							separate: true,
							order: [["leaveTrailAutoId", "ASC"]],
							where: leaveApprovalCondition,
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name"],
								},
							],
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							as: "leaveCreatedBy",
							required: false,
						},
					],
					limit,
					offset,
					order,
					distinct: true,
				});

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					leaveRequests,
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

	// Pending Attendance Task History
	async taskHistoryAttendanceApproval(req, res) {
		try {
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			const { count, rows: pendingAttendanceData } =
				await db.attendanceHistory.findAndCountAll({
					where: {
						attendanceStatus: {
							[Op.ne]: ["pending"],
						},
						updatedBy: req.query.user || req.userId,
					},
					include: [
						{
							model: db.employeeMaster,
							attributes: ["id", "empCode", "name"],
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "empCode", "name"],
							as: "attendanceApprover",
						},
					],
					order: [["updatedAt", "DESC"]],
					limit,
					offset,
				});

			return respHelper(res, {
				status: 200,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					pendingAttendanceData,
				},
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async taskHistoryAttendanceApprovalSelf(req, res) {
		try {
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			const { count, rows: pendingAttendanceData } =
				await db.attendanceHistory.findAndCountAll({
					where: {
						employeeId: req.userId,
					},
					include: [
						{
							model: db.employeeMaster,
							attributes: ["id", "empCode", "name"],
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "empCode", "name"],
							as: "attendanceApprover",
						},
					],
					order: [["date", "DESC"]],
					limit,
					offset,
				});

			pendingAttendanceData.map((record) => {
				if (
					!record.dataValues.attendanceApprover &&
					record.dataValues.attendanceStatus === "pending"
				) {
					record.dataValues.attendanceApprover = {
						name: "Pending for Approval",
					};
				}
				if (
					!record.dataValues.attendanceApprover &&
					record.dataValues.attendanceStatus === "approved"
				) {
					record.dataValues.attendanceApprover = { name: "Auto Approved" };
				}
				return record;
			});

			return respHelper(res, {
				status: 200,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					pendingAttendanceData,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	// Pending Attendance Task History
	async separationTaskForm(req, res) {
		try {
			const user = req.query.user || req.userId;

			const separationFields = await db.separationTaskFields.findAll({
				where: {
					taskAutoId: req.params.id,
				},
			});

			return respHelper(res, {
				status: 200,
				data: separationFields,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async separationTaskValues(req, res) {
		try {
			let reqObj = {};
			for (const element of req.body) {
				if (
					element.fieldsCode === "file" &&
					element.value !== "" &&
					element.value
				) {
					const d = Math.floor(Date.now() / 1000);
					const userData = await db.employeeMaster.findOne({
						where: {
							id: element.user,
						},
						attributes: ["empCode"],
					});
					const fileName = await helper.fileUpload(
						element.value,
						`separationTask_${element.id}_${d}`,
						`uploads/${userData.dataValues.empCode.toString()}`,
					);
					element.value = fileName;
				}
				reqObj[element.fieldsCode] =
					element.value !== "" ? element.value : null;
			}

			for (const element of req.body) {
				await db.separationFieldValues.update(
					{
						fieldValues: element.value,
						updatedBy: req.userId,
						updatedAt: moment(),
					},
					{
						where: {
							taskAutoId: element.taskAutoId,
							fields: element.id,
							employeeId: element.user,
						},
					},
				);
			}

			await db.separationInitiatedTask.update(
				{
					status: 1,
					updatedBy: req.userId,
					updatedAt: moment(),
				},
				{
					where: {
						taskAutoId: req.body[0].taskAutoId,
						employeeId: req.body[0].user,
					},
				},
			);

			const mailArray = [];
			const separationData = await db.separationMaster.findOne({
				where: {
					employeeId: req.body[0].user,
					finalStatus: 9,
				},
				attributes: ["initiatedBy", "resignationDate"],
				include: [
					{
						model: db.employeeMaster,
						attributes: [
							"id",
							"empCode",
							"name",
							"email",
							"officeMobileNumber",
							"personalEmail",
							"personalMobileNumber",
							"dateOfJoining",
							"companyId",
							"buId",
							"sbuId",
							"departmentId",
							"functionalAreaId",
						],
						include: [
							{
								model: db.companyLocationMaster,
								attributes: ["address1"],
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
							},
							{
								model: db.employeeMaster,
								as: "managerData",
								attributes: ["name"],
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuName"],
							},
							{
								model: db.buMaster,
								attributes: ["buName"],
							},
							{
								model: db.companyMaster,
								attributes: ["companyName", "senderEmail", "companyLogo"],
							},
							{
								model: db.designationMaster,
								attributes: ["name"],
							},
							{
								model: db.jobDetails,
								required: true,
								attributes: ["jobLevelId"],
							},
						],
					},
				],
			});
			if (separationData) {
				const separationConfig = await db.separationTaskConfig.findOne({
					where: {
						[Op.and]: [
							{
								functionalAreaId: {
									[Op.or]: [
										{
											[Op.like]: `${separationData.dataValues.employee.functionalAreaId},%`,
										},
										{
											[Op.like]: `%,${separationData.dataValues.employee.functionalAreaId},%`,
										},
										{
											[Op.like]: `%,${separationData.dataValues.employee.functionalAreaId}`,
										},
										{
											[Op.eq]: `${separationData.dataValues.employee.functionalAreaId}`,
										},
									],
								},
							},
							{
								jobLevelId: {
									[Op.or]: [
										{
											[Op.like]: `${separationData.dataValues.employee.employeejobdetail.jobLevelId},%`,
										},
										{
											[Op.like]: `%,${separationData.dataValues.employee.employeejobdetail.jobLevelId},%`,
										},
										{
											[Op.like]: `%,${separationData.dataValues.employee.employeejobdetail.jobLevelId}`,
										},
										{
											[Op.eq]: `${separationData.dataValues.employee.employeejobdetail.jobLevelId}`,
										},
									],
								},
							},
						],
					},
				});

				const separationOwner = await db.separationTaskMapping.findAll({
					where: {
						taskConfigAutoId: separationConfig.dataValues.taskConfigAutoId,
					},
					include: [
						{
							model: db.separationTaskConfig,
							attributes: ["taskConfigName"],
						},
						{
							model: db.separationTaskMaster,
							where: {
								taskDependent: req.body[0].taskAutoId,
							},
							attributes: ["taskName", "mappingOn", "mappingData"],
							include: [
								{
									model: db.separationTaskFields,
									attributes: ["taskFieldsAutoId"],
								},
							],
						},
					],
				});

				for (const element of separationOwner) {
					const initiatedTask = await db.separationInitiatedTask.create({
						employeeId: separationData.dataValues.employee.id,
						resignationAutoId: separationData.dataValues.resignationAutoId,
						taskAutoId: element.dataValues.taskAutoId,
						status: 0,
						createdDt: moment(),
						createdBy: 1,
						isActive: 1,
					});

					if (element.dataValues.separationtaskmaster.mappingOn === "FIX") {
						const ownerArray =
							element.dataValues.separationtaskmaster.mappingData.split(",");
						for (const element11 of ownerArray) {
							db.separationTaskOwner.create({
								taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
								taskOwner: element11,
								isActive: 1,
								createdDt: moment(),
							});

							const employeeData = await db.employeeMaster.findOne({
								where: {
									id: element11,
								},
								attributes: ["id", "name", "email"],
							});

							mailArray.push({
								email: employeeData.dataValues.email,
								name: employeeData.dataValues.name,
								taskName: element.dataValues.separationtaskmaster.taskName,
							});
						}
					} else if (
						element.dataValues.separationtaskmaster.mappingOn === "SELF"
					) {
						db.separationTaskOwner.create({
							taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
							taskOwner: separationData.dataValues.employee.id,
							isActive: 1,
							createdDt: moment(),
						});

						const employeeData = await db.employeeMaster.findOne({
							where: {
								id: separationData.dataValues.employee.id,
							},
							attributes: ["id", "name", "email"],
						});

						mailArray.push({
							email: employeeData.dataValues.email,
							name: employeeData.dataValues.name,
							taskName: element.dataValues.separationtaskmaster.taskName,
						});
					} else if (
						element.dataValues.separationtaskmaster.mappingOn === "MANAGER"
					) {
						db.separationTaskOwner.create({
							taskMappingAutoId: initiatedTask.dataValues.initiatedTaskAutoId,
							taskOwner: separationData.dataValues.employee.managerData.id,
							isActive: 1,
							createdDt: moment(),
						});

						const employeeData = await db.employeeMaster.findOne({
							where: {
								id: separationData.dataValues.employee.managerData.id,
							},
							attributes: ["id", "name", "email"],
						});

						mailArray.push({
							email: employeeData.dataValues.email,
							name: employeeData.dataValues.name,
							taskName: element.dataValues.separationtaskmaster.taskName,
						});
					} else if (
						element.dataValues.separationtaskmaster.mappingOn === "OTHER"
					) {
						const buMappingData = await db.taskBuMapping.findOne({
							where: {
								[Op.and]: [
									{
										bu: {
											[Op.or]: [
												{
													[Op.like]: `${separationData.dataValues.employee.buId},%`,
												},
												{
													[Op.like]: `%,${separationData.dataValues.employee.buId},%`,
												},
												{
													[Op.like]: `%,${separationData.dataValues.employee.buId}`,
												},
												{
													[Op.eq]: `${separationData.dataValues.employee.buId}`,
												},
											],
										},
									},
									{
										departmentId: {
											[Op.or]: [
												{
													[Op.like]: `${separationData.dataValues.employee.departmentId},%`,
												},
												{
													[Op.like]: `%,${separationData.dataValues.employee.departmentId},%`,
												},
												{
													[Op.like]: `%,${separationData.dataValues.employee.departmentId}`,
												},
												{
													[Op.eq]: `${separationData.dataValues.employee.departmentId}`,
												},
											],
										},
									},
									{
										companyId: {
											[Op.or]: [
												{
													[Op.like]: `${separationData.dataValues.employee.companyId},%`,
												},
												{
													[Op.like]: `%,${separationData.dataValues.employee.companyId},%`,
												},
												{
													[Op.like]: `%,${separationData.dataValues.employee.companyId}`,
												},
												{
													[Op.eq]: `${separationData.dataValues.employee.companyId}`,
												},
											],
										},
									},
									{
										taskAutoId: element.dataValues.taskAutoId,
									},
								],
							},
						});

						if (buMappingData) {
							for (const element12 of buMappingData.dataValues.ownerId.split(
								",",
							)) {
								console.log(element12);
								db.separationTaskOwner.create({
									taskMappingAutoId:
										initiatedTask.dataValues.initiatedTaskAutoId,
									taskOwner: element12,
									isActive: 1,
									createdDt: moment(),
								});

								const employeeData = await db.employeeMaster.findOne({
									where: {
										id: element12,
									},
									attributes: ["id", "name", "email"],
								});

								mailArray.push({
									email: employeeData.dataValues.email,
									name: employeeData.dataValues.name,
									taskName: element.dataValues.separationtaskmaster.taskName,
								});
							}
						}
					}

					if (
						element.dataValues.separationtaskmaster.separationtaskfields
							.length > 0
					) {
						for (const element2 of element.dataValues.separationtaskmaster
							.separationtaskfields) {
							await db.separationFieldValues.create({
								taskAutoId: element.dataValues.taskAutoId,
								initiatedTaskAutoId:
									initiatedTask.dataValues.initiatedTaskAutoId,
								fields: element2.dataValues.taskFieldsAutoId,
								employeeId: separationData.dataValues.employee.id,
								createdDt: moment(),
								createdBy: 1,
							});
						}
					}
				}

				for (const element of mailArray) {
					eventEmitter.emit(
						"clearenceInitiated",
						JSON.stringify({
							email: element.email,
							recipientName: element.name,
							taskName: element.taskName,
							empCode: separationData.dataValues.employee.empCode,
							empName: separationData.dataValues.employee.name,
							officeLocation:
								separationData.dataValues.employee.companylocationmaster
									.address1,
							department: `${separationData.dataValues.employee.departmentmaster.departmentName} (${separationData.dataValues.employee.departmentmaster.departmentCode})`,
							officeMobileNumber:
								separationData.dataValues.employee.officeMobileNumber,
							sbuName: separationData.dataValues.employee.sbumaster.sbuName,
							bu: separationData.dataValues.employee.bumaster.buName,
							reportingName:
								separationData.dataValues.employee.managerData.name,
							dateOfJoining: separationData.dataValues.employee.dateOfJoining,
							dateOfResignation: separationData.dataValues.resignationDate,
							designation:
								separationData.dataValues.employee.designationmaster.name,
							lastWorkingDay: separationData.dataValues.l2LastWorkingDay,
							personalMailID: separationData.dataValues.employee.personalEmail,
							personalMobileNumber:
								separationData.dataValues.employee.personalMobileNumber,
							senderEmail:
								separationData.dataValues.employee.companymaster.senderEmail,
							companyLogo:
								separationData.dataValues.employee.companymaster.companyLogo,
						}),
					);
				}
			}

			return respHelper(res, {
				status: 200,
				msg: constant.TASK_SUBMITTED,
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

	async initiatedTaskList(req, res) {
		try {
			// add functionality for search and pagination

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

			const separationTasks = await db.separationInitiatedTask.findAndCountAll({
				where: {
					status: 0,
					isActive: 1,
				},
				attributes: ["initiatedTaskAutoId", "status", "createdDt"],
				include: [
					{
						model: db.employeeMaster,
						required: true,
						attributes: [
							"id",
							"empCode",
							"name",
							"dateOfJoining",
							"dataCardAdmin",
							"mobileAdmin",
							"companyLocationId",
							"manager",
							"sbuId",
							"buId",
							"designation_id",
						],
						where: searchQuery || undefined,
						include: [
							{
								model: db.separationMaster,
								attributes: ["resignationDate", "l2LastWorkingDay"],
								required: true,
								where: {
									finalStatus: 9,
									resignationAutoId: db.Sequelize.col(
										"separationinitiatedtask.resignationAutoId",
									),
								},
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
							},
							{
								model: db.buMaster,
								attributes: ["buName"],
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuName"],
							},
							{
								model: db.employeeMaster,
								as: "managerData",
								attributes: ["empCode", "name", "email"],
							},
							{
								model: db.companyLocationMaster,
								attributes: ["address1"],
							},
						],
					},
					{
						model: db.separationTaskMaster,
						attributes: ["taskAutoId", "taskName", "taskCode"],
					},
					{
						model: db.separationTaskOwner,
						attributes: [
							"taskOwnerAutoId",
							"taskMappingAutoId",
							"taskOwner",
							"isActive",
						],
						required: true,
						where: {
							taskOwner: req.userId,
						},
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "empCode"],
							},
						],
					},
				],
				limit,
				offset,
				// subQuery: false,
				required: !!searchQuery,
				distinct: true,
				order: [["initiatedTaskAutoId", "DESC"]],
			});

			return respHelper(res, {
				status: 200,
				data: separationTasks,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async empInitiatedTask(req, res) {
		try {
			const user = req.query.user || req.userId;

			const taskData = await db.separationInitiatedTask.findAll({
				where: {
					employeeId: user,
					isActive: 1,
				},
				attributes: ["initiatedTaskAutoId", "status", "createdDt"],
				include: [
					{
						model: db.employeeMaster,
						required: true,
						attributes: ["empCode", "name"],
						include: [
							{
								model: db.designationMaster,
								attributes: ["name"],
							},
							{
								model: db.separationMaster,
								required: true,
								where: {
									finalStatus: 9,
									resignationAutoId: db.Sequelize.col(
										"separationinitiatedtask.resignationAutoId",
									),
								},
								attributes: ["resignationDate", "l2LastWorkingDay"],
							},
						],
					},
					{
						model: db.separationTaskMaster,
						attributes: ["taskAutoId", "taskName", "taskCode"],
					},
					{
						model: db.separationTaskOwner,
						attributes: [
							"taskOwnerAutoId",
							"taskMappingAutoId",
							"taskOwner",
							"isActive",
						],
						required: true,
						// nest: true,
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "empCode"],
							},
						],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: taskData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	// manager history
	async managerHistory(req, res) {
		try {
			const listData = await db.managerHistory.findAll({
				where: {
					employeeId: req.query.user,
					needAttendanceCron: 0,
				},
				include: [
					{
						model: db.employeeMaster,
						as: "managerHistoryDate",
						attributes: ["id", "empCode", "name"],
						required: true,
					},
				],
			});

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: listData,
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
	// manager history
	// userPolicyHistory
	async userPolicyHistory(req, res) {
		try {
			const listData = await db.PolicyHistory.findAll({
				where: {
					employeeId: req.query.user,
					needAttendanceCron: 0,
				},
				attributes: ["id", "updatedAt", "fromDate", "toDate"],
				order: [["id", "DESC"]], // Replace 'createdAt' with your desired column
				include: [
					{
						model: db.shiftMaster,
						as: "historyshiftMaster",
						attributes: ["shiftId", "shiftName"],
					},
					{
						model: db.attendancePolicymaster,
						as: "historyattendanceMaster",
						attributes: ["attendancePolicyId", "policyName"],
					},
					{
						model: db.weekOffMaster,
						as: "historyweekOffMaster",
						attributes: ["weekOffId", "weekOffName"],
					},
					{
						model: db.employeeMaster,
						as: "PolicyUpdaterDetails",
						attributes: ["id", "name", "empCode"],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: listData,
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

	async taskData(req, res) {
		try {
			const user = req.query.user;
			const task = req.query.task;

			const taskData = await db.separationTaskMaster.findOne({
				where: {
					taskAutoId: task,
				},
			});

			if (!taskData) {
				return respHelper(res, {
					status: 200,
				});
			}

			const taskFormValues = await db.separationTaskFields.findAll({
				where: {
					taskAutoId: taskData.dataValues.taskDependent,
				},
				include: [
					{
						model: db.separationFieldValues,
						attributes: ["fieldValues"],
						where: {
							employeeId: user,
						},
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: taskFormValues,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async taskHistorySeparation(req, res) {
		try {
			const { search } = req.query;
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			const { count, rows: separationData } =
				await db.separationTrail.findAndCountAll({
					where: { pendingAt: req.userId, pending: 0 },
					include: [
						{
							model: db.separationMaster,
							where: {
								employeeId: { [Op.ne]: req.userId },
							},
							include: [
								{
									model: db.employeeMaster,
									attributes: ["empCode", "name"],
									where: {
										...(search && { name: { [Op.like]: `%${search}%` } }),
									},
								},
								{
									model: db.separationStatus,
									attributes: ["separationStatusCode", "separationStatusDesc"],
								},
								{
									model: db.separationReason,
									as: "empReasonofResignation",
									attributes: ["separationReason"],
								},
								{
									model: db.separationReason,
									as: "l1ReasonofResignation",
									attributes: ["separationReason"],
								},
								{
									model: db.separationReason,
									attributes: ["separationReason"],
									as: "l2ReasonofSeparation",
								},
								{
									model: db.subCategoryMaster,
									attributes: ["subCategoryName"],
									as: "revokeReason",
								},
							],
						},
						{
							model: db.separationStatus,
							attributes: ["separationStatusCode", "separationStatusDesc"],
						},
						{
							model: db.employeeMaster,
							attributes: ["empCode", "name"],
							as: "pendingat",
						},
					],
					limit,
					offset,
					distinct: true,
				});

			return respHelper(res, {
				status: 200,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					separationData,
				},
			});
		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async separationWorkflow(req, res) {
		try {
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			const docs = await db.separationInitiatedTask.findAll({
				where: {
					updatedBy: req.userId,
				},
				include: [
					{
						model: db.separationTaskOwner,
						attributes: ["taskOwnerAutoId", "taskOwner"],
						include: [
							{
								model: db.employeeMaster,
								attributes: ["empCode", "name"],
							},
						],
					},
					{
						model: db.separationTaskMaster,
						attributes: ["taskAutoId", "taskCode", "taskName"],
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "email", "empCode"],
						include: [
							{
								model: db.companyLocationMaster,
								attributes: ["address1"],
							},
							{
								model: db.jobDetails,
								attributes: ["dateOfJoining"],
								include: [
									{
										model: db.jobLevelMaster,
										attributes: ["jobLevelId", "jobLevelName", "jobLevelCode"],
									},
								],
							},
							{
								model: db.separationMaster,
								attributes: [
									"resignationDate",
									"noticePeriodDay",
									"l2LastWorkingDay",
								],
							},
						],
					},
					{
						model: db.separationFieldValues,
						attributes: ["fieldValues"],
						separate: true,
						include: [
							{
								model: db.separationTaskFields,
								attributes: ["fieldsCode", "label", "isRequired"],
							},
						],
					},
				],
				limit,
				offset,
			});

			const count = await db.separationInitiatedTask.count({
				where: { updatedBy: req.userId },
			});

			return respHelper(res, {
				status: 200,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					workflowData: docs,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async revokeSeparationBUHR(req, res) {
		try {
			const result = await validator.revokeSeparationBUHR.validateAsync(
				req.body,
			);

			const separationData = await db.separationMaster.findOne({
				where: {
					resignationAutoId: result.resignationAutoId,
					finalStatus: 9,
				},
				include: [{
					model: db.employeeMaster,
					where: {
						isActive: 1,
						dateOfexit: null
					}
				}]
			});

			if (!separationData) {
				return respHelper(res, {
					status: 404,
					msg: constant.SEPARATION_STATUS.replace("<status>", "can't be revoked"),
				});
			}

			await db.separationMaster.update(
				{
					l2RevokeReason: result.reason,
					l2RequestStatus: "Revoked",
					l2Remark: result.remark,
					l2RevokeDate: moment(),
					finalStatus: 11,
				},
				{
					where: {
						resignationAutoId: separationData.dataValues.resignationAutoId,
					},
				},
			);

			await db.separationTrail.create({
				separationAutoId: separationData.dataValues.resignationAutoId,
				actionUserRole: req.userRole,
				separationStatus: 11,
				actionDate: moment(),
				pending: 0,
				pendingAt: req.userId,
				createdBy: req.userId,
				createdDt: moment(),
			});

			await db.separationInitiatedTask.update(
				{
					isActive: 0,
				},
				{
					where: {
						resignationAutoId: separationData.dataValues.resignationAutoId,
					},
				},
			);

			await db.employeeMaster.update(
				{
					isActive: 1,
					dateOfexit: null,
				},
				{
					where: {
						id: separationData.dataValues.employeeId,
					},
				},
			);

			await db.jobDetails.update(
				{
					noticePeriodStatus: 0,
				},
				{
					where: {
						userId: separationData.dataValues.employeeId,
					},
				},
			);

			return respHelper(res, {
				status: 200,
				msg: constant.SEPARATION_REVOKED,
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

	async requestForPaymentApproval(req, res) {
		try {
			const result =
				await validator.requestForPaymentApprovalSchema.validateAsync(req.body);
			const existUser = await db.employeeMaster.findOne({
				raw: true,
				where: {
					id: req.userId,
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
			const isSameDetails = await db.paymentDetails.findOne({
				where: { userId: req.userId },
			});

			if (isSameDetails) {
				const base64Image = result.paymentAttachment;
				const folderImagePath = isSameDetails.paymentAttachment;

				let imageResult = await helper.compareImages(
					base64Image.split(",")[1],
					folderImagePath,
				);
				if (
					isSameDetails.paymentAccountNumber == result.paymentAccountNumber &&
					//isSameDetails.paymentBankIfsc == result.paymentBankIfsc &&
					isSameDetails.bankId == result.bankId &&
					isSameDetails.paymentHolderName == result.paymentHolderName &&
					imageResult == true
				) {
					return respHelper(res, {
						status: 400,
						msg: constant.ALREADY_EXISTS.replace("<module>", "Payment Details"),
					});
				} else {
					const d = Math.floor(Date.now() / 1000);
					if (result.paymentAttachment) {
						var paymentAttachment = await helper.fileUpload(
							result.paymentAttachment,
							`paymentDetails${d}`,
							`uploads/${existUser.empCode}`,
						);
					}
					// if (result.supportingDocument) {
					//   var supportingDocument = await helper.fileUpload(
					//     result.supportingDocument,
					//     `paymentDetails${d}`,
					//     `uploads/${existUser.empCode}`
					//   );
					// }
					const objForApproval = {
						status: "pending",
						pendingAt: 2996,
						requrestTriggred: moment().format("YYYY-MM-DD HH:mm:ss"),
						...(result.bankId != isSameDetails.bankId && {
							newBankId: result.bankId,
						}),

						...(result.paymentBankName != isSameDetails.paymentBankName && {
							newBankNameReq: result.paymentBankName,
						}),

						...(result.paymentAccountNumber !=
							isSameDetails.paymentAccountNumber && {
							newAccountNumberReq: result.paymentAccountNumber,
						}),

						...(result.paymentHolderName != isSameDetails.paymentHolderName && {
							newAccountHolderNameReq: result.paymentHolderName,
						}),

						...(result.paymentBankIfsc != isSameDetails.paymentBankIfsc && {
							newIfscCodeReq: result.paymentBankIfsc,
						}),

						...(result.comment
							? { comment: result.comment }
							: { comment: null }),

						...(result.paymentAttachment && imageResult == false
							? { newPaymentAttachment: paymentAttachment }
							: { newPaymentAttachment: null }),

						// ...(result.supportingDocument
						// ? { newSupportingDocument: supportingDocument }
						// : { newSupportingDocument: null }),
					};
					await db.paymentDetails.update(objForApproval, {
						where: { userId: req.userId },
					});
					eventEmitter.emit(
						"paymentDetailsApprovalRequestMail",
						JSON.stringify({
							email: result.email,
							name: existUser.name,
							senderEmail: existUser["companymaster.senderEmail"],
							companyLogo: existUser["companymaster.companyLogo"],
						}),
					);
					return respHelper(res, {
						status: 200,
						msg: constant.PAYMENT_REQUEST_FOR_APPROVAL,
					});
				}
			} else {
				const d = Math.floor(Date.now() / 1000);
				if (result.paymentAttachment) {
					var paymentAttachment = await helper.fileUpload(
						result.paymentAttachment,
						`paymentDetails${d}`,
						`uploads/${existUser.empCode}`,
					);
				}
				const objForApproval = {
					userId: req.userId,
					status: "pending",
					pendingAt: 2996,
					requrestTriggred: moment().format("YYYY-MM-DD HH:mm:ss"),
					...(result.bankId && { newBankId: result.bankId }),
					...(result.paymentBankName && {
						newBankNameReq: result.paymentBankName,
					}),
					...(result.paymentAccountNumber && {
						newAccountNumberReq: result.paymentAccountNumber,
					}),
					...(result.paymentHolderName && {
						newAccountHolderNameReq: result.paymentHolderName,
					}),
					...(result.paymentBankIfsc && {
						newIfscCodeReq: result.paymentBankIfsc,
					}),
					...(result.comment ? { comment: result.comment } : { comment: null }),

					...(result.paymentAttachment
						? { newPaymentAttachment: paymentAttachment }
						: { newPaymentAttachment: null }),

					// ...(result.supportingDocument
					//   ? { newSupportingDocument: supportingDocument }
					//   : { newSupportingDocument: null }),
				};
				await db.paymentDetails.create(objForApproval);
				eventEmitter.emit(
					"paymentDetailsApprovalRequestMail",
					JSON.stringify({
						email: result.email,
						name: existUser.name,
						senderEmail: existUser["companymaster.senderEmail"],
						companyLogo: existUser["companymaster.companyLogo"],
					}),
				);
				return respHelper(res, {
					status: 200,
					msg: constant.PAYMENT_REQUEST_FOR_APPROVAL,
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

	async mapBank(req, res) {
		try {
			const getAllEmployee = await db.paymentDetails.findAll({
				where: {
					paymentBankIfsc: { [Op.ne]: null },
				},
			});

			if (getAllEmployee) {
				for (let i = 0; i < getAllEmployee.length; i++) {
					const ele = getAllEmployee[i];
					const bankRecord = await db.bankMaster.findOne({
						where: { bankIfsc: ele.paymentBankIfsc },
					});

					if (bankRecord) {
						await db.paymentDetails.update(
							{ bankId: bankRecord.bankId },
							{ where: { userId: ele.userId } },
						);
					} else {
						console.log(
							"Bank ID is not available for IFSC:",
							ele.paymentBankIfsc,
						);
					}
				}
			}

			return res
				.status(200)
				.json({ message: "Bank mapping completed successfully" });
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
				msg: "Internal server error",
			});
		}
	}

	async mapOffRoleCtc(req, res) {
		try {
			const getOffRoleMaster = await db.offRoleCtc.findAll({});
			for (let index = 0; index < getOffRoleMaster.length; index++) {
				const element = getOffRoleMaster[index];
				await db.employeeMaster.update(
					{
						offRoleCTC: element.offRoleCtc,
						ESICPFDeduction: element.esicPFdeduction,
					},
					{
						where: {
							empCode: element.tmcCode,
						},
					},
				);
			}

			// Return success response
			return respHelper(res, {
				status: 200,
				msg: "Updated successfully",
			});
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
				msg: "Internal server error",
			});
		}
	}

	///CONFIRMATION///
	async confirmatonList(req, res) {
		try {
			// add search and pagination functionality

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

			const confirmationData = await db.Confirmationinitiated.findAndCountAll({
				where: {
					status: [0, 2],
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: [
							"id",
							"empCode",
							"name",
							"email",
							"departmentId",
							"companyLocationId",
							"designation_id",
						],
						where: searchQuery || undefined,
						include: [
							{
								model: db.jobDetails,
								attributes: [
									"dateOfJoining",
									"dateOfProbationEnd",
									"probationPeriod",
									"confirmationDate",
									"probationDays",
								],
							},
							{
								model: db.companyLocationMaster,
								required: false,
								attributes: ["address1", "address2"],
							},
							{
								model: db.designationMaster,
								required: true,
								attributes: ["designationId", "name"],
							},
							{
								model: db.departmentMaster,
								required: true,
								attributes: [
									"departmentId",
									"departmentCode",
									"departmentName",
								],
							},
						],
					},
					{
						model: db.Confirmationowners,
						attributes: [
							"employeeId",
							"canTakeAction",
							"level",
							"canTakeActionExtend",
						],
						where: {
							employeeId: req.userId,
						},
						include: {
							model: db.employeeMaster,
							attributes: ["empCode", "name"],
						},
					},
					{
						model: db.Confirmationaudittrail,
					},
				],
				limit,
				offset,
				// subQuery: false,
				distinct: true,
				required: !!searchQuery,
			});

			return respHelper(res, {
				status: 200,
				data: confirmationData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}
	async confirmatonFormSubmission(req, res) {
		// try {
		const cantakeAction = await db.Confirmationinitiated.findOne({
			where: {
				confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
				level: parseInt(req.query.level),
				status: 0,
			},
			include: [
				{
					model: db.Confirmationowners,
					attributes: [
						"employeeId",
						"canTakeAction",
						"level",
						"canTakeActionExtend",
					],
					where: {
						employeeId: req.userId,
						canTakeAction: 1,
						// slaEndDate: {
						//   [Op.gte]: moment().format("YYYY-MM-DD"), // today's date in YYYY-MM-DD format
						// },
					},
				},
			],
		});
		if (!cantakeAction) {
			return respHelper(res, {
				status: 400,
				msg: constant.CONFIRMATION.CANT_TAKE_ACTION,
			});
		}

		for (const element of req.body) {
			await db.Confirmationformfilledvalues.update(
				{
					values: element.confirmatoinformfieldsValues,
					updatedBy: req.userId,
				},
				{
					where: {
						confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
						confirmationFormGroupId: element.confirmationFormGroupId,
						level: parseInt(req.query.level),
						confirmatoinformfieldsAutoId: element.confirmatoinformfieldsAutoId,
					},
				},
			);
		}

		const employeeData = await db.jobDetails.findOne({
			where: {
				userId: req.query.employeeId,
			},
			attributes: ["userId", "jobLevelId", "dateOfProbationEnd"],
			include: {
				model: db.employeeMaster,
				attributes: ["id", "name", "confimationPolicyAutoId", "companyId"],
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

		if (employeeData) {
			let level = parseInt(req.query.level);
			let respfrom = await helper.generateFieldsForgivenLevel(
				employeeData?.employee?.confimationPolicyAutoId,
				level + 1,
				employeeData?.employee?.companyId,
			);

			await db.Confirmationowners.update(
				{
					canTakeAction: 0,
					canTakeActionExtend: 0,
					isCompleted: 1,
				},
				{
					where: {
						confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
						level: req.query.level,
					},
				},
			);
			let completedByusers = await helper.getEmpProfile(req.userId); //completedByusers data

			await db.Confirmationaudittrail.create({
				confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
				createdBy: 1,
				status: 1,
				level: level,
				message: `Completed by level ${level} ,${completedByusers?.name} (${completedByusers?.empCode})`,
				confirmationAction: 1,
				updatedBy: req.userId,
			});

			if (respfrom.levelFound) {
				await db.Confirmationinitiated.update(
					{
						level: respfrom.level,
					},
					{
						where: {
							confirmationinitiatedAutoId:
								req.query.confirmationinitiatedAutoId,
						},
					},
				);
				let EMP_DATA_SELF = await helper.getEmpProfile(req.query.employeeId); // SELF Manager
				// if (respfrom.level == 1) {
				let ownerId = 0;
				if (respfrom?.levelData?.ownerRole == "SELF") {
					ownerId = req.query.employeeId;
				} else if (respfrom?.levelData?.ownerRole == "MANAGER") {
					ownerId = EMP_DATA_SELF?.managerData?.id;
				} else if (respfrom?.levelData?.ownerRole == "L2_MANAGER") {
					let MANAAGER_MANAGER = await helper.getEmpProfile(
						EMP_DATA_SELF?.managerData?.id,
					); // MANAGER KA MANAGER
					ownerId = MANAAGER_MANAGER?.managerData?.id;
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
				} else {
					let ESCALTERDATA = await helper.getEmpProfile(ownerId); // NEXT Status DATA

					await db.Confirmationaudittrail.create({
						confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
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
					confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
					employeeId: 1982,
					level: respfrom.level,
					canTakeAction: 1,
					canTakeActionExtend: 1,
					confirmationFormGroupId: respfrom?.levelData?.confirmationFormGroupId,
					slaEndDate: null,
					createdBy: 1,
				});
				///ADMIN VIEW

				await db.Confirmationowners.create({
					confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
					employeeId: ownerId,
					level: respfrom.level,
					canTakeAction: 1,
					canTakeActionExtend: respfrom?.levelData?.ownerRole == "SELF" ? 0 : 1,
					confirmationFormGroupId: respfrom?.levelData?.confirmationFormGroupId,
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
						confirmationinitiatedAutoId: req.query.confirmationinitiatedAutoId,
						confirmationFormGroupId: formField.confirmationFormGroupId,
						confirmatoinformfieldsAutoId:
							formField.confirmatoinformfieldsAutoId,
						employeeId: req.query.employeeId,
						values: "",
						level: respfrom.level,
						createdBy: 1,
					});
				}
				if (bulkArray.length > 0) {
					await db.Confirmationformfilledvalues.bulkCreate(bulkArray);
				}
			} else {
				await db.Confirmationinitiated.update(
					{
						level: 0,
						status: 1,
					},
					{
						where: {
							confirmationinitiatedAutoId:
								req.query.confirmationinitiatedAutoId,
						},
					},
				);
			}
		}

		return respHelper(res, {
			status: 200,
			msg: constant.CONFIRMATION.FORM_SUBMISSION,
		});
		// } catch (error) {
		//   return respHelper(res, {
		//     status: 500,
		//     msg: "Internal server error",
		//   });
		// }
	}
	async confirmatonFormdetails(req, res) {
		try {
			const confirsmationData = await db.Confirmationinitiated.findOne({
				where: {
					confirmationinitiatedAutoId: req.params.confirmationinitiatedAutoId,
				},
				include: {
					model: db.Confirmationowners,
					attributes: [
						"employeeId",
						"canTakeAction",
						"level",
						"confirmationFormGroupId",
					],
					order: [["confirmationownersAutoId", "DESC"]],
					limit: 1,
					where: {
						employeeId: req.userId,
					},
				},
			});
			let formsFields = [];

			if (confirsmationData) {
				formsFields = await db.Confirmationformfilledvalues.findAll({
					where: {
						confirmationFormGroupId:
							confirsmationData?.confirmationowners[0]?.confirmationFormGroupId,
						confirmationinitiatedAutoId: req.params.confirmationinitiatedAutoId,
						level: confirsmationData?.confirmationowners[0]?.level,
					},
					include: {
						model: db.Confirmatoinformfields,
						where: {},
						include: {
							model: db.Confirmatoinformfieldsoptions.scope("latest"),
							attributes: ["value", "label"],
						},
					},
				});
			}

			return respHelper(res, {
				status: 200,
				data: formsFields,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}
	async extendProbation(req, res) {
		try {
			const result =
				await validator.requestForProbationExtendvalidationSchema.validateAsync(
					req.body,
				);

			const existUser = await db.employeeMaster.findOne({
				where: {
					id: result.employeeId,
					isActive: 1,
				},
				attributes: [
					"name",
					"empCode",
					"profileImage",
					"id",
					"confimationPolicyAutoId",
				],
				include: [
					{
						model: db.jobDetails,
					},
					{
						model: db.Confimationpolicy,
						require: true,
						where: {
							isActive: 1,
						},
					},
				],
			});
			const probationData = await db.probationMaster.findOne({
				where: {
					probationId: result.noticePeriodId,
				},
				attributes: [("probationId", "probationName", "durationOfProbation")],
			});
			const confirmationData = await db.Confirmationinitiated.findOne({
				where: {
					confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
					employeeId: result.employeeId,
					status: [0],
				},
			});
			if (existUser && probationData && confirmationData) {
				if (
					confirmationData.confirmationExtentionCount ===
					confirmationData.confirmationExtentionCountAllowed
				) {
					return respHelper(res, {
						status: 400,
						data: {},
						msg: constant.CONFIRMATION.EXTEND_PERMISSOIN_BREACH,
					});
				}
				const originalDate = moment(
					existUser.employeejobdetail.dateOfProbationEnd,
				);
				// Add  days
				const newDate = originalDate
					.clone()
					.add(probationData.durationOfProbation, "days");

				// Subtract days to calculate extension date
				const extenionDate = newDate
					.clone()
					.subtract(
						existUser?.confimationpolicy?.regenerateOnBeforeExtentioEndDays,
						"days",
					);

				let ACTION_TAKER = await helper.getEmpProfile(req.userId); // Action Taker
				await db.jobDetails.update(
					{
						probationId: result.noticePeriodId,
						updatedAt: moment(),
						probationPeriod: probationData.probationName,
						updatedBy: req.userId,
						probationDays: probationData.durationOfProbation,
						dateOfProbationEnd: newDate.format("YYYY-MM-DD"),
						dateOfProbationTriggerDate: extenionDate.format("YYYY-MM-DD"),
					},
					{
						where: {
							userId: existUser.id,
						},
					},
				);

				await db.Confirmationinitiated.update(
					{
						status: 2,
						updatedBy: req.userId,
						confirmationExtentionCount:
							parseInt(confirmationData.confirmationExtentionCount) + 1,
					},
					{
						where: {
							confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
						},
					},
				);

				await db.Confirmationaudittrail.create({
					confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
					createdBy: req.userId,
					status: 1,
					level: confirmationData.level,
					message: `Extended by level ${confirmationData.level} - ${ACTION_TAKER?.name} (${ACTION_TAKER?.empCode})`,
					confirmationAction: 2,
					updatedBy: req.userId,
				});

				let extendBulkArray = [
					{
						confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
						confirmationFormGroupId: 4,
						confirmatoinformfieldsAutoId: 1,
						employeeId: confirmationData.employeeId,
						level: confirmationData.level,
						values: result.noticePeriodId,
						createdBy: req.userId,
						updatedBy: req.userId,
					},
				];

				extendBulkArray.push({
					confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
					confirmationFormGroupId: 4,
					confirmatoinformfieldsAutoId: 2,
					employeeId: confirmationData.employeeId,
					level: confirmationData.level,
					values: result.recommendation,
					createdBy: req.userId,
					updatedBy: req.userId,
				});

				let profilePicture = "";
				if (result.attachment) {
					profilePicture = await helper.fileUpload(
						result.attachment,
						`extend_attachemnt_${existUser.id}`,
						`uploads/${existUser.empCode}`,
					);
				} else {
					profilePicture = "";
				}

				extendBulkArray.push({
					confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
					confirmationFormGroupId: 4,
					confirmatoinformfieldsAutoId: 3,
					employeeId: confirmationData.employeeId,
					level: confirmationData.level,
					values: profilePicture,
					createdBy: req.userId,
					updatedBy: req.userId,
				});
				await db.Confirmationformfilledvalues.update(
					{
						usedInForm: 0,
					},
					{
						where: {
							confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
							level: confirmationData.level,
						},
					},
				);
				await db.Confirmationformfilledvalues.bulkCreate(extendBulkArray);

				await db.Confirmationowners.update(
					{
						canTakeAction: 0,
						canTakeActionExtend: 0,
						isCompleted: 1,
					},
					{
						where: {
							confirmationinitiatedAutoId: result.confirmationinitiatedAutoId,
							level: confirmationData.level,
						},
					},
				);

				const confirmationPolicyData = await db.Confimationpolicy.findOne({
					where: {
						confimationPolicyAutoId: existUser?.confimationPolicyAutoId,
					},
					attributes: [
						"confiramtionEmailCC",
						"confiramtionRequestEmailCC",
						"extendEmailCC",
					],
				});
				let cc_arrays = [];
				let EMP_DATA_SELF = await helper.getEmpProfile(existUser?.id); // SELF DATA

				if (confirmationPolicyData) {
					let holdRowCCData =
						confirmationPolicyData?.dataValues?.extendEmailCC.split(",");
					if (holdRowCCData.length > 0) {
						for (const single_cc_array of holdRowCCData) {
							if (single_cc_array == "MANAGER") {
								cc_arrays.push(
									EMP_DATA_SELF?.dataValues.managerData?.dataValues?.email,
								);
							} else if (single_cc_array == "BUHR") {
								cc_arrays.push(
									EMP_DATA_SELF?.dataValues?.buhrData?.dataValues?.email,
								);
							}
						}
					}
				}

				eventEmitter.emit(
					"confirmatonExtend",
					JSON.stringify({
						EMP_DATA_SELF: EMP_DATA_SELF,
						ACTION_TAKER: ACTION_TAKER,
						cc: cc_arrays,
						senderEmail: EMP_DATA_SELF.companymaster.senderEmail,
					}),
				);

				return respHelper(res, {
					status: 200,
					data: {},
					msg: constant.CONFIRMATION.FORM_SUBMISSION,
				});
			} else {
				return respHelper(res, {
					status: 400,
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
	async confirmatonFormdetailsFilled(req, res) {
		try {
			const confirsmationData = await db.Confirmationinitiated.findOne({
				where: {
					confirmationinitiatedAutoId: req.params.confirmationinitiatedAutoId,
				},
				include: {
					model: db.Confirmationowners,
					attributes: [
						"employeeId",
						"canTakeAction",
						"level",
						"confirmationFormGroupId",
					],
					where: {
						employeeId: req.userId,
					},
				},
			});
			let formsFields = [];

			if (confirsmationData) {
				formsFields = await db.Confirmationformfilledvalues.findAll({
					where: {
						level: req.params?.level,
						usedInForm: 1,
						confirmationinitiatedAutoId: req.params.confirmationinitiatedAutoId,
					},
					include: {
						model: db.Confirmatoinformfields,
						include: {
							model: db.Confirmatoinformfieldsoptions,
							attributes: ["value", "label"],
						},
					},
				});
			}

			return respHelper(res, {
				status: 200,
				data: formsFields,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}
	///CONFIRMATION///

	async getEmploymentDetails(req, res) {
		try {
			let userId = req.query.user;

			let employmentDetails = await db.employeeMaster.findOne({
				where: { id: userId },
				attributes: ["id", "noticePeriodAutoId"],
				include: [
					{
						model: db.DesignationEmploymentHistory,
						as: "designationHistories",
						attributes: { exclude: ["createdBy", "updatedAt", "updatedBy"] },
						include: [
							{
								model: db.designationMaster,
								attributes: ["designationId", "name", "code"],
							},
							{
								model: db.companyMaster,
								attributes: ["companyId", "companyName", "companyCode"],
							},
							{
								model: db.employeeMaster,
								as: "designationHistoryCreatedBy",
								attributes: ["id", "name"],
							},
							// { model: db.designationMaster, as: 'designationChangesFrom', attributes: ['designationId', 'name', 'code' ] }
						],
						where: { employeeId: userId },
						required: false,
					},
					{
						model: db.DepartmentEmploymentHistory,
						as: "departmentHistories",
						attributes: {
							exclude: ["createdAt", "createdBy", "updatedAt", "updatedBy"],
						},
						include: [
							{
								model: db.departmentMaster,
								attributes: [
									"departmentId",
									"departmentName",
									"departmentCode",
								],
							},
							{
								model: db.functionalAreaMaster,
								attributes: [
									"functionalAreaId",
									"functionalAreaName",
									"functionalAreaCode",
								],
							},
							{
								model: db.employeeMaster,
								as: "departmentHistoryCreatedBy",
								attributes: ["id", "name"],
							},
							{ model: db.buMaster, attributes: ["buId", "buName"] },
							{ model: db.sbuMaster, attributes: ["sbuId", "sbuName"] },
							{
								model: db.employeeMaster,
								as: "departmentBUHR",
								attributes: ["id", "name"],
							},
							{
								model: db.employeeMaster,
								as: "departmentBUHead",
								attributes: ["id", "name"],
							},
							// { model: db.departmentMaster, as: 'departmentChangesFrom', attributes: ['departmentId', 'departmentName', 'departmentCode' ] }
						],
						where: { employeeId: userId },
						required: false,
					},
					{
						model: db.CostCenterEmploymentHistory,
						as: "costCenterHistories",
						attributes: {
							exclude: ["createdAt", "createdBy", "updatedAt", "updatedBy"],
						},
						include: [
							{
								model: db.costCenterMaster,
								attributes: [
									"costCenterId",
									"costCenterName",
									"costCenterCode",
								],
							},
							{
								model: db.employeeMaster,
								as: "costCenterHistoryCreatedBy",
								attributes: ["id", "name"],
							},
							// { model: db.costCenterMaster, as: 'costChangesFrom', attributes: ['costCenterId', 'costCenterName', 'costCenterCode' ] },
						],
						where: { employeeId: userId },
						required: false,
					},
					{
						model: db.JobLevelEmploymentHistory,
						as: "jobLevelHistories",
						attributes: {
							exclude: ["createdAt", "createdBy", "updatedAt", "updatedBy"],
						},
						include: [
							{
								model: db.jobLevelMaster,
								attributes: ["jobLevelId", "jobLevelName", "jobLevelCode"],
							},
							{
								model: db.employeeMaster,
								as: "jobLevelHistoryCreatedBy",
								attributes: ["id", "name"],
							},
							// { model: db.jobLevelMaster, as: 'jobLevelChangesFrom', attributes: ['jobLevelId', 'jobLevelName', 'jobLevelCode' ] }
						],
						where: { employeeId: userId },
						required: false,
					},
					{
						model: db.OfficeLocationEmploymentHistory,
						as: "officeLocationHistories",
						attributes: {
							exclude: ["createdAt", "createdBy", "updatedAt", "updatedBy"],
						},
						include: [
							{
								model: db.companyLocationMaster,
								attributes: ["companyLocationCode", "address1"],
								include: [
									{
										model: db.countryMaster,
										attributes: ["countryId", "countryName", "countryCode"],
									},
									{
										model: db.stateMaster,
										attributes: ["stateId", "stateName", "stateCode"],
									},
									{
										model: db.cityMaster,
										attributes: ["cityId", "cityName", "cityCode"],
									},
								],
							},
							{
								model: db.employeeMaster,
								as: "officeLocationHistoryCreatedBy",
								attributes: ["id", "name"],
							},
							// { model: db.companyLocationMaster, as: 'officeLocationChangesFrom', attributes: ['companyLocationCode', 'address1'],
							//   include: [
							//       { model: db.countryMaster, attributes: ['countryId', 'countryName', 'countryCode'] },
							//       { model: db.stateMaster, attributes: ['stateId', 'stateName', 'stateCode'] },
							//       { model: db.cityMaster, attributes: ['cityId', 'cityName', 'cityCode'] },
							//     ]
							// },
						],
						where: { employeeId: userId },
						required: false,
					},
					{
						model: db.EmployeeTypeEmploymentHistory,
						as: "employeeTypeHistories",
						attributes: {
							exclude: ["createdAt", "createdBy", "updatedAt", "updatedBy"],
						},
						include: [
							{
								model: db.employeeTypeMaster,
								attributes: ["empTypeId", "emptypename"],
							},
							{
								model: db.employeeMaster,
								as: "employeeTypeHistoryCreatedBy",
								attributes: ["id", "name"],
							},
							// { model: db.employeeTypeMaster, as: 'employeeTypeChangesFrom', attributes: ['empTypeId', 'emptypename'] },
						],
						where: { employeeId: userId },
						required: false,
					},
					{
						model: db.managerHistory,
						as: "managerHistories",
						attributes: {
							exclude: ["createdAt", "createdBy", "updatedAt", "updatedBy"],
						},
						include: [
							{
								model: db.employeeMaster,
								as: "managerHistoryDate",
								attributes: ["id", "name", "empCode"],
								include: [
									{
										model: db.departmentMaster,
										attributes: [
											"departmentId",
											"departmentName",
											"departmentCode",
										],
									},
								],
							},
							{
								model: db.employeeMaster,
								as: "managerHistoryCreatedBy",
								attributes: ["id", "name", "empCode"],
							},
							// { model: db.employeeMaster, as: 'managerChangesFrom', attributes: ['id', 'name', 'empCode' ] },
						],
						where: { needAttendanceCron: 0, employeeId: userId },
						required: false,
					},
					{ model: db.companyMaster, attributes: ["companyId", "companyName"] },
					{
						model: db.jobDetails,
						attributes: ["jobId", "userId", "dateOfJoining"],
					},
					{
						model: db.noticePeriodMaster,
						attributes: [
							"noticePeriodAutoId",
							"noticePeriodName",
							"noticePeriodCode",
							"nPDaysAfterConfirmation",
							"nPDaysInProbation",
						],
						required: false,
					},
				],
				order: [
					["designationHistories", "id", "ASC"], // Sorting for designationHistory
					["departmentHistories", "id", "ASC"], // Sorting for departmentHistory
					["costCenterHistories", "id", "ASC"], // Sorting for costCenterHistory
					["jobLevelHistories", "id", "ASC"], // Sorting for jobLevelHistory
					["employeeTypeHistories", "id", "ASC"], // Sorting for employeeTypeHistory
					["officeLocationHistories", "id", "ASC"], // Sorting for officeLocationHistory
					["managerHistories", "id", "ASC"], // Sorting for managerHistory
				],
			});

			if (employmentDetails) {
				return respHelper(res, {
					status: 200,
					msg: constant.DATA_FETCHED,
					data: employmentDetails,
				});
			} else {
				return respHelper(res, {
					status: 400,
					msg: constant.BAD_REQUEST,
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	//BULK ACTION TASK HISTORY
	async taskHistoryAttendanceActionByMe(req, res) {
		try {
			const { search, orderByOn } = req.query;
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			let order = [];

			if (orderByOn) {
				const createdAtOrder = orderByOn === "0" ? "desc" : "asc";
				order.push(["createdAt", createdAtOrder]);
			}

			const { count, rows: regularizationRequests } =
				await db.regularizationMaster.findAndCountAll({
					where: {
						regularizeStatus: { [Op.ne]: "Pending" },
						updatedBy: req.userId,
					},
					include: [
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							as: "attendanceUpdatedBy",
							required: false,
						},
						{
							model: db.attendanceMaster,
							required: true,
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name", "manager"],
									where: {
										...(search && { name: { [Op.like]: `%${search}%` } }),
									},
									include: [
										{
											model: db.employeeMaster,
											attributes: ["id", "empCode", "name"],
											as: "managerData",
										},
									],
									required: true,
								},
							],
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "empCode", "name"],
							as: "attendanceCreatedBy",
							required: false,
						},
					],
					limit,
					offset,
					order,
				});

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					regularizationRequests,
				},
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: error.message,
			});
		}
	}
	async taskHistoryLeaveActionByMe(req, res) {
		try {
			const {
				search,
				fromDate,
				toDate,
				orderByAppliedFor,
				orderByOn,
				type,
				isSystemGenerated,
			} = req.query;

			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			let order = [];

			if (orderByOn) {
				const createdAtOrder = orderByOn === "0" ? "desc" : "asc";
				order.push(["createdAt", createdAtOrder]);
			}

			const { count, rows: leaveRequests } =
				await db.EmployeeLeaveHeader.findAndCountAll({
					where: {
						status: { [Op.ne]: "pending" },
						...(isSystemGenerated == 1
							? { source: "system_generated" }
							: { source: { [Op.ne]: "system_generated" } }),
						...(type === "all" && isSystemGenerated == 0
							? {
								[Op.or]: [
									{
										//updatedBy: req.userId,
										source: { [Op.ne]: "system_generated" },
									},
								],
							}
							: type === "all" && isSystemGenerated == 1
								? {
									[Op.or]: [
										{ employeeId: req.userId },
										{ updatedBy: req.userId, source: "system_generated" },
									],
								}
								: { employeeId: req.userId }), // Default case for non-"all" types
					},
					include: [
						{
							model: db.employeeLeaveTransactions,
							// where:
							// 	type === "all" && isSystemGenerated == 0
							// 		? { pendingAt: req.userId }
							// 		: {},
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							where: { ...(search && { name: { [Op.like]: `%${search}%` } }) },
						},
						{
							model: db.leaveMaster,
							attributes: ["leaveId", "leaveName", "leaveCode"],
							as: "leaveMasterDetails",
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							as: "leaveUpdatedBy",
							required: false,
						},
						{
							model: db.leaveApprovalTrails,
							required: true,
							//separate: true, // Ensures sorting is applied properly
							order: [["leaveTrailAutoId", "ASC"]],
							// where: {
							//  // isApproved: {
							//  //  [Op.notIn]: [0],
							//  // },
							//  ...(type === "all" &&
							//      isSystemGenerated == 0 && { updatedBy: req.userId }),
							// },
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name"],
								},
							],
						},
						{
							model: db.leaveApprovalTrails,
							required: true,
							as: "trails",
							//separate: true, // Ensures sorting is applied properly
							order: [["leaveTrailAutoId", "ASC"]],
							where: {
								// isApproved: {
								//  [Op.notIn]: [0],
								// },
								...(type === "all" &&
									isSystemGenerated == 0 && { updatedBy: req.userId }),
							},
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "empCode", "name"],
								},
							],
						},
						{
							model: db.employeeMaster,
							attributes: ["id", "name", "empCode"],
							as: "leaveCreatedBy",
							required: false,
						},
					],
					limit,
					offset,
					order,
					distinct: true,
				});

			return respHelper(res, {
				status: 200,
				msg: constant.DATA_FETCHED,
				data: {
					totalRecords: count,
					totalPages: Math.ceil(count / limit),
					currentPage: pageNo,
					leaveRequests,
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
	async confirmatonListActionBy(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const search = req.query.search || "";
			const offset = (pageNo - 1) * limit;
			const confirmationData = await db.Confirmationinitiated.findAndCountAll({
				limit,
				offset,
				order: [
					["confirmationinitiatedAutoId", "DESC"], // Sorting
				],
				subQuery: false,
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "empCode", "name", "email"],
						where: { ...(search && { name: { [Op.like]: `%${search}%` } }) },
						include: [
							{
								model: db.jobDetails,
								attributes: [
									"dateOfJoining",
									"dateOfProbationEnd",
									"probationPeriod",
									"confirmationDate",
									"probationDays",
								],
							},
							{
								model: db.companyLocationMaster,
								required: false,
								attributes: ["address1", "address2"],
							},
							{
								model: db.designationMaster,
								required: true,
								attributes: ["designationId", "name"],
							},
							{
								model: db.departmentMaster,
								required: true,
								attributes: [
									"departmentId",
									"departmentCode",
									"departmentName",
								],
							},
						],
					},
					{
						model: db.Confirmationowners,
						attributes: [
							"employeeId",
							"canTakeAction",
							"level",
							"canTakeActionExtend",
						],
						where: {
							employeeId: req.userId,
						},
						include: {
							model: db.employeeMaster,
							attributes: ["empCode", "name"],
						},
					},
					{
						model: db.Confirmationaudittrail,
						where: {
							updatedBy: req.userId,
							confirmationAction: {
								[Op.in]: [1, 2],
							},
						},
						order: [["confirmationaudittrailAutoId", "DESC"]],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: confirmationData,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	//COMP OFF

	async checkPolicy(req, res) {
		// try {
		let compofftype = "Week Day";
		let attendance_auto_id = 343495;
		let attendanceStartDate = "2025-01-07";
		let attendanceEndDate = "2025-01-07";
		let shiftStartTime = "08:30:00";
		let shiftEndTime = "17:30:00";

		let allowedTime = await helper.timeDifference(
			`${attendanceStartDate} ${shiftStartTime}`,
			`${attendanceEndDate} ${shiftEndTime}`,
		);
		let empId = 694;

		let working_hours = "15:00:00";

		const employeeData = {
			compofftype: compofftype,
			attendance_auto_id: attendance_auto_id,
			attendanceStartDate: attendanceStartDate,
			attendanceEndDate: attendanceEndDate,
			attendanceDate: "2025-01-07",
			shiftStartTime: shiftStartTime,
			shiftEndTime: shiftEndTime,
			allowedTime: allowedTime,
			empId: empId,
			working_hours: working_hours,
			holiday: [],
			weekoff: [],
		};
		await helper.creditCompoff(employeeData);
		// } catch (error) {
		//   return respHelper(res, {
		//     status: 500,
		//     msg: "Internal server error",
		//   });
		// }
	}
	async compOffCreditHisttory(req, res) {
		try {
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const selectMode = req.query.type || "self";
			const offset = (pageNo - 1) * limit;

			const userId = req.query.user;
			let reporties = [];

			if (selectMode == "all") {
				reporties = await helper.reportieesofEmp(req.userId);
				reporties.push(req.userId);
			} else {
				var compOffbalabceForUser = await helper.compOffbalabceForUser(userId);
				reporties.push(userId);
			}

			const comp_off_credit_historyData =
				await db.comp_off_credit_history.findAndCountAll({
					where: {
						employee_Id: reporties,
						// status: {
						// 	[Op.ne]: 3, // status not equal to 3
						// },
					},
					include: [
						{
							model: db.status_master,
							attributes: ["name", "code"],
							required: true,
						},
						{
							model: db.employeeMaster,
							as: "compOffEmpDetails",
							attributes: ["id", "name", "profileImage", "empCode"],
						},
						{
							model: db.employeeMaster,
							as: "approvarEmpDetails",
							attributes: ["id", "name", "profileImage", "empCode"],
						},
						{
							model: db.attendanceMaster,
							as: "compOffAttendanceDetails",
							attributes: [
								"attendanceAutoId",
								"attendancePunchInTime",
								"attendancePunchOutTime",
								"attendanceWorkingTime",
								"attendanceDate",
								"attandanceShiftStartDate",
								"attendanceShiftEndDate",
								"attendancePunchInLocationType",
								"attendancePunchOutLocationType",
							],
						},
						{
							model: db.comp_off_polices,
							as: "compOffPolicyDetails",
						},
					],
					limit,
					offset,
					order: [
						["comp_off_credit_history_auto_id", "DESC"], // Sorting
					],
					group: ["employee_Id", "credit_for_date"],
				});

			return respHelper(res, {
				status: 200,
				data: {
					total_balance: compOffbalabceForUser,
					count: comp_off_credit_historyData.count,
					rows: comp_off_credit_historyData.rows,
				},
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}
	async compOffPendingForApproval(req, res) {
		try {
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			// add search functionality
			const search = req.query.search;

			let searchQuery = search
				? {
					[Op.or]: [
						{ empCode: { [Op.like]: `%${search}%` } },
						{ name: { [Op.like]: `%${search}%` } },
					],
				}
				: undefined;

			const userId = req.userId;
			const comp_off_credit_historyData =
				await db.comp_off_credit_history.findAndCountAll({
					attributes: [
						"comp_off_credit_history_auto_id",
						"attendanceAutoIdHistory",
						"employee_Id",
						"balance",
						"status",
						"credit_for",
						"total_hours",
						"adjust_hours",
						"expiry_date",
						"taken_on",
						"planned_message",
						"message",
						"approver_remark",
						"comp_off_polices_auto_id_history",
						"pending_at",
						"createdBy",
						"updatedBy",
						"createdAt",
						"updatedAt",
						"source",
						"credit_for_date",
					],
					where: {
						expiry_date: {
							[Op.or]: [
								{ [Op.eq]: null }, // Check if expiry_date is null
								{ [Op.gt]: moment().format("YYYY-MM-DD") }, // Check if expiry_date is greater than today
							],
						},
						[Op.or]: [
							{ pending_at: { [Op.like]: `${userId},%` } }, // Check if userId is at the start
							{ pending_at: { [Op.like]: `%,${userId},%` } }, // Check if userId is in the middle
							{ pending_at: { [Op.like]: `%,${userId}` } }, // Check if userId is at the end
							{ pending_at: { [Op.eq]: `${userId}` } }, // Check if userId is the only value
						],
						status: 3,
					},
					include: [
						{
							model: db.status_master,
							attributes: ["name", "code"],
							required: true,
						},
						{
							model: db.employeeMaster,
							as: "compOffEmpDetails",
							attributes: ["id", "name", "profileImage", "empCode"],
							required: !!searchQuery,
							where: searchQuery || undefined,
						},
						{
							model: db.attendanceMaster,
							as: "compOffAttendanceDetails",
							attributes: [
								"attendanceAutoId",
								"attendancePunchInTime",
								"attendancePunchOutTime",
								"attendanceWorkingTime",
								"attendanceDate",
								"attandanceShiftStartDate",
								"attendanceShiftEndDate",
								"attendancePunchInLocationType",
								"attendancePunchOutLocationType",
							],
						},
					],
					limit,
					offset,
					order: [
						["comp_off_credit_history_auto_id", "DESC"], // Sorting
					],
					group: ["credit_for_date", "employee_Id"],
					required: !!searchQuery,
				});

			return respHelper(res, {
				status: 200,
				data: comp_off_credit_historyData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}
	async actionOnCompoff(req, res) {
		try {
			const result = await validator.updateCompOffRequest.validateAsync(
				req.body,
			);
			const userId = req.userId;
			let comp_off_credit_history_auto_ids =
				req.body.comp_off_credit_history_auto_id;
			for (const singlecomp_off_credit_history_auto_ids of comp_off_credit_history_auto_ids) {
				await db.comp_off_credit_history.update(
					{
						updatedBy: req.userId,
						approver_remark: req.body.remarks,
						status: req.body.status == 1 ? 1 : 5,
					},
					{
						where: {
							expiry_date: {
								[Op.or]: [
									{ [Op.eq]: null }, // Check if expiry_date is null
									{ [Op.gt]: moment().format("YYYY-MM-DD") }, // Check if expiry_date is greater than today
								],
							},
							employee_Id: singlecomp_off_credit_history_auto_ids.empId,
							status: 3,
							credit_for_date: singlecomp_off_credit_history_auto_ids.date,
						},
					},
				);
				let EMP_DATA_SELF = await helper.getEmpProfile(
					singlecomp_off_credit_history_auto_ids.empId,
				); // SELF Manager
				const obj = {
					email: EMP_DATA_SELF.email,
					companyLogo: EMP_DATA_SELF.companymaster.companyLogo,
					senderEmail: EMP_DATA_SELF.companymaster.senderEmail,
					requesterName: EMP_DATA_SELF.name,
					managerName: EMP_DATA_SELF.managerData.name,
					status: req.body.status == 1 ? 1 : 5,
					compOffDate: singlecomp_off_credit_history_auto_ids.date,
				};
				eventEmitter.emit("compOffMailApproval", JSON.stringify(obj));
			}

			return respHelper(res, {
				status: 200,
				msg: "Updated",
			});
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
		}
	}
	async getTaskHistoryComfOffDetails(req, res) {
		try {
			const dataFor = req.query.dataFor;
			const empid = req.query.empid;

			const comp_off_credit_historyData =
				await db.comp_off_credit_history.findAll({
					where: {
						credit_for_date: dataFor,
						employee_Id: empid,
					},
					include: [
						{
							model: db.status_master,
							attributes: ["name", "code"],
							required: true,
						},
					],
				});

			return respHelper(res, {
				status: 200,
				data: comp_off_credit_historyData,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async searchEmpForRoster(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const search = req.query.search;
			let selectedUser = req.query.selectedUser;

			selectedUser = selectedUser ? selectedUser.split(",") : [];

			const employeeData = await db.employeeMaster.findAll({
				where: Object.assign(
					!["ADMIN", "HR_OPS"].includes(req.userRole)
						? {
							manager: req.userId,
						}
						: {},
					{
						isActive: 1,
					},
					search || search != ""
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
						}
						: {},
					selectedUser.length > 0
						? {
							id: {
								[Op.notIn]: selectedUser,
							},
						}
						: {},
				),
				attributes: ["id", "empCode", "name", "profileImage"],
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: employeeData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async rosterCalendar(req, res) {
		try {
			const minDate = req.query.date ? moment(req.query.date) : moment();
			const maxDate = (req.query.date ? moment(req.query.date) : moment()).add(
				6,
				"days",
			);
			let selectedUser = req.query.selectedUser.split(",");
			let dateArray = [];

			for (const element of selectedUser) {
				const user = await db.employeeMaster.findOne({
					where: {
						id: element,
					},
					attributes: ["id", "empCode", "name", "weekOffId"],
					include: [
						{
							model: db.shiftMaster,
							attributes: ["shiftName"],
						},
						{
							model: db.attendancePolicymaster,
							attributes: ["attendaceRosterLimitForPreviousDays"],
						},
						{
							model: db.weekOffMaster,
						},
					],
				});

				const rosterData = async () => {
					const rosterData = [];

					for (
						let currentDate = minDate.clone();
						currentDate.isSameOrBefore(maxDate);
						currentDate.add(1, "days")
					) {
						const attedanceData = await db.attendanceMaster.findOne({
							where: {
								employeeId: element,
								attendanceDate: currentDate.format("YYYY-MM-DD"),
							},
							attributes: ["attendanceDate", "employeeId"],
							include: [
								{
									model: db.shiftMaster,
									attributes: ["shiftName"],
								},
								{
									model: db.weekOffMaster,
								},
							],
						});

						const existRosterData = await db.AttendanceRoster.findOne({
							where: {
								employeeId: element,
								attendanceDate: currentDate.format("YYYY-MM-DD"),
							},
							attributes: ["attendanceDate", "employeeId"],
							include: [
								{
									model: db.shiftMaster,
									attributes: ["shiftName"],
								},
								{
									model: db.weekOffMaster,
								},
							],
						});

						const dayCode = parseInt(moment(currentDate).format("d")) + 1;
						const dayOfMonth = currentDate.date();
						const occurrence = Math.ceil(dayOfMonth / 7);
						const currentWeekOffId = existRosterData
							? existRosterData.dataValues.weekOffMaster.weekOffId
							: attedanceData
								? attedanceData.dataValues.weekOffMaster.weekOffId
								: user.dataValues.weekOffMaster
									? user.dataValues.weekOffMaster.weekOffId
									: 0;

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

						rosterData.push({
							day: moment(currentDate).format("dddd"),
							date: currentDate.format("YYYY-MM-DD"),
							shift: checkWeekOff
								? { shiftName: `Weekly Off` }
								: attedanceData
									? attedanceData.dataValues.shiftsmaster
									: existRosterData
										? existRosterData.dataValues.shiftsmaster
										: user.dataValues.shiftsmaster,
						});
					}

					return rosterData;
				};

				dateArray.push({
					id: user.dataValues.id,
					empCode: user.dataValues.empCode,
					name: user.dataValues.name,
					rosterLimit: user.dataValues.attendancePolicymaster
						? user.dataValues.attendancePolicymaster
							.attendaceRosterLimitForPreviousDays
						: 0,
					attendanceRosterData: await rosterData(),
				});
			}

			return respHelper(res, {
				status: 200,
				data: dateArray,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async actionOnLeaveCompoff(req, res) {
		try {
			const result = await validator.updateCompOffLeaveRequest.validateAsync(
				req.body,
			);
			const getLeaveRequest = await db.EmployeeLeaveHeader.findOne({
				attributes: ["employeeId", "leaveAutoId", "leaveCount"],
				where: {
					employeeId: 3201,
					leaveAutoId: 9,
					status: "pending",
				},
				include: [
					{
						model: db.employeeLeaveTransactions,
						attributes: [
							"employeeleavetransactionsId",
							"employeeId",
							"employeeleaveheaderID",
						],
					},
				],
				raw: true,
			});
			console.log(">>>>>>", getLeaveRequest);
			return;
			if (!getLeaveRequest) {
				return respHelper(res, {
					status: 400,
					msg: "No Request Available For Leave",
					data: {},
				});
			}

			const comp_off_credit_historyData =
				await db.comp_off_credit_history.findAll({
					attributes: ["employee_Id", "balance"],
					where: {
						employee_Id: 3201,
						status: 1,
						expiry_date: {
							[Op.or]: [
								{ [Op.eq]: null }, // Check if expiry_date is null
								{ [Op.gt]: moment().format("YYYY-MM-DD") }, // Check if expiry_date is greater than today
							],
						},
					},
					raw: true,
				});

			if (comp_off_credit_historyData.length == 0) {
				return respHelper(res, {
					status: 400,
					msg: "No Comp-off Leave Available",
					data: {},
				});
			}

			const totalBalanceCompOffLeaveBalance =
				comp_off_credit_historyData.reduce((sum, record) => {
					return sum + parseFloat(record.balance);
				}, 0);

			if (
				parseFloat(totalBalanceCompOffLeaveBalance) <
				parseFloat(getLeaveRequest.leaveCount)
			) {
				return respHelper(res, {
					status: 400,
					msg: "You Can't Approve Selected Comp Off Request",
					data: {},
				});
			} else {
				let leaveToDeduct = parseFloat(getLeaveRequest.leaveCount);

				while (leaveToDeduct > 0) {
					// Find the closest expiry date record
					const findCloseDate = await db.comp_off_credit_history.findOne({
						attributes: [
							"comp_off_credit_history_auto_id",
							"employee_id",
							"balance",
						],
						where: {
							employee_Id: 3201,
							status: 1,
							expiry_date: {
								[Op.or]: [
									{ [Op.eq]: null },
									{ [Op.gt]: moment().format("YYYY-MM-DD") },
								],
							},
						},
						raw: true,
						order: [["expiry_date", "ASC"]],
					});

					if (!findCloseDate) {
						console.log("No more eligible comp-off records to process.");
						break;
					}

					const availableBalance = parseFloat(findCloseDate.balance);

					if (leaveToDeduct <= availableBalance) {
						await db.comp_off_credit_history.update(
							{
								updatedBy: req.userId,
								approver_remark: req.body.remarks,
								...(req.body.status === 1 && { status: 2 }),
							},
							{
								where: {
									comp_off_credit_history_auto_id:
										findCloseDate.comp_off_credit_history_auto_id,
								},
							},
						);

						leaveToDeduct = 0;
					} else {
						await db.comp_off_credit_history.update(
							{
								updatedBy: req.userId,
								approver_remark: req.body.remarks,
								...(req.body.status === 1 && { status: 2 }),
							},
							{
								where: {
									comp_off_credit_history_auto_id:
										findCloseDate.comp_off_credit_history_auto_id,
								},
							},
						);

						leaveToDeduct -= availableBalance;
					}
					console.log("Processed record:", findCloseDate);
					console.log("Remaining leaveToDeduct:", leaveToDeduct);
				}
				console.log("Final leaveToDeduct:", leaveToDeduct);
			}

			return respHelper(res, {
				status: 200,
				msg: "Updated",
			});
		} catch (error) {
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
		}
	}

	// ritak address approval module start
	async requestForAddressApproval(req, res) {
		try {
			const result =
				await validator.requestForAddressApprovalSchema.validateAsync(req.body);

			const existUser = await db.employeeMaster.findOne({
				raw: true,
				where: {
					id: req.userId,
					isActive: 1,
				},

				attributes: ["name", "empCode", "profileImage", "email"],

				include: [
					{
						model: db.companyMaster,
						attributes: ["senderEmail", "companyLogo"],
					},
				],
			});

			var reqUserRole = req.userData["role.name"];

			const isSameDetails = await db.employeeAddress.findOne({
				where: {
					employeeId: result.employeeId ? result.employeeId : req.userId,
				},
			});
			console.log("isSameDetails", isSameDetails);
			if (!isSameDetails) {
				let obj = {
					...result,
					...{ createdBy: req.userId },
					...{ createdAt: moment() },
					...{ employeeId: req.userId },
					...{ isActive: 1 },
				};

				await db.employeeAddress.create(obj);

				return respHelper(res, {
					status: 200,
					msg: constant.INSERT_SUCCESS,
				});
			}

			if (
				isSameDetails.currentHouse === result.currentHouse &&
				isSameDetails.currentStreet === result.currentStreet &&
				isSameDetails.currentStateId === result.currentStateId &&
				isSameDetails.currentCityId === result.currentCityId &&
				isSameDetails.currentCountryId === result.currentCountryId &&
				isSameDetails.currentPincodeId === result.currentPincodeId &&
				isSameDetails.currentLandmark === result.currentLandmark &&
				isSameDetails.permanentHouse === result.permanentHouse &&
				isSameDetails.permanentStreet === result.permanentStreet &&
				isSameDetails.permanentStateId === result.permanentStateId &&
				isSameDetails.permanentCityId === result.permanentCityId &&
				isSameDetails.permanentCountryId === result.permanentCountryId &&
				isSameDetails.permanentPincodeId === result.permanentPincodeId &&
				isSameDetails.permanentLandmark === result.permanentLandmark &&
				isSameDetails.emergencyHouse === result.emergencyHouse &&
				isSameDetails.emergencyStreet === result.emergencyStreet &&
				isSameDetails.emergencyStateId === result.emergencyStateId &&
				isSameDetails.emergencyCityId === result.emergencyCityId &&
				isSameDetails.emergencyCountryId === result.emergencyCountryId &&
				isSameDetails.emergencyPincodeId === result.emergencyPincodeId &&
				isSameDetails.emergencyLandmark === result.emergencyLandmark
			) {
				return respHelper(res, {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Address Details"),
				});
			} else {
				const objForApproval = {
					status: "pending",
					createdByRole: "User",
					pendingAt: 2996, // Replace with the appropriate approver ID
					requestTriggered: moment().format("YYYY-MM-DD HH:mm:ss"),
					...(result.currentHouse !== isSameDetails.currentHouse && {
						newCurrentHouse: result.currentHouse,
					}),
					...(result.currentStreet !== isSameDetails.currentStreet && {
						newCurrentStreet: result.currentStreet,
					}),
					...(result.currentStateId !== isSameDetails.currentStateId && {
						newCurrentStateId: result.currentStateId,
					}),
					...(result.currentCityId !== isSameDetails.currentCityId && {
						newCurrentCityId: result.currentCityId,
					}),
					...(result.currentCountryId !== isSameDetails.currentCountryId && {
						newCurrentCountryId: result.currentCountryId,
					}),
					...(result.currentPincodeId !== isSameDetails.currentPincodeId && {
						newCurrentPincodeId: result.currentPincodeId,
					}),
					...(result.currentLandmark !== isSameDetails.currentLandmark && {
						newCurrentLandmark: result.currentLandmark,
					}),
					...(result.permanentHouse !== isSameDetails.permanentHouse && {
						newPermanentHouse: result.permanentHouse,
					}),
					...(result.permanentStreet !== isSameDetails.permanentStreet && {
						newPermanentStreet: result.permanentStreet,
					}),
					...(result.permanentStateId !== isSameDetails.permanentStateId && {
						newPermanentStateId: result.permanentStateId,
					}),
					...(result.permanentCityId !== isSameDetails.permanentCityId && {
						newPermanentCityId: result.permanentCityId,
					}),
					...(result.permanentCountryId !==
						isSameDetails.permanentCountryId && {
						newPermanentCountryId: result.permanentCountryId,
					}),
					...(result.permanentPincodeId !==
						isSameDetails.permanentPincodeId && {
						newPermanentPincodeId: result.permanentPincodeId,
					}),
					...(result.permanentLandmark !== isSameDetails.permanentLandmark && {
						newPermanentLandmark: result.permanentLandmark,
					}),
					...(result.emergencyHouse !== isSameDetails.emergencyHouse && {
						newEmergencyHouse: result.emergencyHouse,
					}),
					...(result.emergencyStreet !== isSameDetails.emergencyStreet && {
						newEmergencyStreet: result.emergencyStreet,
					}),
					...(result.emergencyStateId !== isSameDetails.emergencyStateId && {
						newEmergencyStateId: result.emergencyStateId,
					}),
					...(result.emergencyCityId !== isSameDetails.emergencyCityId && {
						newEmergencyCityId: result.emergencyCityId,
					}),
					...(result.emergencyCountryId !==
						isSameDetails.emergencyCountryId && {
						newEmergencyCountryId: result.emergencyCountryId,
					}),
					...(result.emergencyPincodeId !==
						isSameDetails.emergencyPincodeId && {
						newEmergencyPincodeId: result.emergencyPincodeId,
					}),
					...(result.emergencyLandmark !== isSameDetails.emergencyLandmark && {
						newEmergencyLandmark: result.emergencyLandmark,
					}),
					...(result.comment ? { comment: result.comment } : { comment: null }),
				};

				await db.employeeAddress.update(objForApproval, {
					where: { employeeId: req.userId },
				});

				console.log("existUser.email", existUser);

				eventEmitter.emit(
					"addressDetailsApprovalRequestMail",
					JSON.stringify({
						email: existUser.email,
						name: existUser.name,
						senderEmail: existUser["companymaster.senderEmail"],
						companyLogo: existUser["companymaster.companyLogo"],
					}),
				);

				return respHelper(res, {
					status: 200,
					msg: constant.ADDRESS_REQUEST_FOR_APPROVAL,
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
	// ritak address approval module end

	//hr policy for User start

	async fetchHrPolicyByEmpId(req, res) {
		try {
			const employeeId = req.query.employeeId || req.userId;

			// Fetch unsigned (pending) HR policies
			const unsignedPolicies = await db.hrPolicySignoffs.findAll({
				where: {
					user_id: employeeId,
					status: "pending",
				},
				include: [
					{
						model: db.hrPolicies,
						where: { isActive: 1, is_archived: 0 },
						required: true,
						include: [
							{
								model: db.hrPolicyCategories,
								where: { isActive: 1 },
								as: "category",
								required: true,
							},
						],
					},
				],
			});

			// Fetch signed HR policies
			const signedPolicies = await db.hrPolicySignoffs.findAll({
				where: {
					user_id: employeeId,
					status: {
						[Op.ne]: "pending",
					},
				},
				include: [
					{
						model: db.hrPolicies,
						where: { isActive: 1, is_archived: 0 },
						required: true,
						include: [
							{
								model: db.hrPolicyCategories,
								where: { isActive: 1 },
								as: "category",
								required: true,
							},
						],
					},
				],
				order: [[db.hrPolicies, "updatedAt", "DESC"]],
			});

			//	if (!unsignedPolicies.length && !signedPolicies.length) {
			//return respHelper(res, {
			//	status: 404,
			//	msg: "No HR policies found for this employee",
			//});
			//}

			return respHelper(res, {
				status: 200,
				msg: "Policies fetched successfully",
				data: {
					unsignedPolicies,
					signedPolicies,
				},
			});
		} catch (error) {
			console.error("❌ Error fetching HR policies:", error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async acknowledgeHrPolicy(req, res) {
		try {
			let { policyId, action, declineReason } = req.body;
			const userId = req.userId;

			// Validate the action
			if (!["signed", "declined", "viewed"].includes(action)) {
				return respHelper(res, {
					status: 400,
					msg: "Invalid action. Only 'signed', 'declined', or 'viewed' are allowed.",
				});
			}

			if (!policyId || policyId === "null") {
				return respHelper(res, {
					status: 400,
					msg: "Policy ID is required.",
				});
			}
			// Normalize policyId to an array
			let policyIds = [];
			console.log("policyId", typeof policyId);
			if (typeof policyId === "string") {
				// If policyId has commas, split it into an array, else handle as a single ID
				policyIds = policyId
					.split(",")
					.map((id) => id.trim())
					.filter((id) => id);
			} else {
				policyIds = [policyId];
			}

			// If the policyIds array is empty after splitting, return an error
			if (policyIds.length === 0) {
				return respHelper(res, {
					status: 400,
					msg: "No valid policy IDs provided.",
				});
			}

			const now = moment().format("YYYY-MM-DD HH:mm:ss");

			for (const id of policyIds) {
				// Check if the policy exists
				const policyExists = await db.hrPolicies.findOne({ where: { id } });
				if (!policyExists) {
					continue; // Skip invalid policy
				}

				// Check for existing signoff
				let policySignoff = await db.hrPolicySignoffs.findOne({
					where: {
						hr_policy_id: id,
						user_id: userId,
					},
				});

				if (policySignoff) {
					await policySignoff.update({
						deviceIp:
							req.headers["x-real-ip"] || (await helper.ip(req._remoteAddress)),
						device: req.headers.source || null,
						status: action,
						declineReason: declineReason || "",
						updated_at: now,
					});
				}
			}

			// Update the flag for the user
			await db.employeeMaster.update(
				{ showHrPolicyModal: 0 },
				{ where: { id: userId } },
			);

			return respHelper(res, {
				status: 200,
				msg: `Policy ${action} successfully`,
			});
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500, msg: "Internal server error" });
		}
	}

	async notification(req, res) {
		try {
			const userId = req.userId;
			const date = new Date();
			date.setDate(date.getDate() - process.env.TARA_NOTIFICATION_DAYS);
			console.log("date", date);
			const notification = await db.pushNotificationHistory.findAll({
				where: {
					employeeId: userId,
					status: "success",
					createdAt: { [Op.gte]: date },
				},
				order: [["createdAt", "DESC"]],
			});

			return respHelper(res, {
				status: 200,
				msg: "Notification fetched successfully",
				data: notification,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async readNotification(req, res) {
		try {
			const userId = req.userId;
			const notification = await db.pushNotificationHistory.update(
				{
					isRead: 1,
				},
				{
					where: {
						id: req.body.ids.split(","),
					},
				},
			);

			return respHelper(res, {
				status: 200,
				msg: "Notification Read successfully",
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	// hr policy for User end

	/**
	 * Update attendance setting
	 */

	async updateAttendanceSetting(req, res) {
		try {
			let {
				enableBiometricAttendance,
				enableMobileAttendance,
				enableWebAttendance,
				employeeId,
			} = req.body;
			if (
				!employeeId ||
				enableBiometricAttendance == null ||
				enableMobileAttendance == null ||
				enableWebAttendance == null
			) {
				return respHelper(res, {
					status: 400,
					msg: "Bad request",
				});
			}
			let metaData = {
				enableBiometricAttendance: enableBiometricAttendance,
				enableMobileAttendance: enableMobileAttendance,
				enableWebAttendance: enableWebAttendance,
				updatedBy: req.userId,
				updatedAt: moment(),
			};

			let query = { id: employeeId };
			let response = await db.employeeMaster.update(metaData, { where: query });
			return respHelper(res, {
				status: 202,
				msg: constant.UPDATE_SUCCESS.replace("<module>", "Data"),
			});
		} catch (error) {
			console.log("Error throw while update attendance setting", error);
			return respHelper(res, {
				status: 500,
				msg: "",
			});
		}
	}
}

const inactiveEmpOnLastWorkingDay = async (emp, exitDate) => {
	await db.employeeMaster.update(
		{
			isActive: 0,
			dateOfexit: exitDate,
		},
		{
			where: {
				id: emp,
			},
		},
	);
};

export default new UserController();
