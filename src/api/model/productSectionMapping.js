export default (sequelize, Sequelize) => {
	const productSectionMapping = sequelize.define("productsectionmapping", {
		productSectionsAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		product_auto_id: {
            type: Sequelize.INTEGER,
			field: 'product_auto_id'
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
