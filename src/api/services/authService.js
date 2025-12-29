// services/authService.js
import db from "../../config/db.config.js";

export async function authenticateUser(email) {
    return await db.user.findOne({ where: { email } });
}