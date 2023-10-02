const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
// Models
const Roles = require("./models/RoleModel.js");
const Users = require("./models/UserModel.js");
const Utils = require("./utils/utils.js");

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(express.json());

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
    const userData = req.body;
    const newUser = await Users.createWithActivation(userData);

    Utils.sendActivationEmail(newUser.email, newUser.activationToken);

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
    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

// PRODUCTS **************************************************

app.get("/products", async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.listen(3001, () => {
  console.log("working on 3001");
});
