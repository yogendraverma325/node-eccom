import Express from "express";
import ThirdPartyController from "./thirdParty.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";

export default Express.Router().get(
  "/employeeData",
  ThirdPartyController.employeeData
);
