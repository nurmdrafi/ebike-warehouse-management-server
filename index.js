const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.POST || 5000;

require('dotenv').config();

// use middleware
app.use(cors());
app.use(express.json());


// const uri = "mongodb+srv://wmsDB:$h8bSQDrKj*W2F@G@cluster0.iukjo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iukjo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client
      .db("warehouseManagement")
      .collection("inventory");

    app.get("/inventory", async (req, res) => {
      const query = req.query;
      const cursor = inventoryCollection.find(query);
      const inventory = await cursor.toArray();
      console.log("mongodb connected");
      res.send(inventory);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

// for testing
// app.get("/", (req, res) => {
//   res.send({ message: "Success" });
// });

app.listen(port, () => {
  console.log("Listening to port", port);
});
