import express from "express";
import cors from "cors";
import routes from "./routes/routes.ts";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use(routes);

// Serveur
const PORT = process.env.PORT;
app.listen(PORT || 3000, () => {
    console.log(`Serveur lancé sur le port ${PORT}...`);
});
