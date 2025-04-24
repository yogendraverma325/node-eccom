import Express from "express";
import ThirdPartyController from "../master/thirdparty.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";

export default Express.Router().post(
	"/employeeData",
	ThirdPartyController.employeeData,
);
