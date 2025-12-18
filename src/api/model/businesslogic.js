export default (sequelize, Sequelize) => {
	const business_logic = sequelize.define("business_logic", {
		business_logic_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
        records_for: {
        type: Sequelize.STRING,
        allowNull: false,
        },
        key: {
        type: Sequelize.STRING,
        },
        value_type: {
        type: Sequelize.STRING,
        },
        value: {
        type: Sequelize.STRING,
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
	return business_logic;
};
