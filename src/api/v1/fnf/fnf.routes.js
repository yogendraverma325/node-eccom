import Express from 'express';
import fnfController from './fnf.controller.js';
import authentication from '../../../middleware/authentication.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/excel/' });
export default Express
    .Router()
    .post("/employeesCountsForFnfProcess",authentication.authenticate,fnfController.employeesCountForProcess)
    .get("/employeesListForFnfProcessing",authentication.authenticate,fnfController.employeesListForFnfProcessing)
    .post("/uploadGratutiy",authentication.authenticate,fnfController.uploadGratuity)
    .post("/initiateFnf",authentication.authenticate,fnfController.initiateFnf)
    ;








    



