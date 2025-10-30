import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.ts";
import clientsRoutes from "./routes/clients.route.ts";
import airlinesRoutes from "./routes/airlines.route.ts";
import hotelsRoutes from "./routes/hotels.route.ts";
import adminsRoutes from "./routes/admin.route.ts";
import bookingsRoutes from "./routes/bookings.route.ts";
import {
    verifyAccessToken,
    verifyAdminAccessToken,
} from "./middlewares/accessToken.middleware.ts";
import rootRoute from "./routes/root.route.ts";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Auths
app.use("/admin/auth", adminsRoutes); // admin
app.use("/auth", authRoutes); // client

app.use("/admin/", verifyAdminAccessToken, rootRoute);
app.use("/admin/clients", verifyAdminAccessToken, clientsRoutes);
app.use("/admin/airlines", verifyAdminAccessToken, airlinesRoutes);
app.use("/admin/hotels", verifyAdminAccessToken, hotelsRoutes);
app.use("/admin/bookings", verifyAdminAccessToken, bookingsRoutes);
app.use("/admin/bookings", verifyAdminAccessToken, bookingsRoutes);

app.get("/root", verifyAccessToken, (req, res) =>
    res.json({ message: "Welcome, peasant." })
);

// Serveur
const PORT = process.env.PORT;
app.listen(PORT || 3000, () => {
    console.log(`Serveur lancé sur le port ${PORT}...`);
});
