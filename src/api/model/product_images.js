export default (sequelize, Sequelize) => {
	const product_images = sequelize.define("product_images", {
		product_image_auto_id: {
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
	return product_images;
};
