const mongoose = require("mongoose");
const {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
  NODE_ENV,
} = require("../constants");

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const json = require("./items.json");

const Item = require("../models/item.model");
const ShoppingList = require("../models/shoppingList.model");

async function initItems() {
  try {
    await Item.deleteMany({});
    await Item.insertMany(json.items);
    console.log("Items added successfully");
  } catch (error) {
    console.error("Error adding items:", error);
  }
}

async function initShoppingList() {
    try {
        await ShoppingList.deleteMany({});
        console.log("Shopping lists removed successfully");
    } catch (error) {
        console.error("Error adding shopping lists:", error);
    }
    }

initItems();

initShoppingList();
