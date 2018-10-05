//Require mongoose......... again....
var mongoose = require("mongoose");

// Save reference to the Schema
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var NoteSchema = new Schema({
  name: String,
  body: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;