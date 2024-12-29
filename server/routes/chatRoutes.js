const express = require("express");
const { createChat } = require("../controllers/chatController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-chat", authenticate, createChat);

router.post("/get-suggestions", authenticate, createChat);

module.exports = router;
