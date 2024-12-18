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
    .post("/functionalArea", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createFunctionalArea)
    .get("/functionalArea-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.functionalAreaList)
    .put("/functionalArea/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateFunctionalArea)
    .patch("/functionalArea/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfFunctionalArea)

    // week off master routes created by jay
    .post("/weekoff", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createWeekoff)
    .get("/weekoff-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.weekoffList)
    .put("/weekoff/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateWeekoff)
    .patch("/weekoff/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfWeekoff)

    // shift master routes created by jay
    .post("/shift", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.createShift)
    .get("/shift-list", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.shiftList)
    .put("/shift/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.updateShift)
    .patch("/shift/:id", authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"), commonController.changeStatusOfShift)

    

