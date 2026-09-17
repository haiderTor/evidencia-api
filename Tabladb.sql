CREATE TABLE juegos (
    id INTEGER PRIMARY KEY,              -- ID único del juego (API)
    title VARCHAR(255) NOT NULL,         -- Nombre del juego
    thumbnail TEXT,                      -- Imagen principal
    short_description TEXT,              -- Descripción breve
    game_url TEXT,                       -- Enlace oficial del juego
    genre VARCHAR(100),                  -- Género
    platform VARCHAR(100),               -- Plataforma (PC, Browser)
    publisher VARCHAR(255),              -- Editor
    developer VARCHAR(255),              -- Desarrollador
    release_date DATE                    -- Fecha de lanzamiento
);