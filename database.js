/**
 * Database Management for PROJECT WALA
 * Handles Products, Orders, and Customers
 */

const Database = {
    // --- PRODUCTS ---
    async getProducts() {
        if (USE_FIREBASE && db) {
            const snapshot = await db.collection('products').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            const products = JSON.parse(localStorage.getItem('pw_products')) || this.getInitialMockProducts();
            return products;
        }
    },

    // Real-time listener for products (See changes instantly)
    observeProducts(callback) {
        if (USE_FIREBASE && db) {
            return db.collection('products').onSnapshot(snapshot => {
                const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(products);
            });
        } else {
            callback(JSON.parse(localStorage.getItem('pw_products')) || this.getInitialMockProducts());
        }
    },

    async addProduct(product) {
        if (USE_FIREBASE && db) {
            return await db.collection('products').add(product);
        } else {
            const products = await this.getProducts();
            const newProduct = { id: 'P' + Date.now(), ...product };
            products.push(newProduct);
            localStorage.setItem('pw_products', JSON.stringify(products));
            return newProduct;
        }
    },

    // --- ORDERS ---
    async placeOrder(orderDetails) {
        const orderId = 'PW' + (1000 + (await this.getOrders()).length + 1);
        const order = {
            orderId,
            date: new Date().toISOString(),
            status: 'Pending',
            ...orderDetails
        };

        if (USE_FIREBASE && db) {
            await db.collection('orders').add(order);
        } else {
            const orders = await this.getOrders();
            orders.push(order);
            localStorage.setItem('pw_orders', JSON.stringify(orders));
        }
        return orderId;
    },

    async getOrders() {
        if (USE_FIREBASE && db) {
            const snapshot = await db.collection('orders').orderBy('date', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            return JSON.parse(localStorage.getItem('pw_orders')) || [];
        }
    },

    async getOrderById(orderId) {
        const orders = await this.getOrders();
        return orders.find(o => o.orderId === orderId);
    },

    // --- MOCK DATA ---
    getInitialMockProducts() {
        const initial = [
            {
                id: 'p1',
                name: 'ESP32 Development Board',
                category: 'Microcontrollers',
                price: 450,
                originalPrice: 599,
                image: 'https://m.media-amazon.com/images/I/61N6AnZ6S6L._SL1000_.jpg',
                description: 'Dual-core Wi-Fi & Bluetooth MCU'
            },
            {
                id: 'p2',
                name: 'Arduino Uno R3',
                category: 'Microcontrollers',
                price: 549,
                originalPrice: 799,
                image: 'https://m.media-amazon.com/images/I/51-P9M2K6pL._SL1000_.jpg',
                description: 'Classic ATmega328P based board'
            }
        ];
        localStorage.setItem('pw_products', JSON.stringify(initial));
        return initial;
    }
};
