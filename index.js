const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
const port = process.env.POST || 5000;

// use middleware
app.use(cors()); 
app.use(express.json());

// for testing
app.get("/", (req, res) => {
    res.send({ message: "Success" });
});

app.listen(port, () => {
    console.log("Listening to port", port);
});