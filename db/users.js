const client = require("./client");
const bcrypt = require("bcrypt");
const SALT_COUNT = 10;

async function createUser({ username, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password)
        VALUES($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING id, username;
    `,
      [username, hashedPassword]
    );

    return user;
  } catch (err) {
    throw err;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return;
    }
    const hashedPassword = user.password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return;
    }

    delete user.password;

    return user;
  } catch (err) {
    throw err;
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
            SELECT *
            FROM users
            WHERE id=$1;
        `,
      [id]
    );

    delete user.password;

    return user;
  } catch (err) {
    throw err;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows } = await client.query(
      `
            SELECT *
            FROM users
            WHERE username=$1;
        `,
      [username]
    );
    if (!rows.length) {
      return null;
    }

    const [user] = rows;

    return user;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
