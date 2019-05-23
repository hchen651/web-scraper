var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SavedSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: false
  },
  note: {
    type: String,
    required: false
  }
});

var Saved = mongoose.model("Saved", SavedSchema);

module.exports = Saved;
