import Express from "express";
import commonController from "./master.controller.js";
import authorization from "../../../../middleware/authorization.js";

export default Express.Router()

  // company type master routes
  .post(
    "/company-type",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createCompanyType
  )
  .get(
    "/company-type-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.companyTypeList
  )
  .get(
    "/company-type-details/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.companyTypeDetails
  )
  .put(
    "/company-type/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateCompanyType
  )
  .patch(
    "/company-type/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfCompanyType
  )
  .delete(
    "/company-type/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.deleteOfCompanyType
  )

  // band master routes
  .post(
    "/band",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createBand
  )
  .get(
    "/band-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.bandList
  )
  .get(
    "/band-details/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.bandDetails
  )
  .put(
    "/band/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateBand
  )
  .patch(
    "/band/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfBand
  )
  .delete(
    "/band/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.deleteOfBand
  )

  // job level master routes
  .post(
    "/job-level",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createJobLevel
  )
  .get(
    "/job-level-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.jobLevelList
  )
  .get(
    "/job-level-details/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.jobLevelDetails
  )
  .put(
    "/job-level/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateJobLevel
  )
  .patch(
    "/job-level/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfJobLevel
  )
  .delete(
    "/job-level/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.deleteOfJobLevel
  )

  // Bank master
  .post(
    "/bank",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createBank
  )
  .get(
    "/bank-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.bankList
  )
  .patch(
    "/bank/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfBank
  )
  .put(
    "/bank/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateBank
  )

  //RITAK WORK
  // Bu master
  .post(
    "/bu",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createBu
  )
  .get(
    "/bu-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.buList
  )
  .patch(
    "/bu/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfBu
  )
  .put(
    "/bu/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateBu
  )

  // Sbu master
  .post(
    "/sbu",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createSbu
  )
  .get(
    "/sbu-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.sbuList
  )
  .patch(
    "/sbu/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfSbu
  )
  .put(
    "/sbu/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateSbu
  )

  // Designation master
  .post(
    "/designation",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createDesignation
  )
  .get(
    "/designation-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.designationList
  )
  .patch(
    "/designation/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfDesignation
  )
  .put(
    "/designation/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateDesignation
  )

  // Grade master
  .post(
    "/grade",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createGrade
  )
  .get(
    "/grade-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.gradeList
  )
  .patch(
    "/grade/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfGrade
  )
  .put(
    "/grade/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateGrade
  )

  // Degree master
  .post(
    "/degree",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createDegree
  )
  .get(
    "/degree-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.degreeList
  )
  .patch(
    "/degree/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfDegree
  )
  .put(
    "/degree/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateDegree
  )

  // Holiday master
  .post(
    "/holiday",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createHoliday
  )
  .get(
    "/holiday-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.holidayList
  )
  .patch(
    "/holiday/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfHoliday
  )
  .put(
    "/holiday/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateHoliday
  )
  // New Customer Name master
  .post(
    "/newcustomername",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createNewCustomer
  )
  .get(
    "/newcustomername-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.NewCustomerList
  )
  .patch(
    "/newcustomername/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfNewCustomer
  )
  .put(
    "/newcustomername/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateNewCustomer
  )
  //RITAK WORK

  // department master routes created by jay
  .post(
    "/department",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createDepartment
  )
  .get(
    "/department-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.departmentList
  )
  .put(
    "/department/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateDepartment
  )
  .patch(
    "/department/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfDepartment
  )

  // functional area master routes created by jay
  .post(
    "/functionalArea",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.createFunctionalArea
  )
  .get(
    "/functionalArea-list",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.functionalAreaList
  )
  .put(
    "/functionalArea/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.updateFunctionalArea
  )
  .patch(
    "/functionalArea/:id",
    authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN"),
    commonController.changeStatusOfFunctionalArea
  );
