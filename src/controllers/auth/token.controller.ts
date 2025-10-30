import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";
import { generateAccessToken } from "../../utils/jwt.ts";

export async function token(req: Request, res: Response) {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(403);

    // checkingn de l'existence du token dans la base de données
    const [rows] = await db.query<RowDataPacket[]>(
        "select * from refresh_token where token = ?",
        [refreshToken]
    );

    if (rows.length === 0)
        return res.status(401).json({ message: "Hacker detected." });

    jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET as string,
        (
            err: jwt.VerifyErrors | null,
            user: string | jwt.JwtPayload | undefined
        ) => {
            if (err) return res.sendStatus(403);

            const accessToken = generateAccessToken({
                id: (user as any).id,
            });
            res.json({ accessToken });
        }
    );
}
