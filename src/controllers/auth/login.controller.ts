import { Request, Response } from "express";
import { Client, DBClient } from "../../models/client.model.ts";
import { db } from "../../../config/db.ts";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.ts";

export async function login(req: Request, res: Response) {
    const { email, password }: Client = req.body;
    const [rows] = await db.query<Client & RowDataPacket[]>(
        "select * from client where email = ?",
        [email]
    );
    const user = rows[0] as DBClient;

    if (!user) return res.status(404).json({ message: "User not found." });

    const match = await bcrypt.compare(password, user.PASSWORD);
    if (!match) return res.status(401).json({ message: "Unauthorized." });
    else {
        const accessToken = generateAccessToken({ id: user.ID_CLIENT });
        const refreshToken = generateRefreshToken({ id: user.ID_CLIENT });

        // insert du refresh token dans la base de données
        await db.query<Client & RowDataPacket[]>(
            "insert into refresh_token values (?, ?)",
            [refreshToken, user.ID_CLIENT]
        );

        res.status(200).json({
            message: "Login successful.",
            id: user.ID_CLIENT,
            accessToken,
            refreshToken,
        });
    }
}
