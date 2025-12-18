// services/authService.js
import db from "../../config/db.config.js";

export async function getCategories(parent,limit) {
    const categories = await db.category.findAll({
                            attributes: ["catAutoId", "categoryName", "image","slug"],
                            where: {
                                isActive: 1,
                                parent:parent
                            },
                           ...(limit > 0 && { limit: parseInt(limit) })
                        });
     return categories;
}