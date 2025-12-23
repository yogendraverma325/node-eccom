export default (sequelize, Sequelize) => {
	const specification_master = sequelize.define("specification_master", {
		specification_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        specification_name: {
            type: Sequelize.STRING,
        },
		is_active: {
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
	return specification_master;
};
