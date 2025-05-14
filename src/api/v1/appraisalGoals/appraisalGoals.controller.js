import respHelper from "../../../helper/respHelper.js";
import db from "../../../config/db.config.js";
import moment from "moment";
import message from "../../../constant/messages.js";
import validator from "../../../helper/validator.js";
import helper from "../../../helper/helper.js";
import eventEmitter from "../../../services/eventService.js";
import { Model, NUMBER, Op, where } from "sequelize";
import fs from "fs";
import path from "path";
import pkg from "xlsx";
import logger from "../../../helper/logger.js";
import {
	getEmployeesAssignment,
	getEmployeesPragatGoalList,
	getEmployeesToAssignGoalPlan,
} from "../common/common.controller.js";

class AppraisalGoalsController {
	async createGoalPlan(req, res) {
		try {
			const result = await validator.createAppraisalGoals.validateAsync(
				req.body,
			);

			const [existingGoalPlan, existingGoalPlanId] = await Promise.all([
				db.appraisalGoalsMaster.findOne({
					where: { goalPlanName: result.goalPlanName },
				}),
				db.appraisalGoalsMaster.findOne({
					where: { goalPlanId: result.goalPlanId },
				}),
			]);

			if (existingGoalPlan) {
				return respHelper(res, {
					status: 400,
					msg: message.APPRAISAL.GOAL_PLAN_NAME_ALREADY_EXISTS,
				});
			}

			if (existingGoalPlanId) {
				return respHelper(res, {
					status: 400,
					msg: message.APPRAISAL.GOAL_PLAN_ID, // adjust key name if needed
				});
			}

			const createGoal = await db.appraisalGoalsMaster.create(result);

			if (createGoal) {
				const goalAttributesWithGoalId = result.goalAttributes.map((attr) => ({
					//...attr,
					goalAttributeId: attr.goalAttributesId,
					enable: attr.goalNameEnable,
					mandatory: attr.goalMandate,
					editable: attr.goalEditable,
					needsApproval: attr.goalNeedApproval,
					appraisalGoalId: createGoal.appraisalGoalId, // Adding the ID to each entry
					goalType: 1,
				}));

				const subGoalAttributesWithGoalId =
					result.subGoalAttributes?.map((attr) => ({
						// ...attr,
						goalAttributeId: attr.goalAttributesId,
						enable: attr.goalNameEnable,
						mandatory: attr.goalMandate,
						editable: attr.goalEditable,
						needsApproval: attr.goalNeedApproval,
						appraisalGoalId: createGoal.appraisalGoalId, // Adding the ID to each entry
						goalType: 2,
					})) || [];

				const mergeGoalAndSubGoals = [
					...goalAttributesWithGoalId,
					...subGoalAttributesWithGoalId,
				];

				await db.goalAttributesMapping.destroy({
					where: { appraisalGoalId: createGoal.appraisalGoalId },
				});
				await db.goalAttributesMapping.bulkCreate(mergeGoalAndSubGoals);
			}

			return respHelper(res, {
				status: 200,
				data: result,
				msg: message.APPRAISAL.GOAL_CREATION,
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
	async goalPlanList(req, res) {
		try {
			const whereCondition = {
				type: req.query.type,
				isDeleted: 0,
			};

			const goalList = await db.appraisalGoalsMaster.findAll({
				//attributes:['updatedAt'],
				where: whereCondition,
				include: [
					{
						model: db.user_assignment,
						required: false,
						on: db.sequelize.literal(
							"FIND_IN_SET(`user_assignments`.`id`, `appraisalgoalsmaster`.`userAssignment`) > 0",
						),
					},
					{
						model: db.goalAttributesMapping,
						attributes: [
							["goalAttributeId", "goalAttributesId"],
							["enable", "goalNameEnable"],
							["mandatory", "goalMandate"],
							["editable", "goalEditable"],
							["needsApproval", "goalNeedApproval"],
							"isDisableMandate",
							"appraisalGoalId",
							"companyId",
							"goalType",
							"createdBy",
							"createdAt",
							"updatedBy",
							"updatedAt",
							"isActive",
						],
						as: "goalAttributes",
						where: { goalType: 1 },
						required: false,
						include: [
							{
								model: db.goalAttributesConfigMaster,
							},
						],
					},
					{
						model: db.goalAttributesMapping,
						attributes: [
							["goalAttributeId", "goalAttributesId"],
							["enable", "goalNameEnable"],
							["mandatory", "goalMandate"],
							["editable", "goalEditable"],
							["needsApproval", "goalNeedApproval"],
							"isDisableMandate",
							"appraisalGoalId",
							"companyId",
							"goalType",
							"createdBy",
							"createdAt",
							"updatedBy",
							"updatedAt",
							"isActive",
						],
						as: "subGoalAttributes",
						where: { goalType: 2 },
						required: false,
						include: [
							{
								model: db.goalAttributesConfigMaster,
								//attributes: ['goalAttributeName']
							},
						],
					},
				],
				order: [
					[
						{ model: db.goalAttributesMapping, as: "goalAttributes" },
						"goalAttributeId",
						"ASC",
					],
					[
						{ model: db.goalAttributesMapping, as: "subGoalAttributes" },
						"goalAttributeId",
						"ASC",
					],
					["updatedAt", "DESC"],
				],
			});

			return respHelper(res, {
				status: 200,
				data: goalList,
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

	async goalAttributesList(req, res) {
		try {
			const goalAttributes = await db.goalAttributesConfigMaster.findAll({
				where: {
					isActive: 1,
					goalType: 1,
					//endDate: { [Op.lte]: moment().format("YYYY-MM-DD") }
				},
			});
			return respHelper(res, {
				status: 200,
				data: goalAttributes,
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

	async subGoalAttributesList(req, res) {
		try {
			const goalAttributes = await db.goalAttributesConfigMaster.findAll({
				where: {
					isActive: 1,
					goalType: 2,
					//endDate: { [Op.lte]: moment().format("YYYY-MM-DD") }
				},
			});
			return respHelper(res, {
				status: 200,
				data: goalAttributes,
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

	async activeGoalPlan(req, res) {
		try {
			const { appraisalGoalId } = req.body;

			const currentPlan = await db.appraisalGoalsMaster.findOne({
				where: { appraisalGoalId, isDeleted: 0 },
			});

			if (!currentPlan || !currentPlan.userAssignment) {
				return respHelper(res, {
					status: 404,
					msg: "Goal Plan not found or no userAssignment",
				});
			}

			const assignmentIds = currentPlan.userAssignment
				.split(",")
				.map((id) => id.trim());

			const likeConditions = assignmentIds.map((id) => ({
				userAssignment: { [Op.like]: `%${id}%` },
			}));

			const assignmentExists = await db.appraisalGoalsMaster.findOne({
				attributes: ["appraisalGoalId", "userAssignment"],
				where: {
					type: 1,
					isDeleted: 0,
					appraisalGoalId: { [Op.ne]: appraisalGoalId },
					[Op.or]: likeConditions,
				},
			});

			if (assignmentExists) {
				return respHelper(res, {
					status: 400,
					msg: "A conflicting goal plan is already active.",
				});
			}

			await db.appraisalGoalsMaster.update(
				{ type: 1 },
				{
					where: { appraisalGoalId },
				},
			);

			const activePlans = await db.appraisalGoalsMaster.findAll({
				attributes: ["appraisalGoalId", "userAssignment"],
				where: { type: 1, isDeleted: 0 },
			});

			const allUserKeys = new Set();
			const insertPayload = [];

			for (const plan of activePlans) {
				const userList = await getEmployeesToAssignGoalPlan(
					plan.userAssignment,
				);

				for (const user of userList) {
					const key = `${user.email}_${user.id}`;
					if (!allUserKeys.has(key)) {
						allUserKeys.add(key);
						insertPayload.push({
							tmc: user.empCode,
							email: user.email,
							userId: user.id,
							goalPlanId: plan.appraisalGoalId, // ensure correct ID used
							isActive: 1,
						});
					}
				}
			}

			// Fetch users who already received mail and are still active
			const existing = await db.goalPlanMail.findAll({
				attributes: ["email", "userId"],
				where: {
					isActive: 1,
				},
			});

			const existingMap = new Set(
				existing.map((e) => `${e.email}_${e.userId}`),
			);

			// Filter to only new insertions
			const newInserts = insertPayload.filter(
				(entry) => !existingMap.has(`${entry.email}_${entry.userId}`),
			);

			if (newInserts.length > 0) {
				await db.goalPlanMail.bulkCreate(newInserts);
				// Send emails for the new goal plans
				const getUserAssigmentIds = await db.appraisalGoalsMaster.findOne({
					where: { appraisalGoalId: appraisalGoalId },
				});

				for (const entry of newInserts) {
					const user = await db.employeeMaster.findOne({
						where: { id: entry.userId },
						include: [
							{
								model: db.companyMaster,
								attributes: ["senderEmail", "companyLogo", "companyName"],
							},
						],
						attributes: ["name", "email"],
						raw: true,
					});

					eventEmitter.emit(
						"goalPlanAssignToEmployee",
						JSON.stringify({
							email: user.email,
							name: user.name,
							startDate: moment(getUserAssigmentIds.startDate).format(
								"DD-MM-YYYY",
							),
							endDate: moment(getUserAssigmentIds.endDate).format("DD-MM-YYYY"),
							goalPlanDescription: getUserAssigmentIds.goalPlanDescription,
							goalPlanName: getUserAssigmentIds.goalPlanName,
							senderEmail: user["companymaster.senderEmail"] || "",
							companyLogo: user["companymaster.companyLogo"] || "",
							companyName: user["companymaster.companyName"] || "",
						}),
					);
					console.log(`Goal plan email triggered for ${user.email}`);
				}
			}

			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.GOAL_ACTIVE,
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

	async archiveGoalPlan(req, res) {
		try {
			const { appraisalGoalId } = req.body;
			const changeDraftToActive = await db.appraisalGoalsMaster.update(
				{ type: 2 },
				{
					where: { appraisalGoalId: appraisalGoalId },
				},
			);
			await db.goalPlanMail.update(
				{ isActive: 0 },
				{
					where: { goalPlanId: appraisalGoalId },
				},
			);
			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.GOAL_ARCIVED,
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

	async deleteGoalPlan(req, res) {
		try {
			const { appraisalGoalId } = req.body;
			const deleteGoalPlan = await db.appraisalGoalsMaster.update(
				{ isDeleted: 1 },
				{
					where: { appraisalGoalId: appraisalGoalId },
				},
			);
			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.GOAL_DELETED,
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

	async editGoalPlan(req, res) {
		try {
			const result = await validator.editAppraisalGoals.validateAsync(req.body);

			const [existingGoalPlanName, existingGoalPlanId] = await Promise.all([
				db.appraisalGoalsMaster.findOne({
					where: {
						goalPlanName: result.goalPlanName,
						appraisalGoalId: { [Op.ne]: result.appraisalGoalId },
						isActive: 1,
					},
				}),
				db.appraisalGoalsMaster.findOne({
					where: {
						gaolPlanId: result.gaolPlanId,
						appraisalGoalId: { [Op.ne]: result.appraisalGoalId },
						isActive: 1,
					},
				}),
			]);

			if (existingGoalPlanName) {
				return respHelper(res, {
					status: 400,
					msg: message.APPRAISAL.GOAL_PLAN_NAME_ALREADY_EXISTS,
				});
			}

			if (existingGoalPlanId) {
				return respHelper(res, {
					status: 400,
					msg: message.APPRAISAL.GOAL_PLAN_ID,
				});
			}

			await db.appraisalGoalsMaster.update(result, {
				where: { appraisalGoalId: result.appraisalGoalId },
			});

			const goalAttributesWithGoalId = result.goalAttributes.map((attr) => ({
				goalAttributeId: attr.goalAttributesId,
				enable: attr.goalNameEnable,
				mandatory: attr.goalMandate,
				editable: attr.goalEditable,
				needsApproval: attr.goalNeedApproval,
				appraisalGoalId: result.appraisalGoalId,
				goalType: 1,
			}));

			const subGoalAttributesWithGoalId =
				result.subGoalAttributes && Array.isArray(result.subGoalAttributes)
					? result.subGoalAttributes.map((attr) => ({
							goalAttributeId: attr.goalAttributesId,
							enable: attr.goalNameEnable,
							mandatory: attr.goalMandate,
							editable: attr.goalEditable,
							needsApproval: attr.goalNeedApproval,
							appraisalGoalId: result.appraisalGoalId, // FIXED!
							goalType: 2,
						}))
					: [];

			const mergeGoalAndSubGoals = [
				...goalAttributesWithGoalId,
				...subGoalAttributesWithGoalId,
			];

			// FIXED `destroy` instead of `destory`
			await db.goalAttributesMapping.destroy({
				where: { appraisalGoalId: result.appraisalGoalId },
			});

			await db.goalAttributesMapping.bulkCreate(mergeGoalAndSubGoals);

			return respHelper(res, {
				status: 200,
				data: result,
				msg: message.APPRAISAL.GOAL_UPDATED,
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

	// async goalActiveAndArchive(req, res) {
	// 	try {
	// 		const getUserAssigmentIds = await getEmployeesAssignment(4);
	// 		if (!getUserAssigmentIds) {
	// 			return respHelper(res, {
	// 				status: 200,
	// 				data: {
	// 					goalActive: [],
	// 					goalArchive: [],
	// 				},
	// 				msg: message.APPRAISAL.GOAL_ACTIVE,
	// 			});
	// 		}
	// 		const userAssignmentWhereUserExist = await getEmployeesPragatGoalList(
	// 			getUserAssigmentIds,
	// 			req.userId,
	// 		);

	// 		if (
	// 			getUserAssigmentIds.length > 0 &&
	// 			userAssignmentWhereUserExist.length > 0
	// 		) {
	// 			// Build array of LIKE queries for each ID
	// 			const likeConditions = getUserAssigmentIds.map((id) => ({
	// 				userAssignment: {
	// 					[Op.like]: `%${id}%`,
	// 				},
	// 			}));

	// 			let goalActive = await db.appraisalGoalsMaster.findAll({
	// 				where: {
	// 					type: 1,
	// 					isDeleted: 0,
	// 					[Op.or]: likeConditions,
	// 				},
	// 				limit: 1,
	// 			});

	// 			let goalArchive = await db.appraisalGoalsMaster.findAll({
	// 				where: {
	// 					type: 2,
	// 					isDeleted: 0,
	// 					[Op.or]: likeConditions,
	// 				},
	// 			});

	// 			return respHelper(res, {
	// 				status: 200,
	// 				data: {
	// 					goalActive,
	// 					goalArchive,
	// 				},
	// 				msg: message.APPRAISAL.GOAL_ACTIVE,
	// 			});
	// 		} else {
	// 			return respHelper(res, {
	// 				status: 200,
	// 				data: {
	// 					goalActive: [],
	// 					goalArchive: [],
	// 				},
	// 				msg: message.APPRAISAL.GOAL_ACTIVE,
	// 			});
	// 		}
	// 	} catch (error) {
	// 		console.error("Error in goalActiveAndArchive:", error);
	// 		return respHelper(res, {
	// 			status: 500,
	// 			msg: "Internal server error",
	// 		});
	// 	}
	// }
	async goalActiveAndArchive(req, res) {
		try {
			const getAllMail = await db.goalPlanMail.findAll({
				attributes: ["email", "goalPlanId", "isActive"],
				where: {
					userId: req.userId,
				},
				raw: true,
			});
			if (getAllMail.length > 0) {
				// Extract goalPlanIds from getAllMail
				const goalPlanIds = getAllMail.map((item) => item.goalPlanId);

				// Active goalPlanIds only (isActive: 1)
				const activeGoalPlanIds = getAllMail
					.filter((item) => item.isActive === 1)
					.map((item) => item.goalPlanId);

				// Archived goalPlanIds only (isActive: 0)
				const archiveGoalPlanIds = getAllMail
					.filter((item) => item.isActive === 0)
					.map((item) => item.goalPlanId);

				const goalActive = await db.appraisalGoalsMaster.findAll({
					where: {
						type: 1,
						isDeleted: 0,
						appraisalGoalId: {
							[Op.in]: activeGoalPlanIds,
						},
					},
					limit: 1,
				});

				const goalArchive = await db.appraisalGoalsMaster.findAll({
					where: {
						type: 2,
						isDeleted: 0,
						appraisalGoalId: {
							[Op.in]: archiveGoalPlanIds,
						},
					},
				});

				return respHelper(res, {
					status: 200,
					data: {
						goalActive,
						goalArchive,
					},
					msg: message.APPRAISAL.GOAL_ACTIVE,
				});
			} else {
				return respHelper(res, {
					status: 200,
					data: {
						goalActive: [],
						goalArchive: [],
					},
					msg: message.APPRAISAL.GOAL_ACTIVE,
				});
			}
		} catch (error) {
			console.error("Error in goalActiveAndArchive:", error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async getGoalPlanDetails(req, res) {
		try {
			const { appraisalGoalId } = req.query;

			const goalPlanDetails = await db.appraisalGoalsMaster.findOne({
				where: { appraisalGoalId: appraisalGoalId },
				include: [
					{
						model: db.user_assignment,
						required: false,
						on: db.sequelize.literal(
							"FIND_IN_SET(`user_assignments`.`id`, `appraisalgoalsmaster`.`userAssignment`) > 0",
						),
					},
					{
						model: db.goalAttributesMapping,
						attributes: [
							["goalAttributeId", "goalAttributesId"],
							["enable", "goalNameEnable"],
							["mandatory", "goalMandate"],
							["editable", "goalEditable"],
							["needsApproval", "goalNeedApproval"],
							"appraisalGoalId",
							"companyId",
							"goalType",
							"createdBy",
							"createdAt",
							"updatedBy",
							"updatedAt",
							"isActive",
						],
						as: "goalAttributes",
						where: { goalType: 1, enable: 1 },
						required: false,
						include: [
							{
								model: db.goalAttributesConfigMaster,
								attributes: [
									"goalAttributeId",
									"goalAttributeName",
									"enable",
									"mandatory",
									"editable",
									"needsApproval",
									"label",
									"stateName",
									"value",
									"type",
									"fieldType",
									"heading",
									"errorMessage",
									"isRequired",
									"md",
									"sm",
									"minValueLimit",
									"maxValueLimit",
								],
								include: [
									{
										model: db.goalAttributesOptions,
										attributes: ["label", "value"],
										required: false,
										as: "options",
									},
								],
							},
						],
					},
					{
						model: db.goalAttributesMapping,
						attributes: [
							["goalAttributeId", "goalAttributesId"],
							["enable", "goalNameEnable"],
							["mandatory", "goalMandate"],
							["editable", "goalEditable"],
							["needsApproval", "goalNeedApproval"],
							"appraisalGoalId",
							"companyId",
							"goalType",
							"createdBy",
							"createdAt",
							"updatedBy",
							"updatedAt",
							"isActive",
						],
						as: "subGoalAttributes",
						where: { goalType: 2, enable: 1 },
						required: false,
						include: [
							{
								model: db.goalAttributesConfigMaster,
								attributes: [
									"goalAttributeId",
									"goalAttributeName",
									"enable",
									"mandatory",
									"editable",
									"needsApproval",
									"label",
									"value",
									"stateName",
									"type",
									"fieldType",
									"heading",
									"errorMessage",
									"isRequired",
									"md",
									"sm",
									"minValueLimit",
									"maxValueLimit",
								],
								include: [
									{
										model: db.goalAttributesOptions,
										attributes: ["label", "value"],
										required: false,
										as: "options",
									},
								],
							},
						],
					},
				],
				order: [
					[
						{ model: db.goalAttributesMapping, as: "goalAttributes" },
						"goalAttributeId",
						"ASC",
					], // ✅ Use the original column name for sorting
					[
						{ model: db.goalAttributesMapping, as: "subGoalAttributes" },
						"goalAttributeId",
						"ASC",
					], // ✅ Use the original column name for sorting
				],
			});

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GOAL_DETAILS,
				data: goalPlanDetails,
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async addGoalKeyAreaByUser(req, res) {
		try {
			const validatedData = await validator.addGoalKeyAreaByUser.validateAsync(
				req.body,
			);
			const result = await helper.convertEmptyStringsToNull(validatedData);
			const forEmp = result.empId ? result.empId : req.userId;

			// ✅ Check Main Goal Weightage
			// const totalWeightage =
			// 	(await db.goalAreaForUser.sum("weightage", {
			// 		where: {
			// 			userId: req.userId,
			// 			goalPlanId: result.goalPlanId,
			// 		},
			// 	})) || 0;

			// const includingNewWeightage =
			// 	parseInt(totalWeightage) + parseInt(result.weightage);

			// if (includingNewWeightage > 100) {
			// 	return respHelper(res, {
			// 		status: 400,
			// 		msg: message.APPRAISAL.WEIGHTAGE_ABOVE_100,
			// 	});
			// }

			// // ✅ Check Sub-Goal Weightage (existing + new ones)
			// const existingGoals = await db.goalAreaForUser.findAll({
			// 	where: {
			// 		userId: req.userId,
			// 		goalPlanId: result.goalPlanId,
			// 	},
			// 	include: [
			// 		{
			// 			model: db.subGoalAreaForUser,
			// 			attributes: ["weightage"],
			// 			as: "subGoals",
			// 		},
			// 	],
			// });

			// // Sum existing sub-goal weightages
			// let existSubGoalWeightage = 0;
			// for (const goal of existingGoals) {
			// 	if (goal.subGoals && goal.subGoals.length > 0) {
			// 		goal.subGoals.forEach((sub) => {
			// 			existSubGoalWeightage += parseInt(sub.weightage || 0);
			// 		});
			// 	}
			// }

			// // Sum incoming sub-goal weightages
			// let newSubGoalWeightage = 0;
			// if (result.subGoals && result.subGoals.length > 0) {
			// 	result.subGoals.forEach((sub) => {
			// 		newSubGoalWeightage += parseInt(sub.weightage || 0);
			// 	});
			// }

			// const includingSubGoalsTotal =
			// 	existSubGoalWeightage + newSubGoalWeightage;
			// if (includingSubGoalsTotal > 100) {
			// 	return respHelper(res, {
			// 		status: 400,
			// 		msg: message.APPRAISAL.SUBGOAL_WEIGHTAGE_ABOVE_100,
			// 	});
			// }

			// ✅ Create main goal
			const mainGoal = await db.goalAreaForUser.create({
				...result,
				userId: forEmp, //req.userId,
				createdBy: forEmp,
			});

			// ✅ Create sub-goals if present
			if (mainGoal && result.subGoals.length > 0) {
				const subGoals = result.subGoals.map((attr) => ({
					...attr,
					goalAreaId: mainGoal.goalAreaId,
					userId: forEmp, //req.userId,
					createdBy: forEmp, //req.userId,
				}));

				await db.subGoalAreaForUser.bulkCreate(subGoals);
			}

			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.GOAL_CREATION,
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

	// this for user
	async getGoalAreaForUser(req, res) {
		try {
			const { appraisalGoalId, sortBy, empId } = req.query;
			const forEmp = empId ? empId : req.userId;

			let orderClause = [];
			if (sortBy === "1") {
				orderClause = [["weightage", "DESC"]];
			} else if (sortBy === "2") {
				orderClause = [["goalName", "DESC"]];
			} else {
				orderClause = [["updatedAt", "DESC"]];
			}

			// Always sort subGoals by subGoalAreaId ascending
			orderClause.push([
				{ model: db.subGoalAreaForUser, as: "subGoals" },
				"subGoalAreaId",
				"ASC",
			]);

			const getGoalForUser = await db.goalAreaForUser.findAll({
				where: {
					userId: forEmp, //req.userId,
					goalPlanId: appraisalGoalId,
					isActive: [0, 1, 2],
					isDeleted: 0,
				},
				include: [
					{
						model: db.appraisalGoalsMaster,
						as: "goalPlanMaster",
						include: [
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "goalAttributes",
								where: { goalType: 1, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"stateName",
											"value",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "subGoalAttributes",
								where: { goalType: 2, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"value",
											"stateName",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
						],
					},
					{
						model: db.subGoalAreaForUser,
						as: "subGoals",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
					},
				],
				order: orderClause,
			});

			const getSubGoalCount = await db.goalAreaForUser.findAll({
				where: {
					goalPlanId: appraisalGoalId,
					userId: forEmp, //req.userId,
					isActive: [0, 1, 2],
					isDeleted: 0,
				},
				include: [
					{
						model: db.subGoalAreaForUser,
						as: "subGoals",
					},
				],
			});

			const totalSubGoalCount = getSubGoalCount.reduce((sum, item) => {
				return sum + (item.subGoals?.length || 0);
			}, 0);

			const mainGoalCount = getGoalForUser.length;
			const totalWeightage =
				(await db.goalAreaForUser.sum("weightage", {
					where: {
						userId: forEmp, //req.userId,
						goalPlanId: appraisalGoalId,
						isActive: [0, 1, 2],
						isDeleted: 0,
					},
				})) || 0;

			let buttonStatus = 0;
			let recallButton = 0;
			const allGoals = await db.goalAreaForUser.findAll({
				where: {
					isActive: [0, 1, 2],
					userId: forEmp, //req.userId,
					goalPlanId: appraisalGoalId,
					isDeleted: 0,
				},
			});

			if (allGoals.length > 0) {
				const totalWeightage = allGoals.reduce(
					(sum, goal) => sum + (goal.weightage || 0),
					0,
				);

				if (allGoals.some((goal) => goal.isActive === 0)) {
					buttonStatus = 0; // Draft exists
				} else if (allGoals.some((goal) => goal.isActive === 1)) {
					buttonStatus = 1; // At least one submitted
				} else if (allGoals.every((goal) => goal.isActive === 2)) {
					//buttonStatus = 2; // All action taken
					buttonStatus = totalWeightage === 100 ? 2 : 0; // All action taken and weightage is 100
				}

				if (allGoals.every((goal) => goal.isActive === 1)) {
					recallButton = 1;
				}
			}

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GET_LIST,
				data: {
					getGoalForUser: getGoalForUser,
					mainGoalCount,
					subGoalCount: totalSubGoalCount,
					totalMainWeightage: totalWeightage,
					buttonStatus: buttonStatus,
					recallButton: recallButton,
				},
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async performanceOverview(req, res) {
		try {
			const { appraisalGoalId, empId } = req.query;

			const forEmp = empId ? empId : req.userId;
			const goals = await db.goalAreaForUser.findAll({
				where: {
					userId: forEmp,
					goalPlanId: appraisalGoalId,
					isDeleted: 0,
				},
				include: [{ model: db.subGoalAreaForUser, as: "subGoals" }],
			});

			// Count subgoals
			const subGoalCount = goals.reduce((total, goal) => {
				return total + (goal.subGoals?.length || 0);
			}, 0);

			// Count by goal status
			const [
				completedCount,
				notStartedCount,
				inProgressCount,
				onHoldCount,
				delayedCount,
				atRiskCount,
			] = await Promise.all([
				db.goalAreaForUser.count({
					where: {
						userId: forEmp,
						goalPlanId: appraisalGoalId,
						goalStatus: "Completed",
						isDeleted: 0,
					},
				}),
				db.goalAreaForUser.count({
					where: {
						userId: forEmp,
						goalPlanId: appraisalGoalId,
						goalStatus: "Not Started",
						isDeleted: 0,
					},
				}),
				db.goalAreaForUser.count({
					where: {
						userId: forEmp,
						goalPlanId: appraisalGoalId,
						goalStatus: "In Progress",
						isDeleted: 0,
					},
				}),
				db.goalAreaForUser.count({
					where: {
						userId: forEmp,
						goalPlanId: appraisalGoalId,
						goalStatus: "On Hold",
						isDeleted: 0,
					},
				}),
				db.goalAreaForUser.count({
					where: {
						userId: forEmp,
						goalPlanId: appraisalGoalId,
						goalStatus: "Delayed",
						isDeleted: 0,
					},
				}),
				db.goalAreaForUser.count({
					where: {
						userId: forEmp,
						goalPlanId: appraisalGoalId,
						goalStatus: "At Risk",
						isDeleted: 0,
					},
				}),
			]);

			// Send response
			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GOAL_ACTIVE,
				data: {
					mainGoalCount: goals.length,
					subGoalCount: subGoalCount,
					completedCount,
					notStartedCount,
					inProgressCount,
					onHoldCount,
					delayedCount,
					atRiskCount,
				},
			});
		} catch (error) {
			console.error("Error in performanceOverview:", error);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong",
			});
		}
	}

	async editGoalKeyAreaByUser(req, res) {
		try {
			const validatedData = await validator.editGoalKeyAreaByUser.validateAsync(
				req.body,
			);
			const result = await helper.convertEmptyStringsToNull(validatedData);

			// --- UPDATE MAIN GOAL ---
			const objUpdate = {
				...result,
				...(result.mode == 0 && { isActive: 0 }),
				...(result.mode == 0 && { isApproved: 0 }),
				...(result.mode == 1 && { isActive: 2 }),
				...(result.mode == 1 && { isApproved: 1 }),
				updatedBy: result.empId,
				updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
			};
			await db.goalAreaForUser.update(objUpdate, {
				where: { goalAreaId: result.goalAreaId },
			});

			// --- REPLACE SUB-GOALS ---

			if (result.subGoals) {
				await db.subGoalAreaForUser.destroy({
					where: { goalAreaId: result.goalAreaId },
				});

				const subGoals = result.subGoals.map((attr) => ({
					...attr,
					goalAreaId: result.goalAreaId,
				}));

				await db.subGoalAreaForUser.bulkCreate(subGoals);
			}

			//if (result.mode == 1) {

			const getManagerId = await db.employeeMaster.findOne({
				where: { id: result.empId },
			});
			await db.goalAreaPragatiTrail.update(
				{
					isApproved: 0,
					pendingAt: getManagerId ? getManagerId?.manager : null,
				},
				{
					where: {
						pendingAt: req.userId,
						goalPlanId: result.goalPlanId,
					},
				},
			);

			//}

			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.GOAL_EDIT_SAVE,
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

	async deleteGoalKeyAreaByUser(req, res) {
		try {
			const { goalAreaId } = req.body;

			await Promise.all([
				db.goalAreaForUser.update({ isDeleted: 1 }, { where: { goalAreaId } }),
				db.subGoalAreaForUser.update(
					{ isDeleted: 1 },
					{ where: { goalAreaId } },
				),
			]);

			const getUserId = await db.goalAreaForUser.findOne({
				where: { goalAreaId },
			});
			const existUser = await db.employeeMaster.findOne({
				raw: true,
				where: {
					id: getUserId.userId,
					isActive: 1,
				},
				attributes: ["name", "empCode", "email", "profileImage"],
				include: [
					{
						model: db.companyMaster,
						attributes: ["companyName", "senderEmail", "companyLogo"],
					},
					{
						model: db.employeeMaster,
						as: "managerData",
						attributes: ["name", "email"],
					},
				],
			});
			eventEmitter.emit(
				"goalDeletedNotification",
				JSON.stringify({
					email: existUser["managerData.email"],
					name: existUser.name,
					managerName: existUser["managerData.name"],
					senderEmail: existUser["companymaster.senderEmail"],
					companyLogo: existUser["companymaster.companyLogo"],
					companyName: existUser["companymaster.companyName"],
				}),
			);
			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.DELETE_SUCCESS,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getPreviousGoalAreaForUser(req, res) {
		try {
			const { appraisalGoalId } = req.query;

			const getPreviousGoalForUser = await db.goalAreaForUser.findAll({
				where: { userId: req.userId, goalPlanId: appraisalGoalId },
				include: [
					{
						model: db.appraisalGoalsMaster,
						as: "goalPlanMaster",
						include: [
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "goalAttributes",
								where: { goalType: 1, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"stateName",
											"value",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "subGoalAttributes",
								where: { goalType: 2, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"value",
											"stateName",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
						],
					},
					{
						model: db.subGoalAreaForUser,
						as: "subGoals",
						separate: true,
						order: [["subGoalAreaId", "ASC"]],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GET_LIST_PREVIOUS,
				data: getPreviousGoalForUser,
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	//array request

	async addGoalsFromPreviousGolas(req, res) {
		try {
			const { goalsArea, goalPlanId, empId } = req.body;
			const forEmp = empId ? empId : req.userId;

			for (const { goalAreaId, subGoalAreaIds } of goalsArea) {
				// Fetch main goal
				const goal = await db.goalAreaForUser.findOne({
					where: { goalAreaId },
					attributes: {
						exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy"],
					},
				});

				if (!goal) continue; // Skip if goal not found

				// Remove the primary key before inserting
				const { goalAreaId: _, ...goalWithoutPK } = goal.get({ plain: true });

				// Create new goal for current user
				const newGoal = await db.goalAreaForUser.create({
					...goalWithoutPK,
					userId: forEmp, //req.userId,
					createdBy: forEmp, //req.userId,
					isActive: 0,
					goalPlanId,
				});

				// Fetch sub-goals
				const subGoals = await db.subGoalAreaForUser.findAll({
					where: { subGoalAreaId: { [Op.in]: subGoalAreaIds } },
					attributes: {
						exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy"],
					},
				});

				// Prepare new sub-goals
				const mappedSubGoals = subGoals.map((sub) => {
					const { subGoalAreaId: _, ...subGoalWithoutPK } = sub.get({
						plain: true,
					});

					return {
						...subGoalWithoutPK,
						userId: forEmp, //req.userId,
						createdBy: forEmp, //req.userId,
						goalAreaId: newGoal.goalAreaId,
					};
				});

				// Insert new sub-goals
				await db.subGoalAreaForUser.bulkCreate(mappedSubGoals);
			}

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GOAL_SUBMITTED,
				data: {},
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async submitGoals(req, res) {
		try {
			const validatedData = await validator.goalSubmittionSchema.validateAsync(
				req.body,
			);
			const result = await helper.convertEmptyStringsToNull(validatedData);
			console.log("result>>>>>>>", result);
			const { existingGoals, comment, goalPlanId, mode, empId } = result;

			const isGoalPlanArchive = await db.appraisalGoalsMaster.findOne({
				where: { appraisalGoalId: result.goalPlanId, type: 2 },
			});

			if (isGoalPlanArchive) {
				return respHelper(res, {
					status: 400,
					msg: message.APPRAISAL.ARCHIVED_GOAL,
				});
			}

			// ✅ Step 1: Validate total goal weightage
			const totalGoalWeightage = existingGoals.reduce(
				(sum, goal) => sum + Number(goal.weightage || 0),
				0,
			);

			if (totalGoalWeightage !== 100) {
				return res.status(400).json({
					success: false,
					message: message.APPRAISAL.WEIGHTAGE_ABOVE_100,
					data: { totalGoalWeightage, existingGoals },
				});
			}

			// ✅ Step 2: Validate sub-goals
			for (const goal of existingGoals) {
				const { subGoals = [] } = goal;

				if (subGoals.length > 0) {
					const totalSubWeightage = subGoals.reduce(
						(sum, sub) => sum + Number(sub.weightage || 0),
						0,
					);

					if (totalSubWeightage !== 100) {
						return res.status(400).json({
							success: false,
							message: message.APPRAISAL.SUBGOAL_WEIGHTAGE_ABOVE_100,
							data: { totalGoalWeightage, existingGoals },
						});
					}
				}
			}

			// ✅ Step 3: Perform all DB operations in a transaction
			const transaction = await db.sequelize.transaction();

			let goalWeightageChangedGlobal = false;

			try {
				//const userId = req.userId;
				const existUser = await db.employeeMaster.findOne({
					raw: true,
					where: {
						id: result.empId,
						isActive: 1,
					},
					attributes: ["name", "empCode", "email", "profileImage"],
					include: [
						{
							model: db.companyMaster,
							attributes: ["senderEmail", "companyLogo"],
						},
						{
							model: db.employeeMaster,
							as: "managerData",
							attributes: ["name", "email"],
						},
					],
				});

				const getManagerId = await db.employeeMaster.findOne({
					where: { id: empId },
				});

				// 🔁 Collect all goalAreaIds from request
				const goalAreaIds = existingGoals.map((goal) => goal.goalAreaId);

				// 🧹 Deactivate user's previously active goals that are not in the new list
				await db.goalAreaForUser.update(
					{ isActive: 0 },
					{
						where: {
							userId: empId,
							goalPlanId,
							goalAreaId: { [db.Sequelize.Op.notIn]: goalAreaIds },
						},
						transaction,
					},
				);

				for (const goal of existingGoals) {
					const { goalAreaId, weightage, subGoals = [] } = goal;

					let goalWeightageChanged = false;
					let subGoalWeightageChanged = false;

					const existingGoal = await db.goalAreaForUser.findOne({
						where: { goalAreaId, userId: empId, goalPlanId },
						transaction,
					});

					// Check if goal weightage changed
					if (
						existingGoal &&
						Number(existingGoal.weightage) !== Number(weightage)
					) {
						goalWeightageChanged = true;
					}

					// 🔁 Check sub-goals
					for (const sub of subGoals) {
						const existingSubGoal = await db.subGoalAreaForUser.findOne({
							where: { subGoalAreaId: sub.subGoalAreaId, goalAreaId },
							transaction,
						});

						if (
							existingSubGoal &&
							Number(existingSubGoal.weightage) !== Number(sub.weightage)
						) {
							subGoalWeightageChanged = true;

							await db.subGoalAreaForUser.update(
								{ weightage: Number(sub.weightage) },
								{
									where: { subGoalAreaId: sub.subGoalAreaId, goalAreaId },
									transaction,
								},
							);
						}
					}

					if (goalWeightageChanged || subGoalWeightageChanged) {
						goalWeightageChangedGlobal = true;
					}
					// Determine final update values
					const isAnyWeightageChanged =
						goalWeightageChanged || subGoalWeightageChanged;

					const updatePayload = {
						weightage: Number(weightage),
						isActive: mode === 1 ? 2 : 1,
						comment,
						updatedBy: req.userId,
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						isApproved:
							mode === 1
								? 1 // Mode 1 → Always approved
								: isAnyWeightageChanged
									? 0 // Mode 0 and changed → Needs re-approval
									: existingGoal?.isApproved, // Mode 0 and no change → Keep as is
					};

					await db.goalAreaForUser.update(updatePayload, {
						where: { goalAreaId, userId: empId, goalPlanId },
						transaction,
					});

					console.log(
						`Updated goalAreaId ${goalAreaId} with mode ${mode}, weightage change: ${goalWeightageChanged}, sub-goal change: ${subGoalWeightageChanged}`,
					);
				}

				// 📝 Insert trail entry if required
				if (mode == 0) {
					console.log("i am in employee mode");
					const existingTrail = await db.goalAreaPragatiTrail.findOne({
						where: {
							userId: empId,
							goalPlanId,
						},
						transaction,
					});

					if (!existingTrail) {
						await db.goalAreaPragatiTrail.create(
							{
								goalPlanId,
								userId: empId,
								taskName: "Pragati Approval",
								level: 1,
								pendingAt: getManagerId ? getManagerId?.manager : null, //req.userData?.manager || null,
								createdBy: req.userId,
								createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							},
							{ transaction },
						);
					} else {
						let buttonStatus = 0;

						await db.goalAreaPragatiTrail.update(
							{
								isApproved: 0,
								createdBy: req.userId,
								createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								updatedBy: req.userId, //userId,
								updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								pendingAt: getManagerId ? getManagerId?.manager : null, //req.userData?.manager || null,
								role:
									req.userData["role.name"] === "USER"
										? "Manager"
										: req.userData["role.name"],
							},
							{
								where: { goalTrailAutoId: existingTrail.goalTrailAutoId },
								transaction,
							},
						);
					}

					// await db.pragatiActivity.create({
					// 	message:"has submitted their Goal Plan for approval",
					// 	forUserId:req.userId,
					// 	byUserId:result.empId
					// })
				}
				if (mode == 1) {
					await db.goalAreaPragatiTrail.update(
						{
							isApproved: 2,
							updatedBy: req.userId, //userId,
							updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							role:
								req.userData["role.name"] === "USER"
									? "Manager"
									: req.userData["role.name"],
						},
						{
							where: {
								userId: empId,
								goalPlanId,
							},
							transaction,
						},
					);

					// await db.pragatiActivity.create({
					// 	message:"Your manager has partially approved changes to your Goal Plan",
					// 	forUserId:result.empId,
					// 	byUserId:req.userId
					// })

					eventEmitter.emit(
						"goalSubmissionByManager",
						JSON.stringify({
							email: existUser["managerData.email"],
							name: existUser.name,
							managerName: existUser["managerData.name"],
							senderEmail: existUser["companymaster.senderEmail"],
							companyLogo: existUser["companymaster.companyLogo"],
						}),
					);
				}
				if (mode == 0) {
					eventEmitter.emit(
						"goalSubmission",
						JSON.stringify({
							email: existUser["managerData.email"],
							name: existUser.name,
							managerName: existUser["managerData.name"],
							senderEmail: existUser["companymaster.senderEmail"],
							companyLogo: existUser["companymaster.companyLogo"],
						}),
					);
				}
				// if (mode == 0 && goalWeightageChangedGlobal == true) {
				// 	eventEmitter.emit(
				// 		"goalWeightageChange",
				// 		JSON.stringify({
				// 			email: existUser["managerData.email"],
				// 			name: existUser.name,
				// 			managerName: existUser["managerData.name"],
				// 			senderEmail: existUser["companymaster.senderEmail"],
				// 			companyLogo: existUser["companymaster.companyLogo"],
				// 		}),
				// 	);
				// }

				// Commit transaction
				await transaction.commit();

				return respHelper(res, {
					status: 200,
					msg: message.APPRAISAL.GOAL_SUBMITTED,
					data: { existingGoals: [] },
				});
			} catch (err) {
				await transaction.rollback();
				console.error("Transaction failed:", err);
				return respHelper(res, {
					status: 500,
					msg: "Something went wrong while saving goals.",
				});
			}
		} catch (error) {
			console.error("Submit Goals Error:", error);
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

	async getPendingGoalsList(req, res) {
		try {
			const limit = parseInt(req.query.limit, 10) || 10;
			const pageNo = parseInt(req.query.page, 10) || 1;
			const offset = (pageNo - 1) * limit;

			const getList = await db.goalAreaPragatiTrail.findAndCountAll({
				where: {
					pendingAt: req.userId,
					isApproved: [0],
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
					},
					{
						model: db.appraisalGoalsMaster,
						attributes: ["appraisalGoalId", "goalPlanName"],
					},
				],
				offset,
				limit,
				order: [["createdAt", "DESC"]],
			});

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GOAL_SUBMITTED,
				data: getList, //{ list: getList },
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getPendingGoalDetails(req, res) {
		try {
			const { goalPlanId, userId, sortBy } = req.query;
			let orderClause = [];
			if (sortBy === "1") {
				orderClause = [["weightage", "DESC"]];
			} else if (sortBy === "2") {
				orderClause = [["goalName", "DESC"]];
			} else {
				orderClause = [["updatedAt", "DESC"]];
			}

			const getGoalForUser = await db.goalAreaForUser.findAll({
				where: {
					userId: userId,
					goalPlanId: goalPlanId,
					isApproved: [0, 1, 2],
					isDeleted: 0,
				},
				include: [
					{
						model: db.appraisalGoalsMaster,
						as: "goalPlanMaster",
						include: [
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "goalAttributes",
								where: { goalType: 1, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"stateName",
											"value",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "subGoalAttributes",
								where: { goalType: 2, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"value",
											"stateName",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
						],
					},
					{
						model: db.subGoalAreaForUser,
						as: "subGoals",
						separate: true, // Ensures ordering works properly for 1:M relationships
						order: [["subGoalAreaId", "ASC"]],
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
					},
				],
				order: orderClause,
			});

			const getSubGoalCount = await db.goalAreaForUser.findAll({
				where: {
					goalPlanId: goalPlanId,
					userId: userId,
					isDeleted: 0,
					//isActive: [0, 1],
				},
				include: [
					{
						model: db.subGoalAreaForUser,
						as: "subGoals",
					},
				],
			});

			const totalSubGoalCount = getSubGoalCount.reduce((sum, item) => {
				return sum + (item.subGoals?.length || 0);
			}, 0);

			const mainGoalCount = getGoalForUser.length;
			const totalWeightage =
				(await db.goalAreaForUser.sum("weightage", {
					where: {
						userId: userId,
						goalPlanId: goalPlanId,
						// isActive: 0,
						isDeleted: 0,
					},
				})) || 0;

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GET_LIST_DETAILS,
				data: {
					getGoalForUser: getGoalForUser,
					mainGoalCount,
					subGoalCount: totalSubGoalCount,
					totalMainWeightage: totalWeightage,
					button: 0,
				},
			});
		} catch (error) {
			console.error("Error in getPendingGoalsList:", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async pragatiGoalApproval(req, res) {
		try {
			// Joi validation
			const result = await validator.goalApprovalSchema.validateAsync(req.body);
			const { goalPlanId, userId, goalAreaId, isApproved } = result;

			// Sequelize transaction starts
			const transaction = await db.sequelize.transaction();

			try {
				// Only UPDATE operations, no DELETE or DESTROY

				// Update goal approval status
				await db.goalAreaForUser.update(
					{
						isActive: 2,
						isApproved,
						updatedBy: req.userId,
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					},
					{
						where: {
							userId,
							goalPlanId,
							goalAreaId: { [Op.in]: goalAreaId },
						},
						transaction,
					},
				);

				// Calculate button status
				let buttonStatus = 0;

				const existUser = await db.employeeMaster.findOne({
					raw: true,
					where: {
						id: result.userId,
						isActive: 1,
					},
					attributes: ["name", "empCode", "email", "profileImage"],
					include: [
						{
							model: db.companyMaster,
							attributes: ["companyName", "senderEmail", "companyLogo"],
						},
						{
							model: db.employeeMaster,
							as: "managerData",
							attributes: ["name", "email"],
						},
					],
				});
				console.log(">>>>>>>>>>>>", existUser);
				const allGoals = await db.goalAreaForUser.findAll({
					where: {
						isActive: [0, 1, 2],
						userId,
						goalPlanId,
						isDeleted: 0,
					},
					transaction,
				});

				if (allGoals.length > 0) {
					const draftExists = allGoals.some((goal) => goal.isActive === 0);

					if (!draftExists) {
						const submittedCount = allGoals.filter(
							(goal) => goal.isActive === 1,
						).length;
						const actionTakenCount = allGoals.filter(
							(goal) => goal.isActive === 2,
						).length;

						if (submittedCount === allGoals.length) {
							buttonStatus = 1; // All submitted
						} else if (actionTakenCount === allGoals.length) {
							buttonStatus = 2; // All action taken
						}
					}
				}
				// Update button status in trail
				await db.goalAreaPragatiTrail.update(
					{
						isApproved: buttonStatus,
						updatedBy: req.userId,
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						role:
							req.userData["role.name"] === "USER"
								? "Manager"
								: req.userData["role.name"],
					},
					{
						where: { goalPlanId, userId },
						transaction,
					},
				);

				eventEmitter.emit(
					"goalPartiallyActionOrApprovedAll",
					JSON.stringify({
						email: existUser.email,
						name: existUser.name,
						managerName: existUser["managerData.name"],
						senderEmail: existUser["companymaster.senderEmail"],
						companyLogo: existUser["companymaster.companyLogo"],
						statusName: isApproved == 1 ? "Approved" : "Rejected",
						subject: 1,
						companyName: existUser["companymaster.companyName"],
					}),
				);
				await transaction.commit();

				return respHelper(res, {
					status: 200,
					msg:
						isApproved == 1
							? message.APPRAISAL.GOAL_APPROVED
							: message.APPRAISAL.GOAL_REJECTED,
					data: {},
				});
			} catch (err) {
				await transaction.rollback();
				throw err;
			}
		} catch (error) {
			console.error("Goal Approval Error:", error);

			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}

			return respHelper(res, {
				status: 500,
				msg: "Something went wrong while approving the goal",
				data: {},
			});
		}
	}

	async recallGoals(req, res) {
		try {
			const { goalPlanId, empId } = req.body;
			const userId = empId ? empId : req.userId;

			await db.goalAreaForUser.update(
				{
					isActive: 0,
					isApproved: 0,
					updatedBy: userId,
					updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
				},
				{
					where: {
						userId: userId,
						goalPlanId: goalPlanId,
					},
				},
			);
			console.log(">>>>>>>>>>>>>>>>>");
			await db.goalAreaPragatiTrail.update(
				{
					isApproved: 3,
				},
				{
					where: {
						userId: userId,
						goalPlanId: goalPlanId,
					},
				},
			);

			const existUser = await db.employeeMaster.findOne({
				raw: true,
				where: {
					id: userId,
					isActive: 1,
				},
				attributes: ["name", "empCode", "email", "profileImage"],
				include: [
					{
						model: db.companyMaster,
						attributes: ["senderEmail", "companyLogo"],
					},
					{
						model: db.employeeMaster,
						as: "managerData",
						attributes: ["name", "email"],
					},
				],
			});

			eventEmitter.emit(
				"goalRecallSubmission",
				JSON.stringify({
					email: existUser["managerData.email"],
					name: existUser.name,
					managerName: existUser["managerData.name"],
					senderEmail: existUser["companymaster.senderEmail"],
					companyLogo: existUser["companymaster.companyLogo"],
				}),
			);

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GOAL_RECALLED,
				data: {},
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong",
				data: {},
			});
		}
	}

	// ================== appraisal rating ======================
	async createReviewFramework(req, res) {
		try {
			// Validate request body against schema
			const validatedData = await validator.reviewFrameworkSchema.validateAsync(
				req.body,
			);

			// Convert empty strings to null (custom helper function)
			const result = await helper.convertEmptyStringsToNull(validatedData);

			// Uniqueness Check for reviewName
			const existingReviewName = await db.reviewFramework.findOne({
				where: {
					reviewName: result.reviewName,
				},
			});

			if (existingReviewName) {
				return res.status(400).json({
					success: false,
					message: message.APPRAISAL.REVIEW_NAME_ALREADY_EXITS,
					data: {},
				});
			}

			// Uniqueness Check for reviewId
			const existingReviewId = await db.reviewFramework.findOne({
				where: {
					reviewId: result.reviewId,
				},
			});

			if (existingReviewId) {
				return res.status(400).json({
					success: false,
					message: message.APPRAISAL.REVIEW_ID_ALREADY_EXITS,
					data: {},
				});
			}

			// Create new review framework
			const newFramework = await db.reviewFramework.create(result);

			// Send response with created data
			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.REVIEW_FRAMEWORK_CREATED_SUCCESSFULLY,
				data: {}, // Include the created data
			});
		} catch (error) {
			console.error("Approval Error:", error);

			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}

			return respHelper(res, {
				status: 500,
				msg: "Something went wrong",
				data: {},
			});
		}
	}

	async getReviewFrameworks(req, res) {
		try {
			// You can add query parameters like filters or pagination here if needed
			const frameworks = await db.reviewFramework.findAll({
				where: {
					type: req.query.type,
					isDeleted: 0,
				},
				include: [
					{
						model: db.user_assignment,
						required: false,
						on: db.sequelize.literal(
							`JSON_CONTAINS(reviewframework.userAssignment, CAST(user_assignments.id AS JSON), '$')`,
						),
					},
				],
				order: [
					["createdAt", "DESC"],
					[db.user_assignment, "id", "ASC"],
				],
			});

			return respHelper(res, {
				status: 200,
				msg: "Review frameworks fetched successfully",
				data: {
					frameworks,
				},
			});
		} catch (error) {
			console.error("Fetch Error:", error);
			return respHelper(res, {
				status: 500,
				msg: "Something went wrong",
				data: {},
			});
		}
	}

	async updateReviewFramework(req, res) {
		try {
			const validatedData =
				await validator.editReviewFrameworkSchema.validateAsync(req.body);

			const result = await helper.convertEmptyStringsToNull(validatedData);
			const existingFramework = await db.reviewFramework.findByPk(
				result.reviewFrameworkId,
			);
			if (!existingFramework) {
				return respHelper(res, {
					status: 404,
					msg: "Review Framework not found",
					data: {},
				});
			}

			if (
				result.reviewName &&
				result.reviewName !== existingFramework.reviewName
			) {
				const reviewNameExists = await db.reviewFramework.findOne({
					where: {
						reviewName: result.reviewName,
					},
				});
				if (reviewNameExists) {
					return res.status(400).json({
						success: false,
						message: message.APPRAISAL.REVIEW_NAME_ALREADY_EXITS,
						data: {},
					});
				}
			}

			if (result.reviewId && result.reviewId !== existingFramework.reviewId) {
				const reviewIdExists = await db.reviewFramework.findOne({
					where: {
						reviewId: result.reviewId,
					},
				});
				if (reviewIdExists) {
					return res.status(400).json({
						success: false,
						message: message.APPRAISAL.REVIEW_ID_ALREADY_EXITS,
						data: {},
					});
				}
			}
			await existingFramework.update(result, {
				where: { reviewFrameworkId: result.reviewFrameworkId },
			});

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.REVIEW_FRAMEWORK_UPDATED_SUCCESSFULLY,
				data: {},
			});
		} catch (error) {
			console.error("Update Error:", error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}

			return respHelper(res, {
				status: 500,
				msg: "Something went wrong",
				data: {},
			});
		}
	}

	async reviewAppraisal(req, res) {
		try {
			const { sortBy, empId } = req.query;
			const forEmp = empId ? empId : req.userId;

			let orderClause = [];
			if (sortBy === "1") {
				orderClause = [["weightage", "DESC"]];
			} else if (sortBy === "2") {
				orderClause = [["goalName", "DESC"]];
			} else {
				orderClause = [["updatedAt", "DESC"]];
			}

			// Always sort subGoals by subGoalAreaId ascending
			orderClause.push([
				{ model: db.subGoalAreaForUser, as: "subGoals" },
				"subGoalAreaId",
				"ASC",
			]);

			// Get active goal plan
			const activeGoalPlan = await db.appraisalGoalsMaster.findOne({
				where: { type: 1, isDeleted: 0 },
			});

			if (!activeGoalPlan) {
				return respHelper(res, {
					status: 200,
					msg: message.APPRAISAL.GET_LIST,
					data: {},
				});
			}

			// Check if user has a trail with isApproved = 2
			const userTrail = await db.goalAreaPragatiTrail.findOne({
				where: {
					goalPlanId: activeGoalPlan.appraisalGoalId,
					userId: forEmp,
					isApproved: 2,
				},
			});

			if (!userTrail) {
				return respHelper(res, {
					status: 200,
					msg: message.APPRAISAL.GET_LIST,
					data: {},
				});
			}

			// Fetch goal data for the user
			const goalData = await db.goalAreaForUser.findAll({
				where: {
					userId: forEmp,
					goalPlanId: activeGoalPlan.appraisalGoalId,
				},
				include: [
					{
						model: db.appraisalGoalsMaster,
						as: "goalPlanMaster",
						include: [
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "goalAttributes",
								where: { goalType: 1, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"stateName",
											"value",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
							{
								model: db.goalAttributesMapping,
								attributes: [
									["goalAttributeId", "goalAttributesId"],
									["enable", "goalNameEnable"],
									["mandatory", "goalMandate"],
									["editable", "goalEditable"],
									["needsApproval", "goalNeedApproval"],
									"appraisalGoalId",
									"companyId",
									"goalType",
									"createdBy",
									"createdAt",
									"updatedBy",
									"updatedAt",
									"isActive",
								],
								as: "subGoalAttributes",
								where: { goalType: 2, enable: 1 },
								required: false,
								separate: true,
								include: [
									{
										model: db.goalAttributesConfigMaster,
										attributes: [
											"goalAttributeId",
											"goalAttributeName",
											"enable",
											"mandatory",
											"editable",
											"needsApproval",
											"label",
											"value",
											"stateName",
											"type",
											"fieldType",
											"heading",
											"errorMessage",
											"isRequired",
											"md",
											"sm",
											"minValueLimit",
											"maxValueLimit",
										],
										include: [
											{
												model: db.goalAttributesOptions,
												attributes: ["label", "value"],
												required: false,
												as: "options",
											},
										],
									},
								],
								order: [["goalAttributeId", "ASC"]],
							},
						],
					},
					{
						model: db.subGoalAreaForUser,
						as: "subGoals",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
					},
				],
				order: orderClause,
			});

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.GET_LIST,
				data: {
					getGoalForUser: goalData,
				},
			});
		} catch (error) {
			console.error("Error in reviewAppraisal:", error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async selfRating(req, res) {
		try {
			const { selfRatings } = req.body;

			if (!Array.isArray(selfRatings) || selfRatings.length === 0) {
				return respHelper(res, {
					status: 400,
					msg: message.APPRAISAL.RATING_VALUE_REQUIRED,
				});
			}

			for (const rating of selfRatings) {
				const [goalRating, created] = await db.goalRating.findOrCreate({
					where: {
						goalAreaId: rating.goalAreaId,
						forUser: req.userId,
					},
					defaults: {
						goalAreaId: rating.goalAreaId,
						forUser: req.userId,
						byUser: req.userId,
						rating: rating.rating,
						comment: rating.comment,
						createdBy: req.userId,
						updatedBy: req.userId,
					},
				});

				// If the record already exists (not created), update it
				if (!created) {
					await goalRating.update({
						rating: rating.rating,
						comment: rating.comment,
						updatedBy: req.userId,
					});
				}
			}

			return respHelper(res, {
				status: 200,
				msg: message.APPRAISAL.RATING_SUBMISSION,
				data: {},
			});
		} catch (error) {
			console.error("Error in selfRating:", error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async activeGoalReviewFramework(req, res) {
		try {
			const { reviewFrameworkId } = req.body;

			await db.reviewFramework.update(
				{ type: 1 },
				{
					where: { reviewFrameworkId: reviewFrameworkId },
				},
			);
			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.REVIEW_FRAMEWORK_ACTIVATE,
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

	async archiveGoalReviewFramework(req, res) {
		try {
			const { reviewFrameworkId } = req.body;
			const changeDraftToActive = await db.reviewFramework.update(
				{ type: 2 },
				{
					where: { reviewFrameworkId: reviewFrameworkId },
				},
			);
			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.GOAL_ARCIVED,
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

	// controllers/ratingScaleController.js

	async createRatingScale(req, res) {
		const {
			ratingScaleName,
			ratingScaleDescription,
			lengthOfScale,
			ratingScaleConfig,
		} = req.body;

		try {
			const existing = await db.ratingScaleMaster.findOne({
				where: { ratingScaleName },
			});
			if (existing) {
				return respHelper(res, {
					status: 400,
					data: {},
					msg: message.APPRAISAL.RATING_SCALE_NAME_EXISTS,
				});
			}
			// Create Rating Scale Master
			const ratingScale = await db.ratingScaleMaster.create({
				ratingScaleName,
				ratingScaleDescription,
				lengthOfScale,
				createdBy: req.userId, // assuming you're using auth
				updatedBy: req.userId,
				isActive: true,
			});

			// Create Related Config Records
			if (Array.isArray(ratingScaleConfig) && ratingScaleConfig.length > 0) {
				const configData = ratingScaleConfig.map((config) => ({
					...config,
					ratingScaleId: ratingScale.ratingScaleId,
					createdBy: req.userId,
					updatedBy: req.userId,
					isActive: true,
				}));

				await db.ratingScaleConfig.bulkCreate(configData);
			}

			return respHelper(res, {
				status: 200,
				data: {},
				msg: message.APPRAISAL.RATING_SCALE_CREATION,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateRatingScale(req, res) {
		const {
			ratingScaleId,
			ratingScaleName,
			ratingScaleDescription,
			lengthOfScale,
			ratingScaleConfig,
		} = req.body;

		try {
			// Check if a record with the same ratingScaleName exists (excluding the current one)
			const existing = await db.ratingScaleMaster.findOne({
				where: {
					ratingScaleName,
					ratingScaleId: { [Op.ne]: ratingScaleId }, // Ensure it's not the same record
				},
			});

			if (existing) {
				return respHelper(res, {
					status: 400,
					msg: "Rating scale name already exists.",
					data: {},
				});
			}

			// Update the Rating Scale Master record
			await db.ratingScaleMaster.update(
				{
					ratingScaleName,
					ratingScaleDescription,
					lengthOfScale,
					updatedBy: req.userId,
				},
				{
					where: { ratingScaleId },
				},
			);

			// Update Related Config Records
			if (Array.isArray(ratingScaleConfig) && ratingScaleConfig.length > 0) {
				// Remove old config records
				await db.ratingScaleConfig.destroy({
					where: { ratingScaleId },
				});

				// Insert new config records
				const configData = ratingScaleConfig.map((config) => ({
					...config,
					ratingScaleId,
					createdBy: req.userId,
					updatedBy: req.userId,
					isActive: true,
				}));

				await db.ratingScaleConfig.bulkCreate(configData);
			}

			// Return success response with updated scale name and ID
			return respHelper(res, {
				status: 200,
				msg: "Rating scale updated successfully.",
				data: {
					ratingScaleId,
					ratingScaleName,
				},
			});
		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error.",
			});
		}
	}

	async getAllRatingScales(req, res) {
		try {
			const ratingScales = await db.ratingScaleMaster.findAll({
				where: { isActive: true },
				include: [
					{
						model: db.ratingScaleConfig,
						required: false,
					},
				],
				order: [[db.ratingScaleConfig, "ratingScaleConfigId", "ASC"]],
			});

			return respHelper(res, {
				status: 200,
				msg: "Rating Scale List",
				data: {
					ratingScales,
				},
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async createCompentancy(req, res) {
		const { compentancyName, compentancyDescription, compentancyID } = req.body;

		try {
			const existing = await db.compentanyTier.findOne({
				where: { compentancyName },
			});
			if (existing) {
				return respHelper(res, {
					status: 400,
					data: {},
					msg: message.APPRAISAL.COMPENTANCY_NAME_EXISTS,
				});
			}

			// CREATE TIER
			const tier = await db.compentanyTier.create({
				compentancyName,
				compentancyDescription,
				compentancyID,
				createdBy: req.userId,
				updatedBy: req.userId,
				isActive: true,
			});

			return respHelper(res, {
				status: 201,
				data: {},
				msg: message.APPRAISAL.COMPENTANCY_CREATE_SUCCESS,
			});
		} catch (error) {
			console.error("Error creating competency:", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async getAllCompetencyTiers(req, res) {
		try {
			const tiers = await db.compentanyTier.findAll({
				where: { isActive: true },
				order: [["compentancyTierId", "ASC"]],
			});

			return respHelper(res, {
				status: 200,
				data: tiers,
				msg: "Fetched competency tiers successfully.",
			});
		} catch (error) {
			console.error("Error fetching competency tiers:", error);
			return respHelper(res, {
				status: 500,
				data: {},
			});
		}
	}

	async updateCompentancy(req, res) {
		try {
			const {
				compentancyTierId,
				compentancyName,
				compentancyDescription,
				compentancyID,
			} = req.body;

			if (!compentancyTierId) {
				return respHelper(res, {
					status: 400,
					msg: "Competency Tier ID is required for update.",
				});
			}

			// Check if the record exists
			const existingTier = await db.compentanyTier.findByPk(compentancyTierId);
			if (!existingTier) {
				return respHelper(res, {
					status: 404,
					msg: "Competency tier not found.",
				});
			}

			// Check for duplicate compentancyName
			const duplicateName = await db.compentanyTier.findOne({
				where: {
					compentancyName,
					compentancyTierId: { [db.Sequelize.Op.ne]: compentancyTierId },
				},
			});
			if (duplicateName) {
				return respHelper(res, {
					status: 400,
					msg: "Competency name already exists.",
				});
			}

			// Check for duplicate compentancyID
			const duplicateID = await db.compentanyTier.findOne({
				where: {
					compentancyID,
					compentancyTierId: { [db.Sequelize.Op.ne]: compentancyTierId },
				},
			});
			if (duplicateID) {
				return respHelper(res, {
					status: 400,
					msg: "Competency ID already exists.",
				});
			}

			// Perform update
			await db.compentanyTier.update(
				{
					compentancyName,
					compentancyDescription,
					compentancyID,
					updatedBy: req.userId,
				},
				{ where: { compentancyTierId } },
			);

			return respHelper(res, {
				status: 200,
				msg: "Competency updated successfully.",
				data: {},
			});
		} catch (error) {
			console.error("Error updating competency:", error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error while updating competency.",
			});
		}
	}

	async getAllCompetencyAttributesWithTier(req, res) {
		try {
			const attributes = await db.compentancyAttributes.findAll({
				include: [
					{
						model: db.compentanyTier,
						attributes: [
							"compentancyTierId",
							"compentancyName",
							"compentancyDescription",
							"compentancyID",
						],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: attributes,
				msg: "Fetched competency attributes with tiers successfully.",
			});
		} catch (error) {
			console.error("Error fetching attributes with tiers:", error);
			return respHelper(res, {
				status: 500,
				data: {},
				msg: "Internal server error",
			});
		}
	}

	async addCompetencyAttributes(req, res) {
		try {
			const {
				compentancyTierId,
				compAttrName,
				compAttrDescription,
				compAttrID,
			} = req.body;

			const existing = await db.compentancyAttributes.findOne({
				where: {
					compentancyTierId,
					compAttrName,
					//isDeleted: 0, // Optional: if you have soft delete
				},
			});
			if (existing) {
				return respHelper(res, {
					status: 400,
					msg: `Competency attribute "${compAttrName}" already exists in this tier.`,
				});
			}
			const insertPayload = {
				compentancyTierId,
				compAttrName,
				compAttrDescription,
				compAttrID,
			};

			await db.compentancyAttributes.create(insertPayload);
			return respHelper(res, {
				status: 200,
				msg: "Competency attributes added successfully.",
				data: {},
			});
		} catch (error) {
			console.log("errorerror", error);
			console.error(error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}

	async updateCompetencyAttributes(req, res) {
		try {
			const {
				compAttributesId,
				compentancyTierId,
				compAttrName,
				compAttrDescription,
				compAttrID,
			} = req.body;

			if (!compAttributesId) {
				return respHelper(res, {
					status: 400,
					msg: "Competency Attribute ID is required for update.",
				});
			}

			const attribute =
				await db.compentancyAttributes.findByPk(compAttributesId);
			if (!attribute) {
				return respHelper(res, {
					status: 404,
					msg: "Competency attribute not found.",
				});
			}

			// 1. Check for duplicate compAttrName within the same tier
			const duplicateName = await db.compentancyAttributes.findOne({
				where: {
					compentancyTierId,
					compAttrName,
					compAttributesId: { [db.Sequelize.Op.ne]: compAttributesId },
				},
			});

			if (duplicateName) {
				return respHelper(res, {
					status: 400,
					msg: `Competency attribute name "${compAttrName}" already exists in this tier.`,
				});
			}

			// 2. Check for duplicate compAttrID (excluding current record)
			const duplicateAttrID = await db.compentancyAttributes.findOne({
				where: {
					compAttrID,
					compAttributesId: { [db.Sequelize.Op.ne]: compAttributesId },
				},
			});

			if (duplicateAttrID) {
				return respHelper(res, {
					status: 400,
					msg: `Competency attribute ID "${compAttrID}" already exists.`,
				});
			}

			// Perform the update
			await db.compentancyAttributes.update(
				{
					compAttrName,
					compAttrDescription,
					compentancyTierId,
					compAttrID,
				},
				{ where: { compAttributesId } },
			);

			return respHelper(res, {
				status: 200,
				msg: "Competency attribute updated successfully.",
				data: {},
			});
		} catch (error) {
			console.error("Update error:", error);
			return respHelper(res, {
				status: 500,
				msg: "Internal server error",
			});
		}
	}
}

export default new AppraisalGoalsController();
