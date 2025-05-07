import Express from "express";
import arrearsController from "./arrears.controller.js";
import authentication from "../../../middleware/authentication.js";
export default Express.Router().post(
	"/monthWiseArrearsList",
	authentication.authenticate,
	arrearsController.getMonthWiseArrearsList,
).post(
	"/processArrears",
	authentication.authenticate,
	arrearsController.processArrears,
).post(
	"/deleteArrears",
	authentication.authenticate,
	arrearsController.deleteArrears,
);




