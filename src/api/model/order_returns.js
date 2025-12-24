export default (sequelize, Sequelize) => {
	const order_returns = sequelize.define("order_returns", {
		return_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        order_item_id:{
	       type: Sequelize.INTEGER,
		},
        return_qty: {
        type: Sequelize.INTEGER, 
        },
        return_reason: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
        return_status: {
        type: Sequelize.STRING, // requested / approved / rejected / refunded
        },
        refund_amount: {
         type: Sequelize.DOUBLE(10, 2),
         defaultValue: 0.00,
        },
        refund_mode: {
        type: Sequelize.STRING, // original / wallet / bank
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
	return order_returns;
};
