export default (sequelize, Sequelize) => {
  const Confirmationinitiated = sequelize.define("confirmationinitiated", {
    confirmationinitiatedAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: Sequelize.INTEGER,
    },
    level: {
      type: Sequelize.INTEGER,
    },
    triggerDate: {
      type: Sequelize.DATE,
    },
    dueDate: {
      type: Sequelize.DATE,
    },
    onHold: {
      type: Sequelize.INTEGER,
    },
    holdEndDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    confirmationExtentionCount: {
      type: Sequelize.INTEGER,
    },
    confirmationExtentionCountAllowed: {
      type: Sequelize.INTEGER,
    },
    status: {
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
  return Confirmationinitiated;
};
