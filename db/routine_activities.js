const express = require("express");
const client = require("./client");
const bcrypt = require("bcrypt");
const routineActivitiesRouter = express.Router();

async function getRoutineActivityById(id) {
  try {
    const routineActivity = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE id=$1;
    `,
      [id]
    );

    return routineActivity;
  } catch (err) {
    throw err;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES($1, $2, $3, $4)
      RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );
    return activity;
  } catch (err) {
    throw err;
  }
}

async function updateRoutineActivity({ id, count, duration }) {
  try {
    const activity = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE id=$1;
    `,
      [id]
    );

    const countField = count || activity.count;
    const durationField = duration || activity.duration;

    const {
      rows: [updatedActivity],
    } = await client.query(
      `
      UPDATE routine_activities
      SET count=$2, duration=$3
      WHERE id=$1
      RETURNING *;
    `,
      [id, countField, durationField]
    );

    console.log("UPDATED ACTIVITY", updatedActivity);

    return updatedActivity;
  } catch (err) {
    throw err;
  }
}

async function destroyRoutineActivity(id) {
  try {
    await client.query(
      `
      DELETE FROM routine_activities
      WHERE id=$1;
    `,
      [id]
    );

    return `"Routine ${routineActivity.name} Deleted"`;
  } catch (err) {
    throw err;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: activities } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE "routineId"=$1;
    `,
      [id]
    );

    return activities;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivitiesByRoutine,
};
