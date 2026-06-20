/**
 * PROJECT WALA - Unified Database Layer
 * Optimized for Real-time Visibility
 */

const Database = {
    provider: 'local',
    nodeUrl: 'http://localhost:3000/api',

    getProvider() {
        if (window.USE_FIREBASE && window.db) return 'firebase';
        return this.provider;
    },

    async getProducts() {
        try {
            const p = this.getProvider();
            if (p === 'firebase') {
                const snap = await window.db.collection('products').get();
                return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else if (p === 'node') {
                const res = await fetch(`${this.nodeUrl}/products`);
                return await res.json();
            } else {
                return JSON.parse(localStorage.getItem('pw_products')) || [];
            }
        } catch (e) {
            console.error("Fetch Error:", e);
            return [];
        }
    },

    // Real-time observer (Polled for local/node)
    observeProducts(callback) {
        const p = this.getProvider();
        if (p === 'firebase') {
            return window.db.collection('products').onSnapshot(snap => {
                callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
        } else {
            // Polling every 3 seconds for non-firebase providers
            const poll = async () => {
                const data = await this.getProducts();
                callback(data);
            };
            poll(); // Run once immediately
            return setInterval(poll, 3000);
        }
    },

    async addProduct(product) {
        const p = this.getProvider();

        if (product.image && product.image.includes('drive.google.com')) {
            const id = product.image.split('/d/')[1]?.split('/')[0];
            if (id) product.image = `https://drive.google.com/uc?export=view&id=${id}`;
        }

        if (p === 'firebase') {
            return await window.db.collection('products').add(product);
        } else if (p === 'node') {
            const res = await fetch(`${this.nodeUrl}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            return await res.json();
        } else {
            const products = await this.getProducts();
            const newP = { id: 'P' + Date.now(), ...product };
            products.push(newP);
            localStorage.setItem('pw_products', JSON.stringify(products));
            return newP;
        }
    },

    async deleteProduct(id) {
        const p = this.getProvider();
        if (p === 'firebase') {
            await window.db.collection('products').doc(id).delete();
        } else if (p === 'node') {
            await fetch(`${this.nodeUrl}/products/${id}`, { method: 'DELETE' });
        } else {
            let products = await this.getProducts();
            products = products.filter(item => item.id !== id);
            localStorage.setItem('pw_products', JSON.stringify(products));
        }
    },

    async placeOrder(order) {
        const p = this.getProvider();
        const orderId = 'PW' + (Math.floor(Math.random() * 9000) + 1000);
        const finalOrder = { orderId, date: new Date().toISOString(), status: 'Pending', ...order };

        if (p === 'firebase') {
            await window.db.collection('orders').add(finalOrder);
        } else if (p === 'node') {
            await fetch(`${this.nodeUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
        } else {
            const orders = JSON.parse(localStorage.getItem('pw_orders')) || [];
            orders.push(finalOrder);
            localStorage.setItem('pw_orders', JSON.stringify(orders));
        }
        return orderId;
    },

    async getOrders() {
        const p = this.getProvider();
        if (p === 'firebase') {
            const snap = await window.db.collection('orders').orderBy('date', 'desc').get();
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else if (p === 'node') {
            const res = await fetch(`${this.nodeUrl}/orders`);
            return await res.json();
        } else {
            return JSON.parse(localStorage.getItem('pw_orders')) || [];
        }
    },

    async getOrderById(orderId) {
        const orders = await this.getOrders();
        return orders.find(o => o.orderId === orderId);
    },

    async updateOrderStatus(id, status) {
        const p = this.getProvider();
        if (p === 'firebase') {
            await window.db.collection('orders').doc(id).update({ status });
        } else if (p === 'node') {
            await fetch(`${this.nodeUrl}/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        }
    },

    getInitialMockProducts() {
        return [
            {
                id: 'p1',
                name: 'Arduino Uno R3',
                category: 'Microcontrollers',
                price: 249,
                image: 'https://drive.google.com/uc?export=view&id=1B7YVc3BxrWrfPGn7V5ujVBFCK05Q2TGK',
                description: 'The Arduino Uno is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins (of which 6 can be used as PWM outputs), 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header and a reset button.'
            }
        ];
    }
};
