export default (sequelize, Sequelize) => {
  const Confirmationformfilledvalues = sequelize.define(
    "confirmationformfilledvalues",
    {
      confirmationformfilledvaluesAutoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      confirmationinitiatedAutoId: {
        type: Sequelize.INTEGER,
      },
      confirmationFormGroupId: {
        type: Sequelize.INTEGER,
      },
      confirmatoinformfieldsAutoId: {
        type: Sequelize.INTEGER,
      },
      employeeId: {
        type: Sequelize.INTEGER,
      },
      values: {
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
    }
  );
  return Confirmationformfilledvalues;
};
