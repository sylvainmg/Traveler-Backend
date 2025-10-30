import { Request, Response } from "express";
import { Admin } from "../../models/admin.model.ts";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function logout(req: Request, res: Response) {
    const { id_admin }: Admin = req.body;
    if (!id_admin) return res.json({ message: "Id missing." });
    await db.query<Admin & RowDataPacket[]>(
        "delete from admin_refresh_token where id_admin = ?",
        [id_admin]
    );

    res.status(200).json({ message: "User logged out." });
}
