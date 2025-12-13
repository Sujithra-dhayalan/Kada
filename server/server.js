require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { db } = require("./config/db");
db();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


