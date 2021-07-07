const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const SALT_COUNT = 10;

const {
  createUser,
  getUser,
  getPublicRoutinesByUser,
  getUserByUsername,
} = require("../db");

const { requireUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password",
      });
      return;
    }

    const dupUsers = await getUserByUsername(username);

    if (dupUsers) {
      res.status(401);
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    } else if (password.length < 8) {
      next({
        name: "PasswordLengthError",
        message: "Password should be atleast 8 characters",
      });
    } else {
      const user = await createUser({ username, password });
      if (!user) {
        next({ name: "UserCreationError", message: "Unable to create user" });
      } else {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "1w" }
        );
        res.send({ user, message: "You Have Created the User", token });
      }
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }
  try {
    const user = await getUser({ username, password });

    const hashedPassword = user.password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (user && passwordMatch) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET
      );

      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  try {
    const username = req.params.username;
    const routines = await getPublicRoutinesByUser({ username });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
