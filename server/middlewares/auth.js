const { User } = require("../models/users");

let auth = (req, res, next) => {
  //get the cookie
  let token = req.cookies.auth;
  User.findByToken(token, (err, user) => {
    if (err)
      return res.status(400).json({
        message: "Bad Token",
      });

    if (!user)
      return res.status(400).json({
        message: "Wrong Password",
      });

    req.user = user;
    user.token = token;
    next();
  });
};

module.exports = { auth };
