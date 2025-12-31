export default (sequelize, Sequelize) => {
	const contact_us = sequelize.define("contact_us", {
		contact_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
		},
		email: {
			type: Sequelize.STRING,
		},
		phone: {
			type: Sequelize.STRING,
		},
        message: {
			type: Sequelize.STRING,
		},
        subject: {
			type: Sequelize.STRING,
		},
        is_read: {
        type: Sequelize.INTEGER,
        },
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		
	});
	return contact_us;
};
