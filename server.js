//Just a bit of silliness...
console.log("");
console.log('MY GOD YOU ACTUALLY MADE IT! Only few have traveled so far in the galaxy and only a few will return with the knowledge that you are about to gain....');
console.log('');
console.log('FYI man, alright. You could sit at home, and do like absolutely nothing, and your name goes through like 17 computers a day. 1984? Yeah right, man.');
console.log("");
console.log("That's a typo. Orwell is here now. He's livin' large. We have no names, man. No names. We are nameless");
console.log('');
console.log("This is our world now. The world of the electron and the switch; the beauty of the baud. We exist without nationality, skin color, or religious bias."); 
console.log("");
console.log("You wage wars, murder, cheat, lie to us and try to make us believe it's for our own good, yet we're the criminals.");
console.log("");
console.log("Yes, I am a criminal. My crime is that of curiosity. I am a hacker, and this is my manifesto.");
console.log('');
console.log("I hope you don't screw like you type...");
console.log("");
//Welcome to the dependancy section of my code....

var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

//Aaaaaand now to initialize mongoose and gaurd the Mongo URI for my database...

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var db = mongoose.connection;
var PORT = process.env.MONGODB_PORT || 3000;

//init express....
var app = express();

app.use(express.urlencoded({
    extended: true
	}));
app.use(express.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("index.html");
});

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://news.ycombinator.com/#").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        //console.log(response.data);
        // Now, we grab every h2 within an article tag, and do the following:
        $(".card ").each(function (i, element) {
            //console.log($(this));
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("h3")
                .text();
            
            result.summary = $(this)
                .children("p")
                .text();

            result.link = "https://news.ycombinator.com/" + $(this)
                .attr("href");

            //console.log(result);
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({
            _id: req.params.id
        })
        // ..and populate all of the commentss associated with it
        .populate("comment")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function (req, res) {
    // Create a new comment and pass the req.body to the entry
    db.Comment.create(req.body)
        .then(function (dbComment) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                comment: dbComment._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


app.listen(PORT, function () {
	console.log ("");
	console.log("App running on port " + PORT + "!");
	console.log("");
	console.log('port..............?');
	console.log('');
	console.log("Oh, I don't know. Is it that we collectively thought Steve Jobs was a great man, even when we knew he made billions off the backs of children?");
	console.log("");
	console.log("Or maybe it's that it feels like all our heroes are counterfeit? The world itself's just one big hoax.");
	console.log("");
	console.log("Spamming each other with our running commentary of bullshit, masquerading as insight, our social media faking as intimacy.");
	console.log("");
	console.log("Or is it that we voted for this? Not with our rigged elections, but with our things, our property, our money. I'm not saying anything new.");
	console.log("");
	console.log("We all know why we do this, not because Hunger Games books makes us happy, but because we wanna be sedated. Because it's painful not to pretend, because we're cowards.");
	console.log("");
	console.log("...");
	console.log("");
	console.log("......");
	console.log("");
	console.log(".........");
	console.log("");
	console.log("............");
	console.log("");
	console.log(".... Fuck society .....");
});