import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyAdminAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    const token = authHeader && (authHeader.split(" ")[1] as string);

    if (!token) return res.status(401).json({ message: "Unauthorized." });

    jwt.verify(
        token,
        process.env.ADMIN_ACCESS_SECRET as string,
        (err, user) => {
            if (err) return res.status(403).json({ message: "Forbidden." });
            (req as any).user = user;
            next();
        }
    );
}

export function verifyAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    const token = authHeader && (authHeader.split(" ")[1] as string);

    if (!token) return res.status(401).json({ message: "Unauthorized." });

    jwt.verify(token, process.env.ACCESS_SECRET as string, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden." });
        (req as any).user = user;
        next();
    });
}
