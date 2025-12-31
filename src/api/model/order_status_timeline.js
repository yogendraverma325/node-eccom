export default (sequelize, Sequelize) => {
	const order_status_timeline = sequelize.define("order_status_timeline", {
		order_status_timeline_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        order_id:{
	       type: Sequelize.INTEGER,
		},
       
        status: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
    
		 reason: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
		remark: {
        type: Sequelize.STRING, // active / returned / cancelled
        },
		createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
	});
	return order_status_timeline;
};
