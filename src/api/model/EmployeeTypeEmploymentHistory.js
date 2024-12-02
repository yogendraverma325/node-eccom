export default (sequelize, Sequelize) => {
    const employeeTypeEmploymentHistory = sequelize.define("employeetypeemploymenthistory", {
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
      employeeType: {
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
    return employeeTypeEmploymentHistory;
  };