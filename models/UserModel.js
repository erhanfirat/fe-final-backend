const knex = require("../db/config");
const Utils = require("../utils/utils");

const getUserById = (userId) =>
  knex("users").select("*").where("id", userId).first();

const getUserByEmail = (email) =>
  knex("users").select("*").where("email", email).first();

const createWithActivation = (userData) => {
  userData.activation_token = Utils.generateActivationToken();

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
    .update({ activation_token: null });
};

const saveAddress = (addressData) => {
  return knex.transaction(
    async (trx) => await trx("address").insert(addressData).returning("*")
  );
};

const getAddressOfUser = async (userId) => {
  return await knex("address").select("*").where("user_id", userId);
};

module.exports = {
  getUserById,
  getUserByEmail,
  createWithActivation,
  findByActivationToken,
  activateUser,
  saveAddress,
  getAddressOfUser,
};
