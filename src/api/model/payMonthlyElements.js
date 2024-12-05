export default (sequelize, Sequelize) => {
    const PayMonthlyElement  = sequelize.define("PayMonthlyElement", {
        payMonthlyElementAutoId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          empId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          empName: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          lopMonth: {
            type: Sequelize.STRING(45),
            allowNull: true
          },
          lopDays: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          arrearMonth: {
            type: Sequelize.STRING(45),
            allowNull: true
          },
          arrearDays: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          tdsMonth: {
            type: Sequelize.STRING(45),
            allowNull: true
          },
          tdsAmount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          payPackageAutoId: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          payPackageMonthlyCTC: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          payPackageEffectiveDate: {
            type: Sequelize.DATE,
            allowNull: true
          },
          payElementAmount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          salaryComponentAutoId: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          salaryComponentCode: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          salaryComponentAlias: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          salaryComponentEarningType: {
            type: Sequelize.STRING(50),
            allowNull: true
          },
          includeInPackage: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          elementMonthlyAmount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          totalExtraDeduction: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          extraDeductionCategories: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          payMonth:{
            type: Sequelize.STRING(50),
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          createdBy: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          updatedBy: {
            type: Sequelize.INTEGER,
            allowNull: true
          }
    });
    return PayMonthlyElement ;
  };