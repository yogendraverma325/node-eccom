import Express from "express";
import thirdPartyController from "./thirdParty.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";

export default Express.Router()
  .get("/employeeData", thirdPartyController.employeeData)

