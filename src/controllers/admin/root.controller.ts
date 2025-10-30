import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function root(req: Request, res: Response) {
    const user = (req as any).user;
    const [rows] = await db.query<RowDataPacket[]>(
        "select id_admin, nom, prenom, email from administrateur where id_admin = ?",
        [user.id]
    );
    const admin = rows[0];

    res.status(200).json({
        message: "User logged in.",
        admin,
    });
}
