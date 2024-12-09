export default (sequelize, Sequelize) => {
  const Confirmationassignment = sequelize.define("confirmationassignment", {
    confirmationAssignmentAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    code: {
      type: Sequelize.STRING,
    },
    jobLevelId: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
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
  return Confirmationassignment;
};
