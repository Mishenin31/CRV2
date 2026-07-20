// Автор: Мишенин
// Сервер интернет-магазина картин CRV

const express = require('express');
const session = require('express-session');
const path = require('path');
const { read, write, nextId } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'crv-art-shop-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (_req, res) => {
  res.json(read('products.json'));
});

app.post('/api/orders', (req, res) => {
  const { customerName, phone, address, items } = req.body;
  if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Заполните контакты и добавьте картины в заказ' });
  }

  const products = read('products.json');
  const orders = read('orders.json');
  const orderItems = items.map((item) => {
    const product = products.find((entry) => entry.id === Number(item.id));
    return {
      id: Number(item.id),
      name: product ? product.name : 'Картина CRV',
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: product ? product.price : 0,
    };
  });

  const order = {
    id: nextId(orders),
    customerName,
    phone,
    address,
    items: orderItems,
    total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString(),
    status: 'new',
  };

  orders.push(order);
  write('orders.json', orders);
  return res.status(201).json(order);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.listen(PORT, () => {
  console.log(`CRV Art Shop запущен: http://localhost:${PORT}`);
});
