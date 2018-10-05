//require mongoose
var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model but with MongoDB
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  
  summary: {
    type: String, 
    required: false
  },

  link: {
    type: String,
    required: true
  },
  // `comment` is an object that stores a Comment id
  // This allows the application to populate any Articles with associated comments
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});

//Using mongoose's model methods....
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model...
module.exports = Article;