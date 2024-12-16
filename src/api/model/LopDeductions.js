export default (sequelize, Sequelize) => {
  const lopDeductions = sequelize.define("lopdeductions", {
    lopAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    EmployeeId: {
      type: Sequelize.INTEGER,
    },
    lopMonth: {
      type: Sequelize.STRING,
    },
    lopDays: {
      type: Sequelize.INTEGER,
    },
    empCode:{
      type: Sequelize.STRING,
      default:null
    },
    createdBy: {
      type: Sequelize.INTEGER,
      default: null,
    },
    createdAt: {
      type: Sequelize.DATE,
      default: null,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
      default: null,
    },
    updatedAt: {
      type: Sequelize.DATE,
      default: null,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      default: 0,
    },
  });
  return lopDeductions;
};
