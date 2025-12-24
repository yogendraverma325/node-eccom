export default (sequelize, Sequelize) => {
	const orders = sequelize.define("orders", {
		order_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        order_number: {
			type: Sequelize.STRING,
		},
		user_id:{
	       type: Sequelize.INTEGER,
		},
        subtotal: {
        type: Sequelize.DOUBLE(10, 2),
        defaultValue: 0.00,
        },
        discount_amount: {
        type: Sequelize.DOUBLE(10, 2),
        defaultValue: 0.00,
        },
        shipping_amount: {
        type: Sequelize.DOUBLE(10, 2),
        defaultValue: 0.00,
        },
        grand_total: {
        type: Sequelize.DOUBLE(10, 2),
        defaultValue: 0.00,
        },
		coupon_code: {
			type: Sequelize.STRING,
		},
        payment_method: {
          type: Sequelize.STRING,  // POD / Online
        },
        payment_status: {
          type: Sequelize.STRING,  //  pending / paid / failed
        },
        order_status: {
         type: Sequelize.STRING,  //  -- placed / shipped / delivered / cancelled 
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
	return orders;
};
