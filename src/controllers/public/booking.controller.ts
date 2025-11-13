import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";
import mailer from "../../utils/mailer.ts";

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

        const [result] = await db.query(query, [
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

        /* E-mail */
        /* ********************************************************************************************* */

        const query_bookings = `
        select c.email, c.nom, c.prenom, ca.libelle categorie, p1.nom pays_depart, p2.nom destination, h.nom hotel, h.nb_etoile, pa.nom pays, pa.ville, ca1.nom compagnie_aerienne_aller,
        v1.num_vol num_vol_aller, v1.prix prix_aller, v1.heure_depart heure_depart, ca2.nom compagnie_aerienne_retour, v2.num_vol num_vol_retour, 
        v2.prix prix_retour, v2.heure_depart heure_retour, ch.categorie categorie_chambre, ch.prix prix_chambre,
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
        join pays p1 on p1.code = v1.code_decoller
        join pays p2 on p2.code = v2.code 
        join pays pa on pa.code = h.code
        where r.id_client = ? and r.num_reservation = ?
        `;
        const [reservations] = await db.query<RowDataPacket[]>(query_bookings, [
            id_client,
            (result as any).insertId,
        ]);

        const formatDate = (date: Date) => {
            return `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        };

        const addDays = (date: Date, n: number) =>
            new Date(date.getTime() + n * 1000 * 60 * 60 * 24);

        mailer(
            reservations[0].email,
            `${reservations[0].nom} ${reservations[0].prenom}`,
            (result as any).insertId,
            reservations[0].destination,
            formatDate(reservations[0].debut_sejour),
            formatDate(
                addDays(
                    new Date(reservations[0].debut_sejour),
                    reservations[0].duree_sejour
                )
            ),
            reservations[0].categorie,
            reservations[0].num_vol_aller,
            reservations[0].pays_depart,
            reservations[0].destination,
            reservations[0].heure_depart,
            reservations[0].num_vol_retour,
            reservations[0].destination,
            reservations[0].pays_depart,
            reservations[0].heure_retour,
            reservations[0].hotel,
            `${reservations[0].nb_etoile} ${
                reservations[0].nb_etoile > 1 ? "étoiles" : "étoile"
            }`,
            `${reservations[0].ville}, ${reservations[0].pays}`,
            reservations[0].categorie_chambre,
            reservations[0].duree_sejour,
            (
                Number(reservations[0].prix_aller) +
                Number(reservations[0].prix_retour)
            ).toLocaleString(),
            (
                Number(reservations[0].prix_chambre) *
                Number(reservations[0].duree_sejour)
            ).toLocaleString(),
            Number(reservations[0].total).toLocaleString()
        );

        /* ********************************************************************************************* */

        res.status(200).json({ message: "Booking successfully added." });
    } catch (err) {
        res.status(400).json({ client_error: String(err) });
    }
}
