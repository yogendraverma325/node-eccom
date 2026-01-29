import Express from "express";
import AdminController from "../controller/admin.controller.js";
import { isLogin } from "../../middleware/authentication.js";
import { productUploadMiddleware } from "../../middleware/upload.js";

export default Express.Router()
.get("/vendors",AdminController.vendorList)
.get("/change_vendor_status/:vendor_id/:status",AdminController.change_vendor_status)
.get("/add-vendor",AdminController.addvendorForm)
.post("/addvendor",AdminController.addvendorForm)
.get("/vendor-domains/:vendor_id",AdminController.vendorDomains)
.get("/change_vendor_domain_status/:vendor_service_id/:status",AdminController.change_vendor_domain_status)
.get("/vendor-domain-services/:vendor_service_id",AdminController.vendorDomainServices)
.get("/change_service_item_status/:service_item_id/:status",AdminController.change_service_item_status)
.get("/add_service_item/:service_item_id",AdminController.add_service_item)
.post("/add_service_item/:service_item_id",
productUploadMiddleware
,AdminController.add_service_item)
.get("/edit_service_item/:service_item_id",AdminController.edit_service_item)
.post("/edit_service_item/:service_item_id",
productUploadMiddleware
,AdminController.edit_service_item)
    
