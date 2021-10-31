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
        const bookingCollection = database.collection('booking');

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

        // Add bookings
        app.post('/addBooking', (req, res) => {
            const name = req.body.name;
            const email = req.body.email;
            const price = req.body.price;
            const status = req.body.status;
        
            bookingCollection.insertOne({ name, email, price, status })
              .then(result => {
                res.send(result.insertedCount > 0)
              })
              .catch(error => {
                console.log(error);
              });
          });

          //All bookings
          app.get('/allBookings', (req, res) => {
            bookingCollection.find({})
              .toArray((err, docs) => res.send(docs));
          });

          //Update booking
          app.patch('/update/:id', (req, res) => {
            bookingCollection.updateOne({ _id: ObjectId(req.params.id) },
              {
                $set: { status: req.body.status }
              })
              .then(result => res.send(result.modifiedCount > 0))
          });

          //Get bookings
          app.get('/bookings', (req, res) => {
            bookingCollection.find({ email: req.query.email })
              .toArray((err, docs) => {
                res.send(docs)
              })
          });

        // DELETE API
        app.delete('/tours/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toursCollection.deleteOne(query);
            res.json(result);
        })
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