const knex = require("../db/config");
const Utils = require("../utils/utils");

const getUserById = (userId) =>
  knex("users").select("*").where("id", userId).first();

const createWithActivation = (userData) => {
  userData.activation_token = Utils.generateActivationToken();

  console.log("user to create > ", userData);

  return knex.transaction(
    async (trx) => await trx("users").insert(userData).returning("*")
  );
};

const findByActivationToken = async (activation_token) => {
  return await knex("users").where({ activation_token }).first();
};

const activateUser = async (userId) => {
  return await knex("users")
    .where({ id: userId })
    .update({ activationToken: null });
};

module.exports = {
  getUserById,
  createWithActivation,
  findByActivationToken,
  activateUser,
};
