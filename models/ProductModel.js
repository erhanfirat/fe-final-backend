const knex = require("../db/config");

const getAllProducts = (pagesize, offset) =>
  knex("products").select("*").limit(pagesize).offset(offset);

const getAllProductsByCategoryId = (categoryId, pagesize, offset) =>
  knex("products")
    .select("*")
    .where("category_id", categoryId)
    .limit(pagesize)
    .offset(offset);

const createProduct = (product) => {
  return knex.transaction(
    async (trx) => await trx("products").insert(product).returning("*")
  );
};

module.exports = {
  getAllProducts,
  createProduct,
};
