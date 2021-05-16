// create an api router
const express = require("express");
const apiRouter = express.Router();
// attach other routers from files in this api directory (users, activities...)
const usersRouter = require("./users");
const client = require("../db/client");
// const activitiesRouter = require("./activites");
// const routinesRouter = require("./routines");
// const routineActivitesRouter = require("./routine_activities");

// apiRouter.get("/health", (req, res, next) => {
//   console.log("Router is Healthy");
// });

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
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
  console.log("inside user is set");
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

apiRouter.use("/users", usersRouter);
// apiRouter.use("/activites", activitiesRouter);
// apiRouter.use("/routines", routinesRouter);
// apiRouter.use("/routine_", routineActivitesRouter);

// apiRouter.use((error, req, res, next) => {
//   res.send(error);
// });

// export the api router
module.exports = apiRouter;
