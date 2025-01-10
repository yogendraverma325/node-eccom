export default (sequelize, Sequelize) => {
    const extraPaymentAutoId = sequelize.define("extrapayment", {
      extraPaymentAutoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      EmployeeId: {
        type: Sequelize.INTEGER,
      },
      paymentMonth: {
        type: Sequelize.STRING,
      },
      paymentAmount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      category:{
        type: Sequelize.STRING,
      },
      empCode: {
        type: Sequelize.STRING,
      },
      financialYearId: {
        type:Sequelize.INTEGER
      },
      paymentType: {
        type: Sequelize.STRING
      },
      status:{
        type:Sequelize.INTEGER,
        default: 0
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
    return extraPaymentAutoId;
  };
  