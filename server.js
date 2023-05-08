const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const connectionString = "mongodb+srv://gregorymyers:MDOTPhish2022@csgmapping1.se0t3ww.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Geolocation Schema and Model
const geolocationSchema = new mongoose.Schema({
  sourceID: Text,
  latitude: Number,
  longitude: Number,
  altitude: Number,
  timestamp: { type: Date, default: Date.now },
});

const Geolocation = mongoose.model("Geolocation", geolocationSchema);

// API Endpoints
app.post("/geolocation", async (req, res) => {
  const location = new Geolocation(req.body);
  try {
    await location.save();
    res.status(201).send(location);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/geolocation", async (req, res) => {
  try {
    const locations = await Geolocation.find().sort("-timestamp").limit(1);
    res.send(locations);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


//mongodb+srv://gregorymyers:<password>@csgmapping1.se0t3ww.mongodb.net/?retryWrites=true&w=majority

/*const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://gregorymyers:<password>@csgmapping1.se0t3ww.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);*/