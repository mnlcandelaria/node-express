const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// All Authors Route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    console.log(searchOptions);
    res.render("authors/index", {
      authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("authors/");
  }
});

// New Author Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author Route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    res.redirect(`/authors/${newAuthor.id}`);
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: `Error creating Author`,
    });
  }

  // author.save((err, newAuthor) => {
  //   let locals = {
  //     author: author,
  //     errorMessage: `Error creating Author`,
  //   };

  //   if (err) {
  //     res.render("authors/new", locals);
  //   } else {
  //     // res.redirect("authors/${newAuthor.id}");
  //     res.redirect("authors/");
  //   }
  // });

  // res.send(req.body.name);
});

router.get("/:id", async (req, res) => {
  //res.send("show author" + req.params.id);
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render(`authors/show`, {
      author,
      booksByAuthor: books,
    });
  } catch (error) {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  //res.send("edit author" + req.params.id);
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author });
  } catch (error) {
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  // res.send("Update author" + req.params.id);
  let author;

  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: `Error updating Author`,
      });
    }
  }
});

router.delete("/:id", async (req, res) => {
  // res.send("Delete author" + req.params.id);
  // res.send("Update author" + req.params.id);
  let author;

  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
