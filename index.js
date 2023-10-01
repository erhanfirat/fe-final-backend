const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
// Models
const Roles = require("./models/RoleModel.js");

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

app.get("/roles", async (req, res) => {
  try {
    const roles = await Roles.getAllRoles();
    res.status(200).json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred", err });
  }
});

app.listen(3001, () => {
  console.log("working on 3001");
});
