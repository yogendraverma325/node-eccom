export default (sequelize, Sequelize) => {
	const category = sequelize.define("category", {
		catAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		parent:{
	       type: Sequelize.INTEGER,
		},
		categoryName: {
			type: Sequelize.STRING,
		},
		slug: {
			type: Sequelize.STRING,
		},
        image: {
			type: Sequelize.STRING,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		is_price_allowed_to_display: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		is_details_page_allowed: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		service_scope_name: {
			type: Sequelize.STRING,
		},
        service_scope_type: {
			type: Sequelize.STRING,
		},
		hide_contact_details: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
	});
	return category;
};
