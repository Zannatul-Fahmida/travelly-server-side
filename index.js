const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9pclo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travelly');
        const toursCollection = database.collection('tours');
        const bookingCollection = database.collection("booking");

        // GET API
        app.get('/tours', async (req, res) => {
            const cursor = toursCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });

        // GET Single Service
        app.get('/tours/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            res.json(tour);
        })

        // POST API
        app.post('/addTours', async (req, res) => {
            const newTour = req.body;
            console.log('hit the post api', newTour);

            const result = await toursCollection.insertOne(newTour);
            console.log(result);
            res.json(result)
        });

        // DELETE API
        app.delete('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toursCollection.deleteOne(query);
            res.json(result);
        });
        
        // GET Booking API
        app.get('/booking', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings);
        });

        //add order in database
        app.post("/addBooking", (req, res) => {
            bookingCollection.insertOne(req.body).then((result) => {
                res.json(result);
            });
        });

        // get all order by email query
        app.get("/myBooking/:email", (req, res) => {
            console.log(req.params);
            bookingCollection
                .find({ email: req.params.email })
                .toArray((err, results) => {
                    res.json(results);
                });
        });
    }
    finally {
        // await client.close()
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running travelly server');
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})