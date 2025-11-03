import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function getAirlines(req: Request, res: Response) {
    try {
        const [airlines] = await db.query<RowDataPacket[]>(
            `
        select ca.nom, p.nom pays
        from compagnie_aerienne ca
        join desservir d on d.id_compagnie_aerienne = ca.id_compagnie_aerienne
        join pays p on p.code = d.code
        `
        );

        res.json(airlines);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}
