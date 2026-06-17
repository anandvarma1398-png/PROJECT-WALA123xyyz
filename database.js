/**
 * Database Management for PROJECT WALA
 * Handles Products, Orders, and Customers with Error Reporting
 */

const Database = {
    // --- PRODUCTS ---
    async getProducts() {
        try {
            if (window.USE_FIREBASE && window.db) {
                const snapshot = await window.db.collection('products').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                return JSON.parse(localStorage.getItem('pw_products')) || this.getInitialMockProducts();
            }
        } catch (error) {
            console.error("Database Error (getProducts):", error);
            return [];
        }
    },

    observeProducts(callback) {
        if (window.USE_FIREBASE && window.db) {
            return window.db.collection('products').onSnapshot(snapshot => {
                const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(products);
            }, error => {
                console.error("Real-time Listener Error:", error);
                alert("Firebase Error: Check your Firestore Security Rules!");
            });
        } else {
            callback(JSON.parse(localStorage.getItem('pw_products')) || this.getInitialMockProducts());
        }
    },

    async addProduct(product) {
        try {
            // Google Drive Image conversion
            if (product.image && product.image.includes('drive.google.com')) {
                const fileId = product.image.split('/d/')[1]?.split('/')[0];
                if (fileId) product.image = `https://drive.google.com/uc?export=view&id=${fileId}`;
            }

            if (window.USE_FIREBASE && window.db) {
                return await window.db.collection('products').add(product);
            } else {
                const products = await this.getProducts();
                const newProduct = { id: 'P' + Date.now(), ...product };
                products.push(newProduct);
                localStorage.setItem('pw_products', JSON.stringify(products));
                return newProduct;
            }
        } catch (error) {
            console.error("Error adding product:", error);
            throw error; // Pass to UI for alert
        }
    },

    async deleteProduct(id) {
        try {
            if (window.USE_FIREBASE && window.db) {
                await window.db.collection('products').doc(id).delete();
            } else {
                let products = await this.getProducts();
                products = products.filter(p => p.id !== id);
                localStorage.setItem('pw_products', JSON.stringify(products));
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    },

    // --- ORDERS ---
    async placeOrder(orderDetails) {
        try {
            const orderId = 'PW' + (1000 + (await this.getOrders()).length + 1);
            const order = {
                orderId,
                date: new Date().toISOString(),
                status: 'Pending',
                deliveryDate: '',
                ...orderDetails
            };

            if (window.USE_FIREBASE && window.db) {
                await window.db.collection('orders').add(order);
            } else {
                const orders = await this.getOrders();
                orders.push(order);
                localStorage.setItem('pw_orders', JSON.stringify(orders));
            }
            return orderId;
        } catch (error) {
            console.error("Order placement error:", error);
            throw error;
        }
    },

    async getOrders() {
        try {
            if (window.USE_FIREBASE && window.db) {
                const snapshot = await window.db.collection('orders').orderBy('date', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                return JSON.parse(localStorage.getItem('pw_orders')) || [];
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            return [];
        }
    },

    async getOrderById(orderId) {
        const orders = await this.getOrders();
        return orders.find(o => o.orderId === orderId);
    },

    async updateOrderStatus(id, status) {
        try {
            const updateData = { status };
            if (status === 'Delivered') updateData.deliveryDate = new Date().toISOString();

            if (window.USE_FIREBASE && window.db) {
                await window.db.collection('orders').doc(id).update(updateData);
            } else {
                const orders = await this.getOrders();
                const index = orders.findIndex(o => o.id === id || o.orderId === id);
                if (index !== -1) {
                    orders[index] = { ...orders[index], ...updateData };
                    localStorage.setItem('pw_orders', JSON.stringify(orders));
                }
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    },

    getInitialMockProducts() {
        return [
            { id: 'p1', name: 'ESP32 Dev Board', category: 'Microcontrollers', price: 450, image: 'https://via.placeholder.com/150', description: 'Sample product' }
        ];
    }
};
