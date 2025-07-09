export default (sequelize, Sequelize) => {
	const users = sequelize.define("users", {
		userId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return users;
};
