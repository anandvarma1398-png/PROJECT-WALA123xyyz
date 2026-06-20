const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ products: [], orders: [] }, null, 2));
}

// Helper to read/write data
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// --- API ROUTES ---

// Get all products
app.get('/api/products', (req, res) => {
    res.json(readData().products);
});

// Add a product
app.post('/api/products', (req, res) => {
    const data = readData();
    const newProduct = { id: 'P' + Date.now(), ...req.body };
    data.products.push(newProduct);
    writeData(data);
    res.status(201).json(newProduct);
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    const data = readData();
    data.products = data.products.filter(p => p.id !== req.params.id);
    writeData(data);
    res.json({ message: 'Product deleted' });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json(readData().orders);
});

// Place an order
app.post('/api/orders', (req, res) => {
    const data = readData();
    const orderId = 'PW' + (1000 + data.orders.length + 1);
    const newOrder = { orderId, date: new Date().toISOString(), status: 'Pending', ...req.body };
    data.orders.push(newOrder);
    writeData(data);
    res.status(201).json(newOrder);
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
    const data = readData();
    const index = data.orders.findIndex(o => o.orderId === req.params.id);
    if (index !== -1) {
        data.orders[index].status = req.body.status;
        if (req.body.status === 'Delivered') {
            data.orders[index].deliveryDate = new Date().toISOString();
        }
        writeData(data);
        res.json(data.orders[index]);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 PROJECT WALA Backend running at http://localhost:${PORT}`);
    console.log(`Use this URL in your frontend to talk to this server.`);
});
