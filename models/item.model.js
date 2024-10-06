const { Schema, model } = require("mongoose");

const itemSchema = new Schema({
  name: {
    heb: {
      type: String,
      required: true,
    },
    en: {
      type: String,
      required: true,
    },
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "department",
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
          v
        );
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
});

module.exports = model("item", itemSchema);
