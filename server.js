console.log('MY GOD YOU ACTUALLY MADE IT! Only few have traveled so far in the galaxy and only a few will return with the knowledge that you are about to gain....');

//Welcome to the massive dependancy section of my code....

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');
var request = require('request');
var cheerio = require('cheerio');
var axios = require('axios');

//Aaaaaand now to initialize mongoose and gaurd the Mongo URI for my database...

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var db = mongoose.connection;

var PORT = process.env.MONGODB_PORT || 3000;

var app = express();

app.use(logger("dev"));
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

app.get("/scrape", function(req,res){
	request("https://www.nytimes.com/", function(err, res, html){
		var $ = cheerio.load(html);
		console.log(response);
		$("article").each(function(i,element){
			console.log(response);
			var result = {};
			result.title = $(this).children("h2").text();
			result.summary = $(this).children(".summary").text();
			result.link = $(this).children("h2").children("a").attr("href");

			var entry = new Article(result);

			entry.save(function(err, doc){
				if(err){
					console.log(err);
				}
				else{
					console.log(doc);
				}
			});
		});
		res.send("Scrape Complete");
	});
});

//get all of the articles and show them onscreen...

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
