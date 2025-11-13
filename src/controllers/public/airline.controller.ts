import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";
import generateUrl from "../../utils/generateUrl.ts";

export async function getAirlines(req: Request, res: Response) {
    try {
        const [airlines] = await db.query<RowDataPacket[]>(
            `
        select ca.nom, p.nom pays, p.ville
        from compagnie_aerienne ca
        join desservir d on d.id_compagnie_aerienne = ca.id_compagnie_aerienne
        join pays p on p.code = d.code
        `
        );

        for (let i = 0; i < airlines.length; i++) {
            airlines[i].image = generateUrl(
                `cities/${encodeURIComponent(airlines[i].ville)}.jpg`
            );
        }

        res.json(airlines);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}
