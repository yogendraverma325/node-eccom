export default (sequelize, Sequelize) => {
  const employeeJobDetails = sequelize.define("employeejobdetails", {
    jobId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    dateOfJoining: {
      type: Sequelize.DATE,
    },
    probationPeriod: {
      type: Sequelize.STRING,
    },
    probationId: {
      type: Sequelize.INTEGER,
    },
    probationDays: {
      type: Sequelize.INTEGER,
    },
    languagesSpoken: {
      type: Sequelize.STRING,
    },
    unionId: {
      type: Sequelize.INTEGER,
    },
    bandId: {
      type: Sequelize.INTEGER,
    },
    gradeId: {
      type: Sequelize.INTEGER,
    },
    jobLevelId: {
      type: Sequelize.INTEGER,
    },
    residentEng: {
      type: Sequelize.BOOLEAN,
    },
    customerName: {
      type: Sequelize.STRING,
    },
    epsApplicability: {
      type: Sequelize.BOOLEAN,
    },
    esicApplicable: {
      type: Sequelize.BOOLEAN,
    },
    lwfApplicable: {
      type: Sequelize.BOOLEAN,
    },
    pfRestricted: {
      type: Sequelize.BOOLEAN,
    },
    pfApplicability: {
      type: Sequelize.BOOLEAN,
    },
    epfApplicable: {
      type: Sequelize.BOOLEAN,
    },
    esicNumber: {
      type: Sequelize.STRING,
    },
    pfNumber: {
      type: Sequelize.STRING,
    },
    uanNumber: {
      type: Sequelize.STRING,
    },
    lwfDesignation: {
      type: Sequelize.INTEGER,
    },
    lwfState: {
      type: Sequelize.INTEGER,
    },
    restrictCompanyPf: {
      type: Sequelize.BOOLEAN,
    },
    pranNumber: {
      type: Sequelize.STRING,
    },
    npsNumber: {
      type: Sequelize.STRING,
    },
    projectCode: {
      type: Sequelize.STRING,
    },
    customerCode: {
      type: Sequelize.STRING,
    },
    nextAppraisalDue: {
      type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
    },
    dateOfProbationEnd: {
      type: Sequelize.DATE,
    },
    dateOfProbationTriggerDate: {
      type: Sequelize.DATE,
    },
    confirmationDate: {
      type: Sequelize.DATE,
    },
    confirmationGenerated: {
      type: Sequelize.INTEGER,
    },
    dateOfProbationTriggerDate: {
      type: Sequelize.DATE,
    },
  });
  return employeeJobDetails;
};
