const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwjoa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db('missyWatch');
        const productCollection = database.collection('allProducts');
        const orderCollection = database.collection('allOrders');
        const reviewCollection = database.collection('allReviews');
        const adminCollection = database.collection('allAdmins');

        // get all products
        app.get("/products", async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();

            res.send(products);
        });
        // get a single product
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);

            res.send(product);
        });
        // get all reviews
        app.get("/reviews", async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();

            res.send(reviews);
        });
        // get all orders
        app.get("/all-orders", async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();

            res.send(orders);
        });
        // get a single user's orders
        app.get("/my-orders/:email", async (req, res) => {
            const email = req.params?.email;

            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();

            const myOrders = orders.filter(order => order.orderer?.email === email);

            res.send(myOrders);
        });
        // get all admins
        app.get("/all-admins", async (req, res) => {
            const cursor = adminCollection.find({});
            const admins = await cursor.toArray();

            res.send(admins);
        });

        // book an order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            // console.log(order);

            const result = orderCollection.insertOne(order);

            console.log(result);
            res.json(result);
        });

        // make a review
        app.post('/make-review', async (req, res) => {
            const review = req.body;

            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        // delete an order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await orderCollection.deleteOne(query);
            const found = await orderCollection.findOne(query);

            res.json(result);
        });

        console.log('Database connected successfully!');
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Missy Watch!');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});