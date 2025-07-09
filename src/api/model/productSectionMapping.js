export default (sequelize, Sequelize) => {
	const productSectionMapping = sequelize.define("productsectionmapping", {
		productSectionsAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		productAutoId: {
            type: Sequelize.INTEGER,
        },
        sectionId: {
            type: Sequelize.INTEGER,
        },
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return productSectionMapping;
};
