const express = require('express');
const {login , authenticate , generateTokenWithPayload} = require('../controller/redis.controller.js')
const redisRouter = express.Router();
const redis = require('redis');

redisRouter.post('/login',login);
redisRouter.get('/generate',generateTokenWithPayload);
redisRouter.post('/profile',authenticate,(rq,res)=>{
    res.status(200).json({message : "Protected profile is accessible"});
});

module.exports = redisRouter;