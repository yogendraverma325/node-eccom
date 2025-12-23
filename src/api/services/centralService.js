// services/authService.js
import db from "../../config/db.config.js";
let businessLogicCache = [];
let state=[];
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

export async function getState() {
     if (state.length==0) {
        const data = await db.stateMaster.findAll({
                where: {
                isActive:1
                },
                attributes: ["stateId", "stateCode","stateName"],
                raw: true   // Sequelize instance ki jagah plain object
        });
        state = data;
    }
    return state;
}
export async function getCity(stateId) {
  
        const data = await db.cityMaster.findAll({
                where: {
                isActive:1,
                stateId:stateId
                },
                attributes: ["cityId", "cityCode","cityName"],
                raw: true   // Sequelize instance ki jagah plain object
        });
      return data;
}
export async function getPincodes(cityId) {
        const data = await db.pinCodeMaster.findAll({
                where: {
                isActive:1,
                cityId:cityId
                },
                attributes: ["pincodeId", "pincode","areaName"],
                raw: true   // Sequelize instance ki jagah plain object
        });
      return data;
}