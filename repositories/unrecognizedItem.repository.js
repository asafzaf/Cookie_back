const MongoDB = require("../db/mongo.db");
const db = new MongoDB("unrecognizedItem");

module.exports = {
  find() {
    return db.find();
  },

  retrieve(id) {
    return db.findOne(id);
  },

  create(data) {
    return db.create(data);
  },

  put(id, data) {
    return db.put(id, data);
  },

  delete(id) {
    return db.delete(id);
  },
};