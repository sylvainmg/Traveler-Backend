import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function getBookings(req: Request, res: Response) {
    const { limit, date_reservation, destination, num_client } = req.body as {
        limit: number;
        date_reservation: {
            year: null | number;
            month: null | number;
            day: null | number;
        };
        destination: string;
        num_client: null | number;
    };

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (date_reservation.year) {
        conditions.push("year(date_reservation) = ?");
        values.push(date_reservation.year);
    }
    if (date_reservation.month) {
        conditions.push("month(date_reservation) = ?");
        values.push(date_reservation.month);
    }
    if (date_reservation.day) {
        conditions.push("day(date_reservation) = ?");
        values.push(date_reservation.day + 1);
    }

    if (destination) {
        conditions.push("p.nom like ?");
        values.push(`%${destination}%`);
    }

    if (num_client) {
        conditions.push("cl.id_client = ?");
        values.push(num_client);
    }

    let query = `
    select r.num_reservation, r.date_reservation, cat.libelle categorie, p.nom destination, cl.id_client, cl.nom, cl.prenom, cl.email, v1.num_vol num_vol_aller, ca1.nom compagnie_aerienne_aller, v1.prix prix_vol_aller, v1.date_vol date_vol_aller, v1.heure_depart heure_depart_aller,
    v2.date_vol date_vol_retour, ca2.nom compagnie_aerienne_retour, v2.prix prix_vol_retour, v2.heure_depart heure_depart_retour, h.nom nom_hotel, h.nb_etoile, ch.prix prix_chambre, r.debut_sejour
    from reservation r
    join categorie cat on cat.code = r.code
    join client cl on cl.id_client = r.id_client
    join hotel h on h.id_hotel = r.id_hotel
    join chambre ch on ch.num_chambre = r.num_chambre
    join vol v1 on v1.num_vol = r.num_vol
    join compagnie_aerienne ca1 on ca1.id_compagnie_aerienne = v1.id_compagnie_aerienne
    join pays p on p.code = h.code
    join vol v2 on v2.num_vol = r.num_vol_retourner
    join compagnie_aerienne ca2 on ca2.id_compagnie_aerienne = v2.id_compagnie_aerienne
    join categorie c on c.code = r.code
    `;

    if (conditions.length > 0) query += ` where ${conditions.join(" and ")}`;

    query += " order by r.num_reservation desc";
    if (limit) query += ` limit ${limit}`;

    const [bookings] = await db.query<RowDataPacket[]>(query, values);

    res.json(bookings);
}

export async function getBookingsNumber(req: Request, res: Response) {
    let query = "select count(*) nombre from reservation r";
    const [rows] = await db.query<RowDataPacket[]>(query);
    const nombre = rows[0];

    res.json(nombre);
}

export async function getBookingsStats(req: Request, res: Response) {
    const { year } = req.body as { year: number };
    let query = `
    select r.date_reservation date_reservation, count(*) reservation
    from reservation r
    where year(r.date_reservation) = ?
    group by r.date_reservation
    `;

    const [rows] = await db.query<
        RowDataPacket[] & {
            date_reservation: string;
            reservation: number;
        }
    >(query, [year]);

    const months = Array.from({ length: rows.length }, (_, i) =>
        new Date(rows[i].date_reservation).getMonth()
    );

    const monthsName = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];

    const obj = monthsName.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {} as Record<string, number>);

    for (let i = 0; i < months.length; i++) {
        const key = monthsName[months[i]];
        obj[key] += 1;
    }

    res.json(obj);
}
