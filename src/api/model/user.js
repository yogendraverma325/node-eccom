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
		email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
		password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
		is_active:{
			type: Sequelize.INTEGER,
		},
		last_login: {
			type: Sequelize.DATE,
		},
		otp_count_of_the_date: {
			type: Sequelize.INTEGER,
		},
		otp_date: {
			type: Sequelize.DATE,
		},
		otp:{
			type: Sequelize.STRING,
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
