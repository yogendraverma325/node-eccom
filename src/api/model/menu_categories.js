export default (sequelize, Sequelize) => {
    const menu_categories = sequelize.define("menu_categories", {
        category_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_auto_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        category_name: {
            type: Sequelize.STRING,
        },
        is_active: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
       
    });
    return menu_categories;
};