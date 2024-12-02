const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "message",
      "notification",
      "reminder",
      "invitation",
      "alert",
      "warning",
      "error",
      "success",
      "info",
      "confirmation",
      "question",
      "answer",
      "request",
      "response",
      "feedback",
      "review",
      "comment",
      "complaint",
      "suggestion",
      "compliment",
      "report",
      "announcement",
      "update",
      "news",
      "promotion",
      "advertisement",
    ],
    default: "message",
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  hasReaded: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateReaded: {
    type: Date,
    default: null,
  },
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  attachments: {
    type: [String],
    default: [],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
});

module.exports = model("message", messageSchema);
