export default (sequelize, Sequelize) => {
  const comp_off_credit_history = sequelize.define("comp_off_credit_history", {
    comp_off_credit_history_auto_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attendanceAutoIdHistory: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    employee_Id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(10, 1),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    credit_for: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    total_hours: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    adjust_hours: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    expiry_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    taken_on: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    planned_message: {
      type: Sequelize.STRING,
    },
    message: {
      type: Sequelize.STRING,
    },
    approver_remark: {
      type: Sequelize.STRING,
    },
    comp_off_polices_auto_id_history: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    pending_at: {
      type: Sequelize.STRING,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  return comp_off_credit_history;
};
