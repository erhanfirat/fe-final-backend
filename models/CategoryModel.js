const knex = require("../db/config");

const getAllCategories = () => knex("categories").select("*");

const createCategory = (category) => {
  return knex.transaction(
    async (trx) => await trx("categories").insert(category).returning("*")
  );
};

const updateCategory = (category) => {
  return knex.transaction(
    async (trx) => await trx("categories").update(category).returning("*")
  );
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
};
