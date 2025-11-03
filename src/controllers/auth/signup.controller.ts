import { Request, Response } from "express";
import { Client } from "../../models/client.model.ts";
import { db } from "../../../config/db.ts";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.ts";

export async function signup(req: Request, res: Response) {
    const { code, nom, prenom, email, password }: Client = req.body;

    if (!code || !nom || !prenom || !email || !password)
        res.send("Incomplete credentials.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query<Client & RowDataPacket[]>(
        "insert into client (code, nom, prenom, email, password) values (?, ?, ?, ?, ?)",
        [code, nom.toUpperCase(), prenom, email, hashedPassword]
    );

    const userId = (result as any).insertId;

    const refreshToken = generateRefreshToken({ id: userId });
    const accessToken = generateAccessToken({ id: userId });

    // insert du refresh token dans la base de données
    await db.query<Client & RowDataPacket[]>(
        "insert into refresh_token values (?, ?)",
        [refreshToken, userId]
    );

    res.json({
        message: "User added.",
        id: userId,
        accessToken,
        refreshToken,
    });
}
