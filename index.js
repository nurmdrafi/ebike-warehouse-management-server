const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

require("dotenv").config();
const jwt = require("jsonwebtoken");

// use middleware
app.use(cors());
app.use(express.json());

// verify jwt
function authenticateToken(req, res, next) {
  // const authHeader = req.headers.authorization;
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token =  authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}


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

    // Create jwt token while login
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // load all items
    // https://ebike-warehouse.herokuapp.com/inventory
    app.get("/inventory", async (req, res) => {
      const query = req.query;
      const cursor = inventoryCollection.find(query);
      const items = await cursor.toArray();
      console.log("mongodb connected");
      res.send(items);
    });

    // load single item by /:id
    // https://ebike-warehouse.herokuapp.com/${_id}
    app.get("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const singleItem = await inventoryCollection.findOne(query);
      // const singleItem = await cursor.toArray();
      res.send(singleItem);
    });

    // https://ebike-warehouse.herokuapp.com?userEmail=${email}
    // app.get("/inventory", async (req, res) => {
    //   const query = req.query;
    //   console.log(query);
    //   const cursor = inventoryCollection.find(query);
    //   const items = await cursor.toArray();
    //   console.log(items);
    //   res.send(items);
    // });

    // load items by email
    app.get("/inventory", authenticateToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });

    // Add new item to inventory
    // https://ebike-warehouse.herokuapp.com/add-inventory
    app.post("/add-inventory", async (req, res) => {
      const data = req.body;
      const result = await inventoryCollection.insertOne(data);
      res.send(result);
    });

    // Delete item from inventory
    // https://ebike-warehouse.herokuapp.com/inventory/${_id}
    app.delete("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const deleteItem = await inventoryCollection.deleteOne(query);
      res.send(deleteItem);
    });

    // Decrease value by 1
    // https://ebike-warehouse.herokuapp.com/inventory/${_id}
    app.put("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateNote = {
        $set: {
          quantity: data.quantity,
        },
      };
      const result = await inventoryCollection.updateOne(
        filter,
        updateNote,
        options
      );
      res.send(result);
    });

    // Increase value by input
    // https://ebike-warehouse.herokuapp.com/inventory/${_id}
    app.put("/inventory/:_id", async (req, res) => {
      const id = req.params._id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateNote = {
        $set: {
          quantity: data.quantity,
        },
      };
      const result = await inventoryCollection.updateOne(
        filter,
        updateNote,
        options
      );
      res.send(result);
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
