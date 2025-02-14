import db from "../../../../config/db.config.js";
import validator from "../../../../helper/adminValidator.js";
import logger from "../../../../helper/logger.js";
import respHelper from "../../../../helper/respHelper.js";
import service from "./master.service.js";
import Pagination from "../../../../helper/pagination.js";
import { Op } from "sequelize";
import moment from "moment";
import helper from "../../../../helper/helper.js";
import constant from "../../../../constant/messages.js";

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
				...(search && { bandCode: { [Op.like]: `%${search}%` } }),
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
				...(search && { jobLevelName: { [Op.like]: `%${search}%` } }),
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
			let model = db.jobLevelMaster;
			let query = { jobLevelId: req.params.id };
			let updateMetaData = { isDeleted: 1 };
			let moduleName = "Job Level";
			console.log(query);
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
				...(search && { bankName: { [Op.like]: `%${search}%` } }),
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
			console.log(response, "response---");
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
			console.log("");
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
			console.log("");
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
			console.log("");
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
			console.log(result, "result");

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
			console.log("");
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
			console.log("");
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
				...(search && { departmentName: { [Op.like]: `%${search}%` } }),
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
				...(search && { functionalAreaName: { [Op.like]: `%${search}%` } }),
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
				attributes: ["jobLevelMappingId"],
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
				attributes: ["departmentMappingId"],
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
				attributes: ["functionalAreaMappingId"],
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
			let isExist = await service.details(db.jobDetails, findQuery);
			if (isExist.status == 200) {
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

						if(result1[j]?.lwfMappingId) {

							let isFindQuery = {
								[Op.and]: [
								  { lwfDesignationId: { [Op.not]: lwfmappings[i]?.lwfDesignationId } },
								  { stateId: { [Op.not]: result1[j]?.stateId } }
								]
							  };
	
							let response = await service.details(model, isFindQuery);
							if(response.status === 200) {
								return respHelper(res, {
									status: 400,
									msg: constant.ALREADY_EXISTS.replace("<module>", "LWF"),
									data: {},
								});
							}
							else {
								let updateObj = {
									...result1[j],
									lwfDesignationId: lwfmappings[i]?.lwfDesignationId,
									updatedBy: req.userId,
									updatedAt: moment().format("YYYY-MM-DD")
								}
								
								await db.lwfMapping.update(updateObj, { where: { lwfMappingId: result1[j].lwfMappingId } });
							}
						}
						else {
							let response = await service.details(model, query);
							if(response.status === 200) {
								return respHelper(res, {
									status: 400,
									msg: constant.ALREADY_EXISTS.replace("<module>", "LWF"),
									data: {},
								});
							}
							else {
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
			}
			else {
				return respHelper(res, {
					status: 400,
					msg: "Bad request"
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
				...(search && { stateName: { [Op.like]: `%${search}%` } })
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
						}
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
				lwfmappings: groupByLwfDesignationId
			};

			return respHelper(res, { status: response.status, msg: response.message, data: allData });
		} catch (error) {
			logger.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// End admin master apis by jay

	// close class
}

export default new CommonController();
