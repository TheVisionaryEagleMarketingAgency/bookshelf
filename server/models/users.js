const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config/config").get(process.env.NOD_ENV);
const SALT_I = 10;

//Creating the schema

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "You have not given a email"],
    unique: true,
    trim: true,
  },

  password: {
    type: String,
    required: [true, "You have not given a password"],
    minlength: 6,
  },

  name: {
    type: String,
    maxlength: 100,
  },

  lastname: {
    type: String,
    maxlength: 100,
  },
  role: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
  },
});

userSchema.pre("save", function (next) {
  var user = this;
  console.log(`New User Created is ${this}`); //Expecting to see what i inputed
  if (user.isModified("password")) {
    bcrypt.hash(user.password, SALT_I, function (err, hash) {
      // Store hash in your password DB.
      if (err) return next(err);
      user.password = hash;
      console.log(`The hash is ${hash}`); //Expecting to see the hash
      next();
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  var user = this;
  bcrypt.compare(candidatePassword, user.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;

  var token = jwt.sign(user._id.toHexString(), config.SECRET);

  user.token = token;

  user.save(function (err, user) {
    if (err) return cb(err);

    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  jwt.verify(token, config.SECRET, (err, decode) => {
    user.findOne({ _id: decode, token: token }, (err, user) => {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

userSchema.methods.deleteToken = function (token, cb) {
  var user = this;
  user.updateOne({ $unset: { token: 1 } }, (err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

//Creating the model or collection
const User = mongoose.model("User", userSchema);

module.exports = { User };

// bcrypt.genSalt(SALT_I, function (err, salt) {
//   if (err) return next(err);

//   bcrypt.hash(user.password, salt, function (err, hash) {
//     if (err) return next(err);
//     user.password = hash;
//     next();
//   });
// });
