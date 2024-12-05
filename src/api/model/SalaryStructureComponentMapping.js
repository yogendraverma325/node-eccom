export default (sequelize, Sequelize) => {
    const salarystructurecomponentmapping = sequelize.define("salarystructurecomponentmapping", {
      salaryStructurecomponentmappingAutoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      salaryComponentAutoId: {
        type: Sequelize.INTEGER,
      },
      salaryStructureAutoId:{
        type: Sequelize.INTEGER,
      },
      createdAt: {
        type: Sequelize.DATE
      },
      createdBy: {
        type: Sequelize.INTEGER,
      },
      updatedBy: {
        type: Sequelize.INTEGER,
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      isActive: {
        type: Sequelize.BOOLEAN
      }
    });
    return salarystructurecomponentmapping;
  };
  