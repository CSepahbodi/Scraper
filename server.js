//Just a bit of silliness...
console.log('MY GOD YOU ACTUALLY MADE IT! Only few have traveled so far in the galaxy and only a few will return with the knowledge that you are about to gain....');
console.log('');
console.log('FYI man, alright. You could sit at home, and do like absolutely nothing, and your name goes through like 17 computers a day. 1984? Yeah right, man.');
console.log("That's a typo. Orwell is here now. He's livin' large. We have no names, man. No names. We are nameless");
console.log('');
console.log("This is our world now. The world of the electron and the switch; the beauty of the baud. We exist without nationality, skin color, or religious bias."); 
console.log("You wage wars, murder, cheat, lie to us and try to make us believe it's for our own good, yet we're the criminals. Yes, I am a criminal. My crime is that of curiosity. I am a hacker, and this is my manifesto.");
console.log('');
console.log("I hope you don't screw like you type...");
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

var app = express();

//app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));

//handlebars....

app.use(express.static("public"));

var exphbs = require('express-handlebars');
app.engine("handlebars", exphbs({
	defaultLayout: "main",
	partialsDir: path.join(__dirname, "/views/layouts/partials")
}));

app.set("view engine", "handlebars");

db.on("error", function(error){
	console.log("Mongoose Error: ", error);
});

db.once("open", function(){
	console.log("Mongoose connection successful.");
});

//render the homepage and show the data...

app.get("/", function(req,res){
	Article.find({"saved": false}).limit(20).exec(function(error,data){
		var hbsObject = {
			article: data
		};
		console.log(hbsObject);
		res.render("home", hbsObject);
	});
});

//to show the articles that were scraped from the new york times...

app.get("/saved", function(req,res){
	Article.find({"saved": true}).populate("notes").exec(function(error, articles){
		var hbsObject = {
			article: articles
		};
		res.render("saved", hbsObject);
	});
});

//Scrape function to get articles from the new york times...

app.get("/scrape", function(req, res) {
	//request("https://www.nytimes.com/", function(err, res, html){
	// First, we grab the body of the html with axios
	axios.get("https://hiphopdx.com/news#").then(function (response) {
	// Then, we load that into cheerio and save it to $ for a shorthand selector
	var $ = cheerio.load(response.data);
	//console.log(response.data);
	// Now, we grab every h2 within an article tag, and do the following:
	$(".card ").each(function (i, element) {
		//console.log($(this))
		// Save an empty result object
		var result = {};
		// Add the text and href of every link, and save them as properties of the result object
		result.title = $(this)
		.children("h3")
		.text();
		result.summary = $(this)
		.children("p")
		.text();
		result.link = "https://newyorktimes.com" + $(this)
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

//get all of the articles and show them onscreen once scraped...

app.get("/articles", function(req,res){
	Article.find({}).limit(20).exec(function(error, doc){
		if(error){
			console.log(error);
		}
		else{
			res.json(doc);
		}
	});
});


//get a specific article...

app.get("/articles/:id", function(req,res){
	Article.findOne({ "_id": req.params.id})
	.populate("note")
	.exec(function(error, doc){
		if(error){
			console.log(error);
		}
		else{
			res.json(doc);
		}
	});
});

//when you want to save an article to the saved articles section...

app.post("/articles/save/:id", function(req,res){
	Article.findOneAndUpdate({ "_id": req.params.id}, {"saved": true})
	.exec(function(err, doc){
		if(err){
			console.log(err);
		}
		else{
			res.send(doc);
		}
	});
});

//When you want to delete an article from the saved articles section...

app.post("/articles/delete/:id", function(req,res){
	Article.findOneAndUpdate({ "_id": req.params.id}, {"saved": false, "notes":[]})
	.exec(function(err, doc){
		if(err){
			console.log(err);
		}
		else{
			res.send(doc);
		}
	});
});


//when you want to post a comment to one of the articles...
app.post("notes/save/:id", function(req,res){
	var newNote = new Note({
		body: req.body.text,
		article: req.params.id
	});
	console.log(req.body)
	newNote.save(function(error, note){
		if(error){
			console.log(error);
		}
		else{
			Article.findOneAndUpdate({ "_id": req.params.id}, {$push: { "notes": note } })
			.exec(function(err){
				if(err){
					console.log(err);
					res.send(err);
				}
				else{
					res.send(note);
				}
			});
		}
	});
});


//delete the note when you click delete....

app.delete("/notes/delete/:note_id/:article", function(req,res){
	Note.findOneAndRemove({"_id": req.params.note.id}, function(err){
		if(err){
			console.log(err);
			res.send(err);
		}
		else{
			Article.findOneAndUpdate({"_id": req.params.article_id}, {$pull: {"notes": req.params.note_id}})
				.exec(function(err){
					if(err){
						console.log(err);
						res.send(err); 
					}
					else{
						res.send("Note Deleted");
					}
				});
		}
	});
});


//Init Port and display it in the console...
app.listen(PORT, function(){
	console.log("App running on PORT: " + PORT);
});