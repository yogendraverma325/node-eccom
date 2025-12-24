export default (sequelize, Sequelize) => {
	const order_items = sequelize.define("order_items", {
		order_item_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        order_id:{
	       type: Sequelize.INTEGER,
		},
		product_auto_id:{
	       type: Sequelize.INTEGER,
		},
        price: {
          type: Sequelize.DOUBLE(10, 2),
         defaultValue: 0.00,
        },
        offerprice: {
         type: Sequelize.DOUBLE(10, 2),
         defaultValue: 0.00,
        },
        qty:{
            type: Sequelize.INTEGER,
        },
		item_total: {
         type: Sequelize.DOUBLE(10, 2),
         defaultValue: 0.00,
        },
        item_status: {
			type: Sequelize.STRING, // active / returned / cancelled
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
	return order_items;
};
