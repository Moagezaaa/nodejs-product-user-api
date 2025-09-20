const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("../product.db", (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to SQLite database");
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.error("Failed to enable foreign keys", err);
      } else {
        console.log("✅ Foreign keys enabled");
      }
    });
    // db.run('drop table if exists user_products');
    // db.run('drop table if exists products');
    // db.run('drop table if exists users');




    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL ,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      token TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      amount INTEGER NOT NULL
    )`);
    

    db.run(`CREATE TABLE IF NOT EXISTS user_products (
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`);
  }
});

module.exports = db;
