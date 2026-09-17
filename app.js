import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import pool from "./conexion.js";

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://www.freetogame.com/api/games";

//Lectura de los datos de la API
app.get("/api/juegos", async (req, res) => {
    try {
        const response = await fetch(API_URL);
        const juegos = await response.json();
        res.json(juegos);
    } catch (error) {
    res.status(500).json({ error: "Error al obtener juegos de la API" });
    }
});

//Lectura de los datos de la base de datos local
app.get("/db/juegos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM juegos");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener juegos de la DB" });
    }
});

//Insertar juegos en la DB Local (ejemplo: primeros 7)
app.post("/db/insertar", async (req, res) => {
    try {
        const response = await fetch(API_URL);
        const juegos = await response.json();

        //Limitador de la cantidad de juegos para insertar en la base de datos con Slice para insertar solo un tramo parcial del arreglo.
        const seleccion = juegos.slice(7, 14);
        for (let juego of seleccion) {
        await pool.query(
            `INSERT INTO juegos (id, title, thumbnail, short_description, game_url, genre, platform, publisher, developer, release_date)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT (id) DO NOTHING`,
            [
            juego.id,
            juego.title,
            juego.thumbnail,
            juego.short_description,
            juego.game_url,
            juego.genre,
            juego.platform,
            juego.publisher,
            juego.developer,
            juego.release_date,
            ]
        );
    }
    res.json({ message: "7 juegos insertados en la DB" });
    } catch (error) {
        res.status(500).json({ error: "Error al insertar juegos en la DB" });
    }
});

//Comparar los datos locales con los de la API y mostrar los juegos faltantes
app.get("/db/comparar", async (req, res) => {
    try {
        const response = await fetch(API_URL);
        const juegosAPI = await response.json();
        const result = await pool.query("SELECT * FROM juegos");
        const juegosDB = result.rows;

        const idsDB = juegosDB.map((j) => j.id);
        const faltantes = juegosAPI.filter((j) => !idsDB.includes(j.id));

        res.json({ faltantes });
    } catch (error) {
        res.status(500).json({ error: "Error al comparar datos" });
    }
});

//Actualizar campos de datos locales (publicher en este ejemplo)
app.put("/db/actualizar", async (req, res) => {
    try {
        const response = await fetch(API_URL);
        const juegosAPI = await response.json();

        const result = await pool.query("SELECT * FROM juegos");
        const juegosDB = result.rows;

        const actualizados = [];

        for (let juegoAPI of juegosAPI) {
        const juegoDB = juegosDB.find(j => j.id === juegoAPI.id);

        if (juegoDB && juegoDB.publisher !== juegoAPI.publisher) {
            const result = await pool.query(
            `UPDATE juegos
            SET publisher = $1
            WHERE id = $2
            RETURNING *`,
            [juegoAPI.publisher, juegoAPI.id]
            );

            actualizados.push({
            antes: juegoDB.publisher,
            despues: juegoAPI.publisher,
            juego: result.rows[0]
            });
        }
        }

        res.json({
        actualizaciones: actualizados,
        message: `${actualizados.length} juegos actualizados`
        });

    } catch (error) {
        res.status(500).json({
        error: "Error al actualizar juegos"
        });
    }
});




//Insertar juegos faltantes
app.post("/db/insertar-faltantes", async (req, res) => {
    try {
        const response = await fetch(API_URL);
        const juegosAPI = await response.json();
        const result = await pool.query("SELECT * FROM juegos");
        const juegosDB = result.rows;

    const idsDB = juegosDB.map((j) => j.id);
    const faltantes = juegosAPI.filter((j) => !idsDB.includes(j.id));

    for (let juego of faltantes) {
        await pool.query(
            `INSERT INTO juegos (id, title, thumbnail, short_description, game_url, genre, platform, publisher, developer, release_date)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
            juego.id,
            juego.title,
            juego.thumbnail,
            juego.short_description,
            juego.game_url,
            juego.genre,
            juego.platform,
            juego.publisher,
            juego.developer,
            juego.release_date,
            ]
        );
        }

        res.json({ message: "Juegos faltantes insertados", cantidad: faltantes.length });
    } catch (error) {
        res.status(500).json({ error: "Error al insertar juegos faltantes" });
    }
});

//Mostrar catálogo en web
app.get("/db/catalogo", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM juegos");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al mostrar catálogo" });
    }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
