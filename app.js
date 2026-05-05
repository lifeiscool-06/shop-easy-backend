// js/app.js

const API = "https://shop-easy-backend-1rrf.onrender.com";

async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const data = await res.json();

  const container = document.getElementById("products");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image}" />
        <h4>${p.name}</h4>
        <p>${p.description}</p>
        <b>$${p.price}</b>
        <br><br>
        <button onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    `;
  });
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
}

loadProducts();