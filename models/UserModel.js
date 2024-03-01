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

// ADDRESS METHODS

// address = {
//   id,
//   user_id,
//   ...
// }

const saveAddress = (addressData) => {
  return knex.transaction(
    async (trx) => await trx("address").insert(addressData).returning("*")
  );
};

const updateAddress = (addressData) => {
  return knex.transaction(
    async (trx) =>
      await trx("address")
        .where({ id: addressData.id })
        .update(addressData)
        .returning("*")
  );
};

const getAddressOfUser = async (userId) => {
  return await knex("address").select("*").where("user_id", userId);
};

const getAddressById = async (addressId) => {
  return await knex("address").select("*").where("id", addressId);
};

const deleteAddress = async (addressId) => {
  return await knex("address").where("id", addressId).del();
};

// CARD METHODS

// card = {
//   id,
//   user_id,
//   card_no,
//   expire_month,
//   expire_year,
//   name_on_card
// }

const saveCard = (cardData) => {
  return knex.transaction(
    async (trx) => await trx("credit_card").insert(cardData).returning("*")
  );
};

const updateCard = (cardData) => {
  return knex.transaction(
    async (trx) =>
      await trx("credit_card")
        .where({ id: cardData.id })
        .update(cardData)
        .returning("*")
  );
};

const getCardOfUser = async (userId) => {
  return await knex("credit_card").select("*").where("user_id", userId);
};

// ORDER

const saveOrder = async (orderData) => {
  const { products, ...orderToSave } = orderData;

  const order = (await knex("order").insert(orderToSave).returning("*"))[0];

  console.log("order saved!", order);

  const orderProductsToSave = await products.map((p) => ({
    ...p,
    order_id: order.id,
  }));

  console.log("orderProductsToSave > ", orderProductsToSave);

  const orderProducts = await knex("order_products").insert(
    orderProductsToSave
  );

  return { ...order, products: orderProducts };
};

const getOrdersOfUser = async (userId) => {
  return await knex("order").select("*").where("user_id", userId);
};

module.exports = {
  getUserById,
  getUserByEmail,
  createWithActivation,
  findByActivationToken,
  activateUser,
  getAddressById,
  getAddressOfUser,
  saveAddress,
  updateAddress,
  deleteAddress,
  saveCard,
  updateCard,
  getCardOfUser,
  saveOrder,
  getOrdersOfUser,
};
