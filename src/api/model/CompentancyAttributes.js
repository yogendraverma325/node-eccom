export default (sequelize, Sequelize) => {
	const CompentancyAttributes = sequelize.define("compentancyattributes", {
		compAttributesId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		compentancyTierId: {
			type: Sequelize.INTEGER,
		},
		compAttrName: {
			type: Sequelize.STRING,
		},
		compAttrDescription: {
			type: Sequelize.TEXT,
		},
		compAttrID: {
			type: Sequelize.STRING,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
		},
	});
	return CompentancyAttributes;
};
