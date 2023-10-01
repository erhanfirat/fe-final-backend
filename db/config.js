const knex = require("knex");

module.exports = knex({
  client: "sqlite3",
  connection: {
    filename: "./src/db/db.sqlite3",
  },
  useNullAsDefault: true,
});
