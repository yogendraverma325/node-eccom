export default (sequelize, Sequelize) => {
    const PayMonthlyElement  = sequelize.define("paymonthlyelement", {
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
            type: Sequelize.DECIMAL(10,2),
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
          ptAmount:{
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          lwfAmount:{
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          extraPaymentAmount:{
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          isPfApplicable:{
            type:Sequelize.INTEGER
          },
          isPfRestriction:{
            type:Sequelize.INTEGER
          },
          isPfApplicableComponent:{
            type:Sequelize.INTEGER
          },
          isEsicApplicable:{
            type:Sequelize.INTEGER
          },
          isEsicApplicableComponent:{
            type:Sequelize.INTEGER
          },
          pfApplicable15000AndNoRestriction:{
            type:Sequelize.INTEGER,
            default:0,
          },
          esicEmployerAmount:{
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          esicEmployeeAmount:{
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          pfEmployeeAmount:{
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          pfEmployerAmount:{
            type: Sequelize.DECIMAL(10, 2),
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
          },
          payMonth:{
            type: Sequelize.STRING,
            allowNull: true
          },
          processId:{
            type: Sequelize.INTEGER,
            allowNull: false
          }


    });
    return PayMonthlyElement ;
  };

  // empCopntWiseDetl["isEsicApplicable"]=lwfDeducationDetails.esicApplicable;
  // empCopntWiseDetl["esicApplicableComponent"]=pafApplicableComponet;