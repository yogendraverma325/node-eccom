import Express from "express";
import AdminController from "../controller/admin.controller.js";
import { productUploadMiddleware } from "../../middleware/upload.js";
import { isAdmin } from "../../middleware/admin.js";

export default Express.Router()
.get("/vendors",isAdmin,AdminController.vendorList)
.get("/change_vendor_status/:vendor_id/:status",isAdmin,AdminController.change_vendor_status)
.get("/add-vendor",isAdmin,AdminController.addvendorForm)
.post("/addvendor",isAdmin,AdminController.addvendorForm)
.get("/vendor-domains/:vendor_id",isAdmin,AdminController.vendorDomains)
.get("/change_vendor_domain_status/:vendor_service_id/:status",isAdmin,AdminController.change_vendor_domain_status)
.get("/vendor-domain-services/:vendor_service_id",isAdmin,AdminController.vendorDomainServices)
.get("/change_service_item_status/:service_item_id/:status",isAdmin,AdminController.change_service_item_status)
.get("/add_service_item/:service_item_id",isAdmin,AdminController.add_service_item)
.post("/add_service_item/:service_item_id",
    isAdmin,
productUploadMiddleware
,AdminController.add_service_item)
.get("/edit_service_item/:service_item_id",isAdmin,AdminController.edit_service_item)
.post("/edit_service_item/:service_item_id",
    isAdmin,
productUploadMiddleware
,AdminController.edit_service_item)
.post("/vendor-category-mapping",isAdmin,AdminController.addVendorCategoryMapping)
    
