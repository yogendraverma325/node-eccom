export default (sequelize, Sequelize) => {
    const ServiceMaster = sequelize.define("service_master", {
        serviceId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        serviceName: { type: Sequelize.STRING }, // e.g., 'Car Rental'
        serviceSlug: { type: Sequelize.STRING, unique: true }, // e.g., 'car-rental'
        category: { type: Sequelize.STRING }, // 'transport', 'stay', etc.
        isActive: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
    return ServiceMaster;
};