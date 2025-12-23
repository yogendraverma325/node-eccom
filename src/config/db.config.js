/* eslint-disable no-undef */
import Sequelize from "sequelize";
import logger from "../helper/logger.js";
import category from "../api/model/category.js";
import product from "../api/model/product.js";
import sections from "../api/model/sections.js";
import productSectionMapping from "../api/model/productSectionMapping.js";
import business_logic from "../api/model/businesslogic.js"
import productcategorymappings from "../api/model/productCategoryMapping.js"
import product_feature_mapping from "../api/model/productFeatures.js"
import product_specification_mapping from "../api/model/product_specification_mapping.js"
import specification_master from "../api/model/specification_master.js"
import product_images from "../api/model/product_images.js";
import product_meta_data from "../api/model/product_meta_data.js";
import cart from "../api/model/cart.js";
import user from "../api/model/user.js";
import literal from "sequelize";
import QueryTypes from "sequelize";
//
const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		port: process.env.DB_PORT,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
		define: {
			charset: "utf8",
			collate: "utf8_general_ci",
			freezeTableName: true,
			timestamps: false,
		},
		pool: {
			max: 2000,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
		logging: false,
		timezone: "+05:30",
	},
);

sequelize
	.authenticate()
	.then(() => {
		logger.info(
			`DB Connection Success --> ${process.env.DB_NAME} (${process.env.DB_USER})`,
		);
		console.log(
			`DB Connection Success --> ${process.env.DB_NAME} (${process.env.DB_USER})`,
		);
	})
	.catch((error) => {
		logger.error(`DB Connection Failed --> ${error}`);
		console.log(
			`DB Connection Failed --> {(${error.name})<<--->>(${error.message})}`,
		);
	});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.literal = literal;
db.QueryTypes = QueryTypes;
db.category = category(sequelize, Sequelize);
db.product = product(sequelize, Sequelize);
db.sections = sections(sequelize, Sequelize);
db.cart = cart(sequelize, Sequelize);
db.user = user(sequelize, Sequelize);
db.productSectionMapping = productSectionMapping(sequelize, Sequelize);
db.business_logic=business_logic(sequelize, Sequelize);
db.productcategorymappings=productcategorymappings(sequelize, Sequelize);
db.product_feature_mapping=product_feature_mapping(sequelize, Sequelize)
db.product_specification_mapping=product_specification_mapping(sequelize, Sequelize);
db.specification_master=specification_master(sequelize, Sequelize);
db.product_images=product_images(sequelize, Sequelize);
db.product_meta_data=product_meta_data(sequelize, Sequelize);
// Mapping belongs to Product
db.productSectionMapping.belongsTo(db.product, { 
    foreignKey: 'product_auto_id', // Model mein jo key hai
    targetKey: 'product_auto_id',  // Product table ki primary key
    as: 'sectionProducts' 
});

// Product has many mappings
db.product.hasMany(db.productSectionMapping, { 
    foreignKey: 'product_auto_id',
    sourceKey: 'product_auto_id'
})

db.cart.hasOne(db.product, {
	foreignKey: "product_auto_id",
	sourceKey: "product_auto_id",
	as: "cartProducts",
});


// Relationships (Associations)
// Product -> Mapping Relationship
db.product.hasMany(db.productcategorymappings, { 
    foreignKey: 'product_auto_id', // Mapping table ka column
    sourceKey: 'product_auto_id',    // Product table ki Primary Key
    as: 'mappings' 
});

// 2. Mapping belongs to Product
db.productcategorymappings.belongsTo(db.product, { 
    foreignKey: 'product_auto_id', // Mapping table ka column
    targetKey: 'product_auto_id',    // Product table ki Primary Key
    as: 'productDetails' 
});

// Category -> Mapping Relationship
db.category.hasMany(db.productcategorymappings, { 
   foreignKey: 'category_id', // Child table ka column
    sourceKey: 'catAutoId',    // Parent table ka column
    as: 'productMappings' 
});
db.productcategorymappings.belongsTo(db.category, { 
   foreignKey: 'category_id', // Child table (Mapping) ka column
    targetKey: 'catAutoId'      // Parent table (Category) ka column
});

db.product.hasMany(db.product_feature_mapping, {
    foreignKey: 'product_auto_id',
});

db.product.hasMany(db.product_specification_mapping, {
    foreignKey: 'product_auto_id',
	as: 'specifications'
});

db.specification_master.hasMany(db.specification_master, {
	foreignKey: 'specification_auto_id',
	as: 'productSpecifications'
});

db.product_specification_mapping.belongsTo(db.product, {
foreignKey: 'product_auto_id'
});

db.product_specification_mapping.belongsTo(db.specification_master, {
foreignKey: 'specification_auto_id',
as: 'specification'
});
db.product.hasMany(db.product_images, {
    foreignKey: 'product_auto_id',
});
db.product.hasMany(db.product_meta_data, {
    foreignKey: 'product_auto_id',
});

export default db;
