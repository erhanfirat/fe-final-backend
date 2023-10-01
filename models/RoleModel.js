const knex = require("../db/config");

const getAllRoles = () => knex("roles").select("*");

module.exports = {
  getAllRoles,
};
