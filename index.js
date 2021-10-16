require("dotenv").config();


const express=require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
//database
const database=require("./database/database");

//models
const BookModel=require("./database/books");
const AuthorModel=require("./database/author");
const PublicationModel=require("./database/publications");

//intialize express
const booky =express();
booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL,
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(()=>console.log("connection established"));

/*
Route               /
description        get all books
access             public
parameter          none
methods            get
*/
booky.get('/', async (req, res) => {
  const getAllBooks = await BookModel.find();
  return res.json({ getAllBooks });
});

/*
Route            /is
Description      Get specific book on ISBN
Access           PUBLIC
Parameter        isbn
Methods          GET
*/
booky.get('/is/:isbn', async (req, res) => {
  const getSpecificBook = await BookModel.findOne({ ISBN: req.params.isbn });
  //null

  if (!getSpecificBook) {
    return res.json({
      error: `No book found for the ISBN of ${req.params.isbn}`,
    });
  }

  return res.json({ book: getSpecificBook });
});

/*
Route            /c
Description      Get specific book on category
Access           PUBLIC
Parameter        category
Methods          GET
*/

booky.get('/c/:category', async (req, res) => {
  const getSpecificBook = await BookModel.findOne({
    category: req.params.category,
  });

  //null !0 = 1 , !1=0
  if (!getSpecificBook) {
    return res.json({
      error: `No book found for the category of ${req.params.category}`,
    });
  }

  return res.json({ book: getSpecificBook });
});

/*
    Route             /
    Description     Get specific book on specific language
    Access          Public
    Parameter       language
    Method          Get
*/
booky.get('/l/:language', (req, res) => {
  const getSpecificBook = database.books.filter(
    (book) => book.language === req.params.language
  );

  if (getSpecificBook.length == 0) {
    return res.json({
      error: `No note book found for the language ${req.params.language}`,
    });
  }
  return res.json({ book: getSpecificBook });
});


/*
Route            /author
Description      Get all authors
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get('/author', async (req, res) => {
  const getAllAuthors = await AuthorModel.find();
  return res.json(getAllAuthors);
});

/*
Route            /author/book
Description      Get all authors based on books
Access           PUBLIC
Parameter        isbn
Methods          GET
*/

booky.get('/author/book/:isbn', (req, res) => {
  const getSpecificAuthor = database.author.filter((author) =>
    author.books.includes(req.params.isbn)
  );

  if (getSpecificAuthor.length === 0) {
    return res.json({
      error: `No author found for the book of ${req.params.isbn}`,
    });
  }
  return res.json({ authors: getSpecificAuthor });
});

/*
Route            /publications
Description      Get all publications
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get('/publications', async (req, res) => {
  const getAllPublications = await PublicationModel.find();
  return res.json(getAllPublications);
});

/*
    Route             /publications/id/:id
    Description     Get specific publication
    Access          Public
    Parameter       None
    Method          Get
*/
booky.get('/publications/id/:id', (req, res) => {
  const getSpecificPub = database.publication.filter(
    (publication) => publication.id == req.params.id
  );
  if (getSpecificPub.length === 0) {
    return res.json({
      error: `No Publications found for the id ${req.params.id} `,
    });
  }
  return res.json({ publications: getSpecificPub });
});

/*
    Route             /publications/book
    Description     Get specific publication
    Access          Public
    Parameter       None
    Method          Get
*/
booky.get('/publication/:book', (req, res) => {
  const getSpecificPub = database.publication.filter((publication) =>
    publication.books.includes(req.params.book)
  );

  if (getSpecificPub.length === 0) {
    return res.json({
      error: `No publications found for the book of ${req.params.book}`,
    });
  }
  return res.json({ publications: getSpecificPub });
});

//POST book route

/*
Route            /book/new
Description      Add new books
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post('/book/new', async (req, res) => {
  const { newBook } = req.body;

  const addNewBook = BookModel.create(newBook);
  return res.json({
    books: addNewBook,
    message: 'book was added!!',
  });
});

/*
Route            /author/new
Description      Add new authors
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post('/author/new', async (req, res) => {
  const { newAuthor } = req.body;
  const addNewAuthor = AuthorModel.create(newAuthor);
  return res.json({
    author: addNewAuthor,
    message: 'new add',
  });
});

/*
Route            /publication/new
Description      Add new publications
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post('/publication/new', (req, res) => {
  const newPublication = req.body;
  const addNewPublication = PublicationModel.create(newPublication);
  return res.json({
    Publication: addNewPublication,
    message: 'Publication was added',
  });

});

/*
Route            /publication/update/book
Description      Update /add new publication
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/

//put
booky.put("/book/update/:isbn",async (req,res) =>{
  const updateBook =await BookModel.findOneAndUpdate(
    {
    ISBN: req.params.isbn
    },
    {
    title: req.body.bookTitle
    },
    {
    new:true
    }
);
return res.json({
  books:updateBook
});
});

//
booky.put("/book/author/update/:isbn",async(req,res) =>
{
// update book database
const updateBook =await BookModel.findOneAndUpdate(
  {
    ISBN: req.params.isbn
  },
  {
    $addToSet:{
      authors:req.body.newAuthor
    }
  },
    {
      new:true
    }
  );

  //update the author database
 const updateAuthor =await AuthorModel.findOneAndUpdate(
   {
     id:req.body.newAuthor
   },
   {
     $addToSet:{
       books: req.params.isbn

     }
   },
   {
     new:true
   }
 );

 return res.json(
   {
     books:updatedBook,
     authors:updatedAuthor,
     message:"new Author was added"
   }
 )
});

booky.put('/publication/update/book/:isbn', (req, res) => {
  //Update the publication database
  database.publication.forEach((pub) => {
    if (pub.id === req.body.pubId) {
      return pub.books.push(req.params.isbn);
    }
  });

  //Update the book database
  database.books.forEach((book) => {
    if (book.ISBN === req.params.isbn) {
      book.publications = req.body.pubId;
      return;
    }
  });

  return res.json({
    books: database.books,
    publications: database.publication,
    message: 'Successfully updated publications',
  });
});

/*DELETE**/
/*
Route            /book/delete
Description      Delete a book
Access           PUBLIC
Parameter        isbn
Methods          DELETE
*/

booky.delete('/book/delete/:isbn',async (req, res) => {
  //Whichever book that doesnot match with the isbn , just send it to an updatedBookDatabase array
  //and rest will be filtered out

  const updatedBookDatabase = await BookModel.findOneAndDelete(
    {
      ISBN: req.params.isbn
    }
  );

return res.json({
  books:updatedBookDatabase
});


});

/*
Route            /book/delete/author
Description      Delete an author from a book and vice versa
Access           PUBLIC
Parameter        isbn, authorId
Methods          DELETE
*/

booky.delete('/book/delete/author/:isbn/:authorId', (req, res) => {
  //Update the book database
  database.books.forEach((book) => {
    if (book.ISBN === req.params.isbn) {
      const newAuthorList = book.author.filter(
        (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
      );
      book.author = newAuthorList;
      return;
    }
  });

  //Update the author database
  database.author.forEach((eachAuthor) => {
    if (eachAuthor.id === parseInt(req.params.authorId)) {
      const newBookList = eachAuthor.books.filter(
        (book) => book !== req.params.isbn
      );
      eachAuthor.books = newBookList;
      return;
    }
  });

  return res.json({
    book: database.books,
    author: database.author,
    message: 'Author was deleted!!!!',
  });
});

booky.listen(3000, () => {
  console.log('Server is up and running');
});
