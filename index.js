// dotenv loads parameters (port and database config) from .env
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./db");
const { check, validationResult } = require("express-validator");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// respond to requests on `/api/users`
app.get("/api/users", (req, res) => {
  // send an SQL query to get all users
  connection.query("SELECT * FROM user", (err, results) => {
    if (err) {
      // If an error has occurred, then the client is informed of the error
      res.status(500).json({
        error: err.message,
        sql: err.sql,
      });
    } else {
      // If everything went well, we send the result of the SQL query as JSON
      res.json(results);
    }
  });
});

app.post(
  "/api/users",
  [
    check("email").isEmail(),
    check("password").isLength({ min: 8 }),
    check("name").isLength({ min: 2 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return connection.query(
      "INSERT INTO user SET ?",
      req.body,
      (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message,
            sql: err.sql,
          });
        }
        return res.json(results);
      }
    );
  }
);

app.listen(process.env.PORT, (err) => {
  if (err) {
    throw new Error("Something bad happened...");
  }

  console.log(`Server is listening on ${process.env.PORT}`);
});
