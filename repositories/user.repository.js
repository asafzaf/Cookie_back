const MongoDB = require("../db/mongo.db");
const db = new MongoDB("user");

module.exports = {
  find() {
    return db.find();
  },

  retrieve(id) {
    return db.findOne(id);
  },

  findByMail(mail) {
    return db.findOne(mail);
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