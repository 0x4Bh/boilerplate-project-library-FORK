/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mySecret = process.env.DB;
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'personal-library' });
const bookSchema = new mongoose.Schema({
  title: { type: String },
  commentcount: { type: Number, default: 0 },
  comments: { type: [String] }
});
const BookModel = mongoose.model("personal-library", bookSchema, 'books');
const ObjectId = mongoose.Types.ObjectId;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      BookModel.find({}).exec((err, data) => {
        if (err) console.log(err);
        res.json(data);
      });
    })

    .post(function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.send("missing required field title");
      }
      else {
        let newBook = new BookModel({ "title" : title });
        newBook.save((err, data) => {
          if (err) {
            console.log(err);
          }
          else {
            res.json({ "_id": data._id, "title": data.title });
          }
        });
      }
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      BookModel.deleteMany({}, (err, doc) => {
        if (err) {
          console.log(err);
          res.send("something went wrong, check the console");
        }
        else {
          res.send("complete delete successful");
        }
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!ObjectId.isValid(bookid)) {
        console.log("invalid id");
        res.send("no book exists");
      }
      else {
        BookModel.findById(bookid, (err, book) => {
          if (err || !book) {
            console.log(err || 'no book exists');
            res.send("no book exists");
          }
          else {
            res.json(book)
          }
        });
      }
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!bookid || !ObjectId.isValid(bookid)) {
        console.log("no book exists(invalid id)");
        res.send("no book exists");
      }
      else if (!comment) {
        res.send('missing required field comment');
      }
      else {
        BookModel.findById(bookid, (err, book) => {
          if (err || !book) {
            console.log(err || "no book exists(findById)");
            res.send("no book exists");
          }
          else {
            console.log(book._doc);
            book.comments = [...book.comments, comment];
            book.commentcount = book.commentcount + 1;
            book.save().then(updatedBook => {
              if (String(updatedBook._id) === String(bookid)) {
                res.json(updatedBook);
              }
              else {
                res.send("no book exists");
              }
            });
          }
        });
      }
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!bookid || !ObjectId.isValid(bookid)) {
        console.log("no book exists(invalid id)");
        res.send("no book exists");
      }
      else {
        BookModel.findByIdAndDelete(bookid, (err, doc) => {
          if (err || !doc) {
            console.log(err || "no book exists(delete)");
            res.send("no book exists");
          }
          else {
            console.log(doc);
            res.send("delete successful");
          }
        });
      }
    });

};
