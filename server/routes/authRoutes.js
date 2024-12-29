const express = require("express");
const {
  register,
  login,
  logout,
  google,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", google);

module.exports = router;
