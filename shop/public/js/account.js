// Автор: Мишенин
// Витрина и корзина магазина картин CRV

const categories = {
  all: 'Все картины',
  canvas: 'Холст',
  abstract: 'Абстракция',
  watercolor: 'Акварель',
  premium: 'Премиум',
  sets: 'Серии',
};

let products = [];
let currentCategory = 'all';
const cart = new Map();

const money = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function renderFilters() {
  const filters = document.getElementById('filters');
  filters.innerHTML = Object.entries(categories)
    .map(([key, label]) => `<button class="filter ${key === currentCategory ? 'active' : ''}" data-category="${key}">${label}</button>`)
    .join('');
}

function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const visibleProducts = currentCategory === 'all'
    ? products
    : products.filter((product) => product.category === currentCategory);

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="card__body">
        <div class="card__meta">${categories[product.category]} · в наличии ${product.quantity}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${money.format(product.price)}</div>
        <button class="button" data-add="${product.id}">Добавить в корзину</button>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const cartElement = document.getElementById('cart');
  const items = [...cart.values()];
  if (items.length === 0) {
    cartElement.textContent = 'Корзина пуста.';
    return;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartElement.innerHTML = `${items.map((item) => `
    <div class="cart__row">
      <span>${item.name} × ${item.quantity}</span>
      <strong>${money.format(item.price * item.quantity)}</strong>
    </div>
  `).join('')}<div class="cart__total">Итого: ${money.format(total)}</div>`;
}

function addToCart(id) {
  const product = products.find((item) => item.id === Number(id));
  if (!product) return;

  const current = cart.get(product.id) || { ...product, quantity: 0 };
  current.quantity += 1;
  cart.set(product.id, current);
  renderCart();
}

async function loadProducts() {
  const response = await fetch('/api/products');
  products = await response.json();
  renderFilters();
  renderCatalog();
}

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  const filterButton = event.target.closest('[data-category]');

  if (addButton) addToCart(addButton.dataset.add);
  if (filterButton) {
    currentCategory = filterButton.dataset.category;
    renderFilters();
    renderCatalog();
  }
});

document.getElementById('orderForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('orderMessage');
  const formData = new FormData(event.currentTarget);
  const items = [...cart.values()].map((item) => ({ id: item.id, quantity: item.quantity }));

  if (items.length === 0) {
    message.textContent = 'Добавьте хотя бы одну картину в корзину.';
    return;
  }

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: formData.get('customerName'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      items,
    }),
  });

  if (!response.ok) {
    message.textContent = 'Не удалось оформить заказ. Проверьте данные.';
    return;
  }

  const order = await response.json();
  cart.clear();
  renderCart();
  event.currentTarget.reset();
  message.textContent = `Заказ №${order.id} принят. Мы свяжемся с вами для подтверждения.`;
});

loadProducts().catch(() => {
  document.getElementById('catalogGrid').innerHTML = '<div class="loading">Не удалось загрузить каталог.</div>';
});
