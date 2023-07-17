document.addEventListener("DOMContentLoaded", function() {
    const productosContainer = document.querySelector("#productosContainer");

    const request = indexedDB.open("DBArtesania");

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos", event.target.error);
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains("productos")) {
            const objectStore = db.createObjectStore("productos", { keyPath: "codigo" });
            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("categoria", "categoria", { unique: false });
            objectStore.createIndex("precio", "precio", { unique: false });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;

        mostrarProductos(db);
    };

    function mostrarProductos(db) {
        const transaction = db.transaction("productos", "readonly");
        const objectStore = transaction.objectStore("productos");
        const productosCursor = objectStore.openCursor();

        productosCursor.onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
                const producto = cursor.value;

                const card = document.createElement("div");
                card.classList.add("col-md-4", "mb-4");

                const cardContent = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text"><strong>Categoría:</strong> ${producto.categoria}</p>
                            <p class="card-text"><strong>Precio:</strong> ${producto.precio}</p>
                        </div>
                    </div>
                `;
                card.innerHTML = cardContent;

                productosContainer.appendChild(card);

                cursor.continue();
            }
        };

        productosCursor.onerror = function(event) {
            console.error("Error al leer los productos", event.target.error);
        };
    }
});
