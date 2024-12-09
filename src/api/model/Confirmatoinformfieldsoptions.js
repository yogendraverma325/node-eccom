export default (sequelize, Sequelize) => {
  const Confirmatoinformfieldsoptions = sequelize.define(
    "confirmatoinformfieldsoptions",
    {
      confirmatoinformfieldsoptionsAutoID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      confirmatoinformfieldsAutoId: {
        type: Sequelize.INTEGER,
      },
      value: {
        type: Sequelize.STRING,
      },
      label: {
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
  Confirmatoinformfieldsoptions.addScope("latest", {
    order: [["createdAt", "DESC"]],
  });
  return Confirmatoinformfieldsoptions;
};
