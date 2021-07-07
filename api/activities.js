const express = require("express");
const activitiesRouter = express.Router();
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getPublicRoutinesByActivity,
} = require("../db");
const { requireUser } = require("./utils");

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  const newActivity = {};
  try {
    (newActivity.name = name), (newActivity.description = description);
    const theNewActivity = await createActivity(newActivity);
    res.send(theNewActivity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const id = req.params.activityId;
  const { name, description } = req.body;
  try {
    const newActivity = await updateActivity({ id, name, description });
    res.send(newActivity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  try {
    const { activityId } = req.params;
    console.log("/:activityId/routines", activityId);
    const selectPublicRouties = await getPublicRoutinesByActivity(activityId);
    res.send(selectPublicRouties);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = activitiesRouter;
