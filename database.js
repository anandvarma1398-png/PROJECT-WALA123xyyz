/**
 * PROJECT WALA - Enhanced Database Layer
 * includes Timeouts to prevent "Stuck" state
 */

const Database = {
    // Helper to timeout a promise (Prevents hanging forever)
    withTimeout(promise, ms = 5000) {
        let timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection Timeout: Is your Firestore Database enabled in Google Console?')), ms)
        );
        return Promise.race([promise, timeout]);
    },

    async getProducts() {
        try {
            if (window.USE_FIREBASE && window.db) {
                const snapshot = await this.withTimeout(window.db.collection('products').get());
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
            return JSON.parse(localStorage.getItem('pw_products')) || [];
        } catch (error) {
            console.error("Fetch Error:", error);
            return [];
        }
    },

    observeProducts(callback) {
        if (window.USE_FIREBASE && window.db) {
            return window.db.collection('products').onSnapshot(snapshot => {
                const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(products);
            }, err => console.error("Sync Error:", err));
        }
        callback(JSON.parse(localStorage.getItem('pw_products')) || []);
    },

    async addProduct(product) {
        console.log("Attempting to add product:", product);

        // Fix Drive Link
        if (product.image && product.image.includes('drive.google.com')) {
            const id = product.image.split('/d/')[1]?.split('/')[0];
            if (id) product.image = `https://drive.google.com/uc?export=view&id=${id}`;
        }

        if (window.USE_FIREBASE && window.db) {
            try {
                const docRef = await this.withTimeout(window.db.collection('products').add(product));
                console.log("Product added with ID:", docRef.id);
                return docRef;
            } catch (error) {
                console.error("Firestore Add Error:", error);
                throw error;
            }
        } else {
            const products = await this.getProducts();
            const newP = { id: 'local_' + Date.now(), ...product };
            products.push(newP);
            localStorage.setItem('pw_products', JSON.stringify(products));
            return newP;
        }
    },

    async deleteProduct(id) {
        if (window.USE_FIREBASE && window.db) {
            await window.db.collection('products').doc(id).delete();
        } else {
            let products = await this.getProducts();
            products = products.filter(p => p.id !== id);
            localStorage.setItem('pw_products', JSON.stringify(products));
        }
    },

    async placeOrder(order) {
        const orderId = 'PW' + (Math.floor(Math.random() * 9000) + 1000);
        const finalOrder = { orderId, date: new Date().toISOString(), status: 'Pending', ...order };

        if (window.USE_FIREBASE && window.db) {
            await this.withTimeout(window.db.collection('orders').add(finalOrder));
        } else {
            const orders = JSON.parse(localStorage.getItem('pw_orders')) || [];
            orders.push(finalOrder);
            localStorage.setItem('pw_orders', JSON.stringify(orders));
        }
        return orderId;
    },

    async getOrders() {
        if (window.USE_FIREBASE && window.db) {
            const snap = await this.withTimeout(window.db.collection('orders').get());
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return JSON.parse(localStorage.getItem('pw_orders')) || [];
    },

    async getOrderById(orderId) {
        const orders = await this.getOrders();
        return orders.find(o => o.orderId === orderId);
    },

    async updateOrderStatus(id, status) {
        if (window.USE_FIREBASE && window.db) {
            await window.db.collection('orders').doc(id).update({ status });
        }
    }
};
