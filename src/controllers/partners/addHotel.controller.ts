import { Request, Response } from "express";
import { db } from "../../../config/db.ts";

export default async function addHotel(req: Request, res: Response) {
    try {
        const { code, nom, nb_etoile, chambres, date_convention } =
            req.body as {
                code: string;
                nom: string;
                nb_etoile: number;
                chambres: {
                    categorie: string;
                    prix: number;
                }[];
                date_convention: string;
            };

        const [hotel] = await db.query(
            `insert into hotel (code, code_avoir, nom, nb_etoile) values (?, ?, ?, ?)`,
            [code, "AV", nom, nb_etoile]
        );

        const chambreQuery = (function () {
            let query = "insert into chambre (categorie, prix) values\n";

            for (let i = 0; i < chambres.length; i++) {
                if (i < chambres.length - 1)
                    query += `('${chambres[i].categorie}', ${chambres[i].prix}),\n`;
                else
                    query += `('${chambres[i].categorie}', ${chambres[i].prix})`;
            }

            return query;
        })();

        const [chambre] = await db.query(chambreQuery);

        const possederQuery = (function () {
            let query = "insert into posseder values\n";

            for (let i = 0; i < chambres.length; i++) {
                if (i < chambres.length - 1)
                    query += `(${(hotel as any).insertId}, ${
                        Number((chambre as any).insertId) + i
                    }), \n`;
                else
                    query += `(${(hotel as any).insertId}, ${
                        Number((chambre as any).insertId) + i
                    })`;
            }

            return query;
        })();

        await db.query(possederQuery);

        await db.query(
            `insert into convention_hotel (id_hotel, date_convention) values (?, ?)`,
            [(hotel as any).insertId, date_convention]
        );

        res.json({ message: "Record added." });
    } catch (err) {
        console.log(err);

        res.status(500).json({ error: err });
    }
}
