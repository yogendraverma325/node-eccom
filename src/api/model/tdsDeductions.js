export default (sequelize, Sequelize) => {
  const tdsDeductions = sequelize.define("tdsdeductions", {
    tdsDeductionAutoId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    EmployeeId: {
      type: Sequelize.INTEGER,
    },
    tdsMonth: {
      type: Sequelize.STRING,
    },
    tdsAmount: {
      type: Sequelize.DECIMAL(10, 2),
    },
    empCode: {
      type: Sequelize.STRING,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      default:null
    },
    createdAt: {
      type: Sequelize.DATE,
      default:null
    },
    updatedBy: {
      type: Sequelize.INTEGER,
      default:null
    },
    updatedAt: {
      type: Sequelize.DATE,
      default:null
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      default:0
    },
  });
  return tdsDeductions;
};
