export default (sequelize, Sequelize) => {
    const menu_item_prices = sequelize.define("menu_item_prices", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        menu_item_id: {
            type: Sequelize.INTEGER, // Link to menu_items
        },
        variant_name: {
            type: Sequelize.STRING, // "Half", "Full", "Single"
            defaultValue: "Full"
        },
        price: {
            type: Sequelize.DECIMAL(10, 2),
        },
        is_active: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
      
    });
    return menu_item_prices;
};