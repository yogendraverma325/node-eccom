<<<<<<< HEAD
import Express from "express";
import ThirdPartyController from "../master/thirdparty.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";

export default Express.Router().post(
	"/employeeData",
	ThirdPartyController.employeeData,
)
.post(
	"/internalDataSync",
	ThirdPartyController.internalDataSync,
)
=======
import Express from "express";
import ThirdPartyController from "../master/thirdparty.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";

export default Express.Router().post(
	"/employeeData",
	ThirdPartyController.employeeData,
);
>>>>>>> main_dev_fnf
