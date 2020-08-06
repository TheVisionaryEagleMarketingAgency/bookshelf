const express = require("express");
const router = express.Router();

//Models

const { Book } = require("../models/book");

const { auth } = require("../middlewares/auth");

router
  .route("/book")
  .get((req, res) => {
    let id = req.query.id;

    // Book.find({ _id: id }, (err, doc) => {
    //   if (err) return res.status(400).send(err);
    //   res.send(...doc);
    // });

    Book.find({ _id: id })
      .populate("ownerId", "name lastname")
      .exec((err, doc) => {
        if (err) return res.status(400).send(err);
        res.send(...doc);
      });
  })
  .post(auth, (req, res) => {
    //create a new book

    const book = new Book({
      ...req.body,
      ownerId: req.user._id,
    });

    book.save((err, doc) => {
      if (err) return res.status(400).send(err);

      res.status(200).json({
        post: true,
        bookId: doc._id,
      });
    });
  })
  .patch(auth, (req, res) => {
    Book.findByIdAndUpdate(
      req.body._id,
      req.body,
      { new: true },
      (err, doc) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({
          success: true,
          doc,
        });
      }
    );
  })
  .delete(auth, (req, res) => {
    let id = req.query.id;

    Book.findByIdAndRemove(id, (err, doc) => {
      if (err) return res.status(400).send(err);
      res.json(true);
    });
  });

///Get All Books

router.route("/all_books").get((req, res) => {
  //http://localhost:3005/api/books/all_books?skip=1&limit=2&order=asc&owner=5f20213708e165094012fb5b
  let skip = req.query.skip ? parseInt(req.query.skip) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 50;
  let order = req.query.order ? req.query.order : "asc";
  let byOwner = req.query.owner ? { ownerId: req.query.owner } : {};

  Book.find({ byOwner })
    .skip(skip)
    .sort({ _id: order })
    .limit(limit)
    .exec((err, doc) => {
      if (err) return res.status(400).send(err);
      res.send(doc);
    });
});

module.exports = router;
