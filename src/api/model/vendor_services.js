export default (sequelize, Sequelize) => {
	const vendor_services = sequelize.define("vendor_services", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		vendor_id: {
			type: Sequelize.INTEGER,
		},
        service_id: {
			type: Sequelize.INTEGER,
		},
        status: {
			type: Sequelize.INTEGER,
		},
        updated_by: {
			type: Sequelize.INTEGER,
		},
        created_by: {
			type: Sequelize.INTEGER,
		},
		created_at: {
			type: Sequelize.DATE,
		},
		updated_at: {
			type: Sequelize.DATE,
		},
	},{
      tableName: "vendor_services",
      underscored: true,       // 🔥 IMPORTANT
      freezeTableName: true    // 🔥 IMPORTANT
    });
	return vendor_services;
};
