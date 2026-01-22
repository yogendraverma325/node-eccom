import Express from "express";
import AdminController from "../controller/admin.controller.js";
import { isLogin } from "../../middleware/authentication.js";


export default Express.Router()
    .get("/vendors",AdminController.vendorList)
    .get("/change_vendor_status/:vendor_id/:status",AdminController.change_vendor_status)
    .get("/add-vendor",AdminController.addvendorForm)
    .post("/addvendor",AdminController.addvendorForm)
    
