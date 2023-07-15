// Crea una instancia de la base de datos SQLite
const db = openDatabase('DBArtesanal', '1.0', 'ArtesaníasOnLine Database', 2 * 1024 * 1024);

// Función para crear un nuevo usuario
function crearUsuario() {
  const name = document.getElementById('name').value;
  const lastname = document.getElementById('lastname').value;
  const birthdate = document.getElementById('birthdate').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value;
  const payment = document.getElementById('payment').value;
  const card = document.getElementById('card').value;
  const password = document.getElementById('password').value;

  // Insertar el nuevo usuario en la base de datos
  db.transaction(function (tx) {
    tx.executeSql(
      'INSERT INTO Usuario (Usuario, Nombre, Apellido, FechaNacimiento, Celular, Email, Direccion, FormaPago, NroTarjeta, Contraseña) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['usuario', name, lastname, birthdate, phone, email, address, payment, card, password],
      function () {
        // Registro exitoso, redirigir a la página de inicio de sesión
        window.location.href = 'login.html';
      },
      function (tx, error) {
        console.log('Error al crear el usuario:', error.message);
      }
    );
  });
}

// Función para iniciar sesión
function loginUsuario() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Actualizar el campo "login" del usuario en la base de datos
  db.transaction(function (tx) {
    tx.executeSql(
      'UPDATE Usuario SET login = "S" WHERE Usuario = ? AND Contraseña = ?',
      [username, password],
      function () {
        // Inicio de sesión exitoso, redirigir a la página principal
        window.location.href = 'index.html';
      },
      function (tx, error) {
        console.log('Error al iniciar sesión:', error.message);
      }
    );
  });
}

// Función para verificar si el usuario está firmado
function verificaLogin() {
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT * FROM Usuario WHERE login = "S"',
      [],
      function (tx, result) {
        if (result.rows.length > 0) {
          // El usuario está firmado
          console.log('El usuario está firmado');
        } else {
          // El usuario no está firmado
          console.log('El usuario no está firmado');
        }
      },
      function (tx, error) {
        console.log('Error al verificar el estado de inicio de sesión:', error.message);
      }
    );
  });
}

// Función para consultar la lista de productos
function consultarListaProductos() {
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT * FROM Producto',
      [],
      function (tx, result) {
        const productGrid = document.querySelector('.product-grid');
        productGrid.innerHTML = '';

        for (let i = 0; i < result.rows.length; i++) {
          const product = result.rows.item(i);

          const productItem = document.createElement('div');
          productItem.classList.add('product-item');

          const stockStatus = product.Stock === 'S' ? 'Stock' : 'No Stock';

          const productHTML = `
            <img src="product_images/${product.ID_producto}.jpg" alt="${product.NombreProducto}">
            <h3>${product.NombreProducto}</h3>
            <p class="brand">${product.Marca}</p>
            <p class="stock">${stockStatus}</p>
            <p class="price">$${product.Precio.toFixed(2)}</p>
            <div class="quantity">
              <input type="number" min="1" value="1" class="quantity-input">
              <button class="btn add-to-cart" data-product-id="${product.ID_producto}">Añadir a Carrito</button>
            </div>
          `;

          productItem.innerHTML = productHTML;
          productGrid.appendChild(productItem);

          const addToCartBtn = productItem.querySelector('.add-to-cart');
          addToCartBtn.addEventListener('click', function () {
            const quantityInput = productItem.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value, 10);
            const productID = addToCartBtn.getAttribute('data-product-id');
            carritoCompra(productID, quantity);
          });
        }
      },
      function (tx, error) {
        console.log('Error al consultar la lista de productos:', error.message);
      }
    );
  });
}

// Función para consultar los detalles de un producto
function consultarProducto(id) {
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT * FROM Producto WHERE ID_producto = ?',
      [id],
      function (tx, result) {
        if (result.rows.length > 0) {
          const product = result.rows.item(0);

          const productDetailSection = document.querySelector('.product-detail-section');
          const stockStatus = product.Stock === 'S' ? 'Stock' : 'No Stock';

          const productHTML = `
            <div class="product-image">
              <img src="product_images/${product.ID_producto}.jpg" alt="${product.NombreProducto}">
            </div>
            <div class="product-info">
              <h2>${product.NombreProducto}</h2>
              <p class="brand">${product.Marca}</p>
              <div class="rating">
                ${generateRatingStars(product.Calificacion)}
              </div>
              <p>${product.Descripcion}</p>
              <p class="price">$${product.Precio.toFixed(2)}</p>
              <p class="stock">${stockStatus}</p>
              <div class="quantity">
                <input type="number" min="1" value="1" class="quantity-input">
                <button class="btn add-to-cart" data-product-id="${product.ID_producto}">Añadir a Carrito</button>
              </div>
            </div>
          `;

          productDetailSection.innerHTML = productHTML;

          const addToCartBtn = productDetailSection.querySelector('.add-to-cart');
          addToCartBtn.addEventListener('click', function () {
            const quantityInput = productDetailSection.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value, 10);
            const productID = addToCartBtn.getAttribute('data-product-id');
            carritoCompra(productID, quantity);
          });
        }
      },
      function (tx, error) {
        console.log('Error al consultar los detalles del producto:', error.message);
      }
    );
  });
}

// Función para agregar un producto al carrito de compras
function carritoCompra(productID, quantity) {
  db.transaction(function (tx) {
    tx.executeSql(
      'INSERT INTO Carrito (ID_usuario, ID_producto, cantidad) VALUES (?, ?, ?)',
      [1, productID, quantity],
      function () {
        console.log('Producto añadido al carrito de compras');
      },
      function (tx, error) {
        console.log('Error al añadir producto al carrito de compras:', error.message);
      }
    );
  });
}

// Función para consultar los productos en el carrito de compras
function listadoCarrito() {
  db.transaction(function (tx) {
    tx.executeSql(
      'SELECT * FROM Carrito INNER JOIN Producto ON Carrito.ID_producto = Producto.ID_producto WHERE Carrito.ID_usuario = ?',
      [1],
      function (tx, result) {
        const cartSection = document.querySelector('.cart-section');
        const cartItems = result.rows;

        if (cartItems.length === 0) {
          cartSection.innerHTML = '<p>No hay productos en el carrito.</p>';
        } else {
          let cartHTML = '<h2>Carrito de Compras</h2>';
          cartHTML += '<div class="cart-items">';

          for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems.item(i);

            cartHTML += `
              <div class="cart-item">
                <img src="product_images/${item.ID_producto}.jpg" alt="${item.NombreProducto}">
                <h3>${item.NombreProducto}</h3>
                <p class="price">$${item.Precio.toFixed(2)}</p>
              </div>
            `;
          }

          cartHTML += '</div>';
          cartHTML += `<div class="cart-total">Total: $${calculateCartTotal(cartItems).toFixed(2)}</div>`;
          cartHTML += '<button class="btn btn-primary">Comprar</button>';

          cartSection.innerHTML = cartHTML;
        }
      },
      function (tx, error) {
        console.log('Error al consultar el carrito de compras:', error.message);
      }
    );
  });
}

// Función para calcular el total del carrito de compras
function calculateCartTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items.item(i);
    total += item.Precio * item.cantidad;
  }

  return total;
}

// Función para generar las estrellas de calificación
function generateRatingStars(rating) {
  let starsHTML = '';

  for (let i = 0; i < rating; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  return starsHTML;
}

// Llamada a la función verificaLogin al cargar la página
window.addEventListener('DOMContentLoaded', function () {
  verificaLogin();
});
