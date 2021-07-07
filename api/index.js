// create an api router
const express = require("express");
const apiRouter = express.Router();
const { JWT_SECRET } = process.env;
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const client = require("../db/client");

const usersRouter = require("./users");
const activitiesRouter = require("./activities");
const routinesRouter = require("./routines");
const routineActivitiesRouter = require("./routine_activities");

apiRouter.get("/health", async (req, res, next) => {
  try {
    const uptime = process.uptime();
    const {
      rows: [dbConnection],
    } = await client.query("SELECT NOW();");
    const currentTime = new Date();
    const lastRestart = new Intl.DateTimeFormat("en", {
      timeStyle: "long",
      dateStyle: "long",
      timeZone: "America/Los_Angeles",
    }).format(currentTime - uptime * 1000);
    res.send({
      message: "healthy",
      uptime,
      dbConnection,
      currentTime,
      lastRestart,
    });
  } catch (err) {
    next(err);
  }
});

apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    const parsedToken = jwt.verify(token, JWT_SECRET);
    const id = parsedToken && parsedToken.id;

    try {
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch (error) {
      next(error);
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/activities", activitiesRouter);
apiRouter.use("/routines", routinesRouter);
apiRouter.use("/routine_activities", routineActivitiesRouter);

apiRouter.use((error, req, res, next) => {
  res.send(error);
});

module.exports = apiRouter;
