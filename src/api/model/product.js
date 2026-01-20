export default (sequelize, Sequelize) => {
	const product = sequelize.define("product", {
		product_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
		},
        description: {
			type: Sequelize.STRING,
		},
        image: {
			type: Sequelize.STRING,
		},
		 slug: {
			type: Sequelize.STRING,
		},
        price: {
            type: Sequelize.DOUBLE(10, 2),
            defaultValue: 0.00,
		},
        offerprice: {
            type: Sequelize.DOUBLE(10, 2),
            defaultValue: 0.00,
		},
        rating: {
            type: Sequelize.INTEGER,
        },
		review: {
            type: Sequelize.INTEGER,
        },
		for_gender: {
            type: Sequelize.INTEGER,
        },
		gender_applicability: {
			type: Sequelize.STRING,
		},
		variant_available: {
            type: Sequelize.INTEGER,
        },
		long_description: {
			type: Sequelize.STRING,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		 
		price_type: {
		type: Sequelize.STRING,  // 'per_hour','per_day','per_night', 'per_person','per_item','fixed'
		},
		capacity: {
		type: Sequelize.STRING,  //  -- optional
		},
		unit: {
		type: Sequelize.STRING,  //  AC / Non-AC / 4 Seater / Veg / Non-Veg
		},
		vendor_service_id: {
		type: Sequelize.INTEGER,
		},
	});
	return product;
};
