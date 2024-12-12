import Express from 'express';
import commonController from './master.controller.js';
import authorization from '../../../../middleware/authorization.js';

export default Express
    .Router()

    // company type master routes
    .post("/company-type", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createCompanyType)
    .get("/company-type-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.companyTypeList)
    .get("/company-type-details/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.companyTypeDetails)
    .put("/company-type/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateCompanyType)
    .patch("/company-type/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfCompanyType)
    .delete("/company-type/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.deleteOfCompanyType)

    // band master routes
    .post("/band", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createBand)
    .get("/band-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.bandList)
    .get("/band-details/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.bandDetails)
    .put("/band/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateBand)
    .patch("/band/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfBand)
    .delete("/band/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.deleteOfBand)

    // job level master routes
    .post("/job-level", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createJobLevel)
    .get("/job-level-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.jobLevelList)
    .get("/job-level-details/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.jobLevelDetails)
    .put("/job-level/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateJobLevel)
    .patch("/job-level/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfJobLevel)
    .delete("/job-level/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.deleteOfJobLevel)

    // Bank master 
    .post("/bank", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createBank)
    .get("/bank-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.bankList)
    .patch("/bank/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfBank)
    .put("/bank/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateBank)

    // department master routes created by jay
    .post("/department", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createDepartment)
    .get("/department-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.departmentList)
    .put("/department/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateDepartment)
    .patch("/department/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfDepartment)

    // functional area master routes created by jay
    .post("/functionaArea", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createFunctionalArea)
    .get("/functionaArea-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.functionalAreaList)
    .put("/functionaArea/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateFunctionalArea)
    .patch("/functionaArea/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfFunctionalArea)

