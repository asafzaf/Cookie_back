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

const itemsJson = require("./items.json");
const departmentsJson = require("./departments.json");

const Item = require("../models/item.model");
const User = require("../models/user.model");
const ShoppingList = require("../models/shoppingList.model");
const Department = require("../models/department.model");

async function initUsers() {
  try {
    await User.deleteMany({});
    console.log("Users removed successfully");
  } catch (error) {
    console.error("Error removing users:", error);
  }
}

async function initItems() {
  try {
    await Item.deleteMany({});
    const departments = await Department.find();
    itemsJson.items.forEach((item) => {
      item.department =
        departments.find((department) => department.name.en === item.department)
          ?._id || null;
    });
    await Item.insertMany(itemsJson.items);
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

async function initDepartments() {
  try {
    await Department.deleteMany({});
    await Department.insertMany(departmentsJson.departments);
    console.log("Departments added successfully");
  } catch (error) {
    console.error("Error adding departments:", error);
  }
}
let main = async () => {
  await initUsers();
  await initDepartments();
  await initItems();
  await initShoppingList();
};

main().then(() => {
  mongoose.connection.close();
  console.log("Connection closed");
});
