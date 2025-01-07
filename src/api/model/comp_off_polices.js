export default (sequelize, Sequelize) => {
  const comp_off_polices = sequelize.define("comp_off_polices", {
    comp_off_polices_auto_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(45),
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING(45),
    },
    per_month_comp_off_limit: {
      type: Sequelize.INTEGER,
    },
    comp_off_assignment_auto_id_for_policies: {
      type: Sequelize.STRING(45),
    },
    is_weekday_on: {
      type: Sequelize.INTEGER,
    },
    minimum_duration_for_halfday_on_weekday: {
      type: Sequelize.INTEGER,
    },
    minimum_duration_for_fullday_on_weekday: {
      type: Sequelize.INTEGER,
    },
    auto_approve_reject_weekday: {
      type: Sequelize.TINYINT,
    },
    auto_approve_reject_day_weekday: {
      type: Sequelize.INTEGER,
    },
    require_approval_weekday: {
      type: Sequelize.INTEGER,
    },
    approval_users_weekday: {
      type: Sequelize.STRING(45),
    },
    is_weekoff_on: {
      type: Sequelize.INTEGER,
    },
    minimum_duration_for_halfday_on_weekoff: {
      type: Sequelize.INTEGER,
    },
    minimum_duration_for_fullday_on_weekoff: {
      type: Sequelize.INTEGER,
    },
    auto_approve_reject_weekoff: {
      type: Sequelize.INTEGER,
    },
    auto_approve_reject_day_weekoff: {
      type: Sequelize.INTEGER,
    },
    require_approval_weekoff: {
      type: Sequelize.INTEGER,
    },
    approval_users_weekoff: {
      type: Sequelize.STRING(45),
    },
    is_holiday_on: {
      type: Sequelize.INTEGER,
    },
    minimum_duration_for_halfday_on_holiday: {
      type: Sequelize.INTEGER,
    },
    minimum_duration_for_fullday_on_holiday: {
      type: Sequelize.INTEGER,
    },
    auto_approve_reject_holiday: {
      type: Sequelize.INTEGER,
    },
    auto_approve_reject_day_holiday: {
      type: Sequelize.INTEGER,
    },
    require_approval_holiday: {
      type: Sequelize.INTEGER,
    },
    approval_users_holiday: {
      type: Sequelize.STRING(45),
    },
    effective_date: {
      type: Sequelize.DATE,
    },
    effective_untill_date: {
      type: Sequelize.DATE,
    },
  });
  return comp_off_polices;
};
