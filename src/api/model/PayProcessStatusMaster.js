export default (sequelize, Sequelize) => {
  const payProcessStatusMaster = sequelize.define("PayProcessMaster", {
    payProcessStatusAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    isActive: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    currentRemark: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    nextRemark: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
  });
  return payProcessStatusMaster;
};
