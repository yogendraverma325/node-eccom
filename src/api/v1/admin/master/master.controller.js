import db from "../../../../config/db.config.js";
import validator from "../../../../helper/adminValidator.js";
import logger from "../../../../helper/logger.js";
import respHelper from "../../../../helper/respHelper.js";
import service from "./master.service.js";
import Pagination from "../../../../helper/pagination.js";
import { Op, where } from "sequelize";
import moment from "moment";
import helper from "../../../../helper/helper.js";
import constant from "../../../../constant/messages.js";
import xlsx from "json-as-xlsx";

class CommonController {
	/**
	 * CRUD of Company Type Master
	 *
	 */

	async createCompanyType(req, res) {
		try {
			const result = await validator.companyTypeMasterSchema.validateAsync(
				req.body,
			);
			result = { ...result, createdBy: req.userId, isActive: 1 };
			let model = db.companyTypeMaster;
			let query = { typeName: result.typeName };
			let moduleName = "Company Type";
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

	async companyTypeList(req, res) {
		try {
			let model = db.companyTypeMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { typeName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: ["companyTypeId", "typeName", "createdAt", "isActive"],
				order: [["companyTypeId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async companyTypeDetails(req, res) {
		try {
			let model = db.companyTypeMaster;
			let id = req.params.id;
			let query = { companyTypeId: id };
			let response = await service.details(model, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateCompanyType(req, res) {
		try {
			const result = await validator.companyTypeMasterSchema.validateAsync(
				req.body,
			);
			let model = db.companyTypeMaster;
			let query = { companyTypeId: req.params.id };

			let verifyQuery = {
				[Op.not]: { companyTypeId: req.params.id },
				typeName: result.typeName,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Company Type"),
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

	async changeStatusOfCompanyType(req, res) {
		try {
			let model = db.companyTypeMaster;
			let query = { companyTypeId: req.params.id };
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

	async deleteOfCompanyType(req, res) {
		try {
			let model = db.companyTypeMaster;
			let query = { companyTypeId: req.params.id };
			let updateMetaData = { isDeleted: 1 };
			let moduleName = "Company Type";
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

	/**
	 * CRUD of Band Master
	 *
	 */

	async createBand(req, res) {
		try {
			let result = await validator.bandMasterSchema.validateAsync(req.body);
			result = { ...result, createdBy: req.userId, isActive: 1 };
			let model = db.bandMaster;
			let query = { bandCode: result.bandCode };
			let moduleName = "Band";
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

	async bandList(req, res) {
		try {
			let model = db.bandMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ bandCode: { [Op.like]: `%${search}%` } },
						{ bandDesc: { [Op.like]: `%${search}%` } },
					],
				}),
			};
			let aggregate = {
				where: query,
				attributes: ["bandId", "bandCode", "bandDesc", "createdAt", "isActive"],
				order: [["bandId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async bandDetails(req, res) {
		try {
			let model = db.bandMaster;
			let id = req.params.id;
			let query = { bandId: id };
			let response = await service.details(model, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateBand(req, res) {
		try {
			let result = await validator.bandMasterSchema.validateAsync(req.body);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.bandMaster;
			let query = { bandId: req.params.id };

			let verifyQuery = {
				[Op.not]: { bandId: req.params.id },
				bandCode: result.bandCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Band Code"),
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

	async changeStatusOfBand(req, res) {
		try {
			let model = db.bandMaster;
			let query = { bandId: req.params.id };
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

	async deleteOfBand(req, res) {
		try {
			let model = db.bandMaster;
			let query = { bandId: req.params.id };
			let updateMetaData = { isDeleted: 1 };
			let moduleName = "Band";
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

	/**
	 * CRUD of Job Level Master
	 *
	 */

	async createJobLevel(req, res) {
		try {
			let result = await validator.jobLevelMasterSchema.validateAsync(req.body);
			result = { ...result, createdBy: req.userId, isActive: 1 };
			let model = db.jobLevelMaster;
			let query = {
				jobLevelName: result.jobLevelName,
				jobLevelCode: result.jobLevelCode,
			};
			let moduleName = "Job Level";
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

	async jobLevelList(req, res) {
		try {
			let model = db.jobLevelMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ jobLevelName: { [Op.like]: `%${search}%` } },
						{ jobLevelCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};
			let aggregate = {
				where: query,
				attributes: [
					"jobLevelId",
					"jobLevelName",
					"jobLevelCode",
					"createdAt",
					"isActive",
				],
				order: [["jobLevelId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async jobLevelDetails(req, res) {
		try {
			let model = db.jobLevelMaster;
			let id = req.params.id;
			let query = { jobLevelId: id };
			let response = await service.details(model, query);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateJobLevel(req, res) {
		try {
			let result = await validator.jobLevelMasterSchema.validateAsync(req.body);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.jobLevelMaster;
			let query = { jobLevelId: req.params.id };

			let verifyQuery = {
				[Op.not]: { jobLevelId: req.params.id },
				jobLevelName: result.jobLevelName,
				jobLevelCode: result.jobLevelCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Job Level"),
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

	async changeStatusOfJobLevel(req, res) {
		try {
			let model = db.jobLevelMaster;
			let query = { jobLevelId: req.params.id };
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

	async deleteOfJobLevel(req, res) {
		try {
			const id = req.params.id;
			let query = { jobLevelId: id };

			const doc = await db.jobLevelMapping.findOne({
				where: query,
				attributes: ["jobLevelId"],
			});

			if (doc) {
				return respHelper(res, {
					status: 400,
					msg: "Job level mapped",
					data: {},
				});
			} else {
				await db.jobLevelMaster.destroy({
					where: { jobLevelId: id },
				});
				return respHelper(res, {
					status: 200,
					msg: "Job level deleted successfully",
					data: {},
				});
			}
		} catch (error) {
			logger.error("Error while deleting job level", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async createBank(req, res) {
		try {
			const result = await validator.bankMasterSchema.validateAsync(req.body);
			let model = db.bankMaster;
			let query = { bankIfsc: result.bankIfsc };
			let moduleName = "Bank Ifsc";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
					},
				},
				query,
				moduleName,
			);
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

	async bankList(req, res) {
		try {
			let model = db.bankMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			// let query = {
			//   // isActive: 1,
			//   ...(search && { bankName: { [Op.like]: `%${search}%` } }),
			// };
			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ bankName: { [Op.like]: `%${search}%` } },
						{ bankIfsc: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("bankName")),
						"bankName",
					],
					"bankId",
					"bankIfsc",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["bankId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateBank(req, res) {
		try {
			const result = await validator.bankMasterSchema.validateAsync(req.body);
			let model = db.bankMaster;
			let query = { bankId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);
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

	async changeStatusOfBank(req, res) {
		try {
			let model = db.bankMaster;
			let query = { bankId: req.params.id };
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

	//RITAK WORK
	async changeStatusOfBu(req, res) {
		try {
			let model = db.buMaster;
			let query = { buId: req.params.id };
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
	async buList(req, res) {
		try {
			let model = db.buMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ buName: { [Op.like]: `%${search}%` } },
						{ buCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[db.sequelize.fn("DISTINCT", db.sequelize.col("buName")), "buName"],
					"buId",
					"buCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["buId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{
						model: db.buMapping,
						attributes: ["companyId"],
						include: [
							{
								model: db.companyMaster,
								attributes: ["companyId", "companyName"],
							},
							{
								model: db.employeeMaster,
								attributes: ["id", "name"],
								as: "buhrData",
							},
							{
								model: db.employeeMaster,
								attributes: ["id", "name"],
								as: "buHeadData",
							},
						],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createBu(req, res) {
		try {
			// Validate the request body using Joi
			const result = await validator.buMasterSchema.validateAsync(req.body);

			// Prepare the data for the buMaster table
			let model = db.buMaster;
			let query = { buCode: result.buCode }; // This should query the buMaster table for the buCode
			let moduleName = "Bu";

			// Check if the BU Code already exists in the buMaster table
			const existingBu = await model.findOne({ where: query });
			if (existingBu) {
				return respHelper(res, {
					status: 400,
					msg: "BU Code already exists.",
				});
			}

			// Create the BU Master record
			const response = await service.create(
				model,
				{
					...result,
					createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					createdBy: req.userId,
					isActive: 1,
				},
				query,
				moduleName,
			);

			// Get the generated buId from the BU Master record
			const buId = response.data?.buId;
			if (!buId) {
				return respHelper(res, {
					status: 500,
					msg: "BU is missing or could not be created.",
				});
			}

			// Ensure companyFields is provided
			if (!result.companyFields || result.companyFields.length === 0) {
				return respHelper(res, {
					status: 500,
					msg: "Company Fields are missing in the request.",
				});
			}

			// Create BU Mapping for each company
			for (let i = 0; i < result.companyFields.length; i++) {
				let companyField = result.companyFields[i];
				let { companyId, buHead, buHr } = companyField;

				// Prepare the data for the buMapping table
				const buMappingData = {
					buId: buId, // Use the generated buId
					companyId: companyId,
					headId: buHead.value, // Store the ID of BU Head
					buHrId: buHr.value, // Store the ID of BU HR
					createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					createdBy: req.userId,
					isActive: 1,
				};

				// Create the BU Mapping record for each company
				await service.create(db.buMapping, buMappingData, null, "BU Mapping");
			}

			return respHelper(res, {
				status: 200,
				msg: "BU and BU Mappings created successfully.",
				data: response.data,
			});
		} catch (error) {
			// Handle errors and return a proper response
			logger.error(error);
			console.log(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
				msg: "An unexpected error occurred.",
			});
		}
	}

	async updateBu(req, res) {
		try {
			// Step 1: Validate the incoming request body for buMaster
			const result = await validator.buMasterSchema.validateAsync(req.body);

			// Step 2: Prepare for the `buMaster` update
			let model = db.buMaster;
			let query = { buId: req.params.id };

			// Check if the BU exists
			const existingBu = await model.findOne({ where: query });
			if (!existingBu) {
				return respHelper(res, {
					status: 404,
					msg: "Business Unit not found.",
				});
			}

			// Proceed with the update
			let response = await service.update(
				model,
				{
					...result,
					updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					updatedBy: req.userId,
				},
				query,
			);

			// Step 3: If `buMaster` update is successful, handle `buMapping` updates
			const buId = req.params.id;

			// Step 4: Ensure companyFields is provided for the mapping update
			if (!result.companyFields || result.companyFields.length === 0) {
				return respHelper(res, {
					status: 500,
					msg: "Company Fields are missing in the request.",
				});
			}

			// Get the list of all companyIds from the request (to check for deletions)
			const requestCompanyIds = result.companyFields.map(
				(field) => field.companyId,
			);

			// Step 5: Iterate through company fields and update or create each mapping
			for (let i = 0; i < result.companyFields.length; i++) {
				let companyField = result.companyFields[i];
				let { companyId, buHead, buHr } = companyField;

				// Check if the mapping exists
				const existingMapping = await db.buMapping.findOne({
					where: { buId, companyId },
				});

				if (existingMapping) {
					// Update existing mapping entry
					await db.buMapping.update(
						{
							headId: buHead.value,
							buHrId: buHr.value,
							updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
							updatedBy: req.userId,
						},
						{ where: { buId, companyId } },
					);
				} else {
					// Create a new mapping if it doesn't exist
					await db.buMapping.create({
						buId,
						companyId,
						headId: buHead.value,
						buHrId: buHr.value,
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					});
				}
			}

			// Step 6: Delete any mappings that are no longer in the request
			// Find all companyIds for the current buId in the buMapping table
			const existingMappings = await db.buMapping.findAll({
				where: { buId },
			});

			// Get the companyIds from the existing mappings
			const existingCompanyIds = existingMappings.map(
				(mapping) => mapping.companyId,
			);

			// Find companyIds that exist in the database but are missing from the request
			const companyIdsToDelete = existingCompanyIds.filter(
				(companyId) => !requestCompanyIds.includes(companyId),
			);

			// Delete the mappings for companyIds that are no longer in the request
			if (companyIdsToDelete.length > 0) {
				await db.buMapping.destroy({
					where: { buId, companyId: companyIdsToDelete },
				});
			}

			// After processing all mappings, return a success response
			return respHelper(res, {
				status: 200,
				msg: "Business Unit and Mapping updated successfully",
			});
		} catch (error) {
			// Handle errors during the update process
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
				msg: "An unexpected error occurred.",
			});
		}
	}

	async changeStatusOfSbu(req, res) {
		try {
			let model = db.sbuMaster;
			let query = { sbuId: req.params.id };
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
	async sbuList(req, res) {
		try {
			let model = db.sbuMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ sbuName: { [Op.like]: `%${search}%` } },
						{ code: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[db.sequelize.fn("DISTINCT", db.sequelize.col("sbuName")), "sbuName"],
					"sbuId",
					"code",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["sbuId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{
						model: db.sbuMapping,
						attributes: ["buMappingId"],
						include: [
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
							},
						],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createSbu(req, res) {
		try {
			const result = await validator.sbuMasterSchema.validateAsync(req.body);
			let model = db.sbuMaster;
			let query = { code: result.code };
			let moduleName = "Sbu";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					},
				},
				query,
				moduleName,
			);

			// Get the generated buId from the BU Master record
			const sbuId = response.data?.sbuId;
			if (!sbuId) {
				return respHelper(res, {
					status: 500,
					msg: "Sbu is missing or could not be created.",
				});
			}

			// Ensure buId is provided
			if (!result.buId) {
				return respHelper(res, {
					status: 500,
					msg: "buId Fields are missing in the request.",
				});
			}

			// Create SBU Mapping for BU
			let buId = result.buId;

			// Prepare the data for the buMapping table
			const sbuMappingData = {
				sbuId: sbuId,
				buMappingId: buId, // Use the generated buId
				createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
				createdBy: req.userId,
				isActive: 1,
			};

			// Create the BU Mapping record for each company
			await service.create(db.sbuMapping, sbuMappingData, null, "SBU Mapping");

			return respHelper(res, {
				status: 200,
				msg: "SBU and SBU Mappings created successfully.",
				data: response.data,
			});

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

	async updateSbu(req, res) {
		try {
			// Step 1: Validate the incoming request body for sbuMaster
			const result = await validator.sbuMasterSchema.validateAsync(req.body);

			// Step 2: Prepare for the `sbuMaster` update
			let model = db.sbuMaster;
			let query = { sbuId: req.params.id };

			// Check if the SBU exists
			const existingSbu = await model.findOne({ where: query });
			if (!existingSbu) {
				return respHelper(res, {
					status: 404,
					msg: "Strategic Business Unit (SBU) not found.",
				});
			}

			// Proceed with the update
			let response = await service.update(
				model,
				{
					...result,
					updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					updatedBy: req.userId,
				},
				query,
			);

			// Step 3: If `sbuMaster` update is successful, handle `sbuMapping` updates
			const sbuId = req.params.id;

			// Step 4: Ensure buId is provided for the mapping update
			if (!result.buId || result.buId.length === 0) {
				return respHelper(res, {
					status: 500,
					msg: "Business Unit (BU) ID is missing in the request.",
				});
			}

			// Step 5: Check if the mapping exists or needs creation
			const existingMapping = await db.sbuMapping.findOne({
				where: { sbuId, buMappingId: result.buId },
			});

			if (existingMapping) {
				// Update existing mapping entry
				await db.sbuMapping.update(
					{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
					{ where: { sbuId, buMappingId: result.buId } },
				);
			} else {
				// Create a new mapping if it doesn't exist
				await db.sbuMapping.create({
					sbuId,
					buMappingId: result.buId,
					createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					createdBy: req.userId,
					isActive: 1,
				});
			}

			// Step 6: Handle removal of old mappings if needed
			const existingMappings = await db.sbuMapping.findAll({
				where: { sbuId },
			});

			// Get the mapping IDs from the database
			const existingMappingIds = existingMappings.map(
				(mapping) => mapping.buMappingId,
			);

			// If `result.buId` doesn't match the existing ones, delete the old mappings
			const mappingIdsToDelete = existingMappingIds.filter(
				(id) => id !== result.buId,
			);

			if (mappingIdsToDelete.length > 0) {
				await db.sbuMapping.destroy({
					where: { sbuId, buMappingId: mappingIdsToDelete },
				});
			}

			// After processing all mappings, return a success response
			return respHelper(res, {
				status: 200,
				msg: "Strategic Business Unit (SBU) and Mapping updated successfully.",
			});
		} catch (error) {
			// Handle errors during the update process
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			return respHelper(res, {
				status: 500,
				msg: "An unexpected error occurred.",
			});
		}
	}

	async changeStatusOfDesignation(req, res) {
		try {
			let model = db.designationMaster;
			let query = { designationId: req.params.id };
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
	async designationList(req, res) {
		try {
			let model = db.designationMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ name: { [Op.like]: `%${search}%` } },
						{ code: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[db.sequelize.fn("DISTINCT", db.sequelize.col("name")), "name"],
					"designationId",
					"code",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["designationId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createDesignation(req, res) {
		try {
			const result = await validator.designationMasterSchema.validateAsync(
				req.body,
			);
			let model = db.designationMaster;
			let query = { code: result.code };
			let moduleName = "Designation";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					},
				},
				query,
				moduleName,
			);

			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateDesignation(req, res) {
		try {
			const result = await validator.designationMasterSchema.validateAsync(
				req.body,
			);
			let model = db.designationMaster;
			let query = { designationId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);
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

	async changeStatusOfGrade(req, res) {
		try {
			let model = db.gradeMaster;
			let query = { gradeId: req.params.id };
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
	async gradeList(req, res) {
		try {
			let model = db.gradeMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ gradeName: { [Op.like]: `%${search}%` } },
						{ gradeCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("gradeName")),
						"gradeName",
					],
					"gradeId",
					"gradeCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["gradeId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createGrade(req, res) {
		try {
			const result = await validator.gradeMasterSchema.validateAsync(req.body);
			let model = db.gradeMaster;
			let query = { gradeCode: result.gradeCode };
			let moduleName = "Grade";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					},
				},
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateGrade(req, res) {
		try {
			const result = await validator.gradeMasterSchema.validateAsync(req.body);
			let model = db.gradeMaster;
			let query = { gradeId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);
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

	async changeStatusOfDegree(req, res) {
		try {
			let model = db.degreeMaster;
			let query = { degreeId: req.params.id };
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
	async degreeList(req, res) {
		try {
			let model = db.degreeMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ degreeName: { [Op.like]: `%${search}%` } },
						{ degreeCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("degreeName")),
						"degreeName",
					],
					"degreeId",
					"degreeCode",
					"degreeType",
					"durationInYears",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["degreeId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createDegree(req, res) {
		try {
			const result = await validator.degreeMasterSchema.validateAsync(req.body);
			let model = db.degreeMaster;
			let query = { degreeCode: result.degreeCode };
			let moduleName = "Degree";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					},
				},
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateDegree(req, res) {
		try {
			const result = await validator.degreeMasterSchema.validateAsync(req.body);
			let model = db.degreeMaster;
			let query = { degreeId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);
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

	async changeStatusOfHoliday(req, res) {
		try {
			let model = db.holidayMaster;
			let query = { holidayId: req.params.id };
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
	async holidayList(req, res) {
		try {
			let model = db.holidayMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [{ holidayName: { [Op.like]: `%${search}%` } }],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("holidayName")),
						"holidayName",
					],
					"holidayId",
					"holidayDate",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["holidayId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{
						model: db.holidayCompanyLocationConfiguration,
						attributes: ["holidayId", "companyLocationId", "isActive"],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createHoliday(req, res) {
		try {
			const result = await validator.holidayMasterSchema.validateAsync(
				req.body,
			);
			let model = db.holidayMaster;
			let query = null;
			let moduleName = "Holiday";
			let metaData = {
				...result,
				...{
					createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					createdBy: req.userId,
					isActive: 1,
				},
			};
			//console.log('metaData',metaData)
			let response = await service.create(model, metaData, query, moduleName);
			//mapping start
			// Check if holidayId exists in the response
			const holidayId = response.data?.holidayId; // Use optional chaining to avoid errors
			if (!holidayId) {
				throw new Error("Holiday ID is missing in the response.");
			}

			// Map for creating holiday company location configurations
			model = db.holidayCompanyLocationConfiguration;
			moduleName = "Holiday Company Location";
			// Ensure result.location is an array (it should be an array of IDs like [1, 2])
			if (!Array.isArray(result.locations)) {
				throw new Error("Location data must be an array.");
			}

			// Loop through each location ID and create a record for each location
			const locationResponses = []; // To collect responses from all location creations
			for (const locationId of result.locations) {
				// Prepare metadata for the location record
				const locationMetaData = {
					holidayId, // The holidayId for each location
					companyLocationId: locationId, // Directly use the location ID as companyLocationId
					createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
					createdBy: req.userId,
					isActive: 1, // Assuming locations are always active
				};

				// Create a record for the location
				const locationResponse = await service.create(
					model, // Model to insert the record into
					locationMetaData, // Metadata for the location record
					query, // Query can be null or additional filters
					moduleName, // Module name for logging or identification
				);
			}
			//mapping end

			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateHoliday(req, res) {
		try {
			const result = await validator.holidayMasterSchema.validateAsync(
				req.body,
			);

			let model = db.holidayMaster;
			let query = { holidayId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);

			// Now handle the holidayCompanyLocationConfiguration updates
			const holidayId = req.params.id;
			let locationModel = db.holidayCompanyLocationConfiguration;

			// Get existing locations for the current holidayId
			const existingLocations = await locationModel.findAll({
				where: { holidayId },
			});

			const existingLocationIds = existingLocations.map(
				(loc) => loc.companyLocationId,
			);
			const newLocationIds = result.locations || [];

			// Update isActive for existing locations based on whether they're in the new `locations` array
			for (const existingLocation of existingLocations) {
				if (!newLocationIds.includes(existingLocation.companyLocationId)) {
					// If the companyLocationId is not in new locations, set isActive to false
					await locationModel.update(
						{ isActive: 0 },
						{
							where: {
								companyLocationId: existingLocation.companyLocationId,
								holidayId,
							},
						},
					);
				} else {
					// If it is in the new locations, make sure isActive remains true
					await locationModel.update(
						{ isActive: 1 },
						{
							where: {
								companyLocationId: existingLocation.companyLocationId,
								holidayId,
							},
						},
					);
				}
			}
			// Create new entries for locations that don't exist in the holidayCompanyLocationConfiguration
			for (const locationId of newLocationIds) {
				if (!existingLocationIds.includes(locationId)) {
					const locationMetaData = {
						holidayId, // The holidayId for the location
						companyLocationId: locationId, // The companyLocationId from locations
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1, // Set to active by default for new entries
					};
					// Create a new record for the location
					await service.create(
						locationModel,
						locationMetaData,
						null,
						"Holiday Company Location",
					);
				}
			}
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

	async changeStatusOfNewCustomer(req, res) {
		try {
			let model = db.newCustomerNameMaster;
			let query = { newCustomerNameId: req.params.id };
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
	async NewCustomerList(req, res) {
		try {
			let model = db.newCustomerNameMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [{ newCustomerName: { [Op.like]: `%${search}%` } }],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("newCustomerName")),
						"newCustomerName",
					],
					"newCustomerNameId",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["newCustomerNameId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createNewCustomer(req, res) {
		try {
			const result = await validator.newCustomerSchema.validateAsync(req.body);
			let model = db.newCustomerNameMaster;
			let query = { newCustomerName: result.newCustomerName };
			let moduleName = "New Customer";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					},
				},
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateNewCustomer(req, res) {
		try {
			const result = await validator.newCustomerSchema.validateAsync(req.body);
			let model = db.newCustomerNameMaster;
			let query = { newCustomerNameId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);
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

	//RITAK WORK

	//RITAk WORK
	async changeStatusOfCostCenter(req, res) {
		try {
			let model = db.costCenterMaster;
			let query = { costCenterId: req.params.id };
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
	async costCenterList(req, res) {
		try {
			let model = db.costCenterMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ costCenterName: { [Op.like]: `%${search}%` } },
						{ costCenterCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("costCenterName")),
						"costCenterName",
					],
					"costCenterId",
					"costCenterCode",
					"costCenterHead",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				order: [["costCenterId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "empCode", "name"],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createCostCenter(req, res) {
		try {
			const result = await validator.costCenterMasterSchema.validateAsync(
				req.body,
			);
			let model = db.costCenterMaster;
			let query = { costCenterCode: result.costCenterCode };
			let moduleName = "Cost Center";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
					},
				},
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateCostCenter(req, res) {
		try {
			const result = await validator.costCenterMasterSchema.validateAsync(
				req.body,
			);
			let model = db.costCenterMaster;
			let query = { costCenterId: req.params.id };
			let response = await service.update(
				model,
				{
					...result,
					...{
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedBy: req.userId,
					},
				},
				query,
			);
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

	async changeStatusOfCompany(req, res) {
		try {
			let model = db.companyMaster;
			let query = { companyId: req.params.id };
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

	async CompanyList(req, res) {
		try {
			let model = db.companyMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ companyName: { [Op.like]: `%${search}%` } },
						{ companyCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					// Distinct companyName with alias
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("companyName")),
						"companyName",
					],

					// Other fields
					"companyId",
					"companyCode",
					"isActive",
					"createdAt",
					"updatedAt",

					// Optional fields (add all the necessary fields here)
					"groupId",
					"currencyId",
					"timeZoneId",
					"finacialYearBegin",
					"industryId",
					"companyTypeId",
					"dateOfIncorporation",
					"panNo",
					"tanNo",
					"vatRegNo",
					"siteUrl",
					"companyLogo",
					"officialMail",
				],

				order: [["companyId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log("error", error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async createCompany(req, res) {
		try {
			const result = await validator.companySchema.validateAsync(req.body);
			// Get the current timestamp in seconds
			const d = Math.floor(Date.now() / 1000);
			// Prepare the companyLogo field if provided
			let companyLogo = null;

			if (result.companyLogo) {
				// If the companyLogo starts with 'uploads', skip the file upload
				if (!result.companyLogo.startsWith("uploads")) {
					try {
						// Call the file upload helper function and store the result
						companyLogo = await helper.fileUpload(
							result.companyLogo,
							`companyLogo${d}`,
							`uploads/company`,
						);
					} catch (uploadError) {
						// Handle file upload error
						logger.error("Error uploading file:", uploadError);
						return respHelper(res, {
							status: 500,
							msg: "Error uploading company logo.",
						});
					}
				} else {
					// If the companyLogo already starts with 'uploads', don't upload, just use the provided path
					companyLogo = result.companyLogo;
				}
			}
			let model = db.companyMaster;
			let query = { companyCode: result.companyCode };
			let moduleName = "New Company";
			let response = await service.create(
				model,
				{
					...result,
					...{
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						createdBy: req.userId,
						isActive: 1,
						companyLogo: companyLogo || null, // If no logo, set to null
					},
				},
				query,
				moduleName,
			);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			console.error("Error:", error.message);

			return respHelper(res, {
				status: 500,
			});
		}
	}
	async updateCompany(req, res) {
		try {
			// Validate the request body
			const result = await validator.companySchema.validateAsync(req.body);
			// Get the current timestamp in seconds
			const d = Math.floor(Date.now() / 1000);
			// Prepare the companyLogo field if provided
			let companyLogo = null;

			if (result.companyLogo) {
				// If the companyLogo starts with 'uploads', skip the file upload
				if (!result.companyLogo.startsWith("uploads")) {
					try {
						// Call the file upload helper function and store the result
						companyLogo = await helper.fileUpload(
							result.companyLogo,
							`companyLogo${d}`,
							`uploads/company`,
						);
					} catch (uploadError) {
						// Handle file upload error
						logger.error("Error uploading file:", uploadError);
						return respHelper(res, {
							status: 500,
							msg: "Error uploading company logo.",
						});
					}
				} else {
					// If the companyLogo already starts with 'uploads', don't upload, just use the provided path
					companyLogo = result.companyLogo;
				}
			}

			// Prepare the update data
			const updateData = {
				...result,
				updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
				updatedBy: req.userId,
				companyLogo: companyLogo || null, // If no logo, set to null
			};

			// Model and query for the update operation
			const model = db.companyMaster;
			const query = { companyId: req.params.id };
			// Update the company record
			let response = await service.update(model, updateData, query);
			// Return the response
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			if (error.isJoi === true) {
				// Validation error (Joi)
				return respHelper(res, {
					status: 422,
					msg: error.details[0].message,
				});
			}
			// Internal server error
			return respHelper(res, {
				status: 500,
				msg: "Internal server error.",
			});
		}
	}

	//RITWK WORK

	/**
	 * CRUD of Department Master Created by Jay
	 *
	 */

	async createDepartment(req, res) {
		try {
			let result = await validator.departmentMasterSchema.validateAsync(
				req.body,
			);
			result = { ...result, createdBy: req.userId, isActive: 1 };

			let model = db.departmentMaster;
			let query = {
				departmentName: result.departmentName,
				departmentCode: result.departmentCode,
			};
			let moduleName = "Department";
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

	async departmentList(req, res) {
		try {
			let model = db.departmentMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ departmentName: { [Op.like]: `%${search}%` } },
						{ departmentCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					"departmentId",
					"departmentName",
					"departmentCode",
					"parentDepartmentId",
					"createdAt",
					"isActive",
				],
				order: [["departmentId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateDepartment(req, res) {
		try {
			let result = await validator.departmentMasterSchema.validateAsync(
				req.body,
			);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.departmentMaster;
			let query = { departmentId: req.params.id };

			let verifyQuery = {
				[Op.not]: { departmentId: req.params.id },
				departmentName: result.departmentName,
				departmentCode: result.departmentCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Department Name"),
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

	async changeStatusOfDepartment(req, res) {
		try {
			let model = db.departmentMaster;
			let query = { departmentId: req.params.id };
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

	/**
	 * CRUD of Functional Area Master Created by Jay
	 *
	 */

	async createFunctionalArea(req, res) {
		try {
			let result = await validator.functionalAreaMasterSchema.validateAsync(
				req.body,
			);
			result = { ...result, createdBy: req.userId, isActive: 1 };
			let model = db.functionalAreaMaster;
			let query = {
				functionalAreaName: result.functionalAreaName,
				functionalAreaCode: result.functionalAreaCode,
			};
			let moduleName = "Functional Area";
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

	async functionalAreaList(req, res) {
		try {
			let model = db.functionalAreaMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				// isActive: 1,
				...(search && {
					[Op.or]: [
						{ functionalAreaName: { [Op.like]: `%${search}%` } },
						{ functionalAreaCode: { [Op.like]: `%${search}%` } },
					],
				}),
			};

			let aggregate = {
				where: query,
				attributes: [
					"functionalAreaId",
					"functionalAreaName",
					"functionalAreaCode",
					"parentFunctionalAreaId",
					"createdAt",
					"isActive",
				],
				order: [["functionalAreaId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateFunctionalArea(req, res) {
		try {
			let result = await validator.functionalAreaMasterSchema.validateAsync(
				req.body,
			);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.functionalAreaMaster;
			let query = { functionalAreaId: req.params.id };

			let verifyQuery = {
				[Op.not]: { functionalAreaId: req.params.id },
				functionalAreaName: result.functionalAreaName,
				functionalAreaCode: result.functionalAreaCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Functional Area"),
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

	async changeStatusOfFunctionalArea(req, res) {
		try {
			let model = db.functionalAreaMaster;
			let query = { functionalAreaId: req.params.id };
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

	/**
	 * CRUD of Week Off Master Created by Jay
	 *
	 */

	async createWeekoff(req, res) {
		try {
			let result = await validator.weekoffMasterSchema.validateAsync(req.body);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment(),
			};
			let model = db.weekOffMaster;
			let query = { weekOffName: result.weekOffName };
			let moduleName = "Week Off";
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

	async weekoffList(req, res) {
		try {
			let model = db.weekOffMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { weekOffName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: [
					"weekOffId",
					"weekOffName",
					"nonWorkingDays",
					"createdAt",
					"isActive",
				],
				order: [["weekOffId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateWeekoff(req, res) {
		try {
			let result = await validator.weekoffMasterSchema.validateAsync(req.body);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.weekOffMaster;
			let query = { weekOffId: req.params.id };

			let verifyQuery = {
				[Op.not]: { weekOffId: req.params.id },
				weekOffName: result.weekOffName,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Week Off Name"),
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

	async changeStatusOfWeekoff(req, res) {
		try {
			let model = db.weekOffMaster;
			let query = { weekOffId: req.params.id };
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

	/**
	 * CRUD of Shift Master Created by Jay
	 *
	 */

	async createShift(req, res) {
		try {
			let result = await validator.shiftMasterSchema.validateAsync(req.body);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment(),
			};
			let model = db.shiftMaster;
			let query = { shiftName: result.shiftName };
			let moduleName = "Shift Name";
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

	async shiftList(req, res) {
		try {
			let model = db.shiftMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { shiftName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: [
					"shiftId",
					"shiftName",
					"shiftStartTime",
					"shiftEndTime",
					"shiftRemark",
					"isOverNight",
					"createdAt",
					"isActive",
				],
				order: [["shiftId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateShift(req, res) {
		try {
			let result = await validator.shiftMasterSchema.validateAsync(req.body);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.shiftMaster;
			let query = { shiftId: req.params.id };

			let verifyQuery = {
				[Op.not]: { shiftId: req.params.id },
				shiftName: result.shiftName,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Shift Name"),
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

	async changeStatusOfShift(req, res) {
		try {
			let model = db.shiftMaster;
			let query = { shiftId: req.params.id };
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

	/**
	 * CRUD of Attendance Policy Master Created by Jay
	 *
	 */

	async createAttendancePolicy(req, res) {
		try {
			let result = await validator.attendancePolicyMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment(),
			};
			let model = db.attendancePolicymaster;
			let query = { policyName: result.policyName };
			let moduleName = "Attendance Policy Name";
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

	async attendancePolicyList(req, res) {
		try {
			let model = db.attendancePolicymaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { policyName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
				},
				order: [["attendancePolicyId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateAttendancePolicy(req, res) {
		try {
			let result = await validator.attendancePolicyMasterSchema.validateAsync(
				req.body,
			);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.attendancePolicymaster;
			let query = { attendancePolicyId: req.params.id };

			let verifyQuery = {
				[Op.not]: { attendancePolicyId: req.params.id },
				policyName: result.policyName,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Policy Name"),
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

	async changeStatusOfAttendancePolicy(req, res) {
		try {
			let model = db.attendancePolicymaster;
			let query = { attendancePolicyId: req.params.id };
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

	/**
	 * CRUD of Leave Master Created by Jay
	 *
	 */

	async createLeave(req, res) {
		try {
			let result = await validator.leaveMasterSchema.validateAsync(req.body);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment(),
			};
			let model = db.leaveMaster;
			let query = { leaveName: result.leaveName, leaveCode: result.leaveCode };
			let moduleName = "Leave";
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

	async leaveList(req, res) {
		try {
			let model = db.leaveMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { leaveName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
				},
				order: [["leaveId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateLeave(req, res) {
		try {
			let result = await validator.leaveMasterSchema.validateAsync(req.body);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.leaveMaster;
			let query = { leaveId: req.params.id };

			let verifyQuery = {
				[Op.not]: { leaveId: req.params.id },
				leaveName: result.leaveName,
				leaveCode: result.leaveCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Leave"),
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

	async changeStatusOfLeave(req, res) {
		try {
			let model = db.leaveMaster;
			let query = { leaveId: req.params.id };
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

	/**
	 * CRUD of Notice Period Master Created by Jay
	 *
	 */

	async createNoticePeriod(req, res) {
		try {
			let result = await validator.noticePeriodMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdDt: moment().format("YYYY-MM-DD"),
			};
			let model = db.noticePeriodMaster;
			let query = {
				[Op.or]: [
					{ noticePeriodName: result.noticePeriodName },
					{ noticePeriodCode: result.noticePeriodCode },
				],
			};
			let moduleName = "Notice Period";
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

	async noticePeriodList(req, res) {
		try {
			let model = db.noticePeriodMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { noticePeriodName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "updatedBy", "updatedDt"],
				},
				order: [["noticePeriodAutoId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateNoticePeriod(req, res) {
		try {
			let result = await validator.noticePeriodMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				updatedBy: req.userId,
				updatedDt: moment().format("YYYY-MM-DD"),
			};
			let model = db.noticePeriodMaster;
			let query = { noticePeriodAutoId: req.params.id };

			let verifyQuery = {
				[Op.not]: { noticePeriodAutoId: req.params.id },
				noticePeriodName: result.noticePeriodName,
				noticePeriodCode: result.noticePeriodCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Notice Period"),
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

	async changeStatusOfNoticePeriod(req, res) {
		try {
			let model = db.noticePeriodMaster;
			let query = { noticePeriodAutoId: req.params.id };
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

	/**
	 * CRUD of PT Location Master Created by Jay
	 *
	 */

	async createPtLocation(req, res) {
		try {
			let result = await validator.ptLocationMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdDt: moment(),
			};
			let model = db.ptLocationMaster;
			let query = {
				[Op.and]: [
					{ ptLocationName: result.ptLocationName },
					{ ptLocationCode: result.ptLocationCode },
					{ stateId: result.stateId },
					{ frequency: result.frequency },
				],
			};
			let moduleName = "PT Location";
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

	async ptLocationList(req, res) {
		try {
			let model = db.ptLocationMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { ptLocationName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "updatedBy", "updatedAt"],
				},
				order: [["ptLocationId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{ model: db.stateMaster, attributes: ["stateId", "stateName"] },
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updatePtLocation(req, res) {
		try {
			let result = await validator.ptLocationMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				updatedBy: req.userId,
				updatedDt: moment().format("YYYY-MM-DD"),
			};
			let model = db.ptLocationMaster;
			let query = { ptLocationId: req.params.id };

			let verifyQuery = {
				[Op.not]: { ptLocationId: req.params.id },
				ptLocationName: result.ptLocationName,
				ptLocationCode: result.ptLocationCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "PT Location"),
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

	async changeStatusOfPtLocation(req, res) {
		try {
			let model = db.ptLocationMaster;
			let query = { ptLocationId: req.params.id };
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

	// End master apis creation by jay

	// Start Master Mapping APIs by Jay

	async jobLevelMappingList(req, res) {
		try {
			let model = db.jobLevelMapping;
			let query = { jobLevelId: req.params.id };

			let aggregate = {
				where: query,
				attributes: ["jobLevelMappingId", "isActive"],
				order: [["jobLevelMappingId", "DESC"]],
				include: [
					{ model: db.companyMaster, attributes: ["companyId", "companyName"] },
					{ model: db.bandMaster, attributes: ["bandId", "bandCode"] },
					{
						model: db.gradeMaster,
						attributes: ["gradeId", "gradeName", "gradeCode"],
					},
					{
						model: db.jobLevelMaster,
						attributes: ["jobLevelId", "jobLevelName", "jobLevelCode"],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };

			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async jobLevelMapping(req, res) {
		try {
			let result = await validator.jobLevelMappingSchema.validateAsync(
				req.body,
			);

			let company = result.companyId;
			let metaData = {
				bandId: result.bandId,
				gradeId: result.gradeId,
				jobLevelId: result.jobLevelId,
			};

			let model = db.jobLevelMapping;
			let moduleName = "Job Level Mapping";

			for (let i = 0; i < company.length; i++) {
				let companyId = company[i].value;
				metaData = {
					...metaData,
					createdBy: req.userId,
					isActive: 1,
					createdAt: moment(),
					companyId: companyId,
				};
				let query = {
					companyId: companyId,
					jobLevelId: result.jobLevelId,
				};
				let response = await service.create(model, metaData, query, moduleName);
				if (response.status == 400) {
					return respHelper(res, response);
				}
			}

			return respHelper(res, {
				status: 201,
				msg: constant.INSERT_SUCCESS,
				data: {},
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

	async departmentMappingList(req, res) {
		try {
			let model = db.departmentMapping;
			let query = { departmentId: req.params.id };

			let aggregate = {
				where: query,
				attributes: ["departmentMappingId", "isActive"],
				order: [["departmentMappingId", "DESC"]],
				include: [
					{
						model: db.departmentMaster,
						attributes: ["departmentId", "departmentName"],
					},
					{
						model: db.sbuMapping,
						attributes: ["sbuMappingId"],
						include: [
							{ model: db.sbuMaster, attributes: ["sbuId", "sbuName"] },
							{
								model: db.buMapping,
								attributes: ["buMappingId"],
								include: [
									{ model: db.buMaster, attributes: ["buId", "buName"] },
									{
										model: db.companyMaster,
										attributes: ["companyId", "companyName"],
									},
								],
							},
						],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async departmentMapping(req, res) {
		try {
			let result = await validator.departmentMappingSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment(),
			};
			let model = db.departmentMapping;
			let query = {
				departmentId: result.departmentId,
				sbuMappingId: result.sbuMappingId,
			};
			let moduleName = "Department Mapping";
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

	async functionalMappingList(req, res) {
		try {
			let model = db.functionalAreaMapping;
			let query = { functionalAreaId: req.params.id };

			let aggregate = {
				where: query,
				attributes: ["functionalAreaMappingId", "isActive"],
				order: [["functionalAreaMappingId", "DESC"]],
				include: [
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaId", "functionalAreaName"],
					},
					{
						model: db.departmentMapping,
						attributes: ["departmentMappingId"],
						include: [
							{
								model: db.sbuMapping,
								attributes: ["sbuMappingId"],
								include: [
									{ model: db.sbuMaster, attributes: ["sbuId", "sbuName"] },
									{
										model: db.buMapping,
										attributes: ["buMappingId"],
										include: [
											{ model: db.buMaster, attributes: ["buId", "buName"] },
											{
												model: db.companyMaster,
												attributes: ["companyId", "companyName"],
											},
										],
									},
								],
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentId", "departmentName"],
							},
						],
					},
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async functionalMapping(req, res) {
		try {
			let result = await validator.functionalAreaMappingSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment(),
			};
			let model = db.functionalAreaMapping;
			let query = {
				functionalAreaId: result.functionalAreaId,
				departmentMappingId: result.departmentMappingId,
			};
			let moduleName = "Functional Area Mapping";
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

	async updateJobLevelMapping(req, res) {
		try {
			let result = await validator.jobLevelMappingSchema.validateAsync(
				req.body,
			);
			let metaData = {
				bandId: result.bandId,
				gradeId: result.gradeId,
				jobLevelId: result.jobLevelId,
				companyId: result.companyId.length > 0 ? result.companyId[0].value : "",
			};
			result = { ...metaData, updatedBy: req.userId, updatedAt: moment() };
			let model = db.jobLevelMapping;
			let query = {
				jobLevelMappingId: req.params.id,
			};

			// verify if job level id have mapped with employee

			let findQuery = { jobLevelId: result.jobLevelId };
			let isExist = await db.employeeMaster.findOne({
				where: { companyId: metaData.companyId },
				attributes: ["id"],
				include: [
					{ model: db.jobDetails, where: findQuery, attributes: ["userId"] },
				],
			});

			if (isExist) {
				return respHelper(res, {
					status: 422,
					msg: "You cannot change the job level mapping because it is already assigned to an employee.",
				});
			} else {
				findQuery = {
					jobLevelId: metaData.jobLevelId,
					companyId: metaData.companyId,
					jobLevelMappingId: { [Op.not]: req.params.id },
				};
				isExist = await service.details(db.jobLevelMapping, findQuery);
				if (isExist.status == 200) {
					return respHelper(res, {
						status: 422,
						msg: "You cannot change the job level mapping because it is already mapped.",
					});
				} else {
					let response = await service.update(model, result, query);
					return respHelper(res, response);
				}
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

	async updateDepartmentMapping(req, res) {
		try {
			let result = await validator.departmentMappingSchema.validateAsync(
				req.body,
			);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.departmentMapping;
			let query = {
				departmentMappingId: req.params.id,
			};

			// verify if department id have mapped with employee

			let findQuery = { departmentId: result.departmentId };
			let isExist = await service.details(db.employeeMaster, findQuery);
			if (isExist.status == 200) {
				return respHelper(res, {
					status: 422,
					msg: "You cannot change the department mapping because it is already assigned to an employee.",
				});
			} else {
				findQuery = {
					departmentId: result.departmentId,
					sbuMappingId: result.sbuMappingId,
					departmentMappingId: { [Op.not]: req.params.id },
				};
				isExist = await service.details(db.departmentMapping, findQuery);
				if (isExist.status == 200) {
					return respHelper(res, {
						status: 422,
						msg: "You cannot change the department mapping because it is already mapped.",
					});
				} else {
					let response = await service.update(model, result, query);
					return respHelper(res, response);
				}
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

	async updateFunctionalAreaMapping(req, res) {
		try {
			let result = await validator.functionalAreaMappingSchema.validateAsync(
				req.body,
			);
			result = { ...result, updatedBy: req.userId, updatedAt: moment() };
			let model = db.functionalAreaMapping;
			let query = {
				functionalAreaMappingId: req.params.id,
			};

			// verify if department id have mapped with employee

			let findQuery = { functionalAreaId: result.functionalAreaId };
			let isExist = await service.details(db.employeeMaster, findQuery);
			if (isExist.status == 200) {
				return respHelper(res, {
					status: 422,
					msg: "You cannot change the functional area mapping because it is already assigned to an employee.",
				});
			} else {
				findQuery = {
					departmentMappingId: result.departmentMappingId,
					functionalAreaId: result.functionalAreaId,
					functionalAreaMappingId: { [Op.not]: req.params.id },
				};
				isExist = await service.details(db.functionalAreaMapping, findQuery);
				if (isExist.status == 200) {
					return respHelper(res, {
						status: 422,
						msg: "You cannot change the functional area mapping because it is already mapped.",
					});
				} else {
					let response = await service.update(model, result, query);
					return respHelper(res, response);
				}
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

	// End Master Mapping APIs by Jay

	/**
	 * CRUD of Probation Master Created by Jay
	 *
	 */

	async createProbation(req, res) {
		try {
			let result = await validator.probationMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment().format("YYYY-MM-DD"),
			};
			let model = db.probationMaster;
			let query = {
				probationName: result.probationName,
			};
			let moduleName = "Probation";
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

	async probationList(req, res) {
		try {
			let model = db.probationMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { probationName: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "updatedBy", "updatedDt"],
				},
				order: [["probationId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateProbation(req, res) {
		try {
			let result = await validator.probationMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				updatedBy: req.userId,
				updatedAt: moment(),
			};
			let model = db.probationMaster;
			let query = { probationId: req.params.id };

			let verifyQuery = {
				[Op.not]: { probationId: req.params.id },
				probationName: result.probationName,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Probation"),
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

	async changeStatusOfProbation(req, res) {
		try {
			let model = db.probationMaster;
			let query = { probationId: req.params.id };
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

	/**
	 * CRUD of Company Location Master Created by Jay
	 *
	 */

	async createCompanyLocation(req, res) {
		try {
			let result = await validator.companyLocationMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				districtId: result.cityId,
				createdBy: req.userId,
				isActive: 1,
				createdAt: moment().format("YYYY-MM-DD"),
			};
			let model = db.companyLocationMaster;
			let query = {
				companyLocationCode: result.companyLocationCode,
			};
			let moduleName = "Company Location";
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

	async companyLocationList(req, res) {
		try {
			let model = db.companyLocationMaster;
			let page = parseInt(req.query.page) || 1;
			let search = req.query.search || "";
			let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

			let query = {
				...(search && { address1: { [Op.like]: `%${search}%` } }),
			};

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "updatedBy", "updatedDt"],
				},
				order: [["companyLocationId", "DESC"]],
				limit: pageLimit,
				offset: (page - 1) * pageLimit,
				include: [
					{ model: db.stateMaster, attributes: ["stateName"] },
					{ model: db.cityMaster, attributes: ["cityName"] },
				],
			};

			let response = await service.aggregate(model, aggregate);
			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };
			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateCompanyLocation(req, res) {
		try {
			let result = await validator.companyLocationMasterSchema.validateAsync(
				req.body,
			);
			result = {
				...result,
				updatedBy: req.userId,
				updatedAt: moment(),
			};
			let model = db.companyLocationMaster;
			let query = { companyLocationId: req.params.id };

			let verifyQuery = {
				[Op.not]: { companyLocationId: req.params.id },
				companyLocationCode: result.companyLocationCode,
			};
			let isVerify = await service.details(model, verifyQuery);

			if (isVerify.status == 200) {
				let response = {
					status: 400,
					msg: constant.ALREADY_EXISTS.replace("<module>", "Company Location"),
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

	async changeStatusOfCompanyLocation(req, res) {
		try {
			let model = db.companyLocationMaster;
			let query = { companyLocationId: req.params.id };
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

	/**
	 * CRUD of LWF Mapping Created by Jay
	 *
	 */

	async createLWFMapping(req, res) {
		try {
			let result = await validator.lwfMappingMasterSchema.validateAsync(
				req.body,
			);
			let model = db.lwfMapping;
			let arr = [];

			let lwfmappings = req.body.lwfmappings;
			if (lwfmappings.length > 0) {
				for (let i = 0; i < lwfmappings.length; i++) {
					let result1 = lwfmappings[i]?.contributors;
					for (let j = 0; j < result1.length; j++) {
						let query = {
							lwfDesignationId: lwfmappings[i]?.lwfDesignationId,
							stateId: result1[j]?.stateId,
						};

						if (result1[j]?.lwfMappingId) {
							let isFindQuery = {
								[Op.and]: [
									{ lwfDesignationId: lwfmappings[i]?.lwfDesignationId },
									{ stateId: result1[j]?.stateId },
									{ [Op.not]: { lwfMappingId: result1[j]?.lwfMappingId } },
								],
							};

							let existingData = await db.lwfMapping.findAll({
								where: isFindQuery,
								attributes: ["lwfMappingId"],
							});
							if (existingData.length > 1) {
								j++;
								// return respHelper(res, {
								// 	status: 400,
								// 	msg: constant.ALREADY_EXISTS.replace("<module>", "LWF"),
								// 	data: {},
								// });
							} else {
								let updateObj = {
									...result1[j],
									lwfDesignationId: lwfmappings[i]?.lwfDesignationId,
									updatedBy: req.userId,
									updatedAt: moment().format("YYYY-MM-DD"),
								};

								await db.lwfMapping.update(updateObj, {
									where: { lwfMappingId: result1[j].lwfMappingId },
								});
							}
						} else {
							let response = await service.details(model, query);
							if (response.status === 200) {
								return respHelper(res, {
									status: 400,
									msg: constant.ALREADY_EXISTS.replace("<module>", "LWF"),
									data: {},
								});
							} else {
								arr.push({
									...result1[j],
									lwfDesignationId: lwfmappings[i]?.lwfDesignationId,
									createdBy: req.userId,
									isActive: 1,
									createdAt: moment().format("YYYY-MM-DD"),
								});
							}
						}
					}
					await db.lwfMapping.bulkCreate(arr);
					arr = [];
				}

				return respHelper(res, {
					status: 201,
					msg: constant.UPDATE_SUCCESS.replace("<module>", "LWF"),
					data: {},
				});
			} else {
				return respHelper(res, {
					status: 400,
					msg: "Bad request",
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

	async lwfMappingList(req, res) {
		try {
			let model = db.stateMaster;
			let search = req.query.search || "";

			let query = {
				isActive: 1,
				...(search && { stateName: { [Op.like]: `%${search}%` } }),
			};

			let response = await service.list(model, query);

			let count = await service.count(model, query);
			let obj = { rows: response.data, count: count };

			return respHelper(res, {
				status: response.status,
				msg: response.msg,
				data: obj,
			});
		} catch (error) {
			console.log(error);
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async updateLWFMapping(req, res) {
		try {
			let result = await validator.lwfMappingMasterSchema.validateAsync(
				req.body,
			);

			let model = db.lwfMapping;

			if (result.length > 0) {
				const dataArray = result[0];

				for (let i = 0; i < dataArray.length; i++) {
					let query = {
						lwfmappingId: dataArray[i].lwfmappingId,
					};

					let updateMetaData = {
						...dataArray[i],
						updatedBy: req.userId,
						updatedAt: moment().format("YYYY-MM-DD"),
					};
					let response = await service.update(model, updateMetaData, query);
				}

				return respHelper(res, {
					status: 202,
					msg: "LWF mapping data updated successfully",
					data: {},
				});
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

	async lwfDesignationList(req, res) {
		try {
			let model = db.lwfDesignationMaster;
			let query = { isActive: 1 };

			let aggregate = {
				where: query,
				attributes: {
					exclude: ["createdBy", "updatedBy", "updatedAt"],
				},
				order: [["lwfDesignationId", "ASC"]],
			};

			let response = await service.aggregate(model, aggregate);
			return respHelper(res, response);
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async lwfMappingDetails(req, res) {
		try {
			let model = db.stateMaster;
			let { stateId } = req.params;
			let query = { stateId: stateId };

			let aggregate = {
				where: query,
				include: [
					{
						model: db.lwfMapping,
						attributes: {
							exclude: ["createdBy", "createdAt", "updatedBy", "updatedAt"],
						},
					},
				],
			};

			let response = await service.aggregate(model, aggregate);

			// change response format
			let lwfMappingArr = response.data[0].lwfmappings;
			let groupByLwfDesignationId = lwfMappingArr.reduce((acc, item) => {
				acc[item.lwfDesignationId] = acc[item.lwfDesignationId] || [];
				acc[item.lwfDesignationId].push(item);
				return acc;
			}, {});

			let allData = {
				stateId: response.data[0]?.stateId,
				stateName: response.data[0]?.stateName,
				lwfmappings: groupByLwfDesignationId,
			};

			return respHelper(res, {
				status: response.status,
				msg: response.message,
				data: allData,
			});
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// End admin master apis by jay

	// Start create apis for parent department and functional area

	async parentDepartment(req, res) {
		try {
			const id = req.params.id;
			let query = { [Op.not]: { departmentId: id } };

			const departmentData = await db.departmentMaster.findAll({
				where: query,
				attributes: ["departmentId", "departmentName", "departmentCode"],
			});

			return respHelper(res, {
				status: 200,
				data: departmentData,
			});
		} catch (error) {
			logger.error("Error while getting department list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async parentFunctionalArea(req, res) {
		try {
			let query = { [Op.not]: { functionalAreaId: req.params.id } };
			const functionalAreaData = await db.functionalAreaMaster.findAll({
				where: query,
				attributes: [
					"functionalAreaId",
					"functionalAreaName",
					"functionalAreaCode",
				],
			});

			return respHelper(res, {
				status: 200,
				data: functionalAreaData,
			});
		} catch (error) {
			logger.error("Error while getting functional area list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteDepartment(req, res) {
		try {
			const id = req.params.id;
			let query = { departmentId: id };

			const doc = await db.departmentMapping.findOne({
				where: query,
				attributes: ["departmentId"],
			});

			if (doc) {
				return respHelper(res, {
					status: 400,
					msg: "Department mapped",
					data: {},
				});
			} else {
				await db.departmentMaster.destroy({ where: { departmentId: id } });
				return respHelper(res, {
					status: 200,
					msg: "Department deleted successfully",
					data: {},
				});
			}
		} catch (error) {
			logger.error("Error while deleting department", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteFunctionalArea(req, res) {
		try {
			const id = req.params.id;
			let query = { functionalAreaId: id };

			const doc = await db.functionalAreaMapping.findOne({
				where: query,
				attributes: ["functionalAreaId"],
			});

			if (doc) {
				return respHelper(res, {
					status: 400,
					msg: "Functional area mapped",
					data: {},
				});
			} else {
				await db.functionalAreaMaster.destroy({
					where: { functionalAreaId: id },
				});
				return respHelper(res, {
					status: 200,
					msg: "Functional area deleted successfully",
					data: {},
				});
			}
		} catch (error) {
			logger.error("Error while deleting functional area", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// End apis for parent department and functional area

	// start delete department, functional area and job level mapping data if have not mapped with employee

	async deleteDepartmentMapping(req, res) {
		try {
			const id = req.params.id;
			let query = { departmentId: id };

			const doc = await db.employeeMaster.findOne({
				where: query,
				attributes: ["departmentId"],
			});

			if (doc) {
				return respHelper(res, {
					status: 400,
					msg: "Department assigned",
					data: {},
				});
			} else {
				await db.departmentMapping.destroy({ where: { departmentId: id } });
				return respHelper(res, {
					status: 200,
					msg: "Department mapping deleted successfully",
					data: {},
				});
			}
		} catch (error) {
			logger.error("Error while deleting department mapping data", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteFunctionalAreaMapping(req, res) {
		try {
			const id = req.params.id;
			let query = { functionalAreaId: id };

			const doc = await db.employeeMaster.findOne({
				where: query,
				attributes: ["functionalAreaId"],
			});

			if (doc) {
				return respHelper(res, {
					status: 400,
					msg: "Functional area assigned",
					data: {},
				});
			} else {
				await db.functionalAreaMapping.destroy({
					where: { functionalAreaId: id },
				});
				return respHelper(res, {
					status: 200,
					msg: "Functional area mapping deleted successfully",
					data: {},
				});
			}
		} catch (error) {
			logger.error("Error while deleting functional area mapping data", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async deleteJobLevelMapping(req, res) {
		try {
			const { companyId, id } = req.params;
			let query = { companyId: companyId };

			const doc = await db.employeeMaster.findOne({
				where: query,
				attributes: ["id"],
				include: [
					{
						model: db.jobDetails,
						attributes: ["userId"],
						where: { jobLevelId: id },
						required: true,
					},
				],
			});

			if (doc) {
				return respHelper(res, {
					status: 400,
					msg: "Job level assigned",
					data: {},
				});
			} else {
				await db.jobLevelMapping.destroy({
					where: { jobLevelId: id, companyId: companyId },
				});
				return respHelper(res, {
					status: 200,
					msg: "Job level mapping deleted successfully",
					data: {},
				});
			}
		} catch (error) {
			logger.error("Error while deleting job level mapping data", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// end delete mapping data

	// start change status of job level, department and functional area mapping

	async changeStatusOfJobLevelMapping(req, res) {
		try {
			let model = db.jobLevelMapping;
			let query = { jobLevelMappingId: req.params.id };
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

	async changeStatusOfDepartmentMapping(req, res) {
		try {
			let model = db.departmentMapping;
			let query = { departmentMappingId: req.params.id };
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

	async changeStatusOfFunctionalAreaMapping(req, res) {
		try {
			let model = db.functionalAreaMapping;
			let query = { functionalAreaMappingId: req.params.id };
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

	// end change status of job level, department and functional area mapping

	//ritak export master data start

	async exportBankMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"bankId",
					"bankName",
					"bankIfsc",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee", // Must match the alias in the association
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee", // Must match the alias in the association
						attributes: ["name", "empCode"],
					},
				],
				order: [["bankId", "ASC"]],
			};

			let bankData = await db.bankMaster.findAll(aggregate);

			let finalData = bankData.map((bank) => ({
				Bank_ID: bank.bankId,
				Bank_Name: bank.bankName,
				IFSC_Code: bank.bankIfsc,
				Status: bank.isActive ? "Active" : "Inactive",
				Created_At: bank.createdAt
					? moment(bank.createdAt).format("DD-MM-YYYY")
					: "",
				Updated_At: bank.updatedAt
					? moment(bank.updatedAt).format("DD-MM-YYYY")
					: "",
				Created_By: bank.createdEmployee
					? `${bank.createdEmployee.name || ""} (${bank.createdEmployee.empCode || "-"})`
					: "",
				Updated_By: bank.updatedEmployee
					? `${bank.updatedEmployee.name || ""} (${bank.updatedEmployee.empCode || "-"})`
					: "",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Bank Master Data",
					columns: [
						{ label: "Bank ID", value: "Bank_ID" },
						{ label: "Bank Name", value: "Bank_Name" },
						{ label: "IFSC Code", value: "IFSC_Code" },
						{ label: "Status", value: "Status" },
						{ label: "Created At", value: "Created_At" },
						{ label: "Created By", value: "Created_By" },
						{ label: "Updated At", value: "Updated_At" },
						{ label: "Updated By", value: "Updated_By" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Bank_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Bank_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}
	async exportDesignationMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"designationId",
					"name",
					"code",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee", // Must match the alias in the association
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee", // Must match the alias in the association
						attributes: ["name", "empCode"],
					},
				],
				order: [["designationId", "ASC"]],
			};

			let designationData = await db.designationMaster.findAll(aggregate);

			let finalData = designationData.map((designation) => ({
				designationId: designation.designationId,
				name: designation.name,
				code: designation.code,
				status: designation.isActive ? "Active" : "Inactive",
				createdAt: designation.createdAt
					? moment(designation.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: designation.updatedAt
					? moment(designation.updatedAt).format("DD-MM-YYYY")
					: "",
				createddBy: designation.createdEmployee
					? `${designation.createdEmployee.name || ""} (${designation.createdEmployee.empCode || "-"})`
					: "",
				updatedBy: designation.updatedEmployee
					? `${designation.updatedEmployee.name || ""} (${designation.updatedEmployee.empCode || "-"})`
					: "",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Designation Master Data",
					columns: [
						{ label: "Designation ID", value: "designationId" },
						{ label: "Designation Name", value: "name" },
						{ label: "Designation Code", value: "code" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Designation_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Designation_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}
	async exportDepartmentMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"departmentId",
					"departmentName",
					"departmentCode",
					"parentDepartmentId",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.departmentMaster,
						as: "parentDepartment",
						attributes: ["departmentName", "departmentCode"],
					},
					{
						model: db.departmentMapping,
						include: [
							{
								model: db.sbuMapping,
								include: [
									{
										model: db.sbuMaster,
										attributes: ["sbuName", "code"],
									},
									{
										model: db.buMapping,

										include: [
											{
												model: db.buMaster,

												attributes: ["buName", "buCode"],
											},
											{
												model: db.companyMaster,

												attributes: ["companyName", "companyCode"],
											},
										],
									},
								],
							},
						],
					},
				],
				order: [["departmentId", "ASC"]],
			};

			let departmentData = await db.departmentMaster.findAll(aggregate);
			//console.log(JSON.stringify(departmentData, null, 2));
			let finalData = departmentData.map((department) => ({
				departmentId: department.departmentId,
				name: department.departmentName,
				code: department.departmentCode,
				parentDepartment: department.parentDepartment
					? `${department.parentDepartment.departmentName} (${department.parentDepartment.departmentCode})`
					: "-",
				sbu: department.departmentmapping?.sbumapping?.sbumaster
					? `${department.departmentmapping.sbumapping.sbumaster.sbuName} (${department.departmentmapping.sbumapping.sbumaster.code || "-"})`
					: "-",
				bu: department.departmentmapping?.sbumapping?.bumapping?.bumaster
					? `${department.departmentmapping.sbumapping.bumapping.bumaster.buName} (${department.departmentmapping.sbumapping.bumapping.bumaster.buCode || "-"})`
					: "-",
				company: department.departmentmapping?.sbumapping?.bumapping
					?.companymaster
					? `${department.departmentmapping.sbumapping.bumapping.companymaster.companyName} (${department.departmentmapping.sbumapping.bumapping.companymaster.companyCode || "-"})`
					: "-",
				status: department.isActive ? "Active" : "Inactive",
				createdAt: department.createdAt
					? moment(department.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: department.updatedAt
					? moment(department.updatedAt).format("DD-MM-YYYY")
					: "",
				createddBy: department.createdEmployee
					? `${department.createdEmployee.name || ""} (${department.createdEmployee.empCode || "-"})`
					: "",
				updatedBy: department.updatedEmployee
					? `${department.updatedEmployee.name || ""} (${department.updatedEmployee.empCode || "-"})`
					: "",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Department Master Data",
					columns: [
						{ label: "Department ID", value: "departmentId" },
						{ label: "Department Name", value: "name" },
						{ label: "Department Code", value: "code" },
						{ label: "Parent Department", value: "parentDepartment" },
						{ label: "SBU", value: "sbu" },
						{ label: "BU", value: "bu" },
						{ label: "Company", value: "company" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Department_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Department_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}
	async exportFunctionalAreaMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"functionalAreaId",
					"functionalAreaName",
					"functionalAreaCode",
					"parentFunctionalAreaId",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.functionalAreaMaster,
						as: "parentFunctionalAreaRef",
						attributes: ["functionalAreaName", "functionalAreaCode"],
					},
					{
						model: db.functionalAreaMapping,
						include: [
							{
								model: db.departmentMapping,

								include: [
									{
										model: db.sbuMapping,
										include: [
											{
												model: db.sbuMaster,
												attributes: ["sbuName", "code"],
											},
											{
												model: db.buMapping,

												include: [
													{
														model: db.buMaster,

														attributes: ["buName", "buCode"],
													},
													{
														model: db.companyMaster,

														attributes: ["companyName", "companyCode"],
													},
												],
											},
										],
									},
									{
										model: db.departmentMaster,
										attributes: ["departmentName", "departmentCode"],
									},
								],
							},
						],
					},
				],
				order: [["functionalAreaId", "ASC"]],
			};

			let functionalAreaData = await db.functionalAreaMaster.findAll(aggregate);
			//console.log(JSON.stringify(functionalAreaData, null, 2));
			let finalData = functionalAreaData.map((functionalArea) => ({
				functionalAreaId: functionalArea.functionalAreaId,
				name: functionalArea.functionalAreaName,
				code: functionalArea.functionalAreaCode,
				parentFunctionalArea: functionalArea.parentFunctionalAreaRef
					? `${functionalArea.parentFunctionalAreaRef.functionalAreaName} (${functionalArea.parentFunctionalAreaRef.functionalAreaCode})`
					: "-",

				department: functionalArea.functionalareamapping?.departmentmapping
					?.departmentmaster
					? `${functionalArea.functionalareamapping.departmentmapping.departmentmaster.departmentName} (${functionalArea.functionalareamapping.departmentmapping.departmentmaster.departmentCode || "-"})`
					: "-",

				sbu: functionalArea.functionalareamapping?.departmentmapping?.sbumapping
					?.sbumaster
					? `${functionalArea.functionalareamapping.departmentmapping.sbumapping.sbumaster.sbuName} (${functionalArea.functionalareamapping.departmentmapping.sbumapping.sbumaster.code || "-"})`
					: "-",

				bu: functionalArea.functionalareamapping?.departmentmapping?.sbumapping
					?.bumapping?.bumaster
					? `${functionalArea.functionalareamapping.departmentmapping.sbumapping.bumapping.bumaster.buName} (${functionalArea.functionalareamapping.departmentmapping.sbumapping.bumapping.bumaster.buCode || "-"})`
					: "-",

				company: functionalArea.functionalareamapping?.departmentmapping
					?.sbumapping?.bumapping?.companymaster
					? `${functionalArea.functionalareamapping.departmentmapping.sbumapping.bumapping.companymaster.companyName} (${functionalArea.functionalareamapping.departmentmapping.sbumapping.bumapping.companymaster.companyCode || "-"})`
					: "-",
				status: functionalArea.isActive ? "Active" : "Inactive",
				createdAt: functionalArea.createdAt
					? moment(functionalArea.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: functionalArea.updatedAt
					? moment(functionalArea.updatedAt).format("DD-MM-YYYY")
					: "",
				createddBy: functionalArea.createdEmployee
					? `${functionalArea.createdEmployee.name || ""} (${functionalArea.createdEmployee.empCode || "-"})`
					: "",
				updatedBy: functionalArea.updatedEmployee
					? `${functionalArea.updatedEmployee.name || ""} (${functionalArea.updatedEmployee.empCode || "-"})`
					: "",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Functional Area Master Data",
					columns: [
						{ label: "FunctionalArea ID", value: "functionalAreaId" },
						{ label: "FunctionalArea Name", value: "name" },
						{ label: "FunctionalArea Code", value: "code" },
						{ label: "Parent FunctionalArea", value: "parentFunctionalArea" },
						{ label: "Department", value: "department" },
						{ label: "SBU", value: "sbu" },
						{ label: "BU", value: "bu" },
						{ label: "Company", value: "company" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `FunctionalArea_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`FunctionalArea_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}

	async exportJobLevelMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"jobLevelId",
					"jobLevelName",
					"jobLevelCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.jobLevelMapping, // Join jobLevelMapping
						include: [
							{
								model: db.companyMaster, // Join companyMaster through jobLevelMapping
								attributes: ["companyName", "companyCode"],
							},
							{
								model: db.bandMaster, // Join bandMaster through jobLevelMapping
								attributes: ["bandCode"],
							},
							{
								model: db.gradeMaster, // Join gradeMaster through jobLevelMapping
								attributes: ["gradeName", "gradeCode"],
							},
						],
					},
				],
				order: [["jobLevelId", "ASC"]],
			};

			let jobLevelData = await db.jobLevelMaster.findAll(aggregate);
			// console.log(JSON.stringify(jobLevelData, null, 2));

			let finalData = jobLevelData.map((jobLevel) => ({
				jobLevelId: jobLevel.jobLevelId,
				name: jobLevel.jobLevelName,
				code: jobLevel.jobLevelCode,
				company: jobLevel.joblevelmapping?.companymaster
					? `${jobLevel.joblevelmapping.companymaster.companyName} (${jobLevel.joblevelmapping.companymaster.companyCode || "-"})`
					: "-",
				band: jobLevel.joblevelmapping?.bandmaster
					? jobLevel.joblevelmapping.bandmaster.bandCode || "-"
					: "-",
				grade: jobLevel.joblevelmapping?.grademaster
					? `${jobLevel.joblevelmapping.grademaster.gradeName}`
					: "-",
				status: jobLevel.isActive ? "Active" : "Inactive",
				createdAt: jobLevel.createdAt
					? moment(jobLevel.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: jobLevel.updatedAt
					? moment(jobLevel.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: jobLevel.createdEmployee
					? `${jobLevel.createdEmployee.name || ""} (${jobLevel.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: jobLevel.updatedEmployee
					? `${jobLevel.updatedEmployee.name || ""} (${jobLevel.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "JobLevel Master Data",
					columns: [
						{ label: "JobLevel ID", value: "jobLevelId" },
						{ label: "JobLevel Name", value: "name" },
						{ label: "JobLevel Code", value: "code" },
						{ label: "Grade", value: "grade" },
						{ label: "Band", value: "band" },
						{ label: "Company", value: "company" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `JobLevel_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`JobLevel_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}

	async exportCompanyMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"companyId",
					"companyName",
					"companyCode",
					"groupId",
					"currencyId",
					"timeZoneId",
					"headerColor",
					"senderEmail",
					"letterHeader",
					"letterFooter",
					"finacialYearBegin",
					"industryId",
					"siteUrl",
					"companyTypeId",
					"dateOfIncorporation",
					"panNo",
					"tanNo",
					"vatRegNo",
					"cstRegNo",
					"pfRegNo",
					"gstNo",
					"esiRegNo",
					"companyLogo",
					"officialMail",
					"createdAt",
					"updatedAt",
					"isActive",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.groupCompanyMaster,
						attributes: ["groupName", "groupCode"],
					},
					{
						model: db.currencyMaster,
						attributes: ["currencyName", "currencyCode"],
					},
					{
						model: db.timeZoneMaster,
						attributes: ["timezoneCode"],
					},
					{
						model: db.industryMaster,
						attributes: ["industryName"],
					},
					{
						model: db.companyTypeMaster,
						attributes: ["typeName"],
					},
				],
				order: [["companyId", "ASC"]],
			};

			let companyMasterData = await db.companyMaster.findAll(aggregate);
			//console.log(JSON.stringify(companyMasterData, null, 2));

			let finalData = companyMasterData.map((company) => ({
				companyId: company.companyId,
				companyName: company.companyName,
				companyCode: company.companyCode,
				groupId: company.groupcompanymaster?.groupName,
				currencyId: company.currencymaster?.currencyName,
				timeZoneId: company.timezonemaster?.timezoneCode,
				headerColor: company.headerColor || "-",
				senderEmail: company.senderEmail || "-",
				letterHeader: company.letterHeader || "-",
				letterFooter: company.letterFooter || "-",
				finacialYearBegin: company.finacialYearBegin || "-",
				industryId: company.industrymaster?.industryName || "-",
				siteUrl: company.siteUrl || "-",
				companyTypeId: company.companyTypeId,
				dateOfIncorporation: company.dateOfIncorporation
					? moment(company.dateOfIncorporation).format("DD-MM-YYYY")
					: "-",
				panNo: company.panNo || "-",
				tanNo: company.tanNo || "-",
				vatRegNo: company.vatRegNo || "-",
				cstRegNo: company.cstRegNo || "-",
				pfRegNo: company.pfRegNo || "-",
				gstNo: company.gstNo || "-",
				esiRegNo: company.esiRegNo || "-",
				companyLogo: company.companyLogo || "-",
				officialMail: company.officialMail || "-",
				isActive: company.isActive ? "Active" : "Inactive",
				createdAt: company.createdAt
					? moment(company.createdAt).format("DD-MM-YYYY")
					: "-",
				updatedAt: company.updatedAt
					? moment(company.updatedAt).format("DD-MM-YYYY")
					: "-",
				createdBy: company.createdEmployee
					? `${company.createdEmployee.name} (${company.createdEmployee.empCode})`
					: "-",
				updatedBy: company.updatedEmployee
					? `${company.updatedEmployee.name} (${company.updatedEmployee.empCode})`
					: "-",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Company Master Data",
					columns: [
						{ label: "Company ID", value: "companyId" },
						{ label: "Company Name", value: "companyName" },
						{ label: "Company Code", value: "companyCode" },
						{ label: "Group ID", value: "groupId" },
						{ label: "Currency ID", value: "currencyId" },
						{ label: "Time Zone ID", value: "timeZoneId" },
						{ label: "Header Color", value: "headerColor" },
						{ label: "Sender Email", value: "senderEmail" },
						{ label: "Letter Header", value: "letterHeader" },
						{ label: "Letter Footer", value: "letterFooter" },
						{ label: "Financial Year Begin", value: "finacialYearBegin" },
						{ label: "Industry ID", value: "industryId" },
						{ label: "Site URL", value: "siteUrl" },
						{ label: "Company Type ID", value: "companyTypeId" },
						{ label: "Date of Incorporation", value: "dateOfIncorporation" },
						{ label: "PAN No", value: "panNo" },
						{ label: "TAN No", value: "tanNo" },
						{ label: "VAT Reg No", value: "vatRegNo" },
						{ label: "CST Reg No", value: "cstRegNo" },
						{ label: "PF Reg No", value: "pfRegNo" },
						{ label: "GST No", value: "gstNo" },
						{ label: "ESI Reg No", value: "esiRegNo" },
						{ label: "Company Logo", value: "companyLogo" },
						{ label: "Official Mail", value: "officialMail" },
						{ label: "Status", value: "isActive" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Company_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Company_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}

	async exportCompanyTypeMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"companyTypeId",
					"typeName",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["companyTypeId", "ASC"]],
			};

			let companyTypeMasterData = await db.companyTypeMaster.findAll(aggregate);
			// console.log(JSON.stringify(jobLevelData, null, 2));

			let finalData = companyTypeMasterData.map((companyType) => ({
				companyTypeId: companyType.companyTypeId,
				name: companyType.typeName,
				status: companyType.isActive ? "Active" : "Inactive",
				createdAt: companyType.createdAt
					? moment(companyType.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: companyType.updatedAt
					? moment(companyType.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: companyType.createdEmployee
					? `${companyType.createdEmployee.name || ""} (${companyType.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: companyType.updatedEmployee
					? `${companyType.updatedEmployee.name || ""} (${companyType.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "CompanyType Master Data",
					columns: [
						{ label: "Company Type ID", value: "companyTypeId" },
						{ label: "Company Type Name", value: "name" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `CompanyType_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`CompanyType_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}
	async exportBandMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"bandId",
					"bandCode",
					"bandDesc",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["bandId", "ASC"]],
			};

			let bandMasterData = await db.bandMaster.findAll(aggregate);
			// console.log(JSON.stringify(jobLevelData, null, 2));

			let finalData = bandMasterData.map((data) => ({
				bandId: data.bandId,
				bandCode: data.bandCode,
				bandDesc: data.bandDesc,
				status: data.isActive ? "Active" : "Inactive",
				createdAt: data.createdAt
					? moment(data.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: data.updatedAt
					? moment(data.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: data.createdEmployee
					? `${data.createdEmployee.name || ""} (${data.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: data.updatedEmployee
					? `${data.updatedEmployee.name || ""} (${data.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Band Master Data",
					columns: [
						{ label: "Band ID", value: "bandId" },
						{ label: "Band Code", value: "bandCode" },
						{ label: "Band Desc", value: "bandDesc" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Band_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Band_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}

	async exportGradeMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"gradeId",
					"gradeName",
					"gradeCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["gradeId", "ASC"]],
			};

			let gradeMasterData = await db.gradeMaster.findAll(aggregate);
			// console.log(JSON.stringify(jobLevelData, null, 2));

			let finalData = gradeMasterData.map((data) => ({
				gradeId: data.gradeId,
				gradeName: data.gradeName,
				gradeCode: data.gradeCode,
				status: data.isActive ? "Active" : "Inactive",
				createdAt: data.createdAt
					? moment(data.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: data.updatedAt
					? moment(data.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: data.createdEmployee
					? `${data.createdEmployee.name || ""} (${data.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: data.updatedEmployee
					? `${data.updatedEmployee.name || ""} (${data.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "Grade Master Data",
					columns: [
						{ label: "Grade ID", value: "gradeId" },
						{ label: "Grade Name", value: "gradeName" },
						{ label: "Grade Code", value: "gradeCode" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Grade_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Grade_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}

	async exportCostCenterMasterData(req, res) {
		try {
			let aggregate = {
				attributes: [
					"costCenterId",
					"costCenterName",
					"costCenterCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						attributes: ["empCode", "name"],
					},
				],
				order: [["costCenterId", "ASC"]],
			};

			let costCenterMasterData = await db.costCenterMaster.findAll(aggregate);
			//console.log(JSON.stringify(costCenterMasterData, null, 2));

			let finalData = costCenterMasterData.map((data) => ({
				costCenterId: data.costCenterId,
				costCenterName: data.costCenterName,
				costCenterCode: data.costCenterCode,
				costCenterHead: data.employee
					? `${data.employee.name || ""} (${data.employee.empCode || "-"})`
					: "-",
				status: data.isActive ? "Active" : "Inactive",
				createdAt: data.createdAt
					? moment(data.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: data.updatedAt
					? moment(data.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: data.createdEmployee
					? `${data.createdEmployee.name || ""} (${data.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: data.updatedEmployee
					? `${data.updatedEmployee.name || ""} (${data.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			const timestamp = moment().format("YYYYMMDD");

			const data = [
				{
					sheet: "CostCenter Master Data",
					columns: [
						{ label: "CostCenter ID", value: "costCenterId" },
						{ label: "CostCenter Name", value: "costCenterName" },
						{ label: "CostCenter Code", value: "costCenterCode" },
						{ label: "CostCenter Head", value: "costCenterHead" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `CostCenter_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = Buffer.from(xlsx(data, settings));

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`CostCenter_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, { status: 500 });
		}
	}

	async exportCompanyLocationMasterData(req, res) {
		try {
			// Define the query to fetch company location data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"companyLocationId",
					"companyLocationCode",
					"companyId",
					"address1",
					"address2",
					"cityId",
					"stateId",
					"countryId",
					"pincodeId",
					"gstNo",
					"phoneNo",
					"mobileNo",
					"isHeadquarter",
					"latitude",
					"longitude",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.cityMaster,
						attributes: ["cityName"],
					},
					{
						model: db.stateMaster,
						attributes: ["stateName"],
					},
					{
						model: db.countryMaster,
						attributes: ["countryName"],
					},
					{
						model: db.pinCodeMaster,
						attributes: ["pincode"],
					},
					{
						model: db.companyMaster,
						as: "companyMaster",
						attributes: ["companyName", "companyCode"],
					},
				],
				order: [["companyLocationId", "ASC"]], // Order by companyLocationId in ascending order
			};

			// Fetch data from the database
			let companyLocationData =
				await db.companyLocationMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = companyLocationData.map((location) => ({
				companyLocationId: location.companyLocationId,
				companyLocationCode: location.companyLocationCode,
				company: location.companyMaster
					? `${location.companyMaster.companyName || ""} (${location.companyMaster.companyCode || "-"})`
					: "-",
				address1: location.address1 || "-",
				address2: location.address2 || "-",
				city: location.citymaster?.cityName || "-",
				state: location.statemaster?.stateName || "-",
				country: location.countrymaster?.countryName || "-",
				pincode: location.pincodemaster?.pincode || "-",
				gstNo: location.gstNo || "-",
				phoneNo: location.phoneNo || "-",
				mobileNo: location.mobileNo || "-",
				isHeadquarter: location.isHeadquarter ? "Yes" : "No",
				latitude: location.latitude || "-",
				longitude: location.longitude || "-",
				status: location.isActive ? "Active" : "Inactive",
				createdAt: location.createdAt
					? moment(location.createdAt).format("DD-MM-YYYY")
					: "-",
				updatedAt: location.updatedAt
					? moment(location.updatedAt).format("DD-MM-YYYY")
					: "-",
				createdBy: location.createdEmployee
					? `${location.createdEmployee.name || ""} (${location.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: location.updatedEmployee
					? `${location.updatedEmployee.name || ""} (${location.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Company Location Master Data",
					columns: [
						{ label: "Company Location ID", value: "companyLocationId" },
						{ label: "Company Location Code", value: "companyLocationCode" },
						{ label: "Company", value: "company" },
						{ label: "Address 1", value: "address1" },
						{ label: "Address 2", value: "address2" },
						{ label: "City", value: "city" },
						{ label: "State", value: "state" },
						{ label: "Country", value: "country" },
						{ label: "Pincode", value: "pincode" },
						{ label: "GST No", value: "gstNo" },
						{ label: "Phone No", value: "phoneNo" },
						{ label: "Mobile No", value: "mobileNo" },
						{ label: "Is Headquarter", value: "isHeadquarter" },
						{ label: "Latitude", value: "latitude" },
						{ label: "Longitude", value: "longitude" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Company_Location_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Company_Location_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting company location master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportDegreeMasterData(req, res) {
		try {
			// Define the query to fetch degree master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"degreeId",
					"degreeName",
					"degreeCode",
					"degreeType",
					"durationInYears",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["degreeId", "ASC"]], // Order by degreeId in ascending order
			};

			// Fetch data from the database
			let degreeMasterData = await db.degreeMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = degreeMasterData.map((degree) => ({
				degreeId: degree.degreeId,
				degreeName: degree.degreeName,
				degreeCode: degree.degreeCode,
				degreeType: degree.degreeType || "-",
				durationInYears: degree.durationInYears || "-",
				status: degree.isActive ? "Active" : "Inactive",
				createdAt: degree.createdAt
					? moment(degree.createdAt).format("DD-MM-YYYY")
					: "-",
				updatedAt: degree.updatedAt
					? moment(degree.updatedAt).format("DD-MM-YYYY")
					: "-",
				createdBy: degree.createdEmployee
					? `${degree.createdEmployee.name || ""} (${degree.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: degree.updatedEmployee
					? `${degree.updatedEmployee.name || ""} (${degree.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Degree Master Data",
					columns: [
						{ label: "Degree ID", value: "degreeId" },
						{ label: "Degree Name", value: "degreeName" },
						{ label: "Degree Code", value: "degreeCode" },
						{ label: "Degree Type", value: "degreeType" },
						{ label: "Duration (Years)", value: "durationInYears" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Degree_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Degree_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting degree master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportHolidayMasterData(req, res) {
		try {
			// Define the query to fetch holiday master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"holidayId",
					"holidayName",
					"holidayDate",
					"isNationalHoliday", // Include isNationalHoliday column
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.holidayCompanyLocationConfiguration,
						attributes: ["companyLocationId"],
						include: [
							{
								model: db.companyLocationMaster,
								as: "companyLocationMaster",
								attributes: ["companyLocationCode"],
								include: [
									{
										model: db.cityMaster,
										attributes: ["cityName"], // Include cityName
									},
									{
										model: db.companyMaster,
										as: "companyMaster",
										attributes: ["companyName", "companyCode"],
									},
								],
							},
						],
					},
				],
				order: [["holidayId", "ASC"]], // Order by holidayId in ascending order
			};

			// Fetch data from the database
			let holidayMasterData = await db.holidayMaster.findAll(aggregate);
			//	console.log(JSON.stringify(holidayMasterData, null, 2));

			// Map the data to the desired format for the Excel sheet
			let finalData = holidayMasterData.map((holiday) => {
				// Use a Set to store unique company names
				const uniqueCompanies = new Set(
					holiday.holidaycompanylocationconfigurations.map((config) => {
						const company = config.companyLocationMaster?.companyMaster;
						return company
							? `${company.companyName} (${company.companyCode || "-"})`
							: "-";
					}),
				);

				// Use a Set to store unique location names and codes
				const uniqueLocations = new Set(
					holiday.holidaycompanylocationconfigurations.map((config) => {
						const location = config.companyLocationMaster;
						const city = location?.citymaster?.cityName || "-";
						return location
							? `${city || "-"} (${location.companyLocationCode})`
							: "-";
					}),
				);

				return {
					holidayId: holiday.holidayId,
					holidayName: holiday.holidayName,
					holidayDate: holiday.holidayDate
						? moment(holiday.holidayDate).format("DD-MM-YYYY")
						: "-",
					isNationalHoliday: holiday.isNationalHoliday ? "Yes" : "No", // Map isNationalHoliday
					company: Array.from(uniqueCompanies).join(", "), // Convert Set to Array and join
					holidayLocations: Array.from(uniqueLocations).join(", "), // Convert Set to Array and join
					status: holiday.isActive ? "Active" : "Inactive",
					createdAt: holiday.createdAt
						? moment(holiday.createdAt).format("DD-MM-YYYY")
						: "-",
					updatedAt: holiday.updatedAt
						? moment(holiday.updatedAt).format("DD-MM-YYYY")
						: "-",
					createdBy: holiday.createdEmployee
						? `${holiday.createdEmployee.name || ""} (${holiday.createdEmployee.empCode || "-"})`
						: "-",
					updatedBy: holiday.updatedEmployee
						? `${holiday.updatedEmployee.name || ""} (${holiday.updatedEmployee.empCode || "-"})`
						: "-",
				};
			});

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Holiday Master Data",
					columns: [
						{ label: "Holiday ID", value: "holidayId" },
						{ label: "Holiday Name", value: "holidayName" },
						{ label: "Holiday Date", value: "holidayDate" },
						{ label: "Is National Holiday", value: "isNationalHoliday" },
						{ label: "Company", value: "company" },
						{ label: "Holiday Locations", value: "holidayLocations" }, // Updated column
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Holiday_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Holiday_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting holiday master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportNewCustomerNameMasterData(req, res) {
		try {
			// Define the query to fetch new customer name master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"newCustomerNameId",
					"newCustomerName",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["newCustomerNameId", "ASC"]], // Order by newCustomerNameId in ascending order
			};

			// Fetch data from the database
			let newCustomerNameMasterData =
				await db.newCustomerNameMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = newCustomerNameMasterData.map((customer) => ({
				newCustomerNameId: customer.newCustomerNameId,
				newCustomerName: customer.newCustomerName,
				status: customer.isActive ? "Active" : "Inactive",
				createdAt: customer.createdAt
					? moment(customer.createdAt).format("DD-MM-YYYY")
					: "-",
				updatedAt: customer.updatedAt
					? moment(customer.updatedAt).format("DD-MM-YYYY")
					: "-",
				createdBy: customer.createdEmployee
					? `${customer.createdEmployee.name || ""} (${customer.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: customer.updatedEmployee
					? `${customer.updatedEmployee.name || ""} (${customer.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "New Customer Name Master Data",
					columns: [
						{ label: "New Customer Name ID", value: "newCustomerNameId" },
						{ label: "New Customer Name", value: "newCustomerName" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `New_Customer_Name_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`New_Customer_Name_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting new customer name master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportBuMasterData(req, res) {
		try {
			// Define the query to fetch BU master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"buId",
					"buName",
					"buCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.buMapping,
						include: [
							{
								model: db.companyMaster,
								attributes: ["companyName", "companyCode"],
							},
							{
								model: db.employeeMaster,
								as: "buHeadData",
								attributes: ["name", "empCode"],
							},
							{
								model: db.employeeMaster,
								as: "buhrData",
								attributes: ["name", "empCode"],
							},
						],
					},
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["buId", "ASC"]], // Order by buId in ascending order
			};

			// Fetch data from the database
			let buMasterData = await db.buMaster.findAll(aggregate);
			//	console.log(JSON.stringify(buMasterData, null, 2));

			// Map the data to the desired format for the Excel sheet
			let finalData = buMasterData.map((bu) => {
				// Extract data from the first mapping in the bumappings array
				const mapping = bu.bumappings?.[0] || {};
				const company = mapping.companymaster
					? `${mapping.companymaster.companyName || ""} (${mapping.companymaster.companyCode || "-"})`
					: "-";
				const head = mapping.buHeadData
					? `${mapping.buHeadData.name || ""} (${mapping.buHeadData.empCode || "-"})`
					: "-";
				const buHr = mapping.buhrData
					? `${mapping.buhrData.name || ""} (${mapping.buhrData.empCode || "-"})`
					: "-";

				return {
					buId: bu.buId,
					buName: bu.buName,
					buCode: bu.buCode,
					company: company,
					head: head,
					buHr: buHr,
					status: bu.isActive ? "Active" : "Inactive",
					createdAt: bu.createdAt
						? moment(bu.createdAt).format("DD-MM-YYYY")
						: "-",
					updatedAt: bu.updatedAt
						? moment(bu.updatedAt).format("DD-MM-YYYY")
						: "-",
					createdBy: bu.createdEmployee
						? `${bu.createdEmployee.name || ""} (${bu.createdEmployee.empCode || "-"})`
						: "-",
					updatedBy: bu.updatedEmployee
						? `${bu.updatedEmployee.name || ""} (${bu.updatedEmployee.empCode || "-"})`
						: "-",
				};
			});

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "BU Master Data",
					columns: [
						{ label: "BU ID", value: "buId" },
						{ label: "BU Name", value: "buName" },
						{ label: "BU Code", value: "buCode" },
						{ label: "Company", value: "company" },
						{ label: "Head", value: "head" },
						{ label: "BU HR", value: "buHr" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `BU_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`BU_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting BU master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportSbuMasterData(req, res) {
		try {
			// Define the query to fetch SBU master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"sbuId",
					"sbuName",
					"code",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.sbuMapping,
						include: [
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
							},
						],
					},
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["sbuId", "ASC"]], // Order by sbuId in ascending order
			};

			// Fetch data from the database
			let sbuMasterData = await db.sbuMaster.findAll(aggregate);
			//	console.log(JSON.stringify(sbuMasterData, null, 2));

			// Map the data to the desired format for the Excel sheet
			let finalData = sbuMasterData.map((sbu) => {
				// Extract data from the first mapping in the sbumappings array
				const mapping = sbu.sbumapping || {};

				const bu = mapping.bumaster
					? `${mapping.bumaster.buName || ""} (${mapping.bumaster.buCode || "-"})`
					: "-";

				return {
					sbuId: sbu.sbuId,
					sbuName: sbu.sbuName,
					sbuCode: sbu.code,

					bu: bu,
					status: sbu.isActive ? "Active" : "Inactive",
					createdAt: sbu.createdAt
						? moment(sbu.createdAt).format("DD-MM-YYYY")
						: "-",
					updatedAt: sbu.updatedAt
						? moment(sbu.updatedAt).format("DD-MM-YYYY")
						: "-",
					createdBy: sbu.createdEmployee
						? `${sbu.createdEmployee.name || ""} (${sbu.createdEmployee.empCode || "-"})`
						: "-",
					updatedBy: sbu.updatedEmployee
						? `${sbu.updatedEmployee.name || ""} (${sbu.updatedEmployee.empCode || "-"})`
						: "-",
				};
			});

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "SBU Master Data",
					columns: [
						{ label: "SBU ID", value: "sbuId" },
						{ label: "SBU Name", value: "sbuName" },
						{ label: "SBU Code", value: "sbuCode" },
						{ label: "BU", value: "bu" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `SBU_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`SBU_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting SBU master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportWeekOffMasterData(req, res) {
		try {
			// Define the query to fetch Week Off master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"weekOffId",
					"weekOffName",
					"nonWorkingDays",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["weekOffId", "ASC"]], // Order by weekOffId in ascending order
			};

			// Fetch data from the database
			let weekOffMasterData = await db.weekOffMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = weekOffMasterData.map((weekOff) => ({
				weekOffId: weekOff.weekOffId,
				weekOffName: weekOff.weekOffName,
				nonWorkingDays: weekOff.nonWorkingDays || "-",
				status: weekOff.isActive ? "Active" : "Inactive",
				createdAt: weekOff.createdAt
					? moment(weekOff.createdAt).format("DD-MM-YYYY")
					: "-",
				updatedAt: weekOff.updatedAt
					? moment(weekOff.updatedAt).format("DD-MM-YYYY")
					: "-",
				createdBy: weekOff.createdEmployee
					? `${weekOff.createdEmployee.name || ""} (${weekOff.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: weekOff.updatedEmployee
					? `${weekOff.updatedEmployee.name || ""} (${weekOff.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Week Off Master Data",
					columns: [
						{ label: "Week Off ID", value: "weekOffId" },
						{ label: "Week Off Name", value: "weekOffName" },
						{ label: "Non-Working Days", value: "nonWorkingDays" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Week_Off_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Week_Off_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting Week Off master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportShiftMasterData(req, res) {
		try {
			// Define the query to fetch Shift master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"shiftId",
					"shiftName",
					"shiftStartTime",
					"shiftEndTime",
					"shiftRemark",
					"isOverNight",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["shiftId", "ASC"]], // Order by shiftId in ascending order
			};

			// Fetch data from the database
			let shiftMasterData = await db.shiftMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = shiftMasterData.map((shift) => ({
				shiftId: shift.shiftId,
				shiftName: shift.shiftName,
				shiftStartTime: shift.shiftStartTime || "-",
				shiftEndTime: shift.shiftEndTime || "-",
				shiftRemark: shift.shiftRemark || "-",
				isOverNight: shift.isOverNight ? "Yes" : "No",
				status: shift.isActive ? "Active" : "Inactive",
				createdAt: shift.createdAt
					? moment(shift.createdAt).format("DD-MM-YYYY")
					: "-",
				updatedAt: shift.updatedAt
					? moment(shift.updatedAt).format("DD-MM-YYYY")
					: "-",
				createdBy: shift.createdEmployee
					? `${shift.createdEmployee.name || ""} (${shift.createdEmployee.empCode || "-"})`
					: "-",
				updatedBy: shift.updatedEmployee
					? `${shift.updatedEmployee.name || ""} (${shift.updatedEmployee.empCode || "-"})`
					: "-",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Shift Master Data",
					columns: [
						{ label: "Shift ID", value: "shiftId" },
						{ label: "Shift Name", value: "shiftName" },
						{ label: "Shift Start Time", value: "shiftStartTime" },
						{ label: "Shift End Time", value: "shiftEndTime" },
						{ label: "Shift Remark", value: "shiftRemark" },
						{ label: "Is Overnight", value: "isOverNight" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Shift_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Shift_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting Shift master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	async exportAttendancePolicyMasterData(req, res) {
		try {
			// Define the query to fetch Attendance Policy master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"attendancePolicyId",
					"policyName",
					"policyCode",
					"policyDescription",
					"requestLimit",
					"allowRequestFromHome",
					"allowRequestFromDuty",
					"graceTimeClockIn",
					"graceTimeClockOut",
					"allowBufferTime",
					"bufferTimePre",
					"bufferTimePost",
					"isleaveDeductPolicyLateDuration",
					"leaveDeductPolicyLateDurationHalfDayTime",
					"leaveDeductPolicyLateDurationFullDayTime",
					"leaveDeductPolicyLateDurationLeaveType",
					"isleaveDeductPolicyWorkDuration",
					"leaveDeductPolicyWorkDurationHalfDayTime",
					"leaveDeductPolicyWorkDurationFullDayTime",
					"leaveDeductPolicyWorkDurationLeaveType",
					"attendaceRosterLimitForPreviousDays",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["attendancePolicyId", "ASC"]], // Order by attendancePolicyId in ascending order
			};

			// Fetch data from the database
			let attendancePolicyMasterData =
				await db.attendancePolicymaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = attendancePolicyMasterData.map((policy) => ({
				attendancePolicyId: policy.attendancePolicyId,
				policyName: policy.policyName,
				policyCode: policy.policyCode ?? "",
				policyDescription: policy.policyDescription ?? "",
				requestLimit: policy.requestLimit ?? "",
				allowRequestFromHome: policy.allowRequestFromHome ? "Yes" : "No",
				allowRequestFromDuty: policy.allowRequestFromDuty ? "Yes" : "No",
				graceTimeClockIn: policy.graceTimeClockIn ?? "",
				graceTimeClockOut: policy.graceTimeClockOut ?? "",
				allowBufferTime: policy.allowBufferTime ? "Yes" : "No",
				bufferTimePre: policy.bufferTimePre ?? "",
				bufferTimePost: policy.bufferTimePost ?? "",
				isleaveDeductPolicyLateDuration: policy.isleaveDeductPolicyLateDuration
					? "Yes"
					: "No",
				leaveDeductPolicyLateDurationHalfDayTime:
					policy.leaveDeductPolicyLateDurationHalfDayTime ?? "",
				leaveDeductPolicyLateDurationFullDayTime:
					policy.leaveDeductPolicyLateDurationFullDayTime ?? "",
				leaveDeductPolicyLateDurationLeaveType:
					policy.leaveDeductPolicyLateDurationLeaveType ?? "",
				isleaveDeductPolicyWorkDuration: policy.isleaveDeductPolicyWorkDuration
					? "Yes"
					: "No",
				leaveDeductPolicyWorkDurationHalfDayTime:
					policy.leaveDeductPolicyWorkDurationHalfDayTime ?? "",
				leaveDeductPolicyWorkDurationFullDayTime:
					policy.leaveDeductPolicyWorkDurationFullDayTime ?? "",
				leaveDeductPolicyWorkDurationLeaveType:
					policy.leaveDeductPolicyWorkDurationLeaveType ?? "",
				attendaceRosterLimitForPreviousDays:
					policy.attendaceRosterLimitForPreviousDays ?? "",
				status: policy.isActive ? "Active" : "Inactive",
				createdAt: policy.createdAt
					? moment(policy.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: policy.updatedAt
					? moment(policy.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: policy.createdEmployee
					? `${policy.createdEmployee.name || ""} (${policy.createdEmployee.empCode || ""})`
					: "",
				updatedBy: policy.updatedEmployee
					? `${policy.updatedEmployee.name || ""} (${policy.updatedEmployee.empCode || ""})`
					: "",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Attendance Policy Master Data",
					columns: [
						{ label: "Attendance Policy ID", value: "attendancePolicyId" },
						{ label: "Policy Name", value: "policyName" },
						{ label: "Policy Code", value: "policyCode" },
						{ label: "Policy Description", value: "policyDescription" },
						{ label: "Request Limit", value: "requestLimit" },
						{ label: "Allow Request From Home", value: "allowRequestFromHome" },
						{ label: "Allow Request From Duty", value: "allowRequestFromDuty" },
						{ label: "Grace Time Clock In", value: "graceTimeClockIn" },
						{ label: "Grace Time Clock Out", value: "graceTimeClockOut" },
						{ label: "Allow Buffer Time", value: "allowBufferTime" },
						{ label: "Buffer Time Pre", value: "bufferTimePre" },
						{ label: "Buffer Time Post", value: "bufferTimePost" },
						{
							label: "Is Leave Deduct Policy Late Duration",
							value: "isleaveDeductPolicyLateDuration",
						},
						{
							label: "Late Duration Half Day Time",
							value: "leaveDeductPolicyLateDurationHalfDayTime",
						},
						{
							label: "Late Duration Full Day Time",
							value: "leaveDeductPolicyLateDurationFullDayTime",
						},
						{
							label: "Late Duration Leave Type",
							value: "leaveDeductPolicyLateDurationLeaveType",
						},
						{
							label: "Is Leave Deduct Policy Work Duration",
							value: "isleaveDeductPolicyWorkDuration",
						},
						{
							label: "Work Duration Half Day Time",
							value: "leaveDeductPolicyWorkDurationHalfDayTime",
						},
						{
							label: "Work Duration Full Day Time",
							value: "leaveDeductPolicyWorkDurationFullDayTime",
						},
						{
							label: "Work Duration Leave Type",
							value: "leaveDeductPolicyWorkDurationLeaveType",
						},
						{
							label: "Attendance Roster Limit For Previous Days",
							value: "attendaceRosterLimitForPreviousDays",
						},
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Attendance_Policy_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Attendance_Policy_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting Attendance Policy master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}

	async exportLeaveMasterData(req, res) {
		try {
			// Define the query to fetch Leave master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"leaveId",
					"leaveName",
					"leaveCode",
					"isActive",
					"createdAt",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["leaveId", "ASC"]], // Order by leaveId in ascending order
			};

			// Fetch data from the database
			let leaveMasterData = await db.leaveMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = leaveMasterData.map((leave) => ({
				leaveId: leave.leaveId,
				leaveName: leave.leaveName,
				leaveCode: leave.leaveCode || "",
				status: leave.isActive ? "Active" : "Inactive",
				createdAt: leave.createdAt
					? moment(leave.createdAt).format("DD-MM-YYYY")
					: "",
				updatedAt: leave.updatedAt
					? moment(leave.updatedAt).format("DD-MM-YYYY")
					: "",
				createdBy: leave.createdEmployee
					? `${leave.createdEmployee.name || ""} (${leave.createdEmployee.empCode || ""})`
					: "",
				updatedBy: leave.updatedEmployee
					? `${leave.updatedEmployee.name || ""} (${leave.updatedEmployee.empCode || ""})`
					: "",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Leave Master Data",
					columns: [
						{ label: "Leave ID", value: "leaveId" },
						{ label: "Leave Name", value: "leaveName" },
						{ label: "Leave Code", value: "leaveCode" },
						{ label: "Status", value: "status" },
						{ label: "Created At", value: "createdAt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated At", value: "updatedAt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Leave_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Leave_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting Leave master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}

	async exportNoticePeriodMasterData(req, res) {
		try {
			// Define the query to fetch Notice Period master data with necessary attributes and associations
			let aggregate = {
				attributes: [
					"noticePeriodAutoId",
					"noticePeriodName",
					"noticePeriodCode",
					"nPDaysAfterConfirmation",
					"nPDaysInProbation",
					"createdDt",
					"createdBy",
					"updatedDt",
					"updatedBy",
					"isActive",
				],
				include: [
					{
						model: db.employeeMaster,
						as: "createdEmployee",
						attributes: ["name", "empCode"],
					},
					{
						model: db.employeeMaster,
						as: "updatedEmployee",
						attributes: ["name", "empCode"],
					},
				],
				order: [["noticePeriodAutoId", "ASC"]], // Order by noticePeriodAutoId in ascending order
			};

			// Fetch data from the database
			let noticePeriodMasterData =
				await db.noticePeriodMaster.findAll(aggregate);

			// Map the data to the desired format for the Excel sheet
			let finalData = noticePeriodMasterData.map((noticePeriod) => ({
				noticePeriodAutoId: noticePeriod.noticePeriodAutoId,
				noticePeriodName: noticePeriod.noticePeriodName || "",
				noticePeriodCode: noticePeriod.noticePeriodCode || "",
				nPDaysAfterConfirmation: noticePeriod.nPDaysAfterConfirmation || "",
				nPDaysInProbation: noticePeriod.nPDaysInProbation || "",
				status: noticePeriod.isActive ? "Active" : "Inactive",
				createdDt: noticePeriod.createdDt
					? moment(noticePeriod.createdDt).format("DD-MM-YYYY")
					: "",
				updatedDt: noticePeriod.updatedDt
					? moment(noticePeriod.updatedDt).format("DD-MM-YYYY")
					: "",
				createdBy: noticePeriod.createdEmployee
					? `${noticePeriod.createdEmployee.name || ""} (${noticePeriod.createdEmployee.empCode || ""})`
					: "",
				updatedBy: noticePeriod.updatedEmployee
					? `${noticePeriod.updatedEmployee.name || ""} (${noticePeriod.updatedEmployee.empCode || ""})`
					: "",
			}));

			// Generate a timestamp for the file name
			const timestamp = moment().format("YYYYMMDD");

			// Define the structure of the Excel sheet
			const data = [
				{
					sheet: "Notice Period Master Data",
					columns: [
						{ label: "Notice Period ID", value: "noticePeriodAutoId" },
						{ label: "Notice Period Name", value: "noticePeriodName" },
						{ label: "Notice Period Code", value: "noticePeriodCode" },
						{
							label: "NP Days After Confirmation",
							value: "nPDaysAfterConfirmation",
						},
						{ label: "NP Days In Probation", value: "nPDaysInProbation" },
						{ label: "Status", value: "status" },
						{ label: "Created Date", value: "createdDt" },
						{ label: "Created By", value: "createdBy" },
						{ label: "Updated Date", value: "updatedDt" },
						{ label: "Updated By", value: "updatedBy" },
					],
					content: finalData,
				},
			];

			// Define settings for the Excel file
			const settings = {
				fileName: `Notice_Period_Master_Data_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			// Generate the Excel file
			const report = Buffer.from(xlsx(data, settings));

			// Set headers and send the file as a response
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			);
			res.attachment(`Notice_Period_Master_Data_${timestamp}.xlsx`);
			res.end(report);
		} catch (error) {
			// Log the error and send a 500 response
			console.error("Error exporting Notice Period master data:", error);
			return respHelper(res, { status: 500, message: "Internal Server Error" });
		}
	}
	//ritak export master data end

	// close class
}

export default new CommonController();
