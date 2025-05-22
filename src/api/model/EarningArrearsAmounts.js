export default (sequelize, Sequelize) => {
	const earningarrearsamount = sequelize.define("earningarrearsamount", {
		arrearsDetailsAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		arrearName: {
			type: Sequelize.STRING,
		},
		arrearAmunt: {
			type: Sequelize.DECIMAL(10, 8),
		},
        type:{
            	type: Sequelize.STRING,
        },
          seq:{
            	type: Sequelize.INTEGER,
        },
           componentAutoId:{
            	type: Sequelize.INTEGER,
        },
        earningArrearAutoId:{
               	type: Sequelize.INTEGER,
        }
	});

	return earningarrearsamount;
};
