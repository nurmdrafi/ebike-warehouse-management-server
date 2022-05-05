const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.POST || 5000;

require("dotenv").config();

// use middleware
app.use(cors());
app.use(express.json());

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

    // load all items
    // http://localhost:5000/inventory
    app.get("/inventory", async (req, res) => {
      const query = req.query;
      const cursor = inventoryCollection.find(query);
      const items = await cursor.toArray();
      console.log("mongodb connected");
      res.send(items);
    });

    // load single item by /:id
    // http://localhost:5000/inventory/62700f1aa08c33daafab132c
    app.get("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const singleItem = await inventoryCollection.findOne(query);
      // const singleItem = await cursor.toArray();
      res.send(singleItem);
    });

    // Add new item to inventory
    app.post("/add-inventory", async (req, res) =>{
      const data = req.body;
      const result = await inventoryCollection.insertOne(data);
      res.send(result)
    })

    // Delete item from inventory
    // http://localhost:5000/inventory/62700f1aa08c33daafab132c
    app.delete("/inventory/:_id", async (req, res) =>{
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const deleteItem = await inventoryCollection.deleteOne(query);
      res.send(deleteItem);
    })

    // Decrease value by 1
    app.put("/inventory/:_id", async (req,res) =>{
      const id = req.params._id;
    const data = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };

    const updateNote = {
      $set: {
        quantity: data.quantity,
      },
    };
    const result = await inventoryCollection.updateOne(filter, updateNote, options);
    res.send(result)
    })

    // Increase value by input
    app.put("/inventory/:_id", async (req,res) =>{
    const id = req.params._id;
    const data = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };

    const updateNote = {
      $set: {
        quantity: data.quantity,
      },
    };
    const result = await inventoryCollection.updateOne(filter, updateNote, options);
    res.send(result)
    })

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
