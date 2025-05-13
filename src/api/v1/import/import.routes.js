import Express from "express";
import importController from "./import.controller.js";
import authentication from "../../../middleware/authentication.js";
import multer from "multer";
const upload = multer({ dest: "uploads/excel/" });
export default Express.Router()
	.post(
		"/uploadExcelFile",
		upload.single("excelFile"),
		authentication.authenticate,
		importController.uploadExcelFile,
	)
	.get(
		"/getImportInfoList",
		authentication.authenticate,
		importController.getImportInfoList,
	)
	.get("/exportImportedSheets", importController.exportImportedSheets)
	.get("/getEmploymentDetails", importController.getEmploymentDetails)
