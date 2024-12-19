import db from "../../../../config/db.config.js";
import validator from "../../../../helper/adminValidator.js";
import logger from "../../../../helper/logger.js";
import respHelper from "../../../../helper/respHelper.js";
import service from "./master.service.js";
import Pagination from "../../../../helper/pagination.js";
import { Op } from "sequelize";
import moment from "moment";
import constant from "../../../../constant/messages.js";

class CommonController {
  /**
   * CRUD of Company Type Master
   *
   */

  async createCompanyType(req, res) {
    try {
      let result = await validator.companyTypeMasterSchema.validateAsync(
        req.body
      );
      result = { ...result, createdBy: req.userId, isActive: 1 }
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
      let result = await validator.companyTypeMasterSchema.validateAsync(
        req.body
      );
      result = { ...result, updatedBy: req.userId, updatedAt: moment() };
      let model = db.companyTypeMaster;
      let query = { companyTypeId: req.params.id };

      let verifyQuery = {
        [Op.not]: { companyTypeId: req.params.id },
        typeName: result.typeName
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Company Type') };
        return respHelper(res, response);
      }
      else {
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
        moduleName
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
      result = { ...result, createdBy: req.userId, isActive: 1 }
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
        bandCode: result.bandCode
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Band Code') };
        return respHelper(res, response);
      }
      else {
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
        moduleName
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
      let result = await validator.jobLevelMasterSchema.validateAsync(
        req.body
      );
      result = { ...result, createdBy: req.userId, isActive: 1 }
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
      let result = await validator.jobLevelMasterSchema.validateAsync(
        req.body
      );
      result = { ...result, updatedBy: req.userId, updatedAt: moment() };
      let model = db.jobLevelMaster;
      let query = { jobLevelId: req.params.id };

      let verifyQuery = {
        [Op.not]: { jobLevelId: req.params.id },
        jobLevelName: result.jobLevelName,
        jobLevelCode: result.jobLevelCode
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Job Level') };
        return respHelper(res, response);
      }
      else {
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
        moduleName
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
      let moduleName = "Bank";
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
        moduleName
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
      let response = await service.update(model, { ...result, ...{ updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"), updatedBy: req.userId } }, query);
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

  /**
     * CRUD of Department Master Created by Jay
     * 
    */

  async createDepartment(req, res) {
    try {
      let result = await validator.departmentMasterSchema.validateAsync(req.body);
      result = { ...result, parentDepartmentId: 0, createdBy: req.userId, isActive: 1 };

      let model = db.departmentMaster;
      let query = { 'departmentName': result.departmentName, 'departmentCode': result.departmentCode };
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
      let search = req.query.search || '';
      let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

      let query = {
        ...(search && { 'departmentName': { [Op.like]: `%${search}%` } })
      };

      let aggregate = {
        where: query,
        attributes: ['departmentId', 'departmentName', 'departmentCode', 'createdAt', 'isActive'],
        order: [["departmentId", "DESC"]],
        limit: pageLimit,
        offset: (page - 1) * pageLimit
      }

      let response = await service.aggregate(model, aggregate);
      let count = await service.count(model, query);
      let obj = { 'rows': response.data, 'count': count };
      return respHelper(res, { 'status': response.status, 'msg': response.msg, 'data': obj });

    } catch (error) {
      logger.error(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async updateDepartment(req, res) {
    try {
      let result = await validator.departmentMasterSchema.validateAsync(req.body);
      result = { ...result, updatedBy: req.userId, updatedAt: moment() };
      let model = db.departmentMaster;
      let query = { departmentId: req.params.id };

      let verifyQuery = {
        [Op.not]: { departmentId: req.params.id },
        'departmentName': result.departmentName,
        'departmentCode': result.departmentCode
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Department Name') };
        return respHelper(res, response);
      }
      else {
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
      let result = await validator.functionalAreaMasterSchema.validateAsync(req.body);
      result = { ...result, createdBy: req.userId, isActive: 1, parentFunctionalAreaId: 0 };
      let model = db.functionalAreaMaster;
      let query = { 'functionalAreaName': result.functionalAreaName, 'functionalAreaCode': result.functionalAreaCode };
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
      let search = req.query.search || '';
      let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

      let query = {
        ...(search && { 'functionalAreaName': { [Op.like]: `%${search}%` } })
      };

      let aggregate = {
        where: query,
        attributes: ['functionalAreaId', 'functionalAreaName', 'functionalAreaCode', 'createdAt', 'isActive'],
        order: [["functionalAreaId", "DESC"]],
        limit: pageLimit,
        offset: (page - 1) * pageLimit
      }

      let response = await service.aggregate(model, aggregate);
      let count = await service.count(model, query);
      let obj = { 'rows': response.data, 'count': count };
      return respHelper(res, { 'status': response.status, 'msg': response.msg, 'data': obj });

    } catch (error) {
      logger.error(error);
      return respHelper(res, {
        status: 500,
      });
    }
  }

  async updateFunctionalArea(req, res) {
    try {
      let result = await validator.functionalAreaMasterSchema.validateAsync(req.body);
      result = { ...result, updatedBy: req.userId, updatedAt: moment() };
      let model = db.functionalAreaMaster;
      let query = { functionalAreaId: req.params.id };

      let verifyQuery = {
        [Op.not]: { functionalAreaId: req.params.id },
        'functionalAreaName': result.functionalAreaName,
        'functionalAreaCode': result.functionalAreaCode
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Functional Area') };
        return respHelper(res, response);
      }
      else {
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
      result = { ...result, createdBy: req.userId, isActive: 1, createdAt: moment() };
      let model = db.weekOffMaster;
      let query = { 'weekOffName': result.weekOffName };
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
      let search = req.query.search || '';
      let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

      let query = {
        ...(search && { 'weekOffName': { [Op.like]: `%${search}%` } })
      };

      let aggregate = {
        where: query,
        attributes: ['weekOffId', 'weekOffName', 'nonWorkingDays', 'createdAt', 'isActive'],
        order: [["weekOffId", "DESC"]],
        limit: pageLimit,
        offset: (page - 1) * pageLimit
      }

      let response = await service.aggregate(model, aggregate);
      let count = await service.count(model, query);
      let obj = { 'rows': response.data, 'count': count };
      return respHelper(res, { 'status': response.status, 'msg': response.msg, 'data': obj });

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
        weekOffName: result.weekOffName
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Week Off Name') };
        return respHelper(res, response);
      }
      else {
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
      result = { ...result, createdBy: req.userId, isActive: 1, createdAt: moment() };
      let model = db.shiftMaster;
      let query = { 'shiftName': result.shiftName };
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
      let search = req.query.search || '';
      let pageLimit = parseInt(req.query.limit) || Pagination.perPage;

      let query = {
        ...(search && { 'shiftName': { [Op.like]: `%${search}%` } })
      };

      let aggregate = {
        where: query,
        attributes: ['shiftId', 'shiftName', 'shiftStartTime', 'shiftEndTime', 'shiftRemark', 'isOverNight', 'createdAt', 'isActive'],
        order: [["shiftId", "DESC"]],
        limit: pageLimit,
        offset: (page - 1) * pageLimit
      }

      let response = await service.aggregate(model, aggregate);
      let count = await service.count(model, query);
      let obj = { 'rows': response.data, 'count': count };
      return respHelper(res, { 'status': response.status, 'msg': response.msg, 'data': obj });

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
        shiftName: result.shiftName
      };
      let isVerify = await service.details(model, verifyQuery);

      if(isVerify.status == 200) {
        let response = { status: 400, msg: constant.ALREADY_EXISTS.replace("<module>", 'Shift Name') };
        return respHelper(res, response);
      }
      else {
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

  // End master apis creation by jay


  // close class
}

export default new CommonController();
