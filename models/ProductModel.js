const knex = require("../db/config");

const getAllProducts = (pagesize, offset) =>
  knex("products").select("*").limit(pagesize).offset(offset);

const getAllProductsByCategoryId = (categoryId, pagesize, offset) =>
  knex("products")
    .select("*")
    .where("category_id", categoryId)
    .limit(pagesize)
    .offset(offset);

const createProduct = async (product) => {
  const { images, ...newProduct } = product;
  const record = await knex("products").insert(newProduct);

  const imageList = images.map((image, index) => ({
    url: image,
    product_id: record.id,
    index,
  }));

  await knex("product_images").insert(imageList);

  return record;
};

module.exports = {
  getAllProducts,
  createProduct,
};
