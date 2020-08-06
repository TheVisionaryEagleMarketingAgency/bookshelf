const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");

////Models

const { User } = require("../models/users");
//const { json } = require("body-parser");

///Routes

router.post("/register", (req, res) => {
  //post the user to the server

  //get the user details from the form and store it in user and in db

  const user = new User(req.body);
  user.save((err, doc) => {
    if (err) return res.json({ success: false });

    res.status(200).json({
      success: true,
      user: doc,
    });
  });
});

router.post("/login", (req, res) => {
  //Look in the db and check is the user exists
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        auth: false,
        message: "Authentication Failed, Email Not Found",
        userData: false,
      });

    console.log(`The user password is ${req.body.password}`); //expecting to see my inputs
    console.log(`The hashed password is  is ${user.password}`); //See the hashone one

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          auth: false,
          message: "Authentication Failed, Password Not Found",
          userData: false,
        });

      //usertoken

      user.generateToken((err, user) => {
        if (err) return res.status(400).send({ err });

        res.cookie("auth", user.token).json({
          auth: true,
          userData: {
            id: user._id,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
          },
        });
      });
    });
  });
});

router.get("/auth", auth, (req, res) => {
  res.json({
    auth: true,
    message: "You are authentication",
    userData: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
    },
  });
});

router.get("/logout", auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err)
      return res.status(400).json({
        message: "Cant log out",
      });

    res.status(200).json({
      message: "Okay",
    });
  });
});
module.exports = router;
