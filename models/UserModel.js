const knex = require("../db/config");
const Utils = require("../utils/utils");

const getUserById = (userId) =>
  knex("users").select("*").where("id", userId).first();

const createWithActivation = async (userData) => {
  const activationToken = Utils.generateActivationToken(); // You'll need to implement this function
  userData.activation_token = activationToken;

  return await knex("users").insert(userData);
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
