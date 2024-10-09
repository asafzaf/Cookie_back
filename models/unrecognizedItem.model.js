const { Schema, model } = require("mongoose");

const unrecognizedItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  numberOfTimesRecognized: {
    type: Number,
    default: 1,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  createByUser: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  createOnList: {
    type: Schema.Types.ObjectId,
    ref: "shopping.list",
  },
  addedToItems: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("unrecognized.item", unrecognizedItemSchema);