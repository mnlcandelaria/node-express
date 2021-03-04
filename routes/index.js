const express = require("express");
const router = express.Router();
const Book = require("../models/book");

router.get("/", async (req, res) => {
  //res.send("Hello World");
  let books;
  try {
    books = await Book.find().sort({ createdAt: "desc" }).limit(10).exec();
  } catch (error) {
    books = [];
  }

  res.render("index", { books });
});

module.exports = router;
