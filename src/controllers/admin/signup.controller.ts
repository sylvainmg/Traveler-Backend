import { Request, Response } from "express";
import { Admin } from "../../models/admin.model.ts";
import { db } from "../../../config/db.ts";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import {
    generateAdminAccessToken,
    generateAdminRefreshToken,
} from "../../utils/jwt.ts";

export async function signup(req: Request, res: Response) {
    const { nom, prenom, email, password }: Admin = req.body;

    if (!nom || !prenom || !email || !password)
        res.send("Incomplete credentials.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query<Admin & RowDataPacket[]>(
        "insert into administrateur (nom, prenom, email, password) values (?, ?, ?, ?)",
        [nom.toUpperCase(), prenom, email, hashedPassword]
    );

    const userId = (result as any).insertId;

    const refreshToken = generateAdminRefreshToken({ id: userId });
    const accessToken = generateAdminAccessToken({ id: userId });

    // insert du refresh token dans la base de données
    await db.query<Admin & RowDataPacket[]>(
        "insert into admin_refresh_token values (?, ?)",
        [refreshToken, userId]
    );

    res.json({
        message: "User added.",
        accessToken,
        refreshToken,
    });
}
