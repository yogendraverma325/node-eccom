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
                                attributes: ["productAutoId", "name", "image","price","offerprice","description"],
                                where: {
                                    isActive: 1
                                }
                            }
                        ]
                    });
                    return cartList;
}