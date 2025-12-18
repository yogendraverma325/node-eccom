// services/authService.js
import db from "../../config/db.config.js";
let businessLogicCache = [];
export async function businessLogic(RECORDS='SHIPPING_DETAILS') {
     if (businessLogicCache.length==0) {
        const data = await db.business_logic.findAll({
            raw: true   // Sequelize instance ki jagah plain object
        });
        businessLogicCache = data;
    }
     return businessLogicCache.filter(
        item => item.records_for === RECORDS
    );
}