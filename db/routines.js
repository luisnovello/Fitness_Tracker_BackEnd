const client = require("./client");
const bcrypt = require("bcrypt");
const { attachActivitiesToRoutines } = require("./activities");

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
            SELECT *
            FROM routines
            WHERE id=$1;
        `,
      [id]
    );

    return routine;
  } catch (err) {
    throw err;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
            SELECT *
            FROM routines;
        `);

    return rows;
  } catch (err) {
    throw err;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    `);
    return attachActivitiesToRoutines(routine);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routine } = await client.query(`
                SELECT routines.*, users.username AS "creatorName"
                FROM routines
                JOIN users ON routines."creatorId" = users.id
                WHERE "isPublic" = true;
            `);

    return attachActivitiesToRoutines(routine);
  } catch (err) {
    throw err;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routine } = await client.query(
      `
                SELECT routines.*, users.username AS "creatorName"
                FROM routines
                JOIN users ON routines."creatorId" = users.id
                WHERE users.username=$1;
            `,
      [username]
    );

    return attachActivitiesToRoutines(routine);
  } catch (err) {
    throw err;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routine } = await client.query(
      `
                SELECT routines.*, users.username AS "creatorName"
                FROM routines
                JOIN users ON routines."creatorId" = users.id
                WHERE users.username=$1 
                AND "isPublic"=true;
            `,
      [username]
    );

    return attachActivitiesToRoutines(routine);
  } catch (err) {
    throw err;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId" = users.id
        JOIN routine_activities ON routine_activities."routineId" = routines.id
        WHERE "isPublic"=true 
        AND routine_activities."activityId"=$1;
       `,
      [id]
    );

    return attachActivitiesToRoutines(routines);
  } catch (err) {
    throw err;
  }
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        INSERT INTO routines("creatorId", "isPublic", name, goal)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `,
      [creatorId, isPublic, name, goal]
    );

    return routine;
  } catch (err) {
    throw err;
  }
}

async function updateRoutine({ id, isPublic, name, goal }) {
  try {
    const routine = await getRoutineById(id);

    const isPublicField = isPublic || routine.isPublic;
    const nameField = name || routine.name;
    const goalField = goal || routine.goal;

    const {
      rows: [updatedRoutine],
    } = await client.query(
      `
            UPDATE routines
            SET "isPublic"=$1, name=$2, goal=$3
            WHERE id=$4
            RETURNING *;
        `,
      [isPublicField, nameField, goalField, id]
    );

    return updatedRoutine;
  } catch (err) {
    throw err;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(
      `
        DELETE FROM routines
        WHERE id=$1
    `,
      [id]
    );

    await client.query(
      `
            DELETE FROM routine_activities
            WHERE "routineId"=$1;
        `,
      [id]
    );
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
