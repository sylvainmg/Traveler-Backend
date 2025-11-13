import { Request, Response } from "express";
import { db } from "../../../config/db.ts";

export default async function addAirline(req: Request, res: Response) {
    try {
        const { nom, date_convention } = req.body as {
            nom: string;
            date_convention: string;
        };

        const [airline] = await db.query(
            `insert into compagnie_aerienne (nom) values (?)`,
            [nom]
        );

        await db.query(
            `insert into convention_compagnie_aerienne (id_compagnie_aerienne, date_convention) values (?, ?)`,
            [(airline as any).insertId, date_convention]
        );

        res.json({
            message: "Record added.",
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({ error: err });
    }
}
