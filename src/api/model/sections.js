export default (sequelize, Sequelize) => {
	const sections = sequelize.define("sections", {
		sectionsAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
            type: Sequelize.STRING,
        },
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return sections;
};
