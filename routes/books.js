const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// All Books Route
router.get("/", async (req, res) => {
  let query = Book.find();

  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }

  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }

  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishAfter);
  }

  //res.send("All Books");
  try {
    const books = await query.exec();
    res.render("books/index", {
      books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New Book Route
router.get("/new", async (req, res) => {
  // res.send("New Books");
  renderNewPage(res, new Book());
});

// Create Book Route
router.post("/", async (req, res) => {
  // res.send("Create Books");
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    description: req.body.description,
    pageCount: req.body.pageCount,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    // res.redirect(`/books/${newBook.id}`);
    res.redirect("books");
  } catch (error) {
    // if (book.coverImageName != null) {
    //   removeBookCover(book.coverImageName);
    // }

    renderNewPage(res, book, true);
  }
});

// function removeBookCover(fileName) {
//   fs.unlink(path.join(uploadPath, fileName), (err) => {
//     if (err) console.error(err);
//   });
// }

// Show book page
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();

    console.log(book);
    res.render("books/show", { book });
  } catch (error) {
    res.redirect("/");
  }
});

// Edit Book Route
router.get("/:id/edit", async (req, res) => {
  // res.send("New Books");
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch (error) {
    res.redirect("/");
  }
});

// Update Book Route
router.put("/:id", async (req, res) => {
  // res.send("Create Books");
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }

    await book.save();
    // res.redirect(`/books/${newBook.id}`);
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      res.redirect("/");
    }
  }
});

router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
  } catch (error) {
    if (book != null) {
      res.render("books/show", {
        book,
        errorMessage: "Could not remove book",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book,
    };

    if (hasError) {
      params.errorMessage = "Error Creating Book";
      if (form == "edit") {
        params.errorMessage = "Error Updating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch (error) {
    console.log(error);
    res.redirect("/books");
  }
}

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
  // try {
  //   const authors = await Author.find({});
  //   const params = {
  //     authors,
  //     book,
  //   };

  //   if (hasError) params.errorMessage = "Error Creating Book";
  //   res.render("books/new", params);
  // } catch (error) {
  //   console.log(error);
  //   res.redirect("/books");
  // }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;

  const cover = JSON.parse(coverEncoded);

  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
