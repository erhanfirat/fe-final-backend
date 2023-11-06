const knex = require("../db/config");
const { PAGE_LIMIT } = require("../utils/contants");

const getAllProducts = (pagesize, offset) =>
  knex("products").select("*").limit(pagesize).offset(offset);

const getProducts = async (category, sort, filterText, limit, offset) => {
  // Build the initial query to select from the 'products' table
  const query = knex("products").select("*");

  // Apply filters and sorting based on query parameters
  if (category) {
    query.where("category_id", category);
  }

  if (filterText) {
    // Check for a match in both the "name" and "description" fields
    query.where(function () {
      this.where("name", "like", `%${filterText}%`).orWhere(
        "description",
        "like",
        `%${filterText}%`
      );
    });
  }

  if (sort) {
    const [column, order] = sort.split(":");
    query.orderBy(column, order);
  }

  // Clone the query to count the total number of products
  const countQuery = query.clone();

  // Count the total number of products without limit and offset
  const { total } = await countQuery.count("id as total").first();

  // Apply limit and offset to the original query
  if (limit) {
    query.limit(parseInt(limit, 10));
  } else {
    query.limit(PAGE_LIMIT);
  }

  if (offset) {
    query.offset(parseInt(offset, 10));
  }

  // Execute the query to get the filtered products
  const products = await query;

  // Fetch and associate product images
  for (const product of products) {
    const images = await knex("product_images")
      .select("url", "index")
      .where("product_id", product.id);
    product.images = images;
  }

  return { products, total };
};

const getAllProductsByCategoryId = (categoryId, pagesize, offset) =>
  knex("products")
    .select("*")
    .where("category_id", categoryId)
    .limit(pagesize)
    .offset(offset);

const createProduct = async (product) => {
  const { images, ...newProduct } = product;
  const createdProductList = await knex("products")
    .insert(newProduct)
    .returning("*");

  console.log("createdProductList > ", createdProductList);

  const imageList = images.map((image, index) => ({
    url: image,
    product_id: createdProductList[0].id,
    index,
  }));

  await knex("product_images").insert(imageList);

  return createdProductList[0];
};

// const assignProductIdToImages = async () => {
//   const productImageList = await knex("product_images").select("*");
//   console.log("productImageList > ", productImageList.length);
//   let productId = 15;
//   for (let productImage of productImageList) {
//     if (!productImage.product_id) {
//       productImage.product_id = productId++;
//       productImage &&
//         (await knex("product_images")
//           .where({ id: productImage.id })
//           .update(productImage));
//     }
//   }
// };

module.exports = {
  getProducts,
  getAllProducts,
  createProduct,
  // assignProductIdToImages,
};
