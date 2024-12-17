export default (sequelize, Sequelize) => {
  const attendanceHistory = sequelize.define("attendanceHistory", {
    attendanceHistoryId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
    },
    time: {
      type: Sequelize.STRING,
    },
    lat: {
      type: Sequelize.STRING,
    },
    long: {
      type: Sequelize.STRING,
    },
    location: {
      type: Sequelize.STRING,
    },
    device: {
      type: Sequelize.STRING,
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
    attendanceStatus: {
      type: Sequelize.STRING
    },
    locationType: {
      type: Sequelize.STRING,
    },
    userRemark: {
      type: Sequelize.STRING,
    },
    approverRemark: {
      type: Sequelize.STRING,
    },
    shiftId: {
      type: Sequelize.INTEGER,
    },
    attendancePolicyId: {
      type: Sequelize.INTEGER,
    },
    weekOffId: {
      type: Sequelize.INTEGER,
    },
    companyLocationId: {
      type: Sequelize.INTEGER,
    },
  });
  return attendanceHistory;
};
