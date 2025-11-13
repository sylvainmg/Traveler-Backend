import { Request, Response } from "express";
import { db } from "../../../config/db.ts";
import { RowDataPacket } from "mysql2";

export async function getAirlines(req: Request, res: Response) {
    const { limit, year, id } = req.body as {
        limit: number;
        id: number;
        year: number;
    };

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (year) {
        conditions.push("year(date_convention) = ?");
        values.push(year);
    }
    if (id) {
        conditions.push("ca.id_compagnie_aerienne = ?");
        values.push(id);
    }

    let query = `
    select cca.num_convention, ca.id_compagnie_aerienne, ca.nom, cca.date_convention
    from convention_compagnie_aerienne cca
    join compagnie_aerienne ca on ca.id_compagnie_aerienne = cca.id_compagnie_aerienne
    `;

    if (conditions.length > 0) query += ` where ${conditions.join(" and ")}`;
    query += " limit ?";
    values.push(limit);

    const [airlines] = await db.query<RowDataPacket[]>(query, values);

    res.json(airlines);
}

export async function updateAirline(req: Request, res: Response) {
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
    update convention_compagnie_aerienne
    set date_convention = ?
    where num_convention = ?
    `;

    db.query(query, [newDate, num_convention]);

    res.sendStatus(200);
}

export async function getAirlinesNumber(req: Request, res: Response) {
    let query = "select count(*) nombre from compagnie_aerienne ca";
    const [rows] = await db.query<RowDataPacket[]>(query);
    const nombre = rows[0];

    res.json(nombre);
}

export async function getTopDestinations(req: Request, res: Response) {
    let query = `
    select p.nom pays, count(*) visites
    from reservation r
    join vol v on v.num_vol = r.num_vol
    join pays p on p.code = v.code
    group by p.nom 
    order by visites desc
    limit 10
    `;
    const [rows] = await db.query<RowDataPacket[]>(query);

    res.json(rows);
}

export async function getTopAirlines(req: Request, res: Response) {
    let query = `
    select ca.nom, count(*) reservation
    from vol v
    join compagnie_aerienne ca on ca.id_compagnie_aerienne = v.id_compagnie_aerienne
    join reservation r on r.num_vol = v.num_vol or r.num_vol_retourner = v.num_vol
    group by ca.id_compagnie_aerienne
    order by reservation desc
    limit 3
    `;
    const [rows] = await db.query<RowDataPacket[]>(query);

    res.json(rows);
}

export async function getAirlinesRating(req: Request, res: Response) {
    const { id } = req.body as { id: number };
    let query = `
    select r.num_reservation, ca.id_compagnie_aerienne, e.note_compagnie_aerienne_aller, e.avis_compagnie_aerienne_aller, e.note_compagnie_aerienne_retour,
    avis_compagnie_aerienne_retour
    from evaluation e
    join reservation r on r.num_reservation = e.num_reservation
    join vol v on v.num_vol = r.num_vol or v.num_vol = r.num_vol_retourner
    join compagnie_aerienne ca on ca.id_compagnie_aerienne = v.id_compagnie_aerienne
    where ca.id_compagnie_aerienne = ?
    order by ca.id_compagnie_aerienne

    `;
    let averageQuery = `
    select sum(e.note_compagnie_aerienne_aller + e.note_compagnie_aerienne_retour) / (count(*) * 2) moyenne
    from evaluation e
    join reservation r on r.num_reservation = e.num_reservation
    join vol v on v.num_vol = r.num_vol or v.num_vol = r.num_vol_retourner
    join compagnie_aerienne ca on ca.id_compagnie_aerienne = v.id_compagnie_aerienne
    where ca.id_compagnie_aerienne = ?
    group by ca.nom
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);
    const [average] = await db.query<RowDataPacket[]>(averageQuery, [id]);

    res.json({ ratings: rows, average: average[0] });
}
