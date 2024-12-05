export default (sequelize, Sequelize) => {
    const payProcessFlowMaster = sequelize.define("PayProcessFlowMaster", {
        payProcessFlowMasterAutoId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        currentstatus: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        nextstatus: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        refferenceFlowId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        accessRoleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        endOfFlow: {
          type: Sequelize.INTEGER,
          allowNull: false,
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
          }
      });
    return payProcessFlowMaster;
  };
  