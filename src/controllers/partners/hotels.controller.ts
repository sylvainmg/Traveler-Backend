import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function getHotels(req: Request, res: Response) {
    const { limit, year, id } = req.body as {
        limit: number;
        id: number;
        year: number;
    };

    const conditions: (string | number)[] = [];
    const values: (string | number)[] = [];

    if (year) {
        conditions.push("year(date_convention) = ?");
        values.push(year);
    }
    if (id) {
        conditions.push("h.id_hotel = ?");
        values.push(id);
    }

    let query = `
    select ch.num_convention, h.id_hotel, h.nom, ch.date_convention  
    from hotel h
    join convention_hotel ch on ch.id_hotel = h.id_hotel
    `;

    if (conditions.length > 0) query += ` where ${conditions.join(" and ")}`;
    query += " limit ?";
    values.push(limit);

    const [hotels] = await db.query<RowDataPacket[]>(query, values);

    res.json(hotels);
}

export async function updateHotel(req: Request, res: Response) {
    const { year, month, day, num_convention } = req.body as {
        year: number;
        month: number;
        day: number;
        num_convention: number;
    };
    const newDate = `${year}-${String(month).padStart(2, "0")}-${String(
        day
    ).padStart(2, "0")}`;

    const query = `
    update convention_hotel
    set date_convention = ?
    where num_convention = ?
    `;

    db.query(query, [newDate, num_convention]);

    res.sendStatus(200);
}

export async function getHotelsNumber(req: Request, res: Response) {
    let query = "select count(*) nombre from hotel h";
    const [rows] = await db.query<RowDataPacket[]>(query);
    const nombre = rows[0];

    res.json(nombre);
}

export async function getTopHotels(req: Request, res: Response) {
    let query = `
    select h.nom hotel, count(*) reservation
    from reservation r
    join hotel h on h.id_hotel = r.id_hotel
    group by hotel
    order by reservation desc
    limit 3
    `;
    const [rows] = await db.query<RowDataPacket[]>(query);

    res.json(rows);
}

export async function getHotelsRating(req: Request, res: Response) {
    const { id } = req.body as { id: number };
    let query = `
    select h.id_hotel, e.note_hotel, e.avis_hotel
    from evaluation e
    join reservation r on e.num_reservation = r.num_reservation
    join hotel h on h.id_hotel = r.id_hotel 
    where h.id_hotel = ?
    order by id_hotel
    `;
    let averageQuery = `
    select avg(e.note_hotel) as moyenne
    from evaluation e
    join reservation r on r.num_reservation = e.num_reservation
    join hotel h on h.id_hotel = r.id_hotel
    where h.id_hotel = ?
    group by h.id_hotel

    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);
    const [average] = await db.query<RowDataPacket[]>(averageQuery, [id]);

    res.json({ ratings: rows, average: average[0] });
}
