export default (sequelize, Sequelize) => {
	const category = sequelize.define("category", {
		catAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		categoryName: {
			type: Sequelize.STRING,
		},
        image: {
			type: Sequelize.STRING,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return category;
};
