import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function getClientBookings(req: Request, res: Response) {
    try {
        const { id_client } = req.body as { id_client: number };
        const query_booking_total = `
        select count(*) reservation
        from client c
        join reservation r on r.id_client = c.id_client
        where c.id_client = ?
        `;
        const [totalResult] = await db.query<RowDataPacket[]>(
            query_booking_total,
            id_client
        );

        const query_booking_active = `
        select count(*) reservation_active
        from reservation r
        where date_add(r.date_reservation, interval r.duree_sejour day) >= curdate() and id_client = ?
        `;
        const [activeResult] = await db.query<RowDataPacket[]>(
            query_booking_active,
            id_client
        );

        const query_bookings = `
        select r.num_reservation, ca.libelle categorie, p1.nom pays_depart, p2.nom destination, h.nom hotel, ca1.nom compagnie_aerienne_aller,
        v1.prix prix_aller, ca2.nom compagnie_aerienne_retour, v2.prix prix_retour, ch.categorie categorie_chambre, ch.prix prix_chambre,
        r.debut_sejour, r.duree_sejour, v1.prix + v2.prix + r.duree_sejour * ch.prix total
        from reservation r
        join categorie ca on ca.code = r.code
        join client c on c.id_client = r.id_client
        join vol v1 on v1.num_vol = r.num_vol
        join vol v2 on v2.num_vol = r.num_vol_retourner
        join compagnie_aerienne ca1 on ca1.id_compagnie_aerienne = v1.id_compagnie_aerienne
        join compagnie_aerienne ca2 on ca2.id_compagnie_aerienne = v2.id_compagnie_aerienne
        join hotel h on h.id_hotel = r.id_hotel
        join chambre ch on ch.num_chambre = r.num_chambre
        join pays p1 on p1.code = v1.code
        join pays p2 on p2.code = v2.code 
        where r.id_client = ?
        `;
        const [reservations] = await db.query<RowDataPacket[]>(
            query_bookings,
            id_client
        );

        const total = totalResult[0].reservation;
        const active = activeResult[0].reservation_active;

        res.json({ total, active, reservations });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

export async function getClient(req: Request, res: Response) {
    try {
        const { id_client } = req.body as {
            id_client: number;
        };

        const [client] = await db.query<RowDataPacket[]>(
            "select client.prenom from client where id_client = ?",
            [id_client]
        );

        res.json({ prenom: (client[0] as any).prenom });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
}
