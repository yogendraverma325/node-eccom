// services/authService.js
import db from "../../config/db.config.js";

export async function authenticateUser(email, password) {
    return await db.user.findOne({ where: { email, password } });
}