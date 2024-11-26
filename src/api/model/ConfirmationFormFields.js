export default (sequelize, Sequelize) => {
  const Confirmatoinformfields = sequelize.define("confirmatoinformfields", {
    confirmatoinformfieldsAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    label: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    fieldType: {
      type: Sequelize.STRING,
    },
    heading: {
      type: Sequelize.STRING,
    },
    errorMessage: {
      type: Sequelize.STRING,
    },

    isRequired: {
      type: Sequelize.INTEGER,
    },
    md: {
      type: Sequelize.INTEGER,
    },
    sm: {
      type: Sequelize.INTEGER,
    },
    minValueLimit: {
      type: Sequelize.INTEGER,
    },
    maxValueLimit: {
      type: Sequelize.INTEGER,
    },
    confirmationFormGroupId: {
      type: Sequelize.INTEGER,
    },
    level: {
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
  return Confirmatoinformfields;
};
