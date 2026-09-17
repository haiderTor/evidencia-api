async function cargarCatalogo() {
    try {
        const res = await fetch("http://localhost:3000/catalogo");
        const juegos = await res.json();

        const contenedor = document.getElementById("catalogo");
        contenedor.innerHTML = "";

        juegos.forEach(juego => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${juego.thumbnail}" alt="${juego.title}">
            <div class="card-content">
            <h2>${juego.title}</h2>
            <p>${juego.short_description}</p>
            <div class="badges">
                <span class="badge">${juego.genre}</span>
                <span class="badge">${juego.platform}</span>
            </div>
            <div class="card-actions">
                <a href="${juego.game_url}" target="_blank" class="btn">Ver más</a>
            </div>
            </div>
        `;

        contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar catálogo:", error);
    }
}

cargarCatalogo();
