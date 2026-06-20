/**
 * PROJECT WALA - Unified Database Layer
 * Supports: LocalStorage, Node.js Backend, and Google Firebase
 */

const Database = {
    // SETTINGS: Choose your backend type
    // options: 'local' | 'node' | 'firebase'
    provider: 'local',
    nodeUrl: 'http://localhost:3000/api',

    // Initialize provider based on availability
    getProvider() {
        if (window.USE_FIREBASE && window.db) return 'firebase';
        // Check if Node server is likely running (you can set this manually to 'node')
        return this.provider;
    },

    async getProducts() {
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
    },

    observeProducts(callback) {
        const p = this.getProvider();
        if (p === 'firebase') {
            return window.db.collection('products').onSnapshot(snap => {
                callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
        }
        // For other providers, we just fetch once
        this.getProducts().then(callback);
    },

    async addProduct(product) {
        const p = this.getProvider();

        // Drive image conversion
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
            const newP = { id: 'local_' + Date.now(), ...product };
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
            products = products.filter(p => p.id !== id);
            localStorage.setItem('pw_products', JSON.stringify(products));
        }
    },

    async placeOrder(order) {
        const p = this.getProvider();
        if (p === 'firebase') {
            const orderId = 'PW' + (Math.floor(Math.random() * 9000) + 1000);
            await window.db.collection('orders').add({ orderId, status: 'Pending', date: new Date().toISOString(), ...order });
            return orderId;
        } else if (p === 'node') {
            const res = await fetch(`${this.nodeUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            const data = await res.json();
            return data.orderId;
        } else {
            const orderId = 'PW' + (Math.floor(Math.random() * 9000) + 1000);
            const orders = JSON.parse(localStorage.getItem('pw_orders')) || [];
            orders.push({ orderId, status: 'Pending', date: new Date().toISOString(), ...order });
            localStorage.setItem('pw_orders', JSON.stringify(orders));
            return orderId;
        }
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
    }
};
