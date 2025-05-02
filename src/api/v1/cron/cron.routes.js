import Express from "express";
import cronController from "./cron.controller.js";

export default Express.Router()
	.get("/attendanceCron", cronController.updateAttendance)
	.get("/unlockAccount", cronController.updateActiveStatus)
	.get("/updateManager", cronController.updateManager)
	.get("/blockAccess", cronController.blockAccess)
	.get("/newJoinEmployee", cronController.newJoinEmployee)
	//CONFIRMATION
	.get("/generateConfirmation", cronController.generateConfirmation)
	.get("/checkSLAOfConfirmation", cronController.checkSLAOfConfirmation)
	.get("/checkConfirmatonHold", cronController.checkConfirmatonHold)
	.get("/checkExtentionEnd", cronController.checkExtentionEnd)
	.get("/generatConfiramtionletter", cronController.generatConfiramtionletter)
	//CONFIRMATION

	.get("/biometricAttendance", cronController.biometricAttendance)
	.get("/logs/:appName", cronController.getPm2Logs)
	.get("/getEmpForWishes", cronController.getEmpForWishes)
