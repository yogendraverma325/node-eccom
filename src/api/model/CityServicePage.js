export default (sequelize, Sequelize) => {
    const CityServicePage = sequelize.define("city_service_pages", {
        pageId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // SEO Columns
        seoTitle: { type: Sequelize.STRING },
        metaDesc: { type: Sequelize.TEXT },
        h1Heading: { type: Sequelize.STRING },
        pageContent: { type: Sequelize.TEXT('long') },
        tags: { type: Sequelize.STRING }, // Comma separated keywords
        
        // UI & Linking
        bannerImg: { type: Sequelize.STRING },
        listingLink: { type: Sequelize.STRING }, // /listings/cars/mathura
        buttonText: { type: Sequelize.STRING, defaultValue: 'Book Now' }
    });
    return CityServicePage;
};