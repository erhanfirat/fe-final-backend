const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Models
const Roles = require("./models/RoleModel.js");
const Users = require("./models/UserModel.js");
const Categories = require("./models/CategoryModel.js");
const Stores = require("./models/StoreModel.js");
const Products = require("./models/ProductModel.js");
const Utils = require("./utils/utils.js");
const {
  convertProductData,
  kadinTisortList,
  kadinAyakkabiList,
  kadinElbiseList,
  kadinCeketList,
} = require("./db/sample-data.js");
const { charactersData, filmsData } = require("./db/characters.js");

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;
const CATEGORY_IMG_PREFIX = `${process.env.SERVER_URL}/assets/category-img/`;

// Test Endpoints ****************************************

app.use((req, res, next) => {
  // Set the Access-Control-Expose-Headers header to expose additional headers to the client
  res.header("Access-Control-Expose-Headers", "Content-Disposition");

  // Allow cross-origin requests (CORS)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Content-Disposition, Accept"
  );

  next();
});

// APP STARTS ON 3001

// USERS **************************************************

app.get("/roles", async (req, res) => {
  try {
    const roles = await Roles.getAllRoles();
    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { store, ...userData } = req.body;
    const newUser = (await Users.createWithActivation(userData))[0];

    if (userData.role_id === 2 && store) {
      // eğer kullanıcı store olarak seçildiyse
      store.user_id = newUser.id;
      Stores.createStore(store);
    }

    Utils.sendActivationEmail(newUser.email, newUser.activation_token);

    res.status(201).json({
      message: "User created. Check your email for activation instructions.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.get("/activate", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Activation token is missing." });
  }

  const user = await Users.findByActivationToken(token);

  if (!user) {
    return res.status(404).json({ error: "Invalid activation token." });
  }

  // Update the user's account status (e.g., set 'isActive' to true)
  await Users.activateUser(user.id);

  res
    .status(200)
    .json({ message: `${user.email} account activated successfully.` });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.getUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ message: `There is no any account using the email: ${email}` });
    }
    if (user.activation_token) {
      return res.status(401).json({
        message: ` ${email} account is not activated. Please check you inbox and junk folder to activate your account.`,
      });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: "Password is not correct!" });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "19d",
    });

    const { name, role_id } = user;

    res.status(200).json({ token, name, email, role_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

// Verify route
app.get("/verify", async (req, res) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Not verified" });
    }

    // Token is valid; you can access the user ID from `decoded.userId`
    const user = await Users.getUserById(decoded.userId);

    const newToken = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "19d",
    });

    const { name, email, role_id } = user;
    res.status(200).json({ name, email, role_id, token: newToken });
  });
});

// ADDRESS ENDPOINTS

app.post("/user/address", async (req, res) => {
  try {
    const addressData = req.body;
    const token = req.header("Authorization");

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not verified" });
      }

      // Token is valid; you can access the user ID from `decoded.userId`
      const user = await Users.getUserById(decoded.userId);
      addressData.user_id = user.id;

      const { user_id, ...address } = await Users.saveAddress(addressData);

      res.status(201).json(address);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.put("/user/address", async (req, res) => {
  try {
    const addressData = req.body;
    const token = req.header("Authorization");

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not verified" });
      }

      // Token is valid; you can access the user ID from `decoded.userId`
      const user = await Users.getUserById(decoded.userId);
      addressData.user_id = user.id;

      const { user_id, ...address } = await Users.updateAddress(addressData);

      res.status(201).json(address);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.get("/user/address", async (req, res) => {
  try {
    const token = req.header("Authorization");

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not verified" });
      }

      // Token is valid; you can access the user ID from `decoded.userId`
      const user = await Users.getUserById(decoded.userId);

      const addressList = await Users.getAddressOfUser(user.id);

      res.status(201).json(addressList);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

// CARD ENDPOINTS

app.post("/user/card", async (req, res) => {
  try {
    const cardData = req.body;
    const token = req.header("Authorization");

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not verified" });
      }

      // Token is valid; you can access the user ID from `decoded.userId`
      const user = await Users.getUserById(decoded.userId);
      cardData.user_id = user.id;

      const { user_id, ...card } = await Users.saveCard(cardData);

      res.status(201).json(card);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.put("/user/card", async (req, res) => {
  try {
    const cardData = req.body;
    const token = req.header("Authorization");

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not verified" });
      }

      // Token is valid; you can access the user ID from `decoded.userId`
      const user = await Users.getUserById(decoded.userId);
      cardData.user_id = user.id;

      const { user_id, ...card } = await Users.updateCard(cardData);

      res.status(201).json(card);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.get("/user/card", async (req, res) => {
  try {
    const token = req.header("Authorization");

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not verified" });
      }

      // Token is valid; you can access the user ID from `decoded.userId`
      const user = await Users.getUserById(decoded.userId);

      const cardList = await Users.getCardOfUser(user.id);

      res.status(201).json(cardList);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

// PRODUCTS **************************************************

app.get("/categories", async (req, res) => {
  try {
    const categories = await Categories.getAllCategories();
    categories.forEach((category) => {
      category.img = CATEGORY_IMG_PREFIX + category.img;
    });

    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.get("/assets/category-img/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "assets/category-img", imageName);

    // Check if the file exists
    if (fs.existsSync(imagePath)) {
      // Use res.sendFile to serve the image
      res.sendFile(imagePath);
    } else {
      res.status(404).send("Image not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.get("/products", async (req, res) => {
  try {
    const { category, sort, filter, limit, offset } = req.query;

    // Execute the query
    const products = await Products.getProducts(
      category,
      sort,
      filter,
      limit,
      offset
    );

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Execute the query
    const product = await Products.getProductById(productId);

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/characters", async (req, res) => {
  try {
    res.json(charactersData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/films", async (req, res) => {
  try {
    res.json(filmsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("working on 3001");
});

const productList = [
  // ...convertProductData(kadinTisortList, 1),
  // ...convertProductData(kadinAyakkabiList, 2),
  // ...convertProductData(kadinCeketList, 3),
  // ...convertProductData(kadinElbiseList, 4),
  // !ADDED
];

// productList.forEach((p) => Products.createProduct(p));

// Products.assignProductIdToImages();
