import db from "../../../../config/db.config.js";
import validator from "../../../../helper/adminValidator.js";
import logger from "../../../../helper/logger.js";
import respHelper from "../../../../helper/respHelper.js";
import service from "./master.service.js";
import Pagination from "../../../../helper/pagination.js";
import { Op } from "sequelize";
import moment from "moment";
import helper from "../../../../helper/helper.js";
class CommonController {
  /**
   * CRUD of Company Type Master
   *
   */

  async createCompanyType(req, res) {
    try {
      const result = await validator.companyTypeMasterSchema.validateAsync(
        req.body
      );
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
        req.body
      );
      let model = db.companyTypeMaster;
      let query = { companyTypeId: req.params.id };
      let response = await service.update(model, result, query);
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
      let response = await service.update(model, result, query);
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
      let response = await service.update(model, result, query);
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
        query
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
      const result = await validator.buMasterSchema.validateAsync(req.body);
      let model = db.buMaster;
      let query = { buCode: result.buCode };
      let moduleName = "Bu";
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

  async updateBu(req, res) {
    try {
      const result = await validator.buMasterSchema.validateAsync(req.body);
      let model = db.buMaster;
      let query = { buId: req.params.id };
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
        query
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

  async updateSbu(req, res) {
    try {
      const result = await validator.sbuMasterSchema.validateAsync(req.body);
      let model = db.sbuMaster;
      let query = { sbuId: req.params.id };
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
        query
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
        req.body
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
        moduleName
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
        req.body
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
        query
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
        query
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
        query
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
        req.body
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
          moduleName // Module name for logging or identification
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
        req.body
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
        query
      );

      // Now handle the holidayCompanyLocationConfiguration updates
      const holidayId = req.params.id;
      let locationModel = db.holidayCompanyLocationConfiguration;

      // Get existing locations for the current holidayId
      const existingLocations = await locationModel.findAll({
        where: { holidayId },
      });

      const existingLocationIds = existingLocations.map(
        (loc) => loc.companyLocationId
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
            }
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
            }
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
            "Holiday Company Location"
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
        query
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

  /**
   * CRUD of Department Master Created by Jay
   *
   */

  async createDepartment(req, res) {
    try {
      let result = await validator.departmentMasterSchema.validateAsync(
        req.body
      );
      result = {
        ...result,
        parentDepartmentId: 0,
        createdBy: req.userId,
        isActive: 1,
      };

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
        req.body
      );
      result = { ...result, updatedBy: req.userId, updatedAt: moment() };
      let model = db.departmentMaster;
      let query = { departmentId: req.params.id };
      let response = await service.update(model, result, query);
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
        req.body
      );
      result = {
        ...result,
        createdBy: req.userId,
        isActive: 1,
        parentFunctionalAreaId: 0,
      };
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
        req.body
      );
      result = { ...result, updatedBy: req.userId, updatedAt: moment() };
      let model = db.functionalAreaMaster;
      let query = { functionalAreaId: req.params.id };
      let response = await service.update(model, result, query);
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

  // End master apis creation by jay

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
        req.body
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
      console.error("Error:", error.message);

      return respHelper(res, {
        status: 500,
      });
    }
  }

  async updateCostCenter(req, res) {
    try {
      const result = await validator.costCenterMasterSchema.validateAsync(
        req.body
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
        query
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
              `uploads/company`
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
              `uploads/company`
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

  // close class
}

export default new CommonController();
