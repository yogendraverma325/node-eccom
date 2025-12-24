export default (sequelize, Sequelize) => {
	const order_shipping = sequelize.define("order_shipping", {
		order_shipping_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        order_id:{
	       type: Sequelize.INTEGER,
		},
        full_name: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
        mobile: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
        address: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
        landmark: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
        state:{
            type: Sequelize.INTEGER,
        },
		city:{
            type: Sequelize.INTEGER,
        },
        pincode:{
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
	return order_shipping;
};
