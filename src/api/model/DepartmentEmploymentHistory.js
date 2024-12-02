export default (sequelize, Sequelize) => {
    const departmentEmploymentHistory = sequelize.define("departmentemploymenthistory", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeId: {
        type: Sequelize.INTEGER,
      },
      companyId: {
        type: Sequelize.INTEGER,
      },
      buId: {
        type: Sequelize.INTEGER,
      },
      sbuId: {
        type: Sequelize.INTEGER,
      },
      buHRId: {
        type: Sequelize.INTEGER,
      },
      buHeadId: {
        type: Sequelize.INTEGER,
      },
      departmentId: {
        type: Sequelize.INTEGER,
      },
      functionalAreaId: {
        type: Sequelize.INTEGER,
      },
      fromDate: {
        type: Sequelize.DATE,
      },
      toDate: {
        type: Sequelize.DATE,
      },
      needAttendanceCron: {
        type: Sequelize.INTEGER,
      },
      isPromotion: {
        type: Sequelize.BOOLEAN,
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
    });
    return departmentEmploymentHistory;
  };