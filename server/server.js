const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const config = require("../config/config").get(process.env.NOD_ENV);
const app = express();

const userRoutes = require("./Routes/userRoutes");
const booksRoutes = require("./Routes/booksRoutes");

mongoose.connect(config.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

//MiddleWares

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/books", booksRoutes);

//'api/users/register

//Ports

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log("This Server is listening to user requests");
});
