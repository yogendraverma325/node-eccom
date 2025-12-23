export default (sequelize, Sequelize) => {
	const product_specification_mapping = sequelize.define("product_specification_mapping", {
		product_specification_mapping_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		product_auto_id: {
            type: Sequelize.INTEGER,
        },
        specification_auto_id: {
            type: Sequelize.INTEGER,
        },
        specification_value: {
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
	return product_specification_mapping;
};
