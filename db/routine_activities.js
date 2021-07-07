const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
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
    const {
      rows: [activity],
    } = await client.query(
      `
      UPDATE routine_activities
      SET count=$2, duration=$3
      WHERE id=$1
      RETURNING *;
    `,
      [id, count, duration]
    );

    return activity;
  } catch (err) {
    throw err;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
    DELETE
    FROM routine_activities
    WHERE id=$1
    RETURNING *;
    `,
      [id]
    );

    return activity;
  } catch (error) {
    throw error;
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
