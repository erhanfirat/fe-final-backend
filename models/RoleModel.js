const knex = require("../db/config");

/**
 * USER REC = {
 *  id
 *  name
 *  email
 *  password
 *  role_id
 *  activation_token
 * }
 */

const getAllRoles = () => knex("roles").select("*");

module.exports = {
  getAllRoles,
};
