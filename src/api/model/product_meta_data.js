export default (sequelize, Sequelize) => {
	const product_meta_data = sequelize.define("product_meta_data", {
		product_meta_data_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		product_auto_id: {
            type: Sequelize.INTEGER,
        },
        meta_data: {
            type: Sequelize.STRING,
        },
		is_active: {
            type: Sequelize.INTEGER,
        },
          createdBy: {
            type: Sequelize.INTEGER,
        },
        updatedBy: {
            type: Sequelize.INTEGER,
        },
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return product_meta_data;
};
