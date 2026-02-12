import Express from "express";
import AdminController from "../controller/admin.controller.js";
import { productUploadMiddleware,productMultipleUploadMiddleware } from "../../middleware/upload.js";
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
.get("/vendor-locations/:vendor_service_auto_id",isAdmin,AdminController.vendorLocations)
.get("/change_vendor_locations_status/:vendor_services_locations_auto_id/:status",isAdmin,AdminController.change_vendor_locations_status)
.post("/vendor-location-mapping",isAdmin,AdminController.addVendorLocationMapping)
.post("/service_feature_list",isAdmin,AdminController.service_feature_list)
.post("/service_feature_status_change",isAdmin,AdminController.service_feature_status_change)
.post("/add_service_feature",isAdmin,AdminController.add_service_feature) 
.get("/edit_service_item_images/:service_item_id",isAdmin,AdminController.edit_service_item_images)
.post("/edit_service_item_images/:service_item_id",isAdmin,productMultipleUploadMiddleware,AdminController.edit_service_item_images)


.post("/service_meta_list",isAdmin,AdminController.service_meta_list)
.post("/service_meta_data_status_change",isAdmin,AdminController.service_meta_data_status_change)
.post("/service_meta_data_visibility_change",isAdmin,AdminController.service_meta_data_visibility_change)
.post("/add_service_meta_data",isAdmin,AdminController.add_service_meta_data) 
.post("/service_details_list",isAdmin,AdminController.service_details_list)
.post("/service_details_data_status_change",isAdmin,AdminController.service_details_data_status_change)
.post("/add_service_details_data",isAdmin,AdminController.add_service_details_data) 
.get("/qrcodes",isAdmin,AdminController.qrcodes)
.get("/add-qr-code",isAdmin,AdminController.addQrCode)
.post("/addQrCode",isAdmin,AdminController.addQrCode)
.get("/generate-qr/:itemId",isAdmin,AdminController.generateQR)
.get("/contacts",isAdmin,AdminController.contacts)
.get("/change-query-status/:contact_id/:is_read",isAdmin,AdminController.changeQueryStatus)