const { Schema, model } = require("mongoose");

const departmentSchema = new Schema({
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
  dateCreated: {
    type: Date,
    default: Date.now,
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

module.exports = model("department", departmentSchema);