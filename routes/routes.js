// Dependencies
var path = require("path");
var axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models")

// Routes
module.exports = function (app) {

  app.get("/", function (req, res) {
    db.Article.find({}, {}, function (err, docs) {
      res.render('home', { articles: docs });
    });
  });

  app.get("/scrape", function (req, res) {
    axios.get("http://www.kotaku.com/").then(function (response) {
      var $ = cheerio.load(response.data);
      $("article.sc-1mg39mc-0").each(function (i, element) {
        var result = {};
        result.title = $(this).children("div.sc-1mg39mc-4").children("a").children("h1").text();
        result.link = $(this).children("div.sc-1mg39mc-4").children("a").attr("href");
        result.summary = $(this).children("div.sc-1mg39mc-2").children("div").children("p").text();
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

  app.get("/clear", function (req, res) {
    db.Article.remove({})
      .then(function () {
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
  });

  app.get("/articles", function (req, res) {
    db.Article.find({}, {}, function (err, docs) {
      var object = {
        fromDB: docs,
        title: "All Articles"
      }
      res.render('home', { object });
    });
  });

  app.get("/saved", function (req, res) {
    db.Saved.find({}, {}, function (err, docs) {
      res.render('saved', { savedarticles: docs });
    });
  });

  app.post("/saved", function (req, res) {
    console.log(req.body.id);
    db.Article.findOne({ _id: req.body.id }, function (err, doc) {
      console.log(doc);
      var result = {};
      result.title = doc.title;
      result.link = doc.link;
      result.summary = doc.summary;
      db.Saved.create(result)
        .then(function () {
          res.redirect("/saved");
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });

  app.delete("/saved", function (req, res) {
    db.Saved.remove({ _id: req.body.id })
      .then(function () {
        res.redirect("/saved");
      })
      .catch(function (err) {
        console.log(err);
      });
  });
};

  // // Route for grabbing a specific Article by id, populate it with it's note
  // app.get("/saved/:id", function (req, res) {
  //   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  //   db.Article.findOne({ _id: req.params.id })
  //     // ..and populate all of the notes associated with it
  //     .populate("note")
  //     .then(function (dbArticle) {
  //       // If we were able to successfully find an Article with the given id, send it back to the client
  //       res.json(dbArticle);
  //     })
  //     .catch(function (err) {
  //       // If an error occurred, send it to the client
  //       res.json(err);
  //     });
  // });
