import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function getHotels(req: Request, res: Response) {
    try {
        const { pays } = req.body as { pays: string };
        const [hotels] = await db.query<RowDataPacket[]>(
            `
        select h.nom, h.nb_etoile, p.nom pays, p.ville, ch.categorie categorie_chambre, ch.prix 
        from hotel h
        join pays p on p.code = h.code
        join posseder po on po.id_hotel = h.id_hotel
        join chambre ch on ch.num_chambre = po.num_chambre
        where p.nom = ?
        `,
            [pays]
        );

        res.json(hotels);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}
