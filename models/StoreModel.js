const knex = require("../db/config");
/**
 * STORE REC = {
 *  id
 *  user_id
 *  name
 *  tax_no
 *  bank_account
 * }
 */

const createStore = (storeDate) =>
  knex.transaction(
    async (trx) => await trx("stores").insert(storeDate).returning("*")
  );

module.exports = {
  createStore,
};
