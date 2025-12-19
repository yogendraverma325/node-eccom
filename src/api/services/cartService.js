// services/authService.js
import db from "../../config/db.config.js";

export async function returnCartList(cartCookie) {
     let cartList = await db.cart.findAll({
                        where: {
                            userCookie: cartCookie
                        },
                        order: [["createdAt", "DESC"]],
                        include: [
                            {
                                model: db.product,
                                as: "cartProducts",
                                attributes: ["product_auto_id", "name", "image","price","offerprice","description","slug"],
                                where: {
                                    isActive: 1
                                }
                            }
                        ]
                    });
                    return cartList;
}