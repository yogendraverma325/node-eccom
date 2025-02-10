import { Op } from "sequelize";
import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import client from "../../../config/redisDb.config.js";
import Pagination from "../../../helper/pagination.js";
import logger from "../../../helper/logger.js";
import validator from "../../../helper/validator.js";
import moment from "moment";

class MasterController {
	async employee(req, res) {
		try {
			const { filterValue, filterType, searchId } = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			const status = parseInt(req.query.status);

			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			let employeeData = [];

			if (usersData.role_id == 4) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role

				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			}

			let designation = null,
				department = null,
				buSearch = null,
				sbuSearch = null,
				areaSearch = null,
				search = null;
			switch (filterType) {
				case "search":
					search = filterValue;
					break;
				case "designation":
					designation = filterValue;
					break;
				case "department":
					department = filterValue;
					break;
				case "buSearch":
					buSearch = filterValue;
					break;
				case "sbuSearch":
					sbuSearch = filterValue;
					break;
				case "areaSearch":
					areaSearch = filterValue;
					break;
			}

			let searchCondition = {};

			if (searchId) {
				searchCondition = { id: searchId };
			}

			if (search) {
				searchCondition = {
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
				};
			}

			employeeData = await db.employeeMaster.findAndCountAll({
				order: [["id", "desc"]],
				limit,
				offset,
				where: Object.assign(
					searchCondition,
					!Number.isNaN(status)
						? {
								isActive: status,
							}
						: {},
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
					"isLoginActive",
					"requiredAttendanceApproval",
					"sbuId",
					"isActive",
				],
				include: [
					{
						model: db.designationMaster,
						seperate: true,
						required: false,
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
						required: false,
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
						required: false,
						attributes: ["buName", "buCode"],
						where: {
							...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
							...buFIlter,
						},
					},
					{
						model: db.sbuMaster,
						seperate: true,
						required: false,
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
						required: false,
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
						required: false,
						attributes: ["address1", "address2"],
					},
				],
			});

			// const employeeJson = JSON.stringify(employeeData);
			// await client.setEx(cacheKey, parseInt(process.env.TTL), employeeJson); // Cache for 2.3 minutes

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

	async reporties(req, res) {
		try {
			const manager = req.query.manager;

			const reportie = await db.employeeMaster.findOne({
				where: Object.assign(
					manager
						? {
								id: manager,
								isActive: 1,
							}
						: {
								manager: null,
								isActive: 1,
							},
				),
				attributes: { exclude: ["password", "role_id", "designation_id"] },
				include: [
					{
						model: db.employeeMaster,
						required: false,
						attributes: ["id", "name", "profileImage"],
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
						attributes: { exclude: ["password", "role_id", "designation_id"] },
						where: { isActive: 1 },
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
				],
			});

			if (reportie) {
				for (const iterator of reportie.dataValues.reportie) {
					const reportie = await db.employeeMaster.findOne({
						where: {
							manager: iterator.dataValues.id,
						},
					});
					iterator.dataValues["reportings"] = reportie ? true : false;
				}
			}

			return respHelper(res, {
				status: 200,
				data: reportie,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async band(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const bandData = await db.bandMaster.findAndCountAll({
				// limit,
				// offset,
			});

			return respHelper(res, {
				status: 200,
				data: bandData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	// async bu(req, res) {
	// 	try {
	// 		const companyId = req.query.companyId;
	// 		let query = {
	// 			...(companyId && { companyId: companyId }), // Apply companyId filter only if it's provided

	// 			...(req.userData.role_id == 4 && { buHrId: req.userId }),
	// 		};
	// 		let subQuery = { isActive: 1 };
	// 		const buData = await db.buMapping.findAll({
	// 			where: query,
	// 			include: [
	// 				{
	// 					model: db.buMaster,
	// 					where: subQuery,
	// 					attributes: ["buId", "buName", "buCode"],
	// 				},
	// 			],
	// 		});

	// 		return respHelper(res, {
	// 			status: 200,
	// 			data: buData,
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error while getting bu list", error);
	// 		return respHelper(res, {
	// 			status: 500,
	// 		});
	// 	}
	// }
	async bu(req, res) {
		try {
			const { search, filterType, filterValue } = req.query;
			let buSearch = "";

			if (filterType == "buSearch") {
				buSearch = filterValue;
			}
			const isActive = req.query.isActive || 1;
			let buFIlter = {};
			const usersData = req.userData;

			const activeQuery = { isActive: isActive };

			if (usersData.role_id == 4) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role

				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}
			}
			const companyId = req.query.companyId;
			let query = {
				companyId: companyId,
				//...(req.userData.role_id == 4 && { buHrId: req.userId }),
			};
			let subQuery = {
				isActive: 1,
				...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
				...buFIlter,
			};
			const buData = await db.buMapping.findAll({
				where: query,
				include: [
					{
						model: db.buMaster,
						where: subQuery,
						attributes: ["buId", "buName", "buCode"],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: buData,
			});
		} catch (error) {
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async costCenter(req, res) {
		try {
			let query = { isActive: 1 };
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			let search = req.query.search;
			if (search) {
				query = {
					...query,
					[Op.or]: [
						{ costCenterName: { [Op.like]: `%${search}%` } },
						{ costCenterCode: { [Op.like]: `%${search}%` } },
					],
				};
			}
			const costCenterData = await db.costCenterMaster.findAndCountAll({
				// limit,
				// offset,
				where: query,
			});

			return respHelper(res, {
				status: 200,
				data: costCenterData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async designation(req, res) {
		try {
			let search = req.query.search;
			let searchId = req.query.searchId;
			if (search || searchId) {
				let query = { isActive: 1, designationId: searchId };
				if (search) {
					query = { isActive: 1, name: { [Op.like]: `%${search}%` } };
				}

				const designationData = await db.designationMaster.findAll({
					where: query,
				});

				return respHelper(res, {
					status: 200,
					data: designationData,
				});
			} else {
				return respHelper(res, {
					status: 422,
					msg: "Please search designation",
					data: [],
				});
			}
		} catch (error) {
			logger.error("Error while getting designation list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async grade(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const gradeData = await db.gradeMaster.findAndCountAll({
				// limit,
				// offset,
			});

			return respHelper(res, {
				status: 200,
				data: gradeData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async jobLevel(req, res) {
		try {
			let condition = { isActive: 1 };
			let companyId = req.query.companyId;
			let jobLevelData = [];

			if (companyId) {
				jobLevelData = await db.jobLevelMapping.findAll({
					where: { companyId: companyId },
					attributes: [
						"jobLevelMappingId",
						"companyId",
						"bandId",
						"gradeId",
						"jobLevelId",
					],
					include: [
						{
							model: db.jobLevelMaster,
							where: condition,
							attributes: [
								"jobLevelId",
								"jobLevelName",
								"jobLevelCode",
								"isActive",
							],
						},
					],
				});
			} else {
				jobLevelData = await db.jobLevelMaster.findAll({
					where: condition,
				});
			}

			return respHelper(res, {
				status: 200,
				data: jobLevelData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async functionalArea(req, res) {
		try {
			let query = {
				...(req.query.departmentMappingId && {
					departmentMappingId: req.query.departmentMappingId,
				}),
			};
			let subQuery = { isActive: 1 };
			const functionalAreaData = await db.functionalAreaMapping.findAll({
				where: query,
				include: [
					{
						model: db.functionalAreaMaster,
						where: subQuery,
						attributes: [
							"functionalAreaId",
							"functionalAreaName",
							"functionalAreaCode",
						],
					},
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

	async state(req, res) {
		try {
			const limit = req.query.limit * 1 || 200;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const stateCode = req.query.stateCode;
			const stateName = req.query.stateName;
			const countryId = req.query.countryId;
			const regionId = req.query.regionId;
			const stateData = await db.stateMaster.findAndCountAll({
				limit,
				offset,
				where: Object.assign(
					stateCode
						? {
								stateCode,
							}
						: {},
					stateName
						? {
								stateName,
							}
						: {},
					countryId
						? {
								countryId,
							}
						: {},
					regionId
						? {
								regionId,
							}
						: {},
				),
			});

			return respHelper(res, {
				status: 200,
				data: stateData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async region(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const countryId = req.query.country;

			const regionData = await db.regionMaster.findAndCountAll({
				limit,
				offset,
				where: Object.assign(
					countryId
						? {
								countryId,
							}
						: {},
				),
			});

			return respHelper(res, {
				status: 200,
				data: regionData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async city(req, res) {
		try {
			const limit = req.query.limit * 1 || 200;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const stateId = req.query.stateId;

			const cityData = await db.cityMaster.findAndCountAll({
				limit,
				offset,
				where: Object.assign(
					stateId
						? {
								stateId,
							}
						: {},
				),
			});

			return respHelper(res, {
				status: 200,
				data: cityData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async companyLocation(req, res) {
		try {
			const { companyId } = req.query; // Get the companyId from the query parameters

			// Define the base query
			let query = { isActive: 1 };
			// If companyId is provided, add it to the query filter
			if (companyId) {
				query.companyId = companyId;
			}
			// Query the database for company locations, with or without companyId filter
			const companyLocationData = await db.companyLocationMaster.findAll({
				where: query,
				attributes: ["companyLocationId", "address1", "companyLocationCode"],
				include: [{ model: db.cityMaster, attributes: ["cityName"] }],
			});
			// Return the response with the fetched data
			return respHelper(res, {
				status: 200,
				data: companyLocationData,
			});
		} catch (error) {
			// Log any errors and return an error response
			logger.error("Error while getting company location list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async company(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const groupId = req.query.groupId || 1;

			let query = {
				isActive: 1,
				...(groupId && { groupId: groupId }),
			};

			const companyData = await db.companyMaster.findAndCountAll({
				limit,
				offset,
				where: query,
				attributes: ["companyId", "companyName", "companyCode"],
			});

			return respHelper(res, {
				status: 200,
				data: companyData,
			});
		} catch (error) {
			logger.error("Error while getting company list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async companyType(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const companyTypeData = await db.companyTypeMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: companyTypeData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async country(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const countryData = await db.countryMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: countryData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async currency(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const currencyData = await db.currencyMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: currencyData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async department(req, res) {
		try {
			const { sbuMappingId } = req.query;
			let query = { ...(sbuMappingId && { sbuMappingId: sbuMappingId }) };
			let subQuery = { isActive: 1 };

			const departmentData = await db.departmentMapping.findAll({
				where: query,
				include: [
					{
						model: db.departmentMaster,
						where: subQuery,
						attributes: ["departmentId", "departmentName", "departmentCode"],
					},
				],
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
	// 	async department(req, res) {
	// 	try {
	// 	 let getDepartmentIds = []
	// 	 let pemissionAccessIds = []
	// 	 if(req.userData.role_id == 4){
	// 	const buPermissionIds = await db.employeeMaster.findOne({
	// 		attributes:["permissionAndAccess"],
	// 		where: { id:req.userData.id}
	// 	  })
	// 	if(buPermissionIds){
	// 	 if(buPermissionIds.dataValues.permissionAndAccess){
	// 		let ids = buPermissionIds.dataValues.permissionAndAccess.split(",")
	// 		 pemissionAccessIds = await db.permissoinandaccess.findAll({
	// 		attributes:["permissoinandaccessId","permissionType","permissionValue"],
	// 		where:{permissoinandaccessId:ids}
	// 	  })
	// 	 }
	// 	   const buIds = pemissionAccessIds.map((e)=>e.dataValues.permissionValue)
	// 		 const getBuMappingId = await db.buMapping.findAll({
	// 		attributes:["buMappingId"],
	// 		where:{buId:{[Op.in]:buIds}}
	// 	  })
	// 	  if(getBuMappingId.length > 0){
	// 		const buMappingIds= getBuMappingId.map((e)=>e.dataValues.buMappingId)

	// 		const getSbuMappingId = await db.sbuMapping.findAll({attributes:['sbuMappingId'],where:{buMappingId:{[Op.in]:buMappingIds}}})
	// 		if(getSbuMappingId.length > 0) {
	// 		   const sbuMappingIds = getSbuMappingId.map((e)=>e.dataValues.sbuMappingId)
	// 		   getDepartmentIds = await db.departmentMapping.findAll({where:{sbuMappingId:{[Op.in]:sbuMappingIds}}})
	// 		}
	// 	  }
	// 	}
	//  }

	//    const departmentIds = getDepartmentIds.map((e)=>e.dataValues.departmentId)

	//    if (req.userData.role_id == 4 && departmentIds.length === 0) {
	// 	return respHelper(res, {
	// 	  status: 200,
	// 	  data: [],
	// 	});
	//   }
	// 	const departmentData = await db.departmentMapping.findAll({
	// 		include: [
	// 		  {
	// 			model: db.departmentMaster,
	// 			attributes: ["departmentId", "departmentName", "departmentCode"],
	// 			where:{
	// 			  //departmentId:{[Op.in]:departmentIds},
	// 			...(departmentIds.length > 0  && req.userData.role_id == 4 && { departmentId:{[Op.in]:departmentIds}})
	// 			}
	// 		  },
	// 		],
	// 	  });

	// 	  return respHelper(res, {
	// 		status: 200,
	// 		data: departmentData,
	// 	  });
	// 	} catch (error) {
	// 	  console.log("error>>>",error)
	// 	  return respHelper(res, {
	// 		status: 500,
	// 	  });
	// 	}
	//   }

	async district(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const districtData = await db.districtMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: districtData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async employeeType(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const employeeTypeData = await db.employeeTypeMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: employeeTypeData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async industry(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const industryData = await db.industryMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: industryData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async pincode(req, res) {
		try {
			const limit = req.query.limit * 1 || 1000;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;
			const cityId = req.query.cityId;
			const pinCodeData = await db.pinCodeMaster.findAndCountAll({
				where: { cityId: cityId },
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: pinCodeData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async timeZone(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const timeZoneData = await db.timeZoneMaster.findAndCountAll({
				limit,
				offset,
			});

			return respHelper(res, {
				status: 200,
				data: timeZoneData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async groupCompany(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const groupCompanyData = await db.groupCompanyMaster.findAndCountAll({
				limit,
				offset,
				attributes: ["groupId", "groupCode", "groupName"],
			});

			return respHelper(res, {
				status: 200,
				data: groupCompanyData,
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
			const mobile = parseInt(req.query.mobile);
			const redisKey = mobile
				? `dashboardCardMobile_${process.env.TEST}`
				: `dashboardCardWeb_${process.env.TEST}`;
			let dashboardData = [];

			await client.get(redisKey).then(async (data) => {
				if (data) {
					dashboardData = JSON.parse(data);

					return respHelper(res, {
						status: 200,
						data: dashboardData,
					});
				} else {
					dashboardData = await db.DashboardCard.findAndCountAll({
						where: {
							isActive: 1,
						},
						order: mobile
							? [["mobilePosition", "asc"]]
							: [["webPosition", "asc"]],
						attributes: mobile
							? [
									"cardId",
									"cardName",
									"mobileUrl",
									"isCardWorking",
									"mobileLightFontColor",
									"mobileIcon",
									"mobileLightBackgroundColor",
									"mobilePosition",
									"mobileDarkFontColor",
									"mobileDarkBackgroundColor",
								]
							: [
									"cardId",
									"cardName",
									"isCardWorking",
									"webUrl",
									"webFontColor",
									"webBackgroundColor",
									"webIcon",
									"webPosition",
								],
					});

					const dashboardJson = JSON.stringify(dashboardData);
					client.setEx(redisKey, 500, dashboardJson);

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

	async leaveMaster(req, res) {
		try {
			const limit = req.query.limit * 1 || 10;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const leaveData = await db.leaveMaster.findAndCountAll({
				limit,
				offset,
			});

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
	async educationMaster(req, res) {
		try {
			const limit = req.query.limit * 1 || 100;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const redisKey = `educationDetails:${process.env.TEST}:${limit}:${offset}:${req.userId}`;
			let educationData;
			const redisData = await client.get(redisKey);

			if (redisData) {
				educationData = JSON.parse(redisData);
				return respHelper(res, {
					status: 200,
					data: educationData,
				});
			}

			educationData = await db.degreeMaster.findAndCountAll({
				limit,
				offset,
			});

			const employeeJson = JSON.stringify(educationData);
			await client.setEx(redisKey, parseInt(process.env.TTL), employeeJson);

			return respHelper(res, {
				status: 200,
				data: educationData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async separationReason(req, res) {
		try {
			const separationReasonData = await db.separationReason.findAll({
				where: {
					separationTypeAutoId: req.query.type ? req.query.type : 1,
				},
				attributes: ["separationReasonAutoId", "separationReason"],
			});

			return respHelper(res, {
				status: 200,
				data: separationReasonData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async separationType(req, res) {
		try {
			const separationTypeData = await db.separationType.findAll({
				attributes: ["separationTypeAutoId", "separationTypeName"],
			});

			return respHelper(res, {
				status: 200,
				data: separationTypeData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async hrDocumentMaster(req, res) {
		try {
			const docData = await db.hrDocumentMaster.findAll({
				attributes: ["documentId", "documentName", "typeUpdate"],
			});
			return respHelper(res, {
				status: 200,
				data: docData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async roles(req, res) {
		try {
			const limit = req.query.limit * 1 || Pagination.perPage;
			const pageNo = req.query.page * 1 || 1;
			const offset = (pageNo - 1) * limit;

			const rolesData = await db.roleMaster.findAndCountAll({ limit, offset });
			return respHelper(res, { status: 200, data: rolesData });
		} catch (error) {
			logger.error("ERROR WHILE GETTING ROLES", error);
			return respHelper(res, { status: 500 });
		}
	}

	async shift(req, res) {
		try {
			let searchKey = req.query.searchKey;
			let query = {
				isActive: 1,
				...(searchKey && { shiftName: { [Op.like]: `%${searchKey}%` } }),
			};

			const shiftData = await db.shiftMaster.findAll({
				where: query,
				attributes: ["shiftId", "shiftName"],
			});
			return respHelper(res, { status: 200, data: shiftData });
		} catch (error) {
			logger.error("ERROR WHILE GETTING SHIFT MASTER DATA", error);
			return respHelper(res, { status: 500 });
		}
	}

	async attendancePlicy(req, res) {
		try {
			let searchKey = req.query.searchKey;
			let query = {
				isActive: 1,
				...(searchKey && { policyName: { [Op.like]: `%${searchKey}%` } }),
			};
			const attendanceData = await db.attendancePolicymaster.findAll({
				where: query,
				attributes: ["attendancePolicyId", "policyName"],
			});
			return respHelper(res, { status: 200, data: attendanceData });
		} catch (error) {
			logger.error("ERROR WHILE GETTING ATTENDANCE DATA", error);
			return respHelper(res, { status: 500 });
		}
	}

	async weekoff(req, res) {
		try {
			let searchKey = req.query.searchKey;
			let query = {
				isActive: 1,
				...(searchKey && { weekOffName: { [Op.like]: `%${searchKey}%` } }),
			};
			let weekoffData = await db.weekOffMaster.findAll({
				where: query,
				attributes: ["weekOffId", "weekOffName"],
			});
			return respHelper(res, { status: 200, data: weekoffData });
		} catch (error) {
			logger.error("ERROR WHILE GETTING WEEK OFF DATA", error);
			return respHelper(res, { status: 500 });
		}
	}

	async sbu(req, res) {
		try {
			const buMappingId = req.query.buMappingId;
			let query = { buMappingId: buMappingId };
			let subQuery = { isActive: 1 };

			const buData = await db.sbuMapping.findAll({
				where: query,
				include: [
					{
						model: db.sbuMaster,
						where: subQuery,
						attributes: ["sbuId", "sbuName", "code"],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: buData,
			});
		} catch (error) {
			logger.error("Error while getting sbu list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async buhr(req, res) {
		try {
			const buMappingId = req.query.buMappingId;
			let query = { buMappingId: buMappingId };
			let subQuery = { isActive: 1 };

			const buhrData = await db.buMapping.findAll({
				where: query,
				include: [
					{
						model: db.employeeMaster,
						where: subQuery,
						attributes: ["id", "name"],
						as: "buhrData",
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: buhrData,
			});
		} catch (error) {
			logger.error("Error while getting buhr list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async buhead(req, res) {
		try {
			const buMappingId = req.query.buMappingId;
			let query = { buMappingId: buMappingId };
			let subQuery = { isActive: 1 };

			const buheadData = await db.buMapping.findAll({
				where: query,
				include: [
					{
						model: db.employeeMaster,
						where: subQuery,
						attributes: ["id", "name"],
						as: "buHeadData",
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: buheadData,
			});
		} catch (error) {
			logger.error("Error while getting buhead list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async probation(req, res) {
		try {
			let query = { isActive: 1 };
			let queryFormat = req.query.queryFormat || "";
			const probationData = await db.probationMaster.findAll({
				where: queryFormat
					? { ...query, ...{ showInProbationExtension: "Yes" } }
					: query,
				attributes: queryFormat
					? [
							["probationId", "value"],
							["probationName", "label"],
						]
					: ["probationId", "probationName"],
			});

			return respHelper(res, {
				status: 200,
				data: probationData,
			});
		} catch (error) {
			logger.error("Error while getting probation list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async newCustomerName(req, res) {
		try {
			let query = { isActive: 1 };
			const newCustomerNameData = await db.newCustomerNameMaster.findAll({
				where: query,
				attributes: ["newCustomerNameId", "newCustomerName"],
			});

			return respHelper(res, {
				status: 200,
				data: newCustomerNameData,
			});
		} catch (error) {
			logger.error("Error while getting new customer name list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async reportModule(req, res) {
		try {
			const {} = req.query;
			let query = { isActive: 1 };
			const reportModule = await db.reportModuleMaster.findAll({
				where: query,
				attributes: ["reportModuleId", "reportModuleName"],
				include: [
					{
						model: db.reportType,
						attributes: ["reportTypeId", "reportTypeName"],
						where: { isActive: 1 },
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: reportModule,
			});
		} catch (error) {
			logger.error("Error while getting new customer name list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async shiftMaster(req, res) {
		try {
			const {} = req.query;
			let query = { isActive: 1 };
			const reportModule = await db.shiftMaster.findAll({});

			return respHelper(res, {
				status: 200,
				data: reportModule,
			});
		} catch (error) {
			logger.error("Error while getting new customer name list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async taskFilter(req, res) {
		try {
			let query =
				req.query.taskFor == "web"
					? { isActive: 1, taskForWeb: 1 }
					: { isActive: 1, taskForApp: 1 };
			const taskFilter = await db.taskFilterMaster.findAll({
				where: query,
				//attributes: ['']
			});

			return respHelper(res, {
				status: 200,
				data: taskFilter,
			});
		} catch (error) {
			console.log("errorerror", error);
			logger.error("Error while getting new customer name list", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async separationTasks(req, res) {
		try {
			const separationTasksData = await db.separationTaskMaster.findAll();

			return respHelper(res, {
				status: 200,
				data: separationTasksData,
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async lwfDesignation(req, res) {
		try {
			let condition = { isActive: 1 };
			const lwfDesignationData = await db.lwfDesignationMaster.findAll({
				where: condition,
				attributes: ["lwfDesignationId", "lwfDesignationName"],
			});
			return respHelper(res, {
				status: 200,
				data: lwfDesignationData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async ptLocation(req, res) {
		try {
			let condition = { isActive: 1, stateId: req.params.stateId };
			const docs = await db.ptLocationMaster.findAll({
				where: condition,
				attributes: ["ptLocationId", "ptLocationName", "ptLocationCode"],
			});
			return respHelper(res, {
				status: 200,
				data: docs,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async unionCode(req, res) {
		try {
			const docs = await db.unionCodIncrementMaster.findAll({
				attributes: ["unionCodeId", "unionCode"],
			});
			return respHelper(res, {
				status: 200,
				data: docs,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async noticePeriod(req, res) {
		try {
			let query = { isActive: 1 };
			const docs = await db.noticePeriodMaster.findAll({
				where: query,
				attributes: ["noticePeriodAutoId", "noticePeriodName"],
			});
			return respHelper(res, {
				status: 200,
				data: docs,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async degree(req, res) {
		try {
			let query = { isActive: 1 };
			const docs = await db.degreeMaster.findAll({
				where: query,
				attributes: ["degreeId", "degreeName"],
			});
			return respHelper(res, {
				status: 200,
				data: docs,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async bank(req, res) {
		try {
			const bankData = await db.bankMaster.findAndCountAll({
				where: {
					isActive: 1,
					...(req.query.search && { bankName: req.query.search }),
				},
				attributes: [
					[
						db.sequelize.fn("DISTINCT", db.sequelize.col("bankName")),
						"bankName",
					],
				],
			});

			return respHelper(res, {
				status: 200,
				data: bankData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async ifsc(req, res) {
		try {
			const bankData = await db.bankMaster.findAll({
				where: {
					isActive: 1,
					bankName: req.query.bankName,
					...(req.query.search && { bankIfsc: req.query.search }),
				},
			});

			return respHelper(res, {
				status: 200,
				data: bankData,
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async employeeDataManupulation(req, res) {
		try {
			const employeeData = await db.employeeMaster.findAll({
				where: { isActive: 1 },
				attributes: [
					"id",
					"empCode",
					"email",
					"personalEmail",
					"name",
					"firstName",
					"middleName",
					"lastName",
					"officeMobileNumber",
					"personalMobileNumber",
					"isActive",
					"dateOfexit",
					"uanNo",
					"pfNo",
					"esicNo",
					"panNo",
					"adhrNo",
					"passportNumber",
					"drivingLicence",
				],
				include: [
					{
						model: db.biographicalDetails,
						attributes: [
							"dateOfBirth",
							"maritalStatus",
							"maritalStatusSince",
							"gender",
						],
						required: false,
					},
					{
						model: db.designationMaster,
						attributes: [
							["name", "designation_name"],
							["code", "designation_code"], // Retrieve the code as well
							[
								db.sequelize.literal(
									"CONCAT(`designationMaster`.`name`, ' (', `designationMaster`.`code`, ')')",
								),
								"designation_with_code", // designation with code combined
							],
						],
						required: false,
					},
					{
						model: db.departmentMaster,
						attributes: [["departmentCode", "department_code"]],
						required: false,
					},
					{
						model: db.buMaster,
						attributes: [["buName", "business_unit"]],
						required: false,
					},
					{
						model: db.employeeTypeMaster,
						attributes: ["emptypename"],
						required: false,
					},
					{
						model: db.employeeMaster,
						required: false,
						as: "managerData",
						attributes: ["empCode"],
					},
					{
						model: db.jobDetails,
						attributes: [
							"dateOfJoining",
							"residentEng",
							"customerName",
							"pfRestricted",
							"epfApplicable",
							"esicApplicable",
						],
						include: [
							{ model: db.gradeMaster, attributes: ["gradeName"] },
							{ model: db.bandMaster, attributes: ["bandDesc"] },
							{
								model: db.jobLevelMaster,
								attributes: ["jobLevelName", "jobLevelCode"],
							},
						],
					},
					{
						model: db.companyLocationMaster,
						attributes: [["address1", "current_address"]],
						required: false,
					},
					{
						model: db.paymentDetails,
						attributes: ["paymentAccountNumber"],
						required: false,
						where: {
							status: "approved",
						},
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
						],
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
						],
					},
					{
						model: db.companyLocationMaster,
						attributes: ["address1", "companyLocationCode"],
						include: [
							{ model: db.countryMaster, attributes: ["countryName"] },
							{ model: db.stateMaster, attributes: ["stateName"] },
							{ model: db.cityMaster, attributes: ["cityName"] },
							{ model: db.pinCodeMaster, attributes: ["pinCode"] },
						],
					},
					{
						model: db.emergencyDetails,
						required: false,
					},
					{
						model: db.costCenterMaster,
						attributes: ["costCenterName", "costCenterCode"],
						required: false,
					},
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaName", "functionalAreaCode"],
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "companyCode"],
					},
					{
						model: db.buMaster,
						attributes: ["buName", "buCode"],
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname", "code"],
					},
					{
						model: db.educationDetails,
						include: [
							{
								model: db.degreeMaster,
							},
						],
					},
					{
						model: db.familyDetails,
						required: false,
						where: {
							isActive: 1,
						},
						attributes: [
							"name",
							["relationWithEmp", "relation"],
							[
								db.sequelize.literal(
									`IFNULL(DATE_FORMAT(dob, '%d-%m-%Y'), '')`, // Format DOB or return an empty string if NULL
								),
								"dob",
							],
						],
					},
					{
						model: db.employeeWorkExperience,
					},
				],
				//raw: true,
			});

			const manipulatedData = employeeData.map((employee) => {
				const transformedWorkExperience = employee.employeeworkexperiences.map(
					(experience) => ({
						company: experience.companyName || "",
						title: experience.jobTitle || "",
						location: experience.jobLocation || "",
						from_date: experience.fromDate || "",
						to_date: experience.toDate || "",
					}),
				);

				const formatDate = (date) =>
					date ? moment(date).format("DD-MMM-YYYY") : ""; // Format date to DD-MMM-YYYY

				const mappedEducationDetails = employee.employeeeducationdetails.map(
					(edu) => ({
						institution_name: edu.educationInstitute || "",
						level_of_study: edu.degreemaster?.degreeType || "",
						field_of_study: edu.educationSpecialisation || "",
						education_category: "",
						gpa_percentage: "",
						course_type: "",
						university: "",
						completed_by_from: edu.educationStartDate
							? moment(edu.educationStartDate).isValid()
								? moment(edu.educationStartDate).format("DD-MM-YYYY")
								: ""
							: "",
						completed_by_to: edu.educationCompletionDate
							? moment(edu.educationCompletionDate).isValid()
								? moment(edu.educationCompletionDate).format("DD-MM-YYYY")
								: ""
							: "",
						high_edu_qualification: edu.isHighestEducation == 0 ? "" : "Yes",
						//degreeName: edu.degreemaster?.degreeName || "", // Fallback to an empty string if degreeName is null/undefined
					}),
				);

				const maritalStatusOptions = {
					Married: 1,
					Single: 2,
					Divorced: 3,
					Separated: 4,
					Widowed: 5,
					Others: 6,
				};

				const maritalStatus = employee.employeebiographicaldetail?.dataValues
					?.maritalStatus
					? Object.keys(maritalStatusOptions).find(
							(key) =>
								maritalStatusOptions[key] ===
								employee.employeebiographicaldetail.dataValues.maritalStatus,
						) || ""
					: "";
				return {
					employee_id: employee.empCode || "",
					first_name: employee.firstName || "",
					middle_name: employee.middleName || "",
					last_name: employee.lastName || "",
					designation:
						employee.designationmaster?.dataValues?.designation_with_code || "",
					current_address: employee.employeeaddress?.dataValues
						? [
								employee.employeeaddress?.dataValues?.currentHouse,
								employee.employeeaddress?.dataValues?.currentStreet,
								employee.employeeaddress?.dataValues?.currentLandmark,
								employee.employeeaddress?.dataValues?.currentcity?.cityName,
								employee.employeeaddress?.dataValues?.currentstate?.stateName,
								employee.employeeaddress?.dataValues?.currentcountry
									?.countryName,
								employee.employeeaddress?.dataValues?.currentpincode?.pincode,
							]
								.filter((item) => item && item !== null && item !== undefined)
								.join(", ")
						: "",
					current_city:
						employee.employeeaddress?.dataValues?.currentcity?.cityName,
					current_pin_code:
						employee.employeeaddress?.dataValues?.currentpincode?.dataValues
							?.pincode || "", // You may need to extract pincode
					current_country:
						employee.employeeaddress?.dataValues?.currentcountry?.dataValues
							?.countryName,
					office_mobile_no: employee.officeMobileNumber || "",
					personal_mobile_no: employee.personalMobileNumber || "",
					date_of_birth:
						formatDate(
							employee.employeebiographicaldetail?.dataValues?.dateOfBirth,
						) || "",
					gender: employee.employeebiographicaldetail?.gender || "",
					date_of_activation:
						formatDate(employee.employeejobdetail?.dataValues?.dateOfJoining) ||
						"",
					grade:
						employee.employeejobdetail?.dataValues?.grademaster?.dataValues
							?.gradeName || "",
					department_code:
						employee.departmentmaster?.dataValues?.department_code || "",
					direct_manager_employee_id:
						employee.managerData?.dataValues?.empCode || "",
					marital_status: maritalStatus || "",
					anniversary_date:
						formatDate(
							employee.employeebiographicaldetail?.dataValues
								?.maritalStatusSince,
						) || "",
					business_unit: employee.bumaster?.dataValues?.buName || "",
					bank_pan: employee.dataValues?.panNo || "",
					pf_number: employee.dataValues?.pfNo || "",
					esic_number: employee.dataValues?.esicNo || "",
					blood_group: "B-",
					bank_name:
						employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
							?.bankName || "",
					bank_account:
						employee.employeepaymentdetail?.dataValues?.paymentAccountNumber ||
						"",
					date_of_resignation: "",
					date_of_exit: employee.dateOfexit || "",
					date_of_confirmation: "", // Custom field, left empty for now
					bank_ifsc:
						employee.employeepaymentdetail?.dataValues?.bankmaster?.dataValues
							?.bankIfsc || "",
					designation_code:
						employee.designationmaster?.dataValues?.designation_code || "",
					full_name: employee.name || "",
					permanent_address: employee.employeeaddress?.dataValues
						? [
								employee.employeeaddress?.dataValues?.permanentHouse,
								employee.employeeaddress?.dataValues?.permanentStreet,
								employee.employeeaddress?.dataValues?.permanentLandmark,
								employee.employeeaddress?.dataValues?.permanentcity?.cityName,
								employee.employeeaddress?.dataValues?.permanentstate?.stateName,
								employee.employeeaddress?.dataValues?.permanentcountry
									?.countryName,
								employee.employeeaddress?.dataValues?.permanentpincode?.pincode,
							]
								.filter((item) => item && item !== null && item !== undefined)
								.join(", ")
						: "",
					date_of_joining:
						formatDate(employee.employeejobdetail?.dataValues?.dateOfJoining) ||
						"",
					uan_number: employee.dataValues?.uanNo || "",
					aadhaar_number: employee.adhrNo || "",
					employee_type:
						employee.employeetypemaster?.dataValues?.emptypename || "",
					permanent_city:
						employee.employeeaddress?.dataValues?.permanentcity?.cityName || "", //employee.employeeaddress?.permanentcity?.cityName || "",
					permanent_pin_code:
						employee.employeeaddress?.dataValues?.permanentpincode?.pincode ||
						"",
					permanent_country:
						employee.employeeaddress?.dataValues?.permanentcountry
							?.countryName || "",
					company_email_id: employee.email || "",
					personal_email_id: employee.personalEmail || "",
					base_office_location: `${
						employee.companylocationmaster?.dataValues?.citymaster?.dataValues
							?.cityName || ""
					}-${
						employee.companylocationmaster?.dataValues?.statemaster?.dataValues
							?.stateName || ""
					}`,
					location_type: "Head Office",
					office_location: `${
						employee.companylocationmaster?.dataValues?.citymaster?.dataValues
							?.cityName || ""
					}-${
						employee.companylocationmaster?.dataValues?.statemaster?.dataValues
							?.stateName || ""
					}`,
					education_details: mappedEducationDetails || [],
					pt_state: "", // Custom field
					past_work_experience: "", //
					past_work: transformedWorkExperience || [],
					employee_separation_comments: "",
					employee_separation_reason: "",
					passport_number: employee.passportNumber || "",
					emergency_contact_number:
						employee.employeeemergencycontact?.dataValues
							?.emergencyContactNumber || "",
					emergency_contact_person:
						employee.employeeemergencycontact?.dataValues
							?.emergencyContactName || "",
					emergency_contact_relation:
						employee.employeeemergencycontact?.dataValues
							?.emergencyContactRelation || "",
					emergency_contact_country_code:
						employee.employeeemergencycontact?.dataValues
							?.emergency_contact_country_code || "",
					emergency_address: employee.employeeaddress?.dataValues
						? [
								employee.employeeaddress?.dataValues?.emergencyHouse,
								employee.employeeaddress?.dataValues?.emergencyStreet,
								employee.employeeaddress?.dataValues?.emergencyLandmark,
								employee.employeeaddress?.dataValues?.emergencycity?.dataValues
									?.cityName,
								employee.employeeaddress?.dataValues?.emergencystate?.dataValues
									?.stateName,
								employee.employeeaddress?.dataValues?.emergencycountry
									?.dataValues?.countryName,
								employee.employeeaddress?.dataValues?.emergencypincode
									?.dataValues?.pincode,
							]
								.filter((item) => item && item !== null && item !== undefined)
								.join(", ")
						: "",
					//cost_center: `${employee.costcentermaster?.dataValues?.costCenterName || ""} (${employee.costcentermaster?.dataValues?.costCenterCode || ""})`,
					cost_center:
						employee.costcentermaster?.dataValues?.costCenterName ||
						employee.costcentermaster?.dataValues?.costCenterCode
							? `${
									employee.costcentermaster?.dataValues?.costCenterName || ""
								} (${
									employee.costcentermaster?.dataValues?.costCenterCode || ""
								})`
							: "",
					salary_stopped: "",
					vpf_amount: "",
					vpf_start_date: "",
					"reason_for_leaving_3_(new_employer_name)": "",
					"reason_for_leaving_4_(new_ctc)": "",
					"reason_for_leaving_5_(new_role)": "",
					is_appointment_letter_uploaded_: "",
					name_of_certifications: "",
					certification_valid_upto: "",
					certification_completion_date: "",
					dependents: employee.employeefamilydetails || [],
					cost_center_id:
						employee.costcentermaster?.dataValues?.costCenterCode || "",
					esic_applicable: employee.dataValues?.employeejobdetail
						?.esicApplicable
						? "Yes"
						: "No",
					pf_applicable_from: "",
					epf_applicable: employee.employeejobdetail?.dataValues?.epfApplicable
						? "Yes"
						: "No",
					driving_license_no: employee.drivingLicence || "",
					latest_modified_any_attribute: "",
					group_company: employee.companymaster?.dataValues?.companyName || "",
					sub_employee_type: "Permanent B",
					sbu_code: employee.sbumaster?.dataValues?.code || "",
					branch_code:
						employee.companylocationmaster?.dataValues?.companyLocationCode ||
						"",
					customer_code:
						employee.employeejobdetail?.dataValues?.customerName || "",
					project_code: "",
					pf_restricted: employee.employeejobdetail?.dataValues?.pfRestricted
						? "Yes"
						: "No",
					functional_area_code:
						employee.functionalareamaster?.dataValues?.functionalAreaCode || "",
					separation_transaction_date: "",
					"father's_name":
						employee.employeefamilydetails.find(
							(f) => f.dataValues.relation === "Father",
						)?.dataValues.name || "",
					ot_branch_code: "",
					passport_valid_upto: "",
					policy_name: "",
					kind_of_disability: "",
					insurance_no: "",
					block_salary_processing: "",
					re: employee.employeejobdetail?.dataValues?.residentEng
						? "Yes"
						: "No",
					functional_area:
						employee.functionalareamaster?.dataValues?.functionalAreaName || "",
					business_unit_code: employee.bumaster?.dataValues?.buCode || "",
				};
			});

			res.status(200).json({
				status: 1,
				message: "Successfully loaded all employees data",
				employee_data: manipulatedData,
			});
		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async buRoleAndAccess(req, res) {
		try {
			const { search, filterType, filterValue } = req.query;
			let buSearch = "";

			if (filterType == "buSearch") {
				buSearch = filterValue;
			}
			const isActive = req.query.isActive || 1;
			let buFIlter = {};
			const usersData = req.userData;

			const activeQuery = { isActive: isActive };

			if (usersData.role_id == 4) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role

				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}
			}
			const companyId = req.query.companyId;
			let query = {
				companyId: companyId,
				//...(req.userData.role_id == 4 && { buHrId: req.userId }),
			};
			let subQuery = {
				isActive: 1,
				...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
				...buFIlter,
			};
			const buData = await db.buMapping.findAll({
				where: query,
				include: [
					{
						model: db.buMaster,
						where: subQuery,
						attributes: ["buId", "buName", "buCode"],
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: buData,
			});
		} catch (error) {
			console.log("error", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async departmentRoleAndAccess(req, res) {
		try {
			let getDepartmentIds = [];
			let pemissionAccessIds = [];
			if (req.userData.role_id == 4) {
				const buPermissionIds = await db.employeeMaster.findOne({
					attributes: ["permissionAndAccess"],
					where: { id: req.userData.id },
				});
				if (buPermissionIds) {
					if (buPermissionIds.dataValues.permissionAndAccess) {
						let ids = buPermissionIds.dataValues.permissionAndAccess.split(",");
						pemissionAccessIds = await db.permissoinandaccess.findAll({
							attributes: [
								"permissoinandaccessId",
								"permissionType",
								"permissionValue",
							],
							where: { permissoinandaccessId: ids },
						});
					}
					const buIds = pemissionAccessIds.map(
						(e) => e.dataValues.permissionValue,
					);
					const getBuMappingId = await db.buMapping.findAll({
						attributes: ["buMappingId"],
						where: { buId: { [Op.in]: buIds } },
					});
					if (getBuMappingId.length > 0) {
						const buMappingIds = getBuMappingId.map(
							(e) => e.dataValues.buMappingId,
						);

						const getSbuMappingId = await db.sbuMapping.findAll({
							attributes: ["sbuMappingId"],
							where: { buMappingId: { [Op.in]: buMappingIds } },
						});
						if (getSbuMappingId.length > 0) {
							const sbuMappingIds = getSbuMappingId.map(
								(e) => e.dataValues.sbuMappingId,
							);
							getDepartmentIds = await db.departmentMapping.findAll({
								where: { sbuMappingId: { [Op.in]: sbuMappingIds } },
							});
						}
					}
				}
			}

			const departmentIds = getDepartmentIds.map(
				(e) => e.dataValues.departmentId,
			);

			if (req.userData.role_id == 4 && departmentIds.length === 0) {
				return respHelper(res, {
					status: 200,
					data: [],
				});
			}
			const departmentData = await db.departmentMapping.findAll({
				include: [
					{
						model: db.departmentMaster,
						attributes: ["departmentId", "departmentName", "departmentCode"],
						where: {
							//departmentId:{[Op.in]:departmentIds},
							...(departmentIds.length > 0 &&
								req.userData.role_id == 4 && {
									departmentId: { [Op.in]: departmentIds },
								}),
						},
					},
				],
			});

			return respHelper(res, {
				status: 200,
				data: departmentData,
			});
		} catch (error) {
			console.log("error>>>", error);
			return respHelper(res, {
				status: 500,
			});
		}
	}


  async financialYear(req, res) {
    try {
      let query = { isActive: 1 };
      const docs = await db.financialYearMaster.findAll({
        where: query,
        attributes: ["financialYearId", "financialYearName", "year"],
        order: [['financialYearId', "DESC"]]
      });
      return respHelper(res, {
        status: 200,
        data: docs,
      });
    } catch (error) {
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async compensationCategory(req, res) {
    try {
      let type = req.query.type || 1;
      let query = { isActive: 1, 'type': type };
      const docs = await db.CompensationCategoryMaster.findAll({
        where: query,
        attributes: ["compensationCategoryId", "name", "type"],
        // order: [['compensationCategoryId', "DESC"]]
      });
      return respHelper(res, {
        status: 200,
        data: docs,
      });
    } catch (error) {
      return respHelper(res, {
        status: 500,
      });
    }
  }
}

export default new MasterController();
