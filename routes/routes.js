// Dependencies
var path = require("path");
var axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models")

// Routes
module.exports = function(app) {
  app.get("/scrape", function(req, res) {
    axios.get("http://www.kotaku.com/").then(function(response) {
      var $ = cheerio.load(response.data);
      $("article.sc-1mg39mc-0").each(function(i, element) {
        var result = {};
        result.title = $(this).children("div.sc-1mg39mc-4").children("a").children("h1").text();
        result.link = $(this).children("div.sc-1mg39mc-4").children("a").attr("href");
        result.summary = $(this).children("div.sc-1mg39mc-2").children("div").children("p").text();
        console.log(result);
        db.Article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
          });
      });
      res.redirect("/");
    });
  });

  app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        //res.json(dbArticle);
        res.render('home', {articles: dbArticle});
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  app.get("/saved", function(req, res) {
    db.Saved.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};

