export default (sequelize, Sequelize) => {
    const designationEmploymentHistory = sequelize.define("designationemploymenthistory", {
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
      designation_id: {
        type: Sequelize.INTEGER,
      },
      needAttendanceCron: {
        type: Sequelize.INTEGER,
      },
      fromDate: {
        type: Sequelize.DATE,
      },
      toDate: {
        type: Sequelize.DATE,
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
    return designationEmploymentHistory;
  };