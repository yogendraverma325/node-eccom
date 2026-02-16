export default (sequelize, Sequelize) => {
    const menu_items = sequelize.define("menu_items", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_auto_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        category_id: {
            type: Sequelize.INTEGER, // Link to menu_categories
        },
        name: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.TEXT, // Thali details store karne ke liye
        },
        is_active: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
      
    });
    return menu_items;
};