import Express from "express";
import arrearsController from "./arrears.controller.js";
import authentication from "../../../middleware/authentication.js";
export default Express.Router()
    .post(
        "/monthWiseArrearsList",
        authentication.authenticate,
        arrearsController.getMonthWiseArrearsList,
    );
