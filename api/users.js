const express = require("express");
const bcrypt = require("bcrypt");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const SALT_COUNT = 10;

const {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
} = require("../db/users.js");
const { response } = require("express");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const dupUsers = getUserByUsername(username);

    if (dupUsers) {
      const message = "User already Exists";

      next({ message: message });
    } else if (password.length < 8) {
      const message = "Password is too short, must be 8 or greater";
      next({ message: message });
    } else {
      const user = createUser({ username, password });
      console.log("USER ****", user);
      if (!user) {
        next({ message: "Error creating user" });
      } else {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "1w" }
        );
        res.send({ user, message: "You Have Created the User", token });
      }
    }
  } catch (err) {
    throw err;
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign({ id: user.id, username: username }, JWT_SECRET, {
        expiresIn: "1w",
      });

      res.send({ message: "you're logged in!", token: token });
    } else {
      const message = "Username or password is incorrect";

      return message;
    }
  } catch (err) {
    throw err;
  }
});

module.exports = usersRouter;
