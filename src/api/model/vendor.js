export default (sequelize, Sequelize) => {
	const vendors = sequelize.define("vendors", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		vendor_name: {
			type: Sequelize.STRING,
		},
       	phone: {
			type: Sequelize.STRING,
		},
       	email: {
			type: Sequelize.STRING,
		},
        address: {
        type: Sequelize.STRING,
        },
        rating: {
			type: Sequelize.INTEGER,
		},
        status: {
			type: Sequelize.INTEGER,
		},
        city: {
         type: Sequelize.INTEGER,
        },
        updatedBy: {
			type: Sequelize.INTEGER,
		},
        createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return vendors;
};
