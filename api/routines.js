const express = require("express");
const routinesRouter = express.Router();
const {
  getRoutineById,
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
} = require("../db");
const { requireUser } = require("./utils");

routinesRouter.get("/", async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const newRoutineData = {};
  try {
    newRoutineData.creatorId = req.user.id;
    newRoutineData.name = name;
    newRoutineData.goal = goal;
    newRoutineData.isPublic = isPublic;
    const routine = await createRoutine(newRoutineData);
    res.send(routine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  try {
    const { ...fields } = req.body;
    const id = req.params.routineId;

    const routineToUpdate = await getRoutineById(id);

    if (!routineToUpdate) {
      next({ name: "wrong routine" });
    } else {
      if (req.user.id !== routineToUpdate.creatorId) {
        next({ name: "must be user" });
      } else {
        const newRoutine = await updateRoutine({ id, ...fields });

        if (newRoutine) {
          res.send(newRoutine);
        } else {
          next({ name: "routine doesn't exist" });
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

routinesRouter.delete("/:routineId", async (req, res, next) => {
  const routineId = req.params.routineId;
  try {
    const deleteRoutine = await destroyRoutine(routineId);
    res.send(deleteRoutine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post(
  "/:routineId/activities",
  requireUser,
  async (req, res, next) => {
    const { activityId, count, duration } = req.body;
    const ActivityForRoutine = {};
    try {
      ActivityForRoutine.routineId = req.params.routineId;
      ActivityForRoutine.activityId = activityId;
      ActivityForRoutine.count = count;
      ActivityForRoutine.duration = duration;

      const addSingleActivity = await addActivityToRoutine(ActivityForRoutine);

      res.send(addSingleActivity);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = routinesRouter;
