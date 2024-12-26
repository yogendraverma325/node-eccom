export default (sequelize, Sequelize) => {
    const costCenterEmploymentHistory = sequelize.define("costcenteremploymenthistory", {
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
      costId: {
        type: Sequelize.INTEGER,
      },
      oldCostId: {
        type: Sequelize.INTEGER
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
      sourceName: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
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
    return costCenterEmploymentHistory;
  };