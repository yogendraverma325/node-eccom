export default (sequelize, Sequelize) => {
  const RegularizationRevokeTransaction = sequelize.define('regularization_revoke_transaction', {
    regularizeRevokeId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    attendanceAutoId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    employeeId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    regularizeId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    createrRemark: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    updatorRemark: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    updatedBy: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    regularizeManagerId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    creatorRole: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    updatorRole: {
      type: Sequelize.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'regularization_revoke_transaction',
    timestamps: false
  });

  return RegularizationRevokeTransaction;
};
