const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  shoppingLists: [
    {
      type: Schema.Types.ObjectId,
      ref: "shopping.list",
    },
  ],
  recipes: [
    {
      type: Schema.Types.ObjectId,
      ref: "recipe",
    },
  ],
  default_shopping_list: {
    type: Schema.Types.ObjectId,
    ref: "shopping.list",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  DateUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("user", userSchema);