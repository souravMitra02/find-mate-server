const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
// port
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssk8yog.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const postsCollection = client.db("roommateFinderDB").collection("posts");

    // GET all listings for Browse Listings page
    app.get("/listings", async (req, res) => {
     
        const listings = await postsCollection.find().toArray();
        res.send(listings);
    });

    // POST new listing
    app.post('/listings', async (req, res) => {
      const newListing = req.body;
      const result = await postsCollection.insertOne(newListing);
      res.send(result);
    });

    // Featured listings (example)
    app.get("/featured", async (req, res) => {
      const result = await postsCollection
        .find({ availability: "available" })
        .limit(6)
        .toArray();
      res.send(result);
    });


    app.get("/my-listings", async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail) {
        return 
      }
        const userListings = await postsCollection.find({ userEmail }).toArray();
        res.send(userListings);
    });

app.put('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
 
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    res.send(result);
});

    app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
 
    const result = await postsCollection.findOne(
      { _id: new ObjectId(id) },
    );
    res.send(result);
});

    app.delete('/listings/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await postsCollection.deleteOne(query);
  res.send(result);
});

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
