const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoute = require("./routes/userRoute");
const providerRoute = require("./routes/providerRoute");
const categoryRoute = require("./routes/categoryRoute");
const serviceRoute = require("./routes/serviceRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoute);
app.use("/", categoryRoute);
app.use("/", providerRoute);
app.use("/", serviceRoute);

dotenv.config();

app.get("/", (req, res) => {
  res.send({ msg: "Skillserve API is Running" });
});

// Connect DB
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is Running at Port ${process.env.PORT}`);
});
