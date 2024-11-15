const { Schema, model } = require("mongoose");

const shoppingHistoryItem = new Schema({
  listId: {
    type: Schema.Types.ObjectId,
    ref: "shopping.list",
  },
  byUser: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      item: {
        type: Schema.Types.ObjectId,
        ref: "item",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  unrecognizedItems: [
    {
      item: {
        type: Schema.Types.ObjectId,
        ref: "unrecognized.item",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
  },
});

module.exports = model("shopping.history.item", shoppingHistoryItem);
