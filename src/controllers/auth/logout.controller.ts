import { Request, Response } from "express";
import { Client, DBClient } from "../../models/client.model.ts";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function logout(req: Request, res: Response) {
    const { id_client }: Client = req.body;
    if (!id_client) return res.json({ message: "Id missing." });
    await db.query<Client & RowDataPacket[]>(
        "delete from refresh_token where id_client = ?",
        [id_client]
    );

    res.status(200).json({ message: "User logged out." });
}
