export default (sequelize, Sequelize) => {
  const employeeleave_revoke_transaction = sequelize.define('employeeleave_revoke_transaction', {
    leaverevokeAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    employeeleaveheaderID: {
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
    managerId: {
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
    tableName: 'employeeleave_revoke_transaction',
    timestamps: false
  });

  return employeeleave_revoke_transaction;
};
