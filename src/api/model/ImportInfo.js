export default (sequelize, Sequelize) => {
	const importInfo = sequelize.define("importInfo", {
    importAutoId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    importType: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    importTableName: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    importStatusDesc:{
        type: Sequelize.STRING(255),
        allowNull: true
    },
    importStatus:{
        type: Sequelize.INTEGER,
        default:0
    },
    isActive:{
        type:Sequelize.INTEGER,
        default:1,
    },
    companyId:{
        type:Sequelize.INTEGER,
        default:0,
    },
    buId:{
        type:Sequelize.INTEGER,
        default:0,
    },
    sbuId:{
        type:Sequelize.INTEGER,
        default:0,
    }

}, {
    tableName: "importInfo",
    timestamps: false
});
	return importInfo;
};
