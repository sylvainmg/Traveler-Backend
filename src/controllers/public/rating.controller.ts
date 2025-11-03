import { Request, Response } from "express";
import { db } from "../../../config/db.ts";

interface Rating {
    num_reservation: number;
    note_hotel: number;
    avis_hotel: string;
    note_compagnie_aerienne_aller: number;
    avis_compagnie_aerienne_aller: string;
    note_compagnie_aerienne_retour: number;
    avis_compagnie_aerienne_retour: string;
}

export async function createRating(req: Request, res: Response) {
    try {
        const {
            num_reservation,
            note_hotel,
            avis_hotel,
            note_compagnie_aerienne_aller,
            avis_compagnie_aerienne_aller,
            note_compagnie_aerienne_retour,
            avis_compagnie_aerienne_retour,
        } = req.body as Rating;

        const query = `
        insert into evaluation (num_reservation, note_hotel, avis_hotel, note_compagnie_aerienne_aller, avis_compagnie_aerienne_aller, note_compagnie_aerienne_retour, avis_compagnie_aerienne_retour) values (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            num_reservation,
            note_hotel,
            avis_hotel,
            note_compagnie_aerienne_aller,
            avis_compagnie_aerienne_aller,
            note_compagnie_aerienne_retour,
            avis_compagnie_aerienne_retour,
        ]);

        res.json({ message: "Rating successfully posted." });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}
