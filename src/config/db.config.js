/* eslint-disable no-undef */
import Sequelize from "sequelize";
import logger from "../helper/logger.js";
import category from "../api/model/category.js";
import product from "../api/model/product.js";
import sections from "../api/model/sections.js";
import productSectionMapping from "../api/model/productSectionMapping.js";
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
db.productSectionMapping = productSectionMapping(sequelize, Sequelize);

db.productSectionMapping.hasOne(db.product, {
	foreignKey: "productAutoId",
	sourceKey: "productAutoId",
	as: "sectionProducts",
});


export default db;
