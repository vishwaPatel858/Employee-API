const express = require("express");
const {login , authenticate , generateTokenWithPayload , logout} = require('../controller/redis.controller.js')
const { loginEmployee , getNewAccessToken  , logoutAndDeleteToken} = require("../controller/refreshToken.controller.js");
const redisRouter = express.Router();
const refreshTokenRouter = express.Router();

redisRouter.post("/login", login);
redisRouter.post("/generate", generateTokenWithPayload);
redisRouter.post("/profile", authenticate, (rq, res) => {
  res.status(200).json({ message: "Protected profile is accessible" });
});
redisRouter.get("/logout/:id", logout);

refreshTokenRouter.post("/login", loginEmployee);
refreshTokenRouter.post("/accesstoken", getNewAccessToken);
//refreshTokenRouter.post("/refreshtoken", getNewRefreshToken);
refreshTokenRouter.post("/logout", logoutAndDeleteToken);

module.exports = { redisRouter, refreshTokenRouter };
