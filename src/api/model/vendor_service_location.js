export default (sequelize, Sequelize) => {
	const vendor_services_locations = sequelize.define("vendor_services_locations", {
		vendor_services_locations_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		vendor_service_auto_id: {
			type: Sequelize.INTEGER,
		},
        city_id: {
			type: Sequelize.INTEGER,
		},
		branch_address: {
		type: Sequelize.STRING,
		},

        updated_by: {
			type: Sequelize.INTEGER,
		},
         status: {
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
      tableName: "vendor_services_locations",
      underscored: true,       // 🔥 IMPORTANT
      freezeTableName: true    // 🔥 IMPORTANT
    });
	return vendor_services_locations;
};
