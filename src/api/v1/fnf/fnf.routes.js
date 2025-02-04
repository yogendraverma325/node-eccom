import Express from 'express';
import fnfController from './fnf.controller.js';
import authentication from '../../../middleware/authentication.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/excel/' });
export default Express
    .Router()
    .post("/employeesCountsForFnfProcess",authentication.authenticate,fnfController.employeesCountForProcess)
    .get("/employeesListForFnfProcessing",authentication.authenticate,fnfController.employeesListForFnfProcessing)

    // upload excel sheet routes
    .post("/uploadGratutiy", upload.single('excelFile'), authentication.authenticate, fnfController.uploadGratuity)
    .post("/uploadLeaveEncashment", upload.single('excelFile'), authentication.authenticate, fnfController.uploadLeaveEncashment)
    .post("/uploadPT", upload.single('excelFile'), authentication.authenticate, fnfController.uploadPT)
    .post("/uploadLWF", upload.single('excelFile'), authentication.authenticate, fnfController.uploadLWF)
    .post("/uploadNoticeRecover", upload.single('excelFile'), authentication.authenticate, fnfController.uploadNoticeRecovery)


