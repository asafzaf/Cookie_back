const { Schema, model } = require("mongoose");

const shoppingListSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  pendingUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
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
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  DateUpdated: {
    type: Date,
    default: Date.now,
  },
  lastBuy: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("shopping.list", shoppingListSchema);
