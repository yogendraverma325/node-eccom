export default (sequelize, Sequelize) => {
  const Confirmationowners = sequelize.define("confirmationowners", {
    confirmationownersAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: Sequelize.INTEGER,
    },
    confirmationinitiatedAutoId: {
      type: Sequelize.INTEGER,
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
  });
  return Confirmationowners;
};
