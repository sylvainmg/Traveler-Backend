import { Request, Response } from "express";
import { Admin, DBAdmin } from "../../models/admin.model.ts";
import { db } from "../../../config/db.ts";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import {
    generateAdminAccessToken,
    generateAdminRefreshToken,
} from "../../utils/jwt.ts";

export async function login(req: Request, res: Response) {
    const { email, password }: Admin = req.body;
    const [rows] = await db.query<Admin & RowDataPacket[]>(
        "select * from administrateur where email = ?",
        [email]
    );
    const user = rows[0] as DBAdmin;

    if (!user) return res.status(404).json({ message: "User not found." });

    const match = await bcrypt.compare(password, user.PASSWORD);
    if (!match) return res.status(401).json({ message: "Unauthorized." });
    else {
        const accessToken = generateAdminAccessToken({ id: user.ID_ADMIN });
        const refreshToken = generateAdminRefreshToken({ id: user.ID_ADMIN });

        // insert du refresh token dans la base de données
        await db.query<Admin & RowDataPacket[]>(
            "insert into admin_refresh_token values (?, ?)",
            [refreshToken, user.ID_ADMIN]
        );

        res.status(200).json({
            message: "Login successful.",
            accessToken,
            refreshToken,
        });
    }
}
