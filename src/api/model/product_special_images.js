export default (sequelize, Sequelize) => {
	const product_special_images = sequelize.define("product_special_images", {
		product_special_images_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		product_auto_id: {
            type: Sequelize.INTEGER,
        },
        image: {
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
	return product_special_images;
};
