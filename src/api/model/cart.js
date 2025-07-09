export default (sequelize, Sequelize) => {
	const usercart = sequelize.define("usercart", {
		usercartAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userCookie: {
            type: Sequelize.STRING,
            allowNull: false,
        },
		productAutoId: {
			type: Sequelize.INTEGER
		},
		qty: {
			type: Sequelize.INTEGER
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return usercart;
};
