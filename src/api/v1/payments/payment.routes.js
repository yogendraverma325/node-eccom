// import Express from 'express';
// import paymentController from './payment.controller.js'
// import authentication from '../../../middleware/authentication.js';

// export default Express
//     .Router()
//     .get('/payElements', authentication.authenticate, paymentController.payElements)
//     .get("/paySlip", authentication.authenticate, paymentController.paySlips)
//     .get("/payPackage", authentication.authenticate, paymentController.payPackage)
//     .get("/ctcProration", authentication.authenticate, paymentController.ctcProration)

import Express from 'express';
import paymentController from './payment.controller.js'
import authentication from '../../../middleware/authentication.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/excel/' });

export default Express
    .Router()
    .get('/payElements', authentication.authenticate, paymentController.payElements)
    .get("/paySlip", authentication.authenticate, paymentController.paySlips)
    .get("/payPackage", authentication.authenticate, paymentController.payPackage)
    .get("/ctcProration", authentication.authenticate, paymentController.ctcProration)
    .post("/getExistingSalaryStrutures",authentication.authenticate, paymentController.getExistingSalaryStrutures)
    .post("/componentElementMapping", upload.single('excelFile'), paymentController.componentElementMapping)
    .post("/createSalaryStructure",authentication.authenticate,paymentController.createSalaryStructure)
    .get("/getSalaryComponentList",authentication.authenticate,paymentController.getSalaryComponentList)
    .get("/getDefaultSalaryStructure",authentication.authenticate,paymentController.getDefaultSalaryStructure)
    .post("/uploadCTC", upload.single('excelFile'),authentication.authenticate,paymentController.uploadCTC)
    .post("/executeSalary",authentication.authenticate, paymentController.initiateSalary)
    .post("/arrearsUpload", upload.single('excelFile'), authentication.authenticate, paymentController.arrearsUpload)
    .post("/lopUpload", upload.single('excelFile'), authentication.authenticate, paymentController.lopUpload)
    .post("/tdsUpload", upload.single('excelFile'), authentication.authenticate, paymentController.tdsUpload)
    .get("/getCompanyList",authentication.authenticate,paymentController.getCompanyList)
    .post("/employeesCountsForPayrollProcess",authentication.authenticate,paymentController.employeesCountForProcess)
    .post("/getReviewEmployeeDetails",authentication.authenticate,paymentController.getReviewEmployeeDetails)
    .get("/getPayGroupsList",authentication.authenticate,paymentController.getPayGroupsList)
    .post("/currentonthLopSyncing",authentication.authenticate,paymentController.lopSyncing)
    .post("/currentonthTdsSyncing",authentication.authenticate,paymentController.tdsSyncing)
    .post("/extraDeductionsUpload",upload.single('excelFile'),authentication.authenticate,paymentController.extraDeductionsUpload)
    .post("/extraDeductionSyncing",authentication.authenticate,paymentController.extraDeductionSyncing)
    .post("/processSalary",authentication.authenticate,paymentController.processSalaryAPI)
    .post("/exportSalaryRegister",authentication.authenticate,paymentController.exportSalaryRegister)
    // .post("/generatePaySlip",authentication.authenticate,paymentController.generatePaySlip)
    .post("/processedEmployeeList",authentication.authenticate,paymentController.processedEmployeeList)
    .post("/releasePaySlip",authentication.authenticate,paymentController.releasePaySlip)
    .post("/mappedEmployeeWithStructure",authentication.authenticate,paymentController.getMappedEmployeeWithSalaryStructure)
    .post("/getWipProcessList",authentication.authenticate,paymentController.getWipProcessList)
    .post("/getNextAvailableStatuses",authentication.authenticate,paymentController.getNextAvailableStatuses)
    .post("/updateNextStatus",authentication.authenticate,paymentController.updateNextStatus)
    .post("/getProcessDetails",authentication.authenticate,paymentController.getProcessDetails)
    .post("/extraPaymentUpload", upload.single('excelFile'), authentication.authenticate, paymentController.extraPaymentUpload)
    .post("/currentonthExtraPaymentSyncing",authentication.authenticate,paymentController.extraPaymentSyncing)
    .get("/buList",authentication.authenticate,paymentController.buList)
    .get("/salaryComponentList",authentication.authenticate,paymentController.salaryComponentList);



