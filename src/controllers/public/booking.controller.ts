import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

interface Booking {
    pays_arrivee: string;
    pays_depart: string;
    ville: string;
    nom_hotel: string;
    nb_etoile: number;
    prix_chambre: string;
    disponibilite: string;
    date_vol: Date;
    prix_vol: string;
    heure_depart: string;
}

export async function getBookings(req: Request, res: Response) {
    try {
        const { pays_depart, pays_arrivee } = req.body as Booking;

        // Hotels query
        const hotelsQuery: string = `
        select h.id_hotel, p.nom, h.nom, h.nb_etoile, ch.categorie, ch.num_chambre, ch.prix 
        from hotel h
        join pays p on p.code = h.code
        join posseder po on po.id_hotel = h.id_hotel
        join chambre ch on ch.num_chambre = po.num_chambre
        where h.code_avoir = 'AV' and p.nom = ? 
        `;

        const [hotels] = await db.query<RowDataPacket[]>(hotelsQuery, [
            pays_arrivee,
        ]);

        // Airlines query
        const airlinesQuery: string = `
        select v.num_vol, v.date_vol, v.heure_depart, v.prix, p.nom pays_depart, p2.nom pays_arrivee, ca.nom compagnie_aerienne
        from vol v
        join compagnie_aerienne ca on ca.id_compagnie_aerienne = v.id_compagnie_aerienne
        join pays p on p.code = v.code_decoller
        join pays p2 on p2.code = v.code
        where v.date_vol >= curdate() and p.nom = ? and p2.nom = ?
        `;

        const [airlines] = await db.query<RowDataPacket[]>(airlinesQuery, [
            pays_depart,
            pays_arrivee,
        ]);

        // Algorithme de triage des vols
        const flights = [];
        for (const flight of airlines) {
            for (
                let i = airlines.indexOf(flight) + 1;
                i < airlines.length;
                i++
            ) {
                const date_vol_aller = flight.date_vol as Date;
                const date_vol_retour = airlines[i].date_vol as Date;

                if (date_vol_retour <= date_vol_aller) continue;

                const obj = {
                    vol_aller: flight,
                    vol_retour: airlines[i],
                };

                flights.push(obj);
            }
        }

        res.json({
            vols: flights,
            hotels,
        });
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

interface CreateBooking {
    num_vol: number;
    num_vol_retourner: number;
    num_chambre: number;
    id_client: number;
    code: string;
}

export async function createBooking(req: Request, res: Response) {
    try {
        const { num_vol, num_vol_retourner, num_chambre, id_client, code } =
            req.body as CreateBooking;

        const date_reservation = new Date().toISOString().split("T")[0];

        const query = `
        insert into reservation (num_vol, num_vol_retourner, num_chambre, id_hotel, id_client, code, date_reservation, debut_sejour, duree_sejour) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const id_hotel_query = await db.query<RowDataPacket[]>(
            `
            select h.id_hotel
            from hotel h
            join posseder po on po.id_hotel = h.id_hotel
            join chambre ch on ch.num_chambre = po.num_chambre
            where ch.num_chambre = ?
            `,
            [num_chambre]
        );
        const id_hotel = (id_hotel_query[0][0] as any).id_hotel;

        const debut_query = await db.query<RowDataPacket[]>(
            `select date_vol from vol where num_vol = ?`,
            [num_vol]
        );

        const debut_sejour = new Date((debut_query[0][0] as any).date_vol);

        const fin_query = await db.query<RowDataPacket[]>(
            `select date_vol from vol where num_vol = ?`,
            [num_vol_retourner]
        );
        const fin_sejour = new Date((fin_query[0][0] as any).date_vol);

        const duree_sejour =
            (fin_sejour.getTime() - debut_sejour.getTime()) /
            (1000 * 60 * 60 * 24);

        await db.query(query, [
            num_vol,
            num_vol_retourner,
            num_chambre,
            id_hotel,
            id_client,
            code,
            date_reservation,
            debut_sejour.toISOString().split("T")[0],
            duree_sejour,
        ]);

        res.status(200).json({ message: "Booking successfully added." });
    } catch (err) {
        res.status(400).json({ client_error: String(err) });
    }
}
